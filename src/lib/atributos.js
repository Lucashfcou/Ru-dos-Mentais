// Quem disse?: compara o autor palpitado com o autor certo.

/**
 * @param a autor palpitado: {nacionalidade, nascimento, escola, familia}
 * @param t autor certo
 * @returns {{nacionalidade:"ok"|"no", nascimento:"ok"|"near"|"no", seta:""|"up"|"down", escola:"ok"|"near"|"no"}}
 *   seta "up": o autor certo nasceu depois; "down": nasceu antes.
 */
export function compararAutores(a, t) {
  const dif = t.nascimento - a.nascimento;
  return {
    nacionalidade: a.nacionalidade === t.nacionalidade ? "ok" : "no",
    nascimento: dif === 0 ? "ok" : Math.abs(dif) <= 10 ? "near" : "no",
    seta: dif > 0 ? "up" : dif < 0 ? "down" : "",
    escola: a.escola === t.escola ? "ok" : a.familia === t.familia ? "near" : "no",
  };
}
