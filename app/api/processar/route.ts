import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { getSupabaseClient } from "@/utils/supabase";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// MIME types e extensões permitidas
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".txt", ".png", ".jpg", ".jpeg"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    if (!apiKey || !ai) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const clienteId = formData.get("clienteId") as string | null;
    const file = formData.get("file") as File | null;

    // Validation 1: clienteId e arquivo obrigatórios
    if (!clienteId || !clienteId.trim()) {
      return NextResponse.json(
        { error: "O ID do cliente é obrigatório." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "O arquivo é obrigatório." },
        { status: 400 }
      );
    }

    const safeClienteId = clienteId.trim().replace(/[^a-zA-Z0-9-_]/g, "");
    if (!safeClienteId) {
      return NextResponse.json(
        { error: "ID do cliente inválido. Use apenas letras, números, hífen ou underline." },
        { status: 400 }
      );
    }

    if (safeClienteId.length > 100) {
      return NextResponse.json(
        { error: "ID do cliente excede o tamanho máximo de 100 caracteres." },
        { status: 400 }
      );
    }

    // Validation 2: Tamanho máximo de 10 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "O arquivo excede o limite máximo permitido de 10 MB." },
        { status: 400 }
      );
    }

    // Validation 3: Tipo de arquivo (MIME type e Extensão)
    const ext = path.extname(file.name).toLowerCase();
    let mimeType = file.type;

    if (!mimeType || mimeType === "application/octet-stream") {
      if (ext === ".pdf") mimeType = "application/pdf";
      else if (ext === ".png") mimeType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
      else if (ext === ".txt") mimeType = "text/plain";
    }

    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Formato de arquivo não suportado. Envie apenas PDF, TXT, PNG, JPG ou JPEG." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const prompt = `Analise o documento fornecido.
Classifique o documento em uma das seguintes categorias: "Contratos", "Financeiro", "Documentos Pessoais", "Comprovantes" ou "Nao-Classificado".
Gere um resumo do documento de EXATAMENTE 1 linha.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        prompt,
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            categoria: {
              type: "STRING",
              enum: [
                "Contratos",
                "Financeiro",
                "Documentos Pessoais",
                "Comprovantes",
                "Nao-Classificado",
              ],
            },
            resumo: {
              type: "STRING",
            },
          },
          required: ["categoria", "resumo"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Não foi possível obter resposta da IA.");
    }

    const result = JSON.parse(responseText) as {
      categoria: string;
      resumo: string;
    };

    const categoria = result.categoria || "Nao-Classificado";
    // Garantir que o resumo tenha apenas uma linha removendo quebras de linha
    const rawResumo = result.resumo || "Não foi possível gerar um resumo.";
    const resumo = rawResumo.replace(/[\r\n]+/g, " ").trim();

    // Tratamento de nomes armazenados (adiciona timestamp para evitar colisão no storage)
    const originalName = file.name;
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const nomeArmazenado = `${baseName}_${timestamp}${ext}`;

    // Caminho no bucket: clienteId/categoria/nomeDoArquivo
    const storagePath = `${safeClienteId}/${categoria}/${nomeArmazenado}`;

    const supabase = getSupabaseClient();

    // 1. Enviar arquivo para o Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("documentos")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (storageError) {
      console.error("Erro no envio para o Supabase Storage:", storageError);
      return NextResponse.json(
        { error: `Erro ao armazenar o arquivo: ${storageError.message}` },
        { status: 500 }
      );
    }

    // 2. Inserir registro na tabela 'documentos'
    const { data: dbData, error: dbError } = await supabase
      .from("documentos")
      .insert({
        cliente_id: safeClienteId,
        nome_original: originalName,
        nome_armazenado: nomeArmazenado,
        categoria: categoria,
        resumo: resumo,
        storage_path: storagePath,
      })
      .select()
      .single();

    // Tratamento de falha no banco: Remove o arquivo do Storage para evitar órfãos
    if (dbError) {
      console.error("Erro ao salvar registro no banco de dados, removendo arquivo do Storage...", dbError);
      await supabase.storage.from("documentos").remove([storagePath]);

      return NextResponse.json(
        { error: `Erro ao registrar documento no banco: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 3. Atualizar README.md no Supabase Storage
    let warningMsg: string | undefined = undefined;

    try {
      // Consulta todos os documentos do cliente ordenados do mais antigo ao mais recente para montar o histórico do README
      const { data: allDocs, error: fetchDocsError } = await supabase
        .from("documentos")
        .select("*")
        .eq("cliente_id", safeClienteId)
        .order("created_at", { ascending: true });

      if (fetchDocsError) {
        throw fetchDocsError;
      }

      const pad = (n: number) => String(n).padStart(2, "0");
      let readmeLines = [
        `# Histórico de Documentos - Cliente: ${safeClienteId}`,
        "",
        "| Data/Hora | Arquivo | Categoria | Resumo |",
        "| --- | --- | --- | --- |",
      ];

      (allDocs || []).forEach((doc) => {
        const d = new Date(doc.created_at);
        const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
          d.getDate()
        )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        const fileNameToShow = doc.nome_armazenado || doc.nome_original;
        readmeLines.push(
          `| ${formattedDate} | ${fileNameToShow} | ${doc.categoria} | ${doc.resumo} |`
        );
      });

      const readmeContent = readmeLines.join("\n") + "\n";
      const readmePath = `${safeClienteId}/README.md`;

      const { error: readmeError } = await supabase.storage
        .from("documentos")
        .upload(readmePath, Buffer.from(readmeContent, "utf-8"), {
          contentType: "text/markdown",
          upsert: true,
        });

      if (readmeError) {
        console.error("Aviso: Falha ao salvar README.md no Storage:", readmeError);
        warningMsg = "Documento registrado, porém o README.md não pôde ser atualizado.";
      }
    } catch (readmeErr: any) {
      console.error("Erro ao gerar/salvar README.md do cliente:", readmeErr);
      warningMsg = "Documento registrado, porém houve um erro ao reconstruir o README.md.";
    }

    return NextResponse.json({
      success: true,
      id: dbData?.id,
      nomeArquivo: originalName,
      nomeArmazenado,
      categoria,
      resumo,
      warning: warningMsg,
    });
  } catch (error: any) {
    console.error("Erro no processamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
