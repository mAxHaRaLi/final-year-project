const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get user profile with favorites
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('favorites', 'title imageUrl description')
            .select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add recipe to favorites
// @route   POST /api/users/favorites/:id
// @access  Private
const addFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const recipeId = req.params.id;

        if (user.favorites.includes(recipeId)) {
            return res.status(400).json({ message: 'Recipe already in favorites' });
        }

        user.favorites.push(recipeId);
        await user.save();

        res.status(200).json({ message: 'Recipe added to favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove recipe from favorites
// @route   DELETE /api/users/favorites/:id
// @access  Private
const removeFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const recipeId = req.params.id;

        user.favorites = user.favorites.filter(id => id.toString() !== recipeId);
                await user.save();

                res.status(200).json({ message: 'Recipe removed from favorites', favorites: user.favorites });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        };

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, username, email } = req.body || {};

        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) return res.status(400).json({ message: 'Username already taken' });
            user.username = username;
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ message: 'Email already in use' });
            user.email = email;
        }

        if (name) user.name = name;

        // If a file was uploaded, use its path as avatar
        if (req.file && req.file.filename) {
            // public is served at /public
            user.avatar = `/public/temp/${req.file.filename}`;
        } else if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }

        await user.save();

        const sanitized = user.toObject();
        delete sanitized.password;

        res.json(sanitized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};
        if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Please provide current and new passwords' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------- Admin controllers ----------

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID (admin)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role (admin)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body || {};
        if (!role) return res.status(400).json({ message: 'Role is required' });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        await user.save();

        res.json({ message: 'User role updated', user: { _id: user._id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Deactivate or reactivate user (admin)
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
const deactivateUser = async (req, res) => {
    try {
        const { active } = req.body || {};
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isActive = active === undefined ? false : !!active;
        await user.save();

        res.json({ message: user.isActive ? 'User activated' : 'User deactivated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.remove();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
