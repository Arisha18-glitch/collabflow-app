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
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    versions: [{
        content: String,
        savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        savedAt: { type: Date, default: Date.now }
    }],
}, {
    timestamps: true,  // createdAt, updatedAt
});

module.exports = mongoose.model('Document', documentSchema);
