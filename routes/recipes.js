const recipesRouter = require('express').Router();
const axios = require('axios');
const { pool } = require('../config');

// returns a random recipe from Spoonacular's random recipe api endpoint
async function getRandomRecipe() {
  const response = await axios.get(
    `https://api.spoonacular.com/recipes/random?number=1&limitLicense=true&apiKey=${process.env.SPOON_API_KEY1}`,
  );
  return response.data.recipes[0];
}

// returns a recipe that from Spoonacular that tries to exclude intolerances;
// use Spoonacular complex search to return 99 recipes with intolerances excluded;
// randomly pick one and get details by making a 2nd GET request to recipe information endpoint
async function getSearchRecipe(queryParam) {
  const response = await axios.get(
    `https://api.spoonacular.com/recipes/complexSearch?query=''&number=99&intolerances=${queryParam}&apiKey=${process.env.SPOON_API_KEY2}`,
  );
  const numOfRecipes = response.data.number;
  const selectedRecipeObj = response.data.results[Math.floor(Math.random() * numOfRecipes)];
  const recipe = await axios.get(
    `https://api.spoonacular.com/recipes/${selectedRecipeObj.id}/information?includeNutrition=false&apiKey=${process.env.SPOON_API_KEY2}`,
  );
  return recipe.data;
}

// gets a random recipe
recipesRouter.get('/random_recipe', async (req, res) => {
  const recipeObj = await getRandomRecipe();
  res.json(recipeObj);
});

// gets a recipe without excluded string parameter ingredients
recipesRouter.get('/search_recipe/:strParam', async (req, res) => {
  // express route parameters must be made up of “word characters” ([A-Za-z0-9_])
  const queryParam = req.params.strParam.split('_').join(',');
  const recipeObj = await getSearchRecipe(queryParam);
  res.json(recipeObj);
});

// ~~~~~~~~~~~~~~~~~ TO-TEST ~~~~~~~~~~~~~~~~~~~~~~~~

// GET all stored recipes; returns an array of recipe objects
recipesRouter.get('/', async (req, res) => {
  const results = await pool.query('SELECT * FROM recipes');
  console.log(results.rows);

  res.status(200).json(results.rows);
});

// adds a new recipe to the database
recipesRouter.post('/', async (req, res) => {
  const {
    recipeId,
    title,
    ingredients,
    url,
  } = req.body;

  const results = await pool.query('INSERT INTO recipes (recipe_id, title, ingredients, url) VALUES ($1, $2, $3, $4)', [recipeId, title, ingredients, url]);
  console.log(results);

  res.status(201).json({ status: 'success', message: `Recipe ${recipeId} added.` });
});

// deletes a recipe based on recipe_id
recipesRouter.delete('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;
  console.log(`deleting recipe: ${recipeId}`);

  const results = await pool.query('DELETE FROM recipes WHERE recipe_id = $1', [recipeId]);
  console.log(results);

  res.status(200).json({ status: 'success', message: `Deleted recipe: ${recipeId}.` });
});

module.exports = recipesRouter;
