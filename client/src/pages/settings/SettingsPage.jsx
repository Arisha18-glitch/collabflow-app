import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocStore } from '../../store/useDocStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
    User, Shield, Bell, Palette, Globe, LogOut,
    Check, ChevronRight, Save
} from 'lucide-react';

const ROLES = ['Owner', 'Editor', 'Viewer'];
const ROLE_META = {
    Owner:  { color: 'var(--pink)',  desc: 'Full access — can invite, remove, create, edit, delete' },
    Editor: { color: 'var(--blue)',  desc: 'Create & Edit — cannot manage members or delete docs' },
    Viewer: { color: 'var(--green)', desc: 'Read only — can view docs but not make changes' },
};

const SECTIONS = [
    { id: 'profile',      icon: User,    label: 'Profile' },
    { id: 'permissions',  icon: Shield,  label: 'Permissions' },
    { id: 'appearance',   icon: Palette, label: 'Appearance' },
    { id: 'workspace',    icon: Globe,   label: 'Workspace' },
    { id: 'notifications',icon: Bell,    label: 'Notifications' },
];

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user, logout, updateProfile } = useAuthStore();
    const { currentUserRole, setCurrentUserRole, stats, members } = useDocStore();

    const [activeSection, setActiveSection] = useState('profile');
    const [displayName,   setDisplayName]   = useState(user?.name ?? '');
    const [email,         setEmail]         = useState(user?.email ?? '');
    const [savedMsg,      setSavedMsg]      = useState('');
    const [wsName,        setWsName]        = useState('Team Collab');
    const [notifs,        setNotifs]        = useState({ edits: true, invites: true, comments: false });
    const [saving,        setSaving]        = useState(false);
    const [currentTheme,  setCurrentTheme]  = useState(() => localStorage.getItem('cf_theme') || 'cyber-glass');

    // Use authenticated user's role
    const myRole = user?.role || currentUserRole;

    const showSaved = (msg = 'Saved!') => {
        setSavedMsg(msg);
        setTimeout(() => setSavedMsg(''), 2200);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile({ name: displayName.trim() || user?.name, email });
            showSaved('Profile updated!');
        } catch (err) {
            showSaved(err.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleThemeChange = (themeId) => {
        setCurrentTheme(themeId);
        localStorage.setItem('cf_theme', themeId);
        document.documentElement.setAttribute('data-theme', themeId);
        showSaved('Theme updated!');
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <span className="label-text">Account</span>
                <h1 className="hero-text" style={{ fontSize: '2.6rem', marginBottom: 4 }}>Settings</h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem' }}>
                    Manage your profile, permissions, and workspace preferences
                </p>
            </div>

            {/* Saved toast */}
            {savedMsg && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                    color: 'var(--green)', padding: '12px 20px', borderRadius: 14,
                    fontWeight: 700, fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', gap: 8,
                    backdropFilter: 'blur(20px)', animation: 'slide-up 0.25s ease',
                }}>
                    <Check size={16} /> {savedMsg}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
                {/* Sidebar nav */}
                <div className="module-box" style={{ padding: '16px', height: 'fit-content' }}>
                    {SECTIONS.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            id={`settings-tab-${id}`}
                            onClick={() => setActiveSection(id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                width: '100%', padding: '11px 14px', borderRadius: 12,
                                border: 'none', cursor: 'pointer',
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                fontSize: '0.88rem', fontWeight: 600, letterSpacing: '-0.02em',
                                transition: 'all 0.2s ease', marginBottom: 3, textAlign: 'left',
                                background: activeSection === id ? 'color-mix(in srgb, var(--pink) 12%, transparent)' : 'transparent',
                                color: activeSection === id ? '#fff' : 'rgba(255,255,255,0.5)',
                                borderLeft: activeSection === id ? '2px solid var(--pink)' : '2px solid transparent',
                            }}
                        >
                            <Icon size={16} />
                            {label}
                            {activeSection === id && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                        </button>
                    ))}

                    <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
                        <button
                            id="settings-logout-btn"
                            onClick={handleLogout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                width: '100%', padding: '11px 14px', borderRadius: 12,
                                border: 'none', cursor: 'pointer',
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                fontSize: '0.88rem', fontWeight: 600, letterSpacing: '-0.02em',
                                background: 'transparent', color: 'color-mix(in srgb, var(--pink) 80%, transparent)',
                                transition: 'all 0.2s ease', textAlign: 'left',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--pink) 10%, transparent)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Main panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* ── Profile ── */}
                    {activeSection === 'profile' && (
                        <>
                            <div className="module-box">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: 20,
                                        background: ROLE_META[myRole]?.color || 'var(--pink)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 900, fontSize: '1.8rem', color: '#000',
                                        boxShadow: '0 0 28px color-mix(in srgb, var(--pink) 35%, transparent)',
                                        flexShrink: 0,
                                    }}>
                                        {(displayName[0] || user?.name?.[0] || '?').toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.04em' }}>
                                            {user?.name || displayName}
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: ROLE_META[myRole]?.color || 'var(--pink)', fontWeight: 600, marginTop: 4 }}>
                                            {myRole} · CollabFlow
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                                            {user?.email}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                                            Display Name
                                        </label>
                                        <input
                                            id="settings-display-name"
                                            className="cf-input"
                                            style={{ marginBottom: 0 }}
                                            value={displayName}
                                            onChange={e => setDisplayName(e.target.value)}
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                                            Email
                                        </label>
                                        <input
                                            id="settings-email"
                                            className="cf-input"
                                            style={{ marginBottom: 0 }}
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    id="settings-save-profile"
                                    className="neon-btn"
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.6 : 1 }}
                                >
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>

                            <div className="module-box">
                                <span className="label-text" style={{ color: 'rgba(255,255,255,0.4)' }}>Quick Stats</span>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 14 }}>
                                    {[
                                        { label: 'Total Edits', value: stats.totalEdits, color: 'var(--green)' },
                                        { label: 'Documents',   value: stats.docsCreated, color: 'var(--pink)' },
                                        { label: 'Team Size',   value: stats.membersCount, color: 'var(--blue)' },
                                    ].map(s => (
                                        <div key={s.label} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 16, textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.05em', color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Permissions ── */}
                    {activeSection === 'permissions' && (
                        <div className="module-box">
                            <div style={{ marginBottom: 24 }}>
                                <span className="label-text">Your Role</span>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: 4 }}>
                                    Your role is set during registration. Contact an Owner to change it.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {ROLES.map((role) => {
                                    const meta = ROLE_META[role];
                                    const isActive = myRole === role;
                                    return (
                                        <div
                                            key={role}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 16,
                                                padding: '16px 20px', borderRadius: 18,
                                                border: `1px solid ${isActive ? meta.color : 'var(--border)'}`,
                                                background: isActive ? `${meta.color}12` : 'rgba(255,255,255,0.02)',
                                            }}
                                        >
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 13, background: meta.color,
                                                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 900, fontSize: '1.1rem', color: '#000',
                                                boxShadow: isActive ? `0 0 20px ${meta.color}55` : 'none',
                                            }}>
                                                {role[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isActive ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                                                    {role} {isActive && '← Your Role'}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                                                    {meta.desc}
                                                </div>
                                            </div>
                                            {isActive && <Check size={18} style={{ color: meta.color, flexShrink: 0 }} />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Permission Matrix */}
                            <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 10, color: 'rgba(255,255,255,0.6)' }}>Permission Matrix</div>
                                {[
                                    { perm: 'View documents',   owner: true,  editor: true,  viewer: true  },
                                    { perm: 'Create documents', owner: true,  editor: true,  viewer: false },
                                    { perm: 'Edit documents',   owner: true,  editor: true,  viewer: false },
                                    { perm: 'Delete documents', owner: true,  editor: false, viewer: false },
                                    { perm: 'Remove members',   owner: true,  editor: false, viewer: false },
                                ].map((row) => (
                                    <div key={row.perm} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div style={{ flex: 1, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{row.perm}</div>
                                        {['owner', 'editor', 'viewer'].map(r => (
                                            <div key={r} style={{ width: 70, textAlign: 'center' }}>
                                                {row[r]
                                                    ? <span style={{ color: 'var(--green)', fontSize: '0.8rem', fontWeight: 700 }}>✓</span>
                                                    : <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>—</span>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <div style={{ display: 'flex', paddingTop: 8 }}>
                                    <div style={{ flex: 1 }} />
                                    {['Owner', 'Editor', 'Viewer'].map(r => (
                                        <div key={r} style={{ width: 70, textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: ROLE_META[r].color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{r}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Appearance ── */}
                    {activeSection === 'appearance' && (
                        <div className="module-box">
                            <span className="label-text">Theme</span>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginTop: 4, marginBottom: 24 }}>
                                Customize your CollabFlow aesthetic.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                {[
                                    { name: 'Cyber Glass',   id: 'cyber-glass',   colors: ['#ec4899', '#22d3ee', '#10b981'] },
                                    { name: 'Midnight Blue', id: 'midnight-blue', colors: ['#8b5cf6', '#3b82f6', '#6366f1'] },
                                    { name: 'Emerald Dark',  id: 'emerald-dark',  colors: ['#10b981', '#34d399', '#6ee7b7'] },
                                    { name: 'Solar Flare',   id: 'solar-flare',   colors: ['#ef4444', '#f59e0b', '#f97316'] },
                                ].map(t => {
                                    const isActive = currentTheme === t.id;
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => handleThemeChange(t.id)}
                                            style={{
                                                padding: 16, borderRadius: 18,
                                                border: `1px solid ${isActive ? 'var(--pink)' : 'var(--border)'}`,
                                                background: isActive ? 'rgba(236,72,153,0.08)' : 'rgba(255,255,255,0.02)',
                                                cursor: 'pointer',
                                                opacity: isActive ? 1 : 0.6,
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={e => !isActive && (e.currentTarget.style.opacity = '1')}
                                            onMouseLeave={e => !isActive && (e.currentTarget.style.opacity = '0.6')}
                                        >
                                            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                                                {t.colors.map(c => <div key={c} style={{ width: 20, height: 20, borderRadius: 6, background: c }} />)}
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.name}</div>
                                            {isActive && <div style={{ fontSize: '0.7rem', color: 'var(--pink)', marginTop: 4, fontWeight: 600 }}>Currently Active</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Workspace ── */}
                    {activeSection === 'workspace' && (
                        <div className="module-box">
                            <span className="label-text">Workspace Settings</span>
                            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                                        Workspace Name
                                    </label>
                                    <input
                                        id="settings-ws-name"
                                        className="cf-input"
                                        style={{ marginBottom: 0 }}
                                        value={wsName}
                                        onChange={e => setWsName(e.target.value)}
                                        placeholder="Workspace name"
                                    />
                                </div>
                                <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16 }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, color: 'rgba(255,255,255,0.6)' }}>Members ({members.length})</div>
                                    {members.map(m => (
                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', color: '#000', flexShrink: 0 }}>{m.name[0]}</div>
                                            <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>{m.name}</span>
                                            <span style={{ fontSize: '0.72rem', color: m.color, fontWeight: 700 }}>{m.role}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="neon-btn" onClick={() => showSaved('Workspace saved!')} style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Save size={14} /> Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Notifications ── */}
                    {activeSection === 'notifications' && (
                        <div className="module-box">
                            <span className="label-text">Notification Preferences</span>
                            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {[
                                    { key: 'edits',    label: 'Document Edits',   desc: 'Notify when a document is updated' },
                                    { key: 'invites',  label: 'Member Invites',   desc: 'Notify when someone joins the workspace' },
                                    { key: 'comments', label: 'Comments & Replies', desc: 'Notify on new comments (coming soon)' },
                                ].map(({ key, label, desc }) => (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{desc}</div>
                                        </div>
                                        <button
                                            id={`notif-toggle-${key}`}
                                            onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                                            style={{
                                                width: 48, height: 26, borderRadius: 100,
                                                background: notifs[key] ? 'var(--green)' : 'rgba(255,255,255,0.1)',
                                                border: 'none', cursor: 'pointer',
                                                position: 'relative', transition: 'background 0.25s ease',
                                                boxShadow: notifs[key] ? '0 0 12px rgba(16,185,129,0.5)' : 'none', flexShrink: 0,
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute', top: 3, left: notifs[key] ? 25 : 3,
                                                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                                transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="neon-btn" onClick={() => showSaved('Preferences saved!')} style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Save size={14} /> Save Preferences
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
