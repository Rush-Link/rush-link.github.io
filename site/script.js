const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

function resolveRepository() {
  const configured = root.dataset.repository?.trim();
  if (configured && /^[\w.-]+\/[\w.-]+$/.test(configured)) return configured;
  return null;
}

const repository = resolveRepository();
const releaseUrl = repository ? `https://github.com/${repository}/releases` : "#download";

document.querySelectorAll("[data-release-link]").forEach((link) => {
  link.href = releaseUrl;
  if (repository) link.setAttribute("rel", "noopener");
});

const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const ambientLayers = [...document.querySelectorAll(".ambient")];

function updateScrollState() {
  const scrollTop = window.scrollY;
  const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  header?.classList.toggle("scrolled", scrollTop > 26);
  if (progress) progress.style.transform = `scaleX(${Math.min(scrollTop / scrollable, 1)})`;
  if (!reducedMotion) {
    ambientLayers.forEach((layer, index) => {
      layer.style.translate = `0 ${scrollTop * (0.018 + index * 0.007)}px`;
    });
  }
}

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });

const cursorLight = document.querySelector(".cursor-light");
if (cursorLight && window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
  let pointerX = -900;
  let pointerY = -900;
  let displayedX = pointerX;
  let displayedY = pointerY;
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }, { passive: true });
  const renderPointer = () => {
    displayedX += (pointerX - displayedX) * 0.12;
    displayedY += (pointerY - displayedY) * 0.12;
    root.style.setProperty("--pointer-x", `${displayedX}px`);
    root.style.setProperty("--pointer-y", `${displayedY}px`);
    window.requestAnimationFrame(renderPointer);
  };
  renderPointer();
}

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -9%", threshold: 0.09 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
function closeMenu() {
  menuButton?.setAttribute("aria-expanded", "false");
  mobileMenu?.classList.remove("open");
  document.body.classList.remove("menu-open");
}
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  mobileMenu?.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
});
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

const demoTabs = [...document.querySelectorAll("[data-demo-tab]")];
const demoPanels = [...document.querySelectorAll("[data-demo-panel]")];
const demoNavItems = [...document.querySelectorAll("[data-demo-nav]")];
let activeDemoIndex = 0;
let demoTimer;
function activateDemo(id, userInitiated = false) {
  activeDemoIndex = Math.max(0, demoTabs.findIndex((tab) => tab.dataset.demoTab === id));
  demoTabs.forEach((tab) => {
    const active = tab.dataset.demoTab === id;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  demoPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.demoPanel === id));
  demoNavItems.forEach((item) => {
    const active = item.dataset.demoNav === id;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  if (userInitiated) restartDemoRotation();
}
function restartDemoRotation() {
  window.clearInterval(demoTimer);
  if (reducedMotion) return;
  demoTimer = window.setInterval(() => {
    activeDemoIndex = (activeDemoIndex + 1) % demoTabs.length;
    activateDemo(demoTabs[activeDemoIndex].dataset.demoTab);
  }, 5200);
}
demoTabs.forEach((tab) => tab.addEventListener("click", () => activateDemo(tab.dataset.demoTab, true)));
demoNavItems.forEach((item) => item.addEventListener("click", () => activateDemo(item.dataset.demoNav, true)));
restartDemoRotation();
document.addEventListener("visibilitychange", () => document.hidden ? window.clearInterval(demoTimer) : restartDemoRotation());

if (window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
  document.querySelectorAll("[data-spotlight-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
    });
  });

  document.querySelectorAll("[data-tilt]").forEach((element) => {
    const host = element.closest("[data-tilt-root]") || element;
    host.addEventListener("pointermove", (event) => {
      const bounds = host.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      element.style.animation = "none";
      element.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 7}deg) translate3d(0,-4px,0)`;
    });
    host.addEventListener("pointerleave", () => {
      element.style.transform = "";
      element.style.animation = "";
    });
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const bounds = button.getBoundingClientRect();
      button.style.setProperty("--magnetic-x", `${(event.clientX - bounds.left - bounds.width / 2) * 0.09}px`);
      button.style.setProperty("--magnetic-y", `${(event.clientY - bounds.top - bounds.height / 2) * 0.12}px`);
    });
    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--magnetic-x", "0px");
      button.style.setProperty("--magnetic-y", "0px");
    });
  });
}

const navLinks = [...document.querySelectorAll(".desktop-nav a, .docs-nav > a")];
const observedSections = [...document.querySelectorAll("main section[id], .doc-article[id]")];
if ("IntersectionObserver" in window) {
  const navigationObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${visible.target.id}`));
  }, { rootMargin: "-20% 0px -65%", threshold: [0, .2, .5] });
  observedSections.forEach((section) => navigationObserver.observe(section));
}

document.querySelectorAll(".faq-list details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    document.querySelectorAll(".faq-list details[open]").forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});

if (!reducedMotion) {
  const stageControls = [...document.querySelectorAll(".stage-console__grid .control")];
  let performingIndex = 0;
  window.setInterval(() => {
    stageControls.forEach((control) => control.classList.remove("performing"));
    performingIndex = (performingIndex + 1) % stageControls.length;
    stageControls[performingIndex]?.classList.add("performing");
  }, 1450);

  const toneRows = [...document.querySelectorAll(".tone-results article")];
  let toneIndex = 1;
  window.setInterval(() => {
    toneRows.forEach((row) => row.classList.remove("active"));
    toneIndex = (toneIndex + 1) % toneRows.length;
    toneRows[toneIndex]?.classList.add("active");
  }, 3600);
}

document.querySelectorAll(".button, .control, .stage-preview-grid button").forEach((target) => {
  target.addEventListener("pointerdown", (event) => {
    if (reducedMotion) return;
    const bounds = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "motion-ripple";
    ripple.style.left = `${event.clientX - bounds.left}px`;
    ripple.style.top = `${event.clientY - bounds.top}px`;
    target.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });
});

const statsPanel = document.querySelector("[data-release-stats]");
const statsRequested = new URLSearchParams(window.location.search).get("stats") === "1";

function formatCount(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

async function loadReleaseStats() {
  if (!statsPanel) return;
  statsPanel.hidden = false;
  const repositoryLabel = statsPanel.querySelector("[data-stat-repository]");
  if (!repository) {
    repositoryLabel.textContent = "Repository unresolved. Set data-repository=\"owner/repo\" in index.html.";
    return;
  }
  repositoryLabel.textContent = repository;
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/releases?per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const releases = (await response.json()).filter((release) => !release.draft);
    const downloadCount = releases.reduce((releaseTotal, release) => releaseTotal + release.assets.reduce((assetTotal, asset) => assetTotal + Number(asset.download_count || 0), 0), 0);
    statsPanel.querySelector("[data-stat-downloads]").textContent = formatCount(downloadCount);
    statsPanel.querySelector("[data-stat-releases]").textContent = formatCount(releases.length);
    statsPanel.querySelector("[data-stat-latest]").textContent = releases[0]?.tag_name || "None yet";
  } catch (error) {
    repositoryLabel.textContent = `${repository} · ${error instanceof Error ? error.message : "Could not load release data"}`;
  }
}

if (statsRequested) loadReleaseStats();
document.querySelector("[data-close-stats]")?.addEventListener("click", () => {
  statsPanel.hidden = true;
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete("stats");
  window.history.replaceState({}, "", nextUrl);
});
