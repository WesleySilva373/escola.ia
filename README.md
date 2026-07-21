# Agente Organizador de Documentos - Escol.Ai

Este é um projeto prático desenvolvido como teste técnico para a **Escol.Ai**. Trata-se de uma aplicação de inteligência artificial em formato de chat/upload web que organiza e categoriza documentos de clientes de forma extremamente simples, enxuta e performática.

---

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS (Vanilla CSS com Design Dark Moderno)
- **IA SDK:** `@google/genai` (SDK Oficial do Google)
- **Modelo de IA:** `gemini-2.5-flash` (Sucessor atualizado do `gemini-1.5-flash`, garantindo suporte ativo e compatibilidade completa com Structured Outputs).

---

## 💡 Decisões de Arquitetura e Estrutura do Projeto

O projeto segue estritamente a estrutura solicitada, livre de pastas ou configurações complexas desnecessárias:

```text
meu-organizador/
├── app/
│   ├── api/
│   │   └── processar/
│   │       └── route.ts     # Rota que processa com Gemini e salva arquivos/logs
│   ├── layout.tsx           # Layout global da página (fonte Inter e meta tags)
│   └── page.tsx             # Interface SPA moderna de upload e listagem de status
├── storage/
│   └── .gitkeep             # Mantém a pasta de storage no Git sem enviar arquivos locais
├── .env.local               # Variáveis de ambiente locais (ignorado no Git)
├── .gitignore               # Regras de segurança do Git
├── package.json             # Dependências e scripts do projeto
└── README.md                # Documentação técnica do repositório
```

---

## 🪙 Modelo de IA e Custo por Documento

Optamos pela utilização da família **Gemini Flash (`gemini-2.5-flash` / `gemini-1.5-flash`)** pelos seguintes fatores:

1. **Multimodalidade Nativa:** O modelo processa arquivos de imagem, PDF e texto sem necessidade de bibliotecas de OCR externas pesadas.
2. **Saída Estruturada (JSON Schema):** O SDK obriga a resposta a vir exatamente no formato `{"categoria": string, "resumo": string}`, o que zera a taxa de falha de parser no backend.
3. **Custo Estimado por Documento:**
   - **Input (Entrada):** ~$0.075 por milhão de tokens.
   - **Output (Saída):** ~$0.30 por milhão de tokens.
   - **Custo Médio:** Para um documento comum (PDF de 2 páginas ou imagem contendo ~2000 tokens de entrada e ~100 de saída), o custo estimado é de aproximadamente **$0,00015 USD por arquivo** (cerca de R$ 0,00085). Isso viabiliza a solução para processamento em larga escala.

---

## 🔒 LGPD e Limitações em Ambientes Serverless

### Segurança e LGPD
*   **Privacidade:** Os documentos carregados (comprovantes, CNHs, contratos) contêm informações sob proteção da LGPD. Em ambiente de produção, é recomendável criptografar os dados em repouso e adotar políticas rígidas de descarte/expiração de arquivos.
*   **Ambiente Local:** O arquivo `.env.local` está devidamente listado no `.gitignore` para prevenir qualquer vazamento acidental da chave `GEMINI_API_KEY`.

### Limitação Serverless (Vercel, Netlify, Lambda)
*   **Sistemas de Arquivos Efêmeros:** O código utiliza o módulo `fs` do Node.js para salvar arquivos na pasta `/storage`. Em plataformas serverless como a Vercel, o disco local é temporário e somente-leitura em várias partes, significando que os uploads serão apagados sempre que a instância do container for reciclada.
*   **Solução para Produção:** Recomenda-se migrar o armazenamento local para um Object Storage na nuvem (como **AWS S3** ou **Supabase Storage**) e registrar os logs em um banco de dados persistente (PostgreSQL, MongoDB, etc.).

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** (versão 18 ou superior) instalado em sua máquina.

### 2. Configurar a Chave de API
Crie um arquivo `.env.local` na raiz do projeto (caso não exista) e adicione sua chave obtida no [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY="SUA_CHAVE_DE_API_AQUI"
```

### 3. Instalar as Dependências
Execute o comando abaixo para instalar as bibliotecas do projeto:
```bash
npm install
```

### 4. Iniciar o Servidor de Desenvolvimento
Inicie a aplicação local:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para interagir com a aplicação.
