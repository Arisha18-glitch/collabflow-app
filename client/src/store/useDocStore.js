import { create } from 'zustand';
import {
    fetchDocsAPI, createDocAPI, updateDocAPI, deleteDocAPI,
    fetchMembersAPI, removeMemberAPI,
    fetchStatsAPI, fetchActivityAPI,
} from '../services/api';

const ROLE_PERMISSIONS = {
    Owner:  ['create', 'edit', 'delete', 'invite'],
    Editor: ['create', 'edit'],
    Viewer: ['view'],
};

// Returns current theme colors by reading CSS variables
const getRoleColors = () => {
    const s = getComputedStyle(document.documentElement);
    return {
        Owner:  s.getPropertyValue('--pink').trim()  || '#ec4899',
        Editor: s.getPropertyValue('--blue').trim()  || '#22d3ee',
        Viewer: s.getPropertyValue('--green').trim() || '#10b981',
    };
};

export const useDocStore = create((set, get) => ({
    // ─── State ────────────────────────────────────
    activeDocId: null,
    currentUserRole: 'Owner',

    docs: [],
    members: [],
    stats: {
        totalEdits: 0,
        efficiency: 98.2,
        activeTime: '0h 0m',
        docsCreated: 0,
        membersCount: 0,
    },
    activity: [],

    loading: false,
    error: null,

    // ─── Fetch Documents from API ─────────────────
    fetchDocuments: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await fetchDocsAPI();
            // Map MongoDB docs to the shape the frontend expects
            const mapped = data.map(d => ({
                id: d._id,
                title: d.title,
                content: d.content,
                category: d.category,
                lastEdited: getTimeAgo(d.updatedAt),
                owner: d.owner,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
            }));
            set({ docs: mapped, loading: false });
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message || 'Error fetching documents' });
        }
    },

    // ─── Fetch Members from API ───────────────────
    fetchMembers: async () => {
        try {
            const { data } = await fetchMembersAPI();
            const mapped = data.map(m => ({
                id: m._id,
                name: m.name,
                email: m.email,
                role: m.role,
                color: getRoleColors()[m.role] || '#fff',
                status: m.status,
                permissions: ROLE_PERMISSIONS[m.role] || [],
                avatar: m.avatar,
            }));
            set({ members: mapped });
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error fetching members:', err);
            }
        }
    },

    // ─── Fetch Stats from API ─────────────────────
    fetchStats: async () => {
        try {
            const { data } = await fetchStatsAPI();
            set({ stats: data });
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error fetching stats:', err);
            }
        }
    },

    // ─── Fetch Activity from API ──────────────────
    fetchActivity: async () => {
        try {
            const { data } = await fetchActivityAPI();
            set({ activity: data });
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error fetching activity:', err);
            }
        }
    },

    // ─── Actions ──────────────────────────────────

    setActiveDoc: (id) => set({ activeDocId: id }),

    setCurrentUserRole: (role) => {
        const validRoles = ['Owner', 'Editor', 'Viewer'];
        if (!validRoles.includes(role)) return;
        set({ currentUserRole: role });
    },

    addDocument: async (title) => {
        try {
            const { data } = await createDocAPI({ title });
            const newDoc = {
                id: data._id,
                title: data.title,
                content: data.content,
                category: data.category,
                lastEdited: 'Just now',
                owner: data.owner,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };
            set((state) => ({
                docs: [newDoc, ...state.docs],
                activeDocId: newDoc.id,
            }));
            // Refresh stats
            get().fetchStats();
            return newDoc;
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error creating document:', err);
            }
            throw err;
        }
    },

    updateDocument: async (id, newContent) => {
        // Optimistic update
        set((state) => ({
            docs: state.docs.map(d =>
                d.id === id
                    ? { ...d, content: newContent, lastEdited: 'Just now' }
                    : d
            ),
        }));
        try {
            await updateDocAPI(id, { content: newContent });
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error saving document:', err);
            }
        }
    },

    deleteDocument: async (id) => {
        // Optimistic update
        set((state) => {
            const remaining = state.docs.filter(d => d.id !== id);
            return {
                docs: remaining,
                activeDocId: state.activeDocId === id
                    ? (remaining[0]?.id ?? null)
                    : state.activeDocId,
            };
        });
        try {
            await deleteDocAPI(id);
            get().fetchStats();
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error deleting document:', err);
            }
            // Re-fetch on error to sync state
            get().fetchDocuments();
        }
    },

    removeMember: async (id) => {
        // Optimistic update
        set((state) => ({
            members: state.members.filter(m => m.id !== id),
        }));
        try {
            await removeMemberAPI(id);
            get().fetchStats();
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error removing member:', err);
            }
            get().fetchMembers();
        }
    },

    // ─── Selectors ────────────────────────────────
    getActiveDoc: () => {
        const { docs, activeDocId } = get();
        return docs.find(d => d.id === activeDocId) ?? docs[0];
    },
}));

// Helper: human-readable time ago
function getTimeAgo(dateStr) {
    if (!dateStr) return '';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}