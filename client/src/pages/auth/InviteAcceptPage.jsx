import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { acceptInvitationAPI } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

export default function InviteAcceptPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuthStore();
    const [status, setStatus] = useState('verifying'); // verifying, error
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Wait until auth state is resolved
        if (authLoading) return;

        if (!isAuthenticated) {
            // Must be logged in to accept. For MVP, redirect to login, then they must click the link again.
            // Ideally we'd store the token in local storage and redirect after login.
            navigate('/login');
            return;
        }

        const acceptInvite = async () => {
            try {
                const { data } = await acceptInvitationAPI(token);
                // Redirect straight to the editor on success
                navigate(`/editor/${data.documentId}`);
            } catch (err) {
                setStatus('error');
                setErrorMessage(err.response?.data?.message || 'Failed to accept invitation');
            }
        };

        acceptInvite();
    }, [token, isAuthenticated, authLoading, navigate]);

    if (status === 'verifying') {
        return (
            <div className="invite-accept-page" style={styles.container}>
                <div style={styles.card}>
                    <div className="invite-dispatch-ring" style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 16px' }}></div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Verifying Secure Link...</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Please wait while we validate your invitation token.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="invite-accept-page" style={styles.container}>
            <div style={styles.card}>
                <div style={{ color: '#ef4444', fontSize: '3rem', marginBottom: 16 }}>⚠</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Invalid Link</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 24 }}>{errorMessage}</p>
                <button 
                    className="neon-btn" 
                    onClick={() => navigate('/documents')}
                    style={{ background: 'linear-gradient(135deg, var(--purple), var(--pink))', padding: '12px 24px', borderRadius: 8, border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg)',
        padding: 24,
    },
    card: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border)',
        padding: 40,
        borderRadius: 24,
        textAlign: 'center',
        maxWidth: 400,
        width: '100%',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)',
    }
};
