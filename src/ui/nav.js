// Navegação entre telas e estado de interface (não guardado).
import { fx } from "../fx.js";
import { S, salvar, globalStreak } from "../state.js";
import { casasVazias } from "../lib/termo.js";
import { $, main } from "./dom.js";

export const UI = {
  view: "hub",
  anim: null,
  enterFx: false,
  hubIntro: false,
  burstNext: false,
  termoBusy: false,
  termo: { casas: casasVazias(), sel: 0 },
  cxSel: [],
  cxPop: null,
};

const telas = {};
/** Cada módulo de tela regista a sua função aqui, para evitar importações circulares. */
export const registrarTelas = (t) => Object.assign(telas, t);

export function render() {
  fx.stopRot();
  const n = globalStreak();
  fx.setRoll($("#streak-n"), n, false);
  const l = $("#streak-l");
  if (l) l.textContent = n === 1 ? "dia seguido" : "dias seguidos";
  const f = telas[UI.view] || telas.palpite;
  f(UI.view);
  if (UI.enterFx) {
    if (UI.view !== "hub") fx.settle([...main.querySelectorAll(".game>*")]);
    UI.enterFx = false;
  }
}

export function go(v) {
  UI.view = v;
  UI.anim = null;
  UI.termo = { casas: casasVazias(), sel: 0 };
  UI.cxSel = [];
  UI.enterFx = true;
  render();
  window.scrollTo(0, 0);
  if (v !== "hub" && !S.store.seen[v]) {
    S.store.seen[v] = 1;
    salvar();
    telas.regras(v);
  }
}

export const telaDe = (nome) => telas[nome];
