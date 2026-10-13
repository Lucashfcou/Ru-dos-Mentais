// Menu lateral em camadas e alternância de tema.
import { fx, M, fxOn, EXPO } from "../fx.js";
import { S, salvar } from "../state.js";
import { GAMES, ORDER } from "../jogos.js";
import { ICONS, gv } from "../icons.js";
import { $ } from "./dom.js";
import { UI, go, telaDe } from "./nav.js";
import { estadoDoCartao } from "./hub.js";

let aberto = false;

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
  if (M && fxOn())
    fx.safe(() => {
      M.animate(camadas, { x: ["100%", "0%"] }, { duration: 0.6, ease: EXPO, delay: M.stagger(0.07) });
      M.animate(painel, { x: ["100%", "0%"] }, { duration: 0.6, ease: EXPO, delay: 0.21 });
      M.animate(itens, { opacity: [0, 1], y: [24, 0] }, { duration: 0.55, ease: EXPO, delay: M.stagger(0.05, { startDelay: 0.4 }) });
    });
  setTimeout(() => {
    const f = menu.querySelector(".mi");
    if (f && aberto) f.focus();
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
  if (M && fxOn()) {
    const camadas = [...menu.querySelectorAll(".ml")];
    const painel = menu.querySelector(".mpanel");
    fx.safe(() => {
      M.animate(painel, { x: ["0%", "100%"] }, { duration: 0.28, ease: [0.5, 0, 0.8, 0.4] });
      M.animate(camadas, { x: ["0%", "100%"] }, { duration: 0.3, ease: [0.5, 0, 0.8, 0.4], delay: M.stagger(0.03, { startDelay: 0.05 }) });
    });
    setTimeout(fim, 340);
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
