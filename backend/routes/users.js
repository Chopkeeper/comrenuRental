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

// @desc    Update a user's details by Admin
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const { name, position, department, employeeType } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name && name !== user.name) {
            const existingUser = await User.findOne({ name });
            if (existingUser && existingUser._id.toString() !== req.params.id) {
                return res.status(400).json({ msg: 'Username is already taken' });
            }
        }

        user.name = name || user.name;
        user.position = position !== undefined ? position : user.position;
        user.department = department !== undefined ? department : user.department;
        user.employeeType = employeeType !== undefined ? employeeType : user.employeeType;

        const updatedUser = await user.save();
        res.json(updatedUser);

    } catch (error) {
        res.status(400).json({ msg: 'Failed to update user', error: error.message });
    }
});


// @desc    Update a user's role by Admin
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, admin, async (req, res) => {
    const { role } = req.body;
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ msg: 'Admins cannot change their own role.' });
        }
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = role;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ msg: 'Failed to update user role', error: error.message });
    }
});

// @desc    Reset a user's password by Admin
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
router.put('/:id/reset-password', protect, admin, async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ msg: 'Admins cannot reset their own password via this route.' });
        }
        const user = await User.findById(req.params.id);
        if (user) {
            const tempPassword = Math.random().toString(36).slice(-8);
            user.password = tempPassword;
            await user.save();
            res.json({ msg: 'Password reset successfully.', tempPassword });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @desc    Delete all non-admin users by Admin
// @route   DELETE /api/users/all
// @access  Private/Admin
router.delete('/all', protect, admin, async (req, res) => {
    try {
        const usersToDelete = await User.find({ role: 'user' });
        const userIdsToDelete = usersToDelete.map(user => user._id);

        if (userIdsToDelete.length > 0) {
            await Booking.deleteMany({ userId: { $in: userIdsToDelete } });
            await User.deleteMany({ _id: { $in: userIdsToDelete } });
        }

        res.json({ msg: `${userIdsToDelete.length} users and their bookings have been deleted.` });
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;