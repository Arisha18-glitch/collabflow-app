const mongoose = require('mongoose');
const crypto = require('crypto');

const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Invitee email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        unique: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired', 'revoked'],
        default: 'pending',
    },
    role: {
        type: String,
        enum: ['Editor', 'Viewer'],
        default: 'Editor',
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

// Generate cryptographic token before validation
invitationSchema.pre('validate', function (next) {
    if (!this.token) {
        this.token = crypto.randomBytes(32).toString('hex');
    }
    if (!this.expiresAt) {
        // 72-hour TTL
        this.expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    }
    next();
});

// Index for efficient lookups + TTL auto-expiry queries
invitationSchema.index({ documentId: 1, status: 1 });
invitationSchema.index({ token: 1 }, { unique: true });
invitationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
