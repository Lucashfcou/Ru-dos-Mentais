// Conexões: separar 16 termos em 4 grupos.
import { fx } from "../fx.js";
import { salvar, gstate, puzzle, isDone, cxMistakes, rotuloPlacar } from "../state.js";
import { GAMES } from "../jogos.js";
import { gv } from "../icons.js";
import { grupoDe, melhorGrupo, repetida, MAX_ERROS } from "../lib/conexoes.js";
import { embaralhar } from "../lib/texto.js";
import { $, main, toast } from "./dom.js";
import { UI } from "./nav.js";
import { cabecalho, ligarCabecalho, resultadoHTML, ligarResultado } from "./comum.js";

export function telaConexoes() {
  const G = GAMES.conex;
  const P = puzzle("conex");
  const s = gstate("conex");
  const feito = isDone(s);
  if (!s.order) {
    s.order = embaralhar(P.groups.flatMap((g) => g.words));
    salvar();
  }
  const erros = cxMistakes(P, s);
  const grupos = feito ? [...s.solved, ...P.groups.map((_, i) => i).filter((i) => !s.solved.includes(i))] : s.solved;
  const gruposHTML = grupos
    .map((gi) => {
      const g = P.groups[gi];
      const perdido = !s.solved.includes(gi);
      return `<div class="cx-group ${UI.anim === "solved" && gi === s.solved[s.solved.length - 1] ? "new" : ""} ${perdido ? "missed" : ""}" style="--k:var(--k${g.lvl})"><b>${g.name}</b><span>${g.words.join(", ")}</span></div>`;
    })
    .join("");
  const resolvidas = s.solved.flatMap((gi) => P.groups[gi].words);
  const restantes = s.order.filter((w) => !resolvidas.includes(w));
  const grade = feito ? "" : `<div class="cx-grid" lang="pt-PT">${restantes.map((w) => `<button class="cx-tile" aria-pressed="${UI.cxSel.includes(w)}" data-w="${w}">${w}</button>`).join("")}</div>`;
  const barra = feito
    ? ""
    : `<div class="cx-bar">
      <div class="cx-dots" aria-label="${MAX_ERROS - erros} erros restantes">Erros restantes ${Array.from({ length: MAX_ERROS }, (_, i) => `<i class="${i < erros ? "used" : ""}"></i>`).join("")}</div>
      <div class="cx-btns"><button class="btn ghost" id="cx-shuffle">Baralhar</button><button class="btn ghost" id="cx-clear" ${UI.cxSel.length ? "" : "disabled"}>Desmarcar</button><button class="btn accent" id="cx-go" ${UI.cxSel.length === 4 ? "" : "disabled"}>Enviar</button></div>
    </div>`;
  const fim = feito
    ? resultadoHTML("conex", s, {
        verdict: s.status === "won" ? `Resolvido com ${rotuloPlacar("conex", s)}` : "Não foi desta. Os grupos eram estes.",
        title: "Os quatro grupos",
        body: `<ul class="grouplist">${P.groups.map((g) => `<li style="--k:var(--k${g.lvl})"><b>${g.name}</b>${g.note}</li>`).join("")}</ul>`,
        ref: "",
      })
    : "";
  main.innerHTML = `<div class="game" style="${gv(G.color)}">${cabecalho(G, [], true)}
    <p class="helper">Seleciona 4 termos com algo em comum.</p>
    <section class="cx">${gruposHTML}${grade}</section>${barra}${fim}</div>`;
  ligarCabecalho("conex");
  ligarResultado("conex");
  fx.flip(".cx-tile", "w");
  fx.fitTiles();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => UI.view === "conex" && fx.fitTiles());
  if (UI.cxPop) {
    fx.pop(main.querySelector(`.cx-tile[data-w="${UI.cxPop}"]`), 0.9);
    UI.cxPop = null;
  }
  if (UI.anim === "solved") {
    const g = main.querySelector(".cx-group.new");
    if (g) {
      fx.pop(g, 0.9);
      const b = g.getBoundingClientRect();
      fx.burst(b.left + b.width / 2, b.top + b.height / 2, 8, 0.5);
    }
  }
  if (feito) {
    fx.afterResult(s.status === "won", UI.anim === "end");
    return;
  }
  main.querySelectorAll("[data-w]").forEach((b) => {
    b.onclick = () => {
      const w = b.dataset.w;
      if (UI.cxSel.includes(w)) UI.cxSel = UI.cxSel.filter((x) => x !== w);
      else if (UI.cxSel.length < 4) {
        UI.cxSel.push(w);
        UI.cxPop = w;
      } else return;
      UI.anim = null;
      telaConexoes();
    };
  });
  $("#cx-shuffle").onclick = () => {
    fx.snap(".cx-tile", "w");
    s.order = embaralhar(s.order);
    salvar();
    UI.anim = null;
    telaConexoes();
  };
  $("#cx-clear").onclick = () => {
    UI.cxSel = [];
    UI.anim = null;
    telaConexoes();
  };
  $("#cx-go").onclick = enviar;
}

function enviar() {
  const P = puzzle("conex");
  const s = gstate("conex");
  if (UI.cxSel.length !== 4 || isDone(s)) return;
  if (repetida(s.attempts, UI.cxSel)) return toast("Já tentaste esta combinação");
  s.attempts.push(UI.cxSel.slice());
  const melhor = melhorGrupo(P, UI.cxSel);
  fx.snap(".cx-tile", "w");
  if (melhor === 4) {
    s.solved.push(grupoDe(P, UI.cxSel[0]));
    UI.cxSel = [];
    if (s.solved.length === 4) s.status = "won";
    salvar();
    UI.anim = isDone(s) ? "end" : "solved";
    telaConexoes();
    toast(isDone(s) ? ["Perfeito!", "Excelente!", "Muito bem!", "Ufa!"][Math.min(3, cxMistakes(P, s))] : "Grupo encontrado!");
  } else if (cxMistakes(P, s) >= MAX_ERROS) {
    s.status = "lost";
    UI.cxSel = [];
    salvar();
    UI.anim = "end";
    telaConexoes();
    toast("Fim das tentativas");
  } else {
    salvar();
    toast(melhor === 3 ? "Falta só um!" : "Não é um grupo");
    fx.shakeEls([...main.querySelectorAll(".cx-tile[aria-pressed='true']")]);
    const m = cxMistakes(P, s);
    main.querySelectorAll(".cx-dots i").forEach((d, i) => d.classList.toggle("used", i < m));
  }
  if (UI.anim === "end") {
    const r = $("#result");
    if (r) r.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  UI.anim = null;
}
