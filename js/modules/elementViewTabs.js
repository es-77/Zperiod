// =============================================================================
// Element View Tabs - Structure / Orbitals / Archive switcher + Suggest a source
// Lives in the element modal's visual pane, on top of the 3D atom container.
// =============================================================================

import { finallyData } from "../data/elementsData.js";
import { t } from "./langController.js";
import { submitSuggestion, flashSentState, SUCCESS_ICON_SVG } from "./feedbackController.js";

const TABS = ["structure", "orbitals", "archive"];

// Wikipedia titles that differ from the plain English element name
const WIKI_TITLE_OVERRIDES = {
  Mercury: "Mercury_(element)",
};

const NOBLE_CORES = {
  He: "1s² ",
  Ne: "[He] 2s² 2p⁶",
  Ar: "[Ne] 3s² 3p⁶",
  Kr: "[Ar] 3d¹⁰ 4s² 4p⁶",
  Xe: "[Kr] 4d¹⁰ 5s² 5p⁶",
  Rn: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶",
};

// Madelung (aufbau) filling order, used for ordering and as a fallback
const AUFBAU_ORDER = [
  "1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s",
  "4f", "5d", "6p", "7s", "5f", "6d", "7p",
];
const SUBSHELL_CAPACITY = { s: 2, p: 6, d: 10, f: 14 };
const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

const archiveCache = new Map();

let pane = null;
let atomContainer = null;
let orbitalsPanel = null;
let archivePanel = null;
let tabButtons = [];
let suggestBtn = null;
let suggestPopover = null;
let currentElement = null;
let activeTab = "structure";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Orbitals
// ---------------------------------------------------------------------------

function superscriptToNumber(text) {
  return Number(
    [...text].map((ch) => {
      const idx = SUPERSCRIPTS.indexOf(ch);
      return idx >= 0 ? String(idx) : ch;
    }).join(""),
  );
}

function expandConfiguration(config) {
  let expanded = config;
  for (let i = 0; i < 6; i++) {
    const match = expanded.match(/\[(He|Ne|Ar|Kr|Xe|Rn)\]/);
    if (!match) break;
    expanded = expanded.replace(match[0], NOBLE_CORES[match[1]] + " ");
  }
  const counts = {};
  const re = /(\d)([spdf])([⁰¹²³⁴⁵⁶⁷⁸⁹]+|\d+)/g;
  let m;
  while ((m = re.exec(expanded)) !== null) {
    const key = `${m[1]}${m[2]}`;
    counts[key] = (counts[key] || 0) + superscriptToNumber(m[3]);
  }
  return counts;
}

function aufbauConfiguration(electrons) {
  const counts = {};
  let left = electrons;
  for (const sub of AUFBAU_ORDER) {
    if (left <= 0) break;
    const fill = Math.min(left, SUBSHELL_CAPACITY[sub[1]]);
    counts[sub] = fill;
    left -= fill;
  }
  return counts;
}

function getSubshellCounts(element) {
  const config = finallyData[element.number]?.level3_properties?.electronic?.configuration || "";
  const parsed = expandConfiguration(config);
  const total = Object.values(parsed).reduce((a, b) => a + b, 0);
  if (total === element.number) return { counts: parsed, config };
  return { counts: aufbauConfiguration(element.number), config };
}

// Hund's rule: one up-arrow per orbital first, then pair with down-arrows
function fillOrbitals(electrons, orbitalCount) {
  return Array.from({ length: orbitalCount }, (_, i) => {
    const up = electrons > i;
    const down = electrons > orbitalCount + i;
    return { up, down };
  });
}

function renderOrbitals(element) {
  const { counts, config } = getSubshellCounts(element);
  const subshells = AUFBAU_ORDER.filter((s) => counts[s]);
  const maxShell = Math.max(...subshells.map((s) => Number(s[0])));
  let unpaired = 0;

  const rows = subshells.slice().reverse().map((sub) => {
    const orbitalCount = SUBSHELL_CAPACITY[sub[1]] / 2;
    const boxes = fillOrbitals(counts[sub], orbitalCount);
    unpaired += boxes.filter((b) => b.up && !b.down).length;
    const isValence = Number(sub[0]) === maxShell || counts[sub] < SUBSHELL_CAPACITY[sub[1]];
    const boxHtml = boxes.map((b) => `
      <span class="evt-orbital-box">
        <span class="evt-arrow ${b.up ? "on" : ""}">↑</span>
        <span class="evt-arrow ${b.down ? "on" : ""}">↓</span>
      </span>`).join("");
    return `
      <div class="evt-orbital-row ${isValence ? "valence" : ""}">
        <span class="evt-orbital-label">${sub[0]}<i>${sub[1]}</i></span>
        <span class="evt-orbital-boxes">${boxHtml}</span>
        <span class="evt-orbital-count">${counts[sub]}/${SUBSHELL_CAPACITY[sub[1]]}</span>
      </div>`;
  }).join("");

  orbitalsPanel.innerHTML = `
    <div class="evt-orbitals-card">
      <div class="evt-orbitals-head">
        <div>
          <div class="evt-eyebrow">${escapeHtml(t("elementView.electronConfiguration", "Electron configuration"))}</div>
          <div class="evt-config">${escapeHtml(config || "—")}</div>
        </div>
        <div class="evt-stats">
          <span><b>${element.number}</b>${escapeHtml(t("elementView.electrons", "electrons"))}</span>
          <span><b>${unpaired}</b>${escapeHtml(t("elementView.unpaired", "unpaired"))}</span>
          <span><b>${maxShell}</b>${escapeHtml(t("elementView.shells", "shells"))}</span>
        </div>
      </div>
      <div class="evt-energy-axis">
        <span>${escapeHtml(t("elementView.higherEnergy", "Higher energy"))} ↑</span>
      </div>
      <div class="evt-orbital-list">${rows}</div>
      <p class="evt-note">${escapeHtml(t("elementView.orbitalNote", "Filled by the Aufbau principle, Hund's rule and the Pauli exclusion principle. Highlighted rows are the outer (valence) or partially filled subshells."))}</p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Archive
// ---------------------------------------------------------------------------

const HAZARD_RULES = [
  { key: "radioactive", test: /radioactiv|radiotoxi|fission/, symbol: "☢", label: "Radioactive" },
  { key: "toxic", test: /toxic|poison|neurotox/, symbol: "☠", label: "Toxic" },
  { key: "flammable", test: /flammab|pyrophor|ignite|fire/, symbol: "🔥", label: "Flammable" },
  { key: "explosive", test: /explos/, symbol: "💥", label: "Explosive" },
  { key: "corrosive", test: /corros/, symbol: "⚗", label: "Corrosive" },
  { key: "oxidizer", test: /oxidi[sz]er/, symbol: "⭘", label: "Oxidizer" },
  { key: "health", test: /carcinogen|sensitizer|inhalation|lung|kidney|allerg/, symbol: "⚕", label: "Health hazard" },
  { key: "water", test: /reacts.*water|with water/, symbol: "💧", label: "Water-reactive" },
];

function getHazards(element) {
  return finallyData[element.number]?.level4_history_stse?.hazards || [];
}

function getHazardPictograms(element) {
  const text = getHazards(element)
    .join(" ")
    .toLowerCase()
    .replace(/low toxicity|non-?toxic|not toxic/g, "");
  const matched = HAZARD_RULES.filter((rule) => rule.test.test(text));
  return matched.length ? matched : [{ key: "low", symbol: "✓", label: "Low hazard" }];
}

function wikiTitle(element) {
  return WIKI_TITLE_OVERRIDES[element.name] || element.name.replace(/ /g, "_");
}

function toHttps(src) {
  return src?.startsWith("//") ? `https:${src}` : src;
}

async function fetchArchiveImages(element) {
  if (archiveCache.has(element.number)) return archiveCache.get(element.number);
  const title = encodeURIComponent(wikiTitle(element));
  const request = fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${title}`)
    .then((res) => (res.ok ? res.json() : { items: [] }))
    .then((data) => {
      const photos = (data.items || []).filter(
        (item) => item.type === "image" && item.showInGallery && /\.(jpe?g|png)$/i.test(item.title),
      );
      const toImage = (item) => item && ({
        src: toHttps(item.srcset?.[item.srcset.length - 1]?.src || item.srcset?.[0]?.src),
        caption: item.caption?.text || item.title.replace(/^File:/, "").replace(/_/g, " ").replace(/\.\w+$/, ""),
        sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(item.title)}`,
      });
      const lead = photos.find((p) => p.leadImage) || photos[0];
      const rest = photos.filter((p) => p !== lead);
      return {
        portrait: toImage(lead),
        origin: toImage(rest[0]),
        science: toImage(rest[1]),
        articleUrl: `https://en.wikipedia.org/wiki/${title}`,
      };
    })
    .catch(() => ({ articleUrl: `https://en.wikipedia.org/wiki/${title}` }));
  archiveCache.set(element.number, request);
  return request;
}

function bubbleHtml(slot, label, image, element) {
  const inner = image?.src
    ? `<img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.caption)}" loading="lazy">`
    : `<span class="evt-bubble-fallback">${escapeHtml(element.symbol)}</span>`;
  return `
    <button type="button" class="evt-bubble evt-bubble-${slot}" data-slot="${slot}">
      ${inner}
      <span class="evt-bubble-label">${escapeHtml(label)}</span>
    </button>`;
}

function safetyBubbleHtml(element) {
  const pictograms = getHazardPictograms(element).slice(0, 4);
  const icons = pictograms.map((p) => `
    <span class="evt-ghs ${p.key === "low" ? "low" : ""}" title="${escapeHtml(p.label)}"><span>${p.symbol}</span></span>`).join("");
  return `
    <button type="button" class="evt-bubble evt-bubble-safety" data-slot="safety">
      <span class="evt-ghs-grid count-${pictograms.length}">${icons}</span>
      <span class="evt-bubble-label">${escapeHtml(t("elementView.safety", "Safety"))}</span>
    </button>`;
}

function showArchiveDetail(slot, element, images) {
  const detail = archivePanel.querySelector(".evt-archive-detail");
  if (!detail) return;
  let body;
  if (slot === "safety") {
    const hazards = getHazards(element);
    const pictograms = getHazardPictograms(element);
    body = `
      <div class="evt-detail-title">${escapeHtml(t("elementView.safety", "Safety"))}</div>
      <div class="evt-detail-tags">${pictograms.map((p) => `<span>${p.symbol} ${escapeHtml(p.label)}</span>`).join("")}</div>
      <ul>${hazards.map((h) => `<li>${escapeHtml(h)}</li>`).join("") || `<li>${escapeHtml(t("elementView.noData", "No data available."))}</li>`}</ul>`;
  } else {
    const image = images?.[slot];
    const label = t(`elementView.${slot}`, slot[0].toUpperCase() + slot.slice(1));
    body = image?.src
      ? `
        <div class="evt-detail-title">${escapeHtml(label)}</div>
        <p>${escapeHtml(image.caption)}</p>
        <a href="${escapeHtml(image.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("elementView.viewSource", "View source (Wikimedia Commons)"))} ↗</a>`
      : `
        <div class="evt-detail-title">${escapeHtml(label)}</div>
        <p>${escapeHtml(t("elementView.noImage", "No archive image yet. Know a good one? Use “Suggest a source”."))}</p>
        <a href="${escapeHtml(images?.articleUrl || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("elementView.readMore", "Read on Wikipedia"))} ↗</a>`;
  }
  detail.innerHTML = `<button type="button" class="evt-detail-close" aria-label="Close">×</button>${body}`;
  detail.hidden = false;
  detail.querySelector(".evt-detail-close").addEventListener("click", () => {
    detail.hidden = true;
  });
}

function renderArchive(element, images) {
  const loading = images === null;
  archivePanel.innerHTML = `
    <div class="evt-archive ${loading ? "loading" : ""}">
      ${bubbleHtml("origin", t("elementView.origin", "Origin"), images?.origin, element)}
      ${bubbleHtml("portrait", t("elementView.portrait", "Portrait"), images?.portrait, element)}
      ${bubbleHtml("science", t("elementView.science", "Science"), images?.science, element)}
      ${safetyBubbleHtml(element)}
    </div>
    <div class="evt-archive-detail" hidden></div>`;
  archivePanel.querySelectorAll(".evt-bubble").forEach((btn) => {
    btn.addEventListener("click", () => showArchiveDetail(btn.dataset.slot, element, images));
  });
}

async function loadArchive(element) {
  renderArchive(element, null);
  const images = await fetchArchiveImages(element);
  if (currentElement !== element || activeTab !== "archive") return;
  renderArchive(element, images);
}

// ---------------------------------------------------------------------------
// Suggest a source
// ---------------------------------------------------------------------------

function closeSuggestPopover() {
  if (suggestPopover) suggestPopover.hidden = true;
}

function toggleSuggestPopover() {
  if (!suggestPopover.hidden) {
    closeSuggestPopover();
    return;
  }
  const tabLabel = t(`elementView.${activeTab}`, activeTab[0].toUpperCase() + activeTab.slice(1));
  suggestPopover.querySelector(".evt-suggest-context").textContent =
    currentElement ? `${currentElement.symbol} · ${currentElement.name} · ${tabLabel}` : tabLabel;
  suggestPopover.hidden = false;
  suggestPopover.querySelector("input").focus();
}

async function sendSuggestion(event) {
  event.preventDefault();
  const urlInput = suggestPopover.querySelector("input");
  const noteInput = suggestPopover.querySelector("textarea");
  const sendBtn = suggestPopover.querySelector(".evt-suggest-send");
  const url = urlInput.value.trim();
  const note = noteInput.value.trim();
  if (!url && !note) {
    urlInput.focus();
    return;
  }
  const context = currentElement
    ? `${currentElement.symbol} (${currentElement.name}) · ${activeTab}`
    : activeTab;
  const text = [url && `Source: ${url}`, note && `Note: ${note}`].filter(Boolean).join("\n> ");
  sendBtn.disabled = true;
  const ok = await submitSuggestion(text, { source: `Element ${context}` });
  sendBtn.disabled = false;
  if (!ok) return;
  flashSentState(sendBtn, {
    originalHTML: sendBtn.innerHTML,
    successHTML: SUCCESS_ICON_SVG,
    onReset: () => {
      urlInput.value = "";
      noteInput.value = "";
      closeSuggestPopover();
    },
  });
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function showPanel(panel, visible) {
  panel.hidden = !visible;
  panel.style.display = visible ? "" : "none";
  if (!visible) panel.innerHTML = "";
}

function setActiveTab(tab) {
  activeTab = tab;
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });
  pane.dataset.view = tab;
  // Only one view may be on screen: hide + empty the inactive panels so no
  // stale content (or a previous element's images) can show through.
  showPanel(orbitalsPanel, tab === "orbitals");
  showPanel(archivePanel, tab === "archive");
  atomContainer.style.visibility = tab === "structure" ? "" : "hidden";
  atomContainer.style.pointerEvents = tab === "structure" ? "" : "none";
  if (!currentElement) return;
  if (tab === "orbitals") renderOrbitals(currentElement);
  if (tab === "archive") loadArchive(currentElement);
}

export function initElementViewTabs() {
  const modal = document.getElementById("element-modal");
  pane = modal?.querySelector(".modal-visual-pane");
  atomContainer = document.getElementById("atom-container");
  if (!pane || !atomContainer) return;

  orbitalsPanel = document.createElement("div");
  orbitalsPanel.className = "evt-panel evt-orbitals";
  orbitalsPanel.hidden = true;

  archivePanel = document.createElement("div");
  archivePanel.className = "evt-panel evt-archive-panel";
  archivePanel.hidden = true;

  const bar = document.createElement("div");
  bar.className = "evt-tabbar";
  bar.setAttribute("role", "tablist");
  bar.innerHTML = TABS.map((tab) => `
    <button type="button" class="evt-tab" role="tab" data-tab="${tab}">${escapeHtml(t(`elementView.${tab}`, tab[0].toUpperCase() + tab.slice(1)))}</button>`).join("");
  tabButtons = [...bar.querySelectorAll(".evt-tab")];
  tabButtons.forEach((btn) => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));

  suggestBtn = document.createElement("button");
  suggestBtn.type = "button";
  suggestBtn.className = "evt-suggest-btn";
  suggestBtn.innerHTML = `<span aria-hidden="true">+</span> ${escapeHtml(t("elementView.suggestSource", "Suggest a source"))}`;
  suggestBtn.addEventListener("click", toggleSuggestPopover);

  suggestPopover = document.createElement("form");
  suggestPopover.className = "evt-suggest-popover";
  suggestPopover.hidden = true;
  suggestPopover.innerHTML = `
    <div class="evt-suggest-title">${escapeHtml(t("elementView.suggestSource", "Suggest a source"))}</div>
    <div class="evt-suggest-context"></div>
    <input type="url" placeholder="https://…" aria-label="Source URL">
    <textarea rows="3" placeholder="${escapeHtml(t("elementView.suggestPlaceholder", "What should we add or fix?"))}" aria-label="Note"></textarea>
    <div class="evt-suggest-actions">
      <button type="button" class="evt-suggest-cancel">${escapeHtml(t("elementView.cancel", "Cancel"))}</button>
      <button type="submit" class="evt-suggest-send">${escapeHtml(t("elementView.send", "Send"))}</button>
    </div>`;
  suggestPopover.addEventListener("submit", sendSuggestion);
  suggestPopover.querySelector(".evt-suggest-cancel").addEventListener("click", closeSuggestPopover);

  pane.append(orbitalsPanel, archivePanel, bar, suggestBtn, suggestPopover);
  setActiveTab("structure");
}

export function setElementViewElement(element) {
  if (!pane) return;
  currentElement = element;
  closeSuggestPopover();
  orbitalsPanel.innerHTML = "";
  archivePanel.innerHTML = "";
  setActiveTab(activeTab);
}

export function resetElementViewTabs() {
  if (!pane) return;
  currentElement = null;
  closeSuggestPopover();
  setActiveTab("structure");
}
