/* Original artwork and timelines are replayed locally; no original trackers are loaded. */
const origin = location.origin;
const rewriteRules = [
  [/^https?:\/\/(?:www\.)?barbie\.com(?::80)?\//i, origin + '/'],
  [/^https?:\/\/icanbe\.barbie\.com\//i, origin + '/_original/icanbe.barbie.com/'],
  [new RegExp('^https?://((?!'+location.host.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:/|$))[^/]+)/','i'), origin + '/_external/$1/'],
];
window.RufflePlayer = {config:{autoplay:'on',unmuteOverlay:'hidden',splashScreen:false,contextMenu:'off',warnOnUnsupportedContent:false,logLevel:'warn',wmode:'transparent',allowScriptAccess:true,openUrlMode:'allow',urlRewriteRules:rewriteRules,publicPath:'/vendor/ruffle/'}};
const sections = [
  ['Games','/activities/fun_games/','fun_games'],['Videos','/activities/btv/','btv'],['Fashion','/activities/fashion/','fashion'],['Sisters & Friends','/activities/friends/','friends'],['Fairytale','/activities/fantasy/','fantasy'],['I Can Be…','/_original/icanbe.barbie.com/en_us/index.html','iCanBe']
];
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
  const selected=sections.find(s=>normalize(s[1])===path);
  const isHome=path==='/'||path==='/index.aspx'||path==='/index.html';
  const nav=document.getElementById('navigation');
  const accessible=document.createElement('div');accessible.className='fallback-links';
  for(const [name,href] of [['Barbie home','/'],...sections]){const a=document.createElement('a');a.href=href;a.textContent=name;accessible.append(a,document.createTextNode(' | '));}
  nav.append(accessible);
  const jobs=[movie(nav,'/global/barbie_nav_new.swf',820,100,{cat:selected?.[2]||'homepage'}),movie(document.getElementById('shop'),'/global/shop_barbie_btn.swf',131,140)];
  const main=document.getElementById('main');
  if(isHome){
    main.innerHTML='<div class="home-hero" aria-label="Barbie homepage slideshow"></div><div class="promos" aria-label="More Barbie activities"></div>';
    jobs.push(movie(main.firstElementChild,'/global/homepageCDARotation/HomeCDA.swf',910,520,{domain:'*'}));
    jobs.push(movie(main.lastElementChild,'/global/grownups/grownupsPromos.swf',725,180));
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
