import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, password, role } = req.body;
    try {
        // See if user exists
        let user = await User.findOne({ name });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create user
        user = await User.create({
            name,
            password,
            role
        });

        // Create token
        const payload = {
            id: user.id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // Return user and token
        res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        // Check for user
        const user = await User.findOne({ name }).select('+password');

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        // Create token
        const payload = {
            id: user.id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // Return user and token
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
