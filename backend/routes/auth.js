import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (for first user), Admin (for subsequent users)
router.post('/register', async (req, res) => {
    const { name, password } = req.body;
    try {
        // See if user exists
        let user = await User.findOne({ name });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Check if this is the first user. If so, make them an admin.
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'admin' : 'user';

        // Create user
        user = await User.create({
            name,
            password,
            role
        });

        // Don't auto-login on register, just confirm creation
        res.status(201).json({ id: user.id, name: user.name, role: user.role });

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
            id: user.id,
            role: user.role,
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


// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ msg: 'Please provide old and new passwords (new password must be at least 6 characters)' });
    }

    try {
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Old password is not correct' });
        }
        
        user.password = newPassword;
        await user.save();

        res.status(200).json({ msg: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


export default router;
