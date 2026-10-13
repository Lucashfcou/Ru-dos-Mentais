// Ícones e símbolos em SVG (traço), sem dependências.

const SVGZ = (corpo) => `<svg class="zs" viewBox="0 0 100 100" aria-hidden="true">${corpo}</svg>`;

/** Símbolos usados na chuva de partículas e no desenho do resultado. */
export const SYM = {
  plus: SVGZ('<path d="M50 16v68M16 50h68"/>'),
  square: SVGZ('<rect x="20" y="20" width="60" height="60" rx="5"/>'),
  waves: SVGZ('<path d="M13 28q9.2-12 18.4 0t18.4 0 18.4 0 18.4 0"/><path d="M13 50q9.2-12 18.4 0t18.4 0 18.4 0 18.4 0"/><path d="M13 72q9.2-12 18.4 0t18.4 0 18.4 0 18.4 0"/>'),
  circle: SVGZ('<circle cx="50" cy="50" r="33"/>'),
  star: SVGZ('<polygon points="50.0,12.0 60.0,40.2 89.9,41.0 66.2,59.3 74.7,88.0 50.0,71.0 25.3,88.0 33.8,59.3 10.1,41.0 40.0,40.2"/>'),
};

const GL = (b) => `<svg viewBox="0 0 24 24" aria-hidden="true">${b}</svg>`;

/** Um glifo por jogo. */
export const ICONS = {
  diag: GL('<rect x="5" y="4" width="14" height="17" rx="2.2"/><path d="M9.5 4V3h5v1M12 9v6M9 12h6"/>'),
  termo: GL('<rect x="2.5" y="7" width="5.5" height="10" rx="1.6"/><rect x="9.25" y="7" width="5.5" height="10" rx="1.6"/><rect x="16" y="7" width="5.5" height="10" rx="1.6"/><path d="M5.25 10.5v3M12 10.5v3M18.75 10.5v3"/>'),
  quem: GL('<path d="M10.5 8C7.5 8 6 10 6 13v3.5h4.5V12H7.8M19 8c-3 0-4.5 2-4.5 5v3.5H19V12h-2.7"/>'),
  conex: GL('<rect x="3.5" y="3.5" width="17" height="17" rx="2.2"/><path d="M3.5 7.75h17M3.5 12h17M3.5 16.25h17M7.75 3.5v17M12 3.5v17M16.25 3.5v17"/>'),
};

/** Marcas dos palpites. */
export const MK = {
  wrong: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  near: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9c2.3-2.4 4.7-2.4 7 0s4.7 2.4 7 0M5 15c2.3-2.4 4.7-2.4 7 0s4.7 2.4 7 0"/></svg>',
  skip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>',
  ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
};

export const FLAME =
  '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:1em;height:1em;vertical-align:-.12em;color:var(--star)"><path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 1.5 2 2.5 2C11 7.5 11 5.5 12 3z"/></svg>';

export const SETA_CIMA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
export const SETA_BAIXO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';

/** Estilo inline com as cores do jogo (--g: interface, --gc: logótipo). */
export const gv = (c) => `--g:var(${c});--on-g:var(${c}-on);--gc:var(${c}-c,var(${c}))`;
