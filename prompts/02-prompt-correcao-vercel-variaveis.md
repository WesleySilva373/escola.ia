# Prompt — Correção de Variáveis de Ambiente na Vercel

Você é um engenheiro de software e precisa resolver um problema sem erros.

O código do projeto acabou de subir para a Vercel e apresentou um erro relacionado a `SUPABASE_URL`, embora o projeto estivesse funcionando localmente.

Analise a causa do problema.

As variáveis de ambiente configuradas localmente não sobem automaticamente junto com o código para a Vercel.

Corrija o problema garantindo que as variáveis necessárias estejam configuradas no ambiente de produção.

Também avalie a implementação de fallbacks no `getSupabaseClient()` quando isso for apropriado.

Depois faça o deploy novamente e confirme que a aplicação funciona em produção.
