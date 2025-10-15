import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Computer from '../models/Computer.js';

const router = express.Router();

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // Admins see all, users see their own
        const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
        const bookings = await Booking.find(filter);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
    const { computerId, startDate, endDate, reason } = req.body;
    try {
        // Ensure computer exists
        const computer = await Computer.findById(computerId);
        if (!computer) {
            return res.status(404).json({ msg: 'Computer not found' });
        }
        
        const booking = new Booking({
            computerId,
            userId: req.user.id,
            startDate,
            endDate,
            reason
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);

    } catch (error) {
        res.status(400).json({ msg: 'Failed to create booking', error: error.message });
    }
});

// @desc    Update a booking
// @route   PUT /api/bookings/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { startDate, endDate, reason } = req.body;
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Check if user is admin or owner of the booking
        if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'User not authorized to update this booking' });
        }
        
        // When updating, it might need re-approval if dates change significantly.
        // For simplicity here, we just update. An admin can always see it.
        // If an admin updates, it remains 'confirmed'. If a user updates, it should revert to 'pending'.
        booking.startDate = startDate || booking.startDate;
        booking.endDate = endDate || booking.endDate;
        booking.reason = reason || booking.reason;
        
        if (req.user.role !== 'admin') {
            booking.status = 'pending';
        }

        const updatedBooking = await booking.save();
        res.json(updatedBooking);

    } catch (error) {
        res.status(400).json({ msg: 'Failed to update booking', error: error.message });
    }
});


// @desc    Approve a booking
// @route   PUT /api/bookings/:id/approve
// @access  Private/Admin
router.put('/:id/approve', protect, admin, async (req, res) => {
    try {
        const bookingToApprove = await Booking.findById(req.params.id);

        if (!bookingToApprove) {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        
        // Check for conflicts
        const conflictingBooking = await Booking.findOne({
            computerId: bookingToApprove.computerId,
            status: 'confirmed',
            _id: { $ne: bookingToApprove._id },
            $or: [
                { startDate: { $lt: bookingToApprove.endDate, $gte: bookingToApprove.startDate } },
                { endDate: { $gt: bookingToApprove.startDate, $lte: bookingToApprove.endDate } }
            ]
        });
        
        if (conflictingBooking) {
            return res.status(409).json({ msg: 'This booking conflicts with another confirmed booking.' });
        }

        bookingToApprove.status = 'confirmed';
        await bookingToApprove.save();
        res.json(bookingToApprove);

    } catch (error) {
         res.status(500).json({ msg: 'Server Error', error: error.message });
    }
});


// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        
        // Allow admin or booking owner to delete
        if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        await booking.deleteOne();
        res.json({ msg: 'Booking removed' });

    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});


export default router;
