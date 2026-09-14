// =============================================================================
// Mixing Lab — Virtual Lab mode for combining substances in a beaker
// Canvas beaker with bubbles, flames, sparks, smoke, colour shifts and settling
// precipitates, driven by js/data/mixingReactions.js.
// =============================================================================

import {
  PALETTE_COMPOUNDS,
  getSubstance,
  resolveAddition,
  resolveFollowUp,
  formatFormula,
  WATER,
} from "../data/mixingReactions.js";
import { elements as allElements } from "../data/elementsData.js";
import { t } from "./langController.js";

const CATEGORY_COLORS = {
  "Alkali Metal": "#e85d5d",
  "Alkaline Earth Metal": "#e8a14d",
  "Transition Metal": "#d4a72c",
  "Post-transition Metal": "#5fae7a",
  "Metalloid": "#3fa7a0",
  "Other nonmetal": "#4a90d9",
  "Halogen": "#7a6ad8",
  "Noble Gas": "#a45fc9",
  "Lanthanide": "#d0689b",
  "Actinide": "#c2577a",
  "Unknown": "#8e8e93",
};

const ROLE_COLORS = { acid: "#e5484d", base: "#3e7bfa", salt: "#5f8f7a" };

const TYPE_LABELS = {
  none: "No visible reaction",
  dissolves: "Dissolves (physical change)",
  mild: "Mild reaction",
  vigorous: "Vigorous reaction",
  explosive: "Explosive reaction",
  redox: "Redox reaction",
  "acid-base": "Acid–base reaction",
  precipitate: "Precipitate forms",
};

const ENERGY_LABELS = {
  exothermic: "Exothermic — releases heat",
  endothermic: "Endothermic — absorbs heat",
  none: "Little or no heat change",
};

const BASE_WATER = [120, 190, 255, 0.28];

function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

const rgba = (c, alphaMul = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${(c[3] ?? 1) * alphaMul})`;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const WARNING_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18h.01" stroke-linecap="round"/></svg>';

export function getMixingLabMarkup() {
  return `
    <style>
      .mix-lab {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(180px, 250px) minmax(0, 1fr) minmax(220px, 320px);
        gap: 12px;
        font-family: inherit;
        color: #2f3136;
      }
      .mix-lab[hidden] { display: none !important; }
      .mix-panel {
        min-height: 0;
        display: flex;
        flex-direction: column;
        background: rgba(255,255,255,0.72);
        border: 1px solid rgba(0,0,0,0.06);
        border-radius: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05);
        overflow: hidden;
      }
      .mix-palette { padding: 10px; gap: 8px; }
      .mix-segment {
        display: flex;
        background: rgba(0,0,0,0.05);
        border-radius: 10px;
        padding: 3px;
        gap: 3px;
      }
      .mix-segment button {
        flex: 1;
        appearance: none;
        border: none;
        background: none;
        padding: 7px 6px;
        border-radius: 8px;
        font: inherit;
        font-size: 12px;
        font-weight: 650;
        color: #64748b;
        cursor: pointer;
      }
      .mix-segment button.active {
        background: #fff;
        color: #1e293b;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .mix-search {
        padding: 8px 10px;
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 10px;
        font: inherit;
        font-size: 13px;
        background: #fff;
        outline: none;
      }
      .mix-search:focus { border-color: rgba(59,130,246,0.6); }
      .mix-cards {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
        scrollbar-width: thin;
      }
      .mix-group-label {
        padding: 8px 6px 3px;
        font-size: 10px;
        font-weight: 700;
        color: #86868b;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .mix-card {
        display: flex;
        align-items: center;
        gap: 9px;
        width: 100%;
        padding: 6px;
        border: none;
        border-radius: 10px;
        background: none;
        text-align: left;
        font: inherit;
        font-size: 12.5px;
        color: #2f3136;
        cursor: grab;
        touch-action: none;
        user-select: none;
      }
      .mix-card:hover, .mix-card:focus-visible { background: rgba(0,0,0,0.05); outline: none; }
      .mix-card-sym {
        min-width: 34px;
        height: 30px;
        padding: 0 5px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: #fff;
        font-weight: 750;
        font-size: 12px;
        flex-shrink: 0;
      }
      .mix-card-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
      .mix-card-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .mix-card-meta { font-size: 10.5px; color: #86868b; }
      .mix-drag-ghost {
        position: fixed;
        z-index: 100000;
        pointer-events: none;
        padding: 6px 10px;
        border-radius: 10px;
        color: #fff;
        font-weight: 750;
        font-size: 14px;
        box-shadow: 0 10px 24px rgba(0,0,0,0.25);
        transform: translate(-50%, -50%) rotate(-4deg);
      }

      .mix-stage { position: relative; }
      .mix-canvas-wrap {
        position: relative;
        flex: 1;
        min-height: 260px;
        border-radius: 18px 18px 0 0;
        background: linear-gradient(165deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.02) 100%);
        transition: box-shadow 0.15s ease;
      }
      .mix-canvas-wrap.drop-over { box-shadow: inset 0 0 0 3px rgba(59,130,246,0.45); }
      .mix-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
      .mix-hint {
        position: absolute;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(30,41,59,0.8);
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .mix-thermo {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 10px 8px;
        border-radius: 14px;
        background: rgba(255,255,255,0.8);
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        pointer-events: none;
      }
      .mix-thermo-track { position: relative; width: 8px; height: 90px; border-radius: 999px; background: rgba(200,210,224,0.5); overflow: hidden; }
      .mix-thermo-fill { position: absolute; left: 0; right: 0; bottom: 0; border-radius: 999px; background: linear-gradient(180deg, #5cb3ff, #2b7de9); }
      .mix-thermo-temp { font-size: 11px; font-weight: 700; color: #555; }
      .mix-thermo-label { font-size: 8px; font-weight: 600; color: #86868b; letter-spacing: 0.03em; }
      .mix-contents {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        padding: 8px 10px;
        border-top: 1px solid rgba(0,0,0,0.06);
        font-size: 12px;
      }
      .mix-contents-label { font-weight: 650; color: #64748b; }
      .mix-chip {
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(0,0,0,0.06);
        font-weight: 650;
      }
      .mix-chip.water { background: rgba(77,166,255,0.18); color: #1d4ed8; }
      .mix-chip.solid { background: rgba(120,113,108,0.15); }
      .mix-empty-btn {
        margin-left: auto;
        appearance: none;
        border: none;
        padding: 6px 12px;
        border-radius: 9px;
        background: rgba(30,41,59,0.88);
        color: #fff;
        font: inherit;
        font-size: 12px;
        font-weight: 650;
        cursor: pointer;
      }

      .mix-results { padding: 14px; gap: 10px; overflow-y: auto; font-size: 13px; line-height: 1.45; }
      .mix-results > * { flex-shrink: 0; }
      .mix-results h4 { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #86868b; }
      .mix-intro { color: #64748b; }
      .mix-intro ol { padding-left: 18px; margin: 6px 0 0; }
      .mix-res-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .mix-badge {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        background: #e2e8f0;
        color: #334155;
      }
      .mix-badge.type-dissolves { background: #ccfbf1; color: #0f766e; }
      .mix-badge.type-mild { background: #dcfce7; color: #15803d; }
      .mix-badge.type-vigorous { background: #ffedd5; color: #c2410c; }
      .mix-badge.type-explosive { background: #fee2e2; color: #b91c1c; }
      .mix-badge.type-redox { background: #ede9fe; color: #6d28d9; }
      .mix-badge.type-acid-base { background: #dbeafe; color: #1d4ed8; }
      .mix-badge.type-precipitate { background: #fef3c7; color: #b45309; }
      .mix-danger {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #b45309;
        font-size: 11.5px;
        font-weight: 650;
        cursor: help;
        outline: none;
      }
      .mix-danger-tip {
        position: absolute;
        top: calc(100% + 6px);
        right: 0;
        width: 220px;
        padding: 8px 10px;
        border-radius: 10px;
        background: #1e293b;
        color: #fff;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.4;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
        z-index: 5;
      }
      .mix-danger:hover .mix-danger-tip, .mix-danger:focus .mix-danger-tip { opacity: 1; }
      .mix-eq {
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(236,253,245,0.9);
        border: 1px solid rgba(167,243,208,0.7);
        color: #047857;
        font-family: 'SF Mono', Monaco, Consolas, monospace;
        font-weight: 700;
        font-size: 13px;
        overflow-x: auto;
      }
      .mix-eq.none { background: rgba(241,245,249,0.9); border-color: rgba(203,213,225,0.8); color: #475569; }
      .mix-dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; margin: 0; }
      .mix-dl dt { font-weight: 650; color: #64748b; }
      .mix-dl dd { margin: 0; }
      .mix-vigor { height: 6px; border-radius: 999px; background: rgba(0,0,0,0.08); overflow: hidden; margin-top: 6px; }
      .mix-vigor span { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #22c55e, #f59e0b, #ef4444); }
      .mix-expl { margin: 0; }
      .mix-other { margin: 0; color: #475569; font-style: italic; }
      .mix-note { margin: 0; padding: 8px 10px; border-radius: 10px; background: rgba(59,130,246,0.07); color: #1e3a8a; }
      .mix-facts { margin: 0; padding: 8px 10px 8px 26px; border-radius: 10px; background: rgba(0,0,0,0.04); color: #475569; font-size: 12px; }
      .mix-fallback { font-size: 11.5px; color: #64748b; }
      .mix-log { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
      .mix-log button {
        width: 100%;
        text-align: left;
        appearance: none;
        border: none;
        background: rgba(0,0,0,0.04);
        border-radius: 8px;
        padding: 6px 8px;
        font: inherit;
        font-size: 12px;
        color: #334155;
        cursor: pointer;
      }
      .mix-log button:hover { background: rgba(0,0,0,0.08); }

      @media (max-width: 900px) {
        .mix-lab {
          grid-template-columns: 1fr;
          grid-template-rows: auto auto auto;
          overflow-y: auto;
        }
        .mix-stage { order: -1; }
        .mix-canvas-wrap { min-height: 340px; }
        .mix-palette { max-height: 320px; }
        .mix-results { overflow: visible; }
      }
    </style>
    <div class="mix-lab" id="mix-lab" hidden>
      <aside class="mix-panel mix-palette">
        <div class="mix-segment" role="group" aria-label="${t("mixingLab.medium", "Beaker contents")}">
          <button type="button" class="active" data-medium="water">${t("mixingLab.water", "Water")}</button>
          <button type="button" data-medium="dry">${t("mixingLab.dry", "No water")}</button>
        </div>
        <div class="mix-segment" role="tablist">
          <button type="button" class="active" data-tab="compounds" role="tab">${t("mixingLab.compounds", "Compounds")}</button>
          <button type="button" data-tab="elements" role="tab">${t("mixingLab.elements", "Elements")}</button>
        </div>
        <input class="mix-search" id="mix-search" type="search" autocomplete="off" placeholder="${t("mixingLab.search", "Search…")}">
        <div class="mix-cards" id="mix-cards"></div>
      </aside>
      <section class="mix-panel mix-stage">
        <div class="mix-canvas-wrap" id="mix-drop">
          <canvas class="mix-canvas" id="mix-canvas"></canvas>
          <div class="mix-hint" id="mix-hint">${t("mixingLab.hint", "Drag substances into the beaker (or click them)")}</div>
          <div class="mix-thermo" aria-hidden="true">
            <div class="mix-thermo-track"><div class="mix-thermo-fill" id="mix-thermo-fill"></div></div>
            <div class="mix-thermo-temp" id="mix-thermo-temp">20°</div>
            <div class="mix-thermo-label">TEMP</div>
          </div>
        </div>
        <div class="mix-contents">
          <span class="mix-contents-label">${t("mixingLab.inBeaker", "In beaker:")}</span>
          <span id="mix-contents-chips" style="display:contents"></span>
          <button type="button" class="mix-empty-btn" id="mix-empty">${t("mixingLab.empty", "Empty beaker")}</button>
        </div>
      </section>
      <aside class="mix-panel mix-results" id="mix-results" aria-live="polite"></aside>
    </div>
  `;
}

/**
 * Wire up the Mixing Lab inside `root` (the element from getMixingLabMarkup).
 * @returns {{ setActive(on:boolean):void, addSubstance(id:string):void, destroy():void }}
 */
export function initMixingLab(root, { signal } = {}) {
  const lab = root.querySelector("#mix-lab");
  const cardsEl = root.querySelector("#mix-cards");
  const searchEl = root.querySelector("#mix-search");
  const dropEl = root.querySelector("#mix-drop");
  const canvas = root.querySelector("#mix-canvas");
  const hintEl = root.querySelector("#mix-hint");
  const chipsEl = root.querySelector("#mix-contents-chips");
  const resultsEl = root.querySelector("#mix-results");
  const thermoFill = root.querySelector("#mix-thermo-fill");
  const thermoTemp = root.querySelector("#mix-thermo-temp");
  const ctx = canvas.getContext("2d");

  let activeTab = "compounds";
  let medium = "water";
  let contents = [];
  let busy = false;
  const queue = [];
  const log = [];
  let running = false;
  let rafId = 0;
  let lastTime = 0;
  let destroyed = false;
  const timers = new Set();

  const fx = {
    objects: new Map(),
    sediments: new Map(),
    bubbles: [],
    flames: [],
    sparks: [],
    smoke: [],
    ppt: [],
    puffs: [],
    drops: [],
    ripples: [],
    pour: null,
    liquid: [...BASE_WATER],
    liquidTarget: [...BASE_WATER],
    cloudy: 0,
    cloudyTarget: 0,
    foam: 0,
    temp: 20,
    tempTarget: 20,
    active: null,
    shake: 0,
    time: 0,
  };

  const later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); if (!destroyed) fn(); }, ms);
    timers.add(id);
  };

  // ---------------------------------------------------------------------------
  // Palette
  // ---------------------------------------------------------------------------

  const elementGroups = Object.keys(CATEGORY_COLORS)
    .map((category) => ({
      label: category,
      items: allElements
        .filter((el) => el.category === category && typeof el.number === "number")
        .map((el) => ({ id: el.symbol, label: el.symbol, name: el.name, meta: `#${el.number}`, color: CATEGORY_COLORS[category] })),
    }))
    .filter((g) => g.items.length);

  const compoundGroups = ["acid", "base", "salt"].map((role) => ({
    label: { acid: "Acids", base: "Bases", salt: "Salts" }[role],
    items: PALETTE_COMPOUNDS.filter((c) => c.role === role).map((c) => ({
      id: c.id, label: c.formula, name: c.name, meta: role, color: ROLE_COLORS[role],
    })),
  }));

  function cardColor(id) {
    for (const g of [...compoundGroups, ...elementGroups]) {
      const item = g.items.find((i) => i.id === id);
      if (item) return item.color;
    }
    return "#64748b";
  }

  function renderCards() {
    const q = searchEl.value.trim().toLowerCase();
    const groups = activeTab === "elements" ? elementGroups : compoundGroups;
    let html = "";
    groups.forEach((g) => {
      const items = g.items.filter((i) =>
        !q || i.id.toLowerCase().startsWith(q) || i.name.toLowerCase().includes(q) || i.label.toLowerCase().includes(q) || i.meta === `#${q}`,
      );
      if (!items.length) return;
      html += `<div class="mix-group-label">${escapeHTML(g.label)}</div>`;
      items.forEach((i) => {
        html += `<button type="button" class="mix-card" data-id="${escapeHTML(i.id)}" title="${escapeHTML(i.name)}">
          <span class="mix-card-sym" style="background:${i.color}">${escapeHTML(i.label)}</span>
          <span class="mix-card-text"><span class="mix-card-name">${escapeHTML(i.name)}</span><span class="mix-card-meta">${escapeHTML(i.meta)}</span></span>
        </button>`;
      });
    });
    cardsEl.innerHTML = html || `<div class="mix-group-label">${t("mixingLab.noMatches", "No matches")}</div>`;
  }

  root.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTab = btn.dataset.tab;
      root.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b === btn));
      renderCards();
    }, { signal });
  });

  root.querySelectorAll("[data-medium]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.medium === medium) return;
      medium = btn.dataset.medium;
      root.querySelectorAll("[data-medium]").forEach((b) => b.classList.toggle("active", b === btn));
      emptyBeaker();
    }, { signal });
  });

  searchEl.addEventListener("input", renderCards, { signal });

  // Drag from palette (pointer events so it works with touch too)
  let drag = null;
  cardsEl.addEventListener("pointerdown", (e) => {
    const card = e.target.closest(".mix-card");
    if (!card || e.button !== 0) return;
    drag = { card, id: card.dataset.id, x: e.clientX, y: e.clientY, ghost: null, pointerId: e.pointerId };
  }, { signal });

  window.addEventListener("pointermove", (e) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) {
      drag.ghost = document.createElement("div");
      drag.ghost.className = "mix-drag-ghost";
      drag.ghost.style.background = cardColor(drag.id);
      drag.ghost.textContent = getSubstance(drag.id)?.formula || drag.id;
      document.body.appendChild(drag.ghost);
    }
    if (drag.ghost) {
      e.preventDefault();
      drag.ghost.style.left = `${e.clientX}px`;
      drag.ghost.style.top = `${e.clientY}px`;
      dropEl.classList.toggle("drop-over", isOverDrop(e));
    }
  }, { signal, passive: false });

  const endDrag = (e) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.ghost) {
      drag.ghost.remove();
      dropEl.classList.remove("drop-over");
      drag.card.dataset.dragged = "1";
      if (e.type === "pointerup" && isOverDrop(e)) addSubstance(drag.id);
    }
    drag = null;
  };
  window.addEventListener("pointerup", endDrag, { signal });
  window.addEventListener("pointercancel", endDrag, { signal });

  cardsEl.addEventListener("click", (e) => {
    const card = e.target.closest(".mix-card");
    if (!card) return;
    if (card.dataset.dragged) {
      delete card.dataset.dragged;
      return;
    }
    addSubstance(card.dataset.id);
  }, { signal });

  function isOverDrop(e) {
    const r = dropEl.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }

  root.querySelector("#mix-empty").addEventListener("click", emptyBeaker, { signal });

  // ---------------------------------------------------------------------------
  // Geometry
  // ---------------------------------------------------------------------------

  let W = 0, H = 0, dpr = 1;

  function resizeCanvas() {
    const rect = dropEl.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resizeCanvas) : null;
  resizeObserver?.observe(dropEl);

  function geom() {
    // Keep clear of the thermometer on the left (~70px)
    const bw = clamp(Math.min(W * 0.42, W - 100), 100, 270);
    const bh = Math.min(H - 70, bw * 1.2);
    const bx = Math.max(76, (W - bw) / 2 + 20 * (W < 360 ? 1 : 0));
    const by = H - bh - 20;
    const bottom = by + bh - 6;
    const surface = medium === "water" ? by + bh * 0.36 : bottom;
    return { bx, by, bw, bh, bottom, surface, left: bx + 6, right: bx + bw - 6 };
  }

  function sedimentTop(g) {
    let h = 0;
    fx.sediments.forEach((s) => { h += s.amount * g.bh * 0.1; });
    return g.bottom - h;
  }

  // ---------------------------------------------------------------------------
  // Beaker logic
  // ---------------------------------------------------------------------------

  function addSubstance(id) {
    if (!getSubstance(id)) return;
    if (busy) {
      queue.push(id);
      return;
    }
    busy = true;
    hintEl.style.opacity = "0";
    const sub = getSubstance(id);
    const result = resolveAddition(id, contents, medium);
    playEntry(sub, () => startReaction(result));
  }

  function emptyBeaker() {
    queue.length = 0;
    busy = false;
    contents = [];
    log.length = 0;
    fx.objects.clear();
    fx.sediments.clear();
    ["bubbles", "flames", "sparks", "smoke", "ppt", "puffs", "drops", "ripples"].forEach((k) => { fx[k] = []; });
    fx.pour = null;
    fx.active = null;
    fx.liquid = [...BASE_WATER];
    fx.liquidTarget = [...BASE_WATER];
    fx.cloudy = fx.cloudyTarget = 0;
    fx.foam = 0;
    fx.tempTarget = 20;
    hintEl.style.opacity = "1";
    timers.forEach(clearTimeout);
    timers.clear();
    renderChips();
    renderResults(null);
  }

  /** How a substance visually enters the beaker, then calls done() */
  function playEntry(sub, done) {
    const g = geom();
    const isSolution = sub.kind === "compound" && !sub.insoluble && medium === "water";
    if (isSolution) {
      fx.pour = { color: sub.color || [150, 205, 255, 0.55], t: 0, dur: 900 };
      later(done, 650);
      return;
    }
    if (sub.form === "gas") {
      for (let i = 0; i < 14; i++) {
        fx.puffs.push({ x: W / 2 + rand(-20, 20), y: g.by - 40 - i * 8, r: rand(10, 18), vy: rand(60, 90), life: 0, color: sub.solidColor, delay: i * 40 });
      }
      later(done, 700);
      return;
    }
    if (sub.form === "liquid") {
      for (let i = 0; i < 4; i++) {
        fx.drops.push({ x: W / 2 + rand(-6, 6), y: g.by - 30 - i * 26, vy: 120, color: sub.solidColor });
      }
      later(done, 700);
      return;
    }
    // Solid piece
    ctx.font = "800 13px Inter, system-ui, sans-serif";
    const label = sub.formula;
    const size = Math.max(sub.form === "crystal" ? 24 : 32, ctx.measureText(label).width + 14);
    const obj = {
      id: sub.id,
      label,
      color: [...sub.solidColor],
      x: W / 2 + rand(-g.bw * 0.2, g.bw * 0.2),
      y: g.by - 50,
      vx: 0,
      vy: 40,
      size,
      scale: 1,
      mode: "sink",
      landed: false,
      onLand: done,
    };
    fx.objects.set(sub.id, obj);
  }

  function startReaction(r) {
    const vis = r.visuals || {};
    // Update contents immediately so colours/cloudiness animate toward the result
    const consumed = new Set(r.consumed || []);
    const next = contents.filter((id) => !consumed.has(id));
    (r.leaves || []).forEach((id) => { if (!next.includes(id)) next.push(id); });
    if (!consumed.has(r.added) && !next.includes(r.added) && r.type !== "dissolves") next.push(r.added);
    contents = next;

    const reacting = [...consumed].map((id) => fx.objects.get(id)).find(Boolean) || fx.objects.get(r.added);

    // Displacement: the metal piece keeps its place but becomes coated with the new metal
    if (vis.coat) {
      const metalObj = [...consumed].map((id) => fx.objects.get(id)).find(Boolean);
      const newMetal = (r.leaves || []).find((id) => getSubstance(id)?.kind === "element");
      if (metalObj && newMetal) {
        fx.objects.delete(metalObj.id);
        metalObj.coatFrom = [...metalObj.color];
        metalObj.coatTo = [...vis.coat, 1];
        metalObj.id = newMetal;
        metalObj.label = `${metalObj.label}→${newMetal}`;
        ctx.font = "800 13px Inter, system-ui, sans-serif";
        metalObj.size = Math.max(metalObj.size, ctx.measureText(metalObj.label).width + 14);
        fx.objects.set(newMetal, metalObj);
      } else if (metalObj) {
        metalObj.coatFrom = [...metalObj.color];
        metalObj.coatTo = [...vis.coat, 1];
      }
    }

    if (reacting && medium === "water" && vis.float) reacting.mode = "float";
    if (reacting && vis.skate) reacting.vx = rand(-90, 90) || 60;

    // Precipitate collects as sediment keyed by the insoluble product
    const pptId = vis.precipitate ? (r.leaves || []).find((id) => getSubstance(id)?.insoluble) || `ppt-${log.length}` : null;
    if (pptId && !fx.sediments.has(pptId)) fx.sediments.set(pptId, { color: vis.precipitate, amount: 0 });
    if (vis.productColor) fx.sediments.set(`product-${log.length}`, { color: vis.productColor, amount: 0, grow: true });

    // Consumed insoluble solids (e.g. CaCO3 in acid) shrink away
    consumed.forEach((id) => {
      const sed = fx.sediments.get(id);
      if (sed) sed.dissolving = true;
    });

    const dur = r.type === "none" ? 900 : r.type === "dissolves" ? 1400 : r.type === "precipitate" ? 3200 : 2200 + (r.vigor || 0) * 2400;
    fx.active = { r, vis, t: 0, dur, reacting, pptId, dissolveIds: [...consumed] };
    fx.tempTarget = clamp(fx.tempTarget + (vis.heat || 0), -10, 100);

    updateTargets();
    renderChips();
    log.unshift(r);
    renderResults(r);

    later(() => finishReaction(r), dur);
  }

  function finishReaction(r) {
    fx.active = null;
    // Remove pieces that reacted away
    (r.consumed || []).forEach((id) => {
      const obj = fx.objects.get(id);
      if (obj && !contents.includes(id)) obj.removing = true;
    });
    fx.sediments.forEach((s, id) => { if (s.dissolving) fx.sediments.delete(id); });

    // Products can react with what's left (Na → NaOH, then NaOH + HCl …)
    for (const leaf of r.leaves || []) {
      const follow = resolveFollowUp(leaf, contents.filter((id) => id !== leaf), medium);
      if (follow) {
        later(() => startReaction(follow), 500);
        return;
      }
    }
    busy = false;
    if (queue.length) later(() => addSubstance(queue.shift()), 250);
  }

  function updateTargets() {
    const colored = contents.map(getSubstance).filter((s) => s && s.color && !s.insoluble);
    if (medium !== "water") {
      fx.liquidTarget = [...BASE_WATER];
    } else if (colored.length) {
      const sum = colored.reduce((acc, s) => [acc[0] + s.color[0], acc[1] + s.color[1], acc[2] + s.color[2], Math.max(acc[3], s.color[3])], [0, 0, 0, 0]);
      fx.liquidTarget = [sum[0] / colored.length, sum[1] / colored.length, sum[2] / colored.length, sum[3]];
    } else {
      fx.liquidTarget = [...BASE_WATER];
    }
    fx.cloudyTarget = medium === "water" && contents.some((id) => getSubstance(id)?.cloudy) ? 1 : 0;
  }

  // ---------------------------------------------------------------------------
  // Panel rendering
  // ---------------------------------------------------------------------------

  function renderChips() {
    const chips = [];
    if (medium === "water") chips.push(`<span class="mix-chip water">H₂O</span>`);
    contents.forEach((id) => {
      const s = getSubstance(id);
      if (!s) return;
      const solid = s.insoluble || (s.kind === "element" && s.form !== "gas");
      chips.push(`<span class="mix-chip${solid ? " solid" : ""}" title="${escapeHTML(s.name)}">${escapeHTML(s.formula)}${s.insoluble ? "(s)" : ""}</span>`);
    });
    if (!contents.length && medium !== "water") chips.push(`<span class="mix-chip">${t("mixingLab.nothing", "Empty")}</span>`);
    chipsEl.innerHTML = chips.join("");
  }

  function renderResults(r) {
    if (!r) {
      resultsEl.innerHTML = `
        <div class="mix-intro">
          <h4>${t("mixingLab.howTitle", "How to use")}</h4>
          <ol>
            <li>${t("mixingLab.step1", "Drag an element or compound into the beaker of water.")}</li>
            <li>${t("mixingLab.step2", "Add a second substance to see how they react together.")}</li>
            <li>${t("mixingLab.step3", "Switch to “No water” to combine elements directly.")}</li>
          </ol>
          <p>${t("mixingLab.introNote", "Try: Na, then HCl, then AgNO₃ — or CuSO₄ then NaOH.")}</p>
        </div>`;
      return;
    }
    const reactantIds = (r.reactants || []).filter((id) => id !== WATER);
    const reactants = reactantIds.map((id) => getSubstance(id)).filter(Boolean).map((s) => `${escapeHTML(s.formula)} <span class="mix-card-meta">${escapeHTML(s.name)}</span>`);
    if ((r.reactants || []).includes(WATER) || (r.partner === WATER)) reactants.push("H₂O <span class=\"mix-card-meta\">Water</span>");
    const products = (r.productNames || []).map(escapeHTML).join(", ") || "—";
    const danger = r.danger
      ? `<span class="mix-danger" tabindex="0" role="note" aria-label="${escapeHTML(r.danger)}">${WARNING_SVG}${t("mixingLab.safety", "Safety")}<span class="mix-danger-tip">${escapeHTML(r.danger)}</span></span>`
      : "";
    const logHTML = log.length > 1
      ? `<h4>${t("mixingLab.history", "Reaction history")}</h4><ol class="mix-log">${log.map((item, i) => `<li><button type="button" data-log="${i}">${escapeHTML(TYPE_LABELS[item.type] || item.type)}: ${escapeHTML(item.equation)}</button></li>`).join("")}</ol>`
      : "";
    resultsEl.innerHTML = `
      <div class="mix-res-head">
        <span class="mix-badge type-${escapeHTML(r.type)}">${escapeHTML(TYPE_LABELS[r.type] || r.type)}</span>
        ${r.followUp ? `<span class="mix-card-meta">${t("mixingLab.followUp", "follow-up reaction")}</span>` : ""}
        ${danger}
      </div>
      <div class="mix-eq${r.type === "none" ? " none" : ""}">${escapeHTML(r.equation)}</div>
      <dl class="mix-dl">
        <dt>${t("mixingLab.reactants", "Reactants")}</dt><dd>${reactants.join("<br>")}</dd>
        <dt>${t("mixingLab.products", "Products")}</dt><dd>${products}</dd>
        <dt>${t("mixingLab.energy", "Energy")}</dt><dd>${escapeHTML(ENERGY_LABELS[r.energy] || ENERGY_LABELS.none)}
          ${r.type !== "none" && r.type !== "dissolves" ? `<div class="mix-vigor" title="Intensity"><span style="width:${Math.round((r.vigor || 0.05) * 100)}%"></span></div>` : ""}</dd>
      </dl>
      <p class="mix-expl">${escapeHTML(r.explanation)}</p>
      ${r.withOthers ? `<p class="mix-other">${escapeHTML(r.withOthers)}</p>` : ""}
      ${r.note ? `<p class="mix-note"><strong>${t("mixingLab.realWorld", "Real world:")}</strong> ${escapeHTML(r.note)}</p>` : ""}
      ${r.facts?.length ? `<ul class="mix-facts">${r.facts.map((f) => `<li>${escapeHTML(f)}</li>`).join("")}</ul>` : ""}
      ${r.fallback ? `<div class="mix-fallback">${t("mixingLab.fallback", "Not in the reaction database — shown as no visible reaction rather than guessing.")}</div>` : ""}
      ${logHTML}
    `;
  }

  resultsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-log]");
    if (btn) renderResults(log[Number(btn.dataset.log)]);
  }, { signal });

  // ---------------------------------------------------------------------------
  // Animation
  // ---------------------------------------------------------------------------

  function beakerPath(g, inset = 0) {
    const r = 18;
    const x0 = g.bx + inset, x1 = g.bx + g.bw - inset, y0 = g.by, y1 = g.by + g.bh - inset;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1 - r);
    ctx.quadraticCurveTo(x0, y1, x0 + r, y1);
    ctx.lineTo(x1 - r, y1);
    ctx.quadraticCurveTo(x1, y1, x1, y1 - r);
    ctx.lineTo(x1, y0);
  }

  function step(now) {
    if (!running) return;
    if (!dropEl.offsetParent) {
      // Modal closed or hidden: idle cheaply until visible again
      lastTime = 0;
      rafId = requestAnimationFrame(step);
      return;
    }
    const dt = Math.min(0.05, (now - (lastTime || now)) / 1000);
    lastTime = now;
    if (canvas.width !== Math.round(W * dpr) || !W) resizeCanvas();
    update(dt);
    draw();
    rafId = requestAnimationFrame(step);
  }

  function intensity(a) {
    if (!a) return 0;
    const t0 = a.t;
    return clamp(Math.min(t0 / 300, (a.dur - t0) / 600, 1), 0, 1);
  }

  function reactionSource(g) {
    const obj = fx.active?.reacting;
    if (obj && fx.objects.has(obj.id) && !obj.removing) return { x: obj.x, y: obj.y, top: obj.y - (obj.size * obj.scale) / 2 };
    const y = medium === "water" ? (g.surface + g.bottom) / 2 : g.bottom - 10;
    return { x: W / 2, y, top: medium === "water" ? g.surface : y };
  }

  function update(dt) {
    const g = geom();
    fx.time += dt;
    const ms = dt * 1000;

    // Pour stream
    if (fx.pour) {
      fx.pour.t += ms;
      if (fx.pour.t > fx.pour.dur) fx.pour = null;
      else if (Math.random() < 0.4 && medium === "water") fx.ripples.push({ x: W / 2 + rand(-10, 10), y: g.surface, r: 4, life: 0 });
    }

    // Gas puffs & liquid drops
    fx.puffs = fx.puffs.filter((p) => {
      if (p.delay > 0) { p.delay -= ms; return true; }
      p.life += dt;
      p.y += p.vy * dt;
      p.r += 8 * dt;
      return p.life < 1.2 && p.y < g.surface + 20;
    });
    fx.drops = fx.drops.filter((d) => {
      d.vy += 600 * dt;
      d.y += d.vy * dt;
      if (d.y >= g.surface) {
        fx.ripples.push({ x: d.x, y: g.surface, r: 3, life: 0 });
        return false;
      }
      return true;
    });
    fx.ripples = fx.ripples.filter((r) => { r.life += dt; r.r += 40 * dt; return r.life < 0.6; });

    // Solid pieces
    const sedTop = sedimentTop(g);
    fx.objects.forEach((obj, id) => {
      const half = (obj.size * obj.scale) / 2;
      if (obj.removing) {
        obj.scale -= dt * 1.5;
        if (obj.scale <= 0.02) fx.objects.delete(id);
        return;
      }
      if (obj.mode === "float" && medium === "water") {
        const targetY = g.surface - half * 0.35 + Math.sin(fx.time * 6 + obj.x) * 1.5;
        obj.y += (targetY - obj.y) * Math.min(1, dt * 6);
        obj.vy = 0;
      } else {
        const inWater = medium === "water" && obj.y > g.surface;
        obj.vy += (inWater ? 180 : 900) * dt;
        if (inWater) obj.vy = Math.min(obj.vy, 110);
        obj.y += obj.vy * dt;
        const floor = sedTop - half;
        if (obj.y >= floor) {
          obj.y = floor;
          obj.vy = 0;
        }
      }
      const crossed = medium === "water" ? obj.y >= g.surface - half * 0.3 : obj.y >= sedTop - half - 0.5;
      if (!obj.landed && crossed) {
        obj.landed = true;
        if (medium === "water") for (let i = 0; i < 3; i++) fx.ripples.push({ x: obj.x, y: g.surface, r: 4 + i * 4, life: i * -0.08 });
        const cb = obj.onLand;
        obj.onLand = null;
        cb?.();
      }
      if (obj.vx) {
        obj.x += obj.vx * dt;
        if (obj.x - half < g.left || obj.x + half > g.right) {
          obj.vx *= -1;
          obj.x = clamp(obj.x, g.left + half, g.right - half);
        }
        if (Math.random() < dt * 1.5) obj.vx = rand(-100, 100);
      }
      obj.x = clamp(obj.x, g.left + half, g.right - half);
    });

    // Active reaction effects
    const a = fx.active;
    if (a) {
      a.t += ms;
      const I = intensity(a);
      const vis = a.vis;
      const src = reactionSource(g);
      const water = medium === "water";

      if (vis.bubbles && water) {
        const n = vis.bubbles * 55 * I * dt;
        for (let i = 0; i < Math.floor(n) + (Math.random() < n % 1 ? 1 : 0); i++) {
          const fromObj = a.reacting && fx.objects.has(a.reacting.id);
          fx.bubbles.push({
            x: fromObj ? src.x + rand(-12, 12) : rand(g.left + 10, g.right - 10),
            y: fromObj ? src.y + rand(-8, 8) : rand(g.surface + 20, g.bottom - 6),
            r: rand(1.5, 2.5 + vis.bubbles * 3),
            vy: rand(50, 90 + vis.bubbles * 80),
            wob: rand(0, 6),
          });
        }
      }
      if (vis.foam && water) fx.foam = Math.min(1, fx.foam + dt * 0.8 * I);
      if (vis.flame) {
        const n = 70 * I * dt;
        for (let i = 0; i < Math.ceil(n); i++) {
          fx.flames.push({ x: src.x + rand(-10, 10), y: src.top, vx: rand(-12, 12), vy: rand(-90, -50), r: rand(6, 12), life: 0, max: rand(0.35, 0.7), color: vis.flame });
        }
      }
      if (vis.sparks && Math.random() < 30 * I * dt) {
        for (let i = 0; i < 3; i++) fx.sparks.push({ x: src.x, y: src.top, vx: rand(-160, 160), vy: rand(-260, -80), life: 0, max: rand(0.4, 0.8) });
      }
      if (vis.smoke && Math.random() < 10 * I * dt) {
        fx.smoke.push({ x: src.x + rand(-15, 15), y: src.top - 10, r: rand(10, 16), vy: rand(-40, -25), vx: rand(-10, 10), life: 0, max: rand(1.4, 2.2) });
      }
      if (vis.precipitate && water && a.t < a.dur * 0.75) {
        const n = 140 * I * dt;
        for (let i = 0; i < Math.ceil(n); i++) {
          fx.ppt.push({ x: rand(g.left + 8, g.right - 8), y: rand(g.surface + 6, (g.surface + g.bottom) / 2), vy: rand(15, 45), r: rand(1.2, 2.6), color: vis.precipitate, target: a.pptId });
        }
      }
      // Pieces used up by the reaction shrink away (coated metals and leftovers stay)
      a.dissolveIds.forEach((id) => {
        const obj = fx.objects.get(id);
        if (obj && !obj.coatTo && !contents.includes(id)) obj.scale = Math.max(0.05, 1 - (a.t / a.dur) * 0.95);
      });
      if (a.reacting?.coatTo) {
        const k = clamp(a.t / a.dur, 0, 1);
        a.reacting.color = a.reacting.coatFrom.map((c, i) => c + (a.reacting.coatTo[i] - c) * k);
      }
      fx.sediments.forEach((s) => {
        if (s.dissolving) s.amount = Math.max(0, s.amount - dt * 0.5);
        if (s.grow) s.amount = Math.min(0.6, s.amount + dt * 0.25 * I);
      });
      fx.shake = a.r.type === "explosive" ? I * 3 : 0;
    } else {
      fx.shake = 0;
      fx.foam = Math.max(0, fx.foam - dt * 0.25);
    }

    // Particles
    fx.bubbles = fx.bubbles.filter((b) => {
      b.y -= b.vy * dt;
      b.x += Math.sin(fx.time * 8 + b.wob) * 12 * dt;
      return b.y > g.surface + 2;
    });
    fx.flames = fx.flames.filter((f) => { f.life += dt; f.x += f.vx * dt; f.y += f.vy * dt; return f.life < f.max; });
    fx.sparks = fx.sparks.filter((s) => { s.life += dt; s.vy += 500 * dt; s.x += s.vx * dt; s.y += s.vy * dt; return s.life < s.max; });
    fx.smoke = fx.smoke.filter((s) => { s.life += dt; s.y += s.vy * dt; s.x += s.vx * dt; s.r += 14 * dt; return s.life < s.max; });
    const pptFloor = sedimentTop(g);
    fx.ppt = fx.ppt.filter((p) => {
      p.y += p.vy * dt;
      p.x += Math.sin(fx.time * 3 + p.y * 0.1) * 6 * dt;
      if (p.y >= pptFloor - 1) {
        const sed = fx.sediments.get(p.target);
        if (sed) sed.amount = Math.min(1, sed.amount + 0.0022);
        return false;
      }
      return true;
    });

    // Smooth colour / cloudiness / temperature
    const k = Math.min(1, dt * 1.2);
    fx.liquid = fx.liquid.map((c, i) => c + (fx.liquidTarget[i] - c) * k);
    fx.cloudy += (fx.cloudyTarget - fx.cloudy) * k;
    if (!fx.active) fx.tempTarget += (20 - fx.tempTarget) * Math.min(1, dt * 0.04);
    fx.temp += (fx.tempTarget - fx.temp) * Math.min(1, dt * 1.5);
    const pct = clamp((fx.temp + 10) / 110, 0.05, 1);
    thermoFill.style.height = `${(pct * 100).toFixed(1)}%`;
    thermoFill.style.background = fx.temp > 35
      ? "linear-gradient(180deg, #ff8a5c, #e5484d)"
      : fx.temp < 15 ? "linear-gradient(180deg, #a5d8ff, #4dabf7)" : "linear-gradient(180deg, #5cb3ff, #2b7de9)";
    thermoTemp.textContent = `${Math.round(fx.temp)}°`;
  }

  function draw() {
    const g = geom();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (fx.shake) ctx.translate(rand(-fx.shake, fx.shake), rand(-fx.shake, fx.shake));

    // Glass back
    beakerPath(g);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();

    // Contents (clipped to the beaker)
    ctx.save();
    beakerPath(g, 3);
    ctx.closePath();
    ctx.clip();

    if (medium === "water") {
      const top = g.surface;
      ctx.beginPath();
      ctx.moveTo(g.bx, top);
      const waveAmp = 1.5 + (fx.active ? intensity(fx.active) * (fx.active.r.vigor || 0) * 4 : 0);
      for (let x = g.bx; x <= g.bx + g.bw; x += 6) {
        ctx.lineTo(x, top + Math.sin(x * 0.06 + fx.time * 3) * waveAmp);
      }
      ctx.lineTo(g.bx + g.bw, g.by + g.bh);
      ctx.lineTo(g.bx, g.by + g.bh);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, top, 0, g.bottom);
      grad.addColorStop(0, rgba(fx.liquid, 0.9));
      grad.addColorStop(1, rgba(fx.liquid, 1.25));
      ctx.fillStyle = grad;
      ctx.fill();
      if (fx.cloudy > 0.01) {
        ctx.fillStyle = `rgba(240,240,236,${0.45 * fx.cloudy})`;
        ctx.fill();
      }
      const pptActive = fx.active?.vis.precipitate;
      if (pptActive) {
        ctx.fillStyle = rgba(pptActive, 0.25 * intensity(fx.active));
        ctx.fill();
      }
    }

    // Sediment / product layers
    let base = g.bottom + 3;
    fx.sediments.forEach((s) => {
      const h = s.amount * g.bh * 0.1;
      if (h < 0.3) return;
      ctx.beginPath();
      ctx.moveTo(g.bx, base);
      for (let x = g.bx; x <= g.bx + g.bw; x += 8) {
        ctx.lineTo(x, base - h - Math.sin(x * 0.2) * Math.min(2, h * 0.3));
      }
      ctx.lineTo(g.bx + g.bw, base);
      ctx.closePath();
      ctx.fillStyle = rgba(s.color);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      base -= h;
    });

    // Precipitate particles
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 0.8;
    fx.ppt.forEach((p) => {
      ctx.fillStyle = rgba(p.color, 0.95);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Bubbles
    ctx.strokeStyle = "rgba(40,100,180,0.45)";
    ctx.lineWidth = 1;
    fx.bubbles.forEach((b) => {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Foam
    if (fx.foam > 0.01 && medium === "water") {
      for (let x = g.bx; x < g.bx + g.bw; x += 9) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(x + 4, g.surface - 2 + Math.sin(x) * 2, 4 + fx.foam * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ripples
    fx.ripples.forEach((r) => {
      if (r.life < 0) return;
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - r.life / 0.6)})`;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r, r.r * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();

    // Pour stream (above the beaker)
    if (fx.pour) {
      const k = fx.pour.t / fx.pour.dur;
      const width = 6 * Math.sin(Math.PI * Math.min(1, k * 1.2));
      if (width > 0.3) {
        ctx.fillStyle = rgba(fx.pour.color, 1.4);
        ctx.fillRect(W / 2 - width / 2, 0, width, g.surface - 0);
      }
    }

    // Gas puffs and drops
    fx.puffs.forEach((p) => {
      if (p.delay > 0) return;
      ctx.fillStyle = rgba(p.color, 0.8 * (1 - p.life / 1.2));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    fx.drops.forEach((d) => {
      ctx.fillStyle = rgba(d.color);
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Solid pieces
    fx.objects.forEach((obj) => {
      const s = obj.size * obj.scale;
      if (s < 1) return;
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.fillStyle = rgba(obj.color);
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 1;
      const r = Math.min(8, s * 0.25);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-s / 2, -s / 2, s, s, r);
      else ctx.rect(-s / 2, -s / 2, s, s);
      ctx.fill();
      ctx.stroke();
      if (obj.scale > 0.45) {
        const lum = obj.color[0] * 0.3 + obj.color[1] * 0.59 + obj.color[2] * 0.11;
        ctx.fillStyle = lum > 150 ? "#1e293b" : "#fff";
        ctx.font = `800 ${Math.round(12 * Math.min(1, obj.scale + 0.2))}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obj.label, 0, 1);
      }
      ctx.restore();
    });

    // Flames (normal blending so they stay visible on the light background)
    ctx.save();
    fx.flames.forEach((f) => {
      const k = 1 - f.life / f.max;
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * (0.6 + k));
      grad.addColorStop(0, `rgba(255,250,215,${0.95 * k})`);
      grad.addColorStop(0.35, rgba([...f.color, 1], 0.85 * k));
      grad.addColorStop(0.75, `rgba(255,120,40,${0.35 * k})`);
      grad.addColorStop(1, rgba([...f.color, 1], 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * (0.6 + k), 0, Math.PI * 2);
      ctx.fill();
    });
    fx.sparks.forEach((s) => {
      ctx.fillStyle = `rgba(245,150,30,${1 - s.life / s.max})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Smoke
    fx.smoke.forEach((s) => {
      ctx.fillStyle = `rgba(150,150,155,${0.35 * (1 - s.life / s.max)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Glass outline, lip and graduations
    ctx.strokeStyle = "rgba(100,116,139,0.55)";
    ctx.lineWidth = 3;
    beakerPath(g);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(g.bx - 8, g.by);
    ctx.lineTo(g.bx, g.by);
    ctx.moveTo(g.bx + g.bw, g.by);
    ctx.lineTo(g.bx + g.bw + 8, g.by);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(100,116,139,0.4)";
    for (let i = 1; i <= 6; i++) {
      const y = g.by + (g.bh * i) / 7.5;
      ctx.beginPath();
      ctx.moveTo(g.bx + g.bw - 6, y);
      ctx.lineTo(g.bx + g.bw - (i % 2 ? 22 : 14), y);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(g.bx + 10, g.by + 10, 6, g.bh * 0.6);
  }

  function setActive(on) {
    if (on === running) return;
    running = on;
    lab.hidden = !on;
    if (on) {
      resizeCanvas();
      lastTime = 0;
      rafId = requestAnimationFrame(step);
    } else {
      cancelAnimationFrame(rafId);
    }
  }

  function destroy() {
    destroyed = true;
    running = false;
    cancelAnimationFrame(rafId);
    resizeObserver?.disconnect();
    timers.forEach(clearTimeout);
    timers.clear();
    document.querySelectorAll(".mix-drag-ghost").forEach((el) => el.remove());
  }

  renderCards();
  renderChips();
  renderResults(null);

  return {
    setActive,
    destroy,
    addSubstance(id) {
      const sub = getSubstance(id);
      if (!sub) return;
      activeTab = sub.kind === "element" ? "elements" : "compounds";
      root.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b.dataset.tab === activeTab));
      renderCards();
      addSubstance(id);
    },
  };
}

export { formatFormula };
