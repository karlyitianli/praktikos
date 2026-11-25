// Praktikos reader, English only.
// Units are Prologue, chapters 1-100, Epilogue, one file per unit:
// data/chapters/prologue.json, 001.json to 100.json, epilogue.json.
// data/index.json lists the units in reading order. Only the unit being
// read is fetched, plus the next one preloaded in the background.
// Fonts, in switcher order. Inter stays first and is the default.
const FONTS = [
  { id: "Inter", label: "Inter", family: "'Inter', system-ui, sans-serif", google: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap", letterSpacing: "-0.02em" },
  { id: "EB Garamond", label: "EB Garamond", family: "'EB Garamond', Georgia, serif", google: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&display=swap", letterSpacing: "0em" },
  { id: "Marcellus", label: "Marcellus", family: "'Marcellus', Georgia, serif", google: "https://fonts.googleapis.com/css2?family=Marcellus&display=swap", letterSpacing: "0em" },
  { id: "Newsreader", label: "Newsreader", family: "'Newsreader', Georgia, serif", google: "https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600&display=swap", letterSpacing: "0em" },
  { id: "IBM Plex Mono", label: "IBM Plex Mono", family: "'IBM Plex Mono', ui-monospace, monospace", google: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap", letterSpacing: "0em" }
];

const state = {
  units: [],
  cache: {},
  unit: null,
  current: "prologue",
  theme: localStorage.getItem("praktikos-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  font: localStorage.getItem("praktikos-font") || "Inter"
};

const $ = (id) => document.getElementById(id);

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const themeButton = $("theme-toggle");
  const label = state.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  themeButton.setAttribute("aria-label", label);
  themeButton.setAttribute("title", label);
  localStorage.setItem("praktikos-theme", state.theme);
}

function applyFont() {
  const font = FONTS.find((f) => f.id === state.font) || FONTS[0];
  document.documentElement.style.setProperty("--app-font", font.family);
  document.documentElement.style.setProperty("--letter-spacing", font.letterSpacing || "0em");
  const link = $("font-link");
  if (link && font.google) link.href = font.google;
  $("font-select").value = font.id;
  localStorage.setItem("praktikos-font", font.id);
}

function initFonts() {
  const select = $("font-select");
  select.innerHTML = "";
  FONTS.forEach((font) => {
    const option = document.createElement("option");
    option.value = font.id;
    option.textContent = font.label;
    select.appendChild(option);
  });
  select.addEventListener("change", () => {
    state.font = select.value;
    applyFont();
  });
}

function unitIndex(id) {
  return state.units.findIndex((u) => u.id === id);
}

function unitExists(id) {
  return unitIndex(id) >= 0;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function loadUnit(id, opts) {
  if (!unitExists(id)) return;
  state.current = id;
  localStorage.setItem("praktikos-unit", id);
  // Per-unit URL, so a chapter can be linked and shared: #12, #prologue, #epilogue.
  if (!opts || !opts.noHash) {
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  }
  if (state.cache[id]) {
    state.unit = state.cache[id];
    render();
    return;
  }
  const el = $("chapter");
  if (el && !state.unit) el.innerHTML = "<p>Loading…</p>";
  try {
    const res = await fetch(`data/chapters/${id}.json`, { cache: "no-cache" });
    const unit = await res.json();
    state.cache[id] = unit;
    state.unit = unit;
  } catch (e) {
    if (el) el.innerHTML = "<p>This section could not be loaded.</p>";
    return;
  }
  render();
  // Preload the next unit in the background, so the next key press is instant.
  const next = state.units[unitIndex(id) + 1];
  if (next && !state.cache[next.id]) {
    fetch(`data/chapters/${next.id}.json`, { cache: "no-cache" })
      .then((r) => r.json())
      .then((unit) => { state.cache[next.id] = unit; })
      .catch(() => {});
  }
}

function render() {
  const unit = state.unit;
  const el = $("chapter");
  if (!unit) {
    el.innerHTML = "<p>Section not loaded yet.</p>";
    return;
  }
  const section = unit.section && unit.kind === "chapter"
    ? `<p class="chapter-section">${escapeHtml(unit.section)}</p>` : "";
  const heading = unit.kind === "chapter"
    ? `<p class="chapter-no">Chapter ${unit.number}</p>`
    : `<p class="chapter-no">${escapeHtml(unit.label)}</p>`;
  const title = unit.kind === "prologue"
    ? `<h2 class="chapter-title">Letter to Anatolius</h2>` : "";
  // English paragraphs carry line breaks as "\n" for list lines.
  // Render each line break as a <br>, so a list reads as a list.
  const body = unit.english.map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`).join("");
  el.innerHTML = `${section}${heading}${title}${body}`;

  const idx = unitIndex(state.current);
  const progress = unit.kind === "chapter"
    ? `Chapter ${unit.number} of 100`
    : unit.label;
  $("progress-text").textContent = progress;
  $("prev").disabled = idx <= 0;
  $("next").disabled = idx < 0 || idx >= state.units.length - 1;
  renderGrid();
}

function renderGrid() {
  const grid = $("chapter-grid");
  grid.innerHTML = "";
  state.units.forEach((u) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = u.kind === "chapter" ? String(u.number) : (u.kind === "prologue" ? "Pro" : "Epi");
    button.title = u.label + (u.section && u.kind === "chapter" ? " · " + u.section : "");
    if (u.id === state.current) button.setAttribute("aria-current", "true");
    button.addEventListener("click", () => {
      if (u.id !== state.current) playPageFlip();
      loadUnit(u.id);
      closePicker();
    });
    grid.appendChild(button);
  });
}

let pickerReturnFocus = null;
function pickerOpen() { return !$("chapter-picker").hidden; }
function openPicker() {
  pickerReturnFocus = document.activeElement;
  $("chapter-picker").hidden = false;
  $("progress").setAttribute("aria-expanded", "true");
  document.body.classList.add("picker-open");
  const current = $("chapter-picker").querySelector('[aria-current="true"]');
  (current || $("picker-close")).focus();
  if (current && current.scrollIntoView) current.scrollIntoView({ block: "nearest" });
}
function closePicker() {
  const picker = $("chapter-picker");
  if (picker.hidden) return;
  picker.hidden = true;
  $("progress").setAttribute("aria-expanded", "false");
  document.body.classList.remove("picker-open");
  const target = pickerReturnFocus && pickerReturnFocus !== document.body
    ? pickerReturnFocus : $("progress");
  if (target && target.focus) target.focus();
}

// Page flip sound: a short 0.55s clip, preloaded so it plays instantly.
// Played on every user-initiated unit change, never on first load.
function playPageFlip() {
  const pageAudio = $("page-audio");
  if (!pageAudio) return;
  pageAudio.currentTime = 0;
  const p = pageAudio.play();
  if (p) p.catch(() => {});
}

function go(delta) {
  const next = state.units[unitIndex(state.current) + delta];
  if (next) {
    playPageFlip();
    loadUnit(next.id);
  }
}

async function load() {
  initFonts();
  applyTheme();
  applyFont();
  $("page-audio").volume = 0.5;

  $("theme-toggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
  });
  $("prev").addEventListener("click", () => go(-1));
  $("next").addEventListener("click", () => go(1));
  $("progress").addEventListener("click", openPicker);
  $("picker-close").addEventListener("click", closePicker);
  $("chapter-picker").querySelector(".picker-backdrop").addEventListener("click", closePicker);

  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
    if (pickerOpen()) {
      if (e.key === "Escape") closePicker();
      if (e.key === "Tab") {
        const focusable = [...$("chapter-picker").querySelectorAll("button:not([disabled])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
    if (e.key === "r" || e.key === "R") {
      if (state.current !== "prologue") playPageFlip();
      loadUnit("prologue");
    }
  });

  window.addEventListener("hashchange", () => {
    const id = window.location.hash.replace(/^#/, "");
    if (id && unitExists(id) && id !== state.current) loadUnit(id, { noHash: true });
  });

  const res = await fetch("data/index.json", { cache: "no-cache" });
  const data = await res.json();
  state.units = data.units || [];
  const hashId = window.location.hash.replace(/^#/, "");
  const saved = localStorage.getItem("praktikos-unit") || "prologue";
  const start = (hashId && unitExists(hashId)) ? hashId : (unitExists(saved) ? saved : "prologue");
  loadUnit(start);
}

load();
