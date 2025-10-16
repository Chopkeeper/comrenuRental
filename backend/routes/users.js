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

// @desc    Reset a user's password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
router.put('/:id/reset-password', protect, admin, async (req, res) => {
    try {
        // Prevent admin from resetting their own password this way for security
        if (req.params.id === req.user.id) {
            return res.status(400).json({ msg: 'ผู้ดูแลระบบควรเปลี่ยนรหัสผ่านของตนเองผ่านหน้าโปรไฟล์' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate a simple, temporary password
        const temporaryPassword = Math.random().toString(36).slice(-8);
        user.password = temporaryPassword;
        await user.save(); // The pre-save hook will hash it

        res.json({ msg: 'Password reset successfully', temporaryPassword });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @desc    Delete all non-admin users
// @route   DELETE /api/users/all
// @access  Private/Admin
router.delete('/all', protect, admin, async (req, res) => {
    try {
        // Find all non-admin users
        const usersToDelete = await User.find({ role: { $ne: 'admin' } });
        const userIdsToDelete = usersToDelete.map(user => user._id);

        if (userIdsToDelete.length > 0) {
            // Delete associated bookings
            await Booking.deleteMany({ userId: { $in: userIdsToDelete } });
            // Delete the users
            await User.deleteMany({ _id: { $in: userIdsToDelete } });
        }

        res.json({ msg: `${userIdsToDelete.length} users and their associated bookings have been removed.` });

    } catch (error) {
        console.error(error.message);
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