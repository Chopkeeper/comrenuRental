import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({ msg: 'ผู้ดูแลระบบไม่สามารถลบบัญชีของตนเองได้' });
        }

        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            // Also delete associated bookings
            await Booking.deleteMany({ userId: req.params.id });
            res.json({ msg: 'User and associated bookings removed' });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


export default router;