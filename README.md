# 📄 Agente IA Organizador de Documentos — Orbe Contábil

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-blue?style=flat-square&logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://escola-ia-ecru.vercel.app)

> Aplicação web de produção desenvolvida para a **Orbe Contábil**, um escritório de contabilidade fictício que recebe dezenas de documentos diários de clientes (contratos, notas fiscais, comprovantes e documentos pessoais). Um agente de IA analisa, categoriza, renomeia, gera resumos e mantém o histórico unificado de cada cliente em tempo real.

---

## 🎯 Requisitos Atendidos & Funcionalidades

- [x] **Chat / Interface Web de Upload**: Upload amigável com suporte a **múltiplos arquivos** simultâneos nos formatos **PDF, Imagens (PNG/JPG) e TXT** (máx. 10 MB).
- [x] **5 Categorias Fixas de Classificação**:
  1. `Contratos`
  2. `Financeiro`
  3. `Documentos Pessoais`
  4. `Comprovantes`
  5. `Nao-Classificado`
- [x] **Organização Automática por Cliente e Categoria**: Arquivos salvos com timestamp único para evitar colisão de nomes em subpastas estruturadas: `ID_CLIENTE/CATEGORIA/NOME_ARQUIVO`.
- [x] **Histórico Imutável & Log README.md por Cliente**: Cada novo upload constrói e atualiza o histórico em markdown (`ID_CLIENTE/README.md`) e no banco de dados sem apagar dados anteriores.
- [x] **Proteção de Dados & LGPD**: Arquivos salvos em **bucket privado com URLs temporárias assinadas (Signed URLs)** com expiração de 60 minutos. Sem acesso público direto aos documentos sensíveis dos clientes.
- [x] **Resiliência Serverless (Vercel)**: Transição completa do sistema de arquivos local (`fs`) para **Supabase Storage** e **PostgreSQL**, contornando a efemeridade do filesystem serverless em nuvem.
- [x] **Testes de Integração**: Scripts de teste para validação de leitura e categorização de arquivos via API.

---

## 🤖 Escolha do Modelo de IA e Justificativa de Custos

### **Modelo Escolhido:** `Google Gemini 2.5 Flash` (`@google/genai`)

#### **Por que o Gemini 2.5 Flash foi escolhido?**
1. **Suporte Multimodal Nativo (PDF, Imagens, Texto)**: O Gemini processa diretamente imagens (OCR nativo), arquivos PDF e arquivos de texto sem a necessidade de bibliotecas locais pesadas de extração de texto no Node.js (que falham em ambientes serverless).
2. **Saídas Estruturadas (JSON Schema Enforcement)**: Permite definir rigidamente o enum das 5 categorias fixas (`Contratos`, `Financeiro`, `Documentos Pessoais`, `Comprovantes`, `Nao-Classificado`), garantindo 100% de precisão de formato e eliminando respostas fora do padrão.
3. **Velocidade de Resposta**: Latência extremamente baixa (média de 0,8s a 1,5s por documento), ideal para uma experiência fluida no chat web.

#### **Estimativa de Custo por Documento Processado**
- **Preço base do Gemini 2.5 Flash**: ~$0,075 USD por 1 milhão de tokens de entrada / $0,30 USD por 1 milhão de tokens de saída.
- **Tamanho médio de um documento** (ex: contrato ou nota fiscal em PDF com imagem): ~2.000 a 5.000 tokens de mídia/texto.
- **Custo aproximado por documento**: **~$0,00015 USD** (aprox. **R$ 0,0008** ou menos de 1 centavo de real por documento processado).
- **Cota de Desenvolvimento**: Gratuito na cota padrão do Google AI Studio para testes e volumetria média.

---

## 🛡️ Conformidade com a LGPD (Lei Geral de Proteção de Dados)

Documentos contábeis e fiscais contêm dados altamente sensíveis (CPF, CNPJ, extratos bancários, contratos de prestação de serviços). O sistema adota as seguintes práticas de segurança:

1. **Bucket Privado (Sem Leitura Pública)**: O storage de arquivos não possui permissão de leitura pública ativada.
2. **URLs Temporárias Assinadas (Signed URLs)**: Para visualizar ou baixar um documento, a aplicação gera uma URL assinada com token criptográfico de validade limitada a **60 minutos**.
3. **Isolamento por Cliente (Multi-tenant)**: Todos os registros e arquivos são segregados pelo `cliente_id`.
4. **Proteção da Chave Mestra**: A `SUPABASE_SERVICE_ROLE_KEY` é mantida estritamente no ambiente do servidor (`Node.js/Vercel`), impedindo qualquer exposição no frontend.

---

## ☁️ Arquitetura Serverless na Vercel (Limitações de Filesystem)

### **A Limitação:**
Ambientes serverless como a **Vercel** executam funções em containers temporários que não mantêm estado em disco (`/tmp` é limpo a cada nova requisição ou hibernação). Tentar salvar arquivos ou logs `.md` no disco rígido local da aplicação causa perda de dados imediata e erros em produção.

### **A Solução:**
- **Armazenamento de Arquivos:** **Supabase Storage** (Bucket `documentos`), gerenciando arquivos físicos e o `README.md` de cada cliente de forma persistente.
- **Histórico e Metadados:** **Supabase PostgreSQL** (Tabela `documentos`), garantindo consultas ultrarrápidas do histórico por cliente ordenado por data.

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

### Tabela `documentos`:
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

-- Índice para consultas rápidas por cliente
CREATE INDEX idx_documentos_cliente_id ON documentos(cliente_id);
```

---

## 🔑 Variáveis de Ambiente

Crie ou configure o arquivo `.env.local` (localmente) e na **Vercel** (Environment Variables):

```env
GEMINI_API_KEY="SUA_CHAVE_API_DO_GEMINI"
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="SUA_CHAVE_SERVICE_ROLE"
```

---

## 💻 Como Executar o Projeto Localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Acesse a aplicação no seu navegador
http://localhost:3000
```

---

## 🚀 Deploy em Produção (Vercel)

A aplicação já está em produção e implantada na Vercel:

- 🔗 **URL de Produção:** [https://escola-ia-ecru.vercel.app](https://escola-ia-ecru.vercel.app)
