// Datas do jogo. Tudo é contado no fuso de Lisboa, para que o dia vire à meia-noite de Portugal
// em qualquer dispositivo, e nunca pelo relógio local de quem joga.
export const FUSO = "Europe/Lisbon";

// Data do desafio nº 1 (AAAA-MM-DD). Muda com VITE_LANCAMENTO ao publicar.
export const LANCAMENTO = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_LANCAMENTO) || "2026-10-01";

const pad2 = (n) => String(n).padStart(2, "0");
const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" });

/** Data civil (AAAA-MM-DD) em Lisboa para um instante. */
export function dataLisboa(instante = new Date()) {
  return fmt.format(instante);
}

const utc = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Soma dias a uma data AAAA-MM-DD (aritmética de calendário, sem fuso). */
export function somarDias(k, n) {
  const t = new Date(utc(k) + n * 864e5);
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`;
}

/** Quantos dias de calendário vão de a até b. */
export function diasEntre(a, b) {
  return Math.round((utc(b) - utc(a)) / 864e5);
}

/** Número da edição (1 no dia do lançamento). */
export function numeroEdicao(k, lancamento = LANCAMENTO) {
  return diasEntre(lancamento, k) + 1;
}

/** Escolhe o item n (1, 2, 3...) da lista, recomeçando do início quando ela acaba. */
export function escolher(lista, n) {
  const t = lista.length;
  return lista[(((n - 1) % t) + t) % t];
}

/**
 * Milissegundos até a próxima meia-noite de Lisboa.
 * Procura o instante em que a data muda, o que também acerta os dias de 23 e 25 horas
 * da mudança de hora.
 */
export function msAteMeiaNoite(agora = new Date()) {
  const hoje = dataLisboa(agora);
  let lo = 0;
  let hi = 26 * 3600 * 1000;
  while (hi - lo > 250) {
    const mid = Math.floor((lo + hi) / 2);
    if (dataLisboa(new Date(agora.getTime() + mid)) === hoje) lo = mid;
    else hi = mid;
  }
  return Math.max(0, hi);
}

/** hh:mm:ss */
export function relogio(ms) {
  const s = Math.floor(ms / 1000);
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}`;
}

/** "terça, 13 de outubro" */
export function dataPorExtenso(k) {
  const [y, m, d] = k.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d, 12));
  const p = new Intl.DateTimeFormat("pt-PT", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" })
    .formatToParts(t)
    .reduce((o, x) => ((o[x.type] = x.value), o), {});
  return `${p.weekday.replace("-feira", "")}, ${p.day} de ${p.month}`;
}
