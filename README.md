# 📄 Agente IA Organizador de Documentos — Orbe Contábil

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-blue?style=flat-square&logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://escola-ia-ecru.vercel.app)

#  Agente IA Organizador de Documentos — Orbe Contábil

Aplicação web desenvolvida como solução para o desafio técnico da Escol.Ai.

O sistema simula o ambiente de um escritório contábil, a **Orbe Contábil**, que recebe diariamente documentos de diferentes clientes. A aplicação utiliza Inteligência Artificial para analisar os arquivos enviados, identificar automaticamente sua categoria, gerar um resumo e organizar os documentos por cliente.

A solução possui uma interface web simples para envio de documentos e utiliza **Google Gemini** para processamento inteligente, **Supabase** para armazenamento persistente e **Vercel** para hospedagem da aplicação.

---

##  Funcionalidades

* Upload de múltiplos arquivos.
* Suporte a documentos em PDF, imagens PNG/JPG e arquivos TXT.
* Identificação do cliente através de um ID.
* Processamento automático dos documentos utilizando Inteligência Artificial.
* Classificação automática em categorias predefinidas.
* Geração de resumo do documento.
* Organização dos documentos por cliente e categoria.
* Tratamento de arquivos duplicados.
* Registro histórico dos documentos processados.
* Consulta do histórico de documentos por cliente.
* Visualização de arquivos enviados.
* Visualização de imagens diretamente na aplicação.
* Visualização de PDFs através da interface web.
* Geração de URLs temporárias para acesso aos arquivos privados.
* Armazenamento persistente utilizando Supabase.
* Deploy em ambiente serverless utilizando Vercel.

---

##  Categorias de documentos

A Inteligência Artificial deve classificar cada documento em uma das seguintes categorias:

1. `Contratos`
2. `Financeiro`
3. `Documentos Pessoais`
4. `Comprovantes`
5. `Nao-Classificado`

A utilização de categorias fixas permite manter uma estrutura de organização consistente e evita que a IA crie categorias diferentes para documentos semelhantes.

---

##  Inteligência Artificial

O projeto utiliza o modelo **Google Gemini 2.5 Flash**, integrado através do SDK oficial `@google/genai`.

### Por que Gemini 2.5 Flash?

A escolha do Gemini 2.5 Flash foi baseada principalmente nos seguintes fatores:

* Boa velocidade de processamento.
* Capacidade de trabalhar com diferentes tipos de documentos.
* Suporte a processamento multimodal.
* Capacidade de analisar textos e imagens.
* Integração simples através do SDK `@google/genai`.
* Bom equilíbrio entre custo e desempenho.

A aplicação utiliza instruções estruturadas para orientar o modelo a retornar uma categoria válida e um resumo do documento.

O modelo foi escolhido para oferecer uma solução rápida e de baixo custo para o volume de documentos esperado no cenário proposto.

###  Estimativa de custo

Considerando documentos de tamanho moderado e um volume controlado de tokens processados por requisição, a estimativa apresentada para o projeto é de aproximadamente:

**~US$ 0,00015 por documento processado**

O custo real pode variar de acordo com:

* Tamanho do documento.
* Quantidade de tokens processados.
* Tipo de conteúdo enviado.
* Quantidade de documentos processados.
* Preços atuais da API utilizada.

Por isso, o valor apresentado deve ser considerado uma estimativa e não um custo fixo.

---

##  Arquitetura

A aplicação utiliza a seguinte arquitetura:

```text
Usuário
   │
   ▼
Interface Web — Next.js
   │
   ▼
API de Processamento
   │
   ├──► Google Gemini
   │       └── Análise e classificação
   │
   ├──► Supabase PostgreSQL
   │       └── Metadados e histórico
   │
   └──► Supabase Storage
           └── Arquivos dos clientes
```

O fluxo principal funciona da seguinte maneira:

1. O usuário informa o ID do cliente.
2. O usuário seleciona um ou mais arquivos.
3. A aplicação envia os arquivos para a API de processamento.
4. O backend encaminha o conteúdo para análise da Inteligência Artificial.
5. O Gemini identifica a categoria e gera o resumo.
6. O documento recebe uma identificação única para evitar sobrescrita.
7. O arquivo é armazenado no Supabase Storage.
8. Os metadados são registrados no banco de dados.
9. O histórico do cliente é atualizado.
10. A aplicação apresenta o resultado do processamento ao usuário.

---

##  Supabase

O Supabase é utilizado como camada de persistência da aplicação.

### Supabase Storage

Responsável pelo armazenamento dos arquivos enviados pelos clientes.

Os arquivos são organizados seguindo uma estrutura lógica semelhante a:

```text
ID_CLIENTE/
├── Contratos/
├── Financeiro/
├── Documentos Pessoais/
├── Comprovantes/
└── Nao-Classificado/
```

### PostgreSQL

O banco de dados mantém os metadados e o histórico dos documentos processados.

Exemplo de informações armazenadas:

* ID do documento.
* ID do cliente.
* Nome original do arquivo.
* Nome utilizado no armazenamento.
* Categoria identificada.
* Resumo gerado.
* Caminho do arquivo no Storage.
* Data de processamento.

Essa abordagem permite consultar o histórico dos clientes sem depender do sistema de arquivos local da aplicação.

---

##  Segurança e LGPD

Documentos contábeis podem conter informações pessoais e financeiras, como CPF, CNPJ, contratos e comprovantes.

Por esse motivo, o projeto considera os seguintes princípios de segurança:

* Arquivos armazenados em bucket privado.
* Acesso aos documentos realizado através de URLs temporárias assinadas.
* Separação dos documentos por cliente.
* Chaves secretas mantidas exclusivamente no ambiente do servidor.
* Variáveis de ambiente não versionadas no Git.
* `SUPABASE_SERVICE_ROLE_KEY` não deve ser utilizada diretamente no frontend.
* `GEMINI_API_KEY` não deve ser exposta no código-fonte público.

A aplicação foi desenvolvida considerando boas práticas relacionadas à proteção de dados, porém a implementação técnica por si só não representa uma certificação de conformidade com a LGPD.

Em um ambiente real, ainda seria necessário implementar políticas completas de segurança, controle de acesso, autenticação, autorização, auditoria, retenção e exclusão de dados.

---

## Vercel e armazenamento de arquivos

O projeto foi adaptado para funcionar em ambiente serverless.

Em plataformas como a Vercel, não é recomendado utilizar o sistema de arquivos local da aplicação como mecanismo permanente de armazenamento.

Arquivos criados localmente durante a execução de uma função serverless podem não permanecer disponíveis após o término da execução ou entre diferentes instâncias da aplicação.

Por esse motivo, a versão de produção utiliza:

* **Supabase Storage** para os arquivos.
* **Supabase PostgreSQL** para os metadados e histórico.
* **Vercel** para hospedagem da aplicação.

A pasta `storage/` presente no repositório não deve ser utilizada como armazenamento permanente de documentos reais em produção.

---

##  Tecnologias utilizadas

* **Next.js** — Framework web.
* **React** — Construção da interface.
* **TypeScript** — Tipagem estática.
* **Tailwind CSS** — Estilização.
* **Google Gemini 2.5 Flash** — Processamento de Inteligência Artificial.
* **@google/genai** — SDK de integração com Gemini.
* **Supabase Storage** — Armazenamento dos documentos.
* **Supabase PostgreSQL** — Persistência de dados e histórico.
* **Vercel** — Deploy e hospedagem.

---

##  Estrutura do projeto

A estrutura pode variar conforme os módulos auxiliares utilizados pela aplicação, mas os principais componentes são:

```text
app/
├── api/
│   └── processar/
│       └── route.ts
├── layout.tsx
└── page.tsx

storage/
└── .gitkeep

utils/
└── módulos auxiliares

.gitignore
next.config.mjs
package.json
package-lock.json
postcss.config.js
tailwind.config.ts
tsconfig.json
README.md
```

A pasta `storage/` é mantida no repositório apenas através do arquivo `.gitkeep`. Dados reais de clientes não devem ser versionados no GitHub.

---

##  Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
GEMINI_API_KEY="SUA_CHAVE_API_DO_GEMINI"
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="SUA_CHAVE_SERVICE_ROLE"
```

Nunca publique essas informações no GitHub.

O arquivo `.env.local` deve permanecer fora do controle de versão.

Em produção, as mesmas variáveis devem ser configuradas como **Environment Variables** na plataforma de hospedagem.

---

##  Como executar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/WesleySilva373/escola.ia.git
```

### 2. Acesse a pasta

```bash
cd escola.ia
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie:

```text
.env.local
```

E configure as variáveis necessárias:

```env
GEMINI_API_KEY="sua-chave"
SUPABASE_URL="sua-url"
SUPABASE_SERVICE_ROLE_KEY="sua-chave"
```

### 5. Execute o projeto

```bash
npm run dev
```

### 6. Abra no navegador

```text
http://localhost:3000
```

---

##  Validação

Antes de realizar o deploy, recomenda-se validar:

* Upload de arquivo TXT.
* Upload de imagem.
* Upload de PDF.
* Upload múltiplo.
* Classificação correta.
* Resumo gerado.
* Tratamento de arquivos duplicados.
* Registro do histórico.
* Consulta por ID do cliente.
* Visualização de imagens.
* Visualização de PDFs.
* Persistência dos arquivos no Supabase.
* Persistência dos metadados no PostgreSQL.
* Funcionamento das variáveis de ambiente no ambiente de produção.

---

##  Deploy

O projeto pode ser implantado na Vercel conectado ao repositório GitHub.

Após configurar o projeto, as seguintes variáveis devem ser adicionadas no ambiente de produção:

```text
GEMINI_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Após o deploy, a aplicação estará disponível através da URL fornecida pela Vercel.

---

##  Limitações conhecidas

### Sistema de arquivos local

A pasta `storage/` não deve ser considerada uma solução de armazenamento persistente em ambientes serverless.

A persistência de produção é realizada através do Supabase.

### Segurança

O projeto foi desenvolvido como uma solução técnica para o desafio proposto. Em um cenário empresarial real, recomenda-se implementar mecanismos adicionais, como:

* Autenticação de usuários.
* Controle de acesso baseado em permissões.
* Row Level Security (RLS).
* Auditoria de operações.
* Políticas de retenção de documentos.
* Processo de exclusão de dados.
* Monitoramento e alertas.
* Rate limiting.
* Validação adicional de arquivos.

---

##  Objetivo do projeto

O objetivo do projeto é demonstrar como Inteligência Artificial pode ser utilizada para automatizar uma tarefa operacional comum em escritórios de contabilidade: a organização e classificação de documentos recebidos de diferentes clientes.

A solução combina uma interface web simples com processamento de IA e armazenamento persistente, buscando reduzir tarefas manuais e melhorar a organização dos documentos.

---


##  Ferramentas de IA utilizadas no desenvolvimento

Durante o desenvolvimento do projeto, diferentes ferramentas de Inteligência Artificial foram utilizadas como apoio ao processo de engenharia de software, pesquisa, desenvolvimento, revisão e resolução de problemas.

### ChatGPT

Utilizado como apoio durante o desenvolvimento para:

* Análise e compreensão de requisitos.
* Planejamento da arquitetura da aplicação.
* Criação e revisão de código.
* Identificação e correção de erros.
* Auxílio na documentação do projeto.
* Pesquisa e esclarecimento de conceitos técnicos.
* Análise de problemas relacionados ao deploy e infraestrutura.

### Google Gemini

Utilizado tanto como ferramenta de desenvolvimento e pesquisa quanto como tecnologia principal de Inteligência Artificial integrada à aplicação.

No sistema, o **Google Gemini** é responsável pelo processamento dos documentos, realizando a análise do conteúdo, categorização e geração de resumos.

A integração da aplicação é realizada através do SDK oficial `@google/genai`.

### Antigravity

Utilizado como ferramenta de apoio ao desenvolvimento assistido por Inteligência Artificial, auxiliando na implementação, análise e evolução do código do projeto.

### Claude

Utilizado como ferramenta complementar para análise de código, revisão de implementações e apoio na identificação de possíveis problemas durante o desenvolvimento.

---

###  Abordagem de desenvolvimento com IA

As ferramentas de Inteligência Artificial foram utilizadas como **assistentes de desenvolvimento**, auxiliando na produtividade e na resolução de problemas técnicos.

O desenvolvimento não foi baseado apenas na geração automática de código. As implementações foram analisadas, testadas e validadas durante o processo de desenvolvimento, com execução local, testes de integração e validação do funcionamento da aplicação em ambiente de produção.

A utilização de múltiplos modelos e ferramentas também permitiu realizar análises complementares e comparar diferentes abordagens para problemas técnicos.

> **Observação:** com exceção do Google Gemini utilizado diretamente pela aplicação para processamento dos documentos, as demais ferramentas de IA foram utilizadas como ferramentas de apoio durante o desenvolvimento do projeto e não fazem parte da arquitetura de execução da aplicação em produção.


##  Projeto

Desenvolvido como parte do desafio técnico da **Escol.Ai**.

**Autor:** Wesley Silva Tenório

**Repositório:** `WesleySilva373/escola.ia`

- 🔗 **URL de Produção:** [https://escola-ia-ecru.vercel.app](https://escola-ia-ecru.vercel.app)
