// Configuração dos jogos e textos das regras.
import { DIAG, DIAG_RESPOSTAS, QUEM, QUEM_RESPOSTAS, CONEX, TERMO } from "./content/index.js";
import { escolher } from "./lib/tempo.js";

/** Ordem em que os jogos aparecem. */
export const ORDER = ["diag", "termo", "quem", "conex"];
export const MAX = 6;

export const GAMES = {
  diag: {
    id: "diag", name: "Diagnóstico", kicker: "Caso clínico", color: "--diag", type: "guess", base: 0,
    desc: "Lê a ficha clínica fictícia e chega ao diagnóstico (DSM-5-TR).",
    hintLabel: "Anotação", placeholder: "Escreve uma perturbação…", answers: DIAG_RESPOSTAS, puzzles: DIAG, share: "🩺",
    rules: "Lê a ficha do caso fictício e descobre o diagnóstico segundo o DSM-5-TR. Cada erro acrescenta uma anotação clínica mais específica. Amarelo indica um diagnóstico diferencial próximo, com uma explicação do que o separa da resposta certa.",
  },
  termo: {
    id: "termo", name: "PsicoTermo", kicker: "Palavra do dia", color: "--termo", type: "termo",
    desc: "Um termo da psicologia com 5 letras e 6 tentativas.",
    puzzles: TERMO, share: "🔤",
    rules: "Descobre o termo de psicologia de 5 letras em 6 tentativas. Podes tentar qualquer palavra do dicionário. Toca numa casa para escolher onde fica cada letra: por exemplo, a terceira é C e a última é A. Verde: letra certa no sítio certo. Amarelo: a letra existe, mas noutra posição. Cinzento: a letra não está na palavra. Os acentos são ignorados.",
  },
  quem: {
    id: "quem", name: "Quem disse?", kicker: "Citação do dia", color: "--quem", type: "guess", base: 0,
    desc: "Uma frase célebre da psicologia. De quem é?",
    hintLabel: "Pista", placeholder: "Escreve um autor…", answers: QUEM_RESPOSTAS, puzzles: QUEM, share: "💬",
    rules: "Lê a citação e descobre quem a disse. Cada erro revela uma pista: época, escola, obra e conceitos. Cada palpite mostra a nacionalidade, o ano de nascimento e a escola do autor que escolheste, comparados com o autor certo: verde é igual, amarelo é parecido (mesma família de escolas, ou nascimento com até 10 anos de diferença) e cinzento é diferente. A seta no ano mostra se o autor da frase nasceu depois (↑) ou antes (↓).",
  },
  conex: {
    id: "conex", name: "Conexões", kicker: "Quatro grupos", color: "--conex", type: "conex",
    desc: "Encontra os 4 grupos escondidos entre 16 termos.",
    puzzles: CONEX, share: "🧩",
    rules: "Seleciona 4 termos que tenham algo em comum e envia. Há 4 grupos, do mais fácil (amarelo) ao mais difícil (roxo). Cuidado com as armadilhas: alguns termos parecem caber em mais de um grupo. Podes errar 4 vezes.",
  },
};

/** Desafio do jogo para a edição n. */
export const desafioDe = (gid, n) => escolher(GAMES[gid].puzzles, n);
