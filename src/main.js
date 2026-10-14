// Arranque da aplicação.
import "@fontsource/gloock/400.css";
import "@fontsource/onest/400.css";
import "@fontsource/onest/500.css";
import "@fontsource/onest/700.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/spline-sans-mono/400.css";
import "@fontsource/spline-sans-mono/500.css";
import "./styles/app.css";

import { S, salvar } from "./state.js";
import { ORDER } from "./jogos.js";
import { iniciarPainel } from "./ui/dom.js";
import { UI, render, registrarTelas } from "./ui/nav.js";
import { telaHub } from "./ui/hub.js";
import { telaPalpite } from "./ui/palpite.js";
import { telaTermo, iniciarTecladoTermo } from "./ui/termo.js";
import { telaConexoes } from "./ui/conexoes.js";
import { telaMito, iniciarTecladoMito } from "./ui/mito.js";
import { ajudaGeral, regras, estatisticas, resumo } from "./ui/modais.js";
import { iniciarMenu } from "./ui/menu.js";
import { iniciarRelogio } from "./ui/relogio.js";
import { iniciarTraducao } from "./ui/traducao.js";

iniciarTraducao();
registrarTelas({ hub: telaHub, termo: telaTermo, conex: telaConexoes, mito: telaMito, palpite: telaPalpite, regras, ajuda: ajudaGeral, estatisticas, resumo });
iniciarPainel();
iniciarMenu();
iniciarTecladoTermo();
iniciarTecladoMito();
iniciarRelogio();

const h = (location.hash || "").slice(1);
UI.view = ORDER.includes(h) ? h : "hub";
render();
if (!S.store.seen.hub) {
  S.store.seen.hub = 1;
  salvar();
  ajudaGeral();
}
