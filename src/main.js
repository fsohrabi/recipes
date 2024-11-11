document.addEventListener('DOMContentLoaded', () => {
    const recipeForm = document.getElementById('recipe-form');
    const editForm = document.getElementById('edit-recipe-form');
    const messageDiv = document.getElementById('message');
    const displayArea = document.getElementById('display-area');
    const editModal = document.getElementById('edit-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const submitBtn = document.getElementById('submit-btn');
    const defaultImage = './images/default.webp';

    recipeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        toggleSubmitButton(false);

        // Get input values
        const name = document.getElementById('name').value.trim();
        const ingredients = document.getElementById('ingredients').value.split(',').map(i => i.trim());
        const steps = document.getElementById('steps').value.trim();
        const image = document.getElementById('image').value.trim();
        if (!validateRecipeForm(name, ingredients, steps, image)) {
            toggleSubmitButton(true);
            return;
        }

        // Prepare recipe data
        const recipeData = {
            name,
            ingredients,
            steps,
            image: image || null, // If no image is provided, save as null
        };

        try {
            const response = await fetch('http://0.0.0.0:8000/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipeData),
            });
            if (response.ok) {
                showMessage('Recipe added successfully!', 'success');
                recipeForm.reset();
                await fetchRecipes();
            } else {
                showMessage('Failed to add recipe.', 'error');
            }
        } catch (error) {
            showMessage('Unexpected error occurred.', 'error');
        } finally {
            toggleSubmitButton(true);
        }
    });

    // Improved validation function
    function validateRecipeForm(name, ingredients, steps, image, form_name = '') {
        const nameField = document.getElementById(form_name + 'name');
        const ingredientsField = document.getElementById(form_name + 'ingredients');
        const stepsField = document.getElementById(form_name + 'steps');
        const imageField = document.getElementById(form_name + 'image');

        resetError(nameField);
        resetError(ingredientsField);
        resetError(stepsField);
        resetError(imageField);

        if (!name) {
            showError(nameField, 'Recipe name is required.');
            return false;
        }
        if (ingredients.length === 0 || !ingredients[0]) {
            showError(ingredientsField, 'At least one ingredient is required.');
            return false;
        }
        if (!steps) {
            showError(stepsField, 'Steps are required.');
            return false;
        }
        if (image && !isValidURL(image)) {
            showError(imageField, 'Please provide a valid image URL.');
            return false;
        }
        return true;
    }

    function showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = message;
        errorDiv.className = 'text-red-500 text-sm mt-1';
        field.classList.add('border-red-500');
        field.parentElement.appendChild(errorDiv);
    }

    function resetError(field) {
        field.classList.remove('border-red-500');
        const errorDiv = field.parentElement.querySelector('.text-red-500');
        if (errorDiv) errorDiv.remove();
    }

    // Function to validate URL
    function isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    // Handle recipe edit form submission
    editForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // This prevents the page from jumping
        const id = document.getElementById('edit-id').value;
        const updatedData = {
            name: document.getElementById('edit-name').value,
            ingredients: document.getElementById('edit-ingredients').value.split(',').map(i => i.trim()),
            steps: document.getElementById('edit-steps').value,
            image: document.getElementById('edit-image').value || null,
        };

        if (!validateRecipeForm(updatedData.name, updatedData.ingredients, updatedData.steps, updatedData.image, 'edit-')) {
            return;
        }

        try {
            const response = await fetch(`http://0.0.0.0:8000/recipes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (response.ok) {
                showMessage('Recipe updated successfully!', 'success');
                editModal.classList.add('hidden');
                await fetchRecipes();
            } else {
                showMessage('Failed to update recipe.', 'error');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            showMessage('Unexpected error occurred.', 'error');
        }
    });

    // Close the edit modal
    closeModalBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
        resetEditForm();
    });

    function resetEditForm() {
        document.getElementById('edit-recipe-form').reset();
    }

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `${type === 'success' ? 'bg-green-500' : 'bg-red-500'} p-4 text-white rounded shadow-lg mb-4 transition-transform transform`;
        messageDiv.classList.remove('hidden');

        // Add animation
        setTimeout(() => {
            messageDiv.classList.add('translate-y-2', 'opacity-0');
        }, 4000); // Slide up and fade out after 4 seconds

        // Clear the message after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
            messageDiv.classList.remove('translate-y-2', 'opacity-0');
        }, 5000);
    }
    // Fetch all recipes and display them
    async function fetchRecipes() {
        try {
            const response = await fetch('http://0.0.0.0:8000/recipes');
            const recipes = await response.json();
            displayRecipes(recipes);
        } catch (error) {
            showMessage('Error fetching recipes.', 'error');
        }
    }

    // Display recipes on the page
    function displayRecipes(recipes) {
        displayArea.innerHTML = '';
        if (recipes.length > 0) {
            displayArea.classList.remove('hidden');
            recipes.forEach((recipe) => {
                const card = createRecipeCard(recipe);
                displayArea.appendChild(card);
            });
        }
    }

    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'p-4 bg-gray-800 rounded mb-4';

        const imgSrc = recipe.image || defaultImage;
        card.innerHTML = `
        <img src="${imgSrc}" alt="${recipe.name}" class="w-full h-64 object-cover rounded">
            <h3 class="text-xl font-bold mt-4">${recipe.name}</h3>
            <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
            <p><strong>Steps:</strong> ${recipe.steps}</p>
            <button class="edit-btn bg-yellow-500 mt-2 px-2 py-1">Edit</button>
            <button class="delete-btn bg-red-500 mt-2 ml-2 px-2 py-1">Delete</button>`
            ;

        // Attach event listeners
        card.querySelector('.edit-btn').addEventListener('click', () => showEditModal(recipe));
        card.querySelector('.delete-btn').addEventListener('click', () => deleteRecipe(recipe.id));

        return card;
    }

    function showEditModal(recipe) {
        editModal.classList.remove('hidden');
        document.getElementById('edit-id').value = recipe.id;
        document.getElementById('edit-name').value = recipe.name;
        document.getElementById('edit-ingredients').value = recipe.ingredients.join(', ');
        document.getElementById('edit-steps').value = recipe.steps;
        document.getElementById('edit-image').value = recipe.image;
    }

    fetchRecipes();

    function toggleSubmitButton(enable) {
        submitBtn.disabled = !enable;
        submitBtn.textContent = enable ? 'Add Recipe' : 'Adding...';
    }
});
async function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
        const response = await fetch(`http://0.0.0.0:8000/recipes/${recipeId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            showMessage('Recipe deleted successfully!', 'success');
            await fetchRecipes();
        } else {
            showMessage('Failed to delete recipe.', 'error');
        }
    } catch (error) {
        showMessage('Unexpected error occurred.', 'error');
    }
}
