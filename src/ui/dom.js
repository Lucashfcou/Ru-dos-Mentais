// Utilitários de DOM e componentes simples (toast, painéis).
import { fx } from "../fx.js";

export const $ = (s, r = document) => r.querySelector(s);
export const main = document.getElementById("main");

const BOM = /Brilhante|Na mosca|Excelente|Muito bem|Clínico|Certeiro|Genial|Magnífico|Impressionante|Ufa|No limite|Perfeito|Grupo encontrado/;
const MAU = /Ainda não|Não é um grupo|Falta só um|Perto|precisa de|Fim das|Escolhe uma|já tentaste|não está no dicionário/;

export function toast(msg) {
  fx.haptic(BOM.test(msg) ? "ok" : MAU.test(msg) ? "bad" : "");
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2300);
}

export function setSheetG(g) {
  const sh = $(".sheet");
  sh.style.setProperty("--g", `var(${g || "--termo"})`);
  sh.style.setProperty("--on-g", `var(${g || "--termo"}-on)`);
}

export function openSheet(html, g) {
  $("#sheet-body").innerHTML = html;
  setSheetG(g);
  $("#overlay").hidden = false;
  $("#sheet-close").focus();
}

export const closeSheet = () => {
  $("#overlay").hidden = true;
};

export function iniciarPainel() {
  $("#sheet-close").onclick = closeSheet;
  $("#overlay").addEventListener("click", (e) => {
    if (e.target.id === "overlay") closeSheet();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#overlay").hidden) closeSheet();
  });
}

/** Treme um elemento (erro). */
export function tremer(el) {
  if (!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}
