const book = document.getElementById("book");
const flap = document.getElementById("flap");
const flapContent = document.getElementById("flapContent");
const foldGradient = document.getElementById("foldGradient");
const leftFront = document.getElementById("left-front");
const rightFront = document.getElementById("right-front");
const leftUnder = document.getElementById("left-under");
const rightUnder = document.getElementById("right-under");
const transitionPage = document.getElementById("transitionPage");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const spreadStatus = document.getElementById("spreadStatus");
const viewToggle = document.getElementById("viewToggle");
const zoomOutButton = document.getElementById("zoomOutButton");
const zoomInButton = document.getElementById("zoomInButton");
const zoomValue = document.getElementById("zoomValue");
const rotateOverlay = document.getElementById("rotateOverlay");
const rotateDismissButton = document.getElementById("rotateDismiss");

const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 1.3;
const ZOOM_STEP = 0.1;
const TURN_DURATION_MS = 460;
const COMPACT_TURN_DURATION_MS = 220;
const COMPACT_SWIPE_START_PX = 12;
const COMPACT_COMPLETE_RATIO = 0.18;
const POINTER_DELTA_EPSILON = 0.5;
const COMPACT_BREAKPOINT_PX = 900;
const COVER_ANIMATION_CLASSNAMES = [
  "is-front-opening",
  "is-front-closing",
  "is-back-opening",
  "is-back-closing",
];

const compactViewportMedia = window.matchMedia(
  `(max-width: ${COMPACT_BREAKPOINT_PX}px)`,
);
const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
const missingMobileAssets = new Set();
const missingDesktopAssets = new Set();
const warmedImages = new Map();

function toArabicNumber(value) {
  return String(value)
    .padStart(2, "0")
    .replace(/\d/g, (digit) => arabicDigits[Number(digit)]);
}

function toImagePath(fileName, variant = "") {
  const encodedFileName = encodeURIComponent(fileName);
  return variant
    ? `image/${variant}/${encodedFileName}`
    : `image/${encodedFileName}`;
}

function createImagePage(fileName, alt, options = {}) {
  return {
    isBlank: false,
    role: options.role ?? "page",
    alt,
    width: options.width ?? 1200,
    height: options.height ?? 848,
    originalSrc: toImagePath(fileName),
    desktopSrc: toImagePath(fileName, "desktop"),
    mobileSrc: toImagePath(fileName, "mobile"),
  };
}

const BLANK_PAGE = {
  isBlank: true,
  role: "blank",
  alt: "",
  width: 0,
  height: 0,
  originalSrc: "",
  desktopSrc: "",
  mobileSrc: "",
};

const pages = [
  BLANK_PAGE,
  createImagePage("cover 1.webp", "الغلاف الأمامي", { role: "front-cover" }),
  createImagePage("صفحه 2  بلانكت شمال  من المجله.webp", "ألوان بلانكت فرو"),
  createImagePage("صفحه 2  بلانكت يمين  من المجله.webp", "بلانكت فرو"),
  createImagePage("صفحه 3   من المجله شمال.webp", "ألوان يقطين قطيفة"),
  createImagePage("صفحه 3   من المجله يمين.webp", "يقطين قطيفة"),
  createImagePage("صفحه 4 من المجله ششمال يقطين  كورات.webp", "ألوان يقطين فرو"),
  createImagePage("صفحه 4 من المجله الوانيقطين يمينكورات.webp", "يقطين فرو"),
  createImagePage("صفحه 5 مربع شمال   فرو  من المجله.webp", "ألوان مربع كورات فرو"),
  createImagePage("صفحه 5 مربع يمين   فرو  من المجله.webp", "مربع كورات فرو"),
  createImagePage("صفحه 6 ورده شمال   فرو  من المجله.webp", "ألوان مدور كورات فرو"),
  createImagePage("صفحه 6 ورده يمين  فرو  من المجله.webp", "مدور كورات فرو"),
  createImagePage("صفحه 7 ورده شمال فرو  من المجله.webp", "ألوان وردة فرو"),
  createImagePage("صفحه 7 ورده يمين فرو  من المجله.webp", "وردة فرو"),
  createImagePage("صفحه 8 ورده شمال من المجله.webp", "ألوان وردة"),
  createImagePage("صفحه 8 ورده يمين من المجله.webp", "وردة"),
  createImagePage("صفحه 9  عقدهى شمال من المجله.webp", "ألوان عقدة"),
  createImagePage("صفحه 9 يمين عقده من المجله.webp", "عقدة"),
  createImagePage("صفحه 10 شمال عقده من المجله.webp", "ألوان عقدة كلاسيك"),
  createImagePage("صفحه 10 يمين عقده من المجله.webp", "عقدة كلاسيك"),
  createImagePage("صفحه 11 شمال ياسمينه من المجله.webp", "ألوان ياسمينة"),
  createImagePage("صفحه 11 يمين ياسمينه من المجله.webp", "ياسمينة"),
  createImagePage("صفحه 12يصدفه  شمال  من المجله.webp", "ألوان صدفة"),
  createImagePage("صفحه 12يصدفه يمين    من المجله.webp", "صدفة"),
  createImagePage("صفحه 13يقطينه شمال    من المجله.webp", "ألوان يقطينة"),
  createImagePage("صفحه 13يقطينه يمين    من المجله.webp", "يقطينة"),
  createImagePage("صفحه 14 فيونكه شمال  من المجله.webp", "ألوان فيونكة"),
  createImagePage("صفحه 14 فيونكه يمين  من المجله.webp", "فيونكة"),
  createImagePage("صفحه 15 شمال ستراس مربع من المجله.webp", "ألوان مربع ستراس"),
  createImagePage("صفحه 15  يمين مربع استراس من المجله.webp", "مربع ستراس"),
  createImagePage("صفحه 16 شمال من المجله.webp", "ألوان أرنب"),
  createImagePage("صفحه 16  ارنب من المجله.webp", "أرنب"),
  createImagePage("صفحه 17 شمال  من المجله.webp", "ألوان فراشة قطيفة"),
  createImagePage("فراشه صفحه 17 من المجله.webp", "فراشة قطيفة"),
  createImagePage("صفحه 18 شمال  من المجله.webp", "ألوان تاج"),
  createImagePage("صفحه 18 تاج من المجله.webp", "تاج"),
  createImagePage("cover 2.webp", "الغلاف الخلفي", { role: "back-cover" }),
  BLANK_PAGE,
];

const readingPageIndices = pages.reduce((indices, page, index) => {
  if (!page.isBlank) {
    indices.push(index);
  }

  return indices;
}, []);

const totalReadingPages = readingPageIndices.length;
const readingNumberByPageIndex = new Map(
  readingPageIndices.map((pageIndex, readingIndex) => [pageIndex, readingIndex + 1]),
);
const singleIndexByPageIndex = new Map(
  readingPageIndices.map((pageIndex, singleIndex) => [pageIndex, singleIndex]),
);

function createSurface(root) {
  root.textContent = "";

  const article = document.createElement("article");
  article.className = "sheet sheet--image";

  const zoom = document.createElement("div");
  zoom.className = "sheet-zoom";

  const imageSheet = document.createElement("div");
  imageSheet.className = "image-sheet";

  const frame = document.createElement("div");
  frame.className = "single-image-frame";

  const img = document.createElement("img");
  img.className = "single-image";
  img.alt = "";
  img.draggable = false;
  img.decoding = "async";
  img.width = 1200;
  img.height = 848;

  frame.append(img);
  imageSheet.append(frame);
  zoom.append(imageSheet);

  const number = document.createElement("span");
  number.className = "page-number";

  article.append(zoom, number);
  root.append(article);

  const surface = {
    root,
    article,
    img,
    number,
    currentPageIndex: null,
    currentSrc: "",
  };

  img.addEventListener("load", () => {
    img.classList.add("loaded");
  });

  img.addEventListener("error", () => {
    const page = pages[surface.currentPageIndex];

    if (page && surface.currentSrc === page.mobileSrc && page.desktopSrc) {
      missingMobileAssets.add(page.mobileSrc);
      surface.currentSrc = "";
      updateSurfaceImage(surface, surface.currentPageIndex, img.fetchPriority || "auto");
      return;
    }

    if (page && surface.currentSrc === page.desktopSrc && page.originalSrc) {
      missingDesktopAssets.add(page.desktopSrc);
      surface.currentSrc = "";
      updateSurfaceImage(surface, surface.currentPageIndex, img.fetchPriority || "auto");
      return;
    }

    img.classList.add("loaded");
  });

  hideSurfaceContent(surface);
  return surface;
}

const surfaces = {
  leftUnder: createSurface(leftUnder),
  rightUnder: createSurface(rightUnder),
  leftFront: createSurface(leftFront),
  rightFront: createSurface(rightFront),
  transition: createSurface(transitionPage),
  flap: createSurface(flapContent),
};

function hideSurfaceContent(surface) {
  surface.article.hidden = true;
  surface.number.hidden = true;
  surface.root.removeAttribute("data-page-index");
  surface.root.dataset.pageRole = "blank";
}

function showSurface(surface) {
  surface.article.hidden = false;
}

function getPageSource(page) {
  if (!page || page.isBlank) {
    return "";
  }

  if (state.compactViewport && page.mobileSrc && !missingMobileAssets.has(page.mobileSrc)) {
    return page.mobileSrc;
  }

  if (page.desktopSrc && !missingDesktopAssets.has(page.desktopSrc)) {
    return page.desktopSrc;
  }

  return page.originalSrc;
}

function warmImage(src) {
  if (!src) {
    return Promise.resolve();
  }

  if (warmedImages.has(src)) {
    return warmedImages.get(src);
  }

  const img = new Image();
  img.decoding = "async";
  img.src = src;

  const promise = img.decode
    ? img.decode().catch(() => {})
    : new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });

  warmedImages.set(src, promise);
  return promise;
}

function updateSurfaceImage(surface, pageIndex, priority = "auto") {
  const page = pages[pageIndex];

  if (!page || page.isBlank) {
    return;
  }

  const nextSrc = getPageSource(page);
  surface.currentPageIndex = pageIndex;
  surface.img.alt = page.alt;
  surface.img.width = page.width;
  surface.img.height = page.height;
  surface.img.fetchPriority = priority;

  if (!nextSrc) {
    return;
  }

  if (surface.currentSrc === nextSrc) {
    if (surface.img.complete) {
      surface.img.classList.add("loaded");
    }
    return;
  }

  surface.currentSrc = nextSrc;
  surface.img.classList.remove("loaded");
  surface.img.src = nextSrc;

  if (surface.img.complete) {
    surface.img.classList.add("loaded");
  }
}

function renderSurface(surface, pageIndex, options = {}) {
  const page = pages[pageIndex];

  if (!page || page.isBlank) {
    surface.root.style.display = "none";
    hideSurfaceContent(surface);
    return;
  }

  surface.root.style.display = options.display ?? "block";
  surface.root.dataset.pageIndex = String(pageIndex);
  surface.root.dataset.pageRole = page.role;
  showSurface(surface);

  const pageNumber = readingNumberByPageIndex.get(pageIndex);
  surface.number.hidden = options.hideNumber || !pageNumber;

  if (!surface.number.hidden) {
    surface.number.textContent = `${toArabicNumber(pageNumber)} / ${toArabicNumber(totalReadingPages)}`;
  }

  updateSurfaceImage(surface, pageIndex, options.priority ?? "auto");
}

function clearSurface(surface) {
  surface.root.style.display = "none";
  hideSurfaceContent(surface);
}

function hasRealPage(index) {
  return Boolean(pages[index] && !pages[index].isBlank);
}

function getReadingPageIndex(singleIndex) {
  return readingPageIndices[singleIndex];
}

function getSingleIndexForSpread(leftIndex) {
  const primaryPageIndex = [leftIndex + 1, leftIndex].find((index) =>
    hasRealPage(index),
  );

  return primaryPageIndex === undefined
    ? 0
    : (singleIndexByPageIndex.get(primaryPageIndex) ?? 0);
}

function getSpreadStatusText(leftIndex) {
  const visible = [leftIndex + 1, leftIndex]
    .filter((index) => hasRealPage(index))
    .map((pageIndex) => toArabicNumber(readingNumberByPageIndex.get(pageIndex)));
  const range = visible.length > 1 ? `${visible[1]}-${visible[0]}` : visible[0] ?? "";

  return `${range} / ${toArabicNumber(totalReadingPages)}`;
}

function getSingleStatusText(singleIndex) {
  const pageIndex = getReadingPageIndex(singleIndex);
  const currentPageNumber = readingNumberByPageIndex.get(pageIndex) ?? 0;

  return `${toArabicNumber(currentPageNumber)} / ${toArabicNumber(totalReadingPages)}`;
}

const state = {
  width: 0,
  height: 0,
  pageWidth: 0,
  spineX: 0,
  diagonal: 0,
  leftIndex: 0,
  singleIndex: 0,
  viewMode: compactViewportMedia.matches ? "single" : "spread",
  zoom: 1,
  activeSide: null,
  activeCorner: null,
  isDragging: false,
  isAnimating: false,
  cornerThreshold: 100,
  animationFrame: null,
  pointerFrame: null,
  pendingDesktopPoint: null,
  lastRenderedDesktopPoint: null,
  pendingCompactDeltaX: null,
  compactViewport: compactViewportMedia.matches,
  activeFrontPage: null,
  activeHingeX: null,
  dragRect: null,
  pointerId: null,
  gestureStartX: 0,
  gestureStartY: 0,
  compactTurnSide: null,
  compactCurrentDeltaX: 0,
  compactTargetSingleIndex: null,
  compactGestureTracking: false,
};

function isSinglePageView() {
  return state.compactViewport || state.viewMode === "single";
}

function syncSingleIndexFromLeft() {
  state.singleIndex = getSingleIndexForSpread(state.leftIndex);
}

function syncLeftIndexFromSingle() {
  state.leftIndex = normalizeSpreadIndex(getReadingPageIndex(state.singleIndex) ?? 0);
}

function normalizeSpreadIndex(index) {
  const maxStart = Math.max(0, pages.length - 2);
  const alignedIndex = Math.max(0, index - (index % 2));
  return Math.min(alignedIndex, maxStart);
}

function findAdjacentSpread(startIndex, direction) {
  let candidate = startIndex + direction * 2;

  while (candidate >= 0 && candidate < pages.length) {
    if (hasRealPage(candidate) || hasRealPage(candidate + 1)) {
      return candidate;
    }

    candidate += direction * 2;
  }

  return startIndex;
}

const FRONT_COVER_INDEX = pages.findIndex((page) => page.role === "front-cover");
const BACK_COVER_INDEX = pages.findIndex((page) => page.role === "back-cover");
const FRONT_COVER_SPREAD_INDEX = normalizeSpreadIndex(FRONT_COVER_INDEX);
const BACK_COVER_SPREAD_INDEX = normalizeSpreadIndex(BACK_COVER_INDEX);
const FIRST_INTERIOR_SPREAD_INDEX = findAdjacentSpread(FRONT_COVER_SPREAD_INDEX, 1);
const LAST_INTERIOR_SPREAD_INDEX = findAdjacentSpread(BACK_COVER_SPREAD_INDEX, -1);

function getEdgeCoverType(leftIndex = state.leftIndex) {
  if (leftIndex === FRONT_COVER_SPREAD_INDEX) {
    return "front";
  }

  if (leftIndex === BACK_COVER_SPREAD_INDEX) {
    return "back";
  }

  return null;
}

function getEdgeCoverPageIndex(leftIndex = state.leftIndex) {
  const coverType = getEdgeCoverType(leftIndex);

  if (coverType === "front") {
    return FRONT_COVER_INDEX;
  }

  if (coverType === "back") {
    return BACK_COVER_INDEX;
  }

  return null;
}

function getEdgeTurnConfig(side) {
  if (isSinglePageView() || state.compactViewport) {
    return null;
  }

  if (side === "right") {
    if (state.leftIndex === FRONT_COVER_SPREAD_INDEX) {
      return { action: "open", coverType: "front" };
    }

    if (state.leftIndex === LAST_INTERIOR_SPREAD_INDEX) {
      return { action: "close", coverType: "back" };
    }
  }

  if (side === "left") {
    if (state.leftIndex === BACK_COVER_SPREAD_INDEX) {
      return { action: "open", coverType: "back" };
    }

    if (state.leftIndex === FIRST_INTERIOR_SPREAD_INDEX) {
      return { action: "close", coverType: "front" };
    }
  }

  return null;
}

function applyZoom() {
  document.documentElement.style.setProperty(
    "--content-scale",
    state.zoom.toFixed(2),
  );
  zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
}

function canGoNext() {
  if (isSinglePageView()) {
    return state.singleIndex < totalReadingPages - 1;
  }

  return state.leftIndex + 1 < pages.length - 1;
}

function canGoPrevious() {
  if (isSinglePageView()) {
    return state.singleIndex > 0;
  }

  return state.leftIndex > 0;
}

function syncMotionClasses() {
  book.classList.toggle("is-turning", state.isDragging || state.isAnimating);
  book.classList.toggle(
    "is-compact-turning",
    state.compactTurnSide !== null || state.pendingCompactDeltaX !== null,
  );
}

function syncControls() {
  prevButton.disabled = !canGoPrevious() || state.isDragging || state.isAnimating;
  nextButton.disabled = !canGoNext() || state.isDragging || state.isAnimating;
  viewToggle.disabled = state.compactViewport || state.isDragging || state.isAnimating;
  zoomOutButton.disabled =
    state.isDragging || state.isAnimating || state.zoom <= MIN_ZOOM;
  zoomInButton.disabled =
    state.isDragging || state.isAnimating || state.zoom >= MAX_ZOOM;

  if (state.compactViewport) {
    viewToggle.dataset.view = "spread";
    viewToggle.setAttribute("aria-label", "عرض الصفحتين متاح على الشاشات الواسعة");
    viewToggle.setAttribute("title", "عرض الصفحتين متاح على الشاشات الواسعة");
  } else if (isSinglePageView()) {
    viewToggle.dataset.view = "spread";
    viewToggle.setAttribute("aria-label", "عرض صفحتين");
    viewToggle.setAttribute("title", "عرض صفحتين");
  } else {
    viewToggle.dataset.view = "single";
    viewToggle.setAttribute("aria-label", "عرض صفحة واحدة");
    viewToggle.setAttribute("title", "عرض صفحة واحدة");
  }

  spreadStatus.textContent = isSinglePageView()
    ? getSingleStatusText(state.singleIndex)
    : getSpreadStatusText(state.leftIndex);
}

function resetQueuedPointerWork() {
  cancelAnimationFrame(state.pointerFrame);
  state.pointerFrame = null;
  state.pendingDesktopPoint = null;
  state.lastRenderedDesktopPoint = null;
  state.pendingCompactDeltaX = null;
}

function resetTransitionPage() {
  transitionPage.className = "page transition-page";
  transitionPage.style.display = "none";
  transitionPage.style.removeProperty("animation");
  transitionPage.style.removeProperty("transform");
  transitionPage.style.removeProperty("opacity");
  transitionPage.style.removeProperty("visibility");
  clearSurface(surfaces.transition);
}

function resetCompactGestureState() {
  state.pointerId = null;
  state.gestureStartX = 0;
  state.gestureStartY = 0;
  state.compactGestureTracking = false;
  state.dragRect = null;
}

function resetTurnVisuals() {
  cancelAnimationFrame(state.animationFrame);
  state.animationFrame = null;
  resetQueuedPointerWork();

  flap.style.display = "none";
  flap.style.clipPath = "none";
  flapContent.className = "flap-content";
  flapContent.style.transform = "none";
  flapContent.style.transformOrigin = "0 0";
  foldGradient.style.opacity = "0";
  foldGradient.style.transform = "translateZ(0)";

  for (const pageElement of [leftFront, rightFront, leftUnder, rightUnder]) {
    pageElement.style.clipPath = "none";
    pageElement.style.transform = "translateZ(0)";
    pageElement.style.opacity = "1";
    pageElement.style.visibility = "visible";
  }

  resetTransitionPage();
  resetCompactGestureState();
  syncMotionClasses();
}

function preloadPageByIndex(pageIndex) {
  const page = pages[pageIndex];

  if (!page || page.isBlank) {
    return;
  }

  warmImage(getPageSource(page));
}

function preloadNearbyPages() {
  if (isSinglePageView()) {
    for (let offset = -1; offset <= 2; offset += 1) {
      const pageIndex = getReadingPageIndex(state.singleIndex + offset);

      if (pageIndex !== undefined) {
        preloadPageByIndex(pageIndex);
      }
    }

    return;
  }

  for (let offset = -2; offset <= 4; offset += 1) {
    preloadPageByIndex(state.leftIndex + offset);
  }
}

function setSpreadLayers(startIndex) {
  renderSurface(surfaces.leftUnder, startIndex, { priority: "auto" });
  renderSurface(surfaces.rightUnder, startIndex + 1, { priority: "auto" });
}

function renderPages() {
  const edgeCoverType = !state.compactViewport && !isSinglePageView()
    ? getEdgeCoverType()
    : null;
  const isSingleSurface = isSinglePageView() || edgeCoverType !== null;

  document.body.classList.toggle("single-page-view", isSinglePageView());
  document.body.classList.toggle("compact-viewport", state.compactViewport);
  book.classList.toggle("book-container--single-surface", isSingleSurface);
  book.classList.toggle("book-container--edge-cover", edgeCoverType !== null);

  resetTurnVisuals();

  leftFront.classList.remove("page--edge-cover", "page--edge-front", "page--edge-back");
  rightFront.classList.remove("page--edge-cover", "page--edge-front", "page--edge-back");

  if (isSinglePageView()) {
    clearSurface(surfaces.leftUnder);
    clearSurface(surfaces.leftFront);
    clearSurface(surfaces.rightUnder);
    renderSurface(surfaces.rightFront, getReadingPageIndex(state.singleIndex), {
      priority: "high",
    });
  } else if (edgeCoverType !== null) {
    clearSurface(surfaces.leftUnder);
    clearSurface(surfaces.rightUnder);
    clearSurface(surfaces.leftFront);
    renderSurface(surfaces.rightFront, getEdgeCoverPageIndex(), {
      priority: "high",
    });
    rightFront.classList.add("page--edge-cover", `page--edge-${edgeCoverType}`);
  } else {
    setSpreadLayers(state.leftIndex);
    renderSurface(surfaces.leftFront, state.leftIndex, { priority: "high" });
    renderSurface(surfaces.rightFront, state.leftIndex + 1, { priority: "high" });
  }

  syncControls();
  preloadNearbyPages();
}

function setViewMode(mode) {
  if (state.compactViewport || mode === state.viewMode || state.isDragging || state.isAnimating) {
    return;
  }

  if (mode === "single") {
    syncSingleIndexFromLeft();
  } else {
    syncLeftIndexFromSingle();
  }

  state.viewMode = mode;
  renderPages();
}

function setZoom(nextZoom) {
  const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));

  if (clampedZoom === state.zoom) {
    return;
  }

  state.zoom = Number(clampedZoom.toFixed(2));
  applyZoom();
  syncControls();
}

function animateEdgeCoverTurn({ action, coverType }) {
  const coverIndex = coverType === "front" ? FRONT_COVER_INDEX : BACK_COVER_INDEX;
  const targetSpreadIndex =
    action === "open"
      ? coverType === "front"
        ? FIRST_INTERIOR_SPREAD_INDEX
        : LAST_INTERIOR_SPREAD_INDEX
      : coverType === "front"
        ? FRONT_COVER_SPREAD_INDEX
        : BACK_COVER_SPREAD_INDEX;
  const animationClass =
    action === "open"
      ? coverType === "front"
        ? "is-front-opening"
        : "is-back-opening"
      : coverType === "front"
        ? "is-front-closing"
        : "is-back-closing";

  if (coverIndex < 0 || state.isAnimating || state.isDragging) {
    return;
  }

  resetTurnVisuals();
  state.isAnimating = true;
  syncMotionClasses();
  syncControls();

  if (action === "open") {
    setSpreadLayers(targetSpreadIndex);
    clearSurface(surfaces.leftFront);
    rightFront.style.visibility = "hidden";
  }

  renderSurface(surfaces.transition, coverIndex, { priority: "high" });
  transitionPage.className = `page transition-page page--edge-cover transition-page--${coverType}`;
  transitionPage.style.display = "block";

  void transitionPage.offsetWidth;
  transitionPage.classList.add(animationClass);

  transitionPage.addEventListener(
    "animationend",
    () => {
      transitionPage.classList.remove(...COVER_ANIMATION_CLASSNAMES);
      state.leftIndex = targetSpreadIndex;
      syncSingleIndexFromLeft();
      state.isAnimating = false;
      syncMotionClasses();
      renderPages();
    },
    { once: true },
  );
}

function clipPolygon(points, a, b, c, keepInside) {
  const result = [];

  for (let index = 0; index < points.length; index += 1) {
    const pointA = points[index];
    const pointB = points[(index + 1) % points.length];
    const distanceA = a * pointA[0] + b * pointA[1] + c;
    const distanceB = a * pointB[0] + b * pointB[1] + c;
    const insideA = keepInside ? distanceA <= 0 : distanceA > 0;
    const insideB = keepInside ? distanceB <= 0 : distanceB > 0;

    if (insideA) {
      result.push(pointA);
    }

    if (insideA !== insideB) {
      const ratio = distanceA / (distanceA - distanceB);
      result.push([
        pointA[0] + ratio * (pointB[0] - pointA[0]),
        pointA[1] + ratio * (pointB[1] - pointA[1]),
      ]);
    }
  }

  return result;
}

function reflectPoint(point, a, b, c) {
  const distance = (a * point[0] + b * point[1] + c) / (a * a + b * b);
  return [point[0] - 2 * distance * a, point[1] - 2 * distance * b];
}

function toClipPath(points) {
  if (points.length === 0) {
    return "polygon(0 0)";
  }

  return `polygon(${points.map((point) => `${point[0]}px ${point[1]}px`).join(", ")})`;
}

function easeInOutCubic(progress) {
  if (progress < 0.5) {
    return 4 * progress * progress * progress;
  }

  return 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function constrainPoint(mouseX, mouseY) {
  let constrainedX = mouseX;
  let constrainedY = mouseY;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const cornerX = state.activeHingeX ?? state.spineX;
    const cornerY = state.activeCorner[1];
    const deltaX = constrainedX - cornerX;
    const deltaY = constrainedY - cornerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > state.pageWidth) {
      constrainedX = cornerX + (deltaX / distance) * state.pageWidth;
      constrainedY = cornerY + (deltaY / distance) * state.pageWidth;
    }

    const oppositeCornerY = state.activeCorner[1] === 0 ? state.height : 0;
    const oppositeDeltaX = constrainedX - cornerX;
    const oppositeDeltaY = constrainedY - oppositeCornerY;
    const oppositeDistance = Math.sqrt(
      oppositeDeltaX * oppositeDeltaX + oppositeDeltaY * oppositeDeltaY,
    );

    if (oppositeDistance > state.diagonal) {
      constrainedX = cornerX + (oppositeDeltaX / oppositeDistance) * state.diagonal;
      constrainedY =
        oppositeCornerY + (oppositeDeltaY / oppositeDistance) * state.diagonal;
    }
  }

  return [constrainedX, constrainedY];
}

function getTurnGeometry() {
  if (isSinglePageView()) {
    return {
      basePage: [
        [0, 0],
        [0, state.height],
        [state.width, state.height],
        [state.width, 0],
      ],
      frontPointA: state.activeSide === "right" ? [state.width, 0] : [0, 0],
      frontPointB: state.activeSide === "right" ? [0, 0] : [state.width, 0],
      offsetX: 0,
    };
  }

  if (state.activeSide === "right") {
    return {
      basePage: [
        [state.pageWidth, 0],
        [state.pageWidth, state.height],
        [state.width, state.height],
        [state.width, 0],
      ],
      frontPointA: [state.width, 0],
      frontPointB: [state.pageWidth, 0],
      offsetX: state.pageWidth,
    };
  }

  return {
    basePage: [
      [0, 0],
      [0, state.height],
      [state.pageWidth, state.height],
      [state.pageWidth, 0],
    ],
    frontPointA: [state.pageWidth, 0],
    frontPointB: [0, 0],
    offsetX: 0,
  };
}

function updateFold(x, y) {
  if (!state.activeCorner) {
    return;
  }

  if (x === state.activeCorner[0] && y === state.activeCorner[1]) {
    return;
  }

  const [mouseX, mouseY] = constrainPoint(x, y);
  const frontPage = state.activeFrontPage;

  if (!frontPage) {
    return;
  }

  const lineA = state.activeCorner[0] - mouseX;
  const lineB = state.activeCorner[1] - mouseY;
  const midpointX = (state.activeCorner[0] + mouseX) / 2;
  const midpointY = (state.activeCorner[1] + mouseY) / 2;
  const lineC = -(lineA * midpointX + lineB * midpointY);

  const { basePage, frontPointA, frontPointB, offsetX } = getTurnGeometry();

  const visibleFrontPoints = clipPolygon(basePage, lineA, lineB, lineC, true);
  const frontClipPoints = visibleFrontPoints.map((point) => [point[0] - offsetX, point[1]]);
  frontPage.style.clipPath = toClipPath(frontClipPoints);

  const hiddenFrontPoints = clipPolygon(basePage, lineA, lineB, lineC, false);
  const reflectedFlapPoints = hiddenFrontPoints.map((point) =>
    reflectPoint(point, lineA, lineB, lineC),
  );
  flap.style.clipPath = toClipPath(reflectedFlapPoints);

  const reflectedA = reflectPoint(frontPointA, lineA, lineB, lineC);
  const reflectedB = reflectPoint(frontPointB, lineA, lineB, lineC);
  const translateX = reflectedA[0];
  const translateY = reflectedA[1];
  const rotation = Math.atan2(
    reflectedB[1] - reflectedA[1],
    reflectedB[0] - reflectedA[0],
  );

  flapContent.style.transformOrigin = "0 0";
  flapContent.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}rad)`;

  const gradientAngle = Math.atan2(
    mouseY - state.activeCorner[1],
    mouseX - state.activeCorner[0],
  );
  foldGradient.style.transform = `translate(${midpointX}px, ${midpointY}px) rotate(${gradientAngle}rad)`;

  const progress = Math.abs(mouseX - state.activeCorner[0]) / state.width;
  foldGradient.style.opacity = Math.sin(progress * Math.PI).toFixed(3);
}

function flushQueuedPointerWork() {
  state.pointerFrame = null;

  if (state.pendingCompactDeltaX !== null && state.compactTurnSide) {
    applyCompactTurnOffset(state.pendingCompactDeltaX);
    state.pendingCompactDeltaX = null;
  }

  if (state.pendingDesktopPoint && state.isDragging && !state.compactViewport) {
    const nextPoint = state.pendingDesktopPoint;
    state.pendingDesktopPoint = null;

    if (
      state.lastRenderedDesktopPoint &&
      Math.abs(nextPoint.x - state.lastRenderedDesktopPoint.x) < POINTER_DELTA_EPSILON &&
      Math.abs(nextPoint.y - state.lastRenderedDesktopPoint.y) < POINTER_DELTA_EPSILON
    ) {
      return;
    }

    state.lastRenderedDesktopPoint = nextPoint;
    updateFold(nextPoint.x, nextPoint.y);
  }
}

function schedulePointerFrame() {
  if (state.pointerFrame) {
    return;
  }

  state.pointerFrame = requestAnimationFrame(flushQueuedPointerWork);
}

function queueFoldUpdate(x, y) {
  state.pendingDesktopPoint = { x, y };
  schedulePointerFrame();
}

function queueCompactTurnUpdate(deltaX) {
  state.pendingCompactDeltaX = deltaX;
  schedulePointerFrame();
}

function startDrag(side, corner, x, y) {
  if (state.isAnimating || state.isDragging) {
    return;
  }

  if (isSinglePageView()) {
    const targetIndex = state.singleIndex + (side === "right" ? 1 : -1);

    if (getReadingPageIndex(targetIndex) === undefined) {
      return;
    }
  }

  state.activeSide = side;
  state.activeCorner = corner;
  state.activeFrontPage =
    isSinglePageView() || side === "right" ? rightFront : leftFront;
  state.activeHingeX = isSinglePageView()
    ? side === "right"
      ? 0
      : state.width
    : state.spineX;
  state.isDragging = true;
  state.dragRect = book.getBoundingClientRect();
  flap.style.display = "block";

  if (isSinglePageView()) {
    const targetIndex = state.singleIndex + (side === "right" ? 1 : -1);
    const underIndex = state.singleIndex + (side === "right" ? 2 : -2);

    renderSurface(surfaces.rightUnder, getReadingPageIndex(underIndex), {
      priority: "auto",
    });
    renderSurface(surfaces.flap, getReadingPageIndex(targetIndex), {
      priority: "high",
    });
    flapContent.className = "flap-content is-single";
  } else if (side === "right") {
    renderSurface(surfaces.rightUnder, state.leftIndex + 3, { priority: "auto" });
    renderSurface(surfaces.flap, state.leftIndex + 2, { priority: "high" });
    flapContent.className = "flap-content is-left";
  } else {
    renderSurface(surfaces.leftUnder, state.leftIndex - 2, { priority: "auto" });
    renderSurface(surfaces.flap, state.leftIndex - 1, { priority: "high" });
    flapContent.className = "flap-content is-right";
  }

  syncMotionClasses();
  syncControls();
  updateFold(x, y);
}

function finalizeDesktopTurn(shouldComplete) {
  if (shouldComplete) {
    if (isSinglePageView()) {
      state.singleIndex += state.activeSide === "right" ? 1 : -1;
      syncLeftIndexFromSingle();
    } else {
      state.leftIndex += state.activeSide === "right" ? 2 : -2;
      syncSingleIndexFromLeft();
    }
  }

  state.activeSide = null;
  state.activeCorner = null;
  state.activeFrontPage = null;
  state.activeHingeX = null;
  state.dragRect = null;
  state.isAnimating = false;
  syncMotionClasses();
  renderPages();
}

function completeTurn(fromX, fromY, forceComplete = null) {
  const shouldComplete =
    forceComplete ??
    ((state.activeSide === "right" && fromX < state.width / 2) ||
      (state.activeSide === "left" && fromX > state.width / 2));

  state.isDragging = false;
  state.isAnimating = true;
  syncMotionClasses();
  syncControls();

  const activeSide = state.activeSide;
  const targetX = shouldComplete
    ? activeSide === "right"
      ? 0
      : state.width
    : state.activeCorner[0];
  const targetY = state.activeCorner[1];

  if (reducedMotionMedia.matches) {
    updateFold(targetX, targetY);
    finalizeDesktopTurn(shouldComplete);
    return;
  }

  const startTime = performance.now();

  cancelAnimationFrame(state.animationFrame);

  function animate(now) {
    const progress = Math.min((now - startTime) / TURN_DURATION_MS, 1);
    const eased = easeInOutCubic(progress);

    updateFold(
      fromX + (targetX - fromX) * eased,
      fromY + (targetY - fromY) * eased,
    );

    if (progress < 1) {
      state.animationFrame = requestAnimationFrame(animate);
      return;
    }

    state.animationFrame = null;
    finalizeDesktopTurn(shouldComplete);
  }

  state.animationFrame = requestAnimationFrame(animate);
}

function prepareCompactTurn(side) {
  if (state.isAnimating || state.isDragging) {
    return false;
  }

  const targetSingleIndex = state.singleIndex + (side === "right" ? 1 : -1);
  const targetPageIndex = getReadingPageIndex(targetSingleIndex);

  if (targetPageIndex === undefined) {
    return false;
  }

  state.activeSide = side;
  state.compactTurnSide = side;
  state.compactTargetSingleIndex = targetSingleIndex;
  state.compactCurrentDeltaX = 0;
  state.isDragging = true;

  renderSurface(surfaces.rightUnder, targetPageIndex, { priority: "high" });
  warmImage(getPageSource(pages[targetPageIndex]));

  book.classList.add("is-compact-turning");
  syncMotionClasses();
  syncControls();
  applyCompactTurnOffset(0);
  return true;
}

function applyCompactTurnOffset(deltaX) {
  if (!state.compactTurnSide) {
    return;
  }

  const maxDistance = Math.max(state.width, 1);
  const clamped =
    state.compactTurnSide === "right"
      ? Math.max(-maxDistance, Math.min(0, deltaX))
      : Math.min(maxDistance, Math.max(0, deltaX));
  const progress = Math.min(1, Math.abs(clamped) / maxDistance);

  state.compactCurrentDeltaX = clamped;
  rightFront.style.transform = `translate3d(${clamped}px, 0, 0)`;
  rightFront.style.opacity = String(1 - progress * 0.08);
  rightUnder.style.transform = `scale(${0.985 + progress * 0.015})`;
  rightUnder.style.opacity = String(0.72 + progress * 0.28);
}

function finalizeCompactTurn(shouldComplete) {
  if (shouldComplete) {
    state.singleIndex = state.compactTargetSingleIndex;
    syncLeftIndexFromSingle();
  }

  state.activeSide = null;
  state.isAnimating = false;
  state.compactTurnSide = null;
  state.compactTargetSingleIndex = null;
  state.compactCurrentDeltaX = 0;
  resetCompactGestureState();
  syncMotionClasses();
  renderPages();
}

function completeCompactTurn(forceComplete = null) {
  const shouldComplete =
    forceComplete ?? Math.abs(state.compactCurrentDeltaX) >= state.width * COMPACT_COMPLETE_RATIO;
  const startOffset = state.compactCurrentDeltaX;
  const targetOffset =
    shouldComplete
      ? state.compactTurnSide === "right"
        ? -state.width
        : state.width
      : 0;

  state.isDragging = false;
  state.isAnimating = true;
  syncMotionClasses();
  syncControls();

  if (reducedMotionMedia.matches) {
    applyCompactTurnOffset(targetOffset);
    finalizeCompactTurn(shouldComplete);
    return;
  }

  const startTime = performance.now();
  const distanceRatio = Math.abs(targetOffset - startOffset) / Math.max(state.width, 1);
  const duration = Math.max(120, COMPACT_TURN_DURATION_MS * Math.max(0.5, distanceRatio));

  cancelAnimationFrame(state.animationFrame);

  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = easeInOutCubic(progress);

    applyCompactTurnOffset(startOffset + (targetOffset - startOffset) * eased);

    if (progress < 1) {
      state.animationFrame = requestAnimationFrame(animate);
      return;
    }

    state.animationFrame = null;
    finalizeCompactTurn(shouldComplete);
  }

  state.animationFrame = requestAnimationFrame(animate);
}

function goNext() {
  if (!canGoNext()) {
    return;
  }

  turnPage("right");
}

function goPrevious() {
  if (!canGoPrevious()) {
    return;
  }

  turnPage("left");
}

function getRelativePoint(event) {
  const rect = state.dragRect ?? book.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function startCompactGesture(event) {
  if (state.isAnimating || state.isDragging) {
    return;
  }

  state.pointerId = event.pointerId;
  state.dragRect = book.getBoundingClientRect();
  const point = getRelativePoint(event);
  state.gestureStartX = point.x;
  state.gestureStartY = point.y;
  state.compactGestureTracking = true;
  book.setPointerCapture(event.pointerId);
}

function handleCompactPointerMove(event) {
  if (!state.compactGestureTracking || state.pointerId !== event.pointerId) {
    return;
  }

  const point = getRelativePoint(event);
  const deltaX = point.x - state.gestureStartX;
  const deltaY = point.y - state.gestureStartY;

  if (!state.compactTurnSide) {
    if (
      Math.abs(deltaX) < COMPACT_SWIPE_START_PX ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    const side = deltaX < 0 ? "right" : "left";

    if ((side === "right" && !canGoNext()) || (side === "left" && !canGoPrevious())) {
      resetCompactGestureState();
      return;
    }

    if (!prepareCompactTurn(side)) {
      resetCompactGestureState();
      return;
    }
  }

  const directionalDelta =
    state.compactTurnSide === "right"
      ? Math.min(0, deltaX)
      : Math.max(0, deltaX);

  queueCompactTurnUpdate(directionalDelta);
}

function finishCompactPointer() {
  if (state.compactTurnSide && (state.isDragging || state.isAnimating)) {
    completeCompactTurn();
    return;
  }

  resetCompactGestureState();
}

book.addEventListener("pointerdown", (event) => {
  if (state.compactViewport) {
    startCompactGesture(event);
    return;
  }

  if (state.isAnimating || state.isDragging) {
    return;
  }

  state.dragRect = book.getBoundingClientRect();
  const { x, y } = getRelativePoint(event);
  const threshold = state.cornerThreshold;
  const nearRight = x > state.width - threshold;
  const nearLeft = x < threshold;
  const nearTop = y < threshold;
  const nearBottom = y > state.height - threshold;
  const dragSide =
    nearRight && (nearTop || nearBottom)
      ? "right"
      : nearLeft && (nearTop || nearBottom)
        ? "left"
        : null;

  if (dragSide) {
    const edgeTurn = getEdgeTurnConfig(dragSide);

    if (edgeTurn) {
      animateEdgeCoverTurn(edgeTurn);
      return;
    }
  }

  if (nearRight && (nearTop || nearBottom) && canGoNext()) {
    book.setPointerCapture(event.pointerId);
    startDrag("right", [state.width, nearTop ? 0 : state.height], x, y);
  } else if (nearLeft && (nearTop || nearBottom) && canGoPrevious()) {
    book.setPointerCapture(event.pointerId);
    startDrag("left", [0, nearTop ? 0 : state.height], x, y);
  }
});

book.addEventListener("pointermove", (event) => {
  if (state.compactViewport) {
    handleCompactPointerMove(event);
    return;
  }

  if (!state.isDragging) {
    return;
  }

  const { x, y } = getRelativePoint(event);
  queueFoldUpdate(x, y);
});

function handlePointerRelease(event) {
  if (state.compactViewport) {
    if (state.pointerId !== null && event.pointerId !== undefined && state.pointerId !== event.pointerId) {
      return;
    }

    finishCompactPointer();
    return;
  }

  if (!state.isDragging) {
    return;
  }

  const { x, y } = getRelativePoint(event);
  completeTurn(x, y);
}

book.addEventListener("pointerup", handlePointerRelease);
book.addEventListener("pointercancel", handlePointerRelease);
book.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

function turnPage(side) {
  if (state.isAnimating || state.isDragging) {
    return;
  }

  if (side === "right" && !canGoNext()) {
    return;
  }

  if (side === "left" && !canGoPrevious()) {
    return;
  }

  if (state.compactViewport) {
    if (prepareCompactTurn(side)) {
      completeCompactTurn(true);
    }
    return;
  }

  const edgeTurn = getEdgeTurnConfig(side);

  if (edgeTurn) {
    animateEdgeCoverTurn(edgeTurn);
    return;
  }

  const corner = side === "right" ? [state.width, state.height] : [0, state.height];
  const startX = isSinglePageView()
    ? side === "right"
      ? state.width - 24
      : 24
    : side === "right"
      ? state.width - state.pageWidth * 0.35
      : state.pageWidth * 0.35;
  const startY = state.height - 36;

  startDrag(side, corner, startX, startY);
  completeTurn(startX, startY, true);
}

function handleResize() {
  state.compactViewport = compactViewportMedia.matches;
  document.body.classList.toggle("compact-viewport", state.compactViewport);

  const rect = book.getBoundingClientRect();
  const activePageWidth = isSinglePageView() ? rect.width : rect.width / 2;

  state.width = rect.width;
  state.height = rect.height;
  state.pageWidth = activePageWidth;
  state.spineX = activePageWidth;
  state.diagonal = Math.sqrt(activePageWidth ** 2 + state.height ** 2);
  state.cornerThreshold = Math.max(56, Math.min(140, activePageWidth * 0.18));

  if (!state.isDragging && !state.isAnimating) {
    renderPages();
  }
}

const resizeObserver = new ResizeObserver(handleResize);
resizeObserver.observe(book);
compactViewportMedia.addEventListener("change", handleResize);

prevButton.addEventListener("click", goPrevious);
nextButton.addEventListener("click", goNext);

viewToggle.addEventListener("click", () => {
  setViewMode(isSinglePageView() ? "spread" : "single");
});

zoomOutButton.addEventListener("click", () => {
  setZoom(state.zoom - ZOOM_STEP);
});

zoomInButton.addEventListener("click", () => {
  setZoom(state.zoom + ZOOM_STEP);
});

rotateDismissButton.addEventListener("click", () => {
  rotateDismissButton.blur();
  rotateOverlay.classList.add("dismissed");
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    goNext();
  }

  if (event.key === "ArrowLeft") {
    goPrevious();
  }
});

applyZoom();
renderPages();
