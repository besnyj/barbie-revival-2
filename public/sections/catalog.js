import { catalogData } from './catalog-data.js';

const local = path => path.startsWith('/') ? path : `/${path}`;

function ensureStyles() {
  if (document.querySelector('link[data-catalog-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = '/sections/catalog.css'; link.dataset.catalogStyle = 'true';
  document.head.append(link);
}

/** Render the June 2013 server-rendered catalog snapshot.
 * movie is injected by app.js so the original section hero still plays in Ruffle.
 */
export async function renderCatalog(main, kind, movie) {
  ensureStyles();
  const catalog = catalogData[kind];
  if (!catalog) throw new Error(`Unknown catalog: ${kind}`);
  main.classList.add('section-stage');
  main.replaceChildren();
  const hero = document.createElement('div');
  hero.className = 'catalog-hero';
  const listing = document.createElement('section');
  listing.className = `catalog catalog-${kind}`;
  listing.innerHTML = `
    <div class="catalog-tabs" role="tablist" aria-label="${kind === 'fantasy' ? 'Fairytale' : 'Games'} categories"></div>
    <div class="catalog-panel"><div class="catalog-grid"></div></div>`;
  const tabList = listing.querySelector('.catalog-tabs');
  const grid = listing.querySelector('.catalog-grid');
  const selected = catalog.tabs.find(tab => tab.image === catalog.selected) || catalog.tabs[0];
  const renderCards = () => {
    grid.replaceChildren(...catalog.cards.map(card => {
      const link = document.createElement('a');
      link.className = 'catalog-card'; link.href = local(card.href); link.title = card.blurb;
      link.innerHTML = `<img src="${local(card.image)}" alt="${card.title}"><span>${card.title}</span><b>${card.blurb}</b>`;
      return link;
    }));
  };
  for (const tab of catalog.tabs) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'catalog-tab'; button.dataset.tab = tab.id;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-selected', String(tab === selected));
    button.innerHTML = `<img src="${local(tab === selected ? catalog.selected : tab.image)}" alt="${tab.id}">`;
    button.addEventListener('click', () => {
      tabList.querySelectorAll('[aria-selected=true]').forEach(item => {
        item.setAttribute('aria-selected', 'false');
        const previous = catalog.tabs.find(candidate => candidate.id === item.dataset.tab);
        if (previous) item.firstElementChild.src = local(previous.image);
      });
      button.setAttribute('aria-selected', 'true');
      // WebForms returned different records after a server postback. Only the
      // saved initial result is available, so keep it visible and label this honestly.
      listing.dataset.unavailableCategory = tab === selected ? '' : tab.id;
    });
    tabList.append(button);
  }
  main.append(hero, listing);
  renderCards();
  await movie(hero, local(catalog.hero), 990, 390, {});
}
