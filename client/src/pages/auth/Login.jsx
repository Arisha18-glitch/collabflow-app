import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import InteractiveMascot from '../../components/ui/InteractiveMascot';

const ROLES = ['Owner', 'Editor', 'Viewer'];

const ROLE_META = {
    Owner: { color: 'var(--pink)', desc: 'Full access', glow: 'color-mix(in srgb, var(--pink) 25%, transparent)' },
    Editor: { color: 'var(--blue)', desc: 'Create & edit', glow: 'color-mix(in srgb, var(--blue) 25%, transparent)' },
    Viewer: { color: 'var(--green)', desc: 'Read only', glow: 'color-mix(in srgb, var(--green) 25%, transparent)' },
};

export default function Login() {
    const navigate = useNavigate();
    const { login, register, loading, error, clearError } = useAuthStore();

    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRoleSt] = useState('Owner');
    const [localError, setLocalError] = useState('');

    const handleSubmit = async () => {
        setLocalError('');
        clearError?.();

        if (isRegister) {
            if (!name.trim()) { setLocalError('Name is required'); return; }
            if (!email.trim()) { setLocalError('Email is required'); return; }
            if (!password || password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }

            try {
                await register({ name: name.trim(), email: email.trim(), password, role });
                navigate('/');
            } catch (err) {
                setLocalError(err.message);
            }
        } else {
            if (!email.trim()) { setLocalError('Email is required'); return; }
            if (!password) { setLocalError('Password is required'); return; }

            try {
                await login({ email: email.trim(), password });
                navigate('/');
            } catch (err) {
                setLocalError(err.message);
            }
        }
    };

    const displayError = localError || error;

    return (
        <div className="login-page">
            <div className="login-card">
                {/* ── Single mascot sitting on top of card ── */}
                <div className="login-card-mascot">
                    <InteractiveMascot variant="bot" size={110} />
                </div>

                <div className="login-logo">CollabFlow</div>
                <p className="login-subtitle">Your real-time collaborative workspace</p>

                {/* Toggle Register / Login */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 18, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <button
                        id="toggle-login"
                        onClick={() => { setIsRegister(false); setLocalError(''); clearError?.(); }}
                        style={{
                            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700,
                            fontSize: '0.85rem', letterSpacing: '-0.02em',
                            background: !isRegister ? 'color-mix(in srgb, var(--pink) 15%, transparent)' : 'transparent',
                            color: !isRegister ? '#fff' : 'var(--text-dim)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        id="toggle-register"
                        onClick={() => { setIsRegister(true); setLocalError(''); clearError?.(); }}
                        style={{
                            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700,
                            fontSize: '0.85rem', letterSpacing: '-0.02em',
                            background: isRegister ? 'color-mix(in srgb, var(--blue) 15%, transparent)' : 'transparent',
                            color: isRegister ? '#fff' : 'var(--text-dim)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Register
                    </button>
                </div>

                {/* Name (only for register) */}
                {isRegister && (
                    <input
                        id="login-name"
                        className="cf-input"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                )}

                <input
                    id="login-email"
                    className="cf-input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    id="login-password"
                    className="cf-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                {/* Role selector (only for register) */}
                {isRegister && (
                    <div style={{ marginBottom: 8 }}>
                        <span className="label-text" style={{ marginBottom: 10 }}>Join as</span>
                        <div className="role-selector">
                            {ROLES.map((r) => {
                                const meta = ROLE_META[r];
                                const isActive = role === r;
                                return (
                                    <button
                                        key={r}
                                        id={`role-${r.toLowerCase()}`}
                                        className={`role-option${isActive ? ' selected' : ''}`}
                                        onClick={() => setRoleSt(r)}
                                        style={isActive ? {
                                            borderColor: meta.color,
                                            background: `${meta.color}18`,
                                            boxShadow: `0 0 20px ${meta.glow}, inset 0 0 20px ${meta.color}08`,
                                        } : {}}
                                    >
                                        <span
                                            className="role-badge-small"
                                            style={{
                                                background: meta.color,
                                                boxShadow: isActive ? `0 0 14px ${meta.glow}` : 'none',
                                            }}
                                        >
                                            {r[0]}
                                        </span>
                                        <span style={{ display: 'block', fontWeight: 700, color: isActive ? '#fff' : undefined }}>{r}</span>
                                        <span style={{ display: 'block', fontSize: '0.65rem', opacity: 0.6, marginTop: 2 }}>{meta.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Error message */}
                {displayError && (
                    <p style={{
                        color: 'var(--pink)',
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        padding: '8px 14px',
                        background: 'color-mix(in srgb, var(--pink) 8%, transparent)',
                        borderRadius: 10,
                        border: '1px solid color-mix(in srgb, var(--pink) 20%, transparent)',
                        marginBottom: 8,
                    }}>
                        {displayError}
                    </p>
                )}

                <button
                    id="login-btn"
                    className="neon-btn login-enter-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        width: '100%', marginTop: 12,
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading
                        ? (isRegister ? 'Creating Account...' : 'Signing In...')
                        : (isRegister ? 'Create Account →' : 'Sign In →')
                    }
                </button>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', marginTop: 20 }}>
                    {isRegister ? '🔐 Your data is securely stored' : '👀 The bot is watching you type...'}
                </p>
            </div>
        </div>
    );
}