import { describe, it, expect } from "vitest";
import { validar } from "../scripts/validar-conteudo.mjs";
import termoValidas from "../src/content/termo-validas.json";
import termo from "../src/content/termo.json";

describe("conteúdo", () => {
  const r = validar();
  it("não tem erros", () => {
    expect(r.erros).toEqual([]);
  });
  it("cumpre as metas da base de um mês", () => {
    expect(r.contagens.diagnostico).toBeGreaterThanOrEqual(30);
    expect(r.contagens.quemDisse).toBeGreaterThanOrEqual(30);
    expect(r.contagens.conexoes).toBeGreaterThanOrEqual(30);
    expect(r.contagens.termo).toBeGreaterThanOrEqual(150);
  });
  it("todas as respostas do PsicoTermo têm 5 letras A-Z", () => {
    for (const [p] of termo) expect(p).toMatch(/^[A-Z]{5}$/);
  });
  it("o dicionário de palpites contém todas as respostas", () => {
    const d = new Set(termoValidas);
    for (const [p] of termo) expect(d.has(p.toLowerCase())).toBe(true);
  });
  it("o dicionário só tem palavras de 5 letras minúsculas", () => {
    for (const p of termoValidas) expect(p).toMatch(/^[a-z]{5}$/);
  });
});
