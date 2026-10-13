import { describe, it, expect } from "vitest";
import { avaliar, estadoDasTeclas, paraLetras, palavraValida, colocarLetra, apagarLetra, casasVazias } from "../src/lib/termo.js";

describe("avaliar", () => {
  it("marca certas, existentes e ausentes", () => {
    expect(avaliar("FOBIA", "FOBIA")).toEqual(["c", "c", "c", "c", "c"]);
    expect(avaliar("AFOBI", "FOBIA")).toEqual(["p", "p", "p", "p", "p"]);
    expect(avaliar("XXXXX", "FOBIA")).toEqual(["a", "a", "a", "a", "a"]);
  });
  it("letras repetidas só contam tantas vezes quantas existem", () => {
    expect(avaliar("AAAAB", "ABCDE")).toEqual(["c", "a", "a", "a", "p"]);
    expect(avaliar("ALIAS", "ABCDA")).toEqual(["c", "a", "a", "p", "a"]);
  });
});

describe("teclado", () => {
  it("guarda o melhor estado de cada letra", () => {
    const e = estadoDasTeclas(["AFOBI", "FOBIA"], "FOBIA");
    expect(e.F).toBe("c");
    expect(e.A).toBe("c");
  });
});

describe("palavras", () => {
  it("tira acentos e espaços", () => {
    expect(paraLetras("Tédio")).toBe("TEDIO");
  });
  it("aceita palavras do dicionário e as respostas, rejeita o resto", () => {
    const dic = new Set(["casal", "tedio"]);
    expect(palavraValida("CASAL", dic)).toBe(true);
    expect(palavraValida("FOBIA", dic, ["FOBIA"])).toBe(true);
    expect(palavraValida("ZZZZZ", dic)).toBe(false);
    expect(palavraValida("CASA", dic)).toBe(false);
    expect(palavraValida("CAS4L", dic)).toBe(false);
  });
});

describe("entrada livre das casas", () => {
  it("escolher a 3.ª casa e a última", () => {
    let r = colocarLetra(casasVazias(), 2, "C");
    expect(r.casas).toEqual(["", "", "C", "", ""]);
    r = colocarLetra(r.casas, 4, "A");
    expect(r.casas).toEqual(["", "", "C", "", "A"]);
    expect(r.sel).toBe(0); // vai para a primeira casa vazia
  });
  it("avança para a próxima casa vazia à direita", () => {
    expect(colocarLetra(casasVazias(), 0, "F").sel).toBe(1);
  });
  it("com tudo preenchido mantém a casa", () => {
    expect(colocarLetra(["A", "B", "C", "D", ""], 4, "E").sel).toBe(4);
  });
  it("apagar limpa a casa escolhida, ou recua", () => {
    expect(apagarLetra(["A", "B", "", "", ""], 1)).toEqual({ casas: ["A", "", "", "", ""], sel: 1 });
    expect(apagarLetra(["A", "B", "", "", ""], 2)).toEqual({ casas: ["A", "", "", "", ""], sel: 1 });
  });
  it("não altera o array original", () => {
    const c = casasVazias();
    colocarLetra(c, 1, "X");
    expect(c).toEqual(["", "", "", "", ""]);
  });
});
