// Peças partilhadas pelos jogos de palpite, Termo e Conexões.
import { S, peek, isDone, tries, puzzle, edicao } from "../state.js";
import { GAMES, ORDER, MAX } from "../jogos.js";
import { ICONS, gv } from "../icons.js";
import { go, telaDe } from "./nav.js";
import { main, $ } from "./dom.js";
import { textoDoJogo, partilhar } from "./partilha.js";

export function proximoJogo(gid) {
  const i = ORDER.indexOf(gid);
  for (let k = 1; k <= ORDER.length; k++) {
    const g = ORDER[(i + k) % ORDER.length];
    if (!isDone(peek(S.dia, g))) return g;
  }
  return null;
}

/** Cabeçalho do jogo. `m` são as marcas das tentativas; `semContador` esconde “n/6 tentativas”. */
export function cabecalho(G, m, semContador) {
  return `
  <div class="ghead">
    <button class="icon-btn" data-home aria-label="Voltar ao início"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
    <span class="gbadge">${ICONS[G.id]}</span>
    <div class="titles"><h2>${G.name}</h2><p class="meta">${G.kicker} · nº ${edicao()}</p></div>
    <button class="icon-btn" data-rules aria-label="Como jogar ${G.name}"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/></svg></button>
  </div>
  ${semContador ? "" : `<div class="triesrow"><div class="tries">${Array.from({ length: MAX }, (_, i) => `<i class="${m[i] || ""}"></i>`).join("")}</div><span>${m.length}/${MAX} tentativas</span></div>`}`;
}

export function ligarCabecalho(gid) {
  main.querySelector("[data-home]").onclick = () => go("hub");
  main.querySelector("[data-rules]").onclick = () => telaDe("regras")(gid);
}

/** Painel de resultado com explicação e botões. */
export function resultadoHTML(gid, s, e) {
  const venceu = s.status === "won";
  const prox = proximoJogo(gid);
  return `<section class="panel result ${venceu ? "won" : "lost"}" id="result">
    <div class="result-top"><div><h3>${e.title}</h3><p class="verdict">${e.verdict || (venceu ? `Acertaste em ${tries(gid, s)}/6` : "Não foi desta. A resposta era esta.")}</p></div><span class="rsym">${ICONS[gid]}</span></div>
    <div class="explain">${e.body}</div>
    ${e.ref ? `<p class="ref">Referência: ${e.ref}</p>` : ""}
    <div class="curator"><span class="avatar">Ψ</span><span>Explicação da curadoria · <em>conteúdo de exemplo, em validação</em></span></div>
    <div class="actions"><button class="btn ghost" data-share>Partilhar resultado</button>
      ${prox ? `<button class="btn accent" data-next style="${gv(GAMES[prox].color)}">Seguinte: ${GAMES[prox].name}</button>` : `<button class="btn accent" data-summary>Ver resumo do dia</button>`}</div>
  </section>`;
}

export function ligarResultado(gid) {
  const r = $("#result");
  if (!r) return;
  r.querySelector("[data-share]").onclick = () => partilhar(textoDoJogo(gid));
  const nx = r.querySelector("[data-next]");
  if (nx) nx.onclick = () => go(proximoJogo(gid));
  const sm = r.querySelector("[data-summary]");
  if (sm) sm.onclick = () => telaDe("resumo")();
}

export const tituloDaResposta = (G, P) => P.title || G.answers[P.answer].name;
export { puzzle };
