// Regras de «Mito ou verdade»: cinco afirmações por dia, três certas ou mais contam como vitória.

export const TOTAL = 5;
export const MINIMO = 3;

/** A escolha ("mito" ou "verdade") está certa para esta afirmação? */
export const acertou = (item, escolha) => (escolha === "verdade") === !!item.verdade;

/** Marca de cada resposta dada: "ok" ou "wrong". */
export const marcas = (itens, escolhas) => escolhas.map((e, i) => (acertou(itens[i], e) ? "ok" : "wrong"));

export const pontuacao = (itens, escolhas) => marcas(itens, escolhas).filter((m) => m === "ok").length;

/** Respostas erradas até agora. */
export const erros = (itens, escolhas) => escolhas.length - pontuacao(itens, escolhas);

/** "playing" até responder às cinco; depois "won" (3 ou mais certas) ou "lost". */
export function estadoFinal(itens, escolhas) {
  if (escolhas.length < TOTAL) return "playing";
  return pontuacao(itens, escolhas) >= MINIMO ? "won" : "lost";
}
