const express = require('express');
const router = express.Router();
const {
    getIngredients,
    createIngredient,
} = require('../controllers/ingredientController');

router.get('/', getIngredients);
router.post('/', createIngredient);

module.exports = router;
