const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    addFavorite,
    removeFavorite,
    updateProfile,
    updatePassword,
    getUsers,
    getUserById,
    updateUserRole,
    deactivateUser,
    deleteUser,
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// configure multer to save uploads to public/temp
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'temp'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Client endpoints
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/profile/password', protect, updatePassword);
router.post('/favorites/:id', protect, addFavorite);
router.delete('/favorites/:id', protect, removeFavorite);

// Admin endpoints
router.get('/', protect, isAdmin, getUsers);
router.get('/:id', protect, isAdmin, getUserById);
router.put('/:id/role', protect, isAdmin, updateUserRole);
router.put('/:id/deactivate', protect, isAdmin, deactivateUser);
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;
