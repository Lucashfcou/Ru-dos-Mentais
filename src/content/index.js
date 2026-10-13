// Conteúdo dos jogos. Os dados vivem em ficheiros JSON editáveis (ver CONTEUDO.md).
import diagnostico from "./diagnostico.json";
import quemDisse from "./quem-disse.json";
import conexoes from "./conexoes.json";
import termo from "./termo.json";
import { indexarRespostas } from "../lib/busca.js";

/** Diagnóstico: um caso por dia. `why` explica porque cada diagnóstico parecido está “perto”. */
export const DIAG = diagnostico.casos.map((c) => ({
  answer: c.answer,
  near: Object.keys(c.near),
  why: c.near,
  patient: c.patient,
  context: c.context,
  complaint: c.complaint,
  hints: c.hints,
  explain: c.explain,
  ref: c.ref,
}));
export const DIAG_RESPOSTAS = indexarRespostas(diagnostico.respostas);

/** Quem disse?: uma citação por dia. */
export const QUEM = quemDisse.citacoes.map((c) => ({
  answer: c.answer,
  near: c.near,
  quote: c.quote,
  hints: c.hints,
  explain: c.explain,
  ref: c.ref,
}));
export const AUTORES = Object.fromEntries(quemDisse.autores.map((a) => [a.id, a]));
export const QUEM_RESPOSTAS = indexarRespostas(quemDisse.autores.map((a) => [a.id, a.nome, a.aliases]));

/** Conexões: 4 grupos de 4 termos. */
export const CONEX = conexoes.desafios;

/** PsicoTermo: [palavra sem acento, título, definição]. */
export const TERMO = termo;

/** Palpites aceites no PsicoTermo: carregado só quando o jogo abre (é grande). */
let dicionario = null;
export async function carregarDicionario() {
  if (dicionario) return dicionario;
  const lista = (await import("./termo-validas.json")).default;
  dicionario = new Set(lista);
  return dicionario;
}
