// Movimento: Motion (molas, FLIP) e anime.js (desenho de traços, escalonamento). Tudo é opcional:
// se a animação falhar, a página continua utilizável. Respeita prefers-reduced-motion.
import * as Motion from "motion";
import * as anime from "animejs";
import { SYM } from "./icons.js";

const M = Motion;
const A = anime;
const RMQ=matchMedia("(prefers-reduced-motion: reduce)");
const fxOn=()=>!RMQ.matches&&!window.__NOFX;
const SPRING={type:"spring",stiffness:170,damping:17};
const EXPO=[.16,1,.3,1];
const fx={
  safe(fn){try{return fn()}catch(e){return null}},
  // palavras com máscara para revelar (títulos e citações)
  splitWords(el,cls){
    const words=el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label",el.textContent.trim());
    el.innerHTML=words.map(w=>`<span class="${cls}" aria-hidden="true"><span>${w}</span></span>`).join(" ");
    return[...el.querySelectorAll("."+cls+">span")];
  },
  reveal(el,cls,delay=0,animate=true){
    const spans=this.splitWords(el,cls);
    if(!animate||!A||!fxOn())return;
    this.safe(()=>A.animate(spans,{translateY:["105%","0%"],duration:900,delay:A.stagger(70,{start:delay}),ease:"outExpo"}));
  },
  // desenha o contorno de um símbolo Zener
  draw(root,delay=0,duration=900){
    if(!A||!fxOn()||!root)return;
    const shapes=root.querySelectorAll("path,circle,rect,polygon");
    if(!shapes.length||!(A.svg&&A.svg.createDrawable))return;
    this.safe(()=>A.animate(A.svg.createDrawable(shapes),{draw:["0 0","0 1"],duration,delay:A.stagger(110,{start:delay}),ease:"outExpo"}));
  },
  // FLIP manual: tiles deslizam até o novo lugar (Conexões)
  snap(sel,key){const m=new Map();document.querySelectorAll(sel).forEach(e=>m.set(e.dataset[key],e.getBoundingClientRect()));this._snap=m},
  flip(sel,key){
    const m=this._snap;this._snap=null;
    if(!m||!M||!fxOn())return;
    document.querySelectorAll(sel).forEach(e=>{
      const a=m.get(e.dataset[key]);if(!a)return;
      const b=e.getBoundingClientRect(),dx=a.left-b.left,dy=a.top-b.top;
      if(Math.abs(dx)<1&&Math.abs(dy)<1)return;
      this.safe(()=>M.animate(e,{x:[dx,0],y:[dy,0]},{type:"spring",stiffness:230,damping:24}));
    });
  },
  pop(el,s=1.08){if(el&&fxOn())this.safe(()=>el.animate({transform:[`scale(${s})`,"scale(0.98)","scale(1)"]},{duration:320,easing:"cubic-bezier(0.34, 1.56, 0.64, 1)"}))},
  // reduz a letra das fichas das Conexões até caberem na largura
  fitTiles(){
    document.querySelectorAll(".cx-tile").forEach(t=>{
      t.style.fontSize="";
      let fs=parseFloat(getComputedStyle(t).fontSize);
      while(t.scrollWidth>t.clientWidth+0.5&&fs>8.5){fs-=0.5;t.style.fontSize=fs+"px"}
    });
  },
  shakeEls(els){
    if(!els.length)return;
    if(fxOn())this.safe(()=>els.forEach(el=>el.animate({transform:["translateX(0)","translateX(-9px)","translateX(8px)","translateX(-6px)","translateX(4px)","translateX(0)"]},{duration:420,easing:"ease-out"})));
  },
  wave(els){
    if(!els.length)return;
    if(A&&fxOn())this.safe(()=>A.animate(els,{translateY:[0,-18,0],duration:620,delay:A.stagger(85),ease:"outBack"}));
  },
  // chuva de símbolos Zener
  burst(x,y,count=14,power=1){
    if(!A||!fxOn())return;
    if(matchMedia("(pointer:coarse)").matches)count=Math.ceil(count*.55);
    let layer=document.getElementById("fxlayer");
    if(!layer){layer=document.createElement("div");layer.id="fxlayer";layer.setAttribute("aria-hidden","true");document.body.appendChild(layer)}
    const names=["diag","termo","quem","conex"],syms=["plus","square","waves","circle","star"];
    const bits=[];
    for(let i=0;i<count;i++){
      const b=document.createElement("div");b.className="bit";
      b.style.color=`var(--${names[i%4]})`;
      b.innerHTML=SYM[syms[i%5]];
      b.style.transform=`translate(${x-13}px,${y-13}px)`;
      layer.appendChild(b);bits.push(b);
    }
    this.safe(()=>{
      A.animate(bits,{
        translateX:()=>x-13+(Math.random()-.5)*340*power,
        translateY:()=>y-13+(Math.random()*-1)*260*power-40,
        rotate:()=>(Math.random()-.5)*540,
        scale:[.4,1,.8],opacity:[1,1,0],
        duration:()=>1100+Math.random()*700,ease:"outCubic",
        onComplete:()=>bits.forEach(b=>b.remove())
      });
    });
    setTimeout(()=>bits.forEach(b=>b.remove()),2400);
  },
  // depois de cada render de jogo: desenha o símbolo do resultado e comemora
  afterResult(won,first){
    const r=document.querySelector("#result");if(!r)return;
    const sym=r.querySelector(".rsym");this.draw(sym,150,1000);if(first){this.decrypt(r.querySelector("h3"),850);this.haptic(won?"win":"bad")}
    if(won&&first){const b=r.getBoundingClientRect();this.burst(Math.min(innerWidth-40,Math.max(40,b.left+b.width-60)),Math.max(120,b.top+60),16,1)}
  }
};
RMQ.addEventListener&&RMQ.addEventListener("change",()=>{});

/* ============ EXTRAS: contador, faíscas, texto decifrado, texto girando, háptico ============ */
Object.assign(fx,{
  haptic(kind){
    try{
      if(!navigator.vibrate||RMQ.matches)return;
      navigator.vibrate(kind==="ok"?[12]:kind==="bad"?[28]:kind==="win"?[12,50,12,50,24]:[0]);
    }catch(e){}
  },
  // contador rolante: cada dígito é uma coluna 0-9 que desliza
  setRoll(el,value,fromZero,instant){
    if(!el)return;
    const text=String(value);if(instant)el.classList.add("nt");
    if(el.dataset.v===text&&el.classList.contains("roll"))return;
    const fresh=!el.classList.contains("roll")||el.dataset.n!==String(text.length);
    if(fresh){
      el.classList.add("roll","still");
      el.dataset.n=text.length;
      el.setAttribute("role","text");
      el.innerHTML=[...text].map(ch=>/\d/.test(ch)
        ?`<span class="d" aria-hidden="true"><span class="col">${"0123456789".split("").map(n=>`<span>${n}</span>`).join("")}</span></span>`
        :`<span class="s" aria-hidden="true">${ch}</span>`).join("");
    }
    el.setAttribute("aria-label",text);
    el.dataset.v=text;
    const cols=el.querySelectorAll(".col"),digits=[...text].filter(c=>/\d/.test(c));
    const apply=()=>cols.forEach((c,i)=>{c.style.transform=`translateY(${-digits[i]*1.2}em)`});
    if(fresh){
      if(fromZero&&fxOn()){
        cols.forEach(c=>{c.style.transform="translateY(0em)"});
        requestAnimationFrame(()=>requestAnimationFrame(()=>{el.classList.remove("still");apply()}));
      }else{apply();requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove("still")))}
    }else apply();
  },
  // faíscas radiais no ponto do toque
  spark(x,y,color){
    if(!M||!fxOn())return;
    let layer=document.getElementById("fxlayer");
    if(!layer){layer=document.createElement("div");layer.id="fxlayer";layer.setAttribute("aria-hidden","true");document.body.appendChild(layer)}
    const n=8,made=[];
    for(let i=0;i<n;i++){
      const s=document.createElement("i");s.className="spark";
      s.style.left=x+"px";s.style.top=y+"px";s.style.background=color;s.style.rotate=(i*360/n)+"deg";
      layer.appendChild(s);made.push(s);
    }
    this.safe(()=>M.animate(made,{x:[8,30],scaleX:[1,.25],opacity:[1,0]},{duration:.5,ease:EXPO}));
    setTimeout(()=>made.forEach(s=>s.remove()),650);
  },
  // texto que se decifra da esquerda para a direita
  decrypt(el,dur=800){
    if(!el||!fxOn())return;
    const final=el.textContent;if(!final.trim())return;
    const set="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    el.setAttribute("aria-label",final);
    el.style.minHeight=el.getBoundingClientRect().height+"px";
    const t0=performance.now();
    const step=()=>{
      const p=Math.min(1,(performance.now()-t0)/dur),k=Math.floor(p*final.length);
      el.textContent=[...final].map((c,i)=>c===" "||c==="-"||i<k?c:set[(Math.random()*set.length)|0]).join("");
      if(p<1&&el.isConnected)requestAnimationFrame(step);
      else{el.textContent=final;el.style.minHeight=""}
    };
    step();
  },
  // frase que troca de palavra (pausa quando a aba fica oculta)
  stopRot(){clearInterval(this._rot);this._rot=0},
  rotate(el){
    this.stopRot();
    if(!el||!M||!fxOn())return;
    const items=[...el.children];if(items.length<2)return;
    let i=0;
    el.style.width=items[0].offsetWidth+"px";
    this._rot=setInterval(()=>{
      if(document.hidden||!el.isConnected){if(!el.isConnected)this.stopRot();return}
      const cur=items[i];i=(i+1)%items.length;const nx=items[i];
      nx.style.visibility="visible";
      el.style.width=nx.offsetWidth+"px";
      this.safe(()=>{
        M.animate(cur,{y:["0%","-115%"],opacity:[1,0]},{duration:.42,ease:EXPO});
        M.animate(nx,{y:["115%","0%"],opacity:[0,1]},{duration:.55,ease:EXPO}).finished.then(()=>{cur.style.visibility="hidden"});
      });
    },2700);
  }
});
// faíscas: só em botões, cartas e peças (não nas teclas do PsicoTermo)
document.addEventListener("pointerdown",e=>{
  const t=e.target.closest&&e.target.closest(".slot,.btn,.icon-btn,.cx-tile,.mi,.tab");
  if(!t||t.disabled)return;
  const g=getComputedStyle(t).getPropertyValue("--g").trim();
  const color=(t.matches(".btn:not(.accent)")||t.matches(".icon-btn")||!g)?getComputedStyle(t).color:g;
  fx.spark(e.clientX,e.clientY,color);
},{passive:true});

/* ============ ABERTURA E TRANSIÇÃO ENTRE TELAS ============ */
// Animações nativas (Web Animations): só transform e opacity, correm no compositor e não pesam no telemóvel.
const OUT="cubic-bezier(0.16, 1, 0.3, 1)";
const entra=(els,de,{dur=550,passo=60,inicio=0}={})=>{
  [...els].forEach((el,i)=>el.animate({opacity:[0,1],transform:[de,"none"]},{duration:dur,delay:inicio+i*passo,easing:OUT,fill:"backwards"}));
};
Object.assign(fx,{
  // entrada leve quando se volta ao hub ou abre um jogo
  settle(els,y=14){
    if(!M||!fxOn()||!els.length)return;
    this.safe(()=>entra(els,`translateY(${y}px)`,{dur:500,passo:50}));
  },
  // os quatro canais entram em sequência, vindos da esquerda, e o painel do dia sobe
  intro(){
    if(!M||!fxOn())return;
    const rows=document.querySelectorAll(".bgc,.rw"),panel=document.querySelector(".today");
    this.safe(()=>{
      entra(rows,"translateX(-40px)",{dur:650,passo:80,inicio:350});
      if(panel)entra([panel],"translateY(20px)",{dur:650,inicio:150});
    });
  },
  // o anel de progresso se preenche
  ring(el,C,off){
    if(!el||!M||!fxOn())return;
    this.safe(()=>M.animate(el,{strokeDashoffset:[C,off]},{duration:1.1,ease:EXPO,delay:.5}));
  },
  // um círculo na cor do jogo cresce a partir do toque e revela a nova tela
  open(el,done,pt){
    if(this._op)return;
    if(!M||!fxOn()){done();return}
    this._op=1;setTimeout(()=>{this._op=0},1000);
    const r=el.getBoundingClientRect();
    const x=pt?pt.x:r.left+r.width/2,y=pt?pt.y:r.top+r.height/2;
    const host=el.closest(".rw,.bgc,.ch,.nd")||el;
    const cs=getComputedStyle(host);const col=cs.getPropertyValue("--gc").trim()||cs.getPropertyValue("--g").trim()||"#8FA3F5";
    const R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+24;
    const rp=document.createElement("div");rp.className="ripple";
    rp.style.cssText=`inset:auto;left:${x-R}px;top:${y-R}px;width:${2*R}px;height:${2*R}px;border-radius:50%;background:${col};will-change:transform,opacity`;
    document.body.appendChild(rp);
    let fired=false;const fire=()=>{if(fired)return;fired=true;done()};
    // círculo que cresce por transform (compositor), em vez de animar clip-path no ecrã inteiro
    const cresce=rp.animate({transform:[`scale(${18/R})`,"scale(1)"]},{duration:480,easing:"cubic-bezier(.6,0,.2,1)",fill:"forwards"});
    cresce.finished.then(()=>{fire();return rp.animate({opacity:[1,0]},{duration:420,fill:"forwards"}).finished}).then(()=>rp.remove(),()=>rp.remove());
    setTimeout(()=>{fire();if(rp.isConnected)setTimeout(()=>rp.remove(),600)},800);
  }
});



export { fx, M, A, fxOn, EXPO, SPRING, RMQ };

// No iPhone, a barra do Safari adota a cor do círculo da animação e pode ficar presa nela:
// ao voltar ao app, qualquer círculo esquecido é removido.
if (typeof document !== "undefined") {
  const limparCirculos = () => document.querySelectorAll(".ripple").forEach((e) => e.remove());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) limparCirculos();
  });
  addEventListener("pageshow", limparCirculos);
}
