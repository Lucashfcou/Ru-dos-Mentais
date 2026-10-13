// Regras das Conexões.

/** Índice do grupo a que o termo pertence (-1 se não existir). */
export function grupoDe(desafio, termo) {
  return desafio.groups.findIndex((g) => g.words.includes(termo));
}

/** Maior número de termos da tentativa que caem no mesmo grupo (4 = grupo certo). */
export function melhorGrupo(desafio, tentativa) {
  const c = {};
  for (const w of tentativa) {
    const g = grupoDe(desafio, w);
    c[g] = (c[g] || 0) + 1;
  }
  return Math.max(...Object.values(c));
}

/** Nº de tentativas erradas (menos de 4 no mesmo grupo). */
export function erros(desafio, tentativas) {
  return tentativas.filter((t) => melhorGrupo(desafio, t) < 4).length;
}

export const MAX_ERROS = 4;

/** Tentativa já feita antes, ignorando a ordem dos termos. */
export function repetida(tentativas, nova) {
  const chave = (t) => t.slice().sort().join("|");
  const k = chave(nova);
  return tentativas.some((t) => chave(t) === k);
}
