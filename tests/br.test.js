import { describe, it, expect } from "vitest";
import { paraBR, paraBRInterface, traduzirDados } from "../src/lib/br.js";
import { detectarLocale } from "../src/lib/locale.js";

describe("português do Brasil", () => {
  it("perturbação vira transtorno, com o género e os adjetivos certos", () => {
    expect(paraBR("A perturbação depressiva persistente")).toBe("O transtorno depressivo persistente");
    expect(paraBR("das perturbações psiquiátricas")).toBe("dos transtornos psiquiátricos");
    expect(paraBR("Perturbação de stresse pós-traumático")).toBe("Transtorno de estresse pós-traumático");
    expect(paraBR("uma perturbação psicótica")).toBe("um transtorno psicótico");
  });
  it("PHDA vira TDAH", () => {
    expect(paraBR("Perturbação de hiperatividade e défice de atenção (PHDA)")).toBe("Transtorno de déficit de atenção e hiperatividade (TDAH)");
  });
  it("vocabulário e grafia", () => {
    expect(paraBR("no ecrã do telemóvel")).toBe("na tela do celular");
    expect(paraBR("o fenómeno económico do bebé")).toBe("o fenômeno econômico do bebê");
    expect(paraBR("pistas")).toBe("dicas");
    expect(paraBR("na ficha clínica")).toBe("no prontuário");
  });
  it("gerúndio e colocação do pronome", () => {
    expect(paraBR("Está a ver o filme")).toBe("Está vendo o filme");
    expect(paraBR("Eu sinto-me mal e deito-me tarde")).toBe("Eu me sinto mal e me deito tarde");
    expect(paraBR("Sente-se cansada")).toBe("Sente-se cansada");
  });
  it("a interface passa de tu para você", () => {
    expect(paraBRInterface("Lê a ficha clínica fictícia e chega ao diagnóstico")).toBe("Leia o prontuário fictício e chegue ao diagnóstico");
    expect(paraBRInterface("Já tentaste esta combinação")).toBe("Você já tentou essa combinação");
    expect(paraBRInterface("Acertaste em 3/6")).toBe("Acertou em 3/6");
    expect(paraBRInterface("Partilhar resultado")).toBe("Compartilhar resultado");
  });
  it("não mexe nos identificadores", () => {
    const r = traduzirDados({ answer: "estresseagudo", texto: "stresse", near: { tdm: "ecrã" } });
    expect(r).toEqual({ answer: "estresseagudo", texto: "estresse", near: { tdm: "tela" } });
  });
  it("é idempotente: traduzir duas vezes dá o mesmo", () => {
    const t = "A perturbação de stresse no ecrã, está a ver";
    expect(paraBRInterface(paraBRInterface(t))).toBe(paraBRInterface(t));
  });
});

describe("escolha da variante", () => {
  it("o fuso decide primeiro: em Portugal, mesmo com o aparelho em pt-BR", () => {
    expect(detectarLocale({ lingua: "pt-BR", fuso: "Europe/Lisbon" })).toBe("pt");
    expect(detectarLocale({ lingua: "pt-BR", fuso: "Atlantic/Madeira" })).toBe("pt");
  });
  it("no Brasil abre a versão brasileira, qualquer que seja o idioma", () => {
    expect(detectarLocale({ lingua: "pt-PT", fuso: "America/Sao_Paulo" })).toBe("br");
    expect(detectarLocale({ lingua: "en-US", fuso: "America/Sao_Paulo" })).toBe("br");
  });
  it("noutros fusos decide o idioma do aparelho", () => {
    expect(detectarLocale({ lingua: "pt-BR", fuso: "Europe/Paris" })).toBe("br");
    expect(detectarLocale({ lingua: "pt-PT", fuso: "Europe/Paris" })).toBe("pt");
    expect(detectarLocale({ lingua: "en-US", fuso: "America/New_York" })).toBe("pt");
  });
  it("?lang= e o valor guardado têm prioridade", () => {
    expect(detectarLocale({ busca: "?lang=br", lingua: "pt-PT", fuso: "Europe/Lisbon" })).toBe("br");
    expect(detectarLocale({ guardado: "pt", lingua: "pt-BR", fuso: "America/Sao_Paulo" })).toBe("pt");
    expect(detectarLocale({ busca: "?lang=pt", guardado: "br" })).toBe("pt");
  });
});
