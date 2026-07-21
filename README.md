# Agente Organizador de Documentos - Escol.Ai

Este é um projeto prático desenvolvido como teste técnico para a **Escol.Ai**. Trata-se de uma aplicação de inteligência artificial em formato de upload web que organiza e categoriza documentos de clientes de forma simples, enxuta e performática.

---

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS (Vanilla CSS com Design Dark Moderno)
- **IA SDK:** `@google/genai` (SDK Oficial do Google)
- **Modelo de IA:** `gemini-2.5-flash` (Com suporte a Structured Outputs)
- **Persistência de Arquivos:** Supabase Storage (Bucket privado)
- **Banco de Dados:** Supabase PostgreSQL

---

## ☁️ Por que o Filesystem Local não é Persistente na Vercel?

Em plataformas de hospedagem serverless como a **Vercel**, cada requisição pode rodar em um container efêmero e isolado. O sistema de arquivos local (`fs` ou `/tmp`) é temporário e descartado sempre que o container é reciclado ou entra em hibernação. 

Por esse motivo, salvar arquivos ou históricos de documentos em disco local causa perda permanente de dados e impede a consulta posterior. A solução adotada foi substituir o sistema de arquivos local por **Supabase Storage** para armazenamento de arquivos e **Supabase PostgreSQL** para o histórico dos documentos.

---

## 🗄️ Configuração do Supabase

### 1. Criar a Tabela no Banco de Dados (PostgreSQL)

Execute o seguinte SQL no **SQL Editor** do Supabase:

```sql
CREATE TABLE documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id text NOT NULL,
  nome_original text NOT NULL,
  nome_armazenado text NOT NULL,
  categoria text NOT NULL,
  resumo text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para otimizar as consultas por cliente_id
CREATE INDEX idx_documentos_cliente_id ON documentos(cliente_id);
```

### 2. Criar o Bucket Privado no Supabase Storage

1. Acesse o painel do Supabase > **Storage**.
2. Clique em **New Bucket**.
3. Nomeie o bucket exatamente como: `documentos`.
4. Mantenha a opção **Public Bucket** desativada (Bucket Privado).

Os arquivos serão armazenados na seguinte estrutura de pastas:
- `clienteId/categoria/nomeDoArquivo` (Exemplo: `empresa-orbe/Contratos/contrato_1710000000.pdf`)
- `clienteId/README.md` (Exemplo: `empresa-orbe/README.md`)

---

## 🔑 Variáveis de Ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
GEMINI_API_KEY="SUA_CHAVE_GEMINI_AQUI"
SUPABASE_URL="https://seuprompt.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="SUA_CHAVE_SERVICE_ROLE_AQUI"
```

> **IMPORTANTE:** A `SUPABASE_SERVICE_ROLE_KEY` é utilizada **apenas no backend** para permitir a gravação e geração de URLs assinadas no bucket privado. Esta chave nunca é enviada ao navegador.

---

## 🚀 Como Executar Localmente

1. **Clone o repositório e instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o `.env.local`** conforme descrito na seção anterior.

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:** [http://localhost:3000](http://localhost:3000)

---

## 🌐 Como Realizar o Deploy na Vercel

1. Suba o projeto para um repositório no GitHub/GitLab.
2. Importe o projeto no painel da **Vercel**.
3. Em **Environment Variables**, adicione:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Clique em **Deploy**.

---

## 🪙 Observação sobre Custos do Gemini

Os preços e custos por documento do modelo `gemini-2.5-flash` variam de acordo com o volume de tokens (entrada e saída), região e modalidades utilizadas. Consulte a [documentação oficial de preços do Google AI Studio](https://ai.google.dev/pricing) para obter os valores exatos e atualizados.

---

## 🔒 Segurança & Limitações Restantes

- **Segurança:** As URLs para visualização dos arquivos são geradas como **URLs Assinadas Temporárias** (com validade de 60 minutos), garantindo acesso seguro a arquivos em buckets privados sem expor o bucket publicamente.
- **Limitações e Melhorias Futuras:**
  - Adicionar suporte a autenticação de usuários (caso necessário no futuro).
  - Adicionar paginação na lista de histórico para clientes com centenas de documentos.
  - Implementar busca por palavra-chave nos resumos dos documentos.
