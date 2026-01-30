const Ingredient = require('../models/Ingredient');

// @desc    Get all ingredients
// @route   GET /api/ingredients
// @access  Public
const getIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.find().sort({ name: 1 });
        res.status(200).json(ingredients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new ingredient
// @route   POST /api/ingredients
// @access  Public (should be Admin protected in production)
const createIngredient = async (req, res) => {
    try {
        let { name, category } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        name = name.trim();

        // Escape regex special characters to prevent crashes/misses
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Case-insensitive check
        const ingredientExists = await Ingredient.findOne({
            name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
        });

        if (ingredientExists) {
            return res.status(400).json({ message: 'Ingredient already exists' });
        }

        const ingredient = await Ingredient.create({
            name, // Store as user typed (but trimmed)
            category,
        });
        res.status(201).json(ingredient);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Ingredient already exists (duplicate key)' });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getIngredients,
    createIngredient,
};
