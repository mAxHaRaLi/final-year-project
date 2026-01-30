const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Ingredient = require('../models/Ingredient');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const connectDB = require('../config/db');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Ingredient.deleteMany();
        await Recipe.deleteMany();
        await Review.deleteMany();

        console.log('Data Destroyed...');

        // Create Admin User
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
        });

        const adminId = adminUser._id;

        // Create Ingredients
        const ingredients = await Ingredient.insertMany([
            { name: 'Egg', category: 'Dairy' },
            { name: 'Flour', category: 'Grain' },
            { name: 'Milk', category: 'Dairy' },
            { name: 'Sugar', category: 'Sweetener' },
            { name: 'Butter', category: 'Dairy' },
            { name: 'Chicken', category: 'Meat' },
            { name: 'Rice', category: 'Grain' },
            { name: 'Tomato', category: 'Vegetable' },
            { name: 'Onion', category: 'Vegetable' },
            { name: 'Garlic', category: 'Vegetable' },
            { name: 'Salt', category: 'Seasoning' },
            { name: 'Black Pepper', category: 'Seasoning' },
            { name: 'Olive Oil', category: 'Oil' },
            { name: 'Lemon', category: 'Fruit' },
            { name: 'Basil', category: 'Herb' },
            { name: 'Parsley', category: 'Herb' },
            { name: 'Beef', category: 'Meat' },
            { name: 'Pork', category: 'Meat' },
            { name: 'Carrot', category: 'Vegetable' },
            { name: 'Potato', category: 'Vegetable' },
            { name: 'Cheese', category: 'Dairy' },
            { name: 'Yogurt', category: 'Dairy' },
            { name: 'Cinnamon', category: 'Spice' },
            { name: 'Ginger', category: 'Spice' },
            { name: 'Thyme', category: 'Herb' },
            { name: 'Oregano', category: 'Herb' },
            { name: 'Shrimp', category: 'Seafood' },
            { name: 'Broccoli', category: 'Vegetable' },
            { name: 'Spinach', category: 'Vegetable' },
            { name: 'Avocado', category: 'Fruit' },
            { name: 'Honey', category: 'Sweetener' },
        ]);

        // Create Recipes
        // Find IDs
        const egg = ingredients.find(i => i.name === 'Egg')._id;
        const flour = ingredients.find(i => i.name === 'Flour')._id;
        const milk = ingredients.find(i => i.name === 'Milk')._id;
        const sugar = ingredients.find(i => i.name === 'Sugar')._id;
        const chicken = ingredients.find(i => i.name === 'Chicken')._id;
        const rice = ingredients.find(i => i.name === 'Rice')._id;

        const recipes = [
            {
                title: 'Pancakes',
                description: 'Fluffy homemade pancakes',
                ingredients: [
                    { item: egg, quantity: '2' },
                    { item: flour, quantity: '2 cups' },
                    { item: milk, quantity: '1.5 cups' },
                    { item: sugar, quantity: '2 tbsp' }
                ],
                instructions: 'Mix dry ingredients. Mix wet ingredients. Combine. Cook on griddle.',
                imageUrl: 'https://example.com/pancakes.jpg',
                owner: adminId,
            },
            {
                title: 'Chicken Rice',
                description: 'Simple boiled chicken with rice',
                ingredients: [
                    { item: chicken, quantity: '500g' },
                    { item: rice, quantity: '2 cups' }
                ],
                instructions: 'Cook rice. Boil chicken. Serve.',
                imageUrl: 'https://example.com/chickenrice.jpg',
                owner: adminId,
            },
        ];

        await Recipe.insertMany(recipes);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await User.deleteMany();
        await Ingredient.deleteMany();
        await Recipe.deleteMany();
        await Review.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
