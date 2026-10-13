# Conteúdo

Tudo em `src/content/`. **Todo o conteúdo é rascunho** até a curadoria o validar. Valida-se com `npm run conteudo` (e nos testes).

| Ficheiro | O que tem | Quantidade |
| --- | --- | --- |
| `diagnostico.json` | casos clínicos fictícios, 5 pistas, explicação, referência | 30 |
| `quem-disse.json` | autores e citações, 5 pistas, explicação, referência | 40 |
| `conexoes.json` | desafios de 4 grupos de 4 termos | 30 |
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
- Definições das 150 palavras do PsicoTermo e datas dos autores.
- Português europeu em todo o texto (perturbação, stresse, ecrã, PHDA).
