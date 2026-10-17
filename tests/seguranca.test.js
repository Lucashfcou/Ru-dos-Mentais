// Segurança: o estado guardado no navegador pode vir corrompido ou adulterado.
// O jogo nunca pode travar nem escrever HTML a partir dele.
import { describe, it, expect } from "vitest";
import { sanearArmazem } from "../src/state.js";

const dia = "2026-10-16";

describe("estado guardado", () => {
  it("lixo que não é objeto vira estado vazio", () => {
    for (const lixo of [null, undefined, 5, "texto", [], true]) {
      const s = sanearArmazem(lixo);
      expect(s.days).toEqual({});
      expect(s.seen).toEqual({});
    }
  });

  it("descarta jogos com formato errado e mantém os válidos", () => {
    const s = sanearArmazem({
      days: {
        [dia]: {
          diag: { guesses: ["__skip"], status: "playing" },
          termo: { rows: "abc", status: "playing" },
          quem: { guesses: [{ x: 1 }], status: "playing" },
          mito: { escolhas: ["mito", "verdade"], status: "playing" },
          conex: { attempts: "x", solved: [], order: null, status: "playing" },
          inventado: { qualquer: 1 },
        },
        "<img src=x onerror=alert(1)>": { diag: { guesses: [], status: "playing" } },
      },
    });
    const d = s.days[dia];
    expect(d.diag).toBeTruthy();
    expect(d.mito.escolhas).toEqual(["mito", "verdade"]);
    expect(d.termo).toBeUndefined();
    expect(d.quem).toBeUndefined();
    expect(d.conex).toBeUndefined();
    expect(d.inventado).toBeUndefined();
    expect(Object.keys(s.days)).toEqual([dia]);
  });

  it("não aceita HTML nas palavras do Termo nem respostas desconhecidas", () => {
    const s = sanearArmazem({
      days: { [dia]: { termo: { rows: ["<b>AA</b>"], status: "playing" }, diag: { guesses: ["<script>"], status: "playing" } } },
    });
    expect(s.days[dia]).toEqual({});
  });

  it("limites: nada de listas enormes nem estados inventados", () => {
    const s = sanearArmazem({
      days: { [dia]: { mito: { escolhas: Array(500).fill("mito"), status: "playing" }, termo: { rows: ["FOBIA"], status: "hacker" } } },
    });
    expect(s.days[dia].mito).toBeUndefined();
    expect(s.days[dia].termo).toBeUndefined();
  });

  it("tema e marcadores só aceitam valores esperados", () => {
    const s = sanearArmazem({ theme: "<x>", seen: { hub: 1, "__proto__": 1, "x": "y" }, waveSeen: { a: "b", c: 5 } });
    expect(s.theme).toBeUndefined();
    expect(s.seen).toEqual({ hub: 1 });
    expect(s.waveSeen).toEqual({ a: "b" });
    expect(Object.prototype.polluted).toBeUndefined();
  });

  it("não deixa poluir o protótipo", () => {
    sanearArmazem(JSON.parse('{"__proto__":{"polluted":true},"days":{"__proto__":{"polluted":true}}}'));
    expect({}.polluted).toBeUndefined();
  });
});
