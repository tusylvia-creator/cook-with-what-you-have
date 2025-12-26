const els = {
  input: document.getElementById("ingredientInput"),
  addBtn: document.getElementById("addBtn"),
  chips: document.getElementById("chips"),
  pantry: document.getElementById("pantryBasics"),
  generate: document.getElementById("generateBtn"),
  clear: document.getElementById("clearBtn"),
  results: document.getElementById("results"),
  status: document.getElementById("status"),
};

let ingredients = [];

function normalizeIngredient(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function addIngredient(raw) {
  const value = normalizeIngredient(raw);
  if (!value) return;
  if (ingredients.includes(value)) return;

  ingredients.push(value);
  renderChips();
  els.input.value = "";
  els.input.focus();
}

function removeIngredient(value) {
  ingredients = ingredients.filter(i => i !== value);
  renderChips();
}

function renderChips() {
  els.chips.innerHTML = "";
  ingredients.forEach(i => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `<span>${escapeHtml(i)}</span>`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Remove ${i}`);
    btn.textContent = "×";
    btn.addEventListener("click", () => removeIngredient(i));

    chip.appendChild(btn);
    els.chips.appendChild(chip);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

/**
 * FREE MVP: generate ideas locally (no API)
 * This generates consistent output without needing any API key.
 */
function generateLocalRecipes({ ingredients, pantryBasics }) {
  const base = ingredients.slice(0, 6); // keep it focused
  const has = (w) => ingredients.some(i => i.includes(w));

  // tiny heuristics
  const proteins = ["chicken", "beef", "pork", "tofu", "eggs", "beans", "lentils", "chickpeas", "fish", "salmon", "tuna"];
  const carbs = ["rice", "pasta", "noodles", "bread", "tortilla", "potatoes", "quinoa"];
  const veg = ["onion", "garlic", "tomato", "spinach", "broccoli", "pepper", "mushroom", "carrot", "zucchini"];

  const pick = (arr) => arr.find(x => has(x)) || null;

  const protein = pick(proteins);
  const carb = pick(carbs);
  const veggie = pick(veg);

  const pantry = pantryBasics ? ["oil", "salt", "pepper", "spices"] : [];

  const ideas = [];

  // Idea 1: skillet / stir-fry
  ideas.push({
    title: "Quick stir-fry",
    time: "25–35 min",
    tags: ["one-pan"],
    uses: [protein, veggie, carb].filter(Boolean),
    missing: [
      !veggie ? "a vegetable (e.g., onion/pepper/broccoli)" : null,
      !carb ? "a carb (rice/noodles)" : null,
      !protein ? "a protein (chicken/tofu/eggs/beans)" : null,
    ].filter(Boolean),
    steps: [
      "Chop ingredients; heat oil in a pan.",
      `Cook ${protein ? protein : "your main ingredient"} until done.`,
      `Add ${veggie ? veggie : "vegetables"} and stir-fry 3–5 min.`,
      `Add ${carb ? carb : "a cooked carb"} and season; toss to combine.`,
    ],
  });

  // Idea 2: soup / stew
  ideas.push({
    title: "Cozy soup",
    time: "35–55 min",
    tags: ["batch-friendly"],
    uses: base,
    missing: [
      "broth/stock (or water + seasoning)",
      ...(!pantryBasics ? pantry : []),
    ].filter(Boolean),
    steps: [
      "Sauté onion/garlic (or any aromatics) in a pot.",
      "Add chopped ingredients and cover with broth/water.",
      "Simmer until tender; adjust seasoning.",
      "Optional: blend part of it for thickness.",
    ],
  });

  // Idea 3: loaded bowl
  ideas.push({
    title: "Loaded bowl",
    time: "15–25 min",
    tags: ["mix-and-match"],
    uses: [carb, protein, veggie].filter(Boolean),
    missing: [
      !carb ? "a base (rice/quinoa/bread)" : null,
      "a sauce (yogurt, vinaigrette, salsa, tahini)",
    ].filter(Boolean),
    steps: [
      "Choose a base (grain, greens, or bread).",
      "Add cooked protein/beans and chopped veggies.",
      "Top with a sauce + crunch (nuts/seeds/croutons).",
      "Taste and adjust (salt/acid/heat).",
    ],
  });

  return ideas;
}

function renderResults(items) {
  els.results.innerHTML = "";
  if (!items.length) {
    els.results.innerHTML = `<p class="hint">No ideas yet — add ingredients and click Generate.</p>`;
    return;
  }

  for (const r of items) {
    const div = document.createElement("div");
    div.className = "result";
    div.innerHTML = `
      <h3>${escapeHtml(r.title)}</h3>
      <div class="meta">
        <span class="badge">${escapeHtml(r.time || "")}</span>
        ${(r.tags || []).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("")}
      </div>
      <div class="meta">
        <span class="badge">Uses: ${escapeHtml((r.uses || []).join(", ") || "—")}</span>
        <span class="badge">Missing: ${escapeHtml((r.missing || []).join(", ") || "none")}</span>
      </div>
      <ol class="steps">
        ${(r.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join("")}
      </ol>
    `;
    els.results.appendChild(div);
  }
}

async function onGenerate() {
  els.status.textContent = "";
  if (ingredients.length < 2) {
    els.status.textContent = "Add at least 2 ingredients for better ideas.";
    renderResults([]);
    return;
  }

  const params = {
    ingredients,
    pantryBasics: els.pantry.checked,
  };

  try {
    els.generate.disabled = true;
    els.status.textContent = "Generating…";

    const ideas = generateLocalRecipes(params);

    renderResults(ideas);
    els.status.textContent = `Showing ${ideas.length} ideas.`;
  } catch (e) {
    els.status.textContent = e?.message || "Something went wrong.";
    console.error(e);
  } finally {
    els.generate.disabled = false;
  }
}

function onClear() {
  ingredients = [];
  renderChips();
  renderResults([]);
  els.status.textContent = "";
  els.input.value = "";
  els.input.focus();
}

// Events
els.addBtn.addEventListener("click", () => addIngredient(els.input.value));
els.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addIngredient(els.input.value);
});
els.generate.addEventListener("click", onGenerate);
els.clear.addEventListener("click", onClear);

// initial
renderChips();
renderResults([]);
