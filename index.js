require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
require('express-async-errors');

const usersRouter = require('./routes/users');
const recipesRouter = require('./routes/recipes');

app.use(cors());
app.use(express.json()); // replace bodyparser; parse incoming requests with JSON payloads
app.use(express.static('build'));

app.use((req, res, next) => {
  console.log('Method: ', req.method);
  console.log('Path: ', req.path);
  console.log('Body: ', req.body);
  next();
});

app.use('/api/users', usersRouter);
app.use('/api/recipes', recipesRouter);

// app.get('/api/recipes/:id', (request, response) => {
//   const id = Number(request.params.id);
//   const recipe = recipes.find(recipe => recipe.id === id);
//   if (recipe) {
//     response.json(recipe);
//   } else {
//     response.status(404).end();
//   }
// });

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

// general error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.log(`error handler: '${err.message}'`);
  res.json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
