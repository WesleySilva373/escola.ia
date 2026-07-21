import _pdf from "pdf-parse";

// Converte o tipo importado para qualquer (ou tipo chamável) para satisfazer o compilador do TypeScript
const pdf = _pdf as any;

/**
 * Função utilitária para extrair texto de um buffer de PDF usando a biblioteca 'pdf-parse'.
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
