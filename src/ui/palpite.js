// Jogos de palpite com autocompletar: Diagnóstico e Quem disse?
import { fx } from "../fx.js";
import { S, salvar, gstate, puzzle, marks, judge, isDone, edicao } from "../state.js";
import { GAMES, MAX } from "../jogos.js";
import { AUTORES } from "../content/index.js";
import { ICONS, MK, SETA_CIMA, SETA_BAIXO, gv } from "../icons.js";
import { buscar, exata, destacar } from "../lib/busca.js";
import { normalizar } from "../lib/texto.js";
import { compararAutores } from "../lib/atributos.js";
import { $, main, toast, tremer } from "./dom.js";
import { UI, render } from "./nav.js";
import { cabecalho, ligarCabecalho, resultadoHTML, ligarResultado, tituloDaResposta } from "./comum.js";

/** Comparação de nacionalidade, nascimento e escola entre o autor palpitado e o certo. */
function atributosHTML(g, P) {
  const a = AUTORES[g];
  const t = AUTORES[P.answer];
  if (!a || !t) return "";
  const c = compararAutores(a, t);
  const seta = c.seta === "up" ? `<i class="ar" title="O autor da frase nasceu depois">${SETA_CIMA}</i>` : c.seta === "down" ? `<i class="ar" title="O autor da frase nasceu antes">${SETA_BAIXO}</i>` : "";
  return `<div class="attrs"><span class="at ${c.nacionalidade}"><small>Nacionalidade</small>${a.nacionalidade}</span><span class="at ${c.nascimento}"><small>Nascimento</small><span class="v">${a.nascimento}${seta}</span></span><span class="at ${c.escola}"><small>Escola</small>${a.escola}</span></div>`;
}

/** Diagnóstico: porque é que um palpite está “perto”. */
const porqueHTML = (gid, st, P, g) => {
  if (gid !== "diag" || st !== "near") return "";
  const t = P.why && P.why[g];
  return t ? `<span class="why">${t}</span>` : "";
};

export function telaPalpite(gid) {
  const G = GAMES[gid];
  const P = puzzle(gid);
  const s = gstate(gid);
  const feito = isDone(s);
  const m = marks(gid);
  const dicas = P.hints;
  const visiveis = feito ? dicas.length : Math.min(dicas.length, G.base + s.guesses.length);

  let enunciado = "";
  if (gid === "quem") {
    enunciado = `<section class="panel quote"><span class="qmark">${ICONS.quem}</span><blockquote id="qtext">${P.quote}</blockquote><cite>Tradução livre. De quem é a frase?</cite></section>`;
  } else if (gid === "diag") {
    enunciado = `<section class="panel chart"><div class="chart-head"><span>Ficha clínica</span><span>Caso n.º ${String(edicao()).padStart(4, "0")}</span></div>
    <dl><dt>Paciente</dt><dd>${P.patient}</dd><dt>Contexto</dt><dd>${P.context}</dd><dt>Queixa</dt><dd class="complaint">${P.complaint}</dd></dl>
    <p class="disclaimer">Caso fictício, para fins educativos. Não uses para fazer autodiagnóstico.</p></section>`;
  }

  const dicasHTML = `<ol class="hints">${dicas
    .map((t, i) =>
      i < visiveis
        ? `<li class="hint ${UI.anim === "hint" && i === visiveis - 1 ? "new" : ""}"><span class="hint-no">${G.hintLabel} ${i + 1}</span><p>${t}</p></li>`
        : `<li class="hint locked"><span class="hint-no">${G.hintLabel} ${i + 1}</span><p>Desbloqueada após o ${i - G.base + 1}.º erro</p></li>`,
    )
    .join("")}</ol>`;

  const notas = { wrong: "", near: "perto!", skip: "saltou", ok: "" };
  const palpites = s.guesses.length
    ? `${gid === "quem" ? `<p class="attr-key"><span><i class="k-ok"></i>igual</span><span><i class="k-near"></i>parecido</span><span><i class="k-no"></i>diferente</span><span>↑ ↓ ano do autor da frase</span></p>` : ""}<ol class="guesses">${s.guesses
        .map((g, i) => {
          const st = judge(P, g);
          const nome = g === "__skip" ? "Saltaste a tentativa" : G.answers[g].name;
          return `<li class="guess ${st} ${UI.anim && i === s.guesses.length - 1 ? "new" : ""}"><span class="mark">${MK[st]}</span>${nome}<span class="note">${notas[st]}</span>${gid === "quem" ? atributosHTML(g, P) : ""}${porqueHTML(gid, st, P, g)}</li>`;
        })
        .join("")}</ol>`
    : "";

  const entrada = feito
    ? ""
    : `<section class="guessbox">
      <div class="combo" id="combo"><input id="guess-input" type="text" role="combobox" aria-expanded="false" aria-controls="ac" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="${G.placeholder}"><span class="kbd">Enter</span>
      <ul class="ac" id="ac" role="listbox" hidden></ul></div>
      <div class="gb-row"><button class="linkbtn" id="skip">Saltar e ver a próxima pista</button><span>${MAX - s.guesses.length} restantes</span></div>
    </section>`;

  const explicacao = feito ? resultadoHTML(gid, s, { title: tituloDaResposta(G, P), body: P.explain, ref: P.ref }) : "";
  main.innerHTML = `<div class="game" style="${gv(G.color)}">${cabecalho(G, m)}${enunciado}${dicasHTML}${entrada}${palpites}${explicacao}</div>`;
  ligarCabecalho(gid);
  ligarResultado(gid);
  if (gid === "quem") {
    const q = $("#qtext");
    if (q) fx.reveal(q, "qw", 0.1, UI.enterFx);
  }
  if (feito) fx.afterResult(s.status === "won", UI.anim === "end");
  else ligarBusca(gid);
  if (UI.anim === "end") $("#result").scrollIntoView({ behavior: "smooth", block: "start" });
}

function ligarBusca(gid) {
  const G = GAMES[gid];
  const s = gstate(gid);
  const inp = $("#guess-input");
  const ac = $("#ac");
  let itens = [];
  let ativo = -1;
  const fechar = () => {
    ac.hidden = true;
    inp.setAttribute("aria-expanded", "false");
    ativo = -1;
  };
  const desenhar = () => {
    const q = inp.value;
    itens = buscar(G.answers, q, s.guesses);
    if (!normalizar(q)) return fechar();
    if (ativo >= itens.length) ativo = itens.length ? 0 : -1;
    ac.innerHTML = itens.length
      ? itens
          .map((a, i) => `<li role="option" id="opt-${i}" aria-selected="${i === ativo}" data-i="${i}"><span class="ac-n">${destacar(a.name, q)}</span>${a.al.length && !a.n.includes(normalizar(q)) ? `<small>também: ${a.al[0]}</small>` : ""}</li>`)
          .join("")
      : `<li class="empty">Nada encontrado. Tenta outro termo.</li>`;
    ac.hidden = false;
    inp.setAttribute("aria-expanded", "true");
    if (ativo >= 0) inp.setAttribute("aria-activedescendant", `opt-${ativo}`);
    else inp.removeAttribute("aria-activedescendant");
    ac.querySelectorAll("[data-i]").forEach((li) => {
      li.onmousedown = (e) => {
        e.preventDefault();
        palpitar(gid, itens[+li.dataset.i].id);
      };
    });
  };
  const mover = (d) => {
    if (!itens.length) return;
    ativo = (ativo + d + itens.length) % itens.length;
    desenhar();
    const el = $("#opt-" + ativo);
    if (el) el.scrollIntoView({ block: "nearest" });
  };
  inp.addEventListener("input", () => {
    ativo = 0;
    desenhar();
  });
  inp.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      mover(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      mover(-1);
    } else if (e.key === "Escape") fechar();
    else if (e.key === "Enter") {
      e.preventDefault();
      const certa = exata(G.answers, inp.value, s.guesses);
      if (ativo >= 0 && itens[ativo]) palpitar(gid, itens[ativo].id);
      else if (certa) palpitar(gid, certa.id);
      else if (normalizar(inp.value)) {
        tremer($("#combo"));
        toast("Escolhe uma das opções da lista");
      }
    }
  });
  inp.addEventListener("blur", () => setTimeout(fechar, 120));
  $("#skip").onclick = () => palpitar(gid, "__skip");
  if (matchMedia("(pointer:fine)").matches) inp.focus({ preventScroll: true });
}

export function palpitar(gid, id) {
  const s = gstate(gid);
  const P = puzzle(gid);
  if (isDone(s)) return;
  if (id !== "__skip" && s.guesses.includes(id)) return toast("Já tentaste essa resposta");
  s.guesses.push(id);
  const st = judge(P, id);
  if (st === "ok") s.status = "won";
  else if (s.guesses.length >= MAX) s.status = "lost";
  salvar();
  UI.anim = isDone(s) ? "end" : "hint";
  render();
  if (st === "near") toast("Perto! Está na mesma família de conceitos.");
  else if (st === "wrong") {
    tremer($("#combo"));
    toast("Ainda não. Nova pista desbloqueada.");
  } else if (st === "ok") toast(["Brilhante!", "Na mosca!", "Excelente raciocínio!", "Muito bem!", "Clínico de primeira!", "Certeiro!"][s.guesses.length - 1]);
  else if (s.status === "lost") toast("Fim das tentativas");
  const inp = $("#guess-input");
  if (inp && matchMedia("(pointer:fine)").matches) inp.focus({ preventScroll: true });
  if (UI.anim === "hint") {
    const c = $("#combo");
    if (c) c.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  UI.anim = null;
}
