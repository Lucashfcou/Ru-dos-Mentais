// A onda de cada jogo vem do resultado real: limpa quando se acerta depressa,
// ruidosa quando há muitos erros, interrompida quando se perde.
// Tudo determinístico: a mesma semente e o mesmo nível geram sempre o mesmo traço.
import { gerador } from "./texto.js";

export const ONDA = { L: 110, A: 44, N: 48 };

/**
 * Resume o estado de um jogo.
 * @param {{tentativas:number, status:string, erros:number, maxErros:number}|null} e
 * @returns {{tipo:"espera"|"perdeu"|"venceu"|"jogando", L:number, assinatura:string}}
 *   L: nível de ruído, de 0 (limpo) a 1 (ruidoso).
 */
export function especificarOnda(e) {
  if (!e || !e.tentativas) return { tipo: "espera", L: 1, assinatura: "espera" };
  if (e.status === "lost") return { tipo: "perdeu", L: 1, assinatura: "perdeu" + e.tentativas };
  const L = Math.min(1, e.erros / e.maxErros);
  return {
    tipo: e.status === "won" ? "venceu" : "jogando",
    L,
    assinatura: `${e.status}${e.tentativas}${e.erros}`,
  };
}

/** Série de alturas entre -1 e 1. */
export function alturas(L, semente, N = ONDA.N) {
  const r = gerador(semente);
  const fase = r() * 6.28;
  const fase2 = r() * 6.28;
  const ys = [];
  let passeio = 0;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const base = Math.sin(u * 6.28 * 1.5 + fase) * 0.55;
    passeio += (r() - 0.5) * 0.9 * L;
    passeio *= 0.72;
    const surto = Math.sin(u * 6.28 * 7 + fase2) * 0.28 * L;
    const env = 1 + L * 0.5 * Math.sin(u * 6.28 * 2.3 + fase2);
    ys.push(Math.max(-1, Math.min(1, base * env + surto + passeio * 1.1)));
  }
  return ys;
}

/** Caminho SVG a partir das alturas. */
export function caminho(ys, largura = ONDA.L, altura = ONDA.A) {
  const meio = altura / 2;
  const amp = altura * 0.42;
  const N = ys.length;
  return ys.map((y, i) => `${i ? "L" : "M"}${((i / (N - 1)) * largura).toFixed(1)} ${(meio + y * amp).toFixed(1)}`).join("");
}

/** Linha interrompida (jogo perdido). */
export const LINHA_PERDIDA = "M0 22H34M42 22H70M80 22H110";
export const LINHA_ESPERA = "M0 22H110";

/** Média do ruído de vários jogos (jogo ainda não jogado conta como ruído total). */
export function nivelDoDia(especificacoes) {
  return especificacoes.reduce((a, e) => a + e.L, 0) / especificacoes.length;
}
