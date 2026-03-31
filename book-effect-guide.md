# PageSwap - Interactive Book Viewer

A vanilla JS product catalog viewer with realistic page-turn animations using clip-path geometry, lazy-loaded WebP images, and CSS cover-flip keyframes.

---

## Architecture

```
index.html    Static shell: book container, flap overlay, toolbar
css.css       Layout, page layers, cover animations, responsive breakpoints
js.js         State machine, fold math, lazy loading, edge-cover transitions
image/*.webp  Product images (WebP, max 1200px, ~2.5MB total)
```

### HTML Layer Stack (inside `#book`)

```
z-index 6  .transition-page    CSS keyframe cover flip (front/back)
z-index 5  .flap               Clip-path fold overlay (drag + auto turn)
z-index 2  #left-front          Left visible page
z-index 2  #right-front         Right visible page
z-index 0  #left-under          Left reveal page (shown during turn)
z-index 0  #right-under         Right reveal page (shown during turn)
```

---

## View Modes

### Spread (default)
Two pages side by side. `state.leftIndex` is the left page index (always even). The spine pseudo-element (`::before`) draws the center crease. Pages advance by 2.

### Single Page
One page fills the container. `state.singleIndex` maps into `readingPageIndices` (non-blank pages only). Body gets `.single-page-view` which hides the left side and stretches `#right-front` to full width.

### Edge Cover
Spread mode on the first or last spread shows a single cover image full-width using `.page--edge-cover`. Turning from a cover triggers a CSS 3D flip animation instead of the clip-path fold.

---

## Page Turn Mechanics

### Drag Turn (clip-path fold)

User grabs a corner → `startDrag()` → `updateFold()` per frame → `completeTurn()`.

**Fold math pipeline** (`updateFold`):
1. `constrainPoint` — clamps the drag point to two radius constraints (page width from hinge, diagonal from opposite corner) using 3 convergence iterations
2. Compute the perpendicular bisector line (`ax + by + c = 0`) between the corner origin and the constrained mouse point
3. `clipPolygon` — Sutherland-Hodgman clip of the page rectangle against that line:
   - **keep-inside** → visible portion of the front page → applied as `clip-path` on the front page element
   - **keep-outside** → hidden portion → reflected across the bisector → applied as `clip-path` on the `.flap` overlay
4. `reflectPoint` on the page corners → `translate + rotate` transform on `.flap-content` (the backside of the turning page)
5. `.fold-gradient` — a giant rotated gradient element positioned at the fold line midpoint, opacity based on turn progress

**Completion**: `completeTurn` animates from the current point to either the opposite edge (complete) or back to the origin corner (cancel) using `easeInOutCubic` over `TURN_DURATION_MS` (480ms).

### Button / Keyboard Turn

`turnPage(side)` → `startDrag()` with a synthetic start point near the bottom corner → immediate `completeTurn(..., true)`.

### Cover Turn (CSS keyframe)

`animateEdgeCoverTurn()` uses the `.transition-page` element with one of four CSS animations:
- `frontCoverOpen` — `rotateY(0 → -178deg)`, origin left
- `frontCoverClose` — `rotateY(-178deg → 0)`, origin left
- `backCoverOpen` — `rotateY(0 → 178deg)`, origin right
- `backCoverClose` — `rotateY(178deg → 0)`, origin right

Duration: 620ms, easing: `cubic-bezier(0.22, 0.61, 0.36, 1)`.

---

## Image Loading

### Lazy Loading
Images use `data-src` instead of `src`. When a page becomes visible, `activateLazyImages()` copies `data-src` → `src` and adds a `.loaded` class on the `load` event for a 200ms opacity fade-in.

### Preloading
`preloadNearbyPages()` runs after each render:
- **Spread**: preloads pages at `leftIndex - 2` through `leftIndex + 4`
- **Single**: preloads `singleIndex - 1` through `singleIndex + 2`

Uses `new Image()` objects tracked in `preloadedSrcs` Set to avoid duplicate requests.

### Image Format
All source images converted from PNG to WebP at quality 82, resized to max 1200px longest side. Total ~2.5MB (down from ~119MB PNG originals).

---

## State Object

```js
state = {
  width, height,        // book container dimensions (from ResizeObserver)
  pageWidth,            // single page width (width / 2 in spread, width in single)
  spineX,               // x-coordinate of the spine (= pageWidth)
  diagonal,             // sqrt(pageWidth² + height²) — max drag radius
  leftIndex,            // spread mode: index of the left page in pages[]
  singleIndex,          // single mode: index into readingPageIndices[]
  viewMode,             // "spread" | "single"
  zoom,                 // 0.8 – 1.3, applied via --content-scale CSS variable
  activeSide,           // "left" | "right" | null — which side is being turned
  activeCorner,         // [x, y] — the corner being dragged from
  isDragging,           // pointer is held and fold is updating
  isAnimating,          // auto-completing or cancelling a turn
  cornerThreshold,      // pixel distance from corner to start a drag
  animationFrame,       // current rAF id
  activeFrontPage,      // DOM element being clipped during turn
  activeHingeX,         // x-coordinate of the fold hinge point
}
```

---

## Page Data

```js
pages[]  // Array of { isBlank, role, src, markup }
         // role: "blank" | "page" | "front-cover" | "back-cover"
         // Blank pages are structural padding (index 0, 4, last)

readingPageIndices[]          // indices of non-blank pages
readingNumberByPageIndex      // Map: page index → display number (1-based)
singleIndexByPageIndex        // Map: page index → position in reading order
```

---

## Controls

| Control | Action |
|---------|--------|
| Arrow buttons | `goPrevious()` / `goNext()` |
| Arrow keys (← →) | Same as buttons |
| Corner drag | Grab any corner to drag-turn |
| View toggle | Switch between spread and single page |
| Zoom +/- | Scale content 80%–130% via `--content-scale` |

---

## CSS Custom Properties

| Variable | Purpose |
|----------|---------|
| `--spread-width` | Book width in spread mode |
| `--single-width` | Book width in single mode |
| `--width` | Active book width (switches via `.single-page-view`) |
| `--height` | Book height |
| `--page-padding` | Inner padding of each page |
| `--content-scale` | Zoom level applied to `.sheet-zoom` |

---

## Responsive Breakpoints

- **> 900px**: Full layout, max 1700px spread / 1360px single
- **<= 900px**: Full-bleed width, reduced height (80vh / 780px)
- **<= 640px**: Tighter padding, smaller toolbar, reduced font sizes
