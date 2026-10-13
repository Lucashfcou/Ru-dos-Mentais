// Utilitários de texto, sem dependência do navegador.

/** Minúsculas, sem acentos nem pontuação, com espaços simples. Serve para comparar e buscar. */
export function normalizar(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** "1 dia" / "3 dias" */
export function plural(n, um, varios) {
  return `${n} ${n === 1 ? um : varios}`;
}

/** Hash de texto (FNV-1a de 32 bits), usado como semente. */
export function hashTexto(s) {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Gerador pseudoaleatório determinístico (mulberry32). */
export function gerador(semente) {
  let a = semente | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Embaralha sem alterar a lista original. */
export function embaralhar(lista, aleatorio = Math.random) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
