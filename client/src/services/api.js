import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Attach JWT token to every request ───────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cf_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Handle 401 responses (expired token) ────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('cf_token');
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ═══════════════════════════════════════════════
// Auth API
// ═══════════════════════════════════════════════
export const registerAPI = (data) => api.post('/auth/register', data);
export const loginAPI = (data) => api.post('/auth/login', data);
export const getMeAPI = () => api.get('/auth/me');
export const updateProfileAPI = (data) => api.put('/auth/profile', data);

// ═══════════════════════════════════════════════
// Documents API
// ═══════════════════════════════════════════════
export const fetchDocsAPI = () => api.get('/documents');
export const fetchDocAPI = (id) => api.get(`/documents/${id}`);
export const createDocAPI = (data) => api.post('/documents', data);
export const updateDocAPI = (id, data) => api.put(`/documents/${id}`, data);
export const deleteDocAPI = (id) => api.delete(`/documents/${id}`);

// ═══════════════════════════════════════════════
// Members API
// ═══════════════════════════════════════════════
export const fetchMembersAPI = () => api.get('/members');
export const updateMemberRoleAPI = (id, role) => api.put(`/members/${id}/role`, { role });
export const removeMemberAPI = (id) => api.delete(`/members/${id}`);

// ═══════════════════════════════════════════════
// Stats API
// ═══════════════════════════════════════════════
export const fetchStatsAPI = () => api.get('/stats');
export const fetchActivityAPI = () => api.get('/stats/activity');

// ═══════════════════════════════════════════════
// Invitations API
// ═══════════════════════════════════════════════
export const createInvitationAPI = (data) => api.post('/invitations', data);
export const fetchInvitationsAPI = (docId) => api.get(`/invitations/${docId}`);
export const revokeInvitationAPI = (id) => api.put(`/invitations/${id}/revoke`);
export const acceptInvitationAPI = (token) => api.post(`/invitations/accept/${token}`);

// ═══════════════════════════════════════════════
// AI API
// ═══════════════════════════════════════════════
export const proofreadAPI = (text) => api.post('/ai/proofread', { text });

export default api;
