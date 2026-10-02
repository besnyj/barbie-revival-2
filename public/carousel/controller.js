import welcome, {renderWelcome} from './welcome.js';

// Navigation, background and timing belong to the homepage carousel, never to a scene.
// Each legacy entry uses the original HomeCDA.swf with a one-slide XML copy so
// its original animation and click targets remain intact.
const slides = [
  {id:'dreamhouse-puzzle-party',label:'Dreamhouse Puzzle Party',kind:'legacy',legacy:1,background:'/images/header/01BG.jpg',duration:10000},
  {id:'blid-profile',label:'BLID Profile',kind:'legacy',legacy:2,background:'/images/header/02BG.jpg',duration:10000},
  {id:'my-dreamhouse',label:'My Dreamhouse',kind:'legacy',legacy:3,background:'/images/header/03BG.jpg',duration:10000},
  {...welcome,label:'Welcome',kind:'scene'}
];

export function renderHomeCarousel(host) {
  const active = slides.filter(slide => slide.enabled !== false);
  host.classList.add('home-carousel');
  document.body.classList.add('home-with-carousel');
  const viewport = document.createElement('div');
  viewport.className = 'home-carousel-viewport';
  const nav = document.createElement('nav');
  nav.className = 'home-carousel-navigation';
  nav.setAttribute('aria-label','Home carousel');
  const previous = document.createElement('button');
  previous.className = 'home-carousel-arrow previous';
  previous.type = 'button';
  previous.setAttribute('aria-label','Previous slide');
  const next = document.createElement('button');
  next.className = 'home-carousel-arrow next';
  next.type = 'button';
  next.setAttribute('aria-label','Next slide');
  const dots = document.createElement('div');
  dots.className = 'home-carousel-dots';
  const dotButtons = active.map((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'home-carousel-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label',`Slide ${index+1}: ${slide.label}`);
    dot.addEventListener('click',()=>select(index));
    dots.append(dot);
    return dot;
  });
  nav.append(previous,next,dots);
  host.append(viewport,nav);
  let current = -1;
  let timer;
  let generation = 0;
  let disposeScene;
  const background = document.getElementById('background');
  const applyBackground = () => {
    const slide = active[current];
    if (!slide) return;
    background.style.backgroundImage = `url("${slide.background}")`;
    background.style.backgroundSize = 'auto';
  };
  // The old controller calls these during loading. The four-slide controller
  // owns the selected background, so late Flash calls cannot desynchronize it.
  window.updateBackground = applyBackground;
  window.ChangeBackgroundImage = applyBackground;
  const select = index => {
    if (!active.length) return;
    clearTimeout(timer);
    const token = ++generation;
    if (disposeScene) { disposeScene(); disposeScene = null; }
    current = (index + active.length) % active.length;
    const slide = active[current];
    applyBackground();
    dotButtons.forEach((button,n) => {
      button.classList.toggle('is-active',n===current);
      button.setAttribute('aria-current',n===current?'true':'false');
    });
    viewport.replaceChildren();
    if (slide.kind === 'scene') {
      disposeScene = renderWelcome(viewport);
    } else {
      const player = window.RufflePlayer.newest().createPlayer();
      player.style.width='910px';
      player.style.height='520px';
      const xml = `${location.origin}/carousel/legacy/${slide.legacy}/HomeCDA.xml`;
      player.config = {
        ...window.RufflePlayer.config,
        urlRewriteRules: [[/^.*HomeCDA\.xml$/,xml],...window.RufflePlayer.config.urlRewriteRules]
      };
      viewport.append(player);
      const api=player.ruffle();
      api.volume=0;
      api.load({url:'/global/homepageCDARotation/HomeCDA.swf',parameters:{domain:'*'},base:`${location.origin}/global/homepageCDARotation/`})
        .then(() => { if (token === generation) { api.volume=0; applyBackground(); } })
        .catch(error => { if (token === generation) console.error('Carousel slide failed:',error); });
    }
    if (active.length > 1) timer=setTimeout(()=>select(current+1),slide.duration);
  };
  previous.addEventListener('click',()=>select(current-1));
  next.addEventListener('click',()=>select(current+1));
  if (active.length > 1) {
    host.addEventListener('mouseenter',()=>clearTimeout(timer));
    host.addEventListener('mouseleave',()=>{clearTimeout(timer);timer=setTimeout(()=>select(current+1),active[current].duration)});
    host.addEventListener('focusin',()=>clearTimeout(timer));
    host.addEventListener('focusout',event=>{
      if (!host.contains(event.relatedTarget)) {
        clearTimeout(timer);
        timer=setTimeout(()=>select(current+1),active[current].duration);
      }
    });
  } else {
    nav.hidden=true;
  }
  select(0);
}
