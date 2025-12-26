const recipes = [
  {
    name: "Cheese Omelet",
    ingredients: ["eggs", "cheese", "butter"]
  },
  {
    name: "Egg Fried Rice",
    ingredients: ["eggs", "rice", "soy sauce"]
  },
  {
    name: "Tomato Pasta",
    ingredients: ["pasta", "tomato", "garlic"]
  }
];

function findRecipes() {
  const input = document.getElementById("ingredientsInput").value.toLowerCase();
  const userIngredients = input.split(",").map(i => i.trim());

  const resultsList = document.getElementById("results");
  resultsList.innerHTML = "";

  recipes.forEach(recipe => {
    const matches = recipe.ingredients.filter(ingredient =>
      userIngredients.includes(ingredient)
    );

    if (matches.length > 0) {
      const li = document.createElement("li");
      li.textContent = recipe.name + " (matches: " + matches.join(", ") + ")";
      resultsList.appendChild(li);
    }
  });

  if (resultsList.innerHTML === "") {
    resultsList.innerHTML = "<li>No recipes found.</li>";
  }
}
