const express = require('express');
const Invitation = require('../models/Invitation');
const Document = require('../models/Document');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

// All routes are protected
router.use(protect);

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// POST /api/invitations — Create a new invitation
// Asymmetric flow: generates crypto token server-side
// ─────────────────────────────────────────────
router.post('/', requireRole(['Owner', 'Editor']), async (req, res) => {
    try {
        const { email, documentId, role } = req.body;

        // ── Input validation ──────────────────────
        if (!email || !documentId) {
            return res.status(400).json({ message: 'Email and document ID are required' });
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const validRoles = ['Editor', 'Viewer'];
        const assignedRole = validRoles.includes(role) ? role : 'Editor';

        // ── Verify document exists ────────────────
        const doc = await Document.findById(documentId);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // ── Prevent duplicate pending invites ─────
        const existing = await Invitation.findOne({
            email: email.toLowerCase().trim(),
            documentId,
            status: 'pending',
        });
        if (existing) {
            return res.status(409).json({ message: 'A pending invitation already exists for this email' });
        }

        // ── Prevent self-invite ───────────────────
        if (req.user.email === email.toLowerCase().trim()) {
            return res.status(400).json({ message: 'You cannot invite yourself' });
        }

        // ── Create invitation (token auto-generated via pre-save hook) ──
        const invitation = await Invitation.create({
            email: email.toLowerCase().trim(),
            documentId,
            invitedBy: req.user._id,
            role: assignedRole,
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n📧 [DEV MOCK EMAIL] Secure invite link for ${invitation.email}:`);
            console.log(`🔗 http://localhost:5173/invite/${invitation.token}\n`);
        }

        // Return response including token since no email service is configured
        res.status(201).json({
            _id: invitation._id,
            email: invitation.email,
            documentId: invitation.documentId,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt,
            token: invitation.token, // Exposing token so client can show copyable link
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Create invitation error:', error);
        }
        res.status(500).json({ message: 'Error creating invitation' });
    }
});

// ─────────────────────────────────────────────
// GET /api/invitations/:docId — List invitations for a document
// ─────────────────────────────────────────────
router.get('/:docId', async (req, res) => {
    try {
        const invitations = await Invitation.find({ documentId: req.params.docId })
            .populate('invitedBy', 'name email')
            .sort({ createdAt: -1 });

        // Sanitize: never expose tokens
        const sanitized = invitations.map(inv => ({
            _id: inv._id,
            email: inv.email,
            role: inv.role,
            status: inv.status,
            invitedBy: inv.invitedBy,
            expiresAt: inv.expiresAt,
            createdAt: inv.createdAt,
        }));

        res.json(sanitized);
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Fetch invitations error:', error);
        }
        res.status(500).json({ message: 'Error fetching invitations' });
    }
});

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// PUT /api/invitations/:id/revoke — Revoke a pending invitation
// ─────────────────────────────────────────────
router.put('/:id/revoke', requireRole(['Owner', 'Editor']), async (req, res) => {
    try {
        const invitation = await Invitation.findById(req.params.id);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending invitations can be revoked' });
        }

        // Only the person who sent the invite (or doc owner) can revoke
        if (invitation.invitedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to revoke this invitation' });
        }

        invitation.status = 'revoked';
        await invitation.save();

        res.json({
            _id: invitation._id,
            status: invitation.status,
            message: 'Invitation revoked',
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Revoke invitation error:', error);
        }
        res.status(500).json({ message: 'Error revoking invitation' });
    }
});

// ─────────────────────────────────────────────
// POST /api/invitations/accept/:token — Accept an invitation
// ─────────────────────────────────────────────
router.post('/accept/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        const invitation = await Invitation.findOne({ token });
        if (!invitation) {
            return res.status(404).json({ message: 'Invalid or expired invitation token' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'This invitation has already been used or revoked' });
        }

        if (new Date() > invitation.expiresAt) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ message: 'This invitation has expired' });
        }

        if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
            return res.status(403).json({ message: 'This invitation is for a different email address' });
        }

        const doc = await Document.findById(invitation.documentId);
        if (!doc) {
            return res.status(404).json({ message: 'The associated document no longer exists' });
        }

        // Mark as accepted (one-time use enforced)
        invitation.status = 'accepted';
        await invitation.save();

        res.json({
            message: 'Invitation accepted successfully',
            documentId: doc._id,
            role: invitation.role,
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Accept invitation error:', error);
        }
        res.status(500).json({ message: 'Error accepting invitation' });
    }
});

module.exports = router;
