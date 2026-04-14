(function () {
  'use strict';

  function makePlaceholder(label, bg) {
    const d = document.createElement('div');
    d.className = 'popup-placeholder';
    d.style.background = bg;
    d.textContent = label;
    return d;
  }

  const POPUP_CONTENT = {
    'stained-glass-examples': () => makePlaceholder('STAINED GLASS EXAMPLES', '#e8c547'),
    'colour-wheel':           () => makePlaceholder('COLOUR WHEEL', '#c44'),
    'colour-wheel-red-green': () => makePlaceholder('COLOUR WHEEL — RED + GREEN', '#c44'),
    'colour-wheel-blue-orange': () => makePlaceholder('COLOUR WHEEL — BLUE + ORANGE', '#48c'),
    'colour-mood-yellow':     () => makePlaceholder('YELLOW = HAPPY', '#f4d03f'),
    'colour-mood-blue':       () => makePlaceholder('BLUE = CALM', '#5dade2'),
    'colour-mood-grey':       () => makePlaceholder('GREY = MYSTERIOUS', '#7f8c8d'),
    'texture-soft':           () => makePlaceholder('SOFT (teddy bear)', '#f5cba7'),
    'texture-rough':          () => makePlaceholder('ROUGH (rock)', '#7b6a5a'),
    'texture-smooth':         () => makePlaceholder('SMOOTH (mirror)', '#d6eaf8'),
    'texture-bumpy':          () => makePlaceholder('BUMPY (volcanic rock)', '#5d4037'),
    'form-2d-square':         () => makePlaceholder('2D SQUARE', '#bdc3c7'),
    'form-3d-cube':           () => makePlaceholder('3D CUBE', '#95a5a6'),
    'form-cube-sway':         () => makePlaceholder('3D CUBE (swaying/unstable)', '#d35400'),
    'form-reinforced':        () => makePlaceholder('REINFORCED CUBE', '#c0392b'),
    'form-reinforced-roof':   () => makePlaceholder('REINFORCED CUBE + ROOF', '#a04000'),
    'form-reinforced-base':   () => makePlaceholder('REINFORCED + ROOF + BASE', '#6e2c00')
  };

  function createPlayer(bubbles) {
    let bubbleIndex = 0;
    let lineIndex = 0;
    let done = bubbles.length === 0;
    let lastBubbleIndex = -1;

    const player = {
      get done() { return done; },
      current() {
        if (done) return null;
        const bubble = bubbles[bubbleIndex];
        const line = bubble.lines[lineIndex];
        return {
          bubbleIndex,
          lineIndex,
          line,
          bubble,
          isNewBubble: bubbleIndex !== lastBubbleIndex
        };
      },
      advance() {
        if (done) return;
        lastBubbleIndex = bubbleIndex;
        const bubble = bubbles[bubbleIndex];
        if (lineIndex + 1 < bubble.lines.length) {
          lineIndex++;
        } else if (bubbleIndex + 1 < bubbles.length) {
          bubbleIndex++;
          lineIndex = 0;
        } else {
          done = true;
        }
      }
    };
    return player;
  }

  let activePopupKey = null;
  let tapHandler = null;

  function getBubbleEl() { return document.getElementById('dialogue-bubble'); }
  function getPopupLayer() { return document.getElementById('popup-layer'); }

  function renderBubble(line, isNewBubble) {
    const el = getBubbleEl();
    if (!el) return;
    if (isNewBubble) {
      el.classList.remove('bubble-fade-in');
      void el.offsetWidth;
      el.classList.add('bubble-fade-in');
    }
    el.textContent = line.text;
  }

  function applyPopup(key) {
    const layer = getPopupLayer();
    if (!layer) return;
    if (key === undefined || key === null) return;
    if (key === 'dismiss') {
      layer.innerHTML = '';
      activePopupKey = null;
      return;
    }
    if (key === activePopupKey) return;
    layer.innerHTML = '';
    const factory = POPUP_CONTENT[key];
    if (!factory) {
      console.warn('Unknown popup key:', key);
      return;
    }
    layer.appendChild(factory());
    activePopupKey = key;
  }

  function dismissAnyPopup() {
    const layer = getPopupLayer();
    if (layer) layer.innerHTML = '';
    activePopupKey = null;
  }

  function playSequence(sequenceKey, onExit) {
    const bubbles = (window.SEQUENCES || {})[sequenceKey];
    if (!bubbles) {
      console.warn('Unknown sequence:', sequenceKey);
      if (onExit) onExit();
      return;
    }

    dismissAnyPopup();

    const player = createPlayer(bubbles);

    function step() {
      const c = player.current();
      if (!c) {
        removeTapHandler();
        dismissAnyPopup();
        if (onExit) onExit();
        return;
      }
      renderBubble(c.line, c.isNewBubble);
      applyPopup(c.line.popup);
    }

    function onTap(e) {
      e.preventDefault();
      player.advance();
      step();
    }

    function addTapHandler() {
      tapHandler = onTap;
      document.addEventListener('click', tapHandler);
      document.addEventListener('touchend', tapHandler);
    }

    function removeTapHandler() {
      if (tapHandler) {
        document.removeEventListener('click', tapHandler);
        document.removeEventListener('touchend', tapHandler);
        tapHandler = null;
      }
    }

    step();
    addTapHandler();
  }

  function stop() {
    if (tapHandler) {
      document.removeEventListener('click', tapHandler);
      document.removeEventListener('touchend', tapHandler);
      tapHandler = null;
    }
    dismissAnyPopup();
  }

  window.Dialogue = { playSequence, stop, createPlayer, POPUP_CONTENT };
})();
