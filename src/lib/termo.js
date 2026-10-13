// Regras do PsicoTermo.
import { normalizar } from "./texto.js";

export const TAMANHO = 5;
export const TENTATIVAS = 6;

/**
 * Compara um palpite com a resposta (ambos em maiúsculas, sem acento).
 * Devolve, por letra: "c" certa no lugar, "p" existe noutra posição, "a" ausente.
 * Letras repetidas só são marcadas tantas vezes quantas existem na resposta.
 */
export function avaliar(palpite, resposta) {
  const res = Array(TAMANHO).fill("a");
  const sobra = {};
  for (let i = 0; i < TAMANHO; i++) {
    if (palpite[i] === resposta[i]) res[i] = "c";
    else sobra[resposta[i]] = (sobra[resposta[i]] || 0) + 1;
  }
  for (let i = 0; i < TAMANHO; i++) {
    if (res[i] !== "c" && sobra[palpite[i]]) {
      res[i] = "p";
      sobra[palpite[i]]--;
    }
  }
  return res;
}

/** Melhor estado já visto para cada letra do teclado. */
export function estadoDasTeclas(palpites, resposta) {
  const estado = {};
  const rank = { a: 1, p: 2, c: 3 };
  for (const p of palpites) {
    const e = avaliar(p, resposta);
    [...p].forEach((ch, i) => {
      if (!estado[ch] || rank[e[i]] > rank[estado[ch]]) estado[ch] = e[i];
    });
  }
  return estado;
}

/** "PSICÓLOGO" -> "PSICOLOGO". Só letras A-Z. */
export function paraLetras(palavra) {
  return normalizar(palavra).replace(/ /g, "").toUpperCase();
}

/** O palpite é uma palavra aceita? Procura no dicionário e nas respostas. */
export function palavraValida(palpite, dicionario, respostas = []) {
  if (palpite.length !== TAMANHO || !/^[A-Z]+$/.test(palpite)) return false;
  const min = palpite.toLowerCase();
  return dicionario.has(min) || respostas.includes(palpite);
}

/**
 * Entrada livre das casas: o jogador escolhe a casa e a letra.
 * `casas` é uma lista de 5 posições (letra ou ""), `sel` a casa escolhida.
 */
export function colocarLetra(casas, sel, letra) {
  const novas = casas.slice();
  novas[sel] = letra;
  // vai para a próxima casa vazia à direita; se não houver, para a primeira vazia
  let prox = -1;
  for (let i = sel + 1; i < TAMANHO && prox < 0; i++) if (!novas[i]) prox = i;
  for (let i = 0; i < TAMANHO && prox < 0; i++) if (!novas[i]) prox = i;
  return { casas: novas, sel: prox < 0 ? sel : prox };
}

export function apagarLetra(casas, sel) {
  const novas = casas.slice();
  if (novas[sel]) {
    novas[sel] = "";
    return { casas: novas, sel };
  }
  const ant = Math.max(0, sel - 1);
  novas[ant] = "";
  return { casas: novas, sel: ant };
}

export const casasVazias = () => Array(TAMANHO).fill("");
