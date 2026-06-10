import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocStore } from '../../store/useDocStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, X, Clock, FileText, Users, Activity, TrendingUp, Sparkles } from 'lucide-react';
import TiltCard from '../../components/ui/TiltCard';
import InteractiveMascot from '../../components/ui/InteractiveMascot';

export default function Dashboard() {
    const navigate = useNavigate();
    const { docs, members, stats, activity, addDocument, setActiveDoc,
            fetchDocuments, fetchMembers, fetchStats, fetchActivity, loading } = useDocStore();
    const { user } = useAuthStore();

    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle]   = useState('');
    const [greeting, setGreeting]   = useState('');

    // Fetch all data on mount
    useEffect(() => {
        fetchDocuments();
        fetchMembers();
        fetchStats();
        fetchActivity();

        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    }, []);

    const handleCreate = async () => {
        const t = newTitle.trim();
        if (!t) return;
        try {
            await addDocument(t);
            setNewTitle('');
            setShowModal(false);
            navigate('/documents');
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error creating document:', err);
            }
            alert(err.message || 'Error creating document');
        }
    };

    const handleOpenDoc = (doc) => {
        setActiveDoc(doc.id);
        navigate(`/editor/${doc.id}`);
    };

    const onlineCount = members.filter(m => m.status === 'Online').length;

    // Use real activity or fallback
    const displayActivity = activity.length > 0 ? activity : [];

    return (
        <>
            {/* ── Create Document Modal ── */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div className="modal-title">New Document</div>
                            <button className="icon-btn" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <input
                            id="new-doc-title"
                            className="cf-input"
                            placeholder="Document title..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                            <button className="ghost-btn" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                            <button className="neon-btn" onClick={handleCreate} style={{ flex: 1 }}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bento-grid">
                <TiltCard style={{ gridColumn: 'span 3', minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'visible' }}>
                    <span className="label-text">{greeting}{user ? `, ${user.name}` : ''}</span>
                    <h1 className="hero-text" style={{ marginBottom: 12 }}>
                        Cook. Vibe.{' '}
                        <span style={{ color: 'var(--blue)', WebkitTextFillColor: 'var(--blue)' }}>
                            Slay.
                        </span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', maxWidth: 440, lineHeight: 1.65, marginBottom: 28 }}>
                        The ultimate vibe station for your big brain ideas, sick designs, and async drops — no cap.
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                            id="quick-create-btn"
                            className="neon-btn glow-pink"
                            onClick={() => setShowModal(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <Plus size={16} /> Quick Create
                        </button>
                        <button className="ghost-btn" onClick={() => navigate('/documents')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileText size={14} /> Browse Docs
                        </button>
                    </div>
                    <div className="mascot-hero-cluster">
                        <InteractiveMascot variant="bot" size={95} label="Gem" />
                    </div>
                </TiltCard>

                {/* ── Compact Stats Strip ── */}
                <TiltCard maxTilt={4} style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <span className="label-text" style={{ color: 'var(--blue)' }}>Quick Stats</span>
                    {[
                        { icon: TrendingUp, label: 'Edits', value: stats.totalEdits, color: 'var(--green)' },
                        { icon: Clock, label: 'Active', value: stats.activeTime, color: 'var(--blue)' },
                        { icon: FileText, label: 'Docs', value: stats.docsCreated, color: 'var(--pink)' },
                        { icon: Users, label: 'Online', value: `${onlineCount}/${members.length}`, color: 'var(--green)' },
                    ].map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                                border: `1px solid color-mix(in srgb, ${s.color} 20%, transparent)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <s.icon size={16} style={{ color: s.color }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em', color: s.color }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </TiltCard>

                {/* ── Activity Timeline ── */}
                <TiltCard maxTilt={3} style={{ gridColumn: 'span 2', gridRow: 'span 1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span className="label-text" style={{ color: 'var(--purple)', marginBottom: 0 }}>
                            <Activity size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
                            Activity Feed
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {displayActivity.length === 0 ? (
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                                No activity yet — start creating documents!
                            </p>
                        ) : (
                            displayActivity.map((a, i) => (
                                <div key={a._id || i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 12,
                                    padding: '10px 0',
                                    borderBottom: i < displayActivity.length - 1 ? '1px solid var(--border)' : 'none',
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                                        <div className="activity-dot" style={{ flexShrink: 0 }} />
                                        {i < displayActivity.length - 1 && <div style={{ width: 1, height: 28, background: 'var(--border)', marginTop: 4 }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                                            <span style={{ fontWeight: 700, color: 'var(--pink)' }}>{a.user}</span>{' '}
                                            <span style={{ color: 'var(--text-dim)' }}>{a.action}</span>{' '}
                                            <span style={{ fontWeight: 600 }}>{a.target}</span>
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>{a.time}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TiltCard>

                {/* ── Team Presence ── */}
                <TiltCard maxTilt={4} style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span className="label-text" style={{ color: 'var(--blue)', marginBottom: 0 }}>Team Presence</span>
                        <button className="ghost-btn" onClick={() => navigate('/workspace')} style={{ fontSize: '0.72rem', padding: '5px 12px' }}>Manage →</button>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {members.length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No team members yet</p>
                        ) : (
                            members.map(m => (
                                <div key={m.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 14px', borderRadius: 14,
                                    background: 'rgba(255,255,255,0.025)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    flex: '1 1 auto', minWidth: 160,
                                }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 10,
                                            background: m.color, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 900, fontSize: '0.8rem', color: '#000',
                                            opacity: m.status === 'Offline' ? 0.4 : 1,
                                        }}>{m.name[0]}</div>
                                        <div style={{
                                            position: 'absolute', bottom: -2, right: -2,
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: m.status === 'Online' ? 'var(--green)' : m.status === 'Idle' ? '#f59e0b' : '#555',
                                            border: '2px solid #0a0a12',
                                        }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{m.name}</div>
                                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{m.role}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TiltCard>

                {/* ── Recent Documents ── */}
                <TiltCard maxTilt={3} style={{ gridColumn: 'span 4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                        <span className="label-text" style={{ marginBottom: 0 }}>Recent Documents</span>
                        <button className="ghost-btn" onClick={() => navigate('/documents')} style={{ fontSize: '0.75rem', padding: '6px 14px' }}>View All →</button>
                    </div>
                    {docs.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
                            No documents yet — create your first one!
                        </p>
                    ) : (
                        <div className="bento-grid" style={{ padding: 0, maxWidth: 'none' }}>
                            {docs.slice(0, 4).map((doc) => (
                                <div
                                    key={doc.id}
                                    className="doc-mini-card"
                                    onClick={() => handleOpenDoc(doc)}
                                    style={{
                                        padding: '16px 18px',
                                        background: 'rgba(255,255,255,0.025)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 18,
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ color: 'var(--pink)', marginBottom: 10 }}><FileText size={20} /></div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{doc.category} · {doc.lastEdited}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </TiltCard>
            </div>
        </>
    );
}