// Contagem decrescente até à meia-noite de Lisboa e viragem do dia.
import { fx } from "../fx.js";
import { S } from "../state.js";
import { dataLisboa, msAteMeiaNoite, relogio } from "../lib/tempo.js";
import { $ } from "./dom.js";
import { UI, render } from "./nav.js";

export function atualizarRelogio() {
  const t = relogio(msAteMeiaNoite());
  for (const sel of ["#countdown", "#countdown2"]) {
    const el = $(sel);
    if (el) fx.setRoll(el, t, false, true);
  }
}

export function iniciarRelogio() {
  setInterval(() => {
    atualizarRelogio();
    const hoje = dataLisboa();
    if (hoje !== S.dia) {
      S.dia = hoje;
      if (UI.view !== "hub" && !(UI.view === "termo" && UI.termoBusy)) UI.view = "hub";
      render();
    }
  }, 1000);
}
