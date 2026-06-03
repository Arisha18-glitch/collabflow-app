const express = require('express');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { sanitizeHtml } = require('../utils/sanitize');

const router = express.Router();

// All routes are protected
router.use(protect);

// ─────────────────────────────────────────────
// GET /api/documents — list all documents
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const docs = await Document.find({
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id },
            ],
        })
            .populate('owner', 'name email role')
            .populate('lastEditedBy', 'name')
            .sort({ updatedAt: -1 });

        res.json(docs);
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ message: 'Error fetching documents' });
    }
});

// ─────────────────────────────────────────────
// GET /api/documents/:id — get single document
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id)
            .populate('owner', 'name email role')
            .populate('lastEditedBy', 'name');

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json(doc);
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ message: 'Error fetching document' });
    }
});

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// POST /api/documents — create new document
// ─────────────────────────────────────────────
router.post('/', requireRole(['Owner', 'Editor']), async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const doc = await Document.create({
            title: title || 'Untitled Document',
            content: sanitizeHtml(content || `<h2>${title || 'Untitled'}</h2><p>Start writing here...</p>`),
            category: category || 'General',
            owner: req.user._id,
            lastEditedBy: req.user._id,
        });

        const populated = await Document.findById(doc._id)
            .populate('owner', 'name email role')
            .populate('lastEditedBy', 'name');

        // Log activity
        await Activity.create({
            user: req.user._id,
            action: 'created',
            target: title,
            targetType: 'document',
        });

        res.status(201).json(populated);
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({ message: 'Error creating document' });
    }
});

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// PUT /api/documents/:id — update document
// ─────────────────────────────────────────────
router.put('/:id', requireRole(['Owner', 'Editor']), async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const doc = await Document.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check if user is owner or collaborator
        const isOwner = doc.owner.toString() === req.user._id.toString();
        const isCollaborator = doc.collaborators && doc.collaborators.some(c => c.toString() === req.user._id.toString());
        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ message: 'Not authorized to edit this document' });
        }

        // Save current state to versions if content is changing
        if (content !== undefined && doc.content && doc.content !== content) {
            doc.versions.push({
                content: doc.content,
                savedBy: doc.lastEditedBy || doc.owner,
                savedAt: doc.updatedAt
            });
            // Keep only the last 20 versions
            if (doc.versions.length > 20) {
                doc.versions.shift();
            }
        }

        if (title !== undefined) doc.title = title;
        if (content !== undefined) doc.content = sanitizeHtml(content);
        if (category !== undefined) doc.category = category;
        doc.lastEditedBy = req.user._id;

        await doc.save();

        const populated = await Document.findById(doc._id)
            .populate('owner', 'name email role')
            .populate('lastEditedBy', 'name');

        res.json(populated);
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({ message: 'Error updating document' });
    }
});

// ─────────────────────────────────────────────
// GET /api/documents/:id/versions — get version history
// ─────────────────────────────────────────────
router.get('/:id/versions', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id)
            .populate('versions.savedBy', 'name')
            .select('versions');
            
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Map versions for frontend
        const versions = doc.versions.map(v => ({
            id: v._id,
            content: v.content,
            savedBy: v.savedBy?.name || 'Unknown',
            savedAt: v.savedAt
        })).reverse(); // Newest first

        res.json(versions);
    } catch (error) {
        console.error('Get versions error:', error);
        res.status(500).json({ message: 'Error fetching versions' });
    }
});

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// DELETE /api/documents/:id — delete document
// ─────────────────────────────────────────────
router.delete('/:id', requireRole(['Owner']), async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Log activity before deleting
        await Activity.create({
            user: req.user._id,
            action: 'deleted',
            target: doc.title,
            targetType: 'document',
        });

        await Document.findByIdAndDelete(req.params.id);

        res.json({ message: 'Document deleted', id: req.params.id });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ message: 'Error deleting document' });
    }
});

module.exports = router;
