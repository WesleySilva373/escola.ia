import * as pdf from "pdf-parse";

/**
 * Função utilitária para extrair texto de um buffer de PDF usando a biblioteca 'pdf-parse'.
 * Importada como namespace (`import * as pdf`) para evitar erros de importação default do CommonJS no Next.js.
 * 
 * @param buffer Buffer contendo o conteúdo do arquivo PDF
 * @returns Promessa contendo o texto extraído do PDF
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("Erro ao analisar o PDF com pdf-parse:", error);
    throw error;
  }
}
