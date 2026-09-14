// Virtual Lab equipment catalogue.
// Each icon is inner SVG markup for a 64x64 viewBox. Shapes default to
// stroke="currentColor" fill="none"; the classes below (defined in the Virtual
// Lab styles) add fills: glass, liq, metal, wood, ceramic, flame, flame-in,
// red, screen, rubber, cloth, litmus-red, litmus-blue.

export const LAB_EQUIPMENT_GROUPS = [
  {
    group: "Glassware",
    items: [
      {
        id: "test-tube",
        name: "Test tube",
        use: "Small reactions, heating samples",
        svg: '<path class="glass" d="M28 6v44a4 4 0 0 0 8 0V6"/><path class="liq" d="M29 34h6v16a3 3 0 0 1-6 0z"/><path d="M25 6h14"/>',
      },
      {
        id: "beaker",
        name: "Beaker",
        use: "Mixing, heating, holding liquids",
        svg: '<path class="glass" d="M16 10v42a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4V10z"/><path class="liq" d="M17 32h30v20a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3z"/><path d="M12 10h40M20 18h6M20 26h6M20 34h6"/>',
      },
      {
        id: "conical-flask",
        name: "Conical (Erlenmeyer) flask",
        use: "Titrations, swirling mixtures",
        svg: '<path class="glass" d="M28 6v18L12 54a3 3 0 0 0 3 4h34a3 3 0 0 0 3-4L36 24V6z"/><path class="liq" d="M19 42h26l6 12a2 2 0 0 1-2 3H15a2 2 0 0 1-2-3z"/><path d="M25 6h14"/>',
      },
      {
        id: "round-bottom-flask",
        name: "Round-bottom flask",
        use: "Heating / distillation setups",
        svg: '<path class="glass" d="M28 6v19M36 6v19"/><circle class="glass" cx="32" cy="40" r="16"/><path class="liq" d="M17 40h30a15 15 0 0 1-30 0z"/><path d="M25 6h14"/>',
      },
      {
        id: "volumetric-flask",
        name: "Volumetric flask",
        use: "Preparing solutions of exact concentration",
        svg: '<path class="glass" d="M29 4v26C14 34 12 58 22 60h20c10-2 8-26-7-30V4z"/><path class="liq" d="M16 46h32c1 7-1 13-6 14H22c-5-1-7-7-6-14z"/><path d="M26 4h12M28 14h8"/>',
      },
      {
        id: "measuring-cylinder",
        name: "Measuring cylinder",
        use: "Measuring liquid volume",
        svg: '<path class="glass" d="M22 8v46h20V8z"/><rect class="liq" x="23" y="28" width="18" height="26"/><path d="M18 8h8M14 58h36M22 16h6M22 22h4M22 28h6M22 34h4M22 40h6M22 46h4"/>',
      },
      {
        id: "burette",
        name: "Burette",
        use: "Titration (precise liquid delivery)",
        svg: '<path class="glass" d="M29 4v44h6V4z"/><rect class="liq" x="30" y="18" width="4" height="30"/><path d="M35 10h3M35 18h3M35 26h3M35 34h3M35 42h3M24 48h16M32 48v6M30 54h4l-1 6h-2z"/>',
      },
      {
        id: "pipette",
        name: "Pipette",
        use: "Transferring exact liquid volumes",
        svg: '<path class="glass" d="M30 4v15M34 4v15"/><ellipse class="glass" cx="32" cy="29" rx="7" ry="10"/><path class="glass" d="M30 39v19l2 4 2-4V39"/><path class="liq" d="M25.5 31h13a7 8 0 0 1-13 0z"/><path d="M28 12h8"/>',
      },
      {
        id: "watch-glass",
        name: "Watch glass",
        use: "Evaporation, covering beakers",
        svg: '<path class="glass" d="M6 28q26 26 52 0q-26 10-52 0z"/><path class="liq" d="M20 36q12 6 24 0q-12 3-24 0z"/>',
      },
      {
        id: "petri-dish",
        name: "Petri dish",
        use: "Small samples, crystallization",
        svg: '<path class="glass" d="M8 34v6c0 4 11 8 24 8s24-4 24-8v-6"/><ellipse class="glass" cx="32" cy="34" rx="24" ry="8"/><path class="liq" d="M22 34l3-4 3 4-3 3zM34 36l2-3 3 3-2 2zM38 31l2-2 2 2-2 2z"/>',
      },
      {
        id: "funnel",
        name: "Funnel",
        use: "Filtration, transferring liquids",
        svg: '<path class="glass" d="M8 12h48L36 36v22h-8V36z"/><path class="liq" d="M14 17h36L36 30h-8z"/>',
      },
      {
        id: "test-tube-rack",
        name: "Test tube rack / stand",
        use: "Holding test tubes",
        svg: '<path class="glass" d="M16 10v36a3 3 0 0 0 6 0V10zM29 10v36a3 3 0 0 0 6 0V10zM42 10v36a3 3 0 0 0 6 0V10z"/><path class="liq" d="M30 32h4v14a2 2 0 0 1-4 0z"/><rect class="wood" x="8" y="24" width="48" height="6" rx="1"/><rect class="wood" x="8" y="52" width="48" height="6" rx="1"/><path d="M11 30v22M53 30v22"/>',
      },
    ],
  },
  {
    group: "Heating Equipment",
    items: [
      {
        id: "bunsen-burner",
        name: "Bunsen burner",
        use: "Main heat source",
        svg: '<path class="flame" d="M32 4c6 8 7 13 4 18h-8c-3-5-2-10 4-18z"/><path class="flame-in" d="M32 12c3 4 3 7 2 10h-4c-1-3-1-6 2-10z"/><rect class="metal" x="28" y="22" width="8" height="30"/><rect class="metal" x="26" y="40" width="12" height="4"/><path class="metal" d="M16 58h32l-4-6H20z"/><path d="M28 48H14"/>',
      },
      {
        id: "spirit-lamp",
        name: "Spirit lamp",
        use: "Alternative heat source",
        svg: '<path class="flame" d="M32 6c5 6 5 11 2 14h-4c-3-3-3-8 2-14z"/><path d="M32 20v8"/><rect class="metal" x="27" y="28" width="10" height="8"/><path class="glass" d="M20 36h24l6 18c1 3 0 4-2 4H16c-2 0-3-1-2-4z"/><path class="liq" d="M17 46h30l3 8c0 2-1 3-2 3H16c-1 0-2-1-2-3z"/>',
      },
      {
        id: "tripod-stand",
        name: "Tripod stand",
        use: "Supports containers over flame",
        svg: '<rect class="metal" x="8" y="16" width="48" height="5" rx="2"/><path d="M14 21L8 60M32 21v39M50 21l6 39" stroke-width="3"/>',
      },
      {
        id: "wire-gauze",
        name: "Wire gauze",
        use: "Spreads heat evenly, placed on tripod",
        svg: '<rect class="metal" x="8" y="8" width="48" height="48" rx="2"/><path d="M8 20h48M8 32h48M8 44h48M20 8v48M32 8v48M44 8v48" stroke-width="1"/><circle class="ceramic" cx="32" cy="32" r="11"/>',
      },
      {
        id: "water-bath",
        name: "Water bath",
        use: "Gentle, indirect heating",
        svg: '<path d="M22 16q3-3 0-6t0-6M32 16q3-3 0-6t0-6M42 16q3-3 0-6t0-6"/><rect class="metal" x="8" y="20" width="48" height="32" rx="3"/><rect class="liq" x="12" y="24" width="40" height="12" rx="1"/><circle cx="16" cy="45" r="2.5"/><rect class="screen" x="34" y="41" width="16" height="7" rx="1"/><path d="M12 52v6M52 52v6"/>',
      },
    ],
  },
  {
    group: "Measuring & Support Tools",
    items: [
      {
        id: "thermometer",
        name: "Thermometer",
        use: "Temperature measurement",
        svg: '<rect class="glass" x="29" y="4" width="6" height="46" rx="3"/><rect class="red" x="31" y="22" width="2" height="30"/><circle class="red" cx="32" cy="54" r="6"/><path d="M35 12h4M35 20h3M35 28h4M35 36h3M35 44h4"/>',
      },
      {
        id: "weighing-balance",
        name: "Weighing balance",
        use: "Measuring mass of solids",
        svg: '<rect class="metal" x="14" y="26" width="36" height="4" rx="2"/><path d="M32 30v10"/><rect class="metal" x="8" y="40" width="48" height="18" rx="3"/><rect class="screen" x="15" y="45" width="22" height="8" rx="1"/><circle cx="46" cy="49" r="2.5"/>',
      },
      {
        id: "clamp-stand",
        name: "Clamp stand (retort stand)",
        use: "Holding apparatus in place with clamps/rings",
        svg: '<rect class="metal" x="6" y="54" width="46" height="6" rx="1"/><rect class="metal" x="14" y="4" width="4" height="50"/><rect class="metal" x="12" y="16" width="8" height="6"/><path d="M20 19h22M42 13v12M49 13v12M42 13h7M42 25h7"/><rect class="metal" x="12" y="34" width="8" height="5"/><path d="M20 36h14"/><ellipse cx="44" cy="36" rx="10" ry="3"/>',
      },
      {
        id: "test-tube-holder",
        name: "Test tube holder / tongs",
        use: "Handling hot test tubes",
        svg: '<path class="wood" d="M6 50l26-22 4 5-26 22z"/><path d="M34 30l10-9c4-4 12-4 14 1s-2 11-8 12l-10 2" stroke-width="2.5"/><path class="glass" d="M44 12v36a3 3 0 0 0 6 0V12z"/>',
      },
      {
        id: "crucible-tongs",
        name: "Crucible tongs",
        use: "Handling hot crucibles",
        svg: '<path d="M10 60L30 32q4-8 0-18q-2-6 2-10M22 60L34 32q6-8 4-18q-1-6 3-10" stroke-width="2.5"/><circle class="metal" cx="32" cy="32" r="3"/>',
      },
    ],
  },
  {
    group: "Others",
    items: [
      {
        id: "mortar-pestle",
        name: "Mortar and pestle",
        use: "Grinding / crushing solids",
        svg: '<path class="ceramic" d="M36 30L51 6a4 4 0 0 1 7 4L43 33z"/><path class="ceramic" d="M8 30h48c0 14-10 22-24 22S8 44 8 30z"/><path d="M22 52l-2 6h24l-2-6"/>',
      },
      {
        id: "crucible",
        name: "Crucible",
        use: "Strong heating of substances",
        svg: '<path class="ceramic" d="M16 14q16-8 32 0z"/><circle class="ceramic" cx="32" cy="8" r="2"/><path class="ceramic" d="M14 24l5 30a4 4 0 0 0 4 3h18a4 4 0 0 0 4-3l5-30z"/><ellipse class="ceramic" cx="32" cy="24" rx="18" ry="4"/>',
      },
      {
        id: "delivery-tube",
        name: "Delivery tube",
        use: "Carrying gas from one container to another",
        svg: '<path class="glass" d="M10 54V20q0-8 8-8h28q8 0 8 8v24" stroke-width="5"/><path d="M10 54V20q0-8 8-8h28q8 0 8 8v24" stroke-width="1" stroke="#fff"/><rect class="rubber" x="5" y="46" width="10" height="10" rx="1"/>',
      },
      {
        id: "litmus-paper",
        name: "Litmus paper / pH paper",
        use: "Testing acidity / basicity",
        svg: '<rect class="litmus-red" x="8" y="8" width="12" height="48" rx="1"/><rect class="litmus-blue" x="24" y="8" width="12" height="48" rx="1"/><rect x="42" y="8" width="14" height="48" rx="1"/><rect x="42" y="8" width="14" height="8" fill="#ef4444" stroke="none"/><rect x="42" y="18" width="14" height="8" fill="#f59e0b" stroke="none"/><rect x="42" y="28" width="14" height="8" fill="#84cc16" stroke="none"/><rect x="42" y="38" width="14" height="8" fill="#0ea5e9" stroke="none"/><rect x="42" y="48" width="14" height="8" fill="#7c3aed" stroke="none"/>',
      },
      {
        id: "safety-goggles",
        name: "Safety goggles",
        use: "Personal protection (eyes)",
        svg: '<path d="M6 28q-4 0-4 4M58 28q4 0 4 4"/><path class="glass" d="M6 20h52v16a6 6 0 0 1-6 6H40l-4-6h-8l-4 6H12a6 6 0 0 1-6-6z"/><path d="M32 20v10"/>',
      },
      {
        id: "gloves",
        name: "Gloves",
        use: "Personal protection (hands)",
        svg: '<path class="rubber-blue" d="M20 60V40l-8-12a3 3 0 0 1 5-4l5 7V12a3 3 0 0 1 6 0v16V8a3 3 0 0 1 6 0v20V10a3 3 0 0 1 6 0v18V15a3 3 0 0 1 6 0v27c0 10-6 18-14 18z"/>',
      },
      {
        id: "lab-apron",
        name: "Lab apron",
        use: "Personal protection (body)",
        svg: '<path d="M22 8q-2-6 10-6t10 6"/><path class="cloth" d="M22 8h20v10l10 6v36H12V24l10-6z"/><path d="M12 30H4M52 30h8"/><rect x="24" y="38" width="16" height="10" rx="1"/>',
      },
    ],
  },
];

export const LAB_EQUIPMENT = LAB_EQUIPMENT_GROUPS.flatMap((g) => g.items);
