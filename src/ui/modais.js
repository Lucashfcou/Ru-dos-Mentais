// Painéis: como jogar, estatísticas e resumo do dia.
import { fx } from "../fx.js";
import { S, peek, isDone, puzzle, tries, cxMistakes, statsFor, globalStreak, edicao, rotuloPlacar } from "../state.js";
import { GAMES, ORDER } from "../jogos.js";
import { ICONS, MK, FLAME, gv } from "../icons.js";
import { plural } from "../lib/texto.js";
import { $, openSheet, closeSheet, setSheetG } from "./dom.js";
import { go } from "./nav.js";
import { textoDoDia, quadrados, partilhar } from "./partilha.js";
import { atualizarRelogio } from "./relogio.js";

export function ajudaGeral() {
  openSheet(`<h2 id="sheet-title">Como funciona</h2>
  <p>Todos os dias, à meia-noite (hora de Lisboa), chegam quatro desafios novos, iguais para toda a gente. Joga pela ordem que quiseres e partilha o resultado sem estragar a surpresa.</p>
  <div class="rules">${ORDER.map((g) => `<div class="rule" style="${gv(GAMES[g].color)}"><span class="gbadge">${ICONS[g]}</span><div><b>${GAMES[g].name}</b><p>${GAMES[g].rules}</p></div></div>`).join("")}</div>
  <h3>Sequência</h3><p>Conclui todos os jogos no mesmo dia para manter a sequência.</p>
  <div class="actions" style="margin-top:16px"><button class="btn" id="go-play">Começar pelo Diagnóstico</button></div>`);
  $("#go-play").onclick = () => {
    closeSheet();
    go("diag");
  };
}

export function regras(gid) {
  const G = GAMES[gid];
  const legenda =
    gid === "conex"
      ? `<ul class="grouplist" style="margin-top:12px">${[[1, "Mais fácil"], [2, "Médio"], [3, "Difícil"], [4, "Mais difícil, com armadilhas"]].map(([l, t]) => `<li style="--k:var(--k${l})">${t}</li>`).join("")}</ul>`
      : gid === "termo"
        ? `<div class="legend"><div class="tile c">F</div><div class="tile p">O</div><div class="tile a">B</div><div class="tile a">I</div><div class="tile a">A</div></div>
    <p style="margin-top:8px;color:var(--muted);font-size:14.5px">F está no sítio certo. O existe, mas noutra posição. B, I e A não estão na palavra.</p>`
        : `<ol class="guesses" style="margin-top:12px"><li class="guess wrong"><span class="mark">${MK.wrong}</span>Errado: nova pista desbloqueada</li><li class="guess near"><span class="mark">${MK.near}</span>Perto: mesma família de conceitos<span class="note">perto!</span></li><li class="guess ok"><span class="mark">${MK.ok}</span>Certo</li></ol>`;
  openSheet(
    `<h2 id="sheet-title">Como jogar ${G.name}</h2><p>${G.rules}</p>${legenda}
  ${gid === "diag" ? `<p style="margin-top:12px;color:var(--muted);font-size:13.5px">Os casos são fictícios e educativos. Um diagnóstico a sério exige avaliação profissional.</p>` : ""}
  <div class="actions" style="margin-top:18px"><button class="btn accent" id="rules-ok">Percebi</button></div>`,
    G.color,
  );
  $("#rules-ok").onclick = closeSheet;
}

export function estatisticas(gid) {
  const desenhar = (g) => {
    const G = GAMES[g];
    const st = statsFor(g);
    const s = peek(S.dia, g);
    const mx = Math.max(1, ...st.dist);
    const cx = g === "conex";
    const destaque = s && s.status === "won" ? (cx ? cxMistakes(puzzle(g), s) : tries(g, s) - 1) : -1;
    $("#sheet-body").innerHTML = `<h2 id="sheet-title">Estatísticas</h2>
    <p style="color:var(--muted)">${FLAME} ${plural(globalStreak(), "dia seguido", "dias seguidos")} com todos os jogos concluídos</p>
    <div class="tabs" role="tablist">${ORDER.map((x) => `<button class="tab" role="tab" aria-selected="${x === g}" data-tab="${x}" style="${gv(GAMES[x].color)}">${GAMES[x].name}</button>`).join("")}</div>
    <div class="statline" style="${gv(G.color)}"><div><b>${st.jogados}</b><span>jogos</span></div><div><b>${st.jogados ? Math.round((st.vitorias / st.jogados) * 100) : 0}%</b><span>acertos</span></div><div><b>${st.atual}</b><span>sequência</span></div><div><b>${st.recorde}</b><span>recorde</span></div></div>
    <h3>${cx ? "Distribuição de erros" : "Distribuição de tentativas"}</h3>
    <div class="dist" style="${gv(G.color)}">${(cx ? st.dist.slice(0, 4) : st.dist).map((v, i) => `<div><span>${cx ? i : i + 1}</span><i class="${i === destaque ? "hl" : ""}" style="width:${Math.max(8, (v / mx) * 100)}%">${v}</i></div>`).join("")}</div>`;
    setSheetG(G.color);
    $("#sheet-body").querySelectorAll(".statline b").forEach((b) => fx.setRoll(b, b.textContent, true));
    $("#sheet-body").querySelectorAll("[data-tab]").forEach((b) => {
      b.onclick = () => desenhar(b.dataset.tab);
    });
  };
  openSheet("");
  desenhar(gid);
}

export function resumo() {
  openSheet(`<h2 id="sheet-title">Resumo do dia</h2><p class="sub">Edição ${edicao()}</p>
  <ul class="sumlist">${ORDER.map((g) => {
    const s = peek(S.dia, g);
    const G = GAMES[g];
    const r = !isDone(s) ? "pendente" : `${rotuloPlacar(g, s)} ${quadrados(g)}`;
    return `<li style="${gv(G.color)}"><span class="gbadge">${ICONS[g]}</span><b>${G.name}</b><span>${r}</span></li>`;
  }).join("")}</ul>
  <p style="margin-top:14px">${FLAME} <b>${plural(globalStreak(), "dia seguido", "dias seguidos")}</b>. Novas cartas em <b id="countdown2">--:--:--</b>.</p>
  <div class="actions" style="margin-top:16px"><button class="btn" id="share-all">Partilhar o dia</button></div>`);
  $("#share-all").onclick = () => partilhar(textoDoDia());
  atualizarRelogio();
}
