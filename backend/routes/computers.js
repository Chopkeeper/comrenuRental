import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import Computer from '../models/Computer.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// @desc    Get all computers
// @route   GET /api/computers
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const computers = await Computer.find({});
        res.json(computers);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @desc    Add a new computer
// @route   POST /api/computers
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { assetNumber, name, imageUrl, purchaseYear, description } = req.body;
    try {
        const computer = new Computer({
            assetNumber,
            name,
            imageUrl,
            purchaseYear,
            description
        });
        const createdComputer = await computer.save();
        res.status(201).json(createdComputer);
    } catch (error) {
        res.status(400).json({ msg: 'Failed to create computer', error: error.message });
    }
});

// @desc    Update a computer
// @route   PUT /api/computers/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const { assetNumber, name, imageUrl, purchaseYear, description } = req.body;
    try {
        const computer = await Computer.findById(req.params.id);
        if (computer) {
            computer.assetNumber = assetNumber || computer.assetNumber;
            computer.name = name || computer.name;
            computer.imageUrl = imageUrl || computer.imageUrl;
            computer.purchaseYear = purchaseYear || computer.purchaseYear;
            computer.description = description || computer.description;

            const updatedComputer = await computer.save();
            res.json(updatedComputer);
        } else {
            res.status(404).json({ msg: 'Computer not found' });
        }
    } catch (error) {
        res.status(400).json({ msg: 'Failed to update computer', error: error.message });
    }
});

// @desc    Delete a computer
// @route   DELETE /api/computers/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const computer = await Computer.findById(req.params.id);
        if (computer) {
            await computer.deleteOne();
            // Also delete associated bookings
            await Booking.deleteMany({ computerId: req.params.id });
            res.json({ msg: 'Computer and associated bookings removed' });
        } else {
            res.status(404).json({ msg: 'Computer not found' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
});


export default router;
