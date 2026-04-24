# CLAUDE.md — The Apprentice's Workshop

## What You Are Building

A landscape-only browser game for children (ages 6-12) that blends digital gameplay with physical crafting. Players: onboarding narrator -> choose critter orders -> art lesson -> physical crafting -> photograph it -> critter reaction -> scrapbook.

**Stack:** Vanilla HTML, CSS, JS. No framework. No game engine. No build step.
**Orientation:** Landscape only. Portrait shows a rotate prompt.
**Target:** iOS Safari + Android Chrome + iPad browsers.
**Status:** Placeholder phase — no real art assets yet. All placeholders are labeled for artist handoff.
**Script source:** `Game_Script.md` in the repo root. All dialogue, pop-up triggers, and critter reactions are defined there.

---

## Commands

```bash
npx serve .          # or: python3 -m http.server 8080
# Must be served over HTTP/HTTPS — camera won't work via file:// URLs
```

No build step, no npm install, no bundler. CDN deps load at runtime.

---

## File Structure

```
skrawl/
├── CLAUDE.md
├── Game_Script.md        ← script source (dialogue, pop-ups, reactions)
├── index.html
├── style.css
├── main.js
├── db.js
└── assets/
    ├── placeholders/     ← SVG placeholders generated at runtime
    └── final/            ← empty, artists populate this
```

---

## Architecture

### Canvas & Scaling
- Fixed 1280x720 canvas, scaled via `transform: scale()` to fit any device
- All coordinates in CSS/JS use canvas units (not screen pixels)
- `scaleScene()` in main.js handles responsive scaling

### Layout Zones (1280x720)
| Zone | Bounds | Size |
|------|--------|------|
| Critter Panel | x:0-280, y:0-560 | 280x560 |
| Main Stage | x:280-980, y:0-560 | 700x560 |
| Side Panel | x:980-1280, y:0-560 | 300x560 |
| Dialogue Strip | x:0-1280, y:560-720 | 1280x160 |

### Screens (in order)
1. `screen-onboarding` — narrator intro
2. `screen-order-list` — three critter cards
3. `screen-lesson` — dialogue + pop-up layer
4. `screen-crafting` — task prompt + tip + camera button
5. `screen-camera` — live viewfinder + framing guide
6. `screen-preview` — captured photo + retake/confirm
7. `screen-reaction` — critter responds to photo
8. `screen-scrapbook` — grid of completed orders

### Dialogue Engine
Shared by onboarding, lessons, and reactions. Two interaction types from the script:
- `*` = new line within same speech bubble (tap replaces text in place)
- `/` = new speech bubble (clears and shows fresh bubble)

Data model: `bubble = { lines[], popup?, popupDismiss?, isExit? }`

### Pop-up System
Pop-ups appear in Main Stage zone during lessons (z-index 2, above background, below dialogue). Keyed by string — `renderPopup(key)` / `dismissPopup()`.

### Photo Quality
Two layers:
1. **UX framing overlay** — guide box on live camera encourages filling frame
2. **Client-side blur detection** — Laplacian variance check (~50ms, no network), soft-blocks if too blurry with encouraging retry message

No API-based background check in this codebase. Background validation will be handled externally via Google AI API if needed.

### Persistence
IndexedDB via `idb` CDN library. `db.js` handles `saveOrder()` and `loadOrders()`.

---

## Critter Data

Three critters, each teaching one art element. Dialogue is in `Game_Script.md`.

| ID | Name | Full Name | Art Element | Material | Task |
|----|------|-----------|-------------|----------|------|
| paper | Hugh | Hugh the Colour Chameleon | COLOUR | Construction Paper & Scissors | Make a stained glass window |
| felt | Puff | Puff the Sheep | TEXTURE | Felt, Fabric, or Yarn | Make a scarf |
| wood | Rowan | Rowan the Owl | FORM | Popsicle Sticks & Glue | Rebuild a birdhouse |

---

## Placeholder Asset Map

Every placeholder is labeled so artists know exactly what to replace. When final art arrives, swap the path — no logic changes needed.

### Backgrounds
| Placeholder | File to create | Where used |
|-------------|---------------|------------|
| `.placeholder-bg` (CSS beige + grid lines) | `assets/final/workshop-background.png` (1280x720) | All screens as base background |

### Characters
| Placeholder | File to create | Where used |
|-------------|---------------|------------|
| SVG rounded rect, letter "H", color #E8A87C | `assets/final/critter-paper.png` (240x350) | Hugh — order card, lesson panel, crafting, reaction |
| SVG rounded rect, letter "P", color #A8D8B9 | `assets/final/critter-felt.png` (240x350) | Puff — order card, lesson panel, crafting, reaction |
| SVG rounded rect, letter "R", color #C4A882 | `assets/final/critter-wood.png` (240x350) | Rowan — order card, lesson panel, crafting, reaction |
| SVG rounded rect, wizard emoji, color #8B6914 | `assets/final/narrator.png` (200x300) | Onboarding screen, critter panel |

### Dialogue Frame
| Placeholder | File to create | Where used |
|-------------|---------------|------------|
| `.dialogue-strip` (white bg + gold border-top) | `assets/final/dialogue-frame.png` (1280x160) | Bottom of every screen |

### Lesson Pop-ups (Main Stage area, 700x560)
| Popup Key | Description | File to create |
|-----------|-------------|---------------|
| `stained-glass-examples` | 3 example stained glass window illustrations | `assets/final/popup-stained-glass-examples.png` |
| `colour-wheel` | Colour wheel diagram | `assets/final/popup-colour-wheel.png` |
| `colour-wheel-red-green` | Colour wheel highlighting red & green as complementary | `assets/final/popup-colour-wheel-red-green.png` |
| `colour-wheel-blue-orange` | Colour wheel highlighting blue & orange as complementary | `assets/final/popup-colour-wheel-blue-orange.png` |
| `colour-mood-yellow` | Yellow = happy/warm mood illustration | `assets/final/popup-colour-mood-yellow.png` |
| `colour-mood-blue` | Blue = calm/quiet mood illustration | `assets/final/popup-colour-mood-blue.png` |
| `colour-mood-grey` | Dark/grey = mysterious mood illustration | `assets/final/popup-colour-mood-grey.png` |
| `texture-soft` | Illustration of soft texture (e.g. teddy bear) | `assets/final/popup-texture-soft.png` |
| `texture-rough` | Illustration of rough texture (e.g. rock) | `assets/final/popup-texture-rough.png` |
| `texture-smooth` | Illustration of smooth texture (e.g. mirror) | `assets/final/popup-texture-smooth.png` |
| `texture-bumpy` | Illustration of bumpy texture (e.g. volcanic rock) | `assets/final/popup-texture-bumpy.png` |
| `form-2d-square` | Flat 2D square shape | `assets/final/popup-form-2d-square.png` |
| `form-3d-cube` | 3D cube with visible depth | `assets/final/popup-form-3d-cube.png` |
| `form-cube-sway` | Animated/swaying 3D cube (unstable) | `assets/final/popup-form-cube-sway.gif` or animated |
| `form-reinforced` | Cube with reinforced sides | `assets/final/popup-form-reinforced.png` |
| `form-reinforced-roof` | Reinforced cube with roof added | `assets/final/popup-form-reinforced-roof.png` |
| `form-reinforced-base` | Full structure: reinforced sides + roof + base | `assets/final/popup-form-reinforced-base.png` |

---

## Asset Swap Protocol

When final art arrives, swap without touching logic:

**Critter sprites:** Set `sprite` path in CRITTERS data (main.js):
```javascript
paper: { sprite: 'assets/final/critter-paper.png', ... }
```

**Background:** Update `.placeholder-bg` in style.css:
```css
.placeholder-bg { background-image: url('assets/final/workshop-background.png'); background-size: 1280px 720px; }
```

**Dialogue frame:** Update `.dialogue-strip` in style.css + adjust `.dialogue-text` coordinates per artist spec.

**Pop-ups:** Replace HTML in `POPUP_CONTENT` map with `<img src="assets/final/popup-[key].png">`.

---

## Build Order

Build and verify each step in-browser before proceeding:

1. **Static shell** — index.html, style.css base, main.js foundation (scaling, orientation)
2. **Onboarding** — narrator intro using dialogue engine (from Game_Script.md)
3. **Order list** — three critter cards, tap to select
4. **Lesson screen** — dialogue engine + pop-up layer active
5. **Crafting prompt** — task + tip + "Take a Photo" button
6. **Camera flow** — viewfinder with framing guide, blur detection, preview with retake/confirm
7. **IndexedDB persistence** — verify save/load across reloads
8. **Reaction + scrapbook** — critter response, photo grid, "New Order" button
9. **Polish** — Android back button, orientation re-checks, double-tap prevention, memory cleanup

---

## Constraints — Never Violate

- **No localStorage.** IndexedDB only (db.js). JPEG photos exceed localStorage limits.
- **No game engine.** No Phaser, Pixi, Unity WebGL.
- **No framework.** No React, Vue, Svelte. Vanilla JS only.
- **No build step.** No webpack, vite, rollup. Files serve as-is.
- **No API-based photo checks in this codebase.** Background validation is external.
- **Camera requires HTTPS in production.** File picker fallback for non-HTTPS.
- **Always stop camera streams** when leaving camera screen.
- **Min font size: 22px** canvas units for child-readable text.
- **Min button size: 80x80px** canvas units. Primary actions: 120px tall.
- **All coordinates in 1280x720 canvas units**, not screen pixels.
- **Portrait mode always blocked** by rotate prompt. No portrait layouts.
- **Blur threshold: 80** (Laplacian variance). Lower to 50 if false positives in classroom lighting, raise to 120 if blurry photos slip through.
