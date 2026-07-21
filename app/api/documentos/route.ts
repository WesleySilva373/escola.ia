import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/utils/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("clienteId");

    if (!clienteId || !clienteId.trim()) {
      return NextResponse.json(
        { error: "O parâmetro clienteId é obrigatório." },
        { status: 400 }
      );
    }

    const safeClienteId = clienteId.trim().replace(/[^a-zA-Z0-9-_]/g, "");
    if (!safeClienteId) {
      return NextResponse.json(
        { error: "ID do cliente inválido." },
        { status: 400 }
      );
    }
    if (safeClienteId.length > 100) {
      return NextResponse.json(
        { error: "clienteId excede o tamanho máximo permitido (100 caracteres)." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Busca o histórico do cliente ordenado do mais recente para o mais antigo
    const { data: dbDocs, error: dbError } = await supabase
      .from("documentos")
      .select("*")
      .eq("cliente_id", safeClienteId)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Erro ao buscar documentos no Supabase:", dbError);
      return NextResponse.json(
        { error: "Erro ao consultar histórico de documentos." },
        { status: 500 }
      );
    }

    if (!dbDocs || dbDocs.length === 0) {
      return NextResponse.json({
        success: true,
        documentos: [],
      });
    }

    // Gera URLs assinadas temporárias para cada arquivo (validade: 60 minutos = 3600s)
    const documentosFormatados = await Promise.all(
      dbDocs.map(async (doc) => {
        let signedUrl = "";
        try {
          const { data: signedData, error: signedError } = await supabase.storage
            .from("documentos")
            .createSignedUrl(doc.storage_path, 3600);

          if (!signedError && signedData?.signedUrl) {
            signedUrl = signedData.signedUrl;
          }
        } catch (err) {
          console.error(`Erro ao gerar URL assinada para ${doc.storage_path}:`, err);
        }

        return {
          id: doc.id,
          nomeArquivo: doc.nome_original || doc.nome_armazenado,
          categoria: doc.categoria,
          resumo: doc.resumo,
          createdAt: doc.created_at,
          url: signedUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      documentos: documentosFormatados,
    });
  } catch (error: any) {
    console.error("Erro na rota GET /api/documentos:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
