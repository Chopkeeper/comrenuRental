import mongoose from 'mongoose';

const ComputerSchema = new mongoose.Schema({
    assetNumber: {
        type: String,
        required: [true, 'Please add an asset number'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    purchaseYear: {
        type: Number,
        required: [true, 'Please add a purchase year']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Rename _id to id
ComputerSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

export default mongoose.model('Computer', ComputerSchema);
