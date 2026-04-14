# Skrawl Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a landscape-only browser game where children (ages 6-12) pick one of three critter orders, get an art lesson, craft a physical object, photograph it, and see the critter react — with completed orders saved in a scrapbook via IndexedDB.

**Architecture:** Single-page app, vanilla HTML/CSS/JS, no build step. Fixed 1280×720 canvas scaled via CSS `transform: scale()`. Screens are hidden `<div>`s toggled by a state machine in `main.js`. Dialogue engine reads script data and swaps Main Stage pop-ups per line. Camera uses `getUserMedia` with a file-upload fallback. Photos validated by Laplacian-variance blur check. Persistence via IndexedDB (`idb` CDN library).

**Tech Stack:** Vanilla JS, HTML, CSS, `idb` library (CDN), IndexedDB, `getUserMedia`, Canvas 2D API.

**Spec:** `docs/superpowers/specs/2026-04-13-skrawl-prototype-design.md`

---

## File Structure

```
skrawl/
├── CLAUDE.md
├── Game_Script.md
├── index.html              (all screens as hidden divs)
├── tests.html              (manual test runner for pure logic)
├── style.css               (base styles + placeholder classes)
├── main.js                 (app entry, state machine, screen routing, CRITTERS data, orientation)
├── script.js               (SEQUENCES: dialogue data)
├── dialogue.js             (playSequence engine + POPUP_CONTENT map)
├── camera.js               (openCamera: viewfinder, framing guide, upload fallback, blur)
├── db.js                   (IndexedDB: getMeta/setMeta/saveOrder/loadOrders)
└── assets/
    ├── placeholders/       (empty; runtime-generated SVG placeholders)
    └── final/              (empty; artists populate)
```

**Responsibility per file:** see spec §"File Structure & Module Responsibilities".

---

## Pre-flight

- [ ] **Verify working dir is `skrawl/` (contains `CLAUDE.md` and `Game_Script.md`)**

Run: `ls`
Expected: `CLAUDE.md  Game_Script.md  LICENSE  README.md  docs/`

- [ ] **Create asset folders**

```bash
mkdir -p assets/placeholders assets/final
```

- [ ] **Commit scaffolding folders**

```bash
# add a .gitkeep so the empty dirs are tracked
touch assets/placeholders/.gitkeep assets/final/.gitkeep
git add assets/
git commit -m "chore: scaffold asset folders"
```

---

## Task 1: HTML Shell + Canvas Scaling + Orientation Lock

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `main.js`

- [ ] **Step 1: Create `index.html` skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>Skrawl</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="rotate-prompt" class="rotate-prompt">
    <div class="rotate-message">Please rotate your device to landscape</div>
  </div>

  <div id="stage" class="stage">
    <!-- screens go here; populated in later tasks -->
    <div class="screen active" id="screen-boot">
      <div class="placeholder-bg"></div>
      <div class="debug-label">BOOT</div>
    </div>
  </div>

  <!-- idb CDN -->
  <script src="https://unpkg.com/idb@7/build/umd.js"></script>

  <!-- app -->
  <script src="db.js" defer></script>
  <script src="script.js" defer></script>
  <script src="dialogue.js" defer></script>
  <script src="camera.js" defer></script>
  <script src="main.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Create `style.css` with base + rotate prompt + stage scaling**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/* Stage: fixed 1280x720, scaled by JS */
.stage {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1280px;
  height: 720px;
  transform-origin: center center;
  background: #000;
}

/* Screens stack; only .active is visible */
.screen {
  position: absolute;
  inset: 0;
  display: none;
}
.screen.active { display: block; }

/* Placeholder background — replace with final art */
.placeholder-bg {
  position: absolute;
  inset: 0;
  background-color: #f4ecd8;
  background-image:
    linear-gradient(rgba(139, 105, 20, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 105, 20, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
}

.debug-label {
  position: absolute;
  top: 8px;
  left: 8px;
  color: #8b6914;
  font-size: 14px;
  opacity: 0.5;
}

/* Rotate prompt */
.rotate-prompt {
  display: none;
  position: fixed;
  inset: 0;
  background: #1a1a1a;
  z-index: 9999;
  align-items: center;
  justify-content: center;
  color: #f4ecd8;
  font-size: 24px;
  text-align: center;
  padding: 32px;
}
.rotate-prompt.active { display: flex; }
.rotate-message { max-width: 400px; }
```

- [ ] **Step 3: Create `main.js` with scaling + orientation detection**

```js
(function () {
  'use strict';

  const CANVAS_W = 1280;
  const CANVAS_H = 720;

  const stage = document.getElementById('stage');
  const rotatePrompt = document.getElementById('rotate-prompt');

  function scaleScene() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / CANVAS_W, vh / CANVAS_H);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  function checkOrientation() {
    const portrait = window.innerHeight > window.innerWidth;
    rotatePrompt.classList.toggle('active', portrait);
  }

  function onResize() {
    scaleScene();
    checkOrientation();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  window.addEventListener('load', onResize);
  onResize();
})();
```

- [ ] **Step 4: Manual test — serve and verify**

Run: `npx serve .` (or `python3 -m http.server 8080`) and open `http://localhost:3000` (or `:8080`) in a browser.

Expected:
- Landscape browser window: beige grid background fills scaled 1280×720 area, centered, with "BOOT" label top-left.
- Resize browser to portrait aspect: dark overlay appears with "Please rotate your device to landscape".
- Rotate back to landscape: overlay disappears.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: scaffold HTML shell, canvas scaling, orientation lock"
```

---

## Task 2: Test Harness

**Files:**
- Create: `tests.html`
- Create: `tests.js`

This sets up a minimal in-browser test runner. We'll add cases to `tests.js` as pure-function modules get built (dialogue engine, blur check).

- [ ] **Step 1: Create `tests.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Skrawl Tests</title>
  <style>
    body { font-family: monospace; padding: 16px; background: #111; color: #eee; }
    .pass { color: #8f8; }
    .fail { color: #f88; }
    .group { margin-top: 16px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Skrawl Tests</h1>
  <div id="results"></div>

  <!-- modules under test (append as they exist) -->
  <script src="dialogue.js" defer></script>
  <script src="camera.js" defer></script>

  <script src="tests.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Create `tests.js` with a tiny test framework**

```js
(function () {
  'use strict';

  const results = document.getElementById('results');
  let currentGroup = null;
  let pass = 0, fail = 0;

  window.describe = function (name, fn) {
    const h = document.createElement('div');
    h.className = 'group';
    h.textContent = name;
    results.appendChild(h);
    currentGroup = name;
    try { fn(); } catch (e) {
      const row = document.createElement('div');
      row.className = 'fail';
      row.textContent = `  ✗ threw in group: ${e.message}`;
      results.appendChild(row);
      fail++;
    }
  };

  window.it = function (desc, fn) {
    const row = document.createElement('div');
    try {
      fn();
      row.className = 'pass';
      row.textContent = `  ✓ ${desc}`;
      pass++;
    } catch (e) {
      row.className = 'fail';
      row.textContent = `  ✗ ${desc} — ${e.message}`;
      fail++;
    }
    results.appendChild(row);
  };

  window.assert = function (cond, msg) {
    if (!cond) throw new Error(msg || 'assertion failed');
  };

  window.assertEqual = function (actual, expected, msg) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) throw new Error(`${msg || 'assertEqual'}: expected ${e}, got ${a}`);
  };

  window.addEventListener('load', function () {
    setTimeout(function () {
      const summary = document.createElement('h2');
      summary.textContent = `Pass: ${pass}  Fail: ${fail}`;
      summary.className = fail === 0 ? 'pass' : 'fail';
      results.appendChild(summary);
    }, 100);
  });
})();
```

- [ ] **Step 3: Manual test — open `tests.html`**

Run: open `http://localhost:3000/tests.html`
Expected: empty page with "Skrawl Tests" heading, followed by "Pass: 0  Fail: 0". No red errors.

- [ ] **Step 4: Commit**

```bash
git add tests.html tests.js
git commit -m "test: add in-browser test harness"
```

---

## Task 3: IndexedDB Layer (`db.js`)

**Files:**
- Create: `db.js`

`db.js` exposes a global `DB` object with async methods. It does not instantiate the database eagerly — it opens on first call and caches the promise.

- [ ] **Step 1: Create `db.js`**

```js
(function () {
  'use strict';

  const DB_NAME = 'skrawl';
  const DB_VERSION = 1;

  let dbPromise = null;

  function open() {
    if (!dbPromise) {
      dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('meta')) {
            db.createObjectStore('meta');
          }
          if (!db.objectStoreNames.contains('orders')) {
            db.createObjectStore('orders'); // keyed explicitly by critterId
          }
        }
      });
    }
    return dbPromise;
  }

  async function getMeta(key) {
    const db = await open();
    return db.get('meta', key);
  }

  async function setMeta(key, value) {
    const db = await open();
    return db.put('meta', value, key);
  }

  async function saveOrder(critterId, photoBlob) {
    const db = await open();
    return db.put('orders', {
      critterId,
      photoBlob,
      timestamp: Date.now()
    }, critterId);
  }

  async function loadOrders() {
    const db = await open();
    const all = await db.getAll('orders');
    // returns array of {critterId, photoBlob, timestamp}
    return all;
  }

  window.DB = { getMeta, setMeta, saveOrder, loadOrders };
})();
```

- [ ] **Step 2: Manual test — open console on index.html and verify**

Serve and open `http://localhost:3000` then open browser console:

```js
await DB.setMeta('test', 'hello');
await DB.getMeta('test');         // "hello"
await DB.saveOrder('paper', new Blob(['x']));
await DB.loadOrders();            // [{critterId: "paper", photoBlob: Blob, timestamp: ...}]
```

Expected: all four calls succeed. Refresh the page and repeat `await DB.loadOrders()` — the paper order persists.

- [ ] **Step 3: Clean up test data**

In the browser console (DevTools → Application → IndexedDB → skrawl → delete database), or:

```js
const db = await idb.openDB('skrawl', 1);
await db.clear('meta');
await db.clear('orders');
```

- [ ] **Step 4: Commit**

```bash
git add db.js
git commit -m "feat(db): IndexedDB wrappers for meta and orders"
```

---

## Task 4: Critter + Popup Content Data

**Files:**
- Modify: `main.js` (add CRITTERS constant at top)
- Create: `dialogue.js` (stub with POPUP_CONTENT)

These two are data. The dialogue engine itself comes in Task 5.

- [ ] **Step 1: Add `CRITTERS` data to `main.js`**

At the very top of the IIFE in `main.js`, before `const CANVAS_W`, insert:

```js
  const CRITTERS = {
    paper: {
      name: 'Hugh',
      full: 'Hugh the Colour Chameleon',
      element: 'COLOUR',
      material: 'Construction Paper & Scissors',
      task: 'Make a stained glass window',
      tip: 'Cut and paste construction paper to make your stained glass window',
      spriteClass: 'placeholder-critter-paper',
      lessonSequence: 'hugh-lesson',
      reactionSequence: 'hugh-reaction'
    },
    felt: {
      name: 'Puff',
      full: 'Puff the Sheep',
      element: 'TEXTURE',
      material: 'Felt, Fabric, or Yarn',
      task: 'Make a scarf',
      tip: 'Use soft materials, like felt, fabric, and yarn, to make your scarf',
      spriteClass: 'placeholder-critter-felt',
      lessonSequence: 'puff-lesson',
      reactionSequence: 'puff-reaction'
    },
    wood: {
      name: 'Rowan',
      full: 'Rowan the Owl',
      element: 'FORM',
      material: 'Popsicle Sticks & Glue',
      task: 'Rebuild a birdhouse',
      tip: 'Use glue, popsicle sticks or wood blocks, to make your birdhouse',
      spriteClass: 'placeholder-critter-wood',
      lessonSequence: 'rowan-lesson',
      reactionSequence: 'rowan-reaction'
    }
  };

  // expose for other modules that need it before refactor
  window.CRITTERS = CRITTERS;
```

- [ ] **Step 2: Create `dialogue.js` with POPUP_CONTENT map (stub engine)**

```js
(function () {
  'use strict';

  // Placeholder pop-up renderers. Each returns an HTMLElement.
  // ARTIST HANDOFF: replace each function body with
  //   const img = document.createElement('img');
  //   img.src = 'assets/final/popup-<key>.png';
  //   return img;
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

  // Engine API placeholder — filled in Task 5
  function playSequence(sequenceKey, onExit) {
    console.warn('playSequence stub:', sequenceKey);
    if (onExit) onExit();
  }

  window.Dialogue = { playSequence, POPUP_CONTENT };
})();
```

- [ ] **Step 3: Add placeholder styling to `style.css`**

Append to `style.css`:

```css
/* Popup placeholder — labeled for artist handoff */
.popup-placeholder {
  width: 480px;
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

/* Placeholder critter sprites */
.placeholder-critter-paper,
.placeholder-critter-felt,
.placeholder-critter-wood,
.placeholder-narrator {
  width: 240px;
  height: 350px;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  font-weight: bold;
  color: #fff;
}
.placeholder-critter-paper { background: #E8A87C; }
.placeholder-critter-paper::after { content: "H"; }
.placeholder-critter-felt  { background: #A8D8B9; }
.placeholder-critter-felt::after  { content: "P"; }
.placeholder-critter-wood  { background: #C4A882; }
.placeholder-critter-wood::after  { content: "R"; }
.placeholder-narrator {
  width: 200px;
  height: 300px;
  background: #8B6914;
}
.placeholder-narrator::after { content: "🧙"; font-size: 100px; }
```

- [ ] **Step 4: Manual test — verify in console**

Reload `http://localhost:3000`, open console:

```js
Object.keys(Dialogue.POPUP_CONTENT).length;   // 17
Dialogue.POPUP_CONTENT['colour-wheel']();     // returns a <div class="popup-placeholder">
CRITTERS.paper.task;                          // "Make a stained glass window"
```

Expected: all three return the correct values.

- [ ] **Step 5: Commit**

```bash
git add main.js dialogue.js style.css
git commit -m "feat: add CRITTERS data and POPUP_CONTENT placeholders"
```

---

## Task 5: Dialogue Engine (`dialogue.js`)

**Files:**
- Modify: `dialogue.js` (replace stub with full engine)
- Modify: `tests.js` (add dialogue-engine tests)
- Modify: `index.html` (add dialogue strip DOM + popup layer scaffold)
- Modify: `style.css` (dialogue strip + popup layer styles)

The engine manages: rendering the current bubble into the dialogue strip, advancing on tap, switching pop-ups based on line metadata, and calling `onExit` when done.

### 5a: Write failing tests for the engine's pure state logic

The engine has two layers: pure state advancement (testable) and DOM rendering (manual). We extract the state logic as `createPlayer(bubbles)` which returns a controller with `current()`, `advance()`, and `done` — these are testable without DOM.

- [ ] **Step 1: Append to `tests.js` (before the closing `})();`)**

```js
  describe('Dialogue.createPlayer', function () {
    const bubbles = [
      { lines: [
        { text: 'Line A' },
        { text: 'Line B', popup: 'p1' }
      ]},
      { lines: [
        { text: 'Line C', popup: 'dismiss' }
      ], isExit: true }
    ];

    it('starts on the first line of the first bubble', function () {
      const p = Dialogue.createPlayer(bubbles);
      const c = p.current();
      assertEqual(c.line.text, 'Line A');
      assertEqual(c.bubbleIndex, 0);
      assertEqual(c.lineIndex, 0);
      assertEqual(c.isNewBubble, true);
      assertEqual(p.done, false);
    });

    it('advance moves to next line in same bubble (not new bubble)', function () {
      const p = Dialogue.createPlayer(bubbles);
      p.advance();
      const c = p.current();
      assertEqual(c.line.text, 'Line B');
      assertEqual(c.bubbleIndex, 0);
      assertEqual(c.lineIndex, 1);
      assertEqual(c.isNewBubble, false);
      assertEqual(c.line.popup, 'p1');
    });

    it('advance crosses into next bubble (isNewBubble true)', function () {
      const p = Dialogue.createPlayer(bubbles);
      p.advance();  // B
      p.advance();  // C
      const c = p.current();
      assertEqual(c.line.text, 'Line C');
      assertEqual(c.bubbleIndex, 1);
      assertEqual(c.lineIndex, 0);
      assertEqual(c.isNewBubble, true);
    });

    it('advance past last line sets done', function () {
      const p = Dialogue.createPlayer(bubbles);
      p.advance(); p.advance(); p.advance();
      assertEqual(p.done, true);
    });

    it('advance is no-op once done', function () {
      const p = Dialogue.createPlayer(bubbles);
      p.advance(); p.advance(); p.advance();
      p.advance();  // no-op
      assertEqual(p.done, true);
    });
  });
```

- [ ] **Step 2: Open `tests.html` — expect failures**

Run: reload `http://localhost:3000/tests.html`
Expected: 5 failures in "Dialogue.createPlayer" (function not defined). The summary should show "Pass: 0  Fail: 5".

### 5b: Implement the engine

- [ ] **Step 3: Replace `dialogue.js` entirely with the full engine**

```js
(function () {
  'use strict';

  // -- Popup content ------------------------------------------------
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

  // -- Pure state player (testable) ---------------------------------
  function createPlayer(bubbles) {
    let bubbleIndex = 0;
    let lineIndex = 0;
    let done = bubbles.length === 0;
    let lastBubbleIndex = -1;  // for isNewBubble detection

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

  // -- Rendering ----------------------------------------------------
  let activePopupKey = null;
  let tapHandler = null;

  function getBubbleEl() { return document.getElementById('dialogue-bubble'); }
  function getPopupLayer() { return document.getElementById('popup-layer'); }

  function renderBubble(line, isNewBubble) {
    const el = getBubbleEl();
    if (!el) return;
    if (isNewBubble) {
      el.classList.remove('bubble-fade-in');
      // force reflow to restart animation
      void el.offsetWidth;
      el.classList.add('bubble-fade-in');
    }
    el.textContent = line.text;
  }

  function applyPopup(key) {
    const layer = getPopupLayer();
    if (!layer) return;
    if (key === undefined || key === null) return; // no change
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

    // Clear any lingering popup from previous sequence
    dismissAnyPopup();

    const player = createPlayer(bubbles);

    function step() {
      const c = player.current();
      if (!c) {
        // done
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

    // initial render
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
```

- [ ] **Step 4: Add dialogue strip + popup layer to every screen structure (starts with the boot screen)**

Edit `index.html` — replace the `screen-boot` div with:

```html
    <div class="screen" id="screen-boot">
      <div class="placeholder-bg"></div>
      <div class="debug-label">BOOT</div>
    </div>

    <!-- Persistent layers: popup + dialogue strip, shown/hidden per screen -->
    <div id="popup-layer" class="popup-layer"></div>
    <div id="dialogue-strip" class="dialogue-strip">
      <div id="dialogue-bubble" class="dialogue-bubble"></div>
    </div>
```

Note: `screen-boot` no longer starts with `active` — it will be hidden until main.js routes. Remove `.active` from it if still present. The popup layer and dialogue strip sit at stage level so they overlay whichever screen is active.

- [ ] **Step 5: Add layer styles to `style.css`**

Append:

```css
/* Popup layer — Main Stage area (x:280-980, y:0-560) */
.popup-layer {
  position: absolute;
  left: 280px;
  top: 0;
  width: 700px;
  height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
}
.popup-layer:empty { display: none; }

/* Dialogue strip — full width, y:560-720 */
.dialogue-strip {
  position: absolute;
  left: 0;
  top: 560px;
  width: 1280px;
  height: 160px;
  background: #fff;
  border-top: 4px solid #c9a961;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 48px;
  z-index: 3;
}
.dialogue-strip.hidden { display: none; }

.dialogue-bubble {
  font-size: 28px;
  line-height: 1.4;
  color: #3a2e1f;
  text-align: center;
  max-width: 1100px;
}
.bubble-fade-in { animation: fadeIn 0.25s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 6: Re-run tests**

Run: reload `http://localhost:3000/tests.html`
Expected: "Pass: 5  Fail: 0" under "Dialogue.createPlayer".

- [ ] **Step 7: Commit**

```bash
git add dialogue.js tests.js index.html style.css
git commit -m "feat(dialogue): state player + tap-driven rendering engine"
```

---

## Task 6: Dialogue Sequences Data (`script.js`)

**Files:**
- Create: `script.js`

Transcribe `Game_Script.md` into the bubble/line structure. `*` (new line in same bubble) becomes another entry in `lines`; `/` (new bubble) becomes a new bubble object. Pop-up cues in the script are encoded on the line where the pop-up should appear.

- [ ] **Step 1: Create `script.js`**

```js
(function () {
  'use strict';

  // Convention:
  //   each bubble = { lines: [{text, popup?}, ...], isExit?: true }
  //   popup keys match Dialogue.POPUP_CONTENT
  //   popup: "dismiss" clears any active popup

  const SEQUENCES = {

    'onboarding': [
      { lines: [
        { text: "Ahh… there you are." },
        { text: "I was wondering when you'd arrive." },
        { text: "Come in, come in. Mind the scraps on the floor—this old place has a habit of making things when no one's looking." }
      ]},
      { lines: [
        { text: "This is a workshop of small favours and quiet craft." },
        { text: "Folks from all around come here when they need something made." },
        { text: "They bring ideas, feelings, little problems…" },
        { text: "And we make something real to help." }
      ]},
      { lines: [
        { text: "But here's the important part, apprentice…" },
        { text: "We don't just pretend to make things here." },
        { text: "You'll be making them with your own hands." }
      ]},
      { lines: [
        { text: "Paper, string, scraps, whatever you have nearby." },
        { text: "No need for anything fancy." }
      ]},
      { lines: [
        { text: "Each visitor will ask for something different." },
        { text: "A bit of color… a soft texture… a sturdy shape…" },
        { text: "But you should only take a job if you've got the materials for it." }
      ]},
      { lines: [
        { text: "If you've only got paper, take a paper task." },
        { text: "If you've got fabric, take a soft task." },
        { text: "There's no rush. No one here keeps score." }
      ]},
      { lines: [
        { text: "And when you've finished…" },
        { text: "Bring it back here." },
        { text: "Take a picture of your creation, and we'll keep it safe in the order book." },
        { text: "A record of everything you've made." }
      ]},
      { lines: [
        { text: "Every little help you've given." }
      ]},
      { lines: [
        { text: "The visitors… They're quite special." },
        { text: "Each one knows their craft better than I ever did." }
      ]},
      { lines: [
        { text: "One might teach you about color…" },
        { text: "Another about texture…" },
        { text: "Another about building something that stands strong." }
      ]},
      { lines: [
        { text: "All you have to do is listen while you make." }
      ]},
      { lines: [
        { text: "There's no such thing as 'wrong' here." },
        { text: "Only… made." },
        { text: "And that's always something to be proud of." }
      ]},
      { lines: [
        { text: "Now then…" },
        { text: "Let's see who needs help today, hm?" }
      ], isExit: true }
    ],

    // ---- Hugh (colour) ---------------------------------------------
    'hugh-lesson': [
      { lines: [
        { text: "Oh hello there, you must be the new apprentice." },
        { text: "I'm Hugh." }
      ]},
      { lines: [
        { text: "My window broke in the storm last night…" },
        { text: "It used to catch the light so beautifully." },
        { text: "Now everything feels a bit… flat.", popup: 'stained-glass-examples' }
      ]},
      { lines: [
        { text: "Do you know stained glass?" },
        { text: "It's a window made of little pieces of colored glass…" },
        { text: "All fit together like a puzzle." }
      ]},
      { lines: [
        { text: "When the light shines through…" },
        { text: "it paints the whole room.", popup: 'dismiss' }
      ]},
      { lines: [
        { text: "I don't need anything too fancy…" },
        { text: "Just a window shape you like." },
        { text: "Round, tall, wiggly—whatever feels right to you." },
        { text: "As long as the colors can shine through." }
      ]},
      { lines: [
        { text: "Colors can be quite particular, you see." },
        { text: "Some like to sit quietly together…" },
        { text: "And some like to stand out.", popup: 'colour-wheel' }
      ]},
      { lines: [
        { text: "Colors that sit across from each other…" },
        { text: "Like red and green…", popup: 'colour-wheel-red-green' },
        { text: "Or blue and orange…", popup: 'colour-wheel-blue-orange' }
      ]},
      { lines: [
        { text: "They're called complementary colors." },
        { text: "They make each other brighter." },
        { text: "Like best friends who help each other shine.", popup: 'dismiss' }
      ]},
      { lines: [
        { text: "Colors don't just look nice…" },
        { text: "They feel like something.", popup: 'colour-mood-yellow' }
      ]},
      { lines: [
        { text: "Yellows can feel warm and happy…", popup: 'colour-mood-blue' }
      ]},
      { lines: [
        { text: "Blues can feel calm… or a little quiet…", popup: 'colour-mood-grey' }
      ]},
      { lines: [
        { text: "And darker colors can feel mysterious." }
      ]},
      { lines: [
        { text: "What do you want the light to feel like?", popup: 'dismiss' },
        { text: "Bright and cheerful?" },
        { text: "Soft and calm?" },
        { text: "Or something else entirely?" }
      ]},
      { lines: [
        { text: "Could you make me a stained glass window?" },
        { text: "Use colors that you think will shine together…" },
        { text: "Or ones that feel just right to you." }
      ], isExit: true }
    ],

    'hugh-reaction': [
      { lines: [
        { text: "Oh…!" },
        { text: "It's beautiful…" },
        { text: "It feels like the light is alive again." },
        { text: "Thank you apprentice!" }
      ], isExit: true }
    ],

    // ---- Puff (texture) --------------------------------------------
    'puff-lesson': [
      { lines: [
        { text: "Hello there… are you the new apprentice?" },
        { text: "I'm Puff." }
      ]},
      { lines: [
        { text: "I lost my scarf during yesterday's cold wind…" },
        { text: "It was so soft in all the right places" },
        { text: "And so nice to look at!" }
      ]},
      { lines: [
        { text: "Do you know what I mean by texture?" },
        { text: "It's how something feels when you touch it." }
      ]},
      { lines: [
        { text: "Soft…", popup: 'texture-soft' },
        { text: "Rough…", popup: 'texture-rough' },
        { text: "Smooth…", popup: 'texture-smooth' },
        { text: "Or a little bumpy.", popup: 'texture-bumpy' }
      ]},
      { lines: [
        { text: "Certain things are soft…", popup: 'dismiss' },
        { text: "…and some things are scratchy." }
      ]},
      { lines: [
        { text: "They feel very different." },
        { text: "And that difference matters." }
      ]},
      { lines: [
        { text: "Soft textures feel safe…" },
        { text: "Scratchy ones feel uncomfortable…" },
        { text: "But sometimes…" },
        { text: "…a mix can still work if it's done carefully." }
      ]},
      { lines: [
        { text: "Could you make me a new scarf?" },
        { text: "You can use any materials you have…" },
        { text: "Felt… yarn… fabric… anything soft or interesting." },
        { text: "Try mixing textures… and see what feels right." }
      ], isExit: true }
    ],

    'puff-reaction': [
      { lines: [
        { text: "This feels much better." },
        { text: "It doesn't scratch anymore…" },
        { text: "And it feels warm all the way through!" }
      ], isExit: true }
    ],

    // ---- Rowan (form) ----------------------------------------------
    'rowan-lesson': [
      { lines: [
        { text: "Ah… you must be the apprentice." },
        { text: "This place is still standing… good. That means you understand care." }
      ]},
      { lines: [
        { text: "I'm Rowan." },
        { text: "My home was knocked loose in the wind last night." },
        { text: "It didn't fall far…" },
        { text: "But it no longer feels… secure." }
      ]},
      { lines: [
        { text: "Do you know what form is?" },
        { text: "It's the shape something has…", popup: 'form-2d-square' },
        { text: "Not just flat like paper…", popup: 'form-3d-cube' },
        { text: "But something with depth." },
        { text: "Something you can build around." }
      ]},
      { lines: [
        { text: "When shapes come together…" },
        { text: "They can become something you can hold space inside." },
        { text: "That is called volume.", popup: 'form-cube-sway' }
      ]},
      { lines: [
        { text: "This has volume…" },
        { text: "…but it's not stable yet." }
      ]},
      { lines: [
        { text: "But form alone is not enough." },
        { text: "What matters is how it holds together." },
        { text: "If something is too weak…" }
      ]},
      { lines: [
        { text: "It will fall apart." },
        { text: "If it is balanced…" },
        { text: "It stays strong." }
      ]},
      { lines: [
        { text: "Strong structures usually need a few things…" },
        { text: "Pieces that support each other…", popup: 'form-reinforced' },
        { text: "Balanced sides…", popup: 'form-reinforced-roof' },
        { text: "And a base that can hold weight…", popup: 'form-reinforced-base' }
      ]},
      { lines: [
        { text: "Like trees in the wind…", popup: 'dismiss' },
        { text: "They bend…" },
        { text: "But they do not break easily." }
      ]},
      { lines: [
        { text: "Could you rebuild this birdhouse?" },
        { text: "You can use wood pieces…" },
        { text: "sticks… or anything you have." }
      ]},
      { lines: [
        { text: "Try to make it strong enough to hold its shape…" },
        { text: "So a small bird could rest inside safely." }
      ], isExit: true }
    ],

    'rowan-reaction': [
      { lines: [
        { text: "…Yes." },
        { text: "It holds." },
        { text: "It feels steady… safe." },
        { text: "That is good form." },
        { text: "Thank you." }
      ], isExit: true }
    ],

    // ---- Final closing (after all three orders complete) ----------
    'final-closing': [
      { lines: [
        { text: "Well then, apprentice…" },
        { text: "You've helped everyone who came through today." },
        { text: "Every order filled. Every visitor happy." }
      ]},
      { lines: [
        { text: "Your order book is full of lovely things." },
        { text: "Each one made by your own hands." }
      ]},
      { lines: [
        { text: "That's something to be proud of." },
        { text: "Well done." }
      ], isExit: true }
    ]

  };

  window.SEQUENCES = SEQUENCES;
})();
```

- [ ] **Step 2: Add `<script src="script.js" defer></script>` to `index.html` before `dialogue.js`**

If not already present, the order in `index.html` should be:
```html
<script src="db.js" defer></script>
<script src="script.js" defer></script>
<script src="dialogue.js" defer></script>
<script src="camera.js" defer></script>
<script src="main.js" defer></script>
```

- [ ] **Step 3: Manual sanity check — verify in console**

Reload `http://localhost:3000`, open console:

```js
Object.keys(SEQUENCES);
// ["onboarding","hugh-lesson","hugh-reaction","puff-lesson","puff-reaction","rowan-lesson","rowan-reaction","final-closing"]

SEQUENCES.onboarding.length;        // 13
SEQUENCES['hugh-lesson'][0].lines[0].text;  // "Oh hello there, you must be the new apprentice."
SEQUENCES['hugh-lesson'].filter(b => b.isExit).length; // 1
```

Expected: all three match.

- [ ] **Step 4: Commit**

```bash
git add script.js index.html
git commit -m "feat(script): transcribe Game_Script.md into SEQUENCES data"
```

---

## Task 7: Screen State Machine + Onboarding Screen

**Files:**
- Modify: `index.html` (add all screens as empty divs, add onboarding skeleton)
- Modify: `main.js` (add `showScreen`, boot flow, onboarding wiring)
- Modify: `style.css` (critter panel + main stage + side panel structure)

- [ ] **Step 1: Replace the body's stage contents in `index.html`** so all screens exist (most empty for now):

```html
  <div id="stage" class="stage">

    <!-- Base background layer (shared; every screen sits on top) -->
    <div class="bg-layer"><div class="placeholder-bg"></div></div>

    <!-- Screens -->
    <div class="screen" id="screen-onboarding">
      <div class="critter-panel">
        <div class="placeholder-narrator"></div>
      </div>
    </div>

    <div class="screen" id="screen-order-list">
      <div class="critter-panel">
        <div class="placeholder-narrator"></div>
      </div>
      <div class="main-stage" id="order-cards"></div>
    </div>

    <div class="screen" id="screen-lesson">
      <div class="critter-panel" id="lesson-critter"></div>
    </div>

    <div class="screen" id="screen-crafting">
      <div class="critter-panel" id="crafting-critter"></div>
      <div class="main-stage">
        <div id="crafting-text" class="crafting-text"></div>
      </div>
      <div class="side-panel">
        <button class="btn-primary" id="btn-take-photo">📷 Take a Photo</button>
      </div>
    </div>

    <div class="screen" id="screen-camera"><!-- populated by camera.js --></div>

    <div class="screen" id="screen-preview">
      <div class="main-stage main-stage-full" id="preview-photo"></div>
      <div class="side-panel">
        <button class="btn-secondary" id="btn-retake">Retake</button>
        <button class="btn-primary" id="btn-confirm">Confirm</button>
      </div>
    </div>

    <div class="screen" id="screen-reaction">
      <div class="critter-panel" id="reaction-critter"></div>
      <div class="main-stage" id="reaction-photo"></div>
    </div>

    <div class="screen" id="screen-scrapbook">
      <div class="critter-panel">
        <div class="placeholder-narrator"></div>
      </div>
      <div class="main-stage" id="scrapbook-slots"></div>
      <div class="side-panel">
        <button class="btn-primary" id="btn-scrapbook-continue">Continue</button>
      </div>
    </div>

    <!-- Persistent overlays -->
    <div id="popup-layer" class="popup-layer"></div>
    <div id="dialogue-strip" class="dialogue-strip">
      <div id="dialogue-bubble" class="dialogue-bubble"></div>
    </div>

  </div>
```

- [ ] **Step 2: Append structural zone styles to `style.css`**

```css
.bg-layer { position: absolute; inset: 0; z-index: 0; }

.critter-panel {
  position: absolute;
  left: 0; top: 0;
  width: 280px; height: 560px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-stage {
  position: absolute;
  left: 280px; top: 0;
  width: 700px; height: 560px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.main-stage-full {
  left: 0;
  width: 1280px;
  height: 560px;
}

.side-panel {
  position: absolute;
  left: 980px; top: 0;
  width: 300px; height: 560px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
}

/* Buttons */
.btn-primary, .btn-secondary {
  min-width: 200px;
  min-height: 120px;
  font-size: 28px;
  font-weight: bold;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  padding: 16px 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.btn-primary {
  background: #c9a961;
  color: #fff;
}
.btn-primary:active { transform: translateY(2px); box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
.btn-secondary {
  background: #e8ddc5;
  color: #3a2e1f;
  min-height: 80px;
}

.crafting-text {
  text-align: center;
  font-size: 32px;
  color: #3a2e1f;
  padding: 32px;
  line-height: 1.4;
}
```

- [ ] **Step 3: Rewrite `main.js` with screen state machine + boot flow**

Replace the entire file with:

```js
(function () {
  'use strict';

  // ---- Data -------------------------------------------------------
  const CRITTERS = {
    paper: {
      name: 'Hugh',
      full: 'Hugh the Colour Chameleon',
      element: 'COLOUR',
      material: 'Construction Paper & Scissors',
      task: 'Make a stained glass window',
      tip: 'Cut and paste construction paper to make your stained glass window',
      spriteClass: 'placeholder-critter-paper',
      lessonSequence: 'hugh-lesson',
      reactionSequence: 'hugh-reaction'
    },
    felt: {
      name: 'Puff',
      full: 'Puff the Sheep',
      element: 'TEXTURE',
      material: 'Felt, Fabric, or Yarn',
      task: 'Make a scarf',
      tip: 'Use soft materials, like felt, fabric, and yarn, to make your scarf',
      spriteClass: 'placeholder-critter-felt',
      lessonSequence: 'puff-lesson',
      reactionSequence: 'puff-reaction'
    },
    wood: {
      name: 'Rowan',
      full: 'Rowan the Owl',
      element: 'FORM',
      material: 'Popsicle Sticks & Glue',
      task: 'Rebuild a birdhouse',
      tip: 'Use glue, popsicle sticks or wood blocks, to make your birdhouse',
      spriteClass: 'placeholder-critter-wood',
      lessonSequence: 'rowan-lesson',
      reactionSequence: 'rowan-reaction'
    }
  };
  window.CRITTERS = CRITTERS;

  // ---- Canvas scaling --------------------------------------------
  const CANVAS_W = 1280;
  const CANVAS_H = 720;
  const stage = document.getElementById('stage');
  const rotatePrompt = document.getElementById('rotate-prompt');

  function scaleScene() {
    const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  function checkOrientation() {
    rotatePrompt.classList.toggle('active', window.innerHeight > window.innerWidth);
  }
  function onResize() { scaleScene(); checkOrientation(); }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // ---- Screen state machine --------------------------------------
  let currentScreen = null;
  const dialogueStrip = document.getElementById('dialogue-strip');

  function showScreen(id, options) {
    options = options || {};

    // Cleanup outgoing
    if (currentScreen === 'screen-camera' && window.Camera && Camera.close) {
      Camera.close();
    }
    Dialogue.stop();

    // Toggle active class
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const next = document.getElementById(id);
    if (!next) { console.warn('No screen:', id); return; }
    next.classList.add('active');

    // Dialogue strip visibility: camera and preview hide it
    const hideStrip = (id === 'screen-camera' || id === 'screen-preview');
    dialogueStrip.classList.toggle('hidden', hideStrip);

    currentScreen = id;
  }
  window.showScreen = showScreen;

  // ---- Boot flow -------------------------------------------------
  async function boot() {
    onResize();
    const onboarded = await DB.getMeta('onboarded');
    if (onboarded) {
      await goToOrderList();
    } else {
      startOnboarding();
    }
  }

  function startOnboarding() {
    showScreen('screen-onboarding');
    Dialogue.playSequence('onboarding', async function () {
      await DB.setMeta('onboarded', true);
      await goToOrderList();
    });
  }

  async function goToOrderList() {
    // stub — filled in Task 8
    showScreen('screen-order-list');
    console.log('TODO: render order list');
  }
  window.goToOrderList = goToOrderList;

  window.addEventListener('load', boot);
})();
```

- [ ] **Step 4: Manual test — onboarding plays**

1. Clear IndexedDB: DevTools → Application → IndexedDB → `skrawl` → Delete database.
2. Reload `http://localhost:3000`.

Expected:
- Narrator placeholder (brown rounded rect with 🧙) shows in left panel.
- Dialogue strip at bottom shows "Ahh… there you are."
- Tap anywhere → text changes to "I was wondering when you'd arrive."
- Continue tapping through all 13 bubbles.
- After final bubble tap, console logs "TODO: render order list" and screen transitions to order-list (empty main stage).
- Reload the page — it skips onboarding and goes straight to the (still-empty) order list.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: screen state machine and onboarding flow"
```

---

## Task 8: Order List Screen

**Files:**
- Modify: `main.js` (implement `goToOrderList`, `startOrder`)
- Modify: `style.css` (order card styles)

- [ ] **Step 1: Append order-card styles to `style.css`**

```css
#order-cards {
  flex-direction: row;
  gap: 20px;
  padding: 32px;
}

.order-card {
  width: 200px;
  height: 420px;
  background: #fff;
  border: 4px solid #c9a961;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.15s ease-out;
}
.order-card:active { transform: scale(0.97); }

.order-card.completed {
  cursor: default;
  opacity: 0.55;
  filter: grayscale(0.6);
}
.order-card.completed::after {
  content: "DONE";
  position: absolute;
  transform: rotate(-15deg) translateY(-120px);
  font-size: 40px;
  font-weight: bold;
  color: #c0392b;
  background: #fff;
  border: 4px solid #c0392b;
  padding: 4px 16px;
  border-radius: 8px;
}

.order-card-sprite {
  transform: scale(0.6);
  transform-origin: center top;
  height: 210px;
}
.order-card-name {
  font-size: 22px;
  font-weight: bold;
  color: #3a2e1f;
}
.order-card-element {
  font-size: 18px;
  color: #8b6914;
  letter-spacing: 2px;
}
.order-card-material {
  font-size: 16px;
  color: #5a4a35;
  text-align: center;
  margin-top: 4px;
}
```

- [ ] **Step 2: Replace `goToOrderList` stub in `main.js` with the implementation**

Replace the stub `async function goToOrderList()` with:

```js
  async function goToOrderList() {
    showScreen('screen-order-list');

    const orders = await DB.loadOrders();
    const completedIds = new Set(orders.map(o => o.critterId));

    const container = document.getElementById('order-cards');
    container.innerHTML = '';
    container.style.display = 'flex';

    const ids = ['paper', 'felt', 'wood'];
    ids.forEach(function (id) {
      const c = CRITTERS[id];
      const card = document.createElement('div');
      card.className = 'order-card';
      if (completedIds.has(id)) card.classList.add('completed');
      card.innerHTML = `
        <div class="order-card-sprite ${c.spriteClass}"></div>
        <div class="order-card-name">${c.name}</div>
        <div class="order-card-element">${c.element}</div>
        <div class="order-card-material">${c.material}</div>
      `;
      if (!completedIds.has(id)) {
        card.addEventListener('click', function () { startOrder(id); });
      }
      container.appendChild(card);
    });

    // short narrator prompt in dialogue strip
    document.getElementById('dialogue-bubble').textContent = "Who needs help today?";
  }

  function startOrder(critterId) {
    // stub — filled in Task 9
    console.log('TODO: start order', critterId);
  }
  window.startOrder = startOrder;
```

- [ ] **Step 3: Manual test — order list renders**

1. Clear IndexedDB again.
2. Reload `http://localhost:3000`.
3. Tap through onboarding.

Expected:
- Order list shows 3 cards side by side: Hugh, Puff, Rowan with their placeholder sprites, names, element labels, and materials.
- Dialogue strip says "Who needs help today?" (no tap-to-advance).
- Tapping a card logs "TODO: start order paper" (or felt/wood) to console.
- (Hack-check completion:) In console: `await DB.saveOrder('paper', new Blob(['x'])); goToOrderList();` → Hugh card renders greyed-out with "DONE" stamp and no longer responds to tap. Clean up after: delete the `skrawl` DB.

- [ ] **Step 4: Commit**

```bash
git add main.js style.css
git commit -m "feat: order list with completion state"
```

---

## Task 9: Lesson + Crafting Screens

**Files:**
- Modify: `main.js` (implement `startOrder`, `showCrafting`)

- [ ] **Step 1: Replace the `startOrder` stub and add `showCrafting`**

Replace the stub `function startOrder(critterId)` with:

```js
  function startOrder(critterId) {
    const c = CRITTERS[critterId];
    if (!c) return;

    // Set lesson critter sprite
    const panel = document.getElementById('lesson-critter');
    panel.innerHTML = `<div class="${c.spriteClass}"></div>`;

    showScreen('screen-lesson');
    Dialogue.playSequence(c.lessonSequence, function () {
      showCrafting(critterId);
    });
  }
  window.startOrder = startOrder;

  function showCrafting(critterId) {
    const c = CRITTERS[critterId];

    const panel = document.getElementById('crafting-critter');
    panel.innerHTML = `<div class="${c.spriteClass}"></div>`;

    const text = document.getElementById('crafting-text');
    text.innerHTML = `
      <div style="font-size:36px;font-weight:bold;margin-bottom:16px;">${c.task}</div>
      <div style="font-size:24px;margin-bottom:24px;">Tip: ${c.tip}</div>
      <div style="font-size:22px;color:#5a4a35;">When you're ready, photograph your creation against a neutral background.</div>
    `;

    showScreen('screen-crafting');

    const btn = document.getElementById('btn-take-photo');
    btn.onclick = function () { startCamera(critterId); };
  }

  function startCamera(critterId) {
    // stub — filled in Task 10/11
    console.log('TODO: start camera for', critterId);
  }
  window.startCamera = startCamera;
```

- [ ] **Step 2: Manual test — lesson + crafting flow**

1. Clear IndexedDB.
2. Reload and tap through onboarding.
3. Tap Hugh's card.

Expected:
- Lesson screen: Hugh's placeholder sprite (orange-ish "H") appears in left panel.
- Dialogue strip plays the full Hugh lesson sequence.
- Pop-ups appear in the main stage at the correct script beats: "STAINED GLASS EXAMPLES" → "COLOUR WHEEL" → red+green highlight → blue+orange → dismissed → yellow mood → blue mood → grey mood → dismissed.
- After final line, screen transitions to crafting with task text ("Make a stained glass window"), tip, and neutral-background instruction. Big "📷 Take a Photo" button in side panel.
- Tap the button → console logs "TODO: start camera for paper".
- Refresh → Hugh card is NOT marked done yet (no photo saved).

Repeat with Puff and Rowan to verify their sequences and pop-ups.

- [ ] **Step 3: Commit**

```bash
git add main.js
git commit -m "feat: lesson and crafting screens"
```

---

## Task 10: Camera Module — Viewfinder + Upload Fallback

**Files:**
- Modify: `camera.js` (full implementation)
- Modify: `index.html` (add camera screen contents)
- Modify: `style.css` (camera styles)

The camera module owns `screen-camera` contents and exposes `Camera.open(onCapture, onCancel)` and `Camera.close()`. Blur detection lives in Task 11.

- [ ] **Step 1: Replace `screen-camera` contents in `index.html`**

```html
    <div class="screen" id="screen-camera">
      <button class="btn-back" id="btn-camera-back">← Back</button>
      <video id="camera-video" class="camera-video" playsinline autoplay muted></video>
      <div class="camera-framing-guide"></div>
      <div class="camera-fallback" id="camera-fallback">
        <div>Camera isn't available here.</div>
        <label class="btn-primary" for="file-input-fallback">Upload a photo</label>
      </div>
      <input type="file" id="file-input-fallback" accept="image/*" capture="environment" style="display:none">
      <button class="btn-primary" id="btn-take-photo-capture">📷 Take Photo</button>
      <label class="upload-link" for="file-input-alt">Upload from files</label>
      <input type="file" id="file-input-alt" accept="image/*" style="display:none">
    </div>
```

- [ ] **Step 2: Append camera styles to `style.css`**

```css
.camera-video {
  position: absolute;
  inset: 0;
  width: 1280px;
  height: 560px;
  object-fit: cover;
  background: #000;
}
.camera-framing-guide {
  position: absolute;
  left: 240px; top: 40px;
  width: 800px; height: 480px;
  border: 4px dashed rgba(255, 255, 255, 0.75);
  border-radius: 24px;
  pointer-events: none;
  z-index: 2;
}
.camera-fallback {
  position: absolute;
  inset: 0;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: #2d2418;
  color: #f4ecd8;
  font-size: 28px;
  z-index: 3;
}
.camera-fallback.active { display: flex; }

#btn-take-photo-capture {
  position: absolute;
  bottom: 180px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
}
.upload-link {
  position: absolute;
  bottom: 200px;
  right: 40px;
  color: #fff;
  text-decoration: underline;
  font-size: 20px;
  cursor: pointer;
  z-index: 4;
  background: rgba(0,0,0,0.4);
  padding: 8px 16px;
  border-radius: 8px;
}

.btn-back {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 5;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: 2px solid #fff;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 22px;
  cursor: pointer;
  min-width: 100px;
  min-height: 60px;
}
```

- [ ] **Step 3: Replace `camera.js` with full implementation**

```js
(function () {
  'use strict';

  let stream = null;
  let onCaptureCallback = null;
  let onCancelCallback = null;

  const video = () => document.getElementById('camera-video');
  const fallback = () => document.getElementById('camera-fallback');
  const fileInputFallback = () => document.getElementById('file-input-fallback');
  const fileInputAlt = () => document.getElementById('file-input-alt');
  const takeBtn = () => document.getElementById('btn-take-photo-capture');
  const backBtn = () => document.getElementById('btn-camera-back');

  async function open(onCapture, onCancel) {
    onCaptureCallback = onCapture;
    onCancelCallback = onCancel;

    // Reset UI
    fallback().classList.remove('active');
    video().style.display = 'block';

    // Wire handlers (idempotent: remove any previous)
    takeBtn().onclick = handleTakePhoto;
    backBtn().onclick = handleBack;
    fileInputFallback().onchange = handleFileSelected;
    fileInputAlt().onchange = handleFileSelected;

    // Try camera
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      video().srcObject = stream;
      await video().play();
    } catch (err) {
      console.warn('Camera unavailable:', err.message);
      showFallback();
    }
  }

  function showFallback() {
    video().style.display = 'none';
    fallback().classList.add('active');
    stopStream();
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  function close() {
    stopStream();
    if (video()) { video().srcObject = null; }
    takeBtn().onclick = null;
    backBtn().onclick = null;
    fileInputFallback().onchange = null;
    fileInputAlt().onchange = null;
    onCaptureCallback = null;
    onCancelCallback = null;
  }

  function handleTakePhoto() {
    if (!stream) { return; }
    const v = video();
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d').drawImage(v, 0, 0);
    canvas.toBlob(function (blob) {
      deliverCapture(blob);
    }, 'image/jpeg', 0.9);
  }

  function handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Re-encode through canvas for consistency (and to strip EXIF)
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      // Cap to 1920 wide to keep blob sizes sane
      const maxW = 1920;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (blob) { deliverCapture(blob); }, 'image/jpeg', 0.9);
    };
    img.src = url;
  }

  function deliverCapture(blob) {
    if (onCaptureCallback) onCaptureCallback(blob);
  }

  function handleBack() {
    if (onCancelCallback) onCancelCallback();
  }

  window.Camera = { open, close };
})();
```

- [ ] **Step 4: Wire `startCamera` in `main.js`**

Replace the `startCamera` stub with:

```js
  function startCamera(critterId) {
    showScreen('screen-camera');
    Camera.open(
      function onCapture(blob) {
        showPreview(critterId, blob);
      },
      function onCancel() {
        showCrafting(critterId);
      }
    );
  }

  function showPreview(critterId, blob) {
    // stub — filled in Task 11/12
    console.log('TODO: preview', critterId, blob);
    showScreen('screen-crafting'); // placeholder so flow returns somewhere
  }
  window.showPreview = showPreview;
```

- [ ] **Step 5: Manual test — camera flow**

1. Reload `http://localhost:3000` (serve over HTTP; if `getUserMedia` is restricted to HTTPS in your browser, the fallback path will trigger — that's fine to test).
2. Tap through to Hugh's crafting screen.
3. Tap "Take a Photo".

Expected (HTTPS / permissions granted):
- Viewfinder fills the top 560px of the stage with live camera.
- Dashed framing guide visible.
- "Take Photo" button at bottom center; "Upload from files" link at bottom right; "← Back" top left.
- Tap "Take Photo" → console logs "TODO: preview paper Blob{...}", screen returns to crafting.
- Tap "← Back" → returns to crafting.

Expected (no camera / permission denied / non-HTTPS):
- Viewfinder replaced by "Camera isn't available here." message with "Upload a photo" button.
- Tapping it opens file picker; selecting an image logs the preview stub.

Expected (all cases): "Upload from files" link works even when camera is live.

- [ ] **Step 6: Commit**

```bash
git add camera.js index.html style.css main.js
git commit -m "feat(camera): viewfinder, framing guide, upload fallback"
```

---

## Task 11: Blur Detection

**Files:**
- Modify: `camera.js` (add `computeBlurVariance` and pass variance to callback)
- Modify: `tests.js` (test the blur function with synthetic images)

TDD here: blur detection is a pure function over pixel data, so we can test it.

### 11a: Write failing tests

- [ ] **Step 1: Append to `tests.js`** (before the closing `})();`):

```js
  describe('Camera.computeBlurVariance', function () {
    function makeSolidImageData(w, h, v) {
      const data = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i+1] = data[i+2] = v;
        data[i+3] = 255;
      }
      return { data, width: w, height: h };
    }

    function makeCheckerImageData(w, h) {
      const data = new Uint8ClampedArray(w * h * 4);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const v = ((x + y) % 2) * 255;
          data[idx] = data[idx+1] = data[idx+2] = v;
          data[idx+3] = 255;
        }
      }
      return { data, width: w, height: h };
    }

    it('solid image has near-zero variance (very blurry)', function () {
      const img = makeSolidImageData(32, 32, 128);
      const v = Camera.computeBlurVariance(img);
      assert(v < 1, 'solid image variance should be < 1, got ' + v);
    });

    it('checkerboard has high variance (very sharp)', function () {
      const img = makeCheckerImageData(32, 32);
      const v = Camera.computeBlurVariance(img);
      assert(v > 1000, 'checkerboard variance should be > 1000, got ' + v);
    });
  });
```

- [ ] **Step 2: Open `tests.html` — expect failures**

Run: reload `http://localhost:3000/tests.html`
Expected: 2 failures under "Camera.computeBlurVariance" ("not defined"). Previous "Dialogue.createPlayer" tests still pass.

### 11b: Implement

- [ ] **Step 3: Add `computeBlurVariance` to `camera.js`**

Add inside the IIFE in `camera.js`, and export it on `window.Camera`:

```js
  // Laplacian-variance blur metric.
  // Accepts ImageData-like {data, width, height}. Returns a number.
  // Higher = sharper. CLAUDE.md threshold: 80.
  function computeBlurVariance(imageData) {
    const { data, width, height } = imageData;
    // Grayscale buffer
    const gray = new Float32Array(width * height);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      gray[j] = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    }

    // Laplacian kernel [[0,1,0],[1,-4,1],[0,1,0]]
    const lap = new Float32Array((width - 2) * (height - 2));
    let sum = 0, sumSq = 0, count = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        const v =
          -4 * gray[i]
          + gray[i - 1] + gray[i + 1]
          + gray[i - width] + gray[i + width];
        lap[count++] = v;
        sum += v;
        sumSq += v * v;
      }
    }
    if (count === 0) return 0;
    const mean = sum / count;
    return sumSq / count - mean * mean;
  }
```

And in the export:

```js
  window.Camera = { open, close, computeBlurVariance };
```

- [ ] **Step 4: Modify `handleTakePhoto` and `handleFileSelected` to pass variance**

Replace both functions in `camera.js`:

```js
  function handleTakePhoto() {
    if (!stream) { return; }
    const v = video();
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0);
    const variance = computeVarianceFromCanvas(ctx, canvas.width, canvas.height);
    canvas.toBlob(function (blob) {
      deliverCapture(blob, variance);
    }, 'image/jpeg', 0.9);
  }

  function handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const maxW = 1920;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const variance = computeVarianceFromCanvas(ctx, canvas.width, canvas.height);
      canvas.toBlob(function (blob) { deliverCapture(blob, variance); }, 'image/jpeg', 0.9);
    };
    img.src = url;
  }

  function computeVarianceFromCanvas(ctx, w, h) {
    // Downsample to 320 wide for speed
    const targetW = 320;
    const scale = targetW / w;
    const sw = targetW;
    const sh = Math.max(1, Math.round(h * scale));
    const off = document.createElement('canvas');
    off.width = sw;
    off.height = sh;
    const octx = off.getContext('2d');
    octx.drawImage(ctx.canvas, 0, 0, sw, sh);
    const imgData = octx.getImageData(0, 0, sw, sh);
    return computeBlurVariance(imgData);
  }

  function deliverCapture(blob, variance) {
    if (onCaptureCallback) onCaptureCallback(blob, variance);
  }
```

- [ ] **Step 5: Run tests — expect all pass**

Run: reload `http://localhost:3000/tests.html`
Expected: all dialogue and blur tests pass. Summary "Pass: 7  Fail: 0".

- [ ] **Step 6: Commit**

```bash
git add camera.js tests.js
git commit -m "feat(camera): Laplacian-variance blur detection"
```

---

## Task 12: Preview Screen with Blur-aware UI

**Files:**
- Modify: `main.js` (implement `showPreview` with blur-aware modal)
- Modify: `index.html` (add blur modal markup)
- Modify: `style.css` (blur modal styles)

- [ ] **Step 1: Add blur modal markup to `screen-preview` in `index.html`**

Replace the existing `screen-preview` block with:

```html
    <div class="screen" id="screen-preview">
      <div class="main-stage main-stage-full" id="preview-photo"></div>
      <div class="side-panel">
        <button class="btn-secondary" id="btn-retake">Retake</button>
        <button class="btn-primary" id="btn-confirm">Confirm</button>
      </div>
      <div class="blur-modal" id="blur-modal">
        <div class="blur-modal-box">
          <div class="blur-modal-text">Looks a bit blurry! Try again?</div>
          <div class="blur-modal-buttons">
            <button class="btn-primary" id="btn-blur-retake">Retake</button>
            <button class="btn-secondary" id="btn-blur-useanyway">Use Anyway</button>
          </div>
        </div>
      </div>
    </div>
```

- [ ] **Step 2: Append preview/modal styles**

```css
#preview-photo {
  width: 980px;
  left: 0;
}
#preview-photo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.blur-modal {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.55);
  z-index: 10;
}
.blur-modal.active { display: flex; }
.blur-modal-box {
  background: #fff;
  border-radius: 20px;
  padding: 40px 48px;
  text-align: center;
  max-width: 640px;
}
.blur-modal-text {
  font-size: 32px;
  color: #3a2e1f;
  margin-bottom: 32px;
}
.blur-modal-buttons {
  display: flex;
  gap: 24px;
  justify-content: center;
}
```

- [ ] **Step 3: Implement `showPreview` in `main.js`**

Replace the `showPreview` stub with:

```js
  const BLUR_THRESHOLD = 80;
  let pendingPhotoBlob = null;
  let pendingPhotoUrl = null;

  function showPreview(critterId, blob, variance) {
    // Release any previous
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    pendingPhotoBlob = blob;
    pendingPhotoUrl = URL.createObjectURL(blob);

    const img = document.createElement('img');
    img.src = pendingPhotoUrl;
    const container = document.getElementById('preview-photo');
    container.innerHTML = '';
    container.appendChild(img);

    showScreen('screen-preview');

    const modal = document.getElementById('blur-modal');
    modal.classList.toggle('active', typeof variance === 'number' && variance < BLUR_THRESHOLD);

    document.getElementById('btn-retake').onclick = function () { onRetake(critterId); };
    document.getElementById('btn-confirm').onclick = function () { onConfirm(critterId); };
    document.getElementById('btn-blur-retake').onclick = function () {
      modal.classList.remove('active');
      onRetake(critterId);
    };
    document.getElementById('btn-blur-useanyway').onclick = function () {
      modal.classList.remove('active');
      // Photo stays displayed; child taps Confirm to save.
    };
  }

  function onRetake(critterId) {
    if (pendingPhotoUrl) { URL.revokeObjectURL(pendingPhotoUrl); pendingPhotoUrl = null; }
    pendingPhotoBlob = null;
    startCamera(critterId);
  }

  async function onConfirm(critterId) {
    if (!pendingPhotoBlob) return;
    await DB.saveOrder(critterId, pendingPhotoBlob);
    if (pendingPhotoUrl) { URL.revokeObjectURL(pendingPhotoUrl); pendingPhotoUrl = null; }
    pendingPhotoBlob = null;
    showReaction(critterId);
  }

  function showReaction(critterId) {
    // stub — filled in Task 13
    console.log('TODO: reaction for', critterId);
    goToOrderList();
  }
  window.showReaction = showReaction;
```

Also update the `Camera.open` callsite in `startCamera` to pass variance through:

```js
  function startCamera(critterId) {
    showScreen('screen-camera');
    Camera.open(
      function onCapture(blob, variance) {
        showPreview(critterId, blob, variance);
      },
      function onCancel() {
        showCrafting(critterId);
      }
    );
  }
```

- [ ] **Step 4: Manual test — preview + blur modal**

1. Clear IndexedDB, reload, tap through onboarding and Hugh's lesson.
2. At crafting, tap "Take a Photo". Capture a clear photo (or upload a sharp image).

Expected:
- Photo shown in main stage on preview screen, with Retake + Confirm in side panel.
- No blur modal for a sharp photo.
- Tap Confirm → console logs "TODO: reaction for paper" and screen transitions to order-list — Hugh now shows the DONE stamp.
- Refresh — Hugh remains completed.

Then test blur path: capture a blurry photo (cover the lens halfway, or upload a deliberately blurry JPEG).

Expected:
- Blur modal overlays preview with "Looks a bit blurry! Try again?".
- Tap "Retake" → back to camera.
- Tap "Use Anyway" → modal closes, photo remains, Confirm still works.

Cleanup: clear IndexedDB before next task.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: preview screen with blur-aware retake modal"
```

---

## Task 13: Reaction Screen

**Files:**
- Modify: `main.js` (implement `showReaction`)

- [ ] **Step 1: Replace the `showReaction` stub**

```js
  async function showReaction(critterId) {
    const c = CRITTERS[critterId];

    // Critter sprite in left panel
    document.getElementById('reaction-critter').innerHTML =
      `<div class="${c.spriteClass}"></div>`;

    // Their photo in main stage
    const orders = await DB.loadOrders();
    const order = orders.find(o => o.critterId === critterId);
    const mainStage = document.getElementById('reaction-photo');
    mainStage.innerHTML = '';
    if (order && order.photoBlob) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(order.photoBlob);
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '8px';
      img.onload = function () { URL.revokeObjectURL(img.src); };
      mainStage.appendChild(img);
    }

    showScreen('screen-reaction');
    Dialogue.playSequence(c.reactionSequence, function () {
      showScrapbook(critterId);
    });
  }

  function showScrapbook(justCompletedCritterId) {
    // stub — filled in Task 14
    console.log('TODO: scrapbook, just completed:', justCompletedCritterId);
    goToOrderList();
  }
  window.showScrapbook = showScrapbook;
```

- [ ] **Step 2: Manual test — reaction plays**

1. Clear IndexedDB, complete Hugh's flow through Confirm.

Expected:
- Reaction screen: Hugh sprite left, captured photo main stage.
- Dialogue strip plays: "Oh…!" → "It's beautiful…" → "It feels like the light is alive again." → "Thank you apprentice!"
- On final tap, console logs "TODO: scrapbook, just completed: paper" and transitions to order list (Hugh shows DONE).

- [ ] **Step 3: Commit**

```bash
git add main.js
git commit -m "feat: reaction screen shows photo + reaction dialogue"
```

---

## Task 14: Scrapbook + Final Closing

**Files:**
- Modify: `main.js` (implement `showScrapbook` with 3 fixed slots + final-closing trigger)
- Modify: `style.css` (scrapbook slot styles)

- [ ] **Step 1: Append scrapbook styles**

```css
#scrapbook-slots {
  flex-direction: row;
  gap: 16px;
  padding: 24px;
  align-items: center;
  justify-content: center;
}
.scrapbook-slot {
  width: 200px;
  height: 280px;
  background: #fff;
  border: 3px solid #c9a961;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  overflow: hidden;
}
.scrapbook-slot img {
  width: 100%;
  flex: 1;
  object-fit: cover;
  border-radius: 6px;
}
.scrapbook-slot-label {
  margin-top: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #3a2e1f;
}
.scrapbook-slot.empty {
  background: #eee3ce;
  border-style: dashed;
  color: #8b6914;
  font-size: 18px;
  text-align: center;
}
.scrapbook-slot.new {
  animation: pulseGlow 1.4s ease-in-out;
}
@keyframes pulseGlow {
  0%   { box-shadow: 0 0 0 0 rgba(201,169,97,0.0); }
  50%  { box-shadow: 0 0 24px 8px rgba(201,169,97,0.7); }
  100% { box-shadow: 0 0 0 0 rgba(201,169,97,0.0); }
}
```

- [ ] **Step 2: Replace the `showScrapbook` stub**

```js
  async function showScrapbook(justCompletedCritterId) {
    const orders = await DB.loadOrders();
    const byId = Object.fromEntries(orders.map(o => [o.critterId, o]));

    const container = document.getElementById('scrapbook-slots');
    container.innerHTML = '';
    container.style.display = 'flex';

    const ids = ['paper', 'felt', 'wood'];
    const imgUrls = [];
    ids.forEach(function (id) {
      const c = CRITTERS[id];
      const slot = document.createElement('div');
      slot.className = 'scrapbook-slot';
      const order = byId[id];
      if (order && order.photoBlob) {
        const url = URL.createObjectURL(order.photoBlob);
        imgUrls.push(url);
        const img = document.createElement('img');
        img.src = url;
        slot.appendChild(img);
        const label = document.createElement('div');
        label.className = 'scrapbook-slot-label';
        label.textContent = c.name;
        slot.appendChild(label);
        if (id === justCompletedCritterId) slot.classList.add('new');
      } else {
        slot.classList.add('empty');
        slot.textContent = `${c.name}\n(not yet made)`;
        slot.style.whiteSpace = 'pre-line';
      }
      container.appendChild(slot);
    });

    showScreen('screen-scrapbook');

    // Decide dialogue: final closing if all three done and not yet shown; else celebration
    const allDone = orders.length >= 3;
    const shown = await DB.getMeta('finalClosingShown');
    if (allDone && !shown) {
      Dialogue.playSequence('final-closing', async function () {
        await DB.setMeta('finalClosingShown', true);
        wireScrapbookContinue(imgUrls);
      });
    } else {
      document.getElementById('dialogue-bubble').textContent =
        justCompletedCritterId
          ? `Another one for the order book!`
          : `Your order book so far…`;
      wireScrapbookContinue(imgUrls);
    }
  }

  function wireScrapbookContinue(imgUrls) {
    const btn = document.getElementById('btn-scrapbook-continue');
    btn.onclick = function () {
      imgUrls.forEach(u => URL.revokeObjectURL(u));
      goToOrderList();
    };
  }
```

- [ ] **Step 3: Manual test — single order**

1. Clear IndexedDB.
2. Tap through onboarding, Hugh's lesson, crafting, capture, Confirm.

Expected:
- After reaction dialogue, scrapbook screen shows three slots:
  - Slot 1 (Hugh): the captured photo, "Hugh" label, animated glow.
  - Slots 2 & 3: dashed empty boxes with "Puff (not yet made)" / "Rowan (not yet made)".
- Dialogue strip: "Another one for the order book!".
- Tap Continue → order list (Hugh shows DONE).

- [ ] **Step 4: Manual test — all three orders + final closing**

Continue from the same session: complete Puff, then Rowan.

Expected (after Rowan's reaction):
- Scrapbook shows all three photos.
- Dialogue strip plays the final-closing sequence ("Well then, apprentice…" → 3 bubbles → "Well done.").
- After final tap, Continue button is clickable → returns to order list.
- Order list: all three cards show DONE and are un-tappable.
- Reload the page: lands on order list with all done; no final-closing replays.
- Trigger scrapbook again by tapping a done card? — done cards are un-tappable; scrapbook only accessed via completion flow. This is acceptable per the spec (prototype).

- [ ] **Step 5: Commit**

```bash
git add main.js style.css
git commit -m "feat: scrapbook with 3 fixed slots and final closing trigger"
```

---

## Task 15: End-to-End Verification + Cleanup Polish

**Files:**
- Modify: `main.js` (double-tap prevention + memory-cleanup audit)
- Modify: `style.css` (any polish tweaks)

- [ ] **Step 1: Add double-tap prevention to dialogue engine**

iOS Safari may fire rapid taps. The engine already advances once per tap, but defensive guard:

In `dialogue.js`, inside `playSequence`, add a debounce just before the tap handler:

Replace the `onTap` function with:

```js
    let lastTap = 0;
    function onTap(e) {
      const now = Date.now();
      if (now - lastTap < 120) return;
      lastTap = now;
      // Ignore taps on buttons (e.g. side-panel buttons)
      if (e.target && e.target.closest && e.target.closest('button')) return;
      e.preventDefault();
      player.advance();
      step();
    }
```

- [ ] **Step 2: Ensure dialogue strip is hidden during screens that don't use it**

In `main.js`, update the `hideStrip` check in `showScreen` to also cover when a specific screen requests no dialogue (e.g. order list shows static text, so don't hide). Current behavior is correct: strip is only hidden for camera and preview, and text is updated directly on order-list. No change needed unless testing reveals issues.

- [ ] **Step 3: Full end-to-end walkthrough**

1. Clear IndexedDB.
2. Serve: `npx serve .`.
3. Open in a mobile browser (or Chrome DevTools device mode, landscape iPad).
4. Rotate to portrait — verify rotate prompt.
5. Rotate back — onboarding plays.
6. Complete all three orders in any order (try picking Rowan first).
7. Verify:
   - Lessons play with correct pop-ups (check colour wheel transitions, texture drawings, form reinforcement steps).
   - Camera works over HTTPS (use `https://localhost` via `serve --ssl` if needed, or test `getUserMedia` behavior in a real deployed HTTPS environment).
   - Upload fallback works (disable camera permission in browser settings, reload, retry).
   - Blur modal fires on a deliberately blurry photo.
   - Scrapbook accumulates photos across orders.
   - Final closing plays exactly once after third order.
   - Reload mid-session — skips onboarding but resumes at order list with completion intact.

- [ ] **Step 4: Check memory cleanup**

Open DevTools → Memory. Complete one full order. Return to order list. Trigger a few more camera-open/close cycles. Verify:
- No detached video elements linger (check `performance.memory.usedJSHeapSize` doesn't grow monotonically across repeat cycles).
- `MediaStream` tracks all end (use `Camera.close()` logging if needed).

If leaks appear, add explicit `URL.revokeObjectURL` or null-out references in offending code path.

- [ ] **Step 5: Commit polish**

```bash
git add dialogue.js main.js
git commit -m "polish: double-tap guard, ignore taps on buttons during dialogue"
```

- [ ] **Step 6: Tag the prototype**

```bash
git tag -a prototype-v1 -m "Skrawl prototype complete — all three critters, scrapbook, placeholders"
```

---

## Done

All screens implemented, all three critter flows work end-to-end, persistence is wired, placeholder art is labeled for handoff, and tests cover the pure-logic pieces. Artists can swap placeholders per the protocol in `CLAUDE.md` without touching logic.

Manual verification checklist:
- Landscape lock + rotate prompt
- Onboarding once, skipped thereafter
- Free-pick order list, completed critters marked DONE
- All three lessons with their pop-ups in the right places
- Camera viewfinder + framing guide + upload link
- Blur detection soft-blocks blurry photos with override
- Photos persist across reloads
- Scrapbook shows 3 fixed slots
- Final closing narrator plays once when all three done
