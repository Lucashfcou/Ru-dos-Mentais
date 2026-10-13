import { describe, it, expect } from "vitest";
import { sequenciaGlobal, estatisticas, concluido } from "../src/lib/progresso.js";
import { erros, melhorGrupo, repetida } from "../src/lib/conexoes.js";

const J = ["a", "b"];
const ganho = { status: "won" };
const dia = { a: ganho, b: ganho };

describe("sequência global", () => {
  it("conta dias completos seguidos", () => {
    expect(sequenciaGlobal({ "2026-10-11": dia, "2026-10-12": dia, "2026-10-13": dia }, "2026-10-13", J)).toBe(3);
  });
  it("hoje incompleto não quebra a sequência", () => {
    expect(sequenciaGlobal({ "2026-10-12": dia, "2026-10-13": { a: ganho } }, "2026-10-13", J)).toBe(1);
  });
  it("um dia em falta quebra", () => {
    expect(sequenciaGlobal({ "2026-10-10": dia, "2026-10-13": dia }, "2026-10-13", J)).toBe(1);
  });
  it("jogo em curso não conta como concluído", () => {
    expect(concluido({ status: "playing" })).toBe(false);
    expect(concluido(undefined)).toBe(false);
  });
});

describe("estatísticas", () => {
  const dias = {
    "2026-10-10": { a: { status: "won", n: 2 } },
    "2026-10-11": { a: { status: "won", n: 4 } },
    "2026-10-12": { a: { status: "lost", n: 6 } },
    "2026-10-13": { a: { status: "won", n: 3 } },
  };
  const st = estatisticas(dias, "a", "2026-10-13", (s) => s.n - 1);
  it("totais", () => {
    expect(st.jogados).toBe(4);
    expect(st.vitorias).toBe(3);
  });
  it("recorde e sequência atual", () => {
    expect(st.recorde).toBe(2);
    expect(st.atual).toBe(1);
  });
  it("distribuição", () => {
    expect(st.dist).toEqual([0, 1, 1, 1, 0, 0]);
  });
});

describe("conexões", () => {
  const d = { groups: [{ words: ["a1", "a2", "a3", "a4"] }, { words: ["b1", "b2", "b3", "b4"] }] };
  it("grupo certo e errado", () => {
    expect(melhorGrupo(d, ["a1", "a2", "a3", "a4"])).toBe(4);
    expect(melhorGrupo(d, ["a1", "a2", "a3", "b1"])).toBe(3);
    expect(erros(d, [["a1", "a2", "a3", "b1"], ["b1", "b2", "b3", "b4"]])).toBe(1);
  });
  it("tentativa repetida ignora a ordem", () => {
    expect(repetida([["a", "b", "c", "d"]], ["d", "c", "b", "a"])).toBe(true);
    expect(repetida([["a", "b", "c", "d"]], ["a", "b", "c", "e"])).toBe(false);
  });
});
