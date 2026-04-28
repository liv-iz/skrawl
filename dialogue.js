(function () {
  'use strict';

  function makePlaceholder(label, bg) {
    const d = document.createElement('div');
    d.className = 'popup-placeholder';
    d.style.background = bg;
    d.textContent = label;
    return d;
  }

  function makeImagePopup(src, alt, styles = {}) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = 'popup-image';
    Object.assign(img.style, styles);
    return img;
  }

  const POPUP_CONTENT = {
    'onboarding-arrows': () => makeImagePopup('assets/final/onboarding_arrows.png', 'ONBOARDING ARROWS', { position: 'absolute', left: '-450px', top: '0px', width: '1280px', height: '720px' }),
    'onboarding-ideas-feelings': () => makeImagePopup('assets/final/onboarding_ideas_feelings.png', 'IDEAS + FEELINGS', { width: '600px', transform: 'translate(0px, 20px)' }),
    'onboarding-ask-something-different': () => makeImagePopup('assets/final/onboarding_ask_something_different.png', 'ASK SOMETHING DIFFERENT', { width: '600px', transform: 'translate(0px, 20px)' }),
    'onboarding-paper-string-scraps': () => makeImagePopup('assets/final/onboarding_paper_string_scraps.png', 'PAPER + STRING + SCRAPS', { width: '600px', transform: 'translate(0px, 20px)' }),
    'onboarding-if-paper': () => makeImagePopup('assets/final/onboarding_if_paper.png', 'IF PAPER...', { width: '600px', transform: 'translate(0px, 20px)' }),
    'hugh-broken-window': () => makeImagePopup('assets/final/hugh_broken_window.gif', 'HUGH BROKEN WINDOW', { width: '600px', transform: 'translate(0px, 20px)' }),
    'stained-glass-examples': () => makeImagePopup('assets/final/stained_glass_example.png', 'STAINED GLASS EXAMPLES', { width: '500px', transform: 'translate(0px, 10px)' }),
    'colour-wheel':           () => makeImagePopup('assets/final/colour_wheel.png', 'COLOUR WHEEL', { width: '800px', transform: 'translate(-10px, 60px)' }),
    'colour-wheel-red-green': () => makeImagePopup('assets/final/colour_wheel_red_green.png', 'COLOUR WHEEL — RED + GREEN', { width: '800px', transform: 'translate(-10px, 60px)' }),
    'colour-wheel-blue-orange': () => makeImagePopup('assets/final/colour_wheel_blue_orange.png', 'COLOUR WHEEL — BLUE + ORANGE', { width: '800px', transform: 'translate(-10px, 60px)' }),
    'colour-mood-yellow':     () => makeImagePopup('assets/final/yellow_happy.png', 'YELLOW = HAPPY', { width: '500px', transform: 'translate(-20px, 20px)' }),
    'colour-wheel-animated': () => makeImagePopup('assets/final/colour_wheel_animated.gif', 'COLOUR WHEEL ANIMATED', { width: '800px', transform: 'translate(-10px, 60px)' }),
    'colour-mood-blue':       () => makeImagePopup('assets/final/blue_mood.png', 'BLUE = CALM', { width: '480px', transform: 'translate(0px, 20px)' }),
    'colour-mood-grey':       () => makeImagePopup('assets/final/grey_mood.png', 'BLUE = CALM', { width: '500px', transform: 'translate(0px, 20px)' }),
    'puff-lost-scarf':       () => makeImagePopup('assets/final/puff_lost_scarf.gif', 'PUFF LOST THEIR  SCARF', { width: '600px', transform: 'translate(0px, 20px)' }),
    'texture-soft':           () => makeImagePopup('assets/final/puff_texture_soft.png', 'SOFT (abstract)', { width: '300px', transform: 'translate(-20px, 20px)' }),
    'texture-rough':          () => makeImagePopup('assets/final/puff_texture_rough.png', 'ROUGH (abstract)', { width: '350px', transform: 'translate(-20px, 20px)' }),
    'texture-smooth':         () => makeImagePopup('assets/final/puff_texture_smooth.png', 'SMOOTH (abstract)', { width: '400px', transform: 'translate(-20px, 20px)' }),
    'texture-bumpy':          () => makeImagePopup('assets/final/Puff_texture_bumpy.png', 'BUMPY (abstract)', { width: '300px', transform: 'translate(-20px, 20px)' }),
    'soft-example':          () => makeImagePopup('assets/final/puff_texture_soft_example.png', 'SOFT EXAMPLE', { width: '350px', transform: 'translate(-20px, 35px)' }),
    'scratchy-example':      () => makeImagePopup('assets/final/puff_texture_scratchy_example.png', 'SCRATCHY EXAMPLE', { width: '300px', transform: 'translate(-20px, 20px)' }),
    'mix-example':           () => makeImagePopup('assets/final/puff_texture_mix_example.png', 'MIX EXAMPLE', { width: '300px', transform: 'translate(-20px, 20px)' }),
    'rowan-broken-house':     () => makeImagePopup('assets/final/rowan_broken_house.gif', 'ROWAN BROKEN HOUSE', { width: '500px', transform: 'translate(10px, 20px)' }),
    'form-2d-square':         () => makeImagePopup('assets/final/rowan_form_2d_square.png', '2D SQUARE', { width: '300px', transform: 'translate(-20px, 30px)' }),
    'form-3d-cube':           () => makeImagePopup('assets/final/rowan_form_3d_cube.png', '3D CUBE', { width: '300px', transform: 'translate(-20px, 30px)' }),
    'form-cube-sway':         () => makeImagePopup('assets/final/rowan_form_cube_sway.gif', '3D CUBE SWAY', { width: '525px', transform: 'translate(-31px, 40px)' }),
    'form-reinforced':        () => makeImagePopup('assets/final/rowan_form_reinforced.png', 'REINFORCED CUBE', { width: '325px', transform: 'translate(-20px, 20px)' }),
    'form-reinforced-roof':   () => makeImagePopup('assets/final/rowan_form_reinforced_roof.png', 'REINFORCED + ROOF', { width: '300px', transform: 'translate(-20px, 20px)' }),
    'form-reinforced-base':   () => makeImagePopup('assets/final/rowan_form_reinforced_base.png', 'REINFORCED + BASE', { width: '300px', transform: 'translate(-20px, 20px)' }),
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
      },
      retreat() {
        if (done) { done = false; lastBubbleIndex = bubbleIndex; return; }
        lastBubbleIndex = bubbleIndex;
        if (lineIndex > 0) {
          lineIndex--;
        } else if (bubbleIndex > 0) {
          bubbleIndex--;
          lineIndex = bubbles[bubbleIndex].lines.length - 1;
        }
      }
    };
    return player;
  }

  const SEQUENCE_SPEAKER = {
    'onboarding': 'Barnaby',
    'final-closing': 'Barnaby',
    'hugh-lesson': 'Hugh',
    'hugh-reaction': 'Hugh',
    'puff-lesson': 'Puff',
    'puff-reaction': 'Puff',
    'rowan-lesson': 'Rowan',
    'rowan-reaction': 'Rowan'
  };

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

  function getThoughtBubble() { return document.getElementById('thought-bubble'); }

  function showThoughtBubble() {
    const tb = getThoughtBubble();
    if (tb) tb.classList.add('active');
  }

  function hideThoughtBubble() {
    const tb = getThoughtBubble();
    if (tb) tb.classList.remove('active');
  }

  function applyPopup(key) {
    const layer = getPopupLayer();
    if (!layer) return;
    if (key === undefined || key === null) return;
    if (key === 'dismiss') {
      layer.innerHTML = '';
      activePopupKey = null;
      hideThoughtBubble();
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
    if (key === 'onboarding-arrows') {
      hideThoughtBubble();
    } else {
      showThoughtBubble();
    }
  }

  // Walk the sequence from start through (targetBi, targetLi) and return the
  // popup key that should be visible at that point ('null' = none).
  // Used so that retreating restores the correct popup state.
  function effectivePopupAt(bubbles, targetBi, targetLi) {
    let key = null;
    for (let bi = 0; bi <= targetBi; bi++) {
      const limit = (bi === targetBi) ? targetLi : bubbles[bi].lines.length - 1;
      for (let li = 0; li <= limit; li++) {
        const p = bubbles[bi].lines[li].popup;
        if (p === 'dismiss') key = null;
        else if (p) key = p;
      }
    }
    return key;
  }

  function syncPopup(key) {
    if (key === activePopupKey) return;
    if (!key) { dismissAnyPopup(); return; }
    applyPopup(key);
  }

  function dismissAnyPopup() {
    const layer = getPopupLayer();
    if (layer) layer.innerHTML = '';
    activePopupKey = null;
    hideThoughtBubble();
  }

  function playSequence(sequenceKey, onExit) {
    const bubbles = (window.SEQUENCES || {})[sequenceKey];
    if (!bubbles) {
      console.warn('Unknown sequence:', sequenceKey);
      if (onExit) onExit();
      return;
    }

    dismissAnyPopup();

    const nameEl = document.getElementById('dialogue-name');
    if (nameEl) nameEl.textContent = SEQUENCE_SPEAKER[sequenceKey] || '';

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
      syncPopup(effectivePopupAt(bubbles, c.bubbleIndex, c.lineIndex));
    }

    let lastTap = 0;
    function onTap(e) {
      const now = Date.now();
      if (now - lastTap < 120) return;
      lastTap = now;
      if (e.target && e.target.closest && e.target.closest('button')) return;
      e.preventDefault();
      // Outer 25% bands navigate: leftmost 25% = back, rightmost 25% = forward.
      // Middle 50% is a dead zone, so accidental taps don't advance.
      let x = (e.clientX != null) ? e.clientX : null;
      if (x == null && e.changedTouches && e.changedTouches[0]) x = e.changedTouches[0].clientX;
      if (x == null) return;
      const w = window.innerWidth;
      if (x < w * 0.25) player.retreat();
      else if (x > w * 0.75) player.advance();
      else return; // dead zone — ignore
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
    const nameEl = document.getElementById('dialogue-name');
    if (nameEl) nameEl.textContent = '';
  }

  window.Dialogue = { playSequence, stop, createPlayer, POPUP_CONTENT };
})();
