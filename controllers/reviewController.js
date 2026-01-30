const Review = require('../models/Review');
const Recipe = require('../models/Recipe');

// @desc    Get reviews for a recipe
// @route   GET /api/reviews/:recipeId
// @access  Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ recipe: req.params.recipeId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { rating, comment, recipeId } = req.body;

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if user already reviewed
        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            recipe: recipeId
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this recipe' });
        }

        const review = await Review.create({
            user: req.user._id,
            recipe: recipeId,
            rating: Number(rating),
            comment
        });

        // Update recipe rating
        const reviews = await Review.find({ recipe: recipeId });
        recipe.numReviews = reviews.length;
        recipe.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await recipe.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getReviews,
    createReview,
};
