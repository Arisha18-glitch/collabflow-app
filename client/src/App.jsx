import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuthStore } from './store/useAuthStore';
import AppLayout from './components/AppLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DocumentsList from './pages/documents/DocumentsList';
import WorkspacePage from './components/workspace/WorkspacePage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import EditorPage from './pages/editor/EditorPage';
import SettingsPage from './pages/settings/SettingsPage';
import InviteAcceptPage from './pages/auth/InviteAcceptPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    const { checkAuth, isAuthenticated } = useAuthStore();

    // Check auth on app load (restore session from JWT in localStorage)
    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Login />
                } />
                <Route path="/" element={
                    <ProtectedRoute>
                        <AppLayout><Dashboard /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/documents" element={
                    <ProtectedRoute>
                        <AppLayout><DocumentsList /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/workspace" element={
                    <ProtectedRoute>
                        <AppLayout><WorkspacePage /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                    <ProtectedRoute>
                        <AppLayout><AnalyticsPage /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/editor/:docId" element={
                    <ProtectedRoute>
                        <AppLayout><EditorPage /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <AppLayout><SettingsPage /></AppLayout>
                    </ProtectedRoute>
                } />
                <Route path="/invite/:token" element={
                    <ProtectedRoute>
                        <InviteAcceptPage />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}