// Busca com autocompletar, ignorando acentos e maiúsculas.
import { normalizar } from "./texto.js";

/** Prepara a lista de respostas: [id, nome, [apelidos]] -> mapa por id. */
export function indexarRespostas(lista) {
  return Object.fromEntries(
    lista.map(([id, nome, apelidos = []]) => [id, { id, name: nome, n: normalizar(nome), al: apelidos.map(normalizar) }]),
  );
}

/**
 * Procura por prefixo do nome, prefixo de uma palavra, trecho do nome ou apelido, nesta ordem.
 * @returns lista de até `max` respostas.
 */
export function buscar(respostas, consulta, excluir = [], max = 7) {
  const q = normalizar(consulta);
  if (!q) return [];
  const achados = [];
  for (const a of Object.values(respostas)) {
    if (excluir.includes(a.id)) continue;
    let peso = -1;
    if (a.n.startsWith(q)) peso = 0;
    else if (a.n.split(" ").some((w) => w.startsWith(q))) peso = 1;
    else if (a.n.includes(q)) peso = 2;
    else if (a.al.some((x) => x.includes(q))) peso = 3;
    if (peso >= 0) achados.push([peso, a]);
  }
  return achados
    .sort((x, y) => x[0] - y[0] || x[1].name.localeCompare(y[1].name, "pt-PT"))
    .slice(0, max)
    .map((x) => x[1]);
}

/** Resposta cujo nome ou apelido bate exatamente com o texto digitado. */
export function exata(respostas, texto, excluir = []) {
  const q = normalizar(texto);
  return Object.values(respostas).find((a) => (a.n === q || a.al.includes(q)) && !excluir.includes(a.id));
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Marca o trecho digitado no nome (só quando a normalização não muda o tamanho do texto). */
export function destacar(nome, consulta) {
  const q = normalizar(consulta);
  const nn = normalizar(nome);
  const i = nn.indexOf(q);
  if (i < 0 || !q || nn.length !== nome.length) return esc(nome);
  return esc(nome.slice(0, i)) + "<mark>" + esc(nome.slice(i, i + q.length)) + "</mark>" + esc(nome.slice(i + q.length));
}
