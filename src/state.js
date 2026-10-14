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
  const s = dados && typeof dados === "object" ? dados : {};
  s.days = s.days && typeof s.days === "object" ? s.days : {};
  s.seen = s.seen || {};
  delete s.free;
  delete s.off;
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
