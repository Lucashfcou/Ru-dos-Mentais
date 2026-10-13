// Gera o dicionário de palpites válidos do PsicoTermo: palavras de 5 letras do português,
// sem acentos, a partir do pacote `an-array-of-portuguese-words` (licença MIT).
// Uso: npm run palavras
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const palavras = require("an-array-of-portuguese-words");
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content");

const sem = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const conj = new Set();
for (const p of palavras) {
  if (typeof p !== "string") continue;
  const n = sem(p.trim());
  if (/^[a-z]{5}$/.test(n)) conj.add(n);
}
// todas as respostas do jogo também são palpites válidos
for (const [p] of JSON.parse(readFileSync(join(raiz, "termo.json"), "utf8"))) conj.add(p.toLowerCase());

const lista = [...conj].sort();
writeFileSync(join(raiz, "termo-validas.json"), JSON.stringify(lista));
console.log(`${lista.length} palavras de 5 letras gravadas em src/content/termo-validas.json`);
