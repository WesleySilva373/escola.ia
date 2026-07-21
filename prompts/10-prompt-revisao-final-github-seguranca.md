# Prompt — Revisão Final, Limpeza e Segurança do GitHub

O código do projeto "Agente Organizador de Documentos" está funcionando corretamente. Agora preciso alinhar tudo, revisar o que realmente é necessário e preparar o repositório para o GitHub com total segurança.

Atue como um Engenheiro de Software Senior.

## 1. Remoção de dados locais e pastas de teste

Garanta a exclusão de qualquer pasta de teste pessoal ou de cliente criada durante os testes locais, como:

`storage/wesley`

ou outras pastas semelhantes.

O repositório deve subir limpo.

A pasta `storage/` deve permanecer apenas com:

`storage/.gitkeep`

## 2. Revisão e limpeza de código

Verifique:

- `app/api/processar/route.ts`
- `app/page.tsx`

Garanta que não existe:

- Código morto.
- Logs desnecessários.
- Arquivos extras sem uso.
- Pastas desnecessárias.

Mantenha o projeto enxuto e essencial.

Não remova arquivos que sejam realmente necessários para a integração com Supabase ou para o funcionamento do Next.js.

## 3. Segurança e .gitignore

O `.gitignore` deve garantir:

- `.env.local` nunca seja enviado para o GitHub.
- `GEMINI_API_KEY` nunca seja exposta.
- Chaves do Supabase nunca sejam expostas.
- Dados de clientes nunca sejam enviados ao GitHub.
- A pasta `storage/` seja ignorada.
- Apenas `storage/.gitkeep` seja mantido no Git.

## 4. Requisitos obrigatórios

Confirme se:

- A categorização está limitada estritamente às 5 categorias:
  - Contratos
  - Financeiro
  - Documentos Pessoais
  - Comprovantes
  - Nao-Classificado

- O resumo gerado possui exatamente 1 linha.
- O histórico é atualizado de forma cumulativa.
- O histórico anterior nunca é apagado.
- Arquivos duplicados recebem um sufixo para não sobrescrever arquivos existentes.

## 5. README principal

Gere o README.md final explicando:

- Stack.
- Decisões técnicas.
- Gemini utilizado.
- Justificativa do modelo.
- Estimativa de custo por documento.
- LGPD.
- Limitações do sistema de arquivos local em ambientes serverless.
- Como executar localmente.
- Como configurar as variáveis de ambiente.
- Como fazer o deploy.

Forneça também os comandos para limpar as pastas de teste e a configuração recomendada do `.gitignore`.
