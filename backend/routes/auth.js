import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, password, position, department, employeeType } = req.body;

    if (!name || !password) {
        return res.status(400).json({ msg: 'Please provide name and password' });
    }

    try {
        const userExists = await User.findOne({ name });
        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const user = await User.create({
            name,
            password,
            position,
            department,
            employeeType,
            role: 'user' // Default role
        });

        // Get user without password
        const userResponse = await User.findById(user._id);

        if (user) {
            res.status(201).json({
                token: generateToken(user._id),
                user: userResponse
            });
        } else {
            res.status(400).json({ msg: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
});


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await User.findOne({ name }).select('+password');
        if (user && (await user.matchPassword(password))) {
            // Get user without password
            const userResponse = await User.findById(user._id);
            res.json({
                token: generateToken(user._id),
                user: userResponse
            });
        } else {
            res.status(401).json({ msg: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @desc    Get logged in user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.status(200).json(req.user);
});


// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (await user.matchPassword(oldPassword)) {
            user.password = newPassword;
            await user.save();
            res.status(200).json({ msg: 'Password updated successfully' });
        } else {
            res.status(401).json({ msg: 'Old password is not correct' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
});

export default router;