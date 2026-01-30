const express = require('express');
const router = express.Router();
const {
    getReviews,
    createReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:recipeId', getReviews);
router.post('/', protect, createReview);

module.exports = router;
