// Tela inicial: resumo do dia e lista dos jogos.
import { fx } from "../fx.js";
import { S, salvar, peek, dayState, isDone, tries, puzzle, marks, cxMistakes, globalStreak, edicao } from "../state.js";
import { GAMES, ORDER, MAX } from "../jogos.js";
import { ICONS, gv } from "../icons.js";
import { plural } from "../lib/texto.js";
import { dataPorExtenso } from "../lib/tempo.js";
import { $, main } from "./dom.js";
import { UI, go, telaDe } from "./nav.js";
import { ondaSVG, ondaDiaSVG, limparOndas } from "./ondas.js";
import { atualizarRelogio } from "./relogio.js";

/** Estado e rótulo de um jogo para a tela inicial. */
export function estadoDoCartao(gid) {
  const s = peek(S.dia, gid);
  if (!s || tries(gid, s) === 0) return ["new", "Jogar"];
  if (s.status === "won") {
    if (gid === "conex") {
      const m = cxMistakes(puzzle("conex"), s);
      return ["won", m ? `Resolvido com ${plural(m, "erro", "erros")}` : "Resolvido sem erros"];
    }
    return ["won", `Acertaste em ${tries(gid, s)}/6`];
  }
  if (s.status === "lost") return ["lost", "Não acertaste"];
  return ["play", gid === "conex" ? `Continuar · ${s.solved.length}/4 grupos` : `Continuar · ${tries(gid, s)}/6`];
}

const textoDoEstado = (gid) => {
  const [st, rotulo] = estadoDoCartao(gid);
  return st === "new" ? "Ainda não jogado" : rotulo;
};

/** Mini-grade com o resultado: o texto do estado fica em segundo plano. */
function miniGrade(gid) {
  const s = peek(S.dia, gid);
  if (gid === "conex") {
    const P = puzzle("conex");
    const m = s ? cxMistakes(P, s) : 0;
    const resolvidos = s ? s.solved : [];
    const barras = [0, 1, 2, 3]
      .map((gi) => {
        const on = resolvidos.includes(gi) || (s && s.status === "lost");
        return `<i class="cb ${on ? "on" : ""}" style="--k:var(--k${P.groups[gi].lvl})"></i>`;
      })
      .join("");
    const pontos = [0, 1, 2, 3].map((i) => `<i class="cd ${i < m ? "bad" : ""}"></i>`).join("");
    const rotulo = !s || !s.attempts.length ? "Sem tentativas" : `${resolvidos.length} de 4 grupos, ${plural(m, "erro", "erros")}`;
    return `<span class="mg mg-cx" role="img" aria-label="${rotulo}"><span class="cbs">${barras}</span><span class="cds">${pontos}</span></span>`;
  }
  const ms = s ? marks(gid) : [];
  const perdeu = s && s.status === "lost";
  const celulas = Array.from({ length: MAX }, (_, i) => {
    const x = ms[i];
    const c = !x ? "" : perdeu ? "bad" : x === "ok" ? "ok" : x === "near" ? "near" : "try";
    return `<i class="${c}"></i>`;
  }).join("");
  const rotulo = !ms.length ? "Sem tentativas" : perdeu ? `Não acertaste em ${MAX} tentativas` : s.status === "won" ? `Acertaste na tentativa ${ms.length}` : `${ms.length} tentativas feitas`;
  return `<span class="mg" role="img" aria-label="${rotulo}">${celulas}</span>`;
}

export function telaHub() {
  const n = edicao();
  const feitos = ORDER.filter((g) => isDone(peek(S.dia, g))).length;
  const todos = feitos === ORDER.length;
  const dia = dayState();
  const celebrar = todos && !dia.starSeen;
  const proximo = ORDER.find((g) => !isDone(peek(S.dia, g)));
  const jaComecou = proximo && tries(proximo, peek(S.dia, proximo) || { attempts: [], guesses: [], rows: [] }) > 0;

  const linha = (gid) => {
    const G = GAMES[gid];
    const [estado] = estadoDoCartao(gid);
    return `
    <button class="rw" data-go="${gid}" data-state="${estado}" style="${gv(G.color)}" aria-label="${G.name}. ${textoDoEstado(gid)}">
      <span class="glyph" aria-hidden="true">${ICONS[gid]}</span>
      <span class="rw-t"><span class="gname">${G.name}</span><span class="rw-s">${textoDoEstado(gid)}</span></span>
      <span class="rw-m"><span class="ch-wave">${ondaSVG(gid)}</span>${miniGrade(gid)}</span>
    </button>`;
  };

  main.innerHTML = `
  <div class="home">
    <h1 class="sr">Ruídos Mentais</h1>
    <section class="today" aria-label="Resumo do dia">
      <p class="dp-ed">Edição ${n}, ${dataPorExtenso(S.dia)}</p>
      <div class="today-main">
        <div class="dp-clock"><b class="roll-time" id="countdown">--:--:--</b><span>Novas cartas à meia-noite</span></div>
        <p class="today-prog ${todos ? "is-done" : ""}">${todos ? "Tudo feito hoje" : `${feitos} de ${ORDER.length} jogos`}</p>
      </div>
      <div class="today-w" role="img" aria-label="Sinal do dia: o ruído diminui a cada jogo concluído">${ondaDiaSVG()}</div>
    </section>
    ${
      proximo
        ? `<button class="bgc" id="btn-next" data-go="${proximo}" data-state="${jaComecou ? "play" : "new"}" style="${gv(GAMES[proximo].color)}">
      <span class="glyph glyph-lg" aria-hidden="true">${ICONS[proximo]}</span>
      <span class="bgc-t"><span class="gname gname-lg">${GAMES[proximo].name}</span><span class="bgc-d">${GAMES[proximo].desc}</span></span>
      <span class="btn accent bgc-cta">${jaComecou ? "Continuar" : "Jogar agora"}</span>
    </button>`
        : ""
    }
    <section class="rows" aria-label="Jogos de hoje">${ORDER.filter((g) => g !== proximo).map(linha).join("")}</section>
    ${todos ? `<div class="netbar done"><div class="nb-l"><div><h3 id="nb-h">Sequência: ${plural(globalStreak(), "dia", "dias")}</h3><p>Novas cartas à meia-noite</p></div></div><button class="btn ghost" id="btn-summary2">Ver resumo</button></div>` : ""}
  </div>`;

  main.querySelectorAll(".rw,.bgc").forEach((el) => {
    el.addEventListener("click", (e) => fx.open(el, () => go(el.dataset.go), e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : null));
  });
  const resumo = $("#btn-summary2");
  if (resumo) resumo.onclick = () => telaDe("resumo")();
  limparOndas();
  if (!UI.hubIntro) {
    UI.hubIntro = true;
    fx.intro();
  } else if (UI.enterFx) fx.settle([...main.querySelectorAll(".today,.bgc,.rw")], 14);
  if (celebrar) {
    dia.starSeen = 1;
    salvar();
    setTimeout(() => {
      const barra = $(".netbar.done");
      if (!barra) return;
      fx.decrypt($("#nb-h"), 900);
      fx.haptic("win");
      const b = barra.getBoundingClientRect();
      fx.burst(b.left + 40, b.top + 20, 22, 1.2);
    }, UI.enterFx ? 250 : 1800);
  }
  atualizarRelogio();
}
