# Prompt — Corrigir Erro do pdf-parse

O projeto apresentou um Build Error relacionado ao arquivo `lib/parser.ts`.

O erro ocorre porque o código está utilizando:

`import pdf from 'pdf-parse'`

Esse import é incompatível com a forma como o pacote está sendo carregado no ambiente ESM/Next.js.

Analise a implementação atual e corrija o uso do `pdf-parse`.

Depois:

- Rode o build.
- Confirme que compilou sem erros.
- Teste a leitura de um PDF real.
- Confirme que o conteúdo extraído do PDF está sendo processado corretamente pela IA.

Não altere outras partes do projeto sem necessidade.
