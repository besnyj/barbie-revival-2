/* I Can Be home, rebuilt from the 28 June 2013 page source. */
const ROOT = '/_original/icanbe.barbie.com';
const asset = path => `${ROOT}${path}`;
const route = path => `${ROOT}${path.startsWith('/') ? path : `/${path}`}`;

const promos = [
  {name:'Pet Vet', kicker:'', bg:'/en_US/Images/background_pv2_tcm107-2760.jpg', layers:['/en_US/Images/Level0_tcm107-2761.png','/en_US/Images/Level1_tcm107-2762.png','/en_US/Images/Level2_tcm107-2763.png'], cloud:'/en_US/Images/ICB_Home_Promo_Cloud_PetVet_tcm107-3128.png', game:'/en_US/games/little-critter-clinic.html', video:'/en_US/videos/petvet.html', doll:'/en_US/Dolls/index.html'},
  {name:'Team Barbie', kicker:'', bg:'/en_US/Images/background_tcm107-4346.jpg', layers:['/en_US/Images/level0_tcm107-4348.png','/en_US/Images/level1_tcm107-4349.png','/en_US/Images/level2_tcm107-4350.png','/en_US/Images/level3_tcm107-4351.png'], cloud:'/en_US/Images/Promo_Cloud_Team_tcm107-4347.png', doll:'/en_US/dolls/team_barbie.html'},
  {name:'Fashion Designer', kicker:'Career of the year', bg:'/en_US/Images/background_tcm107-2764.jpg', layers:['/en_US/Images/level0_tcm107-2765.png','/en_US/Images/level1_tcm107-2766.png','/en_US/Images/level2_tcm107-2767.png','/en_US/Images/level3_tcm107-2768.png'], cloud:'/en_US/Images/ICB_Home_Promo_Cloud_FashionDesigner_tcm107-3130.png', game:'/en_US/games/index.html', video:'/en_US/videos/index.html', doll:'/en_US/Dolls/index.html'},
  {name:'Architect', kicker:'', bg:'/en_US/Images/background_tcm107-1266.jpg', layers:['/en_US/Images/level0_tcm107-1267.png','/en_US/Images/level1_tcm107-1268.png','/en_US/Images/level2_tcm107-1272.png'], cloud:'/en_US/Images/cloud-green_tcm107-1273.png', game:'/en_US/games/amazing-architect.html', video:'/en_US/videos/index.html', doll:'/en_US/Dolls/index.html'}
];

function img(path, className, alt='') {
  return `<img class="${className}" src="${asset(path)}" alt="${alt}" onerror="this.classList.add('icb-missing')">`;
}
function actions(promo) {
  const actions = promo.game ? `<a href="${route(promo.game)}" class="icb-cloud-action">${img('/en_US/Images/game_tcm107-1270.png','icb-action-icon')}<b>play</b><em>the game</em></a>` : '';
  const video = promo.video ? `<a href="${route(promo.video)}" class="icb-cloud-action">${img('/en_US/Images/video_tcm107-1271.png','icb-action-icon')}<b>watch</b><em>the video</em></a>` : '';
  const dollArt = promo.name === 'Architect' ? '/en_US/Images/doll-architect_tcm107-1269.png' : promo.name === 'Team Barbie' ? '/en_US/Images/Home_Doll_Team_Swimmer_tcm107-4352.png' : promo.name === 'Pet Vet' ? '/en_US/Images/Home_Doll_PetVet_tcm107-3129.png' : '/en_US/Images/Home_Doll_FashionDesigner_tcm107-3131.png';
  return `${actions}${video}<a href="${route(promo.doll)}" class="icb-cloud-action">${img(dollArt,'icb-action-icon')}<b>see</b><em>the doll${promo.name === 'Team Barbie' ? 's' : ''}</em></a>`;
}
function slide(promo, index) {
  return `<article class="icb-slide icb-slide-${index}" aria-label="${promo.name}" ${index ? 'hidden' : ''}>
    ${img(promo.bg, 'icb-background')}
    ${promo.layers.map((path, layer) => img(path, `icb-layer icb-layer-${layer}`)).join('')}
    <div class="icb-title">${promo.kicker ? `<small>${promo.kicker}</small>` : ''}<strong>${promo.name}</strong></div>
    <aside class="icb-cloud">${img(promo.cloud, 'icb-cloud-art')}<div class="icb-cloud-actions">${actions(promo)}</div></aside>
  </article>`;
}

export async function renderICanBe(main) {
  if (!main) return;
  if (!document.getElementById('icanbe-style')) {
    const css = document.createElement('link');
    css.id = 'icanbe-style'; css.rel = 'stylesheet'; css.href = '/sections/icanbe.css';
    document.head.append(css);
  }
  document.title = 'Barbie I Can Be Games for Girls, Online Videos & Awards Closet | Barbie I Can Be';
  main.className = 'icanbe-main';
  main.innerHTML = `<section class="icanbe" aria-label="Barbie I Can Be">
    <header class="icb-header">
      <a class="icb-barbie" href="/" aria-label="Barbie home">${img('/resources/img/logo-barbie.gif','icb-barbie-art','Barbie')}</a>
      <div class="icb-ad-slot" aria-label="Advertisement area"></div>
      <div class="icb-local-nav">
        <a class="icb-logo" href="${route('/en_US/index.html')}">${img('/resources/img/logo-i-can-be.gif','icb-logo-art','Barbie I Can Be')}</a>
        <nav aria-label="I Can Be navigation"><a href="${route('/en_US/careers/index.html')}">${img('/resources/img/nav/btn-careers.png','icb-nav-art','careers')}</a><a href="${route('/en_US/games/index.html')}">${img('/resources/img/nav/btn-games.png','icb-nav-art','games')}</a><a href="${route('/en_US/videos/index.html')}">${img('/resources/img/nav/btn-videos.png','icb-nav-art','videos')}</a><a href="${route('/en_US/Dolls/index.html')}">${img('/resources/img/nav/btn-dolls.png','icb-nav-art','dolls')}</a><a href="${route('/en_US/help.html')}">help</a></nav>
        <a class="icb-code" href="${route('/en_US/gotacode.html')}">Got a code?</a>
      </div>
    </header>
    <div class="icb-stage" tabindex="0" aria-roledescription="carousel">
      <button class="icb-arrow icb-prev" type="button" aria-label="Previous promotion">‹</button>
      <div class="icb-slides">${promos.map(slide).join('')}</div>
      <button class="icb-arrow icb-next" type="button" aria-label="Next promotion">›</button>
      <div class="icb-dots" aria-label="Promotion selection">${promos.map((p,i) => `<button type="button" aria-label="Show ${p.name}" aria-current="${i === 0 ? 'true' : 'false'}"></button>`).join('')}</div>
    </div>
    <p class="icb-message">Barbie lets you be anything you want to be!</p>
    <section class="icb-bottom">
      <article class="icb-featured"><div class="icb-ballerina">${img('/en_US/Images/ICB_Home_LowerLeft_promo_Ballerina_tcm107-49994.jpg','icb-feature-img','Featured Career – Ballerina')}</div><div class="icb-small-banner"><small>Featured Career</small><strong>Ballerina</strong></div><a href="${route('/en_US/Games/tutu-star.html')}" class="icb-inline-play">Play</a></article>
      <article class="icb-careers"><div class="icb-small-banner"><small>Who do you want to be?</small><strong>More Careers</strong></div><a href="${route('/en_US/careers/professional.html')}" class="icb-more-careers">check out more <b>careers</b></a><div class="icb-career-roll" aria-label="Careers"><span>News Anchor</span><span>Vet</span><span>Art Teacher</span><span>Architect</span><span>Pastry Chef</span><span>Ballerina</span><span>Computer Engineer</span></div></article>
    </section>
  </section>`;

  const slides = [...main.querySelectorAll('.icb-slide')];
  const dots = [...main.querySelectorAll('.icb-dots button')];
  let current = 0, timer;
  const show = index => {
    current = (index + slides.length) % slides.length;
    slides.forEach((node, i) => { node.hidden = i !== current; });
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
  };
  const restart = () => { clearInterval(timer); timer = setInterval(() => show(current + 1), 7000); };
  main.querySelector('.icb-prev').addEventListener('click', () => { show(current - 1); restart(); });
  main.querySelector('.icb-next').addEventListener('click', () => { show(current + 1); restart(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restart(); }));
  main.querySelector('.icb-stage').addEventListener('pointermove', event => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = (event.offsetX / event.currentTarget.clientWidth - .5) * 16;
    slides[current]?.style.setProperty('--icb-parallax', `${x}px`);
  });
  restart();
}
