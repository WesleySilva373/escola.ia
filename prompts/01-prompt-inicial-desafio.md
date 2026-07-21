# Prompt Inicial — Desafio Completo

Você é um engenheiro de software e precisa resolver o problema da Orbe Contábil, um escritório de contabilidade fictício.

O objetivo é construir do zero um chat web com agente de IA que categoriza documentos, move os arquivos para pastas e atualiza um README.md por cliente.

## Stack

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- Modelo de IA livre

## Requisitos

### 1. Chat Web — app/page.tsx

- Interface de chat limpa e direta.
- Input para indicar o ID do Cliente, por exemplo `cliente-01`.
- Upload de arquivos PDF, PNG, JPG e TXT.
- Suporte a upload múltiplo.
- Estado de carregamento claro durante o processamento.
- Exibição do status do processamento.
- Exibição da categoria atribuída.
- Exibição do resumo gerado.

### 2. API — app/api/processar/route.ts

- Receber arquivo e `clienteId` via FormData.
- Enviar o arquivo para a API do Google Gemini.
- Utilizar o SDK oficial `@google/genai`.
- Utilizar o modelo Gemini.
- Categorizar rigorosamente em uma das 5 categorias:

1. Contratos
2. Financeiro
3. Documentos Pessoais
4. Comprovantes
5. Nao-Classificado

- Gerar um resumo de exatamente 1 linha.
- Exigir resposta estruturada em JSON:

```json
{
  "categoria": "string",
  "resumo": "string"
}
```

### 3. Gestão de arquivos

Salvar os arquivos seguindo a estrutura:

`./storage/{clienteId}/{categoria}/{nomeDoArquivo}`

Tratar duplicatas. Se o arquivo já existir, adicionar timestamp ou número ao nome para não sobrescrever.

Atualizar:

`./storage/{clienteId}/README.md`

O README deve funcionar como um log cumulativo e nunca apagar o histórico anterior.

Adicionar uma nova linha:

`| YYYY-MM-DD HH:mm | NomeDoArquivo | Categoria | Resumo de 1 linha |`

## Estrutura inicial esperada

```text
meu-organizador/
├── app/
│   ├── api/
│   │   └── processar/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── storage/
├── .env.local
├── package.json
└── README.md
```

## Gerar

1. Comando para instalar os pacotes.
2. Conteúdo do `.env.local` com `GEMINI_API_KEY`.
3. Código completo de `app/api/processar/route.ts`.
4. Código completo de `app/page.tsx`.
5. README.md final explicando decisões, escolha do Gemini, custo estimado por documento, LGPD e limitações de escrita em disco em ambientes serverless.
