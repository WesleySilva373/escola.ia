import PDFParse from "pdf-parse";

/**
 * Função utilitária para extrair texto de um buffer de PDF usando a biblioteca 'pdf-parse'.
 * 
 * @param buffer Buffer contendo o conteúdo do arquivo PDF
 * @returns Promessa contendo o texto extraído do PDF
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    // Compatibilidade com CommonJS / ESM em bundlers como Next.js/Turbopack
    const parse = typeof PDFParse === "function" ? PDFParse : (PDFParse as any)?.default || require("pdf-parse");
    
    // Suporte para a versão clássica do pdf-parse e para novas instâncias
    if (typeof parse === "function") {
      const data = await parse(buffer);
      return data.text;
    }

    const parser = new parse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    if (typeof parser.destroy === "function") {
      await parser.destroy();
    }
    return result.text;
  } catch (error) {
    console.error("Erro ao analisar o PDF com pdf-parse:", error);
    throw error;
  }
}

