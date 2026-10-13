// Texto de partilha (com quadradinhos) e cópia para a área de transferência.
import { S, peek, gstate, puzzle, marks, isDone, globalStreak, edicao, rotuloPlacar } from "../state.js";
import { GAMES, ORDER } from "../jogos.js";
import { avaliar } from "../lib/termo.js";
import { grupoDe } from "../lib/conexoes.js";
import { plural } from "../lib/texto.js";
import { openSheet, $, toast } from "./dom.js";

const SQ = { ok: "🟩", near: "🟨", wrong: "🟥", skip: "⬛" };
export const quadrados = (gid) => marks(gid).map((x) => SQ[x]).join("");

export function textoDoJogo(gid) {
  const G = GAMES[gid];
  const s = gstate(gid);
  const n = edicao();
  let grade;
  if (gid === "termo") {
    const resp = puzzle("termo")[0];
    grade = s.rows.map((r) => avaliar(r, resp).map((x) => ({ c: "🟩", p: "🟨", a: "⬛" })[x]).join("")).join("\n");
  } else if (gid === "conex") {
    const P = puzzle("conex");
    grade = s.attempts.map((a) => a.map((w) => ["🟨", "🟩", "🟦", "🟪"][P.groups[grupoDe(P, w)].lvl - 1]).join("")).join("\n");
  } else grade = quadrados(gid);
  return `Ruídos Mentais nº ${n} · ${G.name} ${rotuloPlacar(gid, s)}\n${grade}`;
}

export function textoDoDia() {
  const linhas = ORDER.map((g) => {
    const s = peek(S.dia, g);
    const G = GAMES[g];
    if (!isDone(s)) return `${G.share} ${G.name} …`;
    return `${G.share} ${G.name} ${rotuloPlacar(g, s)} ${quadrados(g)}`;
  });
  return `Ruídos Mentais nº ${edicao()}\n${linhas.join("\n")}\n🔥 ${plural(globalStreak(), "dia seguido", "dias seguidos")}`;
}

export function partilhar(texto) {
  const alternativa = () => {
    openSheet(`<h2 id="sheet-title">Copia o teu resultado</h2><p>Seleciona o texto abaixo e copia.</p><textarea class="sharebox" id="sharebox" readonly>${texto}</textarea>`);
    const t = $("#sharebox");
    t.focus();
    t.select();
  };
  try {
    navigator.clipboard.writeText(texto).then(() => toast("Resultado copiado! Cola onde quiseres."), alternativa);
  } catch {
    alternativa();
  }
}
