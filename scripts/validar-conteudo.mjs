// Confere o conteúdo dos jogos. Uso: npm run conteudo
// Sai com código 1 se houver erros, para impedir que conteúdo quebrado vá para produção.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content");
const ler = (f) => JSON.parse(readFileSync(join(raiz, f), "utf8"));
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Valida e devolve { erros, avisos, contagens }. Exportado para os testes. */
export function validar() {
  const erros = [];
  const avisos = [];
  const e = (m) => erros.push(m);
  const a = (m) => avisos.push(m);

  // ---------- Diagnóstico ----------
  const d = ler("diagnostico.json");
  const idsD = new Set();
  for (const [id, nome] of d.respostas) {
    if (idsD.has(id)) e(`diagnostico: id repetido "${id}"`);
    idsD.add(id);
    if (!nome) e(`diagnostico: resposta "${id}" sem nome`);
  }
  const usadasD = new Set();
  d.casos.forEach((c, i) => {
    const t = `diagnostico caso ${i + 1} (${c.answer})`;
    if (!idsD.has(c.answer)) e(`${t}: resposta inexistente`);
    if (usadasD.has(c.answer)) a(`${t}: resposta repetida noutro caso`);
    usadasD.add(c.answer);
    for (const k of ["patient", "context", "complaint", "explain", "ref"]) if (!c[k]) e(`${t}: falta "${k}"`);
    if (!Array.isArray(c.hints) || c.hints.length !== 5) e(`${t}: precisa de 5 pistas`);
    const near = Object.keys(c.near || {});
    if (near.length < 3 || near.length > 5) e(`${t}: "near" deve ter 3 a 5 itens (tem ${near.length})`);
    for (const n of near) {
      if (!idsD.has(n)) e(`${t}: parecida inexistente "${n}"`);
      if (n === c.answer) e(`${t}: parecida igual à resposta`);
      if (!c.near[n]) e(`${t}: parecida "${n}" sem explicação`);
    }
  });

  // ---------- Quem disse? ----------
  const q = ler("quem-disse.json");
  const idsQ = new Set();
  for (const au of q.autores) {
    if (idsQ.has(au.id)) e(`quem: autor repetido "${au.id}"`);
    idsQ.add(au.id);
    for (const k of ["nome", "nacionalidade", "nascimento", "escola", "familia"]) if (!au[k]) e(`quem: autor "${au.id}" sem "${k}"`);
    if (!Number.isInteger(au.nascimento)) e(`quem: autor "${au.id}" com nascimento inválido`);
  }
  const citacoes = new Set();
  q.citacoes.forEach((c, i) => {
    const t = `quem citação ${i + 1} (${c.answer})`;
    if (!idsQ.has(c.answer)) e(`${t}: autor inexistente`);
    if (!c.quote) e(`${t}: sem citação`);
    if (citacoes.has(c.quote)) e(`${t}: citação repetida`);
    citacoes.add(c.quote);
    if (!Array.isArray(c.hints) || c.hints.length !== 5) e(`${t}: precisa de 5 pistas`);
    if (!c.explain) e(`${t}: sem explicação`);
    if (!c.ref) e(`${t}: sem referência`);
    if (!Array.isArray(c.near) || c.near.length < 2) e(`${t}: "near" precisa de pelo menos 2 autores`);
    for (const n of c.near || []) {
      if (!idsQ.has(n)) e(`${t}: parecido inexistente "${n}"`);
      if (n === c.answer) e(`${t}: parecido igual à resposta`);
    }
  });

  // ---------- Conexões ----------
  const cx = ler("conexoes.json");
  cx.desafios.forEach((des, i) => {
    const t = `conexões desafio ${i + 1}`;
    if (des.groups.length !== 4) return e(`${t}: precisa de 4 grupos`);
    const lvls = des.groups.map((g) => g.lvl).sort().join("");
    if (lvls !== "1234") e(`${t}: níveis devem ser 1, 2, 3 e 4`);
    const vistas = new Map();
    for (const g of des.groups) {
      if (!g.name || !g.note) e(`${t}: grupo sem nome ou nota`);
      if (g.words.length !== 4) e(`${t}: grupo "${g.name}" precisa de 4 termos`);
      for (const w of g.words) {
        if (vistas.has(w)) e(`${t}: termo repetido "${w}" (${vistas.get(w)} e ${g.name})`);
        vistas.set(w, g.name);
        if (w !== w.toUpperCase()) e(`${t}: termo "${w}" deve estar em maiúsculas`);
      }
    }
  });

  // ---------- PsicoTermo ----------
  const tm = ler("termo.json");
  const palavras = new Set();
  tm.forEach(([p, titulo, def], i) => {
    const t = `termo #${i + 1} (${p})`;
    const l = norm(p).replace(/ /g, "").toUpperCase();
    if (l !== p) e(`${t}: a palavra deve estar sem acento e em maiúsculas (esperado "${l}")`);
    if (p.length !== 5) e(`${t}: precisa de 5 letras`);
    if (norm(titulo).replace(/ /g, "").toUpperCase() !== p) e(`${t}: o título "${titulo}" não corresponde à palavra`);
    if (!def || def.length < 15) e(`${t}: definição curta demais`);
    if (palavras.has(p)) e(`${t}: palavra repetida`);
    palavras.add(p);
  });

  // ---------- Mito ou verdade ----------
  const mv = ler("mito-verdade.json");
  const textosMito = new Set();
  mv.dias.forEach((dia, i) => {
    const t = `mito dia ${i + 1}`;
    if (!Array.isArray(dia.itens) || dia.itens.length !== 5) return e(`${t}: precisa de 5 afirmações`);
    const verdades = dia.itens.filter((x) => x.verdade === true).length;
    if (verdades < 2 || verdades > 3) a(`${t}: ${verdades} verdades (o ideal é 2 ou 3, para não dar para adivinhar)`);
    dia.itens.forEach((x, j) => {
      const u = `${t}, afirmação ${j + 1}`;
      if (!x.texto || x.texto.length < 15) e(`${u}: texto em falta ou curto demais`);
      if (typeof x.verdade !== "boolean") e(`${u}: "verdade" deve ser true ou false`);
      if (!x.explicacao || x.explicacao.length < 20) e(`${u}: explicação em falta`);
      if (!x.ref) e(`${u}: sem fonte`);
      if (textosMito.has(x.texto)) e(`${u}: afirmação repetida`);
      textosMito.add(x.texto);
    });
  });

  const contagens = {
    diagnostico: d.casos.length,
    quemDisse: q.citacoes.length,
    conexoes: cx.desafios.length,
    termo: tm.length,
    mito: mv.dias.length,
  };
  const minimos = { diagnostico: 30, quemDisse: 30, conexoes: 30, termo: 100, mito: 30 };
  for (const k of Object.keys(minimos)) if (contagens[k] < minimos[k]) a(`${k}: ${contagens[k]} desafios, abaixo da meta mínima de ${minimos[k]}`);
  return { erros, avisos, contagens };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { erros, avisos, contagens } = validar();
  console.log("Conteúdo:", contagens);
  for (const m of avisos) console.log("aviso:", m);
  for (const m of erros) console.log("ERRO:", m);
  console.log(`${erros.length} erro(s), ${avisos.length} aviso(s)`);
  process.exit(erros.length ? 1 : 0);
}
