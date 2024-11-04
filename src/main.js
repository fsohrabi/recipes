let recipeName, ingredients, recipeImage, steps, displayArea, submitButton, recipeForm;
let recipes = []; // Declare recipes globally

window.onload = function () {
    recipeName = document.getElementById('name');
    ingredients = document.getElementById('ingredients');
    recipeImage = document.getElementById('recipeImage');
    steps = document.getElementById('steps');
    displayArea = document.getElementById('display-area');
    submitButton = document.getElementById('submit-btn');
    recipeForm = document.getElementById('recipe-form');

    recipeForm.onsubmit = addRecipe; // Set the form submission handler

    if (localStorage.getItem('recipes')) {
        recipes = JSON.parse(localStorage.getItem('recipes'));
        displayArea.classList.remove('hidden');
        recipes.forEach((recipe, index) => displayRecipe(recipe, index));
    }
}

function displayRecipe(recipe, index) {
    let recipeDiv = document.createElement('div');
    const defaultImage = './images/default.webp'; // Path to your default image
    const imageUrl = recipe.image ? recipe.image : defaultImage;
    recipeDiv.innerHTML = `
            <div class="p-4 bg-gray-800 shadow-md rounded-md">
                <img src="${imageUrl}" alt="${recipe.name}" class="w-full h-64 object-cover rounded-md"> <!-- Increased height -->
                <h3 class="text-xl font-bold">${recipe.name}</h3>
                <p class="mt-2 text-sm text-gray-400"><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                <p class="mt-2 text-sm text-gray-400"><strong>Steps:</strong> ${recipe.steps}</p>
                <div class="flex justify-end mt-4 space-x-2">
                    <button onclick="editRecipe(${index})" class="px-4 py-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600">Edit</button>
                    <button onclick="deleteRecipe(${index})" class="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600">Delete</button>
                </div>
            </div>`;
    displayArea.appendChild(recipeDiv);
}

function editRecipe(index) {
    recipeName.value = recipes[index].name;
    ingredients.value = recipes[index].ingredients;
    steps.value = recipes[index].steps;
    recipeImage.value = recipes[index].image;

    submitButton.textContent = "Update Recipe";

    window.scrollTo(0, 0);

    recipeForm.onsubmit = function (event) {
        event.preventDefault();
        recipes[index] = {
            name: recipeName.value,
            ingredients: ingredients.value,
            steps: steps.value,
            image: recipeImage.value
        };
        updateDisplay();
        recipeForm.reset();
        submitButton.textContent = "Add Recipe"; // Reset the button text
        recipeForm.onsubmit = addRecipe; // Reset to the original function for adding new recipes
    };
}

function deleteRecipe(index) {
    recipes.splice(index, 1);
    updateDisplay();
}

function updateDisplay() {
    displayArea.innerHTML = '';
    localStorage.setItem('recipes', JSON.stringify(recipes));
    if (recipes.length > 0) {
        displayArea.classList.remove('hidden');
        recipes.forEach((recipe, index) => displayRecipe(recipe, index));
    } else {
        displayArea.classList.add('hidden');
    }
}

function addRecipe(event) {
    event.preventDefault();
    let newRecipe = {
        name: recipeName.value,
        ingredients: ingredients.value,
        steps: steps.value,
        image: recipeImage.value
    };
    recipes.push(newRecipe);
    updateDisplay();
    recipeForm.reset();

    window.scrollTo(0, document.body.scrollHeight);
}
