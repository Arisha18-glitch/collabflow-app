import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocStore } from '../../store/useDocStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ExternalLink, ShieldCheck, UserMinus, Mail, Check, UserPlus, Send } from 'lucide-react';

export default function WorkspacePage() {
    const navigate = useNavigate();
    const {
        members, docs, stats, activeDocId,
        removeMember, setActiveDoc,
        fetchMembers, fetchDocuments, fetchStats,
    } = useDocStore();
    const { user } = useAuthStore();

    const currentUserRole = user?.role || 'Viewer';
    const activeDoc = docs.find(d => d.id === activeDocId) ?? docs[0];

    const [toast, setToast] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Editor');
    const [inviteSent, setInviteSent] = useState(false);

    useEffect(() => {
        fetchMembers();
        fetchDocuments();
        fetchStats();
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleInvite = () => {
        const email = inviteEmail.trim();
        if (!email) return;
        // Simulate invite
        showToast(`Invite sent to ${email} as ${inviteRole}`);
        setInviteEmail('');
        setInviteSent(true);
        setTimeout(() => setInviteSent(false), 2500);
    };

    const roleColors = { Owner: 'var(--pink)', Editor: 'var(--blue)', Viewer: 'var(--green)' };
    const rolePerms  = { Owner: 'Full access', Editor: 'Create & Edit', Viewer: 'Read only' };
    const canManage  = currentUserRole === 'Owner';

    return (
        <>
            {/* ── Toast ── */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.4)',
                    color: 'var(--blue)', padding: '14px 20px', borderRadius: 16,
                    fontWeight: 700, fontSize: '0.85rem', display: 'flex',
                    alignItems: 'center', gap: 10, backdropFilter: 'blur(20px)',
                    animation: 'slide-up 0.25s ease', maxWidth: 340,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(34,211,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Mail size={15} />
                    </div>
                    <span style={{ flex: 1 }}>{toast}</span>
                    <Check size={16} style={{ flexShrink: 0 }} />
                </div>
            )}

            <div className="bento-grid">
                {/* ─── Collaborators ─── */}
                <div className="module-box" style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <span className="label-text">Collaborators</span>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.04em', marginTop: 2 }}>
                                {members.length} Members
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <UserPlus size={14} style={{ color: 'var(--blue)', opacity: 0.7 }} />
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{members.length} active</span>
                        </div>
                    </div>

                    <div>
                        {members.length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                                No members yet
                            </p>
                        ) : (
                            members.map((m) => (
                                <div key={m.id} className="member-card">
                                    <div
                                        className="alphabet-badge"
                                        style={{ background: m.color, boxShadow: `0 0 16px ${m.color}55` }}
                                    >
                                        {m.role[0]}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: m.color, opacity: 0.85, marginTop: 2 }}>
                                            {m.role} · {rolePerms[m.role]}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            fontSize: '0.68rem',
                                            color: m.status === 'Online' ? 'var(--green)' : m.status === 'Idle' ? 'var(--blue)' : 'rgba(255,255,255,0.25)',
                                            fontWeight: 600, whiteSpace: 'nowrap',
                                        }}>
                                            ● {m.status}
                                        </div>
                                        <ShieldCheck size={13} style={{ opacity: 0.25 }} />
                                        {canManage && m.id !== user?._id && (
                                            <button
                                                id={`remove-member-${m.id}`}
                                                title={`Remove ${m.name}`}
                                                onClick={async () => {
                                                    await removeMember(m.id);
                                                    showToast(`${m.name} has been removed`);
                                                }}
                                                style={{
                                                    background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)',
                                                    color: 'var(--pink)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                    fontSize: '0.7rem', fontWeight: 700,
                                                    fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s ease', flexShrink: 0,
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.25)'; e.currentTarget.style.borderColor = 'var(--pink)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.1)'; e.currentTarget.style.borderColor = 'rgba(236,72,153,0.25)'; }}
                                            >
                                                <UserMinus size={12} /> Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ─── Invite Members Section ─── */}
                <div className="module-box" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'color-mix(in srgb, var(--blue) 12%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--blue) 25%, transparent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <UserPlus size={18} style={{ color: 'var(--blue)' }} />
                        </div>
                        <div>
                            <span className="label-text" style={{ color: 'var(--blue)', marginBottom: 0 }}>Invite Members</span>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                                Send workspace invitations via email
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                        <input
                            id="invite-email-input"
                            className="cf-input"
                            style={{ flex: 1, marginBottom: 0 }}
                            placeholder="collaborator@email.com"
                            type="email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleInvite()}
                        />
                        <select
                            id="invite-role-select"
                            className="cf-select"
                            style={{ width: 120, marginBottom: 0, flexShrink: 0 }}
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value)}
                        >
                            <option value="Editor">Editor</option>
                            <option value="Viewer">Viewer</option>
                        </select>
                        <button
                            id="send-invite-btn"
                            className="neon-btn"
                            onClick={handleInvite}
                            disabled={!inviteEmail.trim()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                                opacity: !inviteEmail.trim() ? 0.5 : 1,
                            }}
                        >
                            <Send size={14} /> Invite
                        </button>
                    </div>

                    {inviteSent && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 14px', borderRadius: 12,
                            background: 'color-mix(in srgb, var(--green) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--green) 25%, transparent)',
                            animation: 'slide-up 0.25s ease',
                        }}>
                            <Check size={14} style={{ color: 'var(--green)' }} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--green)' }}>Invitation sent successfully!</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: inviteSent ? 12 : 0, flexWrap: 'wrap' }}>
                        {['Editor', 'Viewer'].map(r => (
                            <div key={r} style={{
                                padding: '6px 12px', borderRadius: 8,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: 3, background: roleColors[r] }} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)' }}>{r}</span>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>·</span>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{rolePerms[r]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Live Canvas Preview ─── */}
                <div className="module-box" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                            <span className="label-text" style={{ color: 'var(--pink)' }}>Live Canvas</span>
                            <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                                {activeDoc?.title ?? 'No document'}
                            </div>
                        </div>
                        <ExternalLink size={16} style={{ opacity: 0.4, marginTop: 4, flexShrink: 0 }} />
                    </div>

                    <div className="editor-preview">
                        {activeDoc
                            ? <div className="doc-preview-text">{activeDoc.content.replace(/<[^>]+>/g, '').substring(0, 400)}...</div>
                            : <p style={{ color: 'rgba(255,255,255,0.25)' }}>No active document</p>
                        }
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <select
                            className="cf-select"
                            style={{ flex: 1, marginBottom: 0 }}
                            value={activeDocId || ''}
                            onChange={e => setActiveDoc(e.target.value)}
                        >
                            {docs.map(d => (
                                <option key={d.id} value={d.id}>{d.title}</option>
                            ))}
                        </select>
                        <button
                            id="open-editor-btn"
                            className="neon-btn"
                            onClick={() => navigate(`/editor/${activeDoc?.id}`)}
                            disabled={!activeDoc}
                            style={{ flexShrink: 0 }}
                        >
                            Open Editor
                        </button>
                    </div>
                </div>

                {/* ─── Workspace Stats ─── */}
                <div className="module-box" style={{ gridColumn: 'span 2' }}>
                    <span className="label-text" style={{ color: 'var(--green)' }}>Workspace Stats</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                        {[
                            { label: 'Total Edits', value: stats.totalEdits, color: 'var(--green)', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)' },
                            { label: 'Efficiency',  value: `${stats.efficiency}%`, color: 'var(--purple)', bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.15)' },
                            { label: 'Active Time', value: stats.activeTime, color: 'var(--blue)', bg: 'rgba(34,211,238,0.06)', border: 'rgba(34,211,238,0.15)', small: true },
                            { label: 'Documents',   value: stats.docsCreated, color: 'var(--pink)', bg: 'rgba(236,72,153,0.06)', border: 'rgba(236,72,153,0.15)' },
                        ].map(s => (
                            <div key={s.label} style={{ padding: 16, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16 }}>
                                <div style={{ fontSize: '0.7rem', color: s.color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
                                <div style={{ fontSize: s.small ? '1.6rem' : '2.2rem', fontWeight: 800, letterSpacing: '-0.05em', color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}