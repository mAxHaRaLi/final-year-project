const express = require('express');
const router = express.Router();
const {
    getRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    shareRecipe,
    getAccessibleRecipes,
    getMyRecipes,
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'temp'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.get('/', getRecipes);
router.get('/accessible', protect, getAccessibleRecipes);
router.get('/mine', protect, getMyRecipes);
router.get('/:id', getRecipeById);
router.post('/', protect, upload.array('media', 6), createRecipe);
router.put('/:id', protect, upload.array('media', 6), updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.put('/:id/share', protect, shareRecipe);

module.exports = router;
