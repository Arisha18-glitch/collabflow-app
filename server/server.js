require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const memberRoutes = require('./routes/members');
const statsRoutes = require('./routes/stats');
const invitationRoutes = require('./routes/invitations');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Middleware ────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'https://collabflow-app-omega.vercel.app'],
    credentials: true,
}));

// Reduce payload limit from 10mb to 500kb to prevent DoS
app.use(express.json({ limit: '500kb' }));

// Global Rate Limiter: max 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Stricter Rate Limiter for Auth Routes: max 10 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many authentication attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── Routes ──────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: '🚀 CollabFlow API is running' });
});

// ─── Start Server ────────────────────────────
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n🚀 CollabFlow API running on http://localhost:${PORT}`);
            console.log(`📦 Routes: /api/auth, /api/documents, /api/members, /api/stats, /api/invitations, /api/ai\n`);
        }
    });
};

startServer();
