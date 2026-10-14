// Conteúdo dos jogos. Os dados vivem em ficheiros JSON editáveis (ver CONTEUDO.md).
import diagnosticoPT from "./diagnostico.json";
import quemDissePT from "./quem-disse.json";
import conexoesPT from "./conexoes.json";
import termoPT from "./termo.json";
import mitoPT from "./mito-verdade.json";
import { indexarRespostas } from "../lib/busca.js";
import { BR } from "../lib/locale.js";
import { paraBR, traduzirDados } from "../lib/br.js";

// No Brasil o texto é adaptado ao português brasileiro; os identificadores não mudam.
const diagnostico = BR ? adaptarDiagnostico(diagnosticoPT) : diagnosticoPT;
const quemDisse = BR ? traduzirDados(quemDissePT) : quemDissePT;
const conexoes = BR ? traduzirDados(conexoesPT) : conexoesPT;
const mitoVerdade = BR ? traduzirDados(mitoPT) : mitoPT;
const termo = BR ? termoPT.map(([p, titulo, def]) => [p, paraBR(titulo), paraBR(def)]) : termoPT;

function adaptarDiagnostico(d) {
  const t = traduzirDados(d);
  // quem escreve o nome europeu ("perturbação") continua a encontrar a resposta
  t.respostas = d.respostas.map(([id, nome, apelidos = []], i) => {
    const [, nomeBR] = t.respostas[i];
    return [id, nomeBR, nomeBR === nome ? apelidos : [...apelidos, nome]];
  });
  return t;
}

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

/** Mito ou verdade: cinco afirmações por dia. */
export const MITO = mitoVerdade.dias;

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
