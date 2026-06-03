const express = require('express');
const User = require('../models/User');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─────────────────────────────────────────────
// GET /api/stats — get workspace stats (scoped to user)
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        // Find documents the user owns or collaborates on
        const docs = await Document.find({
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id },
            ],
        }).select('owner collaborators');

        const totalDocs = docs.length;

        // Collect unique collaborator IDs
        const userIdSet = new Set();
        userIdSet.add(req.user._id.toString());
        for (const doc of docs) {
            if (doc.owner) userIdSet.add(doc.owner.toString());
            for (const collab of doc.collaborators || []) {
                userIdSet.add(collab.toString());
            }
        }

        const memberIds = [...userIdSet];
        const totalMembers = memberIds.length;
        const onlineMembers = await User.countDocuments({
            _id: { $in: memberIds },
            status: 'Online',
        });

        const totalActivities = await Activity.countDocuments({
            user: { $in: memberIds },
        });

        // Calculate dynamic active time (roughly 12 mins per recorded activity)
        const totalMinutes = totalActivities * 12;
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const activeTime = `${hours}h ${mins}m`;

        // Calculate dynamic efficiency (baseline 85% + bonuses based on doc/activity ratio)
        const efficiency = totalActivities > 0 
            ? Math.min(99.8, Math.max(85.0, 85 + (totalDocs / totalActivities) * 15)).toFixed(1)
            : '0.0';

        res.json({
            totalEdits: totalActivities,
            efficiency: parseFloat(efficiency),
            activeTime: activeTime,
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
// GET /api/stats/activity — get recent activity feed (scoped to user)
// ─────────────────────────────────────────────
router.get('/activity', async (req, res) => {
    try {
        // Find documents the user owns or collaborates on
        const docs = await Document.find({
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id },
            ],
        }).select('owner collaborators');

        // Collect unique collaborator IDs
        const userIdSet = new Set();
        userIdSet.add(req.user._id.toString());
        for (const doc of docs) {
            if (doc.owner) userIdSet.add(doc.owner.toString());
            for (const collab of doc.collaborators || []) {
                userIdSet.add(collab.toString());
            }
        }

        const activities = await Activity.find({
            user: { $in: [...userIdSet] },
        })
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

// ─────────────────────────────────────────────
// GET /api/stats/weekly — get weekly activity data (scoped to user)
// ─────────────────────────────────────────────
router.get('/weekly', async (req, res) => {
    try {
        // Find documents the user owns or collaborates on
        const docs = await Document.find({
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id },
            ],
        }).select('owner collaborators');

        // Collect unique collaborator IDs
        const userIdSet = new Set();
        userIdSet.add(req.user._id.toString());
        for (const doc of docs) {
            if (doc.owner) userIdSet.add(doc.owner.toString());
            for (const collab of doc.collaborators || []) {
                userIdSet.add(collab.toString());
            }
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivities = await Activity.find({
            user: { $in: [...userIdSet] },
            createdAt: { $gte: sevenDaysAgo }
        }).populate('user', 'name role');

        // Initialize weekly data array with last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyDataMap = new Map();
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            // Assign a color based on the day
            const color = ['var(--pink)', 'var(--blue)', 'var(--purple)', 'var(--green)'][i % 4];
            weeklyDataMap.set(d.toDateString(), { day: dayName, edits: 0, color });
        }

        const memberContribsMap = new Map();

        recentActivities.forEach(activity => {
            // Aggregate daily edits
            const activityDate = new Date(activity.createdAt).toDateString();
            if (weeklyDataMap.has(activityDate)) {
                const dayData = weeklyDataMap.get(activityDate);
                dayData.edits += 1;
            }

            // Aggregate member contributions
            if (activity.user) {
                const userId = activity.user._id.toString();
                if (!memberContribsMap.has(userId)) {
                    const roleColors = { Owner: 'var(--pink)', Editor: 'var(--blue)', Viewer: 'var(--green)' };
                    memberContribsMap.set(userId, {
                        id: userId,
                        name: activity.user.name,
                        role: activity.user.role,
                        color: roleColors[activity.user.role] || '#fff',
                        edits: 0
                    });
                }
                memberContribsMap.get(userId).edits += 1;
            }
        });

        res.json({
            weeklyData: Array.from(weeklyDataMap.values()),
            memberContribs: Array.from(memberContribsMap.values()).sort((a, b) => b.edits - a.edits)
        });
    } catch (error) {
        console.error('Get weekly stats error:', error);
        res.status(500).json({ message: 'Error fetching weekly stats' });
    }
});

module.exports = router;
