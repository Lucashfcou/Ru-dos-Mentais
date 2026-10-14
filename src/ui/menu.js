// Menu lateral em camadas e alternância de tema.
import { fxOn } from "../fx.js";
import { S, salvar } from "../state.js";
import { GAMES, ORDER } from "../jogos.js";
import { ICONS, gv } from "../icons.js";
import { $ } from "./dom.js";
import { UI, go, telaDe } from "./nav.js";
import { estadoDoCartao } from "./hub.js";

let aberto = false;
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_IN = "cubic-bezier(0.5, 0, 0.8, 0.4)";

function deslizar(el, de, para, duracao, atraso = 0, easing = EASE_OUT) {
  el.animate({ transform: [de, para] }, { duration: duracao, delay: atraso, easing, fill: "both" });
}

export function abrirMenu() {
  if (aberto) return;
  aberto = true;
  const menu = $("#menu");
  const botao = $("#btn-menu");
  $("#menu-items").innerHTML = ORDER.map((g) => {
    const G = GAMES[g];
    const [, rotulo] = estadoDoCartao(g);
    return `<button class="mi" data-go="${g}" style="${gv(G.color)}"><span class="gbadge">${ICONS[g]}</span><span class="mi-name">${G.name}</span><span class="chip">${rotulo}</span></button>`;
  }).join("");
  menu.hidden = false;
  document.body.style.overflow = "hidden";
  botao.setAttribute("aria-expanded", "true");
  menu.querySelectorAll(".mi").forEach((b) => {
    b.onclick = () => fecharMenu(() => go(b.dataset.go));
  });
  const camadas = [...menu.querySelectorAll(".ml")];
  const painel = menu.querySelector(".mpanel");
  const itens = [...menu.querySelectorAll(".mi,.mfoot .btn")];
  if (fxOn()) {
    // animações nativas só de transform/opacity: correm no compositor, sem trabalho na thread principal
    camadas.forEach((el, i) => deslizar(el, "translateX(100%)", "translateX(0)", 520, i * 60));
    deslizar(painel, "translateX(100%)", "translateX(0)", 520, 180);
    itens.forEach((el, i) => el.animate({ opacity: [0, 1], transform: ["translateY(18px)", "none"] }, { duration: 420, delay: 340 + Math.min(i, 8) * 40, easing: EASE_OUT, fill: "backwards" }));
  }
  setTimeout(() => {
    const f = menu.querySelector(".mi");
    if (f && aberto) f.focus({ preventScroll: true });
  }, fxOn() ? 520 : 0);
}

export function fecharMenu(depois) {
  if (!aberto) return depois && depois();
  aberto = false;
  const menu = $("#menu");
  const botao = $("#btn-menu");
  botao.setAttribute("aria-expanded", "false");
  const fim = () => {
    menu.hidden = true;
    document.body.style.overflow = "";
    if (depois) depois();
    else botao.focus();
  };
  if (fxOn()) {
    const camadas = [...menu.querySelectorAll(".ml")];
    const painel = menu.querySelector(".mpanel");
    deslizar(painel, "translateX(0)", "translateX(100%)", 240, 0, EASE_IN);
    camadas.forEach((el, i) => deslizar(el, "translateX(0)", "translateX(100%)", 260, 30 + i * 25, EASE_IN));
    setTimeout(fim, 320);
  } else fim();
}

function alternarTema() {
  const raiz = document.documentElement;
  const atual = raiz.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const novo = atual === "dark" ? "light" : "dark";
  raiz.dataset.theme = novo;
  S.store.theme = novo;
  salvar();
}

export function iniciarMenu() {
  if (S.store.theme) document.documentElement.dataset.theme = S.store.theme;
  const menu = $("#menu");
  $("#btn-menu").onclick = () => (aberto ? fecharMenu() : abrirMenu());
  $("#menu-close").onclick = () => fecharMenu();
  menu.addEventListener("click", (e) => {
    if (!e.target.closest(".mpanel")) fecharMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && aberto) fecharMenu();
  });
  $("#mf-stats").onclick = () => fecharMenu(() => telaDe("estatisticas")(UI.view === "hub" || !ORDER.includes(UI.view) ? ORDER[0] : UI.view));
  $("#mf-help").onclick = () => fecharMenu(() => (UI.view === "hub" ? telaDe("ajuda")() : telaDe("regras")(UI.view)));
  $("#mf-theme").onclick = alternarTema;
  $("#btn-theme").onclick = alternarTema;
  $("#home").onclick = () => go("hub");
}
