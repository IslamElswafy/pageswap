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

const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 1.3;
const ZOOM_STEP = 0.1;
const TURN_DURATION_MS = 480;
const COVER_ANIMATION_CLASSNAMES = [
  "is-front-opening",
  "is-front-closing",
  "is-back-opening",
  "is-back-closing",
];

function toArabicNumber(value) {
  return String(value)
    .padStart(2, "0")
    .replace(/\d/g, (digit) => arabicDigits[Number(digit)]);
}

function pageTemplate(classes, content, pageNumber) {
  const numberMarkup = pageNumber
    ? `<span class="page-number">${toArabicNumber(pageNumber)} / ${toArabicNumber(totalReadingPages)}</span>`
    : "";
  return `
    <article class="sheet ${classes}">
      <div class="sheet-zoom">
        ${content}
      </div>
      ${numberMarkup}
    </article>
  `;
}

function toImagePath(fileName) {
  return `image/${encodeURIComponent(fileName)}`;
}

function imageContent(src, alt) {
  return `
    <div class="image-sheet">
      <div class="single-image-frame">
        <img
          class="single-image"
          data-src="${src}"
          alt="${alt}"
          draggable="false"
          decoding="async"
        />
      </div>
    </div>
  `;
}

function createImagePage(fileName, alt, options = {}) {
  const src = toImagePath(fileName);
  return {
    isBlank: false,
    role: options.role ?? "page",
    src,
    content: imageContent(src, alt),
  };
}

const BLANK_PAGE = {
  isBlank: true,
  role: "blank",
  markup: "",
};

const pages = [
  BLANK_PAGE,
  createImagePage("cover 1.webp", "الغلاف الأمامي", { role: "front-cover" }),
  createImagePage(
    "صفحه 2  بلانكت شمال  من المجله.webp",
    "ألوان بلانكت فرو",
  ),
  createImagePage(
    "صفحه 2  بلانكت يمين  من المجله.webp",
    "بلانكت فرو",
  ),
  createImagePage(
    "صفحه 3   من المجله شمال.webp",
    "ألوان يقطين قطيفة",
  ),
  createImagePage(
    "صفحه 3   من المجله يمين.webp",
    "يقطين قطيفة",
  ),
  createImagePage(
    "صفحه 4 من المجله ششمال يقطين  كورات.webp",
    "ألوان يقطين فرو",
  ),
  createImagePage(
    "صفحه 4 من المجله الوانيقطين يمينكورات.webp",
    "يقطين فرو",
  ),
  createImagePage(
    "صفحه 5 مربع شمال   فرو  من المجله.webp",
    "ألوان مربع كورات فرو",
  ),
  createImagePage(
    "صفحه 5 مربع يمين   فرو  من المجله.webp",
    "مربع كورات فرو",
  ),
  createImagePage(
    "صفحه 6 ورده شمال   فرو  من المجله.webp",
    "ألوان مدور كورات فرو",
  ),
  createImagePage(
    "صفحه 6 ورده يمين  فرو  من المجله.webp",
    "مدور كورات فرو",
  ),
  createImagePage(
    "صفحه 7 ورده شمال فرو  من المجله.webp",
    "ألوان وردة فرو",
  ),
  createImagePage(
    "صفحه 7 ورده يمين فرو  من المجله.webp",
    "وردة فرو",
  ),
  createImagePage(
    "صفحه 8 ورده شمال من المجله.webp",
    "ألوان وردة",
  ),
  createImagePage(
    "صفحه 8 ورده يمين من المجله.webp",
    "وردة",
  ),
  createImagePage(
    "صفحه 9  عقدهى شمال من المجله.webp",
    "ألوان عقدة",
  ),
  createImagePage(
    "صفحه 9 يمين عقده من المجله.webp",
    "عقدة",
  ),
  createImagePage(
    "صفحه 10 شمال عقده من المجله.webp",
    "ألوان عقدة كلاسيك",
  ),
  createImagePage(
    "صفحه 10 يمين عقده من المجله.webp",
    "عقدة كلاسيك",
  ),
  createImagePage(
    "صفحه 11 شمال ياسمينه من المجله.webp",
    "ألوان ياسمينة",
  ),
  createImagePage(
    "صفحه 11 يمين ياسمينه من المجله.webp",
    "ياسمينة",
  ),
  createImagePage(
    "صفحه 12يصدفه  شمال  من المجله.webp",
    "ألوان صدفة",
  ),
  createImagePage(
    "صفحه 12يصدفه يمين    من المجله.webp",
    "صدفة",
  ),
  createImagePage(
    "صفحه 13يقطينه شمال    من المجله.webp",
    "ألوان يقطينة",
  ),
  createImagePage(
    "صفحه 13يقطينه يمين    من المجله.webp",
    "يقطينة",
  ),
  createImagePage(
    "صفحه 14 فيونكه شمال  من المجله.webp",
    "ألوان فيونكة",
  ),
  createImagePage(
    "صفحه 14 فيونكه يمين  من المجله.webp",
    "فيونكة",
  ),
  createImagePage(
    "صفحه 15 شمال ستراس مربع من المجله.webp",
    "ألوان مربع ستراس",
  ),
  createImagePage(
    "صفحه 15  يمين مربع استراس من المجله.webp",
    "مربع ستراس",
  ),
  createImagePage(
    "صفحه 16 شمال من المجله.webp",
    "ألوان أرنب",
  ),
  createImagePage(
    "صفحه 16  ارنب من المجله.webp",
    "أرنب",
  ),
  createImagePage(
    "صفحه 17 شمال  من المجله.webp",
    "ألوان فراشة قطيفة",
  ),
  createImagePage(
    "فراشه صفحه 17 من المجله.webp",
    "فراشة قطيفة",
  ),
  createImagePage(
    "صفحه 18 شمال  من المجله.webp",
    "ألوان تاج",
  ),
  createImagePage(
    "صفحه 18 تاج من المجله.webp",
    "تاج",
  ),
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

for (const [pageIndex, pageNumber] of readingNumberByPageIndex) {
  const page = pages[pageIndex];
  page.markup = pageTemplate("sheet--image", page.content, pageNumber);
}

const preloadedSrcs = new Set();

function preloadImage(src) {
  if (!src || preloadedSrcs.has(src)) {
    return;
  }

  preloadedSrcs.add(src);
  const img = new Image();
  img.src = src;
}

function activateLazyImages(container) {
  if (!container) {
    return;
  }

  const lazyImages = container.querySelectorAll("img[data-src]");

  for (const img of lazyImages) {
    img.onload = () => img.classList.add("loaded");
    img.src = img.dataset.src;
    img.removeAttribute("data-src");

    if (img.complete) {
      img.classList.add("loaded");
    }
  }
}

function preloadNearbyPages() {
  if (isSinglePageView()) {
    for (let offset = -1; offset <= 2; offset += 1) {
      const idx = getReadingPageIndex(state.singleIndex + offset);

      if (idx !== undefined && pages[idx]?.src) {
        preloadImage(pages[idx].src);
      }
    }

    return;
  }

  for (let offset = -2; offset <= 4; offset += 1) {
    const idx = state.leftIndex + offset;

    if (pages[idx]?.src) {
      preloadImage(pages[idx].src);
    }
  }
}

function hasRealPage(index) {
  return Boolean(pages[index] && !pages[index].isBlank);
}

function getPageMarkup(index) {
  return pages[index]?.markup || "";
}

function getReadingPageIndex(singleIndex) {
  return readingPageIndices[singleIndex];
}

function getReadingPageMarkup(singleIndex) {
  const pageIndex = getReadingPageIndex(singleIndex);
  return pageIndex === undefined ? "" : getPageMarkup(pageIndex);
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
  viewMode: "spread",
  zoom: 1,
  activeSide: null,
  activeCorner: null,
  isDragging: false,
  isAnimating: false,
  cornerThreshold: 100,
  animationFrame: null,
  activeFrontPage: null,
  activeHingeX: null,
};

function isSinglePageView() {
  return state.viewMode === "single";
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

function isEdgeCoverSpread(leftIndex = state.leftIndex) {
  return !isSinglePageView() && getEdgeCoverType(leftIndex) !== null;
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
  if (isSinglePageView()) {
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

function handleResize() {
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

function applyZoom() {
  document.documentElement.style.setProperty(
    "--content-scale",
    state.zoom.toFixed(2),
  );
  zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
}

function syncControls() {
  prevButton.disabled = !canGoPrevious() || state.isDragging || state.isAnimating;
  nextButton.disabled = !canGoNext() || state.isDragging || state.isAnimating;
  viewToggle.disabled = state.isDragging || state.isAnimating;
  zoomOutButton.disabled =
    state.isDragging || state.isAnimating || state.zoom <= MIN_ZOOM;
  zoomInButton.disabled =
    state.isDragging || state.isAnimating || state.zoom >= MAX_ZOOM;

  if (isSinglePageView()) {
    spreadStatus.textContent = getSingleStatusText(state.singleIndex);
    viewToggle.dataset.view = "spread";
    viewToggle.setAttribute("aria-label", "عرض صفحتين");
    viewToggle.setAttribute("title", "عرض صفحتين");
    return;
  }

  spreadStatus.textContent = getSpreadStatusText(state.leftIndex);
  viewToggle.dataset.view = "single";
  viewToggle.setAttribute("aria-label", "عرض صفحة واحدة");
  viewToggle.setAttribute("title", "عرض صفحة واحدة");
}

function resetTransitionPage() {
  transitionPage.innerHTML = "";
  transitionPage.className = "page transition-page";
  transitionPage.style.display = "none";
  transitionPage.style.removeProperty("animation");
  transitionPage.style.removeProperty("transform");
  transitionPage.style.removeProperty("opacity");
}

function setSpreadLayers(startIndex) {
  leftUnder.style.display = "block";
  rightUnder.style.display = "block";
  leftUnder.innerHTML = getPageMarkup(startIndex);
  rightUnder.innerHTML = getPageMarkup(startIndex + 1);
  activateLazyImages(leftUnder);
  activateLazyImages(rightUnder);
}

function renderPages() {
  const edgeCoverType = isSinglePageView() ? null : getEdgeCoverType();
  const isSingleSurface = isSinglePageView() || edgeCoverType !== null;

  document.body.classList.toggle("single-page-view", isSinglePageView());
  book.classList.toggle("book-container--single-surface", isSingleSurface);
  book.classList.toggle("book-container--edge-cover", edgeCoverType !== null);

  cancelAnimationFrame(state.animationFrame);
  flap.style.display = "none";
  flap.style.clipPath = "none";
  flapContent.style.transform = "none";
  foldGradient.style.opacity = "0";
  leftFront.style.visibility = "visible";
  rightFront.style.visibility = "visible";
  leftFront.style.clipPath = "none";
  rightFront.style.clipPath = "none";
  leftFront.style.transform = "translateZ(0)";
  rightFront.style.transform = "translateZ(0)";
  leftFront.classList.remove("page--edge-cover", "page--edge-front", "page--edge-back");
  rightFront.classList.remove("page--edge-cover", "page--edge-front", "page--edge-back");
  resetTransitionPage();

  leftUnder.innerHTML = "";
  rightUnder.innerHTML = "";
  leftUnder.style.display = "none";
  rightUnder.style.display = "none";

  if (isSinglePageView()) {
    leftFront.innerHTML = "";
    leftUnder.style.display = "none";
    leftFront.style.display = "none";
    rightFront.style.display = "block";
    rightFront.innerHTML = getReadingPageMarkup(state.singleIndex);
  } else if (edgeCoverType !== null) {
    leftFront.innerHTML = "";
    leftFront.style.display = "none";
    rightFront.style.display = "block";
    rightFront.classList.add("page--edge-cover", `page--edge-${edgeCoverType}`);
    rightFront.innerHTML = getPageMarkup(getEdgeCoverPageIndex());
  } else {
    setSpreadLayers(state.leftIndex);
    leftFront.style.display = state.leftIndex >= 0 ? "block" : "none";
    rightFront.style.display = state.leftIndex + 1 < pages.length ? "block" : "none";
    leftFront.innerHTML = getPageMarkup(state.leftIndex);
    rightFront.innerHTML = getPageMarkup(state.leftIndex + 1);
  }

  activateLazyImages(leftFront);
  activateLazyImages(rightFront);
  syncControls();
  preloadNearbyPages();
}

if (window.innerWidth <= 768) {
  state.viewMode = "single";
  state.singleIndex = getSingleIndexForSpread(state.leftIndex);
}

applyZoom();
renderPages();

function setViewMode(mode) {
  if (mode === state.viewMode || state.isDragging || state.isAnimating) {
    return;
  }

  if (mode === "single") {
    state.singleIndex = getSingleIndexForSpread(state.leftIndex);
  } else {
    state.leftIndex = normalizeSpreadIndex(getReadingPageIndex(state.singleIndex) ?? 0);
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

  cancelAnimationFrame(state.animationFrame);
  state.activeSide = null;
  state.activeCorner = null;
  state.activeFrontPage = null;
  state.activeHingeX = null;
  state.isAnimating = true;
  flap.style.display = "none";
  flap.style.clipPath = "none";
  flapContent.style.transform = "none";
  foldGradient.style.opacity = "0";
  leftFront.style.clipPath = "none";
  rightFront.style.clipPath = "none";
  leftFront.style.transform = "translateZ(0)";
  rightFront.style.transform = "translateZ(0)";
  leftFront.style.visibility = "visible";
  rightFront.style.visibility = "visible";
  resetTransitionPage();

  if (action === "open") {
    book.classList.remove("book-container--edge-cover");
    setSpreadLayers(targetSpreadIndex);
    leftFront.style.display = "none";
    rightFront.style.visibility = "hidden";
  }

  preloadImage(pages[coverIndex]?.src);
  transitionPage.innerHTML =
    action === "open" ? rightFront.innerHTML : getPageMarkup(coverIndex);
  transitionPage.className = `page transition-page page--edge-cover transition-page--${coverType}`;
  transitionPage.style.display = "block";
  activateLazyImages(transitionPage);

  void transitionPage.offsetWidth;
  transitionPage.classList.add(animationClass);
  syncControls();

  transitionPage.addEventListener(
    "animationend",
    () => {
      transitionPage.classList.remove(...COVER_ANIMATION_CLASSNAMES);
      state.leftIndex = targetSpreadIndex;
      state.isAnimating = false;
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
  flap.style.display = "block";

  if (isSinglePageView()) {
    const targetIndex = state.singleIndex + (side === "right" ? 1 : -1);
    const underIndex = state.singleIndex + (side === "right" ? 2 : -2);

    rightUnder.style.display = "block";
    rightUnder.innerHTML = getReadingPageMarkup(underIndex);
    flapContent.innerHTML = getReadingPageMarkup(targetIndex);
    flapContent.className = "flap-content is-single";
  } else if (side === "right") {
    rightUnder.innerHTML = getPageMarkup(state.leftIndex + 3);
    flapContent.innerHTML = getPageMarkup(state.leftIndex + 2);
    flapContent.className = "flap-content is-left";
  } else {
    leftUnder.innerHTML = getPageMarkup(state.leftIndex - 2);
    flapContent.innerHTML = getPageMarkup(state.leftIndex - 1);
    flapContent.className = "flap-content is-right";
  }

  activateLazyImages(rightUnder);
  activateLazyImages(leftUnder);
  activateLazyImages(flapContent);
  syncControls();
  updateFold(x, y);
}

function completeTurn(fromX, fromY, forceComplete = null) {
  const shouldComplete =
    forceComplete ??
    ((state.activeSide === "right" && fromX < state.width / 2) ||
      (state.activeSide === "left" && fromX > state.width / 2));

  state.isDragging = false;
  state.isAnimating = true;
  syncControls();

  const activeSide = state.activeSide;
  const targetX = shouldComplete
    ? activeSide === "right"
      ? 0
      : state.width
    : state.activeCorner[0];
  const targetY = state.activeCorner[1];
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

    flap.style.display = "none";
    state.activeFrontPage.style.clipPath = "none";
    flap.style.clipPath = "none";
    flapContent.style.transform = "none";
    foldGradient.style.opacity = "0";

    if (shouldComplete) {
      if (isSinglePageView()) {
        state.singleIndex += activeSide === "right" ? 1 : -1;
      } else {
        state.leftIndex += activeSide === "right" ? 2 : -2;
      }
    }

    state.activeSide = null;
    state.activeCorner = null;
    state.activeFrontPage = null;
    state.activeHingeX = null;
    state.isAnimating = false;
    renderPages();
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

book.addEventListener("pointerdown", (event) => {
  if (state.isAnimating || state.isDragging) {
    return;
  }

  const rect = book.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
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

  book.setPointerCapture(event.pointerId);

  if (nearRight && (nearTop || nearBottom) && canGoNext()) {
    startDrag("right", [state.width, nearTop ? 0 : state.height], x, y);
  } else if (nearLeft && (nearTop || nearBottom) && canGoPrevious()) {
    startDrag("left", [0, nearTop ? 0 : state.height], x, y);
  }
});

book.addEventListener("pointermove", (event) => {
  if (!state.isDragging) {
    return;
  }

  const rect = book.getBoundingClientRect();
  updateFold(event.clientX - rect.left, event.clientY - rect.top);
});

function handlePointerRelease(event) {
  if (!state.isDragging) {
    return;
  }

  const rect = book.getBoundingClientRect();
  completeTurn(event.clientX - rect.left, event.clientY - rect.top);
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

  const edgeTurn = getEdgeTurnConfig(side);

  if (edgeTurn) {
    animateEdgeCoverTurn(edgeTurn);
    return;
  }

  const isSingle = isSinglePageView();
  const corner = side === "right" ? [state.width, state.height] : [0, state.height];
  const startX = isSingle
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

document.getElementById("rotateDismiss").addEventListener("click", () => {
  document.getElementById("rotateOverlay").classList.add("dismissed");
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    goNext();
  }

  if (event.key === "ArrowLeft") {
    goPrevious();
  }
});
