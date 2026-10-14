# Ruídos Mentais

Quatro jogos diários de psicologia: **Diagnóstico**, **PsicoTermo**, **Quem disse?** e **Conexões**.
Site estático (Vite + JavaScript), sem servidor. O dia vira à meia-noite de **Lisboa** (`Europe/Lisbon`) em Portugal e à de **Brasília** (`America/Sao_Paulo`) no Brasil, em qualquer dispositivo. Há versão em português brasileiro, escolhida sozinha (ver `CONTEUDO.md`).

## Comandos

```bash
npm install
npm run dev        # desenvolvimento
npm test           # testes automáticos (Vitest)
npm run conteudo   # valida os JSON de conteúdo
npm run build      # gera dist/
npm run palavras   # regenera o dicionário de palpites do PsicoTermo (lento, ~minutos)
```

## Publicar na Vercel

1. Envia o projeto para o GitHub e importa-o na Vercel (preset Vite, já definido em `vercel.json`).
2. Define a variável `VITE_LANCAMENTO` (AAAA-MM-DD) com o dia da edição nº 1. Sem ela, usa-se `2026-10-01`.
3. A região está fixada em `cdg1` (Paris, UE).

## Estrutura

- `src/lib/`: regras puras (tempo, PsicoTermo, Conexões, ondas, estatísticas). Têm testes em `tests/`.
- `src/content/`: conteúdo em JSON. Ver `CONTEUDO.md`.
- `src/ui/`: ecrãs e componentes. `src/state.js`: estado guardado no `localStorage`.

## Conteúdo

Todo o conteúdo é rascunho para validação pela curadoria. O rodapé da aplicação avisa disso enquanto estiver em teste.
