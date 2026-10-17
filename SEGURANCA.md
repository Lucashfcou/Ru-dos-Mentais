# Segurança

O site é estático: não tem servidor, base de dados, login nem formulários. Não envia nenhum dado a lado nenhum (tudo fica no `localStorage` do próprio aparelho) e não carrega scripts, fontes nem imagens de terceiros.

## O que foi verificado

| Verificação | Resultado |
| --- | --- |
| `npm audit` (dependências, com e sem as de desenvolvimento) | 0 vulnerabilidades |
| Segredos no repositório (chaves, tokens, `.env`) | nenhum |
| Pedidos a domínios externos no build | nenhum |
| Pontos que escrevem HTML (`innerHTML`) | só recebem texto escapado ou conteúdo fixo do jogo |
| `?lang=` e `#jogo` no endereço | só aceitam valores de uma lista |
| Estado guardado no navegador adulterado ou corrompido | descartado (ver abaixo) |

## Estado guardado (`src/state.js`, `sanearArmazem`)

O que está no `localStorage` pode estar corrompido ou ter sido alterado à mão. Antes de usar, cada jogo é validado: só passa o que tem exatamente o formato que o jogo escreve (respostas conhecidas, letras A–Z, termos do desafio do dia, listas com tamanho máximo, estados `playing`/`won`/`lost`). O resto é descartado, para o jogo nunca travar nem pôr HTML estranho na tela. Testes em `tests/seguranca.test.js`.

## Cabeçalhos (`vercel.json`)

`Content-Security-Policy` (scripts só do próprio site, sem `eval`, sem iframes, sem formulários), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (câmara, microfone, localização etc. desligados), `Strict-Transport-Security` e `Cross-Origin-Opener-Policy`. A política foi testada com o build real: os cinco jogos, o menu e o tema funcionam sem nenhuma violação.

`style-src` mantém `'unsafe-inline'` porque as cores de cada jogo vão em atributos `style`.

## Strix

O Strix (https://github.com/usestrix/strix) precisa de Docker e de uma chave de modelo de IA paga para correr. Não está instalado neste computador. Para o usar depois: instalar o Docker Desktop, `pipx install strix-agent`, definir `STRIX_LLM` e `LLM_API_KEY`, e apontar para o endereço do site (de preferência uma cópia local com `npm run build && npm run preview`, e não o site publicado).
