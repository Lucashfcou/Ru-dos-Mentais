// Escolhe a variante do português: Portugal (pt) ou Brasil (br), sem botão para o jogador trocar.
// Ordem: ?lang= na ligação (para testar), depois o que ficou guardado, depois o fuso horário e, por fim, o idioma do aparelho.

export const FUSOS = { pt: "Europe/Lisbon", br: "America/Sao_Paulo" };
const CHAVE = "ruidos-mentais:lang";

const FUSO_BR = /^America\/(Sao_Paulo|Bahia|Fortaleza|Recife|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Rio_Branco|Noronha|Araguaina|Maceio|Santarem|Boa_Vista|Eirunepe)$/;
const FUSO_PT = /^(Europe\/Lisbon|Atlantic\/(Azores|Madeira))$/;

/**
 * `entrada`: { busca: "?lang=br", guardado: "br", lingua: "pt-BR", fuso: "America/Sao_Paulo" }
 * O sítio onde a pessoa está pesa mais do que o idioma do aparelho: um brasileiro em Portugal vê a versão de Portugal.
 */
export function detectarLocale({ busca = "", guardado = "", lingua = "", fuso = "" } = {}) {
  const pedido = normalizar(new URLSearchParams(busca).get("lang"));
  if (pedido) return pedido;
  const antigo = normalizar(guardado);
  if (antigo) return antigo;
  if (FUSO_PT.test(fuso)) return "pt";
  if (FUSO_BR.test(fuso)) return "br";
  // fuso desconhecido ou de outro país: decide o idioma do aparelho
  return String(lingua || "").toLowerCase().startsWith("pt-br") ? "br" : "pt";
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
