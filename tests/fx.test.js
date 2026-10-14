import { describe, it, expect, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";

vi.hoisted(() => {
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
});

describe("fx", () => {
  it("todos os fx.metodo() usados na interface existem", async () => {
    const { fx } = await import("../src/fx.js");
    const usados = new Set();
    const ficheiros = readdirSync("src/ui").map((f) => `src/ui/${f}`).concat(["src/main.js", "src/state.js"]);
    for (const f of ficheiros) {
      for (const m of readFileSync(f, "utf8").matchAll(/\bfx\.([a-zA-Z]\w*)\s*[(,)]/g)) usados.add(m[1]);
    }
    const faltam = [...usados].filter((n) => typeof fx[n] !== "function");
    expect(faltam).toEqual([]);
  });
});
