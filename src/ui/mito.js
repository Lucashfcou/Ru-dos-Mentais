// Mito ou verdade: cinco afirmações, resposta imediata com explicação e fonte.
import { fx } from "../fx.js";
import { salvar, gstate, puzzle, marks, isDone } from "../state.js";
import { GAMES } from "../jogos.js";
import { gv, MK } from "../icons.js";
import { TOTAL, acertou, pontuacao, estadoFinal } from "../lib/mito.js";
import { main, $ } from "./dom.js";
import { UI } from "./nav.js";
import { cabecalho, ligarCabecalho, resultadoHTML, ligarResultado } from "./comum.js";

const IC_MITO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const IC_VERDADE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

const marca = (ok) => `<span class="mmark ${ok ? "ok" : "bad"}">${ok ? MK.ok : MK.wrong}</span>`;
const etiqueta = (item) => (item.verdade ? "É verdade." : "É um mito.");

function pipsHTML(m, atual) {
  return `<div class="mpips" role="img" aria-label="${m.filter((x) => x === "ok").length} certas em ${m.length} respostas">${Array.from({ length: TOTAL }, (_, i) => `<i class="${m[i] === "ok" ? "ok" : m[i] ? "bad" : ""} ${i === atual ? "cur" : ""}"></i>`).join("")}</div>`;
}

function perguntaHTML(item) {
  return `<section class="mcard" aria-live="polite"><p class="mtexto" id="mtexto">${item.texto}</p></section>
  <div class="mbtns" role="group" aria-label="A afirmação é um mito ou verdade?">
    <button class="mbtn" data-r="mito">${IC_MITO}<span>Mito</span><kbd>M</kbd></button>
    <button class="mbtn" data-r="verdade">${IC_VERDADE}<span>Verdade</span><kbd>V</kbd></button>
  </div>`;
}

function revelacaoHTML(item, escolha, ultima) {
  const ok = acertou(item, escolha);
  return `<section class="mcard revelada ${ok ? "ok" : "bad"}">
    <p class="mtexto mudo">${item.texto}</p>
    <div class="mveredito">${marca(ok)}<div><b>${ok ? "Certo!" : "Errado."}</b><span>${etiqueta(item)}</span></div></div>
    <p class="mexp">${item.explicacao}</p>
    <p class="mref">Fonte: ${item.ref}</p>
  </section>
  <div class="actions"><button class="btn accent" id="m-next">${ultima ? "Ver resultado" : "Seguinte"}</button></div>`;
}

function resultadoMito(P, s) {
  const pts = pontuacao(P.itens, s.escolhas);
  const frase =
    pts === TOTAL
      ? "Perfeito: nenhum mito passou."
      : pts >= 4
        ? "Muito bem. Só um deixou passar."
        : pts >= 3
          ? "Boa. A maior parte não enganou."
          : "Alguns mitos enganam muita gente. Vale a pena ler as explicações.";
  const lista = `<ol class="mlist">${P.itens
    .map((it, i) => {
      const ok = acertou(it, s.escolhas[i]);
      return `<li class="${ok ? "ok" : "bad"}">${marca(ok)}<div><p class="mq">${it.texto}</p><p class="mtag">${etiqueta(it)}</p><p class="mexp">${it.explicacao}</p><p class="mref">Fonte: ${it.ref}</p></div></li>`;
    })
    .join("")}</ol>`;
  return resultadoHTML("mito", s, { title: `${pts} de ${TOTAL}`, verdict: frase, body: lista, ref: "" });
}

export function telaMito() {
  const G = GAMES.mito;
  const P = puzzle("mito");
  const s = gstate("mito");
  const feito = isDone(s);
  const n = s.escolhas.length;
  const revela = UI.mitoVer && n > 0;
  const m = marks("mito");

  let corpo;
  if (revela) corpo = revelacaoHTML(P.itens[n - 1], s.escolhas[n - 1], n >= TOTAL);
  else if (feito) corpo = resultadoMito(P, s);
  else corpo = perguntaHTML(P.itens[n]);

  main.innerHTML = `<div class="game mito" style="${gv(G.color)}">${cabecalho(G, [], true)}${pipsHTML(m, revela || feito ? -1 : n)}${corpo}</div>`;
  ligarCabecalho("mito");
  ligarResultado("mito");

  main.querySelectorAll("[data-r]").forEach((b) => {
    b.onclick = () => responder(b.dataset.r);
    b.addEventListener("pointerdown", () => fx.pop(b, 0.96));
  });
  const prox = $("#m-next");
  if (prox) prox.onclick = seguinte;
  if (revela) {
    fx.pop(main.querySelector(".mcard"), 0.97);
    prox.focus({ preventScroll: true });
  } else if (feito) fx.afterResult(s.status === "won", UI.anim === "end");
}

export function responder(escolha) {
  const s = gstate("mito");
  if (isDone(s) || UI.mitoVer) return;
  const P = puzzle("mito");
  const i = s.escolhas.length;
  s.escolhas.push(escolha);
  s.status = estadoFinal(P.itens, s.escolhas);
  salvar();
  UI.mitoVer = true;
  UI.anim = null;
  fx.haptic(acertou(P.itens[i], escolha) ? "ok" : "bad");
  telaMito();
}

function seguinte() {
  const s = gstate("mito");
  UI.mitoVer = false;
  UI.anim = isDone(s) ? "end" : null;
  telaMito();
  window.scrollTo(0, 0);
}

export function iniciarTecladoMito() {
  document.addEventListener("keydown", (e) => {
    if (UI.view !== "mito" || !$("#overlay").hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (UI.mitoVer) {
      if (k === "enter") {
        e.preventDefault();
        seguinte();
      }
    } else if (k === "m") responder("mito");
    else if (k === "v") responder("verdade");
  });
}
