// Sequências e estatísticas, calculadas só a partir dos dados guardados.
import { somarDias } from "./tempo.js";

export const concluido = (s) => !!s && s.status !== "playing";

/**
 * Dias seguidos em que todos os jogos foram concluídos.
 * Se hoje ainda não está completo, a contagem parte de ontem (a sequência não quebra até a meia-noite).
 */
export function sequenciaGlobal(dias, hoje, jogos) {
  const completo = (k) => !!dias[k] && jogos.every((g) => concluido(dias[k][g]));
  let n = 0;
  let d = hoje;
  if (!completo(d)) d = somarDias(d, -1);
  while (completo(d)) {
    n++;
    d = somarDias(d, -1);
  }
  return n;
}

/**
 * Estatísticas de um jogo.
 * @param {(s:object,dia:string)=>number} indiceDoResultado posição na distribuição quando venceu
 *   (tentativas-1 nos jogos de palpite, nº de erros nas Conexões).
 */
export function estatisticas(dias, gid, hoje, indiceDoResultado) {
  const chaves = Object.keys(dias).sort();
  let jogados = 0, vitorias = 0, recorde = 0, seq = 0, anterior = null;
  const dist = [0, 0, 0, 0, 0, 0];
  for (const k of chaves) {
    const s = dias[k][gid];
    if (!concluido(s)) continue;
    jogados++;
    if (s.status === "won") {
      vitorias++;
      const i = indiceDoResultado(s, k);
      if (i >= 0 && i < dist.length) dist[i]++;
      seq = anterior && somarDias(anterior, 1) === k ? seq + 1 : 1;
      anterior = k;
      recorde = Math.max(recorde, seq);
    } else {
      seq = 0;
      anterior = null;
    }
  }
  let atual = 0;
  let d = hoje;
  if (!concluido(dias[d] && dias[d][gid])) d = somarDias(d, -1);
  while (dias[d] && dias[d][gid] && dias[d][gid].status === "won") {
    atual++;
    d = somarDias(d, -1);
  }
  return { jogados, vitorias, dist, atual, recorde };
}
