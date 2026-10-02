import welcome, {renderWelcome} from './welcome.js';

// Navigation, background and timing belong to the homepage carousel, never to a scene.
// Each legacy entry uses the original HomeCDA.swf with a one-slide XML copy so
// its original animation and click targets remain intact.
const slides = [
  {id:'dreamhouse-puzzle-party',label:'Dreamhouse Puzzle Party',kind:'legacy',legacy:1,background:'/images/header/01BG-clean.png',duration:10000},
  {id:'blid-profile',label:'BLID Profile',kind:'legacy',legacy:2,background:'/images/header/02BG-clean.png',duration:10000},
  {id:'my-dreamhouse',label:'My Dreamhouse',kind:'legacy',legacy:3,background:'/images/header/03BG-clean.png',duration:10000},
  {...welcome,label:'Welcome',kind:'scene'}
];

// Frames exported from the original HomeCDA.swf arrow and sparkle MovieClips.
// Flash played the arrow at 30 fps, stopped on frame 7 on rollover, and
// stopped the sparkle outline on frame 39. The rollout ended on frame 15.
const arrowFrame = (direction,frame) => `/carousel/original-arrows/${direction}/${frame}.png`;
const sparkleFrame = frame => `/carousel/original-arrows/sparkle/${frame}.png`;
const arrowFrameDuration = 1000 / 30;
const arrowPreloads = [];

function preloadOriginalArrowFrames() {
  if (arrowPreloads.length) return;
  for (const direction of ['previous','next']) {
    for (let frame = 1; frame <= 15; frame++) {
      const image = new Image();
      image.src = arrowFrame(direction,frame);
      arrowPreloads.push(image);
    }
  }
  for (let frame = 1; frame <= 39; frame++) {
    const image = new Image();
    image.src = sparkleFrame(frame);
    arrowPreloads.push(image);
  }
}

function restoreOriginalArrow(button,direction) {
  const art = document.createElement('img');
  art.className = 'home-carousel-arrow-art';
  art.src = arrowFrame(direction,1);
  art.alt = '';
  art.draggable = false;
  const sparkle = document.createElement('img');
  sparkle.className = 'home-carousel-arrow-sparkle';
  sparkle.alt = '';
  sparkle.draggable = false;
  sparkle.hidden = true;
  button.append(art,sparkle);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pointerInside = false;
  let focusInside = false;
  let animation = 0;
  let hovered = false;
  const stopAnimation = () => { cancelAnimationFrame(animation); animation = 0; };
  const setArrowFrame = frame => { art.src = arrowFrame(direction,frame); };
  const play = (hover) => {
    if (hover === hovered) return;
    hovered = hover;
    stopAnimation();
    if (reducedMotion.matches) {
      setArrowFrame(hover ? 7 : 1);
      sparkle.hidden = true;
      return;
    }
    const start = performance.now();
    if (hover) {
      setArrowFrame(2);
      sparkle.src = sparkleFrame(1);
      sparkle.hidden = false;
    } else {
      sparkle.hidden = true;
      setArrowFrame(8);
    }
    const tick = now => {
      const elapsedFrames = Math.max(0,Math.floor((now - start) / arrowFrameDuration));
      if (hover) {
        setArrowFrame(Math.min(7,2 + elapsedFrames));
        sparkle.src = sparkleFrame(Math.min(39,1 + elapsedFrames));
        if (elapsedFrames < 38) animation = requestAnimationFrame(tick);
      } else {
        setArrowFrame(Math.min(15,8 + elapsedFrames));
        if (elapsedFrames < 7) animation = requestAnimationFrame(tick);
      }
    };
    animation = requestAnimationFrame(tick);
  };
  const update = () => play(pointerInside || focusInside);
  button.addEventListener('pointerenter',()=>{ pointerInside = true; update(); });
  button.addEventListener('pointerleave',()=>{ pointerInside = false; update(); });
  button.addEventListener('focus',()=>{ focusInside = button.matches(':focus-visible'); update(); });
  button.addEventListener('blur',()=>{ focusInside = false; update(); });
}

export function renderHomeCarousel(host) {
  preloadOriginalArrowFrames();
  const active = slides.filter(slide => slide.enabled !== false);
  host.classList.add('home-carousel');
  document.body.classList.add('home-with-carousel');
  const viewport = document.createElement('div');
  viewport.className = 'home-carousel-viewport';
  const lowerFrame = document.createElement('div');
  lowerFrame.className = 'home-carousel-lower-frame';
  lowerFrame.setAttribute('aria-hidden','true');
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
  restoreOriginalArrow(previous,'previous');
  restoreOriginalArrow(next,'next');
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
  host.append(viewport,lowerFrame,nav);
  let current = -1;
  let timer;
  let generation = 0;
  let disposeScene;
  const background = document.getElementById('background');
  const applyBackground = () => {
    const slide = active[current];
    if (!slide) return;
    background.style.backgroundImage = `url("${slide.background}")`;
    background.style.backgroundSize = slide.kind === 'legacy' ? '1920px 983px' : 'cover';
    background.style.backgroundPosition = slide.kind === 'legacy' ? 'center top' : 'center center';
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
