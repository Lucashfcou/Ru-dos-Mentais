// Interface em português do Brasil: traduz o texto que a aplicação escreve na página.
// Só corre quando a variante é a brasileira; em Portugal não faz nada.
import { BR } from "../lib/locale.js";
import { paraBRInterface } from "../lib/br.js";

const ATRIBUTOS = ["aria-label", "title", "placeholder", "alt"];

function traduzirNo(no) {
  if (no.nodeType === Node.TEXT_NODE) {
    const novo = paraBRInterface(no.nodeValue);
    if (novo !== no.nodeValue) no.nodeValue = novo;
    return;
  }
  if (no.nodeType !== Node.ELEMENT_NODE || no.tagName === "SCRIPT" || no.tagName === "STYLE") return;
  for (const a of ATRIBUTOS) {
    const v = no.getAttribute(a);
    if (v) {
      const novo = paraBRInterface(v);
      if (novo !== v) no.setAttribute(a, novo);
    }
  }
  for (const filho of no.childNodes) traduzirNo(filho);
}

export function iniciarTraducao() {
  if (!BR) return;
  document.documentElement.lang = "pt-BR";
  document.title = paraBRInterface(document.title);
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = paraBRInterface(meta.content);
  traduzirNo(document.body);
  new MutationObserver((lista) => {
    for (const m of lista) {
      if (m.type === "characterData") traduzirNo(m.target);
      else if (m.type === "attributes") {
        const v = m.target.getAttribute(m.attributeName);
        const novo = paraBRInterface(v);
        if (v && novo !== v) m.target.setAttribute(m.attributeName, novo);
      } else m.addedNodes.forEach(traduzirNo);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
}
