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
    expect(paraBRInterface("Lê cada afirmação e escolhe: mito ou verdade. Depois de responder, vês logo a explicação e a fonte.")).toBe("Leia cada afirmação e escolha: mito ou verdade. Depois de responder, você vê logo a explicação e a fonte.");
  });
  it("não mexe nos identificadores", () => {
    const r = traduzirDados({ answer: "estresseagudo", texto: "stresse", near: { tdm: "ecrã" } });
    expect(r).toEqual({ answer: "estresseagudo", texto: "estresse", near: { tdm: "tela" } });
  });
  it("sobras que escapavam: gerúndio depois de e/vírgula, controle, aspas, maiúsculas, tem que", () => {
    expect(paraBR("cheia de energia e a fazer mil coisas")).toBe("cheia de energia e fazendo mil coisas");
    expect(paraBR("(por exemplo, a bater numa almofada)")).toBe("(por exemplo, batendo numa almofada)");
    expect(paraBR("perder o controlo")).toBe("perder o controle");
    expect(paraBR("Sobre a Morte e o Morrer: «fluxo»")).toBe("Sobre a Morte e o Morrer: “fluxo”");
    expect(paraBR("INSÓNIA")).toBe("INSÔNIA");
    expect(paraBR("HISTRIÓNICA")).toBe("HISTRIÔNICA");
    expect(paraBR("HIPERSÓNIA")).toBe("HIPERSONIA");
    expect(paraBR("Perturbações Relacionadas com o Trauma")).toBe("Transtornos Relacionados com o Trauma");
    expect(paraBR("perturbação depressiva major")).toBe("transtorno depressivo maior");
    expect(paraBR("Quando tem de o enfrentar, tenho de falar")).toBe("Quando tem que o enfrentar, tenho que falar");
    expect(paraBR("O tem de bom é isso")).toBe("O tem de bom é isso");
  });
  it("frases da interface que ainda estavam em português de Portugal", () => {
    expect(paraBRInterface("Saltaste a tentativa")).toBe("Você pulou a tentativa");
    expect(paraBRInterface("Não foi desta. A resposta era esta.")).toBe("Não foi dessa vez. A resposta era esta.");
    expect(paraBRInterface("Seleciona 4 termos e envia.")).toBe("Selecione 4 termos e envie.");
    expect(paraBRInterface("iguais para toda a gente")).toBe("iguais para todo mundo");
    expect(paraBRInterface("Percebi")).toBe("Entendi");
  });
  it("é idempotente: traduzir duas vezes dá o mesmo", () => {
    const t = "A perturbação de stresse no ecrã, está a ver";
    expect(paraBRInterface(paraBRInterface(t))).toBe(paraBRInterface(t));
  });
});

describe("escolha da variante", () => {
  it("o padrão é o português do Brasil, em qualquer lugar", () => {
    expect(detectarLocale({})).toBe("br");
    expect(detectarLocale({ busca: "" })).toBe("br");
  });
  it("?lang=pt abre a versão de Portugal; ?lang=br volta ao Brasil", () => {
    expect(detectarLocale({ busca: "?lang=pt" })).toBe("pt");
    expect(detectarLocale({ busca: "?lang=pt-PT" })).toBe("pt");
    expect(detectarLocale({ busca: "?lang=br" })).toBe("br");
  });
  it("o que ficou guardado vale, e o endereço manda mais", () => {
    expect(detectarLocale({ guardado: "pt" })).toBe("pt");
    expect(detectarLocale({ guardado: "br" })).toBe("br");
    expect(detectarLocale({ busca: "?lang=br", guardado: "pt" })).toBe("br");
  });
});
