import { describe, it, expect } from "vitest";
import { acertou, marcas, pontuacao, erros, estadoFinal, TOTAL, MINIMO } from "../src/lib/mito.js";
import { paraBR } from "../src/lib/br.js";
import dados from "../src/content/mito-verdade.json";

const itens = [
  { texto: "a", verdade: true },
  { texto: "b", verdade: false },
  { texto: "c", verdade: true },
  { texto: "d", verdade: false },
  { texto: "e", verdade: true },
];

describe("Mito ou verdade: regras", () => {
  it("avalia cada resposta", () => {
    expect(acertou(itens[0], "verdade")).toBe(true);
    expect(acertou(itens[0], "mito")).toBe(false);
    expect(acertou(itens[1], "mito")).toBe(true);
  });
  it("conta pontos, erros e marcas", () => {
    const e = ["verdade", "mito", "mito", "verdade", "verdade"]; // ok ok x x ok
    expect(marcas(itens, e)).toEqual(["ok", "ok", "wrong", "wrong", "ok"]);
    expect(pontuacao(itens, e)).toBe(3);
    expect(erros(itens, e)).toBe(2);
  });
  it("só termina às cinco respostas; 3 ou mais certas é vitória", () => {
    expect(estadoFinal(itens, ["verdade", "mito"])).toBe("playing");
    expect(estadoFinal(itens, ["verdade", "mito", "verdade", "mito", "verdade"])).toBe("won");
    expect(estadoFinal(itens, ["verdade", "mito", "mito", "verdade", "mito"])).toBe("lost"); // 2 certas
    expect(MINIMO).toBe(3);
    expect(TOTAL).toBe(5);
  });
});

describe("Mito ou verdade: conteúdo", () => {
  it("tem 30 dias de 5 afirmações, com 2 ou 3 verdades por dia", () => {
    expect(dados.dias).toHaveLength(30);
    for (const d of dados.dias) {
      expect(d.itens).toHaveLength(5);
      const v = d.itens.filter((x) => x.verdade).length;
      expect(v === 2 || v === 3).toBe(true);
    }
  });
  it("cada afirmação tem explicação e fonte", () => {
    for (const d of dados.dias) for (const x of d.itens) {
      expect(typeof x.verdade).toBe("boolean");
      expect(x.explicacao.length).toBeGreaterThan(20);
      expect(x.ref.length).toBeGreaterThan(10);
    }
  });
  it("na versão brasileira não ficam europeísmos óbvios", () => {
    const todos = dados.dias.flatMap((d) => d.itens).map((x) => paraBR(x.texto + " " + x.explicacao)).join(" ");
    expect(todos).not.toMatch(/perturba[çc]/i);
    expect(todos).not.toMatch(/\bstress/i);
    expect(todos).not.toMatch(/\bmeta-an/i);
    expect(todos).not.toMatch(/\bpercentagem/i);
  });
});
