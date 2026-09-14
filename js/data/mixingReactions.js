// =============================================================================
// Mixing Lab reaction database
// Substances (elements + common lab compounds), reactions keyed by unordered
// pairs, and rule-based fallbacks that never invent a reaction: anything not
// listed resolves to "No visible reaction" with an explanation drawn from the
// element data already in the app.
//
// Content is conceptual/educational only — outcomes and visual cues, never
// quantities or procedures.
// =============================================================================

import { elements, finallyData } from "./elementsData.js";

export const WATER = "H2O";

const SUB_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

/** "Ca(OH)2" -> "Ca(OH)₂" (digits following a letter or ")" become subscripts) */
export function formatFormula(id) {
  return String(id).replace(/([A-Za-z)])(\d+)/g, (_, prefix, digits) =>
    prefix + digits.replace(/\d/g, (d) => SUB_DIGITS[d]),
  );
}

// -----------------------------------------------------------------------------
// Elements
// -----------------------------------------------------------------------------

const ELEMENT_BY_SYMBOL = new Map(
  elements.filter((el) => typeof el.number === "number").map((el) => [el.symbol, el]),
);

/** Elements that exist as diatomic molecules at room temperature */
const DIATOMIC = { H: "H2", N: "N2", O: "O2", F: "F2", Cl: "Cl2", Br: "Br2", I: "I2" };

/** Per-element visual hints for the beaker (defaults: grey metal chip) */
const ELEMENT_LOOK = {
  H: { form: "gas", color: [235, 240, 250, 0.5] },
  N: { form: "gas", color: [235, 240, 250, 0.5] },
  O: { form: "gas", color: [235, 240, 250, 0.5] },
  F: { form: "gas", color: [230, 240, 160, 0.55] },
  Cl: { form: "gas", color: [190, 225, 110, 0.6], solution: [200, 230, 120, 0.3] },
  Br: { form: "liquid", color: [150, 45, 25, 0.9], solution: [230, 130, 40, 0.45] },
  I: { form: "crystal", color: [70, 55, 90, 1], solution: [150, 90, 40, 0.5] },
  C: { form: "chip", color: [60, 60, 64, 1] },
  S: { form: "powder", color: [240, 215, 60, 1] },
  P: { form: "chip", color: [225, 210, 190, 1] },
  Cu: { form: "chip", color: [196, 110, 70, 1] },
  Au: { form: "chip", color: [222, 180, 60, 1] },
  Ag: { form: "chip", color: [200, 205, 212, 1] },
  Fe: { form: "chip", color: [120, 118, 116, 1] },
};

export function getElementInfo(symbol) {
  const el = ELEMENT_BY_SYMBOL.get(symbol);
  if (!el) return null;
  const data = finallyData[String(el.number)] || {};
  const props = data.level3_properties || {};
  return {
    symbol,
    name: el.name,
    number: el.number,
    category: el.category,
    phase: data.level1_basic?.phaseAtSTP || null,
    electronegativity: props.physical?.electronegativity ?? null,
    oxidationStates: props.electronic?.oxidationStates?.common || [],
    commonIons: data.level1_basic?.commonIons || null,
  };
}

// -----------------------------------------------------------------------------
// Compounds
// -----------------------------------------------------------------------------

// role: acid | base | salt. color = color of the solution (RGBA) when dissolved.
const COMPOUNDS = [
  { id: "HCl", name: "Hydrochloric acid", role: "acid" },
  { id: "H2SO4", name: "Sulfuric acid (dilute)", role: "acid" },
  { id: "CH3COOH", name: "Acetic acid (vinegar)", role: "acid" },
  { id: "NaOH", name: "Sodium hydroxide", role: "base" },
  { id: "KOH", name: "Potassium hydroxide", role: "base" },
  { id: "Ca(OH)2", name: "Calcium hydroxide (limewater)", role: "base", cloudy: true },
  { id: "NH3", name: "Ammonia solution", role: "base" },
  { id: "NaCl", name: "Sodium chloride", role: "salt" },
  { id: "KBr", name: "Potassium bromide", role: "salt" },
  { id: "KI", name: "Potassium iodide", role: "salt" },
  { id: "AgNO3", name: "Silver nitrate", role: "salt" },
  { id: "Pb(NO3)2", name: "Lead(II) nitrate", role: "salt" },
  { id: "BaCl2", name: "Barium chloride", role: "salt" },
  { id: "Na2SO4", name: "Sodium sulfate", role: "salt" },
  { id: "CuSO4", name: "Copper(II) sulfate", role: "salt", color: [25, 105, 225, 0.7] },
  { id: "FeCl3", name: "Iron(III) chloride", role: "salt", color: [205, 140, 40, 0.55] },
  { id: "ZnSO4", name: "Zinc sulfate", role: "salt" },
  { id: "Na2CO3", name: "Sodium carbonate", role: "salt" },
  { id: "NaHCO3", name: "Sodium bicarbonate (baking soda)", role: "salt" },
  { id: "CaCO3", name: "Calcium carbonate (chalk)", role: "salt", insoluble: true, solidColor: [245, 245, 240, 1] },
  { id: "NH4Cl", name: "Ammonium chloride", role: "salt" },
];

// Products that can appear in the beaker but are not offered in the palette
const PRODUCT_COMPOUNDS = [
  { id: "LiOH", name: "Lithium hydroxide", role: "base" },
  { id: "RbOH", name: "Rubidium hydroxide", role: "base" },
  { id: "CsOH", name: "Cesium hydroxide", role: "base" },
  { id: "Mg(OH)2", name: "Magnesium hydroxide", role: "base", cloudy: true },
  { id: "Sr(OH)2", name: "Strontium hydroxide", role: "base" },
  { id: "Ba(OH)2", name: "Barium hydroxide", role: "base" },
  { id: "NaNO3", name: "Sodium nitrate", role: "salt" },
  { id: "KNO3", name: "Potassium nitrate", role: "salt" },
  { id: "KCl", name: "Potassium chloride", role: "salt" },
  { id: "Cu(NO3)2", name: "Copper(II) nitrate", role: "salt", color: [50, 130, 230, 0.5] },
  { id: "FeSO4", name: "Iron(II) sulfate", role: "salt", color: [150, 200, 140, 0.35] },
  { id: "MgSO4", name: "Magnesium sulfate", role: "salt" },
  { id: "CaCl2", name: "Calcium chloride", role: "salt" },
  { id: "NaClO", name: "Sodium hypochlorite (bleach)", role: "salt" },
  { id: "AgCl", name: "Silver chloride", role: "salt", insoluble: true, solidColor: [248, 248, 248, 1] },
  { id: "AgBr", name: "Silver bromide", role: "salt", insoluble: true, solidColor: [240, 232, 200, 1] },
  { id: "AgI", name: "Silver iodide", role: "salt", insoluble: true, solidColor: [240, 225, 120, 1] },
  { id: "PbI2", name: "Lead(II) iodide", role: "salt", insoluble: true, solidColor: [250, 205, 30, 1] },
  { id: "BaSO4", name: "Barium sulfate", role: "salt", insoluble: true, solidColor: [250, 250, 250, 1] },
  { id: "Cu(OH)2", name: "Copper(II) hydroxide", role: "base", insoluble: true, solidColor: [110, 170, 235, 1] },
  { id: "Fe(OH)3", name: "Iron(III) hydroxide", role: "base", insoluble: true, solidColor: [160, 80, 30, 1] },
  { id: "Ag2O", name: "Silver(I) oxide", role: "salt", insoluble: true, solidColor: [95, 70, 55, 1] },
];

const CATION_NAMES = {
  Li: "Lithium", Na: "Sodium", K: "Potassium", Rb: "Rubidium", Cs: "Cesium",
  Mg: "Magnesium", Ca: "Calcium", Sr: "Strontium", Ba: "Barium",
  Zn: "Zinc", Fe: "Iron(II)", Al: "Aluminum", NH4: "Ammonium",
};

// -----------------------------------------------------------------------------
// Acid-base and metal-acid generators (balanced programmatically)
// -----------------------------------------------------------------------------

const ACIDS = {
  HCl: { h: 1, anion: "Cl", anionName: "chloride", poly: false, weak: false },
  H2SO4: { h: 2, anion: "SO4", anionName: "sulfate", poly: true, weak: false },
  CH3COOH: { h: 1, anion: "CH3COO", anionName: "acetate", poly: true, weak: true },
};

const BASES = {
  LiOH: { cation: "Li", charge: 1 },
  NaOH: { cation: "Na", charge: 1 },
  KOH: { cation: "K", charge: 1 },
  RbOH: { cation: "Rb", charge: 1 },
  CsOH: { cation: "Cs", charge: 1 },
  "Mg(OH)2": { cation: "Mg", charge: 2, insoluble: true },
  "Ca(OH)2": { cation: "Ca", charge: 2 },
  "Sr(OH)2": { cation: "Sr", charge: 2 },
  "Ba(OH)2": { cation: "Ba", charge: 2 },
};

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const coef = (n) => (n === 1 ? "" : String(n));

/** Salt formula id for cation (charge c) + acid anion (charge h), e.g. Al + SO4 -> Al2(SO4)3 */
function saltId(cation, c, acid) {
  const g = gcd(acid.h, c);
  const x = acid.h / g;
  const y = c / g;
  const cat = cation === "NH4" && x > 1 ? `(NH4)${x}` : `${cation}${x > 1 ? x : ""}`;
  const an = y > 1 ? (acid.poly ? `(${acid.anion})${y}` : `${acid.anion}${y}`) : acid.anion;
  return { id: `${cat}${an}`, x, y };
}

function saltName(cation, acid) {
  return `${CATION_NAMES[cation] || cation} ${acid.anionName}`;
}

const INSOLUBLE_SALTS = { BaSO4: [250, 250, 250, 1] };
const SLIGHTLY_SOLUBLE_SALTS = new Set(["CaSO4", "SrSO4"]);

function neutralization(acidId, baseId) {
  const acid = ACIDS[acidId];
  const f = formatFormula;
  if (baseId === "NH3") {
    const salt = saltId("NH4", 1, acid);
    return {
      type: "acid-base",
      equation: `${coef(salt.x)}NH₃(aq) + ${coef(salt.y)}${f(acidId)}(aq) → ${f(salt.id)}(aq)`,
      productNames: [saltName("NH4", acid)],
      leaves: [salt.id],
      energy: "exothermic",
      vigor: 0.2,
      visuals: { heat: 6 },
      explanation: `Ammonia is a weak base: it accepts H⁺ from the acid to form ammonium ions (NH₄⁺), making the salt ${saltName("NH4", acid).toLowerCase()}.`,
      note: "Ammonium salts made this way are used in fertilizers.",
      productInfo: { [salt.id]: { name: saltName("NH4", acid), role: "salt" } },
    };
  }
  const base = BASES[baseId];
  const salt = saltId(base.cation, base.charge, acid);
  const L = (acid.h * base.charge) / gcd(acid.h, base.charge);
  const acidCoef = L / acid.h;
  const baseCoef = L / base.charge;
  const saltCoef = acidCoef / salt.y;
  const insolubleColor = INSOLUBLE_SALTS[salt.id];
  const slightly = SLIGHTLY_SOLUBLE_SALTS.has(salt.id);
  const state = insolubleColor ? "(s)" : "(aq)";
  const name = saltName(base.cation, acid);
  let explanation = `H⁺ ions from the acid combine with OH⁻ ions from the base to make water. The leftover ions form the salt ${name.toLowerCase()}.`;
  if (base.insoluble) explanation += ` The cloudy ${f(baseId)} dissolves as it is neutralized, so the mixture clears.`;
  if (insolubleColor) explanation += ` ${f(salt.id)} is insoluble, so a white precipitate also forms.`;
  if (slightly) explanation += ` ${f(salt.id)} is only slightly soluble, so the mixture may turn a little cloudy.`;
  return {
    type: insolubleColor ? "precipitate" : "acid-base",
    equation: `${coef(acidCoef)}${f(acidId)}(aq) + ${coef(baseCoef)}${f(baseId)}(${base.insoluble ? "s" : "aq"}) → ${coef(saltCoef)}${f(salt.id)}${state} + ${coef(L)}H₂O(l)`,
    productNames: [name, "Water"],
    leaves: [salt.id],
    energy: "exothermic",
    vigor: acid.weak ? 0.15 : 0.25,
    visuals: {
      heat: acid.weak ? 4 : 8,
      precipitate: insolubleColor || null,
      cloudy: slightly,
    },
    explanation,
    note: "Neutralization is how antacids work: a base cancels out excess stomach acid.",
    productInfo: {
      [salt.id]: {
        name,
        role: "salt",
        insoluble: Boolean(insolubleColor),
        solidColor: insolubleColor,
        cloudy: slightly,
        color: base.cation === "Fe" ? [150, 200, 140, 0.35] : undefined,
      },
    },
  };
}

// Metals that give off hydrogen with dilute acids (charge, vigor, notes)
const ACID_METALS = {
  Li: { charge: 1, vigor: 0.8, flame: null, danger: true },
  Na: { charge: 1, vigor: 0.95, flame: [255, 190, 60], danger: true },
  K: { charge: 1, vigor: 1, flame: [200, 150, 255], danger: true },
  Ca: { charge: 2, vigor: 0.7 },
  Mg: { charge: 2, vigor: 0.6 },
  Al: { charge: 3, vigor: 0.35, slowStart: true },
  Zn: { charge: 2, vigor: 0.4 },
  Fe: { charge: 2, vigor: 0.25 },
};

function metalAcid(metal, acidId) {
  const acid = ACIDS[acidId];
  const m = ACID_METALS[metal];
  const f = formatFormula;
  const salt = saltId(metal, m.charge, acid);
  const s = 2 / gcd(2, salt.y * acid.h);
  const metalCoef = s * salt.x;
  const acidCoef = s * salt.y;
  const h2Coef = (s * salt.y * acid.h) / 2;
  const insoluble = salt.id === "CaSO4";
  const name = saltName(metal, acid);
  const weakFactor = acid.weak ? 0.45 : 1;
  const vigor = Math.min(1, m.vigor * weakFactor);
  let type = vigor >= 0.9 ? "explosive" : "redox";
  let explanation = `${ELEMENT_BY_SYMBOL.get(metal).name} is above hydrogen in the activity series, so it displaces hydrogen from the acid. The metal atoms lose electrons (oxidized) and H⁺ ions gain electrons (reduced) to make hydrogen gas.`;
  if (acid.weak) explanation += " Acetic acid is a weak acid, so the fizzing is gentler.";
  if (m.slowStart) explanation += " Aluminum is protected by a thin oxide layer, so the reaction starts slowly.";
  if (insoluble) explanation += " Calcium sulfate is only slightly soluble and can coat the metal, slowing the reaction.";
  return {
    type,
    equation: `${coef(metalCoef)}${metal}(s) + ${coef(acidCoef)}${f(acidId)}(aq) → ${coef(s)}${f(salt.id)}(aq) + ${coef(h2Coef)}H₂(g)`,
    productNames: [name, "Hydrogen gas"],
    leaves: [salt.id],
    energy: "exothermic",
    vigor,
    visuals: {
      bubbles: vigor,
      dissolve: true,
      flame: vigor >= 0.9 ? m.flame : null,
      sparks: vigor >= 0.9,
      heat: Math.round(10 + vigor * 40),
      cloudy: insoluble,
    },
    explanation,
    note: m.danger
      ? "Alkali metals react with acids even more violently than with water."
      : "Metal + acid → salt + hydrogen is a classic single-replacement reaction.",
    danger: m.danger ? "Extremely dangerous in real life — never do this outside a supervised demonstration." : null,
    productInfo: {
      [salt.id]: { name, role: "salt", color: metal === "Fe" ? [150, 200, 140, 0.35] : undefined, cloudy: insoluble },
    },
  };
}

// -----------------------------------------------------------------------------
// Hand-written reactions
// -----------------------------------------------------------------------------

// Reactions that happen in water. Keys: [a, b] (order does not matter).
const WATER_REACTIONS = [
  // ---- Alkali metals + water ----
  [["Li", WATER], {
    type: "vigorous", vigor: 0.45, energy: "exothermic",
    equation: "2Li(s) + 2H₂O(l) → 2LiOH(aq) + H₂(g)",
    productNames: ["Lithium hydroxide", "Hydrogen gas"], leaves: ["LiOH"],
    visuals: { bubbles: 0.5, float: true, dissolve: true, heat: 15 },
    explanation: "Lithium floats and fizzes steadily. It loses its one valence electron to water, making a basic lithium hydroxide solution and hydrogen gas.",
    note: "Lithium is the least reactive alkali metal — reactivity increases down Group 1.",
    danger: "Alkali metals react with water and can burn skin. Only handled by teachers with safety equipment.",
  }],
  [["Na", WATER], {
    type: "vigorous", vigor: 0.75, energy: "exothermic",
    equation: "2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)",
    productNames: ["Sodium hydroxide", "Hydrogen gas"], leaves: ["NaOH"],
    visuals: { bubbles: 0.8, float: true, skate: true, dissolve: true, sparks: true, heat: 35 },
    explanation: "Sodium melts into a ball from the heat released and skates across the surface, fizzing. It forms sodium hydroxide (a strong base) and hydrogen gas.",
    note: "The hydrogen can ignite with an orange flame. Sodium is stored under oil to keep it away from water and air.",
    danger: "Never do this in real life without supervision — sodium can spit hot, caustic fragments.",
  }],
  [["K", WATER], {
    type: "explosive", vigor: 0.92, energy: "exothermic",
    equation: "2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g)",
    productNames: ["Potassium hydroxide", "Hydrogen gas"], leaves: ["KOH"],
    visuals: { bubbles: 1, float: true, skate: true, dissolve: true, flame: [200, 150, 255], sparks: true, heat: 55 },
    explanation: "Potassium reacts so fast that the hydrogen ignites immediately with a lilac flame. Its outer electron is further from the nucleus than sodium's, so it is lost more easily.",
    note: "The lilac flame color comes from potassium ions — the same color seen in a flame test.",
    danger: "Dangerous: the reaction can end with a small explosion. Never try this outside a supervised demonstration.",
  }],
  [["Rb", WATER], {
    type: "explosive", vigor: 0.97, energy: "exothermic",
    equation: "2Rb(s) + 2H₂O(l) → 2RbOH(aq) + H₂(g)",
    productNames: ["Rubidium hydroxide", "Hydrogen gas"], leaves: ["RbOH"],
    visuals: { bubbles: 1, float: false, dissolve: true, flame: [220, 80, 120], sparks: true, smoke: true, heat: 70 },
    explanation: "Rubidium is denser than water, so it sinks and reacts explosively. It is further down Group 1 than potassium, so it gives up its electron even more easily.",
    note: "Rubidium is rarely seen outside research labs.",
    danger: "Explosive with water — never attempted in schools.",
  }],
  [["Cs", WATER], {
    type: "explosive", vigor: 1, energy: "exothermic",
    equation: "2Cs(s) + 2H₂O(l) → 2CsOH(aq) + H₂(g)",
    productNames: ["Cesium hydroxide", "Hydrogen gas"], leaves: ["CsOH"],
    visuals: { bubbles: 1, float: false, dissolve: true, flame: [120, 140, 255], sparks: true, smoke: true, heat: 80 },
    explanation: "Cesium reacts almost instantly and explosively — it has the most loosely held outer electron of the stable alkali metals.",
    note: "Cesium is used in atomic clocks.",
    danger: "Violently explosive with water — never attempted in schools.",
  }],
  // ---- Alkaline earth metals + water ----
  [["Be", WATER], {
    type: "none", vigor: 0, energy: "none",
    equation: "Be(s) + H₂O(l) → no reaction",
    productNames: [], leaves: ["Be"],
    visuals: {},
    explanation: "Beryllium is protected by a tough oxide layer and does not react with water, even when hot.",
    note: "Beryllium compounds are toxic.",
  }],
  [["Mg", WATER], {
    type: "mild", vigor: 0.12, energy: "exothermic",
    equation: "Mg(s) + 2H₂O(l) → Mg(OH)₂(s) + H₂(g)",
    productNames: ["Magnesium hydroxide", "Hydrogen gas"], leaves: ["Mg", "Mg(OH)2"],
    visuals: { bubbles: 0.12, heat: 2, cloudy: true },
    explanation: "Magnesium reacts only very slowly with cold water — just a few tiny bubbles form on its surface. It reacts much faster with steam.",
    note: "Magnesium hydroxide is the 'milk of magnesia' antacid.",
  }],
  [["Ca", WATER], {
    type: "vigorous", vigor: 0.5, energy: "exothermic",
    equation: "Ca(s) + 2H₂O(l) → Ca(OH)₂(aq) + H₂(g)",
    productNames: ["Calcium hydroxide", "Hydrogen gas"], leaves: ["Ca(OH)2"],
    visuals: { bubbles: 0.6, dissolve: true, heat: 18, cloudy: true },
    explanation: "Calcium sinks and bubbles steadily. The solution turns cloudy because calcium hydroxide is only slightly soluble.",
    note: "Calcium hydroxide solution is 'limewater', used to test for carbon dioxide.",
  }],
  [["Sr", WATER], {
    type: "vigorous", vigor: 0.6, energy: "exothermic",
    equation: "Sr(s) + 2H₂O(l) → Sr(OH)₂(aq) + H₂(g)",
    productNames: ["Strontium hydroxide", "Hydrogen gas"], leaves: ["Sr(OH)2"],
    visuals: { bubbles: 0.7, dissolve: true, heat: 25 },
    explanation: "Strontium reacts more vigorously than calcium — reactivity increases down Group 2.",
    note: "Strontium salts give fireworks their red color.",
  }],
  [["Ba", WATER], {
    type: "vigorous", vigor: 0.7, energy: "exothermic",
    equation: "Ba(s) + 2H₂O(l) → Ba(OH)₂(aq) + H₂(g)",
    productNames: ["Barium hydroxide", "Hydrogen gas"], leaves: ["Ba(OH)2"],
    visuals: { bubbles: 0.8, dissolve: true, heat: 30 },
    explanation: "Barium is the most reactive of the common Group 2 metals, fizzing rapidly to form barium hydroxide.",
    note: "Soluble barium compounds are toxic.",
    danger: "Barium compounds are toxic — handled only with supervision.",
  }],
  // ---- Halogens + water ----
  [["F", WATER], {
    type: "explosive", vigor: 0.9, energy: "exothermic",
    equation: "2F₂(g) + 2H₂O(l) → 4HF(aq) + O₂(g)",
    productNames: ["Hydrofluoric acid", "Oxygen gas"], leaves: [],
    visuals: { bubbles: 0.7, flame: [255, 240, 170], smoke: true, heat: 40 },
    explanation: "Fluorine is the most electronegative element. It is so reactive that it pulls electrons from water, releasing oxygen gas and forming hydrofluoric acid.",
    note: "Fluorine is far too dangerous for school labs; fluoride compounds are used in toothpaste.",
    danger: "Fluorine gas is extremely toxic and corrosive — never handled outside specialist facilities.",
  }],
  [["Cl", WATER], {
    type: "mild", vigor: 0.15, energy: "exothermic",
    equation: "Cl₂(g) + H₂O(l) ⇌ HCl(aq) + HClO(aq)",
    productNames: ["Hydrochloric acid", "Hypochlorous acid"], leaves: ["Cl"],
    visuals: { heat: 1 },
    explanation: "Chlorine dissolves to give pale yellow-green 'chlorine water'. A little of it reacts to form HCl and HClO — an equilibrium, so most chlorine stays dissolved.",
    note: "Hypochlorous acid (HClO) is what kills bacteria in swimming pools.",
    danger: "Chlorine gas is toxic to breathe.",
  }],
  [["Br", WATER], {
    type: "mild", vigor: 0.08, energy: "none",
    equation: "Br₂(l) + H₂O(l) ⇌ HBr(aq) + HBrO(aq)",
    productNames: ["Bromine water"], leaves: ["Br"],
    visuals: {},
    explanation: "Bromine dissolves slightly to form orange 'bromine water'. Only a tiny amount reacts — bromine is less reactive than chlorine.",
    note: "Bromine water is used to test for C=C double bonds: it turns colorless.",
    danger: "Liquid bromine is toxic and causes severe burns.",
  }],
  [["I", WATER], {
    type: "none", vigor: 0, energy: "none",
    equation: "I₂(s) + H₂O(l) → barely dissolves",
    productNames: [], leaves: ["I"],
    visuals: {},
    explanation: "Iodine is the least reactive common halogen. It hardly dissolves in water, just tinting it pale brown.",
    note: "Iodine dissolves much better in potassium iodide solution or alcohol (tincture of iodine).",
  }],
  // ---- Single replacement: metal + salt solution ----
  [["Zn", "CuSO4"], {
    type: "redox", vigor: 0.3, energy: "exothermic",
    equation: "Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)",
    productNames: ["Zinc sulfate", "Copper"], leaves: ["ZnSO4", "Cu"],
    visuals: { coat: [180, 95, 60], heat: 8 },
    explanation: "Zinc is more reactive than copper, so it gives electrons to Cu²⁺ ions. Red-brown copper coats the zinc and the blue color fades.",
    note: "This electron transfer is the basis of the Daniell cell battery.",
  }],
  [["Fe", "CuSO4"], {
    type: "redox", vigor: 0.2, energy: "exothermic",
    equation: "Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)",
    productNames: ["Iron(II) sulfate", "Copper"], leaves: ["FeSO4", "Cu"],
    visuals: { coat: [180, 95, 60], heat: 5 },
    explanation: "Iron is above copper in the activity series. Copper metal plates onto the iron and the solution turns from blue to pale green.",
    note: "An iron nail in copper sulfate is a classic displacement demonstration.",
  }],
  [["Mg", "CuSO4"], {
    type: "redox", vigor: 0.45, energy: "exothermic",
    equation: "Mg(s) + CuSO₄(aq) → MgSO₄(aq) + Cu(s)",
    productNames: ["Magnesium sulfate", "Copper"], leaves: ["MgSO4", "Cu"],
    visuals: { coat: [180, 95, 60], bubbles: 0.15, heat: 15 },
    explanation: "Magnesium is much more reactive than copper, so it displaces copper quickly and the solution warms up noticeably as the blue color fades.",
    note: "The bigger the gap in the activity series, the faster and more exothermic the displacement.",
  }],
  [["Cu", "AgNO3"], {
    type: "redox", vigor: 0.2, energy: "exothermic",
    equation: "Cu(s) + 2AgNO₃(aq) → Cu(NO₃)₂(aq) + 2Ag(s)",
    productNames: ["Copper(II) nitrate", "Silver"], leaves: ["Cu(NO3)2", "Ag"],
    visuals: { coat: [215, 220, 228], heat: 3 },
    explanation: "Copper is more reactive than silver. Shiny silver crystals grow on the copper while the solution slowly turns blue from Cu²⁺ ions.",
    note: "This produces a 'silver tree' of crystals.",
  }],
  [["Cu", "ZnSO4"], {
    type: "none", vigor: 0, energy: "none",
    equation: "Cu(s) + ZnSO₄(aq) → no reaction",
    productNames: [], leaves: ["Cu", "ZnSO4"],
    visuals: {},
    explanation: "Copper is less reactive than zinc, so it cannot displace zinc ions from solution. A less reactive metal never displaces a more reactive one.",
    note: "Compare with zinc in copper sulfate, where the reaction does happen.",
  }],
  // ---- Double replacement: precipitates ----
  [["AgNO3", "NaCl"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)",
    productNames: ["Silver chloride (white precipitate)", "Sodium nitrate"], leaves: ["AgCl", "NaNO3"],
    visuals: { precipitate: [248, 248, 248, 1] },
    explanation: "Ag⁺ and Cl⁻ ions meet and form silver chloride, which is insoluble, so a white solid appears instantly. Na⁺ and NO₃⁻ stay dissolved as spectator ions.",
    note: "This is the standard test for chloride ions. Silver nitrate stains skin black.",
  }],
  [["AgNO3", "HCl"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "AgNO₃(aq) + HCl(aq) → AgCl(s) + HNO₃(aq)",
    productNames: ["Silver chloride (white precipitate)", "Nitric acid"], leaves: ["AgCl"],
    visuals: { precipitate: [248, 248, 248, 1] },
    explanation: "Chloride ions from the acid combine with silver ions to form a white silver chloride precipitate.",
    note: "Any source of Cl⁻ gives the same white precipitate with silver nitrate.",
  }],
  [["AgNO3", "KBr"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "AgNO₃(aq) + KBr(aq) → AgBr(s) + KNO₃(aq)",
    productNames: ["Silver bromide (cream precipitate)", "Potassium nitrate"], leaves: ["AgBr", "KNO3"],
    visuals: { precipitate: [240, 232, 200, 1] },
    explanation: "Silver ions and bromide ions form insoluble silver bromide — a cream-colored precipitate.",
    note: "Silver bromide darkens in light and was used in photographic film.",
  }],
  [["AgNO3", "KI"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "AgNO₃(aq) + KI(aq) → AgI(s) + KNO₃(aq)",
    productNames: ["Silver iodide (yellow precipitate)", "Potassium nitrate"], leaves: ["AgI", "KNO3"],
    visuals: { precipitate: [240, 225, 120, 1] },
    explanation: "Silver ions and iodide ions form pale yellow silver iodide. The color (white → cream → yellow) helps identify Cl⁻, Br⁻ and I⁻.",
    note: "Silver iodide is used for cloud seeding.",
  }],
  [["AgNO3", "NaOH"], {
    type: "precipitate", vigor: 0.25, energy: "exothermic",
    equation: "2AgNO₃(aq) + 2NaOH(aq) → Ag₂O(s) + 2NaNO₃(aq) + H₂O(l)",
    productNames: ["Silver(I) oxide (brown precipitate)", "Sodium nitrate", "Water"], leaves: ["Ag2O", "NaNO3"],
    visuals: { precipitate: [95, 70, 55, 1] },
    explanation: "Hydroxide ions react with silver ions to give a dark brown precipitate of silver oxide.",
    note: "Most metal ions form colored precipitates with hydroxide — useful for identifying them.",
  }],
  [["Pb(NO3)2", "KI"], {
    type: "precipitate", vigor: 0.35, energy: "exothermic",
    equation: "Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s) + 2KNO₃(aq)",
    productNames: ["Lead(II) iodide (bright yellow precipitate)", "Potassium nitrate"], leaves: ["PbI2", "KNO3"],
    visuals: { precipitate: [250, 205, 30, 1] },
    explanation: "Pb²⁺ and I⁻ ions form lead iodide, a brilliant yellow solid that swirls and settles.",
    note: "Known as the 'golden rain' demonstration.",
    danger: "Lead compounds are toxic — never handled without gloves and supervision.",
  }],
  [["BaCl2", "Na2SO4"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s) + 2NaCl(aq)",
    productNames: ["Barium sulfate (white precipitate)", "Sodium chloride"], leaves: ["BaSO4", "NaCl"],
    visuals: { precipitate: [250, 250, 250, 1] },
    explanation: "Ba²⁺ and SO₄²⁻ ions form barium sulfate, which is extremely insoluble, giving a thick white precipitate.",
    note: "This is the test for sulfate ions. Insoluble barium sulfate is safe enough to swallow for X-ray 'barium meals'.",
    danger: "Soluble barium chloride is toxic.",
  }],
  [["BaCl2", "H2SO4"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "BaCl₂(aq) + H₂SO₄(aq) → BaSO₄(s) + 2HCl(aq)",
    productNames: ["Barium sulfate (white precipitate)", "Hydrochloric acid"], leaves: ["BaSO4", "HCl"],
    visuals: { precipitate: [250, 250, 250, 1] },
    explanation: "Sulfate ions from the acid combine with barium ions to form insoluble white barium sulfate.",
    note: "Any source of SO₄²⁻ gives this precipitate with barium ions.",
    danger: "Soluble barium chloride is toxic.",
  }],
  [["CuSO4", "NaOH"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s) + Na₂SO₄(aq)",
    productNames: ["Copper(II) hydroxide (blue precipitate)", "Sodium sulfate"], leaves: ["Cu(OH)2", "Na2SO4"],
    visuals: { precipitate: [110, 170, 235, 1] },
    explanation: "Cu²⁺ ions combine with OH⁻ ions to form a pale blue, jelly-like precipitate of copper(II) hydroxide.",
    note: "A blue hydroxide precipitate identifies Cu²⁺ ions.",
  }],
  [["CuSO4", "KOH"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "CuSO₄(aq) + 2KOH(aq) → Cu(OH)₂(s) + K₂SO₄(aq)",
    productNames: ["Copper(II) hydroxide (blue precipitate)", "Potassium sulfate"], leaves: ["Cu(OH)2"],
    visuals: { precipitate: [110, 170, 235, 1] },
    explanation: "Cu²⁺ ions combine with OH⁻ ions to form a pale blue precipitate of copper(II) hydroxide.",
    note: "A blue hydroxide precipitate identifies Cu²⁺ ions.",
  }],
  [["FeCl3", "NaOH"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s) + 3NaCl(aq)",
    productNames: ["Iron(III) hydroxide (rust-brown precipitate)", "Sodium chloride"], leaves: ["Fe(OH)3", "NaCl"],
    visuals: { precipitate: [160, 80, 30, 1] },
    explanation: "Fe³⁺ ions combine with OH⁻ ions to form a rusty orange-brown precipitate of iron(III) hydroxide.",
    note: "A rust-brown hydroxide precipitate identifies Fe³⁺ ions.",
  }],
  [["FeCl3", "KOH"], {
    type: "precipitate", vigor: 0.3, energy: "exothermic",
    equation: "FeCl₃(aq) + 3KOH(aq) → Fe(OH)₃(s) + 3KCl(aq)",
    productNames: ["Iron(III) hydroxide (rust-brown precipitate)", "Potassium chloride"], leaves: ["Fe(OH)3", "KCl"],
    visuals: { precipitate: [160, 80, 30, 1] },
    explanation: "Fe³⁺ ions combine with OH⁻ ions to form a rusty orange-brown precipitate of iron(III) hydroxide.",
    note: "A rust-brown hydroxide precipitate identifies Fe³⁺ ions.",
  }],
  [["Ca(OH)2", "Na2CO3"], {
    type: "precipitate", vigor: 0.2, energy: "none",
    equation: "Ca(OH)₂(aq) + Na₂CO₃(aq) → CaCO₃(s) + 2NaOH(aq)",
    productNames: ["Calcium carbonate (white precipitate)", "Sodium hydroxide"], leaves: ["CaCO3", "NaOH"],
    visuals: { precipitate: [245, 245, 240, 1] },
    explanation: "Calcium ions and carbonate ions form insoluble calcium carbonate — chalk — which settles as a white solid.",
    note: "Limestone caves form when calcium carbonate slowly precipitates from water.",
  }],
  // ---- Acids + carbonates (gas evolution) ----
  [["HCl", "Na2CO3"], {
    type: "acid-base", vigor: 0.6, energy: "exothermic",
    equation: "2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + H₂O(l) + CO₂(g)",
    productNames: ["Sodium chloride", "Water", "Carbon dioxide gas"], leaves: ["NaCl"],
    visuals: { bubbles: 0.7, heat: 3 },
    explanation: "H⁺ ions react with carbonate ions to form carbonic acid, which immediately breaks down into water and carbon dioxide — the fizzing you see.",
    note: "Bubbling the gas through limewater turns it milky, proving it is CO₂.",
  }],
  [["H2SO4", "Na2CO3"], {
    type: "acid-base", vigor: 0.6, energy: "exothermic",
    equation: "H₂SO₄(aq) + Na₂CO₃(aq) → Na₂SO₄(aq) + H₂O(l) + CO₂(g)",
    productNames: ["Sodium sulfate", "Water", "Carbon dioxide gas"], leaves: ["Na2SO4"],
    visuals: { bubbles: 0.7, heat: 3 },
    explanation: "The acid reacts with carbonate ions to release carbon dioxide gas, leaving a solution of sodium sulfate.",
    note: "Acid + carbonate → salt + water + carbon dioxide.",
  }],
  [["HCl", "NaHCO3"], {
    type: "acid-base", vigor: 0.55, energy: "endothermic",
    equation: "HCl(aq) + NaHCO₃(aq) → NaCl(aq) + H₂O(l) + CO₂(g)",
    productNames: ["Sodium chloride", "Water", "Carbon dioxide gas"], leaves: ["NaCl"],
    visuals: { bubbles: 0.65, heat: -2 },
    explanation: "Hydrogen carbonate ions react with H⁺ to give carbon dioxide and water. This reaction actually absorbs a little heat.",
    note: "Baking soda neutralizes stomach acid in some antacid tablets.",
  }],
  [["CH3COOH", "NaHCO3"], {
    type: "acid-base", vigor: 0.7, energy: "endothermic",
    equation: "CH₃COOH(aq) + NaHCO₃(aq) → CH₃COONa(aq) + H₂O(l) + CO₂(g)",
    productNames: ["Sodium acetate", "Water", "Carbon dioxide gas"], leaves: [],
    visuals: { bubbles: 0.9, foam: true, heat: -3 },
    explanation: "Vinegar and baking soda produce lots of carbon dioxide foam. The mixture gets slightly colder because the reaction absorbs heat (endothermic).",
    note: "This is the classic 'volcano' science-fair reaction.",
  }],
  [["HCl", "CaCO3"], {
    type: "acid-base", vigor: 0.55, energy: "exothermic",
    equation: "2HCl(aq) + CaCO₃(s) → CaCl₂(aq) + H₂O(l) + CO₂(g)",
    productNames: ["Calcium chloride", "Water", "Carbon dioxide gas"], leaves: ["CaCl2"],
    visuals: { bubbles: 0.6, dissolve: true, heat: 3 },
    explanation: "The chalk fizzes and dissolves as the acid turns insoluble calcium carbonate into soluble calcium chloride and carbon dioxide.",
    note: "Acid rain slowly dissolves limestone and marble buildings the same way.",
  }],
  [["CH3COOH", "CaCO3"], {
    type: "acid-base", vigor: 0.25, energy: "exothermic",
    equation: "2CH₃COOH(aq) + CaCO₃(s) → Ca(CH₃COO)₂(aq) + H₂O(l) + CO₂(g)",
    productNames: ["Calcium acetate", "Water", "Carbon dioxide gas"], leaves: [],
    visuals: { bubbles: 0.3, dissolve: true, heat: 1 },
    explanation: "Vinegar is a weak acid, so the chalk fizzes gently and dissolves slowly.",
    note: "Vinegar removes limescale (calcium carbonate) from kettles.",
  }],
  // ---- Halogen displacement ----
  [["Cl", "KI"], {
    type: "redox", vigor: 0.25, energy: "exothermic",
    equation: "Cl₂(aq) + 2KI(aq) → 2KCl(aq) + I₂(aq)",
    productNames: ["Potassium chloride", "Iodine"], leaves: ["KCl", "I"],
    visuals: { colorTo: [150, 80, 30, 0.55] },
    explanation: "Chlorine is more reactive than iodine, so it takes electrons from iodide ions. The solution turns brown as iodine forms.",
    note: "A more reactive halogen displaces a less reactive one from its salts.",
  }],
  [["Cl", "KBr"], {
    type: "redox", vigor: 0.25, energy: "exothermic",
    equation: "Cl₂(aq) + 2KBr(aq) → 2KCl(aq) + Br₂(aq)",
    productNames: ["Potassium chloride", "Bromine"], leaves: ["KCl", "Br"],
    visuals: { colorTo: [230, 130, 40, 0.45] },
    explanation: "Chlorine is more reactive than bromine and displaces it from bromide ions, turning the solution orange.",
    note: "Reactivity decreases down Group 17: F > Cl > Br > I.",
  }],
  [["Br", "KI"], {
    type: "redox", vigor: 0.2, energy: "exothermic",
    equation: "Br₂(aq) + 2KI(aq) → 2KBr(aq) + I₂(aq)",
    productNames: ["Potassium bromide", "Iodine"], leaves: ["KBr", "I"],
    visuals: { colorTo: [150, 80, 30, 0.55] },
    explanation: "Bromine is more reactive than iodine, so it displaces iodine: the orange color turns brown.",
    note: "Reactivity decreases down Group 17: F > Cl > Br > I.",
  }],
  [["I", "KBr"], {
    type: "none", vigor: 0, energy: "none",
    equation: "I₂(aq) + KBr(aq) → no reaction",
    productNames: [], leaves: ["I", "KBr"],
    visuals: {},
    explanation: "Iodine is less reactive than bromine, so it cannot take electrons from bromide ions.",
    note: "A less reactive halogen never displaces a more reactive one.",
  }],
  [["I", "NaCl"], {
    type: "none", vigor: 0, energy: "none",
    equation: "I₂(aq) + NaCl(aq) → no reaction",
    productNames: [], leaves: ["I", "NaCl"],
    visuals: {},
    explanation: "Iodine is less reactive than chlorine, so it cannot displace chloride ions.",
    note: "A less reactive halogen never displaces a more reactive one.",
  }],
  [["Cl", "NaOH"], {
    type: "redox", vigor: 0.2, energy: "exothermic",
    equation: "Cl₂(aq) + 2NaOH(aq) → NaCl(aq) + NaClO(aq) + H₂O(l)",
    productNames: ["Sodium chloride", "Sodium hypochlorite (bleach)", "Water"], leaves: ["NaCl", "NaClO"],
    visuals: { colorTo: [120, 190, 255, 0.28], heat: 5 },
    explanation: "Chlorine reacts with cold sodium hydroxide: some chlorine atoms are reduced to Cl⁻ and others oxidized to ClO⁻, so the yellow-green color disappears.",
    note: "This is how household bleach is manufactured.",
    danger: "Never mix bleach with acids — it releases toxic chlorine gas.",
  }],
];

// Reactions between substances without water ("dry" bench). Conceptual only.
const DRY_REACTIONS = [
  [["Na", "Cl"], {
    type: "explosive", vigor: 0.9, energy: "exothermic",
    equation: "2Na(s) + Cl₂(g) → 2NaCl(s)",
    productNames: ["Sodium chloride (table salt)"], leaves: ["NaCl"],
    visuals: { flame: [255, 200, 60], sparks: true, smoke: true, productColor: [250, 250, 250, 1], heat: 60 },
    explanation: "Sodium gives its valence electron to chlorine. The resulting Na⁺ and Cl⁻ ions attract strongly, releasing a lot of energy as a bright yellow flame and white smoke of salt.",
    note: "Two dangerous elements combine into harmless table salt — a great example of how compounds differ from their elements.",
    danger: "Both reactants are hazardous — never attempted outside a supervised demonstration.",
  }],
  [["K", "Cl"], {
    type: "explosive", vigor: 0.95, energy: "exothermic",
    equation: "2K(s) + Cl₂(g) → 2KCl(s)",
    productNames: ["Potassium chloride"], leaves: ["KCl"],
    visuals: { flame: [200, 150, 255], sparks: true, smoke: true, productColor: [250, 250, 250, 1], heat: 70 },
    explanation: "Potassium loses its outer electron even more easily than sodium, so it reacts with chlorine more violently, forming ionic potassium chloride.",
    note: "Potassium chloride is used as a salt substitute.",
    danger: "Violent reaction — never attempted outside specialist demonstrations.",
  }],
  [["Fe", "Cl"], {
    type: "redox", vigor: 0.6, energy: "exothermic",
    equation: "2Fe(s) + 3Cl₂(g) → 2FeCl₃(s)",
    productNames: ["Iron(III) chloride"], leaves: ["FeCl3"],
    visuals: { flame: [255, 150, 60], smoke: true, productColor: [150, 90, 40, 1], heat: 40 },
    explanation: "Hot iron glows in chlorine and forms brown iron(III) chloride. Chlorine is a strong oxidizer, taking iron to the +3 state.",
    note: "Chlorine oxidizes iron to Fe³⁺ rather than Fe²⁺.",
    danger: "Chlorine gas is toxic.",
  }],
  [["Mg", "O"], {
    type: "redox", vigor: 0.75, energy: "exothermic",
    equation: "2Mg(s) + O₂(g) → 2MgO(s)",
    productNames: ["Magnesium oxide (white powder)"], leaves: [],
    visuals: { flame: [255, 255, 255], sparks: true, smoke: true, productColor: [250, 250, 250, 1], heat: 60 },
    explanation: "Once lit, magnesium burns with a dazzling white flame, combining with oxygen to form white magnesium oxide ash.",
    note: "Burning magnesium was used in early camera flashes and is used in flares.",
    danger: "Never look directly at burning magnesium — the light can damage your eyes.",
  }],
  [["Na", "O"], {
    type: "redox", vigor: 0.5, energy: "exothermic",
    equation: "4Na(s) + O₂(g) → 2Na₂O(s)",
    productNames: ["Sodium oxide"], leaves: [],
    visuals: { flame: [255, 190, 60], smoke: true, productColor: [240, 240, 235, 1], heat: 35 },
    explanation: "Freshly cut sodium tarnishes in air within seconds; when heated it burns with an orange-yellow flame to form sodium oxide.",
    note: "This is why sodium is stored under oil.",
    danger: "Burning sodium cannot be put out with water.",
  }],
  [["Fe", "S"], {
    type: "redox", vigor: 0.45, energy: "exothermic",
    equation: "Fe(s) + S(s) → FeS(s)",
    productNames: ["Iron(II) sulfide"], leaves: [],
    visuals: { flame: [255, 120, 40], productColor: [55, 50, 45, 1], heat: 30 },
    explanation: "Once started with heat, the mixture glows red as iron and sulfur combine into black iron(II) sulfide — a new compound that is no longer magnetic.",
    note: "Shows the difference between a mixture (can separate iron with a magnet) and a compound (cannot).",
  }],
  [["Zn", "S"], {
    type: "vigorous", vigor: 0.7, energy: "exothermic",
    equation: "Zn(s) + S(s) → ZnS(s)",
    productNames: ["Zinc sulfide"], leaves: [],
    visuals: { flame: [140, 220, 255], smoke: true, sparks: true, productColor: [245, 245, 230, 1], heat: 45 },
    explanation: "When ignited, zinc and sulfur react in a rapid flash, forming white zinc sulfide and a cloud of smoke.",
    note: "Zinc sulfide glows under UV light and is used in luminous paints.",
    danger: "Produces fumes — only done by teachers in a fume cupboard.",
  }],
  [["C", "O"], {
    type: "redox", vigor: 0.4, energy: "exothermic",
    equation: "C(s) + O₂(g) → CO₂(g)",
    productNames: ["Carbon dioxide gas"], leaves: [],
    visuals: { flame: [255, 140, 50], smoke: true, dissolve: true, heat: 25 },
    explanation: "Carbon (like charcoal) glows and burns in oxygen to form carbon dioxide gas — combustion.",
    note: "Burning fossil fuels releases CO₂, a greenhouse gas.",
  }],
  [["S", "O"], {
    type: "redox", vigor: 0.4, energy: "exothermic",
    equation: "S(s) + O₂(g) → SO₂(g)",
    productNames: ["Sulfur dioxide gas"], leaves: [],
    visuals: { flame: [110, 140, 255], smoke: true, dissolve: true, heat: 25 },
    explanation: "Sulfur burns with a pale blue flame, forming choking sulfur dioxide gas.",
    note: "Sulfur dioxide from burning fuels causes acid rain.",
    danger: "Sulfur dioxide is toxic to breathe.",
  }],
  [["H", "O"], {
    type: "explosive", vigor: 0.95, energy: "exothermic",
    equation: "2H₂(g) + O₂(g) → 2H₂O(l)",
    productNames: ["Water"], leaves: [],
    visuals: { flame: [255, 220, 150], sparks: true, heat: 50 },
    explanation: "Hydrogen and oxygen do nothing until ignited — then they combine explosively to form water. The 'squeaky pop' test for hydrogen is a tiny version of this.",
    note: "This reaction powers hydrogen fuel cells (slowly and safely) and rocket engines.",
    danger: "Hydrogen-oxygen mixtures are explosive. Never attempt this.",
  }],
  [["H", "Cl"], {
    type: "explosive", vigor: 0.9, energy: "exothermic",
    equation: "H₂(g) + Cl₂(g) → 2HCl(g)",
    productNames: ["Hydrogen chloride gas"], leaves: [],
    visuals: { flame: [255, 240, 200], sparks: true, smoke: true, heat: 45 },
    explanation: "A mixture of hydrogen and chlorine can explode when exposed to bright light, forming hydrogen chloride gas (which dissolves in water to make hydrochloric acid).",
    note: "Industrially, hydrogen is burned in chlorine in a controlled way to make HCl.",
    danger: "Explosive and toxic. Never attempt this.",
  }],
  [["Cu", "O"], {
    type: "mild", vigor: 0.15, energy: "exothermic",
    equation: "2Cu(s) + O₂(g) → 2CuO(s)",
    productNames: ["Copper(II) oxide (black)"], leaves: [],
    visuals: { coat: [40, 35, 35], heat: 10 },
    explanation: "Copper doesn't burn, but when heated in air its surface slowly turns black as copper(II) oxide forms.",
    note: "Copper roofs turn green over years as the metal slowly reacts with air, water and CO₂.",
  }],
];

// -----------------------------------------------------------------------------
// Lookup tables
// -----------------------------------------------------------------------------

const pairKey = (a, b) => [a, b].sort().join("|");

const waterTable = new Map();
const dryTable = new Map();

WATER_REACTIONS.forEach(([pair, r]) => waterTable.set(pairKey(...pair), { reactants: pair, ...r }));
DRY_REACTIONS.forEach(([pair, r]) => dryTable.set(pairKey(...pair), { reactants: pair, ...r }));

// Generated: acid + base neutralizations
Object.keys(ACIDS).forEach((acidId) => {
  [...Object.keys(BASES), "NH3"].forEach((baseId) => {
    const key = pairKey(acidId, baseId);
    if (!waterTable.has(key)) waterTable.set(key, { reactants: [acidId, baseId], ...neutralization(acidId, baseId) });
  });
});

// Generated: metal + acid single replacement
Object.keys(ACID_METALS).forEach((metal) => {
  Object.keys(ACIDS).forEach((acidId) => {
    const key = pairKey(metal, acidId);
    if (!waterTable.has(key)) waterTable.set(key, { reactants: [metal, acidId], ...metalAcid(metal, acidId) });
  });
});

// Compounds dissolving in water (physical change, not a reaction)
const DISSOLVE_NOTES = {
  HCl: { heat: 4, energy: "exothermic", text: "Hydrogen chloride ionizes completely in water to form H₃O⁺ and Cl⁻ — a strong acid.", note: "Your stomach makes hydrochloric acid to digest food." },
  H2SO4: { heat: 10, energy: "exothermic", text: "Sulfuric acid releases a lot of heat as it mixes with water, forming H₃O⁺ and SO₄²⁻ ions.", note: "Always add acid to water, never water to acid.", danger: "Concentrated sulfuric acid causes severe burns." },
  CH3COOH: { heat: 0, energy: "none", text: "Acetic acid is a weak acid — only a small fraction of its molecules release H⁺ ions.", note: "Vinegar is about 5% acetic acid." },
  NaOH: { heat: 10, energy: "exothermic", text: "Sodium hydroxide dissolves into Na⁺ and OH⁻ ions, releasing heat. The solution is strongly basic.", note: "Used in soap making and drain cleaners.", danger: "Sodium hydroxide is corrosive to skin and eyes." },
  KOH: { heat: 10, energy: "exothermic", text: "Potassium hydroxide dissolves into K⁺ and OH⁻ ions, releasing heat — a strong base.", note: "Used in alkaline batteries.", danger: "Potassium hydroxide is corrosive." },
  "Ca(OH)2": { heat: 1, energy: "none", text: "Calcium hydroxide is only slightly soluble, so the water turns cloudy. The dissolved part makes limewater, a basic solution.", note: "Limewater turns milky with carbon dioxide." },
  NH3: { heat: 2, energy: "exothermic", text: "Ammonia reacts slightly with water to form NH₄⁺ and OH⁻ ions, making a weakly basic solution.", note: "Household glass cleaners often contain ammonia.", danger: "Ammonia fumes irritate the eyes and lungs." },
  CuSO4: { heat: 1, energy: "none", text: "Copper(II) sulfate dissolves to give a blue solution — the color comes from hydrated Cu²⁺ ions." , note: "Transition metal ions often form colored solutions.", danger: "Copper sulfate is harmful if swallowed." },
  FeCl3: { heat: 2, energy: "exothermic", text: "Iron(III) chloride dissolves to give a yellow-brown solution of Fe³⁺ ions.", note: "Used to etch copper circuit boards." },
  NH4Cl: { heat: -6, energy: "endothermic", text: "Ammonium chloride absorbs heat as it dissolves, so the water gets colder — an endothermic process.", note: "Instant cold packs use endothermic dissolving." },
  AgNO3: { heat: 0, energy: "none", text: "Silver nitrate dissolves into Ag⁺ and NO₃⁻ ions, giving a colorless solution.", note: "Used to test for halide ions.", danger: "Stains skin and is corrosive." },
  "Pb(NO3)2": { heat: 0, energy: "none", text: "Lead(II) nitrate dissolves to give a colorless solution of Pb²⁺ ions.", note: "Lead compounds are no longer used in paint because they are toxic.", danger: "Lead compounds are toxic." },
  BaCl2: { heat: 0, energy: "none", text: "Barium chloride dissolves into Ba²⁺ and Cl⁻ ions.", note: "Used to test for sulfate ions.", danger: "Soluble barium compounds are toxic." },
  NaHCO3: { heat: -1, energy: "endothermic", text: "Baking soda dissolves to form a weakly basic solution.", note: "Used in baking to release CO₂ and make dough rise." },
};

function dissolveEntry(sub) {
  const info = DISSOLVE_NOTES[sub.id] || {};
  if (sub.insoluble) {
    return {
      reactants: [sub.id, WATER], type: "none", vigor: 0, energy: "none",
      equation: `${formatFormula(sub.id)}(s) + H₂O(l) → does not dissolve`,
      productNames: [], leaves: [sub.id],
      visuals: {},
      explanation: `${sub.name} is insoluble in water, so it just sinks to the bottom.`,
      note: "Insoluble does not mean unreactive — try adding an acid.",
    };
  }
  return {
    reactants: [sub.id, WATER], type: "dissolves", vigor: 0.05, energy: info.energy || "none",
    equation: `${formatFormula(sub.id)} + H₂O(l) → ${formatFormula(sub.id)}(aq)`,
    productNames: [`${sub.name} solution`], leaves: [sub.id],
    visuals: { heat: info.heat || 0, cloudy: sub.cloudy },
    explanation: info.text || `${sub.name} dissolves, splitting into its ions. This is a physical change — no new substance is made.`,
    note: info.note || "Ionic compounds dissolve by separating into positive and negative ions.",
    danger: info.danger || null,
  };
}

// -----------------------------------------------------------------------------
// Substances
// -----------------------------------------------------------------------------

const compoundRegistry = new Map();
[...COMPOUNDS, ...PRODUCT_COMPOUNDS].forEach((c) => compoundRegistry.set(c.id, { kind: "compound", ...c }));

/** Substance record for an element symbol or compound id (null if unknown) */
export function getSubstance(id) {
  if (compoundRegistry.has(id)) {
    const c = compoundRegistry.get(id);
    return { ...c, formula: formatFormula(c.id) };
  }
  const info = getElementInfo(id);
  if (!info) {
    // Unlisted product formula (e.g. from a generated reaction): show it by formula
    return /^[A-Z(]/.test(id) ? { kind: "compound", id, name: formatFormula(id), role: "salt", formula: formatFormula(id) } : null;
  }
  const look = ELEMENT_LOOK[id] || {};
  const phase = (info.phase || "").toLowerCase();
  return {
    kind: "element",
    id,
    name: info.name,
    formula: formatFormula(DIATOMIC[id] || id),
    category: info.category,
    form: look.form || (phase.includes("gas") ? "gas" : phase.includes("liquid") ? "liquid" : "chip"),
    solidColor: look.color || [176, 181, 188, 1],
    color: look.solution || null,
    info,
  };
}

export const PALETTE_COMPOUNDS = COMPOUNDS.map((c) => getSubstance(c.id));

/** Register product compounds created by generated reactions so they can chain */
function registerProducts(reaction) {
  Object.entries(reaction.productInfo || {}).forEach(([id, info]) => {
    if (!compoundRegistry.has(id)) {
      compoundRegistry.set(id, { kind: "compound", id, ...Object.fromEntries(Object.entries(info).filter(([, v]) => v !== undefined)) });
    }
  });
}

// -----------------------------------------------------------------------------
// Rule-based fallback (never invents a reaction)
// -----------------------------------------------------------------------------

const ACTIVITY_SERIES = ["K", "Na", "Li", "Ba", "Sr", "Ca", "Mg", "Al", "Mn", "Zn", "Cr", "Fe", "Cd", "Co", "Ni", "Sn", "Pb", "H", "Cu", "Hg", "Ag", "Pt", "Au"];
const RADIOACTIVE = new Set(["Tc", "Pm"]);

function isMetal(category) {
  return /metal|lanthanide|actinide/i.test(category || "") && !/metalloid|nonmetal/i.test(category || "");
}

function elementFacts(sub) {
  if (sub?.kind !== "element") return null;
  const { info } = sub;
  const parts = [info.category];
  if (info.electronegativity != null) parts.push(`electronegativity ${info.electronegativity}`);
  if (info.oxidationStates.length) parts.push(`common oxidation states ${info.oxidationStates.join(", ")}`);
  return `${info.name} (${info.symbol}): ${parts.join(" · ")}`;
}

/** Metal symbol contained in a salt id, e.g. "CuSO4" -> "Cu" */
function saltMetal(id) {
  const m = /^([A-Z][a-z]?)/.exec(id);
  return m && ACTIVITY_SERIES.includes(m[1]) && m[1] !== "H" ? m[1] : null;
}

function fallbackReason(sub, partner, medium) {
  const info = sub.kind === "element" ? sub.info : null;
  if (info?.category === "Noble Gas") {
    return `${info.name} is a noble gas with a full outer electron shell (oxidation state 0), so it has no tendency to gain, lose or share electrons.`;
  }
  if (info && (info.number > 83 || RADIOACTIVE.has(info.symbol) || info.category === "Unknown")) {
    return `${info.name} is radioactive and too rare/unstable to study this way, so its reactions are not simulated.`;
  }
  if (!partner) {
    if (medium === "dry") return "A single substance on its own has nothing to react with. Add a second substance.";
    if (info && isMetal(info.category)) {
      const idx = ACTIVITY_SERIES.indexOf(info.symbol);
      const hIdx = ACTIVITY_SERIES.indexOf("H");
      if (idx > hIdx) return `${info.name} is below hydrogen in the activity series, so it cannot displace hydrogen from water.`;
      if (idx !== -1) return `${info.name} is above hydrogen in the activity series, but it reacts far too slowly with cold water to see (often protected by an oxide layer).`;
      if (info.category === "Lanthanide" || info.category === "Actinide") return `${info.name} is not in the reaction database, so no reaction is shown.`;
      return `${info.name} is a fairly unreactive metal and shows no visible reaction with cold water.`;
    }
    if (info) return `${info.name} (${info.category.toLowerCase()}) does not react visibly with water.`;
    return "No visible reaction.";
  }

  const pInfo = partner.kind === "element" ? partner.info : null;
  if (pInfo?.category === "Noble Gas") return fallbackReason(partner, null, medium);

  if (medium === "dry" && (sub.kind === "compound" || partner.kind === "compound")) {
    return "Ionic compounds react as dissolved ions. As dry solids they don't mix well enough to react — try with water on.";
  }

  const metalEl = [sub, partner].find((s) => s.kind === "element" && isMetal(s.info.category));
  const other = metalEl === sub ? partner : sub;
  if (medium === "water" && metalEl && other.kind === "compound") {
    const metal = metalEl.info.symbol;
    const mIdx = ACTIVITY_SERIES.indexOf(metal);
    if (ACIDS[other.id] && mIdx > ACTIVITY_SERIES.indexOf("H")) {
      return `${metalEl.info.name} is below hydrogen in the activity series, so it cannot displace hydrogen from ${other.name.toLowerCase()}.`;
    }
    const saltM = saltMetal(other.id);
    if (saltM && mIdx !== -1 && ACTIVITY_SERIES.indexOf(saltM) < mIdx) {
      return `${metalEl.info.name} is less reactive than ${getElementInfo(saltM).name.toLowerCase()}, so it cannot displace it from ${other.formula}.`;
    }
  }

  if (medium === "water" && sub.kind === "compound" && partner.kind === "compound") {
    return "When two ionic solutions mix, a reaction only happens if a precipitate, a gas, or water forms. None is expected here, so all the ions just stay dissolved.";
  }
  return "This combination is not in the reaction database, so no reaction is shown rather than guessing.";
}

function fallbackResult(sub, partner, medium) {
  const names = [sub, partner].filter(Boolean);
  return {
    reactants: names.map((s) => s.id),
    type: "none",
    vigor: 0,
    energy: "none",
    equation: `${names.map((s) => s.formula).join(" + ")}${!partner && medium === "water" ? " + H₂O" : ""} → no visible reaction`,
    productNames: [],
    leaves: [sub.id],
    visuals: {},
    explanation: fallbackReason(sub, partner, medium),
    note: null,
    facts: names.map(elementFacts).filter(Boolean),
    fallback: true,
  };
}

// -----------------------------------------------------------------------------
// Public resolver
// -----------------------------------------------------------------------------

/**
 * Decide what happens when `addedId` goes into a beaker.
 * @param {string} addedId substance id
 * @param {string[]} contents ids already in the beaker (newest last)
 * @param {"water"|"dry"} medium
 * @returns reaction result with `partner` (id or null) and `consumed` (ids removed)
 */
export function resolveAddition(addedId, contents, medium) {
  const sub = getSubstance(addedId);
  if (!sub) return null;
  const table = medium === "water" ? waterTable : dryTable;
  const others = [...contents].reverse().filter((id) => id !== addedId);

  for (const otherId of others) {
    const r = table.get(pairKey(addedId, otherId));
    if (r) {
      registerProducts(r);
      return { ...r, partner: otherId, consumed: r.type === "none" ? [] : [addedId, otherId], added: addedId };
    }
  }

  if (medium === "water") {
    const own = waterTable.get(pairKey(addedId, WATER)) || (sub.kind === "compound" ? dissolveEntry(sub) : null);
    if (own && own.type !== "none" && own.type !== "dissolves") {
      registerProducts(own);
      return { ...own, partner: WATER, consumed: [addedId], added: addedId };
    }
    if (others.length && (!own || own.type === "none")) {
      // Sits unreacted: explain the pairing with what's already in the beaker first
      const last = getSubstance(others[0]);
      const result = { ...fallbackResult(sub, last, medium), partner: last.id, consumed: [], added: addedId };
      const waterNote = own ? own.explanation : fallbackReason(sub, null, medium);
      result.withOthers = `With water alone: ${waterNote}`;
      return result;
    }
    const base = own || fallbackResult(sub, null, medium);
    const result = { ...base, partner: WATER, consumed: base.type === "none" ? [] : [addedId], added: addedId };
    if (others.length) {
      // Explain why nothing happened with what's already in the beaker
      const last = getSubstance(others[0]);
      result.withOthers = `No reaction with ${last.formula}: ${fallbackReason(sub, last, medium)}`;
      result.facts = [...new Set([...(result.facts || []), elementFacts(sub), elementFacts(last)].filter(Boolean))];
    } else if (!result.facts) {
      result.facts = [elementFacts(sub)].filter(Boolean);
    }
    return result;
  }

  const partner = others.length ? getSubstance(others[0]) : null;
  return { ...fallbackResult(sub, partner, medium), partner: partner?.id || null, consumed: [], added: addedId };
}

/**
 * After a reaction, products may react with what's left (e.g. Na → NaOH, then NaOH + HCl).
 * Returns the follow-up reaction or null.
 */
export function resolveFollowUp(newId, contents, medium) {
  if (medium !== "water") return null;
  for (const otherId of [...contents].reverse()) {
    if (otherId === newId) continue;
    const r = waterTable.get(pairKey(newId, otherId));
    if (r && r.type !== "none") {
      registerProducts(r);
      return { ...r, partner: otherId, consumed: [newId, otherId], added: newId, followUp: true };
    }
  }
  return null;
}

/** Ion id (ionsData) -> substance to preload in the Mixing Lab */
export const ION_TO_SUBSTANCE = {
  h_plus: "HCl", li_plus: "Li", na_plus: "Na", k_plus: "K", ag_plus: "AgNO3",
  mg_2plus: "Mg", ca_2plus: "Ca", ba_2plus: "BaCl2", zn_2plus: "Zn", al_3plus: "Al",
  f_minus: "F", cl_minus: "NaCl", br_minus: "KBr", i_minus: "KI",
  co3_2minus: "Na2CO3", so4_2minus: "Na2SO4", cu_2plus: "CuSO4", cu_plus: "Cu",
  fe_2plus: "Fe", fe_3plus: "FeCl3", pb_2plus: "Pb(NO3)2", nh4_plus: "NH4Cl",
  oh_minus: "NaOH", hco3_minus: "NaHCO3", hso4_minus: "H2SO4", ch3coo_minus: "CH3COOH",
};
