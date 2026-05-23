const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        // e.g. 'edited', 'created', 'deleted', 'commented on', 'invited', 'resolved'
    },
    target: {
        type: String,
        required: true,
        // e.g. document title, member name, etc.
    },
    targetType: {
        type: String,
        enum: ['document', 'member', 'workspace', 'comment'],
        default: 'document',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Activity', activitySchema);
