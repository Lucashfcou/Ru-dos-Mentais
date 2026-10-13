import { describe, it, expect } from "vitest";
import { dataLisboa, somarDias, diasEntre, numeroEdicao, escolher, msAteMeiaNoite, relogio, dataPorExtenso } from "../src/lib/tempo.js";

describe("fuso de Lisboa", () => {
  it("a data muda à meia-noite de Lisboa (verão, UTC+1)", () => {
    expect(dataLisboa(new Date("2026-07-10T22:59:59Z"))).toBe("2026-07-10");
    expect(dataLisboa(new Date("2026-07-10T23:00:00Z"))).toBe("2026-07-11");
  });
  it("a data muda à meia-noite de Lisboa (inverno, UTC+0)", () => {
    expect(dataLisboa(new Date("2026-12-10T23:59:59Z"))).toBe("2026-12-10");
    expect(dataLisboa(new Date("2026-12-11T00:00:00Z"))).toBe("2026-12-11");
  });
});

describe("calendário", () => {
  it("soma dias entre meses e anos", () => {
    expect(somarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(somarDias("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("conta dias e edições", () => {
    expect(diasEntre("2026-10-01", "2026-10-13")).toBe(12);
    expect(numeroEdicao("2026-10-01", "2026-10-01")).toBe(1);
    expect(numeroEdicao("2026-10-13", "2026-10-01")).toBe(13);
  });
  it("escolhe recomeçando do início", () => {
    const l = ["a", "b", "c"];
    expect([1, 2, 3, 4, 7].map((n) => escolher(l, n))).toEqual(["a", "b", "c", "a", "a"]);
  });
});

describe("contagem decrescente", () => {
  it("meio-dia em Lisboa: 12 h", () => {
    const ms = msAteMeiaNoite(new Date("2026-07-10T11:00:00Z")); // 12:00 em Lisboa
    expect(Math.abs(ms - 12 * 3600e3)).toBeLessThan(500);
  });
  it("dia de mudança de hora de primavera tem 23 h", () => {
    const ms = msAteMeiaNoite(new Date("2026-03-29T00:00:00Z")); // 00:00 Lisboa, relógio avança à 01:00
    expect(Math.abs(ms - 23 * 3600e3)).toBeLessThan(500);
  });
  it("dia de mudança de hora de outono tem 25 h", () => {
    const ms = msAteMeiaNoite(new Date("2026-10-24T23:00:00Z")); // 00:00 Lisboa a 25 de outubro
    expect(Math.abs(ms - 25 * 3600e3)).toBeLessThan(500);
  });
  it("formata hh:mm:ss", () => {
    expect(relogio(3661000)).toBe("01:01:01");
  });
});

describe("texto da data", () => {
  it("em português europeu, sem -feira", () => {
    expect(dataPorExtenso("2026-10-13")).toBe("terça, 13 de outubro");
  });
});
