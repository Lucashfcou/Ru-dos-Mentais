// PsicoTermo: palavra de 5 letras do vocabulário da psicologia, 6 tentativas.
// Palpites: qualquer palavra do dicionário. Respostas: só termos de psicologia.
import { fx } from "../fx.js";
import { salvar, gstate, puzzle, marks, isDone } from "../state.js";
import { GAMES, MAX } from "../jogos.js";
import { TERMO, carregarDicionario } from "../content/index.js";
import { gv } from "../icons.js";
import { avaliar, estadoDasTeclas, palavraValida, colocarLetra, apagarLetra, casasVazias, TAMANHO } from "../lib/termo.js";
import { normalizar } from "../lib/texto.js";
import { $, main, toast, tremer } from "./dom.js";
import { UI, render } from "./nav.js";
import { cabecalho, ligarCabecalho, resultadoHTML, ligarResultado } from "./comum.js";

const TECLADO = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const APAGAR = '<svg viewBox="0 0 24 24"><path d="M9 6h11v12H9l-6-6zM12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>';

export function telaTermo() {
  const G = GAMES.termo;
  const P = puzzle("termo");
  const resp = P[0];
  const s = gstate("termo");
  const feito = isDone(s);
  const m = marks("termo");
  const { casas, sel } = UI.termo;

  let linhas = "";
  for (let r = 0; r < MAX; r++) {
    let celulas = "";
    let cls = "trow";
    if (r < s.rows.length) {
      const w = s.rows[r];
      const e = avaliar(w, resp);
      const nova = UI.anim && r === s.rows.length - 1;
      celulas = [...w].map((ch, i) => `<div class="tile ${e[i]} ${nova ? "reveal" : ""}" style="--d:${i * 0.25}s">${ch}</div>`).join("");
    } else if (r === s.rows.length && !feito) {
      celulas = casas
        .map((ch, i) => `<button class="tile cur-t ${ch ? "filled" : ""} ${i === sel ? "sel" : ""}" data-i="${i}" aria-label="Letra ${i + 1}${ch ? ": " + ch : ", vazia"}">${ch}</button>`)
        .join("");
      cls += " cur";
    } else celulas = Array.from({ length: TAMANHO }, () => `<div class="tile"></div>`).join("");
    linhas += `<div class="${cls}">${celulas}</div>`;
  }

  const estados = estadoDasTeclas(UI.anim ? s.rows.slice(0, -1) : s.rows, resp);
  const teclado =
    feito && !UI.anim
      ? ""
      : `<div class="keys" id="keys">${TECLADO.map(
          (linha, ri) =>
            `<div class="krow">${ri === 2 ? `<button class="key wide" data-k="ENTER">ENVIAR</button>` : ""}${[...linha].map((k) => `<button class="key ${estados[k] || ""}" data-k="${k}">${k}</button>`).join("")}${ri === 2 ? `<button class="key wide" data-k="BACK" aria-label="Apagar">${APAGAR}</button>` : ""}</div>`,
        ).join("")}</div>`;
  const ajuda = feito || s.rows.length ? "" : `<p class="helper helper-c">Toca numa casa para escolher a posição de cada letra.</p>`;
  const fim = feito && !UI.anim ? resultadoHTML("termo", s, { title: P[1], body: P[2], ref: "" }) : "";

  main.innerHTML = `<div class="game" style="${gv(G.color)}">${cabecalho(G, m)}<div class="board" id="board">${linhas}</div>${ajuda}${teclado}${fim}</div>`;
  ligarCabecalho("termo");
  ligarResultado("termo");
  main.querySelectorAll("[data-k]").forEach((b) => {
    b.onclick = () => tecla(b.dataset.k);
    b.addEventListener("pointerdown", () => fx.pop(b, 0.9));
  });
  main.querySelectorAll(".cur-t").forEach((t) => {
    t.onclick = () => {
      UI.termo.sel = +t.dataset.i;
      pintar();
    };
  });
  if (feito && !UI.anim) {
    fx.afterResult(s.status === "won", UI.burstNext);
    UI.burstNext = false;
  }
  if (!feito) carregarDicionario(); // prepara o dicionário enquanto o jogador pensa
}

const linhaAtual = () => $("#board .trow.cur");

function pintar() {
  const r = linhaAtual();
  if (!r) return;
  const { casas, sel } = UI.termo;
  [...r.children].forEach((t, i) => {
    t.textContent = casas[i] || "";
    t.classList.toggle("filled", !!casas[i]);
    t.classList.toggle("sel", i === sel);
    t.setAttribute("aria-label", `Letra ${i + 1}${casas[i] ? ": " + casas[i] : ", vazia"}`);
  });
}

export async function tecla(k) {
  const s = gstate("termo");
  if (isDone(s) || UI.termoBusy) return;
  const t = UI.termo;
  if (k === "BACK") {
    UI.termo = { ...t, ...apagarLetra(t.casas, t.sel) };
    return pintar();
  }
  if (k === "LEFT" || k === "RIGHT") {
    t.sel = Math.max(0, Math.min(TAMANHO - 1, t.sel + (k === "LEFT" ? -1 : 1)));
    return pintar();
  }
  if (k === "ENTER") return enviar();
  if (/^[A-Z]$/.test(k)) {
    UI.termo = { ...t, ...colocarLetra(t.casas, t.sel, k) };
    pintar();
    const r = linhaAtual();
    if (r) fx.pop(r.children[t.sel], 1.14);
  }
}

async function enviar() {
  const s = gstate("termo");
  const P = puzzle("termo");
  const resp = P[0];
  const { casas } = UI.termo;
  if (casas.some((c) => !c)) {
    tremer(linhaAtual());
    return toast("A palavra precisa de 5 letras");
  }
  const palpite = casas.join("");
  UI.termoBusy = true;
  const dicionario = await carregarDicionario();
  UI.termoBusy = false;
  if (!palavraValida(palpite, dicionario, TERMO.map((x) => x[0]))) {
    tremer(linhaAtual());
    return toast("Essa palavra não está no dicionário");
  }
  s.rows.push(palpite);
  UI.termo = { casas: casasVazias(), sel: 0 };
  if (palpite === resp) s.status = "won";
  else if (s.rows.length >= MAX) s.status = "lost";
  salvar();
  UI.anim = "flip";
  UI.termoBusy = true;
  telaTermo();
  setTimeout(() => {
    UI.termoBusy = false;
    if (s.status === "won") {
      const r = $("#board").children[s.rows.length - 1];
      [...r.children].forEach((t, i) => {
        t.classList.remove("reveal");
        t.style.setProperty("--d", i * 0.08 + "s");
      });
      fx.wave([...r.children]);
      toast(["Genial!", "Magnífico!", "Impressionante!", "Muito bem!", "Ufa, foi por pouco!", "No limite!"][s.rows.length - 1]);
    } else if (s.status === "lost") toast(`A palavra era ${P[1]}`);
    setTimeout(() => {
      UI.anim = null;
      if (isDone(s)) {
        UI.burstNext = s.status === "won";
        render();
        const r = $("#result");
        if (r) r.scrollIntoView({ behavior: "smooth", block: "center" });
      } else render();
    }, isDone(s) ? 900 : 0);
  }, 5 * 250 + 300);
}

/** Teclado físico: letras (acentos ignorados), Backspace, Enter e setas. */
export function iniciarTecladoTermo() {
  document.addEventListener("keydown", (e) => {
    if (UI.view !== "termo" || !$("#overlay").hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") {
      e.preventDefault();
      tecla("ENTER");
    } else if (e.key === "Backspace") tecla("BACK");
    else if (e.key === "ArrowLeft") tecla("LEFT");
    else if (e.key === "ArrowRight") tecla("RIGHT");
    else if (e.key.length === 1) {
      const ch = normalizar(e.key).toUpperCase();
      if (/^[A-Z]$/.test(ch)) tecla(ch);
    }
  });
}
