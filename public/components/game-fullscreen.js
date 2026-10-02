const stylesheet = new URL('./game-fullscreen.css', import.meta.url).href;

/** Add fullscreen controls without recreating or reloading the game. */
export function attachGameFullscreen(container, surface, { width, height } = {}) {
  if (!document.querySelector('link[data-game-fullscreen]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheet;
    link.dataset.gameFullscreen = '';
    document.head.append(link);
  }

  container.classList.add('game-fullscreen');
  surface.classList.add('game-fullscreen-surface');
  container.style.setProperty('--game-ratio', (width || 16) / (height || 9));

  const controls = document.createElement('div');
  controls.className = 'game-fullscreen-controls';
  const status = document.createElement('span');
  status.className = 'game-fullscreen-status';
  status.setAttribute('role', 'status');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'game-fullscreen-button';
  controls.append(status, button);
  container.append(controls);

  let wasFullscreen = false;
  const sync = () => {
    const active = document.fullscreenElement === container;
    button.textContent = active ? '⤢ Sair da tela cheia' : '⛶ Tela cheia';
    button.setAttribute('aria-pressed', String(active));
    button.title = active ? 'Sair da tela cheia (Esc)' : 'Abrir jogo em tela cheia';
    status.textContent = active ? 'Esc para sair' : '';
    if (wasFullscreen && !active) button.focus({ preventScroll: true });
    wasFullscreen = active;
  };

  button.hidden = !document.fullscreenEnabled || !container.requestFullscreen;
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch {
      status.textContent = 'Não foi possível alterar a tela cheia. Tente novamente.';
    } finally {
      button.disabled = false;
    }
  });
  document.addEventListener('fullscreenchange', sync);
  sync();

  return () => {
    document.removeEventListener('fullscreenchange', sync);
    controls.remove();
    container.classList.remove('game-fullscreen');
    surface.classList.remove('game-fullscreen-surface');
    container.style.removeProperty('--game-ratio');
  };
}
