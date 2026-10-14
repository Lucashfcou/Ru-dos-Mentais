// Adapta o português europeu (texto original) para o português do Brasil.
// Duas camadas: `paraBR` (vocabulário, ortografia, terminologia clínica) vale para tudo;
// `paraBRInterface` também troca frases exatas da interface (tu -> você), que nunca aparecem no conteúdo.

const L = "\\p{L}";
const palavra = (re) => `(?<!${L})(?:${re})(?!${L})`;

/** Mantém a capitalização do original: AO/Ao/ao. */
function caso(original, novo) {
  if (original.length > 1 && original === original.toUpperCase()) return novo.toUpperCase();
  if (original[0] !== original[0].toLowerCase()) return novo[0].toUpperCase() + novo.slice(1);
  return novo;
}

/** [padrão (sem limites de palavra), substituto]. */
const PALAVRAS = [
  // terminologia clínica
  ["hiperatividade e défice de atenção", "déficit de atenção e hiperatividade"],
  ["défice", "déficit"],
  ["PHDA", "TDAH"],
  ["POC", "TOC"],
  ["espetro", "espectro"],
  ["stressores", "estressores"],
  ["stressor", "estressor"],
  ["stresse", "estresse"],
  ["stress", "estresse"],
  ["pistas", "dicas"],
  ["pista", "dica"],
  ["utentes", "pacientes"],
  ["utente", "paciente"],
  ["ligeiros", "leves"],
  ["ligeiras", "leves"],
  ["ligeiro", "leve"],
  ["ligeira", "leve"],
  // vocabulário
  ["telemóveis", "celulares"],
  ["telemóvel", "celular"],
  ["factos", "fatos"],
  ["facto", "fato"],
  ["contactos", "contatos"],
  ["contacto", "contato"],
  ["equipas", "equipes"],
  ["equipa", "equipe"],
  ["miúdos", "garotos"],
  ["miúdas", "garotas"],
  ["miúdo", "garoto"],
  ["miúda", "garota"],
  ["raparigas", "garotas"],
  ["rapariga", "garota"],
  ["autocarro", "ônibus"],
  ["comboio", "trem"],
  ["casa de banho", "banheiro"],
  ["pequeno-almoço", "café da manhã"],
  ["desporto", "esporte"],
  ["reformado", "aposentado"],
  ["reformada", "aposentada"],
  ["sítios", "lugares"],
  ["sítio", "lugar"],
  ["cinzento", "cinza"],
  ["bebés", "bebês"],
  ["bebé", "bebê"],
  ["ténis", "tênis"],
  ["bocadinho", "pouquinho"],
  ["fixe", "legal"],
  ["dêem", "deem"],
  ["monitoriz(ar|ando|ado|ada|ados|adas)", "monitor$1"],
  ["carateriz(\\p{L}*)", "caracteriz$1"],
  // grafia
  ["perceção", "percepção"],
  ["percetiv([oa]s?)", "perceptiv$1"],
  ["conceção", "concepção"],
  ["receção", "recepção"],
  ["deceção", "decepção"],
  ["recetor(es)?", "receptor$1"],
  ["recetiv([oa]s?)", "receptiv$1"],
  ["aspeto(s)?", "aspecto$1"],
  ["respetiv([oa]s?)", "respectiv$1"],
  ["espetador(es)?", "espectador$1"],
  ["secções", "seções"],
  ["secção", "seção"],
  ["baralhar", "embaralhar"],
  ["baralhado", "embaralhado"],
  ["partilhar", "compartilhar"],
  ["partilhado", "compartilhado"],
];

/** Determinantes que acompanham um substantivo que muda de género. */
const MASC = {
  a: "o", as: "os", da: "do", das: "dos", na: "no", nas: "nos", pela: "pelo", pelas: "pelos",
  uma: "um", umas: "uns", esta: "este", estas: "estes", essa: "esse", essas: "esses",
  dessa: "desse", dessas: "desses", desta: "deste", destas: "destes", nessa: "nesse", nesta: "neste",
  numa: "num", aquela: "aquele", daquela: "daquele", naquela: "naquele", alguma: "algum", algumas: "alguns",
  nenhuma: "nenhum", outra: "outro", outras: "outros", muitas: "muitos", várias: "vários", diversas: "diversos",
  toda: "todo", todas: "todos", própria: "próprio", mesma: "mesmo", mesmas: "mesmos",
};
const FEM = {
  o: "a", os: "as", no: "na", nos: "nas", do: "da", dos: "das", ao: "à", aos: "às", um: "uma", uns: "umas",
  este: "esta", esse: "essa", pelo: "pela", pelos: "pelas", aquele: "aquela", outro: "outra", outros: "outras",
  todo: "toda", todos: "todas",
};
/** Adjetivos que seguem "transtorno" e concordam com ele. */
const ADJ = {
  depressiva: "depressivo", psicótica: "psicótico", ciclotímica: "ciclotímico", dismórfica: "dismórfico",
  conversiva: "conversivo", esquizoafetiva: "esquizoafetivo", histriónica: "histriônico", factícia: "factício",
  dissociativa: "dissociativo", obsessiva: "obsessivo", "obsessivo-compulsiva": "obsessivo-compulsivo",
  psiquiátricas: "psiquiátricos", psiquiátrica: "psiquiátrico", induzida: "induzido", somática: "somático",
  ansiosa: "ansioso", psicóticas: "psicóticos", depressivas: "depressivos", disruptiva: "disruptivo",
  explosiva: "explosivo", reativa: "reativo",
};

/** Troca substantivos que mudam de género e acerta os determinantes que os antecedem. */
function mudarGenero(s, nomes, dets) {
  const alt = nomes.map(([padrao]) => padrao).join("|");
  const trocar = (nome) => {
    for (const [padrao, novo] of nomes) if (new RegExp("^(?:" + padrao + ")$", "iu").test(nome)) return caso(nome, novo);
    return nome;
  };
  const ds = Object.keys(dets).join("|");
  s = s.replace(new RegExp(`(?<!${L})(${ds})(\\s+)(${alt})(?!${L})`, "giu"), (m, det, esp, nome) => caso(det, dets[det.toLowerCase()]) + esp + trocar(nome));
  return s.replace(new RegExp(`(?<!${L})(${alt})(?!${L})`, "giu"), (m) => trocar(m));
}

function generos(s) {
  s = mudarGenero(
    s,
    [
      ["perturbações", "transtornos"],
      ["perturbação", "transtorno"],
      ["fichas clínicas", "prontuários"],
      ["ficha clínica", "prontuário"],
      ["monitorização", "monitoramento"],
    ],
    MASC,
  );
  s = mudarGenero(
    s,
    [
      ["ecrãs", "telas"],
      ["ecrã", "tela"],
      ["frigoríficos", "geladeiras"],
      ["frigorífico", "geladeira"],
      ["ginásios", "academias"],
      ["ginásio", "academia"],
    ],
    FEM,
  );
  return s.replace(new RegExp(`(?<!${L})(transtornos?)(\\s+)(${Object.keys(ADJ).join("|")})(?!${L})`, "giu"), (m, n, esp, adj) => n + esp + caso(adj, ADJ[adj.toLowerCase()]));
}

/** "estar a fazer" -> "estar fazendo". */
function gerundio(s) {
  const aux = "est(?:á|ão|ou|ava|avam|ás|amos|ar|iver|ivesse|eja|ejam|ive|iveram)|continu(?:a|am|ar|ou)|fic(?:a|am|ou|ar)|and(?:a|am|ava|ou|ar)|vive|vivia|passa|passou|passam";
  return s.replace(new RegExp(`(?<!${L})(${aux})(\\s+)a(\\s+)(${L}+?)(ar|er|ir)(?!${L})`, "giu"), (m, v, e1, e2, rad, fim) => {
    const ger = fim.toLowerCase() === "ar" ? "ando" : fim.toLowerCase() === "er" ? "endo" : "indo";
    return v + e1 + rad + ger;
  });
}

/** Acento agudo antes de m/n + vogal passa a circunflexo: económico -> econômico. */
function acentos(s) {
  return s
    .replace(/é(?=[mn][aeiouáéíóúâêôãõ])/g, "ê")
    .replace(/ó(?=[mn][aeiouáéíóúâêôãõ])/g, "ô")
    .replace(/É(?=[mn][aeiouáéíóúâêôãõ])/g, "Ê")
    .replace(/Ó(?=[mn][aeiouáéíóúâêôãõ])/g, "Ô");
}

/** Colocação do pronome: "sente-se" -> "se sente", "sinto-me" -> "me sinto" (menos no início da frase). */
function proclise(s) {
  return s.replace(/(\p{L}+)-(me|se|nos)(?![\p{L}-])/gu, (m, verbo, pron, pos) => {
    const antes = s.slice(0, pos).trimEnd();
    if (!antes || /[.!?…:“"(«]$/.test(antes)) return m;
    if (/^\p{Lu}/u.test(verbo) && !/^\p{Lu}{2,}$/u.test(verbo)) return m;
    return pron + " " + verbo;
  });
}

/** Frases de conteúdo que usam "tu" (traduções de citações). */
const TU = [
  ["tu fazes as tuas", "você faz as suas"],
  ["às tuas expectativas", "às suas expectativas"],
  ["e tu não estás", "e você não está"],
];

const REGRAS = PALAVRAS.map(([padrao, novo]) => [new RegExp(palavra(padrao), "giu"), novo]);

export function paraBR(texto) {
  if (typeof texto !== "string" || !texto) return texto;
  let s = texto;
  for (const [de, para] of TU) if (s.includes(de)) s = s.split(de).join(para);
  s = generos(s);
  for (const [re, novo] of REGRAS) {
    s = s.replace(re, (m, ...g) => caso(m, novo.replace(/\$(\d)/g, (_, i) => g[+i - 1] || "")));
  }
  return acentos(proclise(gerundio(s)));
}

/** Frases da interface (tu -> você). Só frases completas ou longas: nunca tocam o conteúdo clínico. */
const FRASES = [
  ["Lê a ficha clínica fictícia e chega ao diagnóstico", "Leia o prontuário fictício e chegue ao diagnóstico"],
  ["Lê a ficha do caso fictício e descobre o diagnóstico", "Leia o prontuário do caso fictício e descubra o diagnóstico"],
  ["Descobre o termo de psicologia", "Descubra o termo de psicologia"],
  ["Podes tentar qualquer palavra", "Você pode tentar qualquer palavra"],
  ["Toca numa casa para escolher", "Toque numa casa para escolher"],
  ["no sítio certo", "no lugar certo"],
  ["noutra posição", "em outra posição"],
  ["Lê a citação e descobre quem a disse", "Leia a citação e descubra quem a disse"],
  ["do autor que escolheste", "do autor que você escolheu"],
  ["Encontra os 4 grupos", "Encontre os 4 grupos"],
  ["Seleciona 4 termos", "Selecione 4 termos"],
  ["Podes errar 4 vezes", "Você pode errar 4 vezes"],
  ["Joga pela ordem que quiseres e partilha o resultado", "Jogue na ordem que quiser e compartilhe o resultado"],
  ["(hora de Lisboa)", "(horário de Brasília)"],
  ["Conclui todos os jogos", "Conclua todos os jogos"],
  ["Escreve uma perturbação", "Escreva um transtorno"],
  ["Escreve um autor", "Escreva um autor"],
  ["Já tentaste esta combinação", "Você já tentou essa combinação"],
  ["Já tentaste essa resposta", "Você já tentou essa resposta"],
  ["Não acertaste", "Não acertou"],
  ["Acertaste", "Acertou"],
  ["Não uses para fazer autodiagnóstico", "Não use para fazer autodiagnóstico"],
  ["Tenta outro termo", "Tente outro termo"],
  ["Escolhe uma das opções da lista", "Escolha uma das opções da lista"],
  ["Copia o teu resultado", "Copie seu resultado"],
  ["Seleciona o texto abaixo e copia", "Selecione o texto abaixo e copie"],
  ["Cola onde quiseres", "Cole onde quiser"],
  ["Saltar e ver a próxima", "Pular e ver a próxima"],
  ["Partilhar", "Compartilhar"],
  ["n.º", "nº"],
  [".º erro", "º erro"],
];

export function paraBRInterface(texto) {
  if (typeof texto !== "string" || !texto) return texto;
  let s = texto;
  for (const [de, para] of FRASES) if (s.includes(de)) s = s.split(de).join(para);
  return paraBR(s);
}

const NAO_TRADUZIR = new Set(["answer", "id", "aliases", "ref", "nascimento", "lvl"]);

/** Aplica `paraBR` a todas as strings de um valor JSON, menos às chaves que são identificadores. */
export function traduzirDados(valor) {
  if (typeof valor === "string") return paraBR(valor);
  if (Array.isArray(valor)) return valor.map(traduzirDados);
  if (valor && typeof valor === "object") {
    const out = {};
    for (const [k, v] of Object.entries(valor)) out[k] = NAO_TRADUZIR.has(k) ? v : traduzirDados(v);
    return out;
  }
  return valor;
}
