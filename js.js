const book = document.getElementById("book");
const flap = document.getElementById("flap");
const flapContent = document.getElementById("flapContent");
const foldGradient = document.getElementById("foldGradient");
const leftFront = document.getElementById("left-front");
const rightFront = document.getElementById("right-front");
const leftUnder = document.getElementById("left-under");
const rightUnder = document.getElementById("right-under");
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

function toArabicNumber(value) {
  return String(value)
    .padStart(2, "0")
    .replace(/\d/g, (digit) => arabicDigits[Number(digit)]);
}

function pageTemplate(number, classes, content) {
  return `
    <article class="sheet ${classes}">
      <div class="sheet-zoom">
        ${content}
      </div>
    </article>
  `;
}

const images = {
  hero: "page%201%20right.png",
  offer: "page%201%20right%202.png",
  colors: "page%202%20left.png",
};

const pages = [
  pageTemplate(
    1,
    "sheet--image",
    `
      <div class="image-sheet">
        <div class="single-image-frame">
          <img
            class="single-image"
            src="${images.hero}"
            alt="page 1 right"
            draggable="false"
          />
        </div>
      </div>
    `,
  ),
  pageTemplate(
    2,
    "sheet--image",
    `
      <div class="image-sheet">
        <div class="single-image-frame">
          <img
            class="single-image"
            src="${images.offer}"
            alt="page 1 right 2"
            draggable="false"
          />
        </div>
      </div>
    `,
  ),
  pageTemplate(
    3,
    "sheet--image",
    `
      <div class="image-sheet">
        <div class="single-image-frame">
          <img
            class="single-image"
            src="${images.hero}"
            alt="page 1 right"
            draggable="false"
          />
        </div>
      </div>
    `,
  ),
  pageTemplate(
    4,
    "sheet--image",
    `
      <div class="image-sheet">
        <div class="single-image-frame">
          <img
            class="single-image"
            src="${images.colors}"
            alt="page 2 left"
            draggable="false"
          />
        </div>
      </div>
    `,
  ),
];

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
};

function isSinglePageView() {
  return state.viewMode === "single";
}

function normalizeSpreadIndex(index) {
  const maxStart = Math.max(0, pages.length - 2);
  const alignedIndex = Math.max(0, index - (index % 2));
  return Math.min(alignedIndex, maxStart);
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
    return state.singleIndex < pages.length - 1;
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
    spreadStatus.textContent = `${toArabicNumber(state.singleIndex + 1)} / ${toArabicNumber(pages.length)}`;
    viewToggle.dataset.view = "spread";
    viewToggle.setAttribute("aria-label", "عرض صفحتين");
    viewToggle.setAttribute("title", "عرض صفحتين");
    return;
  }

  const firstPage = state.leftIndex + 1;
  const secondPage = Math.min(state.leftIndex + 2, pages.length);
  spreadStatus.textContent = `${toArabicNumber(firstPage)} / ${toArabicNumber(secondPage)}`;
  viewToggle.dataset.view = "single";
  viewToggle.setAttribute("aria-label", "عرض صفحة واحدة");
  viewToggle.setAttribute("title", "عرض صفحة واحدة");
}

function renderPages() {
  document.body.classList.toggle("single-page-view", isSinglePageView());

  cancelAnimationFrame(state.animationFrame);
  flap.style.display = "none";
  flap.style.clipPath = "none";
  flapContent.style.transform = "none";
  foldGradient.style.opacity = "0";
  leftFront.style.clipPath = "none";
  rightFront.style.clipPath = "none";
  rightFront.style.transform = "translateZ(0)";
  rightFront.style.transformOrigin = "";
  rightFront.style.boxShadow = "";

  leftUnder.innerHTML = "";
  rightUnder.innerHTML = "";
  rightUnder.style.display = "none";
  rightUnder.style.opacity = "1";

  if (isSinglePageView()) {
    leftFront.innerHTML = "";
    leftUnder.style.display = "none";
    leftFront.style.display = "none";
    rightFront.style.display = "block";
    rightFront.innerHTML = pages[state.singleIndex] || "";
  } else {
    leftUnder.style.display = "block";
    rightUnder.style.display = "block";
    leftFront.style.display = state.leftIndex >= 0 ? "block" : "none";
    rightFront.style.display = state.leftIndex + 1 < pages.length ? "block" : "none";
    leftFront.innerHTML = pages[state.leftIndex] || "";
    rightFront.innerHTML = pages[state.leftIndex + 1] || "";
  }

  syncControls();
}

applyZoom();
renderPages();

function setViewMode(mode) {
  if (mode === state.viewMode || state.isDragging || state.isAnimating) {
    return;
  }

  if (mode === "single") {
    state.singleIndex = state.leftIndex;
  } else {
    state.leftIndex = normalizeSpreadIndex(state.singleIndex);
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

function startSinglePageDrag(side, x) {
  if (!isSinglePageView() || state.isAnimating || state.isDragging) {
    return;
  }

  const targetIndex = state.singleIndex + (side === "right" ? 1 : -1);

  if (!pages[targetIndex]) {
    return;
  }

  state.activeSide = side;
  state.activeFrontPage = rightFront;
  state.isDragging = true;

  rightUnder.style.display = "block";
  rightUnder.innerHTML = pages[targetIndex];
  rightFront.style.transformOrigin =
    side === "right" ? "left center" : "right center";

  syncControls();
  updateSinglePageFlip(x);
}

function updateSinglePageFlip(x) {
  if (!state.activeFrontPage || !isSinglePageView()) {
    return;
  }

  const clampedX = Math.max(0, Math.min(state.width, x));
  const progress =
    state.activeSide === "right"
      ? 1 - clampedX / state.width
      : clampedX / state.width;
  const boundedProgress = Math.max(0, Math.min(1, progress));
  const angle = (state.activeSide === "right" ? -1 : 1) * boundedProgress * 179;

  state.activeFrontPage.style.transform = `perspective(2200px) rotateY(${angle}deg)`;
  state.activeFrontPage.style.boxShadow = `0 18px 36px rgba(45, 16, 24, ${0.14 + boundedProgress * 0.14})`;
  rightUnder.style.opacity = String(0.58 + boundedProgress * 0.42);
}

function completeSinglePageTurn(fromX, forceComplete = null) {
  if (!state.activeSide || !state.activeFrontPage || !isSinglePageView()) {
    return;
  }

  const shouldComplete =
    forceComplete ??
    ((state.activeSide === "right" && fromX < state.width / 2) ||
      (state.activeSide === "left" && fromX > state.width / 2));

  state.isDragging = false;
  state.isAnimating = true;
  syncControls();

  const activeSide = state.activeSide;
  const restingX = activeSide === "right" ? state.width : 0;
  const targetX = shouldComplete
    ? activeSide === "right"
      ? 0
      : state.width
    : restingX;
  const startTime = performance.now();

  cancelAnimationFrame(state.animationFrame);

  function animate(now) {
    const progress = Math.min((now - startTime) / TURN_DURATION_MS, 1);
    const eased = easeInOutCubic(progress);
    const currentX = fromX + (targetX - fromX) * eased;

    updateSinglePageFlip(currentX);

    if (progress < 1) {
      state.animationFrame = requestAnimationFrame(animate);
      return;
    }

    if (shouldComplete) {
      state.singleIndex += activeSide === "right" ? 1 : -1;
    }

    state.activeSide = null;
    state.activeFrontPage = null;
    state.isAnimating = false;
    renderPages();
  }

  state.animationFrame = requestAnimationFrame(animate);
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
    const cornerX = state.spineX;
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

  let basePage;
  let frontPointA;
  let frontPointB;
  let offsetX;

  if (state.activeSide === "right") {
    basePage = [
      [state.pageWidth, 0],
      [state.pageWidth, state.height],
      [state.width, state.height],
      [state.width, 0],
    ];
    frontPointA = [state.width, 0];
    frontPointB = [state.pageWidth, 0];
    offsetX = state.pageWidth;
  } else {
    basePage = [
      [0, 0],
      [0, state.height],
      [state.pageWidth, state.height],
      [state.pageWidth, 0],
    ];
    frontPointA = [state.pageWidth, 0];
    frontPointB = [0, 0];
    offsetX = 0;
  }

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
  if (state.isAnimating || isSinglePageView()) {
    return;
  }

  state.activeSide = side;
  state.activeCorner = corner;
  state.activeFrontPage = side === "right" ? rightFront : leftFront;
  state.isDragging = true;
  flap.style.display = "block";

  if (side === "right") {
    rightUnder.innerHTML = pages[state.leftIndex + 3] || "";
    flapContent.innerHTML = pages[state.leftIndex + 2] || "";
    flapContent.className = "flap-content is-left";
  } else {
    leftUnder.innerHTML = pages[state.leftIndex - 2] || "";
    flapContent.innerHTML = pages[state.leftIndex - 1] || "";
    flapContent.className = "flap-content is-right";
  }

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
      state.leftIndex += activeSide === "right" ? 2 : -2;
      renderPages();
    }

    state.activeSide = null;
    state.activeCorner = null;
    state.activeFrontPage = null;
    state.isAnimating = false;
    syncControls();
  }

  state.animationFrame = requestAnimationFrame(animate);
}

function goNext() {
  if (!canGoNext()) {
    return;
  }

  if (isSinglePageView()) {
    turnSinglePage("right");
    return;
  }

  turnPage("right");
}

function goPrevious() {
  if (!canGoPrevious()) {
    return;
  }

  if (isSinglePageView()) {
    turnSinglePage("left");
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

  book.setPointerCapture(event.pointerId);

  if (isSinglePageView()) {
    if (x > state.width - threshold && canGoNext()) {
      startSinglePageDrag("right", x);
      return;
    }

    if (x < threshold && canGoPrevious()) {
      startSinglePageDrag("left", x);
    }

    return;
  }

  if (x > state.width - threshold && y < threshold && canGoNext()) {
    startDrag("right", [state.width, 0], x, y);
    return;
  }

  if (x > state.width - threshold && y > state.height - threshold && canGoNext()) {
    startDrag("right", [state.width, state.height], x, y);
    return;
  }

  if (x < threshold && y < threshold && canGoPrevious()) {
    startDrag("left", [0, 0], x, y);
    return;
  }

  if (x < threshold && y > state.height - threshold && canGoPrevious()) {
    startDrag("left", [0, state.height], x, y);
  }
});

book.addEventListener("pointermove", (event) => {
  if (!state.isDragging) {
    return;
  }

  const rect = book.getBoundingClientRect();

  if (isSinglePageView()) {
    updateSinglePageFlip(event.clientX - rect.left);
    return;
  }

  updateFold(event.clientX - rect.left, event.clientY - rect.top);
});

function handlePointerRelease(event) {
  if (!state.isDragging) {
    return;
  }

  const rect = book.getBoundingClientRect();

  if (isSinglePageView()) {
    completeSinglePageTurn(event.clientX - rect.left);
    return;
  }

  completeTurn(event.clientX - rect.left, event.clientY - rect.top);
}

book.addEventListener("pointerup", handlePointerRelease);
book.addEventListener("pointercancel", handlePointerRelease);
book.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

function turnPage(side) {
  if (state.isAnimating || state.isDragging || isSinglePageView()) {
    return;
  }

  if (side === "right" && !canGoNext()) {
    return;
  }

  if (side === "left" && !canGoPrevious()) {
    return;
  }

  const corner = side === "right" ? [state.width, state.height] : [0, state.height];
  const startX =
    side === "right" ? state.width - state.pageWidth * 0.35 : state.pageWidth * 0.35;
  const startY = state.height - 36;

  startDrag(side, corner, startX, startY);
  completeTurn(startX, startY, true);
}

function turnSinglePage(side) {
  if (!isSinglePageView() || state.isAnimating || state.isDragging) {
    return;
  }

  if (side === "right" && !canGoNext()) {
    return;
  }

  if (side === "left" && !canGoPrevious()) {
    return;
  }

  const startX = side === "right" ? state.width - 24 : 24;
  startSinglePageDrag(side, startX);
  completeSinglePageTurn(startX, true);
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

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    goNext();
  }

  if (event.key === "ArrowLeft") {
    goPrevious();
  }
});
