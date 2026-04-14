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

  function playSequence(sequenceKey, onExit) {
    console.warn('playSequence stub:', sequenceKey);
    if (onExit) onExit();
  }

  window.Dialogue = { playSequence, POPUP_CONTENT };
})();
