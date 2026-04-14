# Skrawl Prototype — Design Spec

Date: 2026-04-13
Status: Approved for planning

## Overview

Skrawl is a landscape-only browser game for children (ages 6-12) that blends digital gameplay with physical crafting. Players are guided by a narrator, choose one of three critter orders, receive an art lesson, craft a physical object, photograph it, and watch the critter react. Completed orders live in a scrapbook.

This spec covers the **prototype** scope: all three critter flows (Hugh/colour, Puff/texture, Rowan/form) from the existing `Game_Script.md`, with placeholder art.

**Stack:** Vanilla HTML, CSS, JS. No framework, no build step, no game engine. IndexedDB for persistence (via `idb` CDN). Fixed 1280x720 canvas scaled with CSS `transform: scale()`. Landscape only; portrait shows a rotate prompt.

## Session Flow & State

### Startup

- First page load → onboarding → order list.
- Subsequent loads → straight to order list (driven by an `onboarded: true` flag in IndexedDB `meta` store).

### Order selection

- Order list always shows all three critters (Hugh, Puff, Rowan).
- Free-pick order: child can pick any un-completed critter.
- Each critter is one-and-done: after completion, the card is marked complete (visual: grey/checkmark/"done" stamp) and un-tappable.
- No redo in-session. Scrapbook holds exactly 3 entries at most.

### Per-critter flow

```
order-list → lesson → crafting-prompt → camera → preview
  → (retake) camera | (confirm) reaction → scrapbook → order-list
```

- After the critter's reaction dialogue ends, the scrapbook appears with the new entry celebrated (tap to continue).
- Scrapbook → order list.

### End state

When all three critters are complete:

- The scrapbook view that concludes the third order triggers a final narrator closing sequence ("You've helped everyone. Well done, apprentice.").
- Control then returns to the order list, showing all three marked complete. The scrapbook remains openable.
- No in-app reset. A hard refresh + IndexedDB clear is the only way to restart.

### Audio

Silent prototype. No music, no SFX. No audio scaffolding.

## Persistence (IndexedDB)

Via `idb` CDN library. `db.js` exposes:

- `getMeta(key)` / `setMeta(key, value)` — for flags like `onboarded`
- `saveOrder(critterId, photoBlob)` — stores a completed order
- `loadOrders()` — returns all completed orders

Schema:

- **`meta`** store: key-value. Known keys: `onboarded` (boolean), `finalClosingShown` (boolean).
- **`orders`** store: records of `{ critterId: "paper" | "felt" | "wood", photoBlob: Blob, timestamp: number }`. Keyed by `critterId` (one record per critter max).

No localStorage is used (JPEG photos exceed its limits).

## Dialogue Engine

### Interaction model

- Tap anywhere on screen advances dialogue.
- No separate tap targets for pop-ups — pop-ups are script-driven (they appear and dismiss based on line metadata, not user taps).
- Script notation from `Game_Script.md`:
  - `*` = next line within the same speech bubble (text replaces in place)
  - `/` = new speech bubble (clears old bubble, fades in new one)

### Data model

Dialogue sequences are JS data in `script.js`:

```js
SEQUENCES = {
  "onboarding": [bubble, bubble, ...],
  "hugh-lesson": [...],
  "hugh-reaction": [...],
  "puff-lesson": [...],
  "puff-reaction": [...],
  "rowan-lesson": [...],
  "rowan-reaction": [...],
  "final-closing": [...],
}
```

Each bubble:

```js
{
  lines: [
    { text: "Colors that sit across from each other…" },
    { text: "Like red and green…", popup: "colour-wheel-red-green" },
    { text: "Or blue and orange…", popup: "colour-wheel-blue-orange" },
    { text: "They're called complementary colors.", popup: "dismiss" },
  ],
  isExit: false
}
```

- Each line optionally carries a `popup` key. Showing that line swaps the Main Stage pop-up to that key.
- `popup: "dismiss"` closes any active pop-up.
- `isExit: true` on the last bubble of a sequence — when reached and tapped past its last line, the engine calls the sequence's `onExit` callback (which triggers the next screen).

### Engine API

`dialogue.js` exposes:

```js
playSequence(sequenceKey, onExit)
```

Responsibilities:

- Render current bubble in the Dialogue Strip (y:560-720).
- On tap, advance to next line. Text swaps in place within the same bubble for `*` lines; a new bubble fades in for `/` lines.
- Manage pop-up layer: call `renderPopup(key)` / `dismissPopup()` as lines dictate.
- When sequence ends, call `onExit()`.

### Pop-ups

- Rendered in the Main Stage zone (x:280-980, y:0-560), z-index 2 (above background, below dialogue strip).
- `POPUP_CONTENT` map in `dialogue.js` (or a dedicated `popups.js`): key → DOM-returning function. Placeholder phase uses labeled SVG divs. Final phase swaps to `<img src="assets/final/popup-[key].png">`.
- Full key list is in `CLAUDE.md` under "Lesson Pop-ups". The engine does not assume which pop-ups exist — any string key works.

## Camera, Photo & Blur

### Camera screen layout

- Main Stage expands to fill the stage area; critter panel and side panel hidden.
- Live viewfinder covers the expanded stage, with a dashed framing guide overlay encouraging the child to fill the frame.
- Bottom-center: large **Take Photo** button (120px tall, primary).
- Bottom-right: small **Upload from files** link (always available — not just a fallback).
- Top-left: small **Back** button → returns to crafting prompt.

### Camera config

- `getUserMedia({ video: { facingMode: "environment" } })` — rear camera by default.
- On any failure (no HTTPS, permission denied, no camera), the viewfinder is replaced with a friendly "Tap here to upload your photo" prompt pointing at the file input.

### File upload

- `<input type="file" accept="image/*" capture="environment">`.
- On mobile, `capture` opens the native camera; falls through to file picker if camera denied.
- Uploaded files go through the same blur check + preview pipeline as live captures.

### Blur detection

- Captured frame → offscreen canvas → grayscale → Laplacian kernel → variance.
- Threshold: **80** (Laplacian variance). Adjustable constant at top of `camera.js`.
- Runs client-side, ~50ms, no network.

### Preview screen

- Captured photo shown full-size in Main Stage.
- **If blurry (variance < 80):** modal overlay "Looks a bit blurry! Try again?" with **Retake** (primary) and **Use Anyway** (secondary).
- **If sharp:** two buttons — **Retake** and **Confirm**.
- **Confirm** → saves blob to IndexedDB (`saveOrder`) → transitions to reaction screen.

### Stream cleanup

Camera stream is always stopped (`.getTracks().forEach(t => t.stop())`) when leaving the camera screen. Enforced centrally in `main.js` `showScreen()` when transitioning off `screen-camera`.

## Screens

Layout zones (1280x720, per `CLAUDE.md`):

| Zone | Bounds | Size |
|------|--------|------|
| Critter Panel | x:0-280, y:0-560 | 280x560 |
| Main Stage | x:280-980, y:0-560 | 700x560 |
| Side Panel | x:980-1280, y:0-560 | 300x560 |
| Dialogue Strip | x:0-1280, y:560-720 | 1280x160 |

### 1. `screen-onboarding`

- Critter Panel: narrator sprite.
- Main Stage: background (no pop-ups used in onboarding per current script).
- Dialogue Strip: narrator sequence from `script.js` → `SEQUENCES["onboarding"]`.
- Exit: transitions to order list.

### 2. `screen-order-list`

- Critter Panel: narrator sprite.
- Main Stage: three critter cards laid out horizontally. Each card shows critter sprite, name, material needed, and art element label. Completed critters render with a "done" visual treatment and are un-tappable.
- Dialogue Strip: short narrator prompt (e.g. "Who needs help today?").
- Tap a critter card → transitions to that critter's lesson.

### 3. `screen-lesson`

- Critter Panel: active critter sprite.
- Main Stage: pop-up layer (initially empty, populated as dialogue progresses).
- Dialogue Strip: critter lesson sequence.
- Exit: transitions to crafting prompt.

### 4. `screen-crafting`

- Critter Panel: active critter sprite.
- Main Stage: task prompt text (e.g. "Make a stained glass window") + tip text (e.g. "Cut and paste construction paper…") + "When you're ready, photograph your creation against a neutral background."
- Side Panel: large **Take a Photo** button.
- Dialogue Strip: minimal or empty (task text lives in Main Stage).

### 5. `screen-camera`

See Camera section above. Panels hidden; stage expands.

### 6. `screen-preview`

- Main Stage: captured photo.
- Blurry overlay modal or confirm/retake buttons per preview logic.

### 7. `screen-reaction`

- Critter Panel: active critter sprite.
- Main Stage: the captured photo (so the child sees what the critter is reacting to).
- Dialogue Strip: reaction sequence.
- Exit: transitions to scrapbook.

### 8. `screen-scrapbook`

- Critter Panel: narrator sprite.
- Main Stage: three fixed slots (one per critter, in fixed order: Hugh, Puff, Rowan). Completed slots show the saved photo; incomplete slots show a silhouette/placeholder labeled "not yet made".
- Side Panel: **Continue** button → back to order list.
- Dialogue Strip: short narrator line appropriate to context. If this scrapbook view is triggered immediately after reaction, it celebrates the new entry. If all three are now complete and the final closing hasn't yet played (`meta.finalClosingShown !== true`), it plays the `final-closing` sequence instead, then sets the flag.

### 9. Rotate prompt (not a screen)

Full-screen overlay shown whenever the viewport is portrait-oriented. Blocks all interaction until rotated. Re-checks on `orientationchange` / `resize`.

## File Structure & Module Responsibilities

```
skrawl/
├── CLAUDE.md
├── Game_Script.md
├── docs/
│   └── superpowers/specs/
│       └── 2026-04-13-skrawl-prototype-design.md   ← this file
├── index.html
├── style.css
├── main.js
├── script.js
├── dialogue.js
├── camera.js
├── db.js
└── assets/
    ├── placeholders/
    └── final/
```

### `index.html`

- Single HTML file. All screens as `<div class="screen" id="screen-X">` elements. Only the active screen has the `.active` class.
- Includes `idb` from CDN via `<script>`.
- Loads local modules in order: `db.js`, `script.js`, `dialogue.js`, `camera.js`, `main.js`.

### `style.css`

- Base styles, placeholder classes (e.g. `.placeholder-bg`, `.placeholder-critter-paper`) clearly labeled for artist handoff per the asset swap protocol in `CLAUDE.md`.
- Screen transitions (fade or instant — prototype can use instant).
- Min font size 22px (canvas units) for child-readable text.
- Min button size 80x80px; primary actions 120px tall.

### `main.js`

App entry. Responsibilities:

- Canvas scaling (`scaleScene()`) on load and resize.
- Orientation check and rotate-prompt toggling.
- Screen state machine: `showScreen(id)`.
  - Handles pre-exit cleanup (stops camera stream when leaving `screen-camera`).
  - Handles critter-panel sprite swap per screen.
- Boot flow: check `meta.onboarded` → route to onboarding or order list.
- Order-list rendering + click handlers (checks `loadOrders()` to mark completed critters).
- Scrapbook rendering (3 fixed slots) + post-reaction logic (detects all-three-complete → plays `final-closing` once).
- Exposes `CRITTERS` data:
  ```js
  CRITTERS = {
    paper: { name: "Hugh", full: "Hugh the Colour Chameleon", element: "COLOUR", material: "Construction Paper & Scissors", task: "Make a stained glass window", tip: "Cut and paste construction paper to make your stained glass window", sprite: "..." },
    felt:  { ... Puff ... },
    wood:  { ... Rowan ... },
  }
  ```

### `script.js`

- Exports `SEQUENCES` map (see Dialogue Engine section).
- Parsed manually from `Game_Script.md` into the bubble/line JS data structure.
- Pop-up keys inside lines correspond to entries in `POPUP_CONTENT`.

### `dialogue.js`

- Pure dialogue engine. API: `playSequence(sequenceKey, onExit)`.
- Manages bubble rendering, line advancement, pop-up show/dismiss.
- Exposes `POPUP_CONTENT` (or imports from `popups.js` if it grows large).

### `camera.js`

- API: `openCamera(onCapture, onCancel)`.
- Owns viewfinder DOM insertion, stream lifecycle, framing guide, Take Photo button, Upload link, Back button, blur detection.
- Calls `onCapture(blob)` when the child confirms a photo (i.e. preview → Confirm). Calls `onCancel()` on Back.
- Blur threshold (80) is a constant at top of file.

### `db.js`

- API: `saveOrder(critterId, blob)`, `loadOrders()`, `getMeta(key)`, `setMeta(key, value)`.
- Uses `idb` from the CDN global.

## State Machine Summary

```
boot
  → (meta.onboarded?) 
      no  → onboarding → order-list
      yes → order-list

order-list
  → (tap un-completed critter) → lesson[critter]

lesson[critter]
  → crafting[critter]

crafting[critter]
  → (tap Take a Photo) → camera

camera
  → (capture or upload → preview)
  → (back) → crafting[critter]

preview
  → (retake) → camera
  → (confirm) → saveOrder → reaction[critter]

reaction[critter]
  → scrapbook (with new entry celebrated)

scrapbook
  (on entry: if all three complete && !meta.finalClosingShown,
   dialogue strip plays final-closing sequence, sets flag;
   otherwise plays the standard celebration line)
  → (tap Continue) → order-list
```

## Constraints (from CLAUDE.md — must hold)

- No localStorage. IndexedDB only.
- No framework, no build step, no game engine.
- Landscape only; portrait blocked.
- Camera requires HTTPS in production (upload fallback covers file:// and non-HTTPS).
- Always stop camera streams on leaving camera screen.
- All coordinates in 1280x720 canvas units.
- Min font 22px, min button 80x80, primary actions 120px tall.
- Blur threshold 80 (Laplacian variance).

## Out of Scope for Prototype

- Final art assets (placeholder SVGs until artists deliver).
- Audio (music, SFX, voiceover).
- API-based background/content validation (handled externally if needed).
- Multi-session user profiles (IndexedDB is per-browser, per-origin).
- In-app reset/restart.
- Accessibility beyond large touch targets and landscape lock (no screen reader, no colour-blind mode for prototype).
