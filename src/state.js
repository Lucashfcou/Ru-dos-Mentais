// Estado do jogador (guardado no navegador) e leitura do desafio do dia.
import { dataLisboa, numeroEdicao } from "./lib/tempo.js";
import { melhorGrupo, erros as errosConexoes } from "./lib/conexoes.js";
import { sequenciaGlobal, estatisticas, concluido } from "./lib/progresso.js";
import { marcas as marcasMito, pontuacao as pontosMito, erros as errosMito, TOTAL as TOTAL_MITO } from "./lib/mito.js";
import { ORDER, GAMES, desafioDe } from "./jogos.js";

const CHAVE = "ruidos-mentais:v1";
const CHAVE_ANTIGA = "psicogames:v1";

/** Acesso seguro: em abas privadas ou com dados bloqueados o navegador pode lançar erro. */
export const armazem = {
  ler(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  gravar(k, v) {
    try {
      localStorage.setItem(k, v);
      return true;
    } catch {
      return false;
    }
  },
};

function carregar() {
  let dados = null;
  for (const k of [CHAVE, CHAVE_ANTIGA]) {
    const bruto = armazem.ler(k);
    if (!bruto) continue;
    try {
      dados = JSON.parse(bruto);
      break;
    } catch {
      /* dados corrompidos: começa de novo */
    }
  }
  return sanearArmazem(dados);
}

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const STATUS = ["playing", "won", "lost"];
const ehObjeto = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const listaDe = (v, max, ok) => Array.isArray(v) && v.length <= max && v.every(ok);

/** Um jogo guardado só vale se tiver exatamente o formato que o jogo escreve. */
function estadoValido(gid, s, dia) {
  if (!ehObjeto(s) || !STATUS.includes(s.status)) return false;
  const G = GAMES[gid];
  if (G.type === "guess") return listaDe(s.guesses, MAX_ESTADO, (g) => g === "__skip" || (typeof g === "string" && Object.hasOwn(G.answers, g)));
  if (G.type === "termo") return listaDe(s.rows, MAX_ESTADO, (r) => typeof r === "string" && /^[A-Z]{5}$/.test(r));
  if (G.type === "mito") return listaDe(s.escolhas, 5, (e) => e === "mito" || e === "verdade");
  if (G.type === "conex") {
    const termos = desafioDe("conex", numeroEdicao(dia)).groups.flatMap((g) => g.words);
    const certo = (t) => typeof t === "string" && termos.includes(t);
    const ordemOk = s.order === null || (listaDe(s.order, 16, certo) && s.order.length === 16 && new Set(s.order).size === 16);
    return (
      ordemOk &&
      listaDe(s.attempts, 20, (a) => Array.isArray(a) && a.length === 4 && a.every(certo)) &&
      listaDe(s.solved, 4, (i) => Number.isInteger(i) && i >= 0 && i < 4) &&
      new Set(s.solved).size === s.solved.length
    );
  }
  return false;
}
const MAX_ESTADO = 6;

/**
 * O que está no armazenamento do navegador pode estar corrompido ou ter sido mexido à mão.
 * Aqui só passa o que o jogo reconhece: o resto é descartado, para nunca travar a tela
 * nem entrar HTML estranho nos modelos.
 */
export function sanearArmazem(dados) {
  const d = ehObjeto(dados) ? dados : {};
  const s = { days: {}, seen: {} };
  if (d.theme === "dark" || d.theme === "light") s.theme = d.theme;
  if (ehObjeto(d.seen)) for (const k of Object.keys(d.seen)) if (k !== "__proto__" && d.seen[k] === 1) s.seen[k] = 1;
  if (ehObjeto(d.waveSeen)) {
    s.waveSeen = {};
    for (const k of Object.keys(d.waveSeen)) if (k !== "__proto__" && typeof d.waveSeen[k] === "string" && d.waveSeen[k].length < 80) s.waveSeen[k] = d.waveSeen[k];
  }
  if (ehObjeto(d.days)) {
    for (const dia of Object.keys(d.days)) {
      if (!DIA.test(dia) || !ehObjeto(d.days[dia])) continue;
      const jogos = {};
      for (const gid of ORDER) {
        const e = d.days[dia][gid];
        if (e !== undefined && estadoValido(gid, e, dia)) jogos[gid] = e;
      }
      if (d.days[dia].starSeen === 1) jogos.starSeen = 1;
      s.days[dia] = jogos;
    }
  }
  return s;
}

/** Estado compartilhado: `store` (guardado) e `dia` (data de Lisboa que está a ser jogada). */
export const S = { store: carregar(), dia: dataLisboa() };

export const salvar = () => armazem.gravar(CHAVE, JSON.stringify(S.store));

export const edicao = () => numeroEdicao(S.dia);
export const dayState = () => (S.store.days[S.dia] = S.store.days[S.dia] || {});
export const peek = (k, gid) => S.store.days[k] && S.store.days[k][gid];
export const isDone = concluido;

const novoEstado = (gid) =>
  gid === "termo"
    ? { rows: [], status: "playing" }
    : gid === "conex"
      ? { attempts: [], solved: [], order: null, status: "playing" }
      : gid === "mito"
        ? { escolhas: [], status: "playing" }
        : { guesses: [], status: "playing" };

export const gstate = (gid) => {
  const d = dayState();
  return (d[gid] = d[gid] || novoEstado(gid));
};

/** Desafio de hoje para o jogo. */
export const puzzle = (gid) => desafioDe(gid, edicao());

export const accepts = (P) => P.accept || [P.answer];
export function judge(P, g) {
  if (g === "__skip") return "skip";
  if (accepts(P).includes(g)) return "ok";
  if ((P.near || []).includes(g)) return "near";
  return "wrong";
}

export const tries = (gid, s) => (gid === "termo" ? s.rows.length : gid === "conex" ? s.attempts.length : gid === "mito" ? s.escolhas.length : s.guesses.length);

/** Mito ou verdade: respostas certas e erradas de um dia guardado. */
export const mitoPontos = (s, k) => pontosMito(desafioDe("mito", numeroEdicao(k || S.dia)).itens, s.escolhas);
export const mitoErros = (s, k) => errosMito(desafioDe("mito", numeroEdicao(k || S.dia)).itens, s.escolhas);
export const cxMistakes = (P, s) => errosConexoes(P, s.attempts);

/** Estado de cada tentativa: usado nos quadradinhos e na partilha. */
export function marks(gid) {
  const s = peek(S.dia, gid);
  if (!s) return [];
  const P = puzzle(gid);
  if (gid === "termo") return s.rows.map((r) => (r === P[0] ? "ok" : "wrong"));
  if (gid === "mito") return marcasMito(P.itens, s.escolhas);
  if (gid === "conex") return s.attempts.map((a) => ((b) => (b === 4 ? "ok" : b === 3 ? "near" : "wrong"))(melhorGrupo(P, a)));
  return s.guesses.map((g) => judge(P, g));
}

export const statsFor = (gid) =>
  estatisticas(S.store.days, gid, S.dia, (s, k) =>
    gid === "conex" ? errosConexoes(desafioDe("conex", numeroEdicao(k)), s.attempts) : gid === "mito" ? mitoErros(s, k) : tries(gid, s) - 1,
  );

export const globalStreak = () => sequenciaGlobal(S.store.days, S.dia, ORDER);

export { GAMES, ORDER };

/** Placar curto de um jogo concluído: “3/6”, “X/6”, “2 erros”, “X/4”. */
export function rotuloPlacar(gid, s) {
  if (gid === "mito") return `${mitoPontos(s)}/${TOTAL_MITO}`;
  if (gid === "conex") {
    const m = cxMistakes(puzzle("conex"), s);
    return s.status === "won" ? `${m} ${m === 1 ? "erro" : "erros"}` : "X/4";
  }
  return s.status === "won" ? `${tries(gid, s)}/6` : "X/6";
}
