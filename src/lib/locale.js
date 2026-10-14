// Escolhe a variante do português: Portugal (pt) ou Brasil (br), sem botão para o jogador trocar.
// Ordem: ?lang= na ligação (para testar), depois o que ficou guardado, depois o idioma e o fuso do aparelho.

export const FUSOS = { pt: "Europe/Lisbon", br: "America/Sao_Paulo" };
const CHAVE = "ruidos-mentais:lang";

/** `entrada`: { busca: "?lang=br", guardado: "br", lingua: "pt-BR", fuso: "America/Sao_Paulo" } */
export function detectarLocale({ busca = "", guardado = "", lingua = "", fuso = "" } = {}) {
  const arg = new URLSearchParams(busca).get("lang");
  const pedido = normalizar(arg);
  if (pedido) return pedido;
  const antigo = normalizar(guardado);
  if (antigo) return antigo;
  const l = String(lingua || "").toLowerCase();
  if (l.startsWith("pt-br")) return "br";
  if (l === "pt" || l.startsWith("pt-")) {
    // "pt" sem região: o fuso do aparelho decide
    if (l === "pt") return String(fuso).startsWith("America/") ? "br" : "pt";
    return "pt";
  }
  // outro idioma (por exemplo, inglês): fuso americano -> Brasil, senão Portugal
  return /^America\/(Sao_Paulo|Bahia|Fortaleza|Recife|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Rio_Branco|Noronha|Araguaina|Maceio|Santarem|Boa_Vista|Eirunepe)$/.test(fuso) ? "br" : "pt";
}

function normalizar(v) {
  const s = String(v || "").toLowerCase();
  if (s === "br" || s === "pt-br") return "br";
  if (s === "pt" || s === "pt-pt") return "pt";
  return "";
}

function doAmbiente() {
  if (typeof window === "undefined") return "pt";
  let guardado = "";
  const busca = window.location ? window.location.search : "";
  const pedido = normalizar(new URLSearchParams(busca).get("lang"));
  try {
    if (pedido) localStorage.setItem(CHAVE, pedido); // quem abre com ?lang= fica nessa variante
    guardado = localStorage.getItem(CHAVE) || "";
  } catch {
    /* sem armazenamento: segue o aparelho */
  }
  let fuso = "";
  try {
    fuso = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    /* sem Intl */
  }
  return detectarLocale({ busca, guardado, lingua: (typeof navigator !== "undefined" && navigator.language) || "", fuso });
}

export const LOCALE = doAmbiente();
export const BR = LOCALE === "br";
export const FUSO_LOCAL = FUSOS[LOCALE];
