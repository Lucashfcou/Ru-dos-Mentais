// Ondas da tela inicial: um traço por jogo e o “sinal do dia”.
import { fxOn } from "../fx.js";
import { S, salvar, peek, tries, puzzle, cxMistakes } from "../state.js";
import { ORDER } from "../jogos.js";
import { hashTexto } from "../lib/texto.js";
import { especificarOnda, alturas, caminho, nivelDoDia, ONDA, LINHA_PERDIDA, LINHA_ESPERA } from "../lib/ondas.js";

export function especificacao(gid) {
  const s = peek(S.dia, gid);
  if (!s) return especificarOnda(null);
  const t = tries(gid, s);
  const erros = gid === "conex" ? cxMistakes(puzzle("conex"), s) : s.status === "won" ? t - 1 : t;
  return especificarOnda({ tentativas: t, status: s.status, erros, maxErros: gid === "conex" ? 4 : 5 });
}

const tipoCss = { espera: "idle", perdeu: "lost", venceu: "won", jogando: "play" };

export function ondaSVG(gid) {
  const sp = especificacao(gid);
  const d = sp.tipo === "perdeu" ? LINHA_PERDIDA : sp.tipo === "espera" ? LINHA_ESPERA : caminho(alturas(sp.L, hashTexto(S.dia + gid)));
  return `<svg class="wv ${tipoCss[sp.tipo]}" data-g="${gid}" data-sig="${sp.assinatura}" data-l="${sp.L.toFixed(2)}" viewBox="0 0 110 44" aria-hidden="true"><path d="${d}"/></svg>`;
}

export function ondaDiaSVG() {
  const L = nivelDoDia(ORDER.map(especificacao));
  return `<svg class="wv wv-day" data-g="dia" data-sig="${L.toFixed(2)}" data-l="${L.toFixed(2)}" viewBox="0 0 440 44" preserveAspectRatio="none" aria-hidden="true"><path d="${caminho(alturas(L, hashTexto(S.dia + "dia"), 140), 440, 44)}"/></svg>`;
}

/** Única animação automática da tela: o traço “se limpa” quando o resultado é novo. */
export function limparOndas() {
  S.store.waveSeen = S.store.waveSeen || {};
  const pendentes = [];
  document.querySelectorAll(".wv").forEach((svg) => {
    const chave = S.dia + svg.dataset.g;
    if (S.store.waveSeen[chave] === svg.dataset.sig) return;
    S.store.waveSeen[chave] = svg.dataset.sig;
    if (svg.classList.contains("idle") || svg.classList.contains("lost")) return;
    pendentes.push(svg);
  });
  salvar();
  if (!pendentes.length || !fxOn()) return;
  const tarefas = pendentes.map((svg) => {
    const dia = svg.classList.contains("wv-day");
    const N = dia ? 140 : ONDA.N;
    const semente = hashTexto(S.dia + svg.dataset.g);
    return { p: svg.querySelector("path"), de: alturas(1, semente, N), para: alturas(+svg.dataset.l, semente, N), W: dia ? 440 : ONDA.L };
  });
  const t0 = performance.now();
  const D = 1300;
  const passo = (agora) => {
    const k = Math.min(1, (agora - t0) / D);
    const e = 1 - Math.pow(1 - k, 4);
    for (const j of tarefas) if (j.p.isConnected) j.p.setAttribute("d", caminho(j.de.map((y, i) => y + (j.para[i] - y) * e), j.W, 44));
    if (k < 1) requestAnimationFrame(passo);
  };
  for (const j of tarefas) j.p.setAttribute("d", caminho(j.de, j.W, 44));
  setTimeout(() => requestAnimationFrame(passo), 450);
}
