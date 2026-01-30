const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, name, email, password } = req.body || {};
    const finalUsername = (username || name || '').toString().trim();

    try {
        // Debug logs to help diagnose missing body data
        console.log('Register request content-type:', req.headers['content-type']);
        console.log('Register request body:', req.body);

        if (!finalUsername || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const normalizedEmail = email.toString().trim().toLowerCase();

        // Check if user exists
        const userExists = await User.findOne({ email: normalizedEmail });
        const usernameExists = await User.findOne({ username: finalUsername });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Create user
        const user = await User.create({
            username: finalUsername,
            name,
            email: normalizedEmail,
            password,
        });

        if (user) {
            return res.status(201).json({
                token: generateToken(user.id),
                user: {
                    _id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }

        return res.status(400).json({ message: 'Invalid user data' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            return res.json({
                token: generateToken(user.id),
                user: {
                    _id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }

        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
