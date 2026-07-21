import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";

// Inicializa a API do Google Gemini se a chave estiver presente
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: Request) {
  try {
    if (!apiKey || !ai) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const clienteId = formData.get("clienteId") as string;
    const file = formData.get("file") as File;

    if (!clienteId || !file) {
      return NextResponse.json(
        { error: "clienteId e file são obrigatórios." },
        { status: 400 }
      );
    }

    // Sanitiza clienteId simples para evitar directory traversal
    const safeClienteId = clienteId.replace(/[^a-zA-Z0-9-_]/g, "");
    if (!safeClienteId) {
      return NextResponse.json(
        { error: "clienteId inválido." },
        { status: 400 }
      );
    }

    // Lê o conteúdo do arquivo em buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Envia o arquivo para a API do Gemini 1.5 Flash
    // Suporta PDF, Imagens (PNG, JPG) e TXT
    let base64Data = buffer.toString("base64");
    let mimeType = file.type;

    // Garante fallback de mimeType caso não venha no File
    if (!mimeType) {
      const ext = path.extname(file.name).toLowerCase();
      if (ext === ".pdf") mimeType = "application/pdf";
      else if (ext === ".png") mimeType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
      else if (ext === ".txt") mimeType = "text/plain";
      else mimeType = "application/octet-stream";
    }

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
    const resumo = result.resumo || "Não foi possível gerar um resumo.";

    // Define os caminhos das pastas de destino
    const storageDir = path.join(process.cwd(), "storage");
    const clientDir = path.join(storageDir, safeClienteId);
    const categoryDir = path.join(clientDir, categoria);

    // Garante a existência das pastas recursivamente
    await fs.mkdir(categoryDir, { recursive: true });

    // Trata duplicatas (se o arquivo já existir, adiciona timestamp)
    const originalName = file.name;
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext);
    let finalFileName = originalName;
    let targetFilePath = path.join(categoryDir, finalFileName);

    const fileExists = await fs
      .access(targetFilePath)
      .then(() => true)
      .catch(() => false);

    if (fileExists) {
      const timestamp = Date.now();
      finalFileName = `${base}_${timestamp}${ext}`;
      targetFilePath = path.join(categoryDir, finalFileName);
    }

    // Salva o arquivo no disco
    await fs.writeFile(targetFilePath, buffer);

    // Atualiza/Cria o arquivo README.md do cliente
    const readmePath = path.join(clientDir, "README.md");
    const readmeExists = await fs
      .access(readmePath)
      .then(() => true)
      .catch(() => false);

    if (!readmeExists) {
      const header = `# Histórico de Documentos - Cliente: ${safeClienteId}\n\n| Data/Hora | Arquivo | Categoria | Resumo |\n| --- | --- | --- | --- |\n`;
      await fs.writeFile(readmePath, header);
    }

    // Formata data e hora (YYYY-MM-DD HH:mm)
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    // Adiciona a linha de log
    const logLine = `| ${formattedDate} | ${finalFileName} | ${categoria} | ${resumo} |\n`;
    await fs.appendFile(readmePath, logLine);

    return NextResponse.json({
      success: true,
      nomeArquivo: finalFileName,
      categoria,
      resumo,
    });
  } catch (error: any) {
    console.error("Erro no processamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
