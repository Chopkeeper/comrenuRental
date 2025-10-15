import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    computerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Computer',
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed'],
        default: 'pending'
    },
    reason: {
        type: String,
        required: [true, 'Please add a reason']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Rename _id to id
BookingSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

export default mongoose.model('Booking', BookingSchema);
