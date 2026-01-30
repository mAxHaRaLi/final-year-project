const mongoose = require('mongoose');

const ingredientSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        category: {
            type: String, // e.g., Vegetable, Fruit, Meat, Dairy, Spice, Grain
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const Ingredient = mongoose.model('Ingredient', ingredientSchema);
module.exports = Ingredient;
