/* Original artwork and timelines are replayed locally; no original trackers are loaded. */
const origin = location.origin;
const rewriteRules = [
  [/^https?:\/\/(?:www\.)?barbie\.com(?::80)?\//i, origin + '/'],
  [/^https?:\/\/icanbe\.barbie\.com\//i, origin + '/_original/icanbe.barbie.com/'],
  [/^https?:\/\/dreamhouse\.barbie\.com\/en-US\/games\/puzzle-party\/?$/i, origin + '/dreamhouse/puzzle-party/'],
  [new RegExp('^https?://((?!'+location.host.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:/|$))[^/]+)/','i'), origin + '/_external/$1/'],
];
window.RufflePlayer = {config:{autoplay:'on',unmuteOverlay:'hidden',splashScreen:false,contextMenu:'off',warnOnUnsupportedContent:false,logLevel:(new URLSearchParams(location.search).has('ruffletrace')?'trace':'warn'),wmode:'transparent',allowScriptAccess:true,openUrlMode:'allow',urlRewriteRules:rewriteRules,publicPath:'/vendor/ruffle/'}};
const sections = [
  ['Games','/activities/fun_games/','fun_games'],['Fairytale','/activities/fantasy/','fantasy'],['Fashion','/activities/fashion/','fashion'],['Sisters & Friends','/activities/friends/','friends'],['I Can Be…','/_original/icanbe.barbie.com/en_us/index.html','iCanBe'],['Videos','/activities/btv/','btv']
];
const bottomPages = {
  '/restoration/blog':'Blog',
  '/restoration/printables':'Printables',
  '/restoration/e-book':'E-book',
  '/restoration/wallpapers':'Wallpapers'
};
const noop = ()=>{};
window.trackAction = noop;
window.trackClick = noop;
window.trackEvent = noop;
window.Tracker = {track:noop,enableShortCuts:noop};
window.MATTEL = {tracker:{Tracker:window.Tracker}};
window.utag = {link:noop,view:noop};
window.updateBackground = index => {
  const n = Math.max(0,Math.min(2,Number(index)||0))+1;
  document.getElementById('background').style.backgroundImage = `url('/images/header/0${n}BG.jpg')`;
};
window.ChangeBackgroundImage = window.updateBackground;
function showRestoration(){document.getElementById('restoration').showModal();}
window.pop = showRestoration;
window.openMagazine = showRestoration;

function interstitialRedirect(){
  const raw = location.search.slice(1);
  if (!raw.startsWith('redirect=')) return null;
  let url = raw.slice(9);
  try { url = decodeURIComponent(url); } catch {}
  return /^https?:\/\//i.test(url) ? url : null;
}
function renderInterstitial(redirect){
  document.title = 'Barbie.com - Partner Interstitial';
  document.body.classList.add('interstitial-page');
  const stage = document.createElement('div');
  stage.className = 'interstitial';
  stage.innerHTML = `
    <img src="/images/interstitial/interstitial_Barbie.jpg" alt="You are now leaving Barbie.com" border="0" usemap="#interstitialMap">
    <map name="interstitialMap" id="interstitialMap">
      <area shape="rect" coords="414,259,528,301" href="#interstitial-go" alt="Keep Going">
      <area shape="rect" coords="213,259,392,301" href="#interstitial-back" alt="Back">
    </map>`;
  const leave = () => {
    try {
      if (document.referrer && new URL(document.referrer).host === location.host) {
        location.href = document.referrer;
        return;
      }
    } catch {}
    location.href = '/';
  };
  stage.querySelector('area[href="#interstitial-go"]').addEventListener('click', event => {
    event.preventDefault();
    const win = window.open(redirect, '_blank');
    if (win) { win.opener = null; leave(); } else { location.href = redirect; }
  });
  stage.querySelector('area[href="#interstitial-back"]').addEventListener('click', event => {
    event.preventDefault();
    leave();
  });
  document.body.append(stage);
}
document.addEventListener('click', event => {
  const link = event.target && event.target.closest ? event.target.closest('a') : null;
  if (!link || event.defaultPrevented) return;
  const href = link.getAttribute('href') || '';
  if (!/^https?:/i.test(href)) return;
  let url;
  try { url = new URL(href); } catch { return; }
  if (url.host === location.host) return;
  if (url.hostname === 'dreamhouse.barbie.com' && normalize(url.pathname) === '/en-US/games/puzzle-party') {
    event.preventDefault();
    event.stopPropagation();
    location.href = '/dreamhouse/puzzle-party/';
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  location.href = '/includes/partner-interstitial.aspx?redirect=' + encodeURIComponent(url.href);
});

async function movie(container,url,width,height,parameters={}) {
  const player = window.RufflePlayer.newest().createPlayer();
  player.style.width=width+'px';player.style.height=height+'px';
  container.append(player);
  const api=player.ruffle();
  api.volume=0;
  await api.load({url,parameters,base:new URL('.',new URL(url,origin)).href});
  api.volume=0;
  return player;
}
const normalize = path => (path.replace(/\/+$/, '') || '/');
window.addEventListener('DOMContentLoaded',async()=>{
  const path=normalize(location.pathname);
  if(path==='/_original/icanbe.barbie.com'){location.replace('/_original/icanbe.barbie.com/en_us/index.html');return;}
  if(path==='/includes/partner-interstitial.aspx'){
    const redirect=interstitialRedirect();
    if(redirect){renderInterstitial(redirect);return;}
    location.replace('/');return;
  }
  if(path.startsWith('/_external/')){
    if (path.toLowerCase() === '/_external/dreamhouse.barbie.com/en-us/games/puzzle-party') {
      location.replace('/dreamhouse/puzzle-party/');
      return;
    }
    renderInterstitial('http://' + path.slice('/_external/'.length) + location.search + location.hash);
    return;
  }
  const selected=sections.find(s=>normalize(s[1])===path);
  const isHome=path==='/'||path==='/index.aspx'||path==='/index.html';
  const nav=document.getElementById('navigation');
  const accessible=document.createElement('div');accessible.className='fallback-links';
  for(const [name,href] of [['Barbie home','/'],...sections]){const a=document.createElement('a');a.href=href;a.textContent=name;accessible.append(a,document.createTextNode(' | '));}
  nav.append(accessible);
  const hitAreas=document.createElement('div');hitAreas.className='nav-hit-areas';
  for(const [name,href] of [['Barbie home','/'],...sections]){const a=document.createElement('a');a.href=href;a.setAttribute('aria-label',name);hitAreas.append(a);}
  nav.append(hitAreas);
  const navDeadline=performance.now()+5000;
  const navJob=movie(nav,'/global/barbie_nav_ordered.swf?v=1',820,100,{cat:selected?.[2]||'homepage'});
  navJob.then(player=>setTimeout(()=>{
    if(!player.isConnected||typeof player.pause!=='function')return;
    player.pause();
    const playButton=player.shadowRoot?.getElementById('play-button');
    if(playButton)playButton.style.display='none';
    nav.classList.add('nav-paused');
  },Math.max(0,navDeadline-performance.now())),noop);
  const jobs=[navJob];
  const main=document.getElementById('main');
  if(isHome){
    document.body.classList.add('home-layout');
    const showOriginalCarousel=new URLSearchParams(location.search).has('original-carousel');
    const shoppingLink=url=>'/includes/partner-interstitial.aspx?redirect='+encodeURIComponent(url);
    const bottomButton=(name,image,index,href)=>`<a class="bottom-page-button" href="${href}" style="--button-index:${index}"><span class="bottom-page-art" style="background-image:url('/images/bottom-pages/${image}.png')" aria-hidden="true"></span><span class="bottom-page-label"><span>${name}</span><span class="bottom-page-arrow" aria-hidden="true">›</span></span></a>`;
    main.innerHTML='<div class="home-hero" aria-label="Barbie homepage slideshow"></div><section class="bottom-pages" aria-label="Páginas do bottom"><div class="bottom-pages-grid">'+
      bottomButton('Blog','blog',0,'/restoration/blog/')+bottomButton('Printables','printables',1,'/restoration/printables/')+bottomButton('E-book','e-books',2,'/restoration/e-book/')+bottomButton('Wallpapers','wallpapers',3,'/restoration/wallpapers/')+
      '</div><section class="bottom-shopping" aria-labelledby="bottom-shopping-title"><h2 id="bottom-shopping-title"><span>Shopping</span></h2><div class="bottom-pages-grid">'+
      bottomButton('Barbie.com','barbie-com',4,shoppingLink('https://shop.mattel.com/pt-br/pages/barbie'))+bottomButton('Mattel Creations','mattel-creations',5,shoppingLink('https://creations.mattel.com/pages/barbie-signature'))+
      '</div></section></section>';
    if(showOriginalCarousel){
      jobs.push(movie(main.firstElementChild,'/global/homepageCDARotation/HomeCDA.swf',910,520,{domain:'*'}));
    }else{
      for (const href of ['/home-shell.css','/carousel/controller.css','/carousel/welcome.css']) {
        const style=document.createElement('link');style.rel='stylesheet';style.href=href;document.head.append(style);
      }
      const {renderHomeCarousel}=await import('/carousel/controller.js');
      renderHomeCarousel(main.firstElementChild);
    }
    main.querySelectorAll('.bottom-page-button').forEach(button=>button.addEventListener('click',event=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
      event.preventDefault();
      event.stopPropagation();
      button.classList.add('is-clicked');
      window.setTimeout(()=>{location.href=button.href},300);
    }));
  }else if(bottomPages[path]){
    const name=bottomPages[path];
    document.title=name+' - Barbie Revival';
    main.innerHTML=`<section class="restoration-page bottom-restoration"><h1>${name}</h1><p>This page is under restoration and construction. Come back soon!</p><a class="pink-button" href="/">Back to Barbie</a></section>`;
  }else if(selected && ['fashion','friends'].includes(selected[2])){
    const link=document.createElement('link');link.rel='stylesheet';link.href='/sections/classic.css';document.head.append(link);
    const {renderClassic}=await import('/sections/classic.js');
    jobs.push(renderClassic(main,selected[2],movie));
  }else if(selected?.[2]==='btv'){
    const link=document.createElement('link');link.rel='stylesheet';link.href='/sections/videos.css';document.head.append(link);
    const {renderVideos}=await import('/sections/videos.js');
    jobs.push(renderVideos(main,movie));
  }else if(selected && ['fun_games','fantasy'].includes(selected[2])){
    const {renderCatalog}=await import('/sections/catalog.js');
    jobs.push(renderCatalog(main,selected[2],movie));
  }else if(path==='/dreamhouse/puzzle-party'){
    document.title='Dreamhouse Puzzle Party - Barbie';
    main.innerHTML='<div class="dreamhouse-game" aria-label="Dreamhouse Puzzle Party game"></div>';
    const base='/_original/dreamhouse.barbie.com/Content/games/en-US/dreamhousepuzzle/';
    jobs.push(movie(main.firstElementChild,base+'dhpuzzlewrapper.swf',990,550,{assetPath:base}));
  }else if(path==='/my-dreamhouse'){
    document.title='My Dreamhouse - Barbie';
    main.innerHTML='<div class="dreamhouse-status">My Dreamhouse is playable with recovered house and decoration artwork. The original online gallery and save services have not been verified. <a href="https://www.numuki.com/game/barbie-my-dreamhouse/">NuMuKi copy</a>.</div><div class="dreamhouse-game" aria-label="My Dreamhouse game"></div>';
    jobs.push(movie(main.querySelector('.dreamhouse-game'),'/my-dreamhouse/game-numuki.swf',990,800,{environment:origin+'/_original/design-my-dreamhouse.barbie.com',locale:'en-us'}));
  }else if(path==='/sitemap.aspx'){
    main.innerHTML='<div class="site-map"><h1>Site Map</h1><ul>'+sections.map(([name,href])=>`<li><a href="${href}">${name}</a></li>`).join('')+'</ul></div>';
  }else{
    document.title=(selected?.[0]||'Barbie')+' - Barbie';
    main.innerHTML='<section class="restoration-page"><h1>Under restoration</h1><p>This part of Barbie\'s world is coming back soon!</p><a class="pink-button" href="/">Back to Barbie</a></section>';
  }
  document.querySelectorAll('#restoration button').forEach(button=>button.addEventListener('click',()=>document.getElementById('restoration').close()));
  document.getElementById('language-go').addEventListener('click',showRestoration);
  const results=await Promise.allSettled(jobs);
  results.filter(r=>r.status==='rejected').forEach(r=>console.error('Restoration player failed:',r.reason));
});
