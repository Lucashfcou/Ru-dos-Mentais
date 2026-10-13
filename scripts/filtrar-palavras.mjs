// Gera src/content/termo-validas.json: palavras de 5 letras (sem acentos) do português europeu,
// expandindo o dicionário Hunspell pt_PT (pacote `dictionary-pt-pt`, GPL/LGPL/MPL) só com sufixos,
// mais os radicais de 5 letras do VERO (`dictionary-pt`, LGPL/MPL).
// Os prefixos ficam de fora (as formas com 5 letras quase nunca os usam). Corre com `npm run palavras`.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raizPacote = join(dirname(fileURLToPath(import.meta.url)), "..", "node_modules", "dictionary-pt-pt");
const aff = readFileSync(join(raizPacote, "index.aff"), "utf8").split(/\r?\n/);
const dic = readFileSync(join(raizPacote, "index.dic"), "utf8").split(/\r?\n/).slice(1);
const raiz = new URL("../src/content/", import.meta.url);

// ---- regras de sufixo: flag -> [{corta, junta, cond}]
const regras = new Map();
for (const l of aff) {
  const m = l.match(/^SFX\s+(\S)\s+(\S+)\s+(\S+)\s+(\S+)/);
  if (!m || m[2] === "Y" || m[2] === "N") continue; // cabeçalho "SFX A Y 3"
  const [, flag, corta, junta, cond] = m;
  const add = junta === "0" ? "" : junta.split("/")[0];
  let re;
  try {
    re = new RegExp(`${cond === "." ? "" : cond}$`);
  } catch {
    continue;
  }
  if (!regras.has(flag)) regras.set(flag, []);
  regras.get(flag).push({ corta: corta === "0" ? "" : corta, add, re });
}

const sem = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const conj = new Set();
const guardar = (w) => {
  if (w.length > 7) return;
  const n = sem(w);
  if (/^[a-z]{5}$/.test(n)) conj.add(n);
};

for (const linha of dic) {
  if (!linha) continue;
  const [palavra, flags = ""] = linha.split("/");
  if (!palavra || palavra[0] !== palavra[0].toLowerCase()) continue; // nomes próprios e siglas
  if (/[^\p{L}]/u.test(palavra)) continue; // hífens, pontos, números
  guardar(palavra);
  for (const f of flags) {
    for (const r of regras.get(f) || []) {
      if (!r.re.test(palavra)) continue;
      if (r.corta && !palavra.endsWith(r.corta)) continue;
      guardar(palavra.slice(0, palavra.length - r.corta.length) + r.add);
    }
  }
}
// reforço: radicais de 5 letras do dicionário VERO (pt-BR), só formas base e em minúsculas
const vero = readFileSync(join(raizPacote, "..", "dictionary-pt", "index.dic"), "utf8").split(/\r?\n/).slice(1);
for (const linha of vero) {
  const palavra = linha.split("/")[0];
  if (palavra && palavra[0] === palavra[0].toLowerCase() && !/[^\p{L}]/u.test(palavra)) guardar(palavra);
}
// as respostas do jogo também são palpites válidos
for (const [p] of JSON.parse(readFileSync(new URL("termo.json", raiz), "utf8"))) conj.add(p.toLowerCase());

const lista = [...conj].sort();
writeFileSync(new URL("termo-validas.json", raiz), JSON.stringify(lista));
console.log(`${lista.length} palavras gravadas em src/content/termo-validas.json`);
