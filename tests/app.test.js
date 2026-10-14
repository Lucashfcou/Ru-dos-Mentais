// Teste de fumo: a aplicação arranca e cada jogo abre e responde, sem erros.
import { describe, it, expect, beforeAll, vi } from "vitest";
import { readFileSync } from "node:fs";

const erros = [];

beforeAll(async () => {
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  Element.prototype.animate = () => ({ finished: Promise.resolve(), cancel() {}, onfinish: null });
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
  window.__NOFX = true;
  const html = readFileSync("index.html", "utf8");
  document.body.innerHTML = html.slice(html.indexOf("<body>") + 6, html.indexOf("<script"));
  window.addEventListener("error", (e) => erros.push(e.message));
  history.replaceState(null, "", "/?lang=pt");
  await import("../src/main.js");
});

const clicar = (sel) => document.querySelector(sel).click();

describe("aplicação", () => {
  it("o hub mostra os 5 jogos", async () => {
    expect(document.querySelectorAll(".rw, .bgc")).toHaveLength(5);
    const nomes = [...document.querySelectorAll(".gname")].map((n) => n.textContent);
    expect(nomes).toContain("Mito ou verdade");
  });

  it("cada jogo abre", async () => {
    const { ORDER } = await import("../src/jogos.js");
    const { go } = await import("../src/ui/nav.js");
    for (const g of ORDER) {
      go(g);
      expect(document.querySelector(".game"), g).not.toBeNull();
      expect(document.querySelector(".ghead h2").textContent.length).toBeGreaterThan(3);
    }
    go("hub");
  });

  it("Mito ou verdade: joga as 5 afirmações até ao resultado", async () => {
    const { go } = await import("../src/ui/nav.js");
    const { gstate } = await import("../src/state.js");
    go("mito");
    for (let i = 0; i < 5; i++) {
      clicar("[data-r=verdade]");
      expect(document.querySelector(".mveredito")).not.toBeNull();
      clicar("#m-next");
    }
    expect(document.querySelector("#result")).not.toBeNull();
    expect(document.querySelectorAll(".mlist li")).toHaveLength(5);
    expect(["won", "lost"]).toContain(gstate("mito").status);
  });

  it("Mito ou verdade: texto de partilha e estatísticas", async () => {
    const { textoDoJogo, textoDoDia } = await import("../src/ui/partilha.js");
    const { estatisticas } = await import("../src/ui/modais.js");
    const txt = textoDoJogo("mito");
    expect(txt).toMatch(/Mito ou verdade [0-5]\/5\n[🟩🟥]{5}$/u);
    expect(textoDoDia()).toContain("Mito ou verdade");
    estatisticas("mito");
    expect(document.querySelector(".statline")).not.toBeNull();
    expect(document.querySelectorAll(".dist > div")).toHaveLength(3);
    document.getElementById("overlay").hidden = true;
  });

  it("Conexões: escolher 4 fichas ativa o botão Enviar", async () => {
    const { go } = await import("../src/ui/nav.js");
    go("conex");
    const fichas = [...document.querySelectorAll(".cx-tile")];
    expect(fichas).toHaveLength(16);
    for (let i = 0; i < 4; i++) document.querySelectorAll(".cx-tile")[i].click();
    expect(document.querySelectorAll(".cx-tile[aria-pressed=true]")).toHaveLength(4);
    expect(document.querySelector("#cx-go").disabled).toBe(false);
  });

  it("PsicoTermo: escolher a 3.ª casa e a última", async () => {
    const { go, UI } = await import("../src/ui/nav.js");
    go("termo");
    document.querySelectorAll(".cur-t")[2].click();
    document.querySelector("[data-k=C]").click();
    document.querySelectorAll(".cur-t")[4].click();
    document.querySelector("[data-k=A]").click();
    expect(UI.termo.casas).toEqual(["", "", "C", "", "A"]);
  });

  it("Diagnóstico: a busca encontra uma resposta", async () => {
    const { go } = await import("../src/ui/nav.js");
    go("diag");
    const campo = document.querySelector("input");
    campo.value = "depress";
    campo.dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.querySelectorAll("[role=option], .combo li, .combo button").length).toBeGreaterThan(0);
  });

  it("não houve erros durante a navegação", () => {
    expect(erros).toEqual([]);
  });
});
