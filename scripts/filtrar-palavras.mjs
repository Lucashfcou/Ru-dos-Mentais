// Gera termo-validas.json: palavras de 5 letras (sem acentos) que o corretor Hunspell pt aceita.
// Parte das formas originais (com acentos) para não perder "tédio" -> "tedio".
// Lento (carrega ~4 MB de afixos): corre uma vez com `npm run palavras`.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import dic from "dictionary-pt";
import nspell from "nspell";

const require = createRequire(import.meta.url);
const palavras = require("an-array-of-portuguese-words");
const d = dic;
const sp = nspell(d);
const sem = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const raiz = new URL("../src/content/", import.meta.url);

const conj = new Set();
for (const p of palavras) {
  if (typeof p !== "string") continue;
  const n = sem(p.trim());
  if (/^[a-z]{5}$/.test(n) && sp.correct(p.trim())) conj.add(n);
}
for (const [p] of JSON.parse(readFileSync(new URL("termo.json", raiz), "utf8"))) conj.add(p.toLowerCase());
const lista = [...conj].sort();
writeFileSync(new URL("termo-validas.json", raiz), JSON.stringify(lista));
console.log(`${lista.length} palavras gravadas`);
