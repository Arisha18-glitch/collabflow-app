const express = require('express');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

// All routes are protected
router.use(protect);

// ─────────────────────────────────────────────
// GET /api/members — list all users (members)
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const members = await User.find().select('-__v').sort({ createdAt: 1 });

        // Map to the shape the frontend expects
        const mapped = members.map(m => ({
            _id: m._id,
            name: m.name,
            email: m.email,
            role: m.role,
            status: m.status,
            avatar: m.avatar,
            createdAt: m.createdAt,
        }));

        res.json(mapped);
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ message: 'Error fetching members' });
    }
});

// ─────────────────────────────────────────────
// PUT /api/members/:id/role — update member role
// ─────────────────────────────────────────────
router.put('/:id/role', requireRole(['Owner']), async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['Owner', 'Editor', 'Viewer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Error updating role' });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/members/:id — remove member
// ─────────────────────────────────────────────
router.delete('/:id', requireRole(['Owner']), async (req, res) => {
    try {
        // Don't allow deleting yourself
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot remove yourself' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Log activity
        await Activity.create({
            user: req.user._id,
            action: 'removed',
            target: user.name,
            targetType: 'member',
        });

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Member removed', id: req.params.id });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ message: 'Error removing member' });
    }
});

module.exports = router;
