import { create } from 'zustand';
import { loginAPI, registerAPI, getMeAPI, updateProfileAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    currentWorkspace: { name: 'Team Collab' },

    // ─── Register ────────────────────────────────
    register: async ({ name, email, password, role }) => {
        set({ loading: true, error: null });
        try {
            const { data } = await registerAPI({ name, email, password, role });
            localStorage.setItem('cf_token', data.token);
            set({
                user: data.user,
                isAuthenticated: true,
                loading: false,
                error: null,
            });
            return data;
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },

    // ─── Login ───────────────────────────────────
    login: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
            const { data } = await loginAPI({ email, password });
            localStorage.setItem('cf_token', data.token);
            set({
                user: data.user,
                isAuthenticated: true,
                loading: false,
                error: null,
            });
            return data;
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },

    // ─── Check Auth (on app load) ────────────────
    checkAuth: async () => {
        const token = localStorage.getItem('cf_token');
        if (!token) {
            set({ user: null, isAuthenticated: false });
            return;
        }
        try {
            const { data } = await getMeAPI();
            set({
                user: data.user,
                isAuthenticated: true,
            });
        } catch {
            localStorage.removeItem('cf_token');
            set({ user: null, isAuthenticated: false });
        }
    },

    // ─── Update Profile ──────────────────────────
    updateProfile: async ({ name, email }) => {
        set({ loading: true, error: null });
        try {
            const { data } = await updateProfileAPI({ name, email });
            set({ user: data.user, loading: false });
            return data;
        } catch (err) {
            const message = err.response?.data?.message || 'Update failed';
            set({ loading: false, error: message });
            throw new Error(message);
        }
    },

    // ─── Logout ──────────────────────────────────
    logout: () => {
        localStorage.removeItem('cf_token');
        set({ user: null, isAuthenticated: false, error: null });
    },

    setWorkspace: (ws) => set({ currentWorkspace: ws }),
    clearError: () => set({ error: null }),
}));