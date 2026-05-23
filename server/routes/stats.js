const express = require('express');
const User = require('../models/User');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─────────────────────────────────────────────
// GET /api/stats — get workspace stats
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const totalDocs = await Document.countDocuments();
        const totalMembers = await User.countDocuments();
        const totalActivities = await Activity.countDocuments();
        const onlineMembers = await User.countDocuments({ status: 'Online' });

        res.json({
            totalEdits: totalActivities,
            efficiency: 98.2,
            activeTime: '14h 22m',
            docsCreated: totalDocs,
            membersCount: totalMembers,
            onlineCount: onlineMembers,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// ─────────────────────────────────────────────
// GET /api/stats/activity — get recent activity feed
// ─────────────────────────────────────────────
router.get('/activity', async (req, res) => {
    try {
        const activities = await Activity.find()
            .populate('user', 'name role')
            .sort({ createdAt: -1 })
            .limit(10);

        // Map to the shape the frontend expects
        const mapped = activities.map(a => {
            const roleColors = { Owner: 'var(--pink)', Editor: 'var(--blue)', Viewer: 'var(--green)' };
            return {
                _id: a._id,
                user: a.user?.name || 'Unknown',
                action: a.action,
                target: a.target,
                time: getTimeAgo(a.createdAt),
                color: roleColors[a.user?.role] || '#fff',
            };
        });

        res.json(mapped);
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ message: 'Error fetching activity' });
    }
});

// Helper: human-readable time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

module.exports = router;
