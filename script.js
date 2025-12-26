console.log("script.js loaded");

const els = {
  input: document.getElementById("ingredientInput"),
  addBtn: document.getElementById("addBtn"),
  chips: document.getElementById("chips"),
  time: document.getElementById("timeSelect"),
  diet: document.getElementById("dietSelect"),
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
 * This is intentionally simple but produces consistent output.
 */
function generateLocalRecipes({ ingredients, time, diet, pantryBasics }) {
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
    title: diet === "vegan" ? "Quick veggie stir-fry" : "Quick stir-fry",
    time: `${time} min`,
    tags: [diet !== "none" ? diet : null, "one-pan"].filter(Boolean),
    uses: [protein, veggie, carb].filter(Boolean),
    missing: [!veggie ? "a vegetable (e.g., onion/pepper/broccoli)" : null, !carb ? "a carb (rice/noodles)" : null].filter(Boolean),
    steps: [
      "Chop ingredients; heat oil in a pan.",
      `Cook ${protein ? protein : "your main ingredient"} until done.`,
      `Add ${veggie ? veggie : "vegetables"} and stir-fry 3–5 min.`,
      `Add ${carb ? carb : "a cooked carb"} and season; toss to combine.`,
    ],
  });

  // Idea 2: soup / stew
  ideas.push({
    title: diet === "vegan" ? "Cozy pantry soup" : "Cozy soup",
    time: `${Math.min(60, Number(time) + 15)} min`,
    tags: [diet !== "none" ? diet : null, "batch-friendly"].filter(Boolean),
    uses: base,
    missing: ["broth/stock (or water + seasoning)"],
    steps: [
      "Sauté onion/garlic (or any aromatics) in a pot.",
      "Add chopped ingredients and cover with broth/water.",
      "Simmer until tender; adjust seasoning.",
      "Optional: blend part of it for thickness.",
    ],
  });

  // Idea 3: bowl/salad wrap
  ideas.push({
    title: diet === "vegan" ? "Loaded grain bowl" : "Loaded bowl",
    time: `${Math.max(15, Number(time) - 5)} min`,
    tags: [diet !== "none" ? diet : null, "mix-and-match"].filter(Boolean),
    uses: [carb, protein, veggie].filter(Boolean),
    missing: [!carb ? "a base (rice/quinoa/bread)" : null, "a sauce (yogurt, vinaigrette, salsa, tahini)"].filter(Boolean),
    steps: [
      "Choose a base (grain, greens, or bread).",
      "Add cooked protein/beans and chopped veggies.",
      "Top with a sauce + crunch (nuts/seeds/croutons).",
      "Taste and adjust (salt/acid/heat).",
    ],
  });
  
  // Idea 3: Steamed chicken with mushrooms
  const needsChicken = hasAny(["chicken","thigh","breast"]);
  const needsMushroom = hasAny([,"shiitake","mushroom"]);
  const: needsGinger = has("ginger");
  
  ideas.push({
    title: "Steamed chicken with mushrooms,
    time: "35 min",
    tags: ["comforting", "simple", "healthy"],
    uses: [
    needsChicken ? "chicken" : null,
    needsMuchsoom ? "shiitake/mushrooms" : null,
    has("soy sauce") ? "soy sauce" : null,
    has("garlic") ? "garlic" : null,
    has("scallion") ? "scallion" : null,
    has("rice") ? "rice" : null,
  ].filter(Boolean),
    missing: [
    !needsChicken ? "chicken" : null,
    !needsMushroom ? "shiitake (or any mushrooms)" : null,
    !needsGinger ? "ginger (recommended)" : null,
    pantryBasics ? null : "salt + oil",
    !has("soy sauce") ? "soy sauce (or tamari)" : null,
  ].filter(Boolean),

   steps: [
    "Slice chicken into bite-size pieces; season with a pinch of salt (and a little soy sauce if you have it).",
    "Slice mushrooms and scatter over the chicken with ginger/garlic if using.",
    "Steam on high until chicken is cooked through (about 12–18 min depending on thickness).",
    "Finish with scallions and a splash of soy sauce; serve over rice or with veggies.",
  ],
  });

  return ideas;
}

/**
 * OPTIONAL: AI mode stub.
 * Later, you can connect this to an API route (recommended) so you don’t expose keys.
 */
async function generateAiRecipes(/* params */) {
  throw new Error("AI mode not connected yet.");
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
        <span class="badge">${escapeHtml(r.time)}</span>
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
    time: els.time.value,
    diet: els.diet.value,
    pantryBasics: els.pantry.checked,
  };

  try {
    els.generate.disabled = true;
    els.status.textContent = "Generating…";

    // Free MVP mode:
    const ideas = generateLocalRecipes(params);

    renderResults(ideas);
    els.status.textContent = `Showing ${ideas.length} ideas.`;
  } catch (e) {
    els.status.textContent = e.message || "Something went wrong.";
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
