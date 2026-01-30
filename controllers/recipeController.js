const Recipe = require('../models/Recipe');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Get all recipes or search by ingredients
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
    try {
        const { ingredients, accessible } = req.query;

        let query = {};

        if (ingredients) {
            // Assume ingredients is a comma-separated list of IDs
            const ingredientIds = ingredients.split(',');

            // Find recipes where every ingredient in the recipe is present in the user's list
            // This is "Can I make this recipe with what I have?"
            // We will fetch all recipes and filter in memory for simplicity with the complex structure
            // Or we can try to optimize later.

            const allRecipes = await Recipe.find().populate('ingredients.item', 'name category');

            const matchingRecipes = allRecipes.filter(recipe => {
                // Check if every ingredient in the recipe is in the user's list
                // We can optionally ignore "Common" ingredients here if we had a flag for them
                // For now, strict subset logic

                return recipe.ingredients.every(recipeIng => {
                    // Safety check: if ingredient item was deleted, it will be null here after populate
                    if (!recipeIng.item) return false;

                    return ingredientIds.includes(recipeIng.item._id.toString());
                });
            });

            return res.status(200).json(matchingRecipes);
        }

        // If accessible flag set, return recipes visible to the authenticated user
        if (accessible && req.user) {
            const userId = req.user._id;
            const recipes = await Recipe.find({
                $or: [
                    { visibility: 'public' },
                    { owner: userId },
                    { sharedWith: userId }
                ]
            }).populate('ingredients.item', 'name');
            return res.status(200).json(recipes);
        }

        // Standard list with search/filter/pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const { search, category, sort } = req.query;

        let queryObj = { visibility: 'public' };

        if (search) {
            queryObj.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            queryObj.tags = category; // Assuming tags are used as categories
        }

        let sortObj = { createdAt: -1 }; // Default new to old
        if (sort) {
            if (sort === 'oldest') sortObj = { createdAt: 1 };
            if (sort === 'rating') sortObj = { averageRating: -1 };
            if (sort === 'popular') sortObj = { numReviews: -1 };
            if (sort === 'time') sortObj = { cookTime: 1 }; // This might be tricky if cookTime is string
        }

        const total = await Recipe.countDocuments(queryObj);
        const recipes = await Recipe.find(queryObj)
            .populate('ingredients.item', 'name')
            .populate('owner', 'username')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            recipes,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('ingredients.item', 'name category')
            .populate('owner', 'username');

        if (recipe) {
            // check visibility
            if (recipe.visibility === 'private') {
                const ownerId = recipe.owner?._id ? recipe.owner._id.toString() : (recipe.owner ? recipe.owner.toString() : null);
                if (!req.user || !ownerId || ownerId !== req.user._id.toString()) {
                    return res.status(403).json({ message: 'Not authorized to view this recipe' });
                }
            }
            if (recipe.visibility === 'shared') {
                const ownerId = recipe.owner?._id ? recipe.owner._id.toString() : (recipe.owner ? recipe.owner.toString() : null);
                const isOwner = req.user && ownerId && ownerId === req.user._id.toString();
                const isShared = req.user && recipe.sharedWith && recipe.sharedWith.some(id => id && id.toString() === req.user._id.toString());

                if (!isOwner && !isShared) {
                    return res.status(403).json({ message: 'Not authorized to view this recipe' });
                }
            }

            res.status(200).json(recipe);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
    try {
        console.log('--- Create Recipe Request ---');
        console.log('Auth check: req.user is', req.user ? 'defined' : 'null');
        if (req.user) console.log('User ID:', req.user._id);

        const { title, description, ingredients, instructions, visibility, servings, prepTime, cookTime, tags } = req.body;

        // Ensure temp directory exists for uploads
        const tempDir = path.join(__dirname, '..', 'public', 'temp');
        const stats = fs.existsSync(tempDir) ? fs.statSync(tempDir) : null;

        if (stats && !stats.isDirectory()) {
            console.log('Conflict: "temp" is a file. Deleting and creating directory.');
            fs.unlinkSync(tempDir);
            fs.mkdirSync(tempDir, { recursive: true });
        } else if (!stats) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        if (!ingredients || (typeof ingredients === 'string' && ingredients.length === 0)) {
            return res.status(400).json({ message: 'No ingredients provided' });
        }

        let parsedIngredients = ingredients;
        if (typeof ingredients === 'string') {
            try {
                parsedIngredients = JSON.parse(ingredients);
            } catch (e) {
                console.error('JSON Parse Error:', e);
                return res.status(400).json({ message: 'Invalid ingredients format' });
            }
        }

        if (!req.user) {
            console.error('CREATE RECIPE ERROR: req.user is null');
            return res.status(401).json({ message: 'User session not found. Please log in again.' });
        }

        const recipe = new Recipe({
            title,
            description,
            ingredients: parsedIngredients,
            instructions,
            owner: req.user._id,
            visibility: visibility || 'public',
            servings,
            prepTime,
            cookTime,
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
        });

        // handle uploaded files
        if (req.files && req.files.length > 0) {
            console.log(`Processing ${req.files.length} uploads`);
            recipe.media = req.files.map(f => ({
                url: `/public/temp/${f.filename}`,
                type: (f.mimetype && f.mimetype.startsWith('video')) ? 'video' : 'image'
            }));

            // set main imageUrl to first image
            if (!recipe.imageUrl && recipe.media.length > 0) {
                const firstImage = recipe.media.find(m => m.type === 'image');
                if (firstImage) {
                    recipe.imageUrl = firstImage.url;
                } else {
                    recipe.imageUrl = recipe.media[0].url;
                }
            }
        }

        console.log('Saving to MongoDB...');
        const createdRecipe = await recipe.save();

        if (!createdRecipe) {
            console.error('CREATE RECIPE ERROR: createdRecipe is null after save()');
            throw new Error('Recipe was not saved correctly.');
        }

        console.log('Recipe successfully created:', createdRecipe._id);
        res.status(201).json(createdRecipe);
    } catch (error) {
        console.error('CREATE RECIPE ERROR:', error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            message: 'An internal error occurred while saving the recipe. Please check all fields and try again.',
            error: error.message
        });
    }
};

// Update recipe (owner only)
const updateRecipe = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        const ownerId = recipe.owner._id ? recipe.owner._id.toString() : recipe.owner.toString();
        if (ownerId !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        const { title, description, ingredients, instructions, visibility, servings, prepTime, cookTime, tags } = req.body || {};
        if (title) recipe.title = title;
        if (description) recipe.description = description;
        if (ingredients) recipe.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
        if (instructions) recipe.instructions = instructions;
        if (visibility) recipe.visibility = visibility;
        if (servings) recipe.servings = servings;
        if (prepTime) recipe.prepTime = prepTime;
        if (cookTime) recipe.cookTime = cookTime;
        if (tags) recipe.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;

        if (req.files && req.files.length > 0) {
            // append new media
            const files = req.files.map(f => ({ url: `/public/temp/${f.filename}`, type: f.mimetype.startsWith('video') ? 'video' : 'image' }));
            recipe.media = recipe.media ? recipe.media.concat(files) : files;
            if (!recipe.imageUrl && recipe.media.length) recipe.imageUrl = recipe.media[0].url;
        }

        const saved = await recipe.save();
        res.json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete recipe
const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        if (recipe.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        await recipe.remove();
        res.json({ message: 'Recipe removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Share recipe with users by username (owner only)
const shareRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        if (recipe.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        const { usernames } = req.body || {};
        if (!usernames) return res.status(400).json({ message: 'No usernames provided' });

        const list = Array.isArray(usernames) ? usernames : usernames.split(',').map(s => s.trim());
        const users = await User.find({ username: { $in: list } });
        const ids = users.map(u => u._id);
        recipe.sharedWith = Array.from(new Set([...(recipe.sharedWith || []), ...ids.map(id => id.toString())]));
        recipe.visibility = 'shared';
        await recipe.save();
        res.json({ message: 'Recipe shared', sharedWith: recipe.sharedWith });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRecipes,
    getRecipeById,
    createRecipe,
};
// expose additional handlers
module.exports.updateRecipe = updateRecipe;
module.exports.deleteRecipe = deleteRecipe;
module.exports.shareRecipe = shareRecipe;

// Protected accessible list
const getAccessibleRecipes = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const userId = req.user._id;
        const recipes = await Recipe.find({
            $or: [
                { visibility: 'public' },
                { owner: userId },
                { sharedWith: userId }
            ]
        }).populate('ingredients.item', 'name');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getAccessibleRecipes = getAccessibleRecipes;

// @desc    Get recipes owned by the logged-in user
// @route   GET /api/recipes/mine
// @access  Private
const getMyRecipes = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const userId = req.user._id;
        const recipes = await Recipe.find({ owner: userId }).populate('ingredients.item', 'name').populate('owner', 'username');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getMyRecipes = getMyRecipes;
