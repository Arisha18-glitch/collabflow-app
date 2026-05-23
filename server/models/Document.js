const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    content: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        default: 'General',
        enum: ['Academic', 'Design', 'Planning', 'Research', 'General'],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,  // createdAt, updatedAt
});

module.exports = mongoose.model('Document', documentSchema);
