# Conteúdo

Tudo em `src/content/`. **Todo o conteúdo é rascunho** até a curadoria o validar. Valida-se com `npm run conteudo` (e nos testes).

| Ficheiro | O que tem | Quantidade |
| --- | --- | --- |
| `diagnostico.json` | casos clínicos fictícios, 5 pistas, explicação, referência | 30 |
| `quem-disse.json` | autores e citações, 5 pistas, explicação, referência | 40 |
| `conexoes.json` | desafios de 4 grupos de 4 termos | 30 |
| `mito-verdade.json` | 30 dias de 5 afirmações (mito ou verdade), cada uma com explicação e fonte | 150 |
| `termo.json` | respostas do PsicoTermo: `[PALAVRA, Título, definição]` | 150 |
| `termo-validas.json` | palpites aceites (gerado, não editar à mão) | ~12 mil |

Cada jogo escolhe o desafio do dia pelo número da edição (`VITE_LANCAMENTO` = edição 1) e recomeça do início quando a lista acaba. Com a base atual há cerca de um mês de desafios sem repetição.

## PsicoTermo

- Respostas: só termos de psicologia, 5 letras A–Z, sem acentos. O título leva os acentos (`TEDIO` → «Tédio») e tem de corresponder à palavra.
- Palpites: qualquer palavra de 5 letras do dicionário. Gera-se com `npm run palavras` a partir do Hunspell pt_PT (`dictionary-pt-pt`) mais os radicais do VERO (`dictionary-pt`).

## Para a curadoria validar

- Os 4 itens do Quem disse? com `"verificar": true` (frase, fonte e tradução) mais os novos de Adler e Bion.
- A explicação de «porquê perto» de cada caso do Diagnóstico.
- O grupo «Separação e luto (Bowlby)» das Conexões mistura fases da separação (Robertson e Bowlby) com a reorganização do luto.
- As 150 afirmações de Mito ou verdade (`mito-verdade.json`), a começar pelas marcadas com `"verificar": true` (efeito Dunning-Kruger, Pigmalião, expressões faciais, marshmallow, IAT, etc., onde a literatura é discutida). Cada uma traz a fonte; convém confirmar números e a formulação.
- Definições das 150 palavras do PsicoTermo e datas dos autores.
- Português europeu em todo o texto (perturbação, stresse, ecrã, PHDA).

## Português do Brasil

A variante é escolhida sozinha, sem botão: `?lang=br` ou `?lang=pt` na ligação (fica guardada no aparelho), senão o fuso horário (Lisboa, Açores e Madeira = Portugal; fusos do Brasil = Brasil) e, só fora desses, o idioma do navegador (`pt-BR` = Brasil). Em Portugal o dia vira à meia-noite de Lisboa; no Brasil, à de Brasília.

O texto original é europeu. `src/lib/br.js` adapta-o ao português brasileiro ao carregar: perturbação → transtorno (com género e adjetivos), stresse → estresse, PHDA → TDAH, ficha clínica → prontuário, pista → dica, ecrã → tela, tu → você, pronomes antes do verbo, e assim por diante. As regras têm testes em `tests/br.test.js`.

- Quem revê o conteúdo no Brasil deve ver os termos clínicos e o tom das frases, e dizer o que deve mudar para acrescentarmos regras em `br.js`.
- As referências bibliográficas ficam como estão.
