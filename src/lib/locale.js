// Variante do português: Brasil (br, a padrão) ou Portugal (pt).
// Todos abrem em português do Brasil. A versão de Portugal continua disponível com ?lang=pt
// na ligação (fica guardada no aparelho); ?lang=br volta ao Brasil.

export const FUSOS = { pt: "Europe/Lisbon", br: "America/Sao_Paulo" };
export const PADRAO = "br";
const CHAVE = "ruidos-mentais:lang";

/** `entrada`: { busca: "?lang=pt", guardado: "pt" } */
export function detectarLocale({ busca = "", guardado = "" } = {}) {
  const pedido = normalizar(new URLSearchParams(busca).get("lang"));
  if (pedido) return pedido;
  const antigo = normalizar(guardado);
  if (antigo) return antigo;
  return PADRAO;
}

function normalizar(v) {
  const s = String(v || "").toLowerCase();
  if (s === "br" || s === "pt-br") return "br";
  if (s === "pt" || s === "pt-pt") return "pt";
  return "";
}

function doAmbiente() {
  if (typeof window === "undefined") return PADRAO;
  let guardado = "";
  const busca = window.location ? window.location.search : "";
  const pedido = normalizar(new URLSearchParams(busca).get("lang"));
  try {
    if (pedido) localStorage.setItem(CHAVE, pedido); // quem abre com ?lang= fica nessa variante
    guardado = localStorage.getItem(CHAVE) || "";
  } catch {
    /* sem armazenamento: usa a variante padrão */
  }
  return detectarLocale({ busca, guardado });
}

export const LOCALE = doAmbiente();
export const BR = LOCALE === "br";
export const FUSO_LOCAL = FUSOS[LOCALE];
