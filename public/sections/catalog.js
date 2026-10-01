import { catalogData } from './catalog-data.js';

/* Faithful June 2013 catalog: original ids/classes from the archived page and
 * BarbieRefresh.css. Only the initially rendered WebForms category was
 * archived; other tabs keep the initial listing and say so honestly. */
const local = path => (path.startsWith('/') || /^https?:/i.test(path)) ? path : `/${path}`;

function ensureStyles() {
  if (document.querySelector('link[data-catalog-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/sections/catalog.css';
  link.dataset.catalogStyle = 'true';
  document.head.append(link);
}

function externalHost(href) {
  try {
    const url = new URL(href, location.origin);
    return url.host !== location.host;
  } catch { return false; }
}

export async function renderCatalog(main, kind, movie) {
  ensureStyles();
  const catalog = catalogData[kind];
  if (!catalog) throw new Error(`Unknown catalog: ${kind}`);
  const chrome = catalog.chrome;
  if (kind === 'fantasy') {
    document.title = 'Barbie Fairytale - Play Fantasy Puzzle & Dress-up Games, Barbie Coloring Pages & Videos | Barbie';
  } else {
    document.title = 'Barbie Games - Play Fun Games for Girls - Princess Games, Baby Games, Dress-Up & Makeover Games';
  }
  document.getElementById('background').style.backgroundImage = "url('/images/header/barbiebg.jpg')";
  document.body.classList.add('catalog-page', `catalog-${kind}`);
  main.textContent = '';
  const footer = document.querySelector('.site > footer');
  if (footer) footer.hidden = true;

  const stage = document.createElement('div');
  stage.className = 'catalog-stage';
  stage.style.setProperty('--listing-margin', chrome.listingMarginTop);
  stage.style.setProperty('--footer-margin', chrome.footerMarginTop);

  stage.innerHTML = `
    <div id="flcontent"><div class="catalog-hero" aria-label="${kind === 'fantasy' ? 'Fairytale' : 'Games'} hero"></div></div>
    <div class="catalog-header-art"><img src="${local(chrome.headerArt)}" alt=""></div>
    <div id="aggrigator_holder">
      <div id="GamesListingContainer">
        <div id="gameslist_UpdPnlListing">
          <div id="gameslist_divSelectedCat" class="tabSelected ${kind === 'fantasy' ? 'princessSelected' : 'whats-hotSelected'}">
            <img id="gameslist_imgSelectedCategory" src="${local(catalog.selected)}" alt="">
          </div>
          <div id="itemslistwrapper">
            <div id="categoryWrapper"></div>
            <div id="containerTop"></div>
            <div class="catalog-clear"></div>
            <div class="catalog-notice" hidden>The June 2013 archive preserved only the initially loaded category listing; the original server results for the other categories were not archived.</div>
            <div id="itemslistContainer">
              <div id="itemslist"></div>
              <div class="catalog-clear"></div>
            </div>
            <div id="containerBottom"></div>
            <div class="catalog-clear"></div>
          </div>
          <div class="catalog-clear"></div>
        </div>
      </div>
    </div>
    <div id="footer_links">
      Site Map&nbsp;|&nbsp;Privacy&nbsp;|&nbsp;Credit&nbsp;|&nbsp;About<br>
      <span class="footergrey">Barbie Revival is an unofficial fan preservation project and is not affiliated with or endorsed by Mattel. Barbie and related trademarks belong to Mattel, Inc.<br>Barbie Revival 2026</span>
    </div>
    <div id="footer_bg"><img src="${local(chrome.footerArt)}" alt=""></div>`;

  const itemslistContainer = stage.querySelector('#itemslistContainer');
  itemslistContainer.style.backgroundImage = `url('${local(chrome.aggCenter)}')`;

  const itemslist = stage.querySelector('#itemslist');
  for (const card of catalog.cards) {
    const thumb = document.createElement('div');
    thumb.className = 'itemthumb';
    const detail = document.createElement('div');
    detail.className = 'itemthumbdetail';
    const title = document.createElement('span');
    title.textContent = card.title;
    detail.innerHTML = `
      <div class="itemthumbimage"><a href="${card.href}"><img src="${local(card.image)}" border="0" alt="${card.title.replace(/"/g, '&quot;')}"></a></div>
      <div class="itemdetail"><div class="thumbitemname"><a href="${card.href}"><span></span></a></div></div>`;
    detail.querySelector('span').replaceWith(title);
    thumb.append(detail);
    thumb.addEventListener('mouseover', () => {
      thumb.classList.add('itemthumbHover');
      title.textContent = card.blurb;
    });
    thumb.addEventListener('mouseout', () => {
      thumb.classList.remove('itemthumbHover');
      title.textContent = card.title;
    });
    itemslist.append(thumb);
  }
  itemslist.append(Object.assign(document.createElement('div'), { style: 'clear:both;height:1px;' }));

  const categoryWrapper = stage.querySelector('#categoryWrapper');
  for (const [index, tab] of catalog.tabs.entries()) {
    const holder = document.createElement('div');
    holder.className = index === 0 ? 'categoryButtonSel' : 'categoryButton';
    holder.style.zIndex = String(190 - index * 10);
    const input = document.createElement('input');
    input.type = 'image';
    input.src = local(tab.image);
    input.alt = tab.id;
    input.border = '0';
    if (tab.hover) {
      input.addEventListener('mouseover', () => { input.src = local(tab.hover); });
      input.addEventListener('mouseout', () => { input.src = local(tab.image); });
    }
    holder.append(input);
    if (index > 0) {
      holder.addEventListener('click', () => {
        stage.querySelector('.catalog-notice').hidden = false;
        input.src = local(tab.hover || tab.image);
      });
    }
    categoryWrapper.append(holder);
  }

  stage.querySelectorAll('a').forEach(link => {
    if (externalHost(link.getAttribute('href'))) {
      link.addEventListener('click', event => {
        event.preventDefault();
        window.pop();
      });
    }
  });

  main.append(stage);
  await movie(stage.querySelector('.catalog-hero'), local(catalog.hero), 990, 390, {});
}
