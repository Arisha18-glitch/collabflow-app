import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocStore } from '../../store/useDocStore';
import { TrendingUp, Clock, FileText, Users, Zap, BarChart3, Eye } from 'lucide-react';
import TiltCard from '../../components/ui/TiltCard';

const CATEGORY_COLORS = {
    Academic: 'var(--pink)',
    Design:   'var(--blue)',
    Planning: 'var(--purple)',
    Research: 'var(--green)',
    General:  '#f59e0b',
};



export default function AnalyticsPage() {
    const navigate = useNavigate();
    const { stats, members, docs, fetchStats, fetchMembers, fetchDocuments, weeklyActivity, memberContribs, fetchWeeklyActivity } = useDocStore();

    useEffect(() => {
        fetchStats();
        fetchMembers();
        fetchDocuments();
        fetchWeeklyActivity();
    }, []);

    const maxEdits = Math.max(...memberContribs.map(m => m.edits), 1);
    const maxWeekly = Math.max(...weeklyActivity.map(d => d.edits), 1);

    const categoryBreakdown = {};
    docs.forEach(d => {
        categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + 1;
    });

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 36 }}>
                <span className="label-text">Insights</span>
                <h1 className="hero-text" style={{ fontSize: '2.6rem', marginBottom: 6 }}>Workspace Analytics</h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem' }}>
                    Track productivity and team performance in real-time
                </p>
            </div>

            <div className="bento-grid" style={{ padding: 0 }}>
                {/* ── Key Metric Strip ── */}
                <TiltCard maxTilt={3} style={{ gridColumn: 'span 4', display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>
                    {[
                        { icon: TrendingUp, label: 'Total Edits', value: stats.totalEdits, sub: '↑ from all actions', color: 'var(--green)' },
                        { icon: Clock,      label: 'Active Time', value: stats.activeTime, sub: 'This session', color: 'var(--blue)' },
                        { icon: FileText,   label: 'Documents',   value: stats.docsCreated, sub: `${docs.length} total`, color: 'var(--pink)' },
                        { icon: Users,      label: 'Team Size',   value: members.length, sub: `${members.filter(m => m.status === 'Online').length} online now`, color: 'var(--purple)' },
                    ].map((s, i) => (
                        <div key={s.label} style={{
                            flex: 1, padding: '24px 28px',
                            borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                            display: 'flex', alignItems: 'center', gap: 16,
                        }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 13,
                                background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                                border: `1px solid color-mix(in srgb, ${s.color} 20%, transparent)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <s.icon size={20} style={{ color: s.color }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{s.label}</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{s.sub}</div>
                            </div>
                        </div>
                    ))}
                </TiltCard>

                {/* ── Weekly Activity Chart ── */}
                <TiltCard maxTilt={4} style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <span className="label-text" style={{ color: 'var(--blue)', marginBottom: 0 }}>
                            <BarChart3 size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
                            Weekly Activity
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>Last 7 days</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, paddingTop: 8 }}>
                        {weeklyActivity.map(d => (
                            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{d.edits}</span>
                                <div style={{
                                    width: '100%', maxWidth: 32,
                                    height: `${(d.edits / maxWeekly) * 100}%`, minHeight: 6,
                                    background: `linear-gradient(180deg, ${d.color}, ${d.color}44)`,
                                    borderRadius: 6, boxShadow: `0 0 12px ${d.color}30`, transition: 'height 0.6s ease',
                                }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>{d.day}</span>
                            </div>
                        ))}
                    </div>
                </TiltCard>

                {/* ── Member Contributions ── */}
                <TiltCard maxTilt={4} style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <span className="label-text" style={{ marginBottom: 0 }}>Member Contributions</span>
                        <Users size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                    {memberContribs.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No members yet</p>
                    ) : (
                        memberContribs.map((m) => (
                            <div key={m.id} className="analytics-bar-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 120, flexShrink: 0 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 8, background: m.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 900, fontSize: '0.72rem', color: '#000', flexShrink: 0,
                                    }}>{m.role[0]}</div>
                                    <span className="analytics-bar-label" style={{ width: 'auto' }}>{m.name}</span>
                                </div>
                                <div className="analytics-bar-track">
                                    <div className="analytics-bar-fill" style={{
                                        width: `${(m.edits / maxEdits) * 100}%`,
                                        background: m.color, boxShadow: `0 0 8px ${m.color}80`,
                                    }} />
                                </div>
                                <span className="analytics-bar-value" style={{ color: m.color }}>{m.edits}</span>
                            </div>
                        ))
                    )}
                </TiltCard>

                {/* ── Category Breakdown ── */}
                <TiltCard maxTilt={4} style={{ gridColumn: 'span 2' }}>
                    <span className="label-text" style={{ color: 'var(--green)', marginBottom: 0 }}>
                        <Eye size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
                        By Category
                    </span>
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {Object.entries(categoryBreakdown).length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No documents yet</p>
                        ) : (
                            Object.entries(categoryBreakdown).map(([cat, count]) => {
                                const color = CATEGORY_COLORS[cat] || '#fff';
                                const pct = Math.round((count / docs.length) * 100);
                                return (
                                    <div key={cat}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{cat}</span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{count} docs · {pct}%</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 100, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', width: `${pct}%`, borderRadius: 100,
                                                background: color, boxShadow: `0 0 8px ${color}50`, transition: 'width 0.8s ease',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </TiltCard>

                {/* ── Document Health ── */}
                <TiltCard maxTilt={3} style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <span className="label-text" style={{ marginBottom: 0 }}>Document Health</span>
                        <TrendingUp size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                    {docs.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No documents yet</p>
                    ) : (
                        docs.map((doc) => {
                            const catColor = CATEGORY_COLORS[doc.category] ?? '#fff';
                            const len = doc.content.length;
                            const health = len > 400 ? 'Thorough' : len > 200 ? 'Good' : len > 100 ? 'Started' : 'Draft';
                            const hColor = len > 400 ? 'var(--green)' : len > 200 ? 'var(--blue)' : len > 100 ? '#f59e0b' : 'var(--pink)';
                            return (
                                <div key={doc.id}
                                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                                    onClick={() => navigate(`/editor/${doc.id}`)}
                                >
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${catColor}15`, border: `1px solid ${catColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={16} style={{ color: catColor }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{doc.category} · {doc.lastEdited}</div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: 100,
                                        background: `color-mix(in srgb, ${hColor} 15%, transparent)`,
                                        color: hColor, border: `1px solid color-mix(in srgb, ${hColor} 25%, transparent)`,
                                    }}>{health}</span>
                                </div>
                            );
                        })
                    )}
                </TiltCard>

                {/* ── Team Health Banner ── */}
                <TiltCard maxTilt={3} style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Zap size={24} style={{ color: 'var(--green)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>
                            Workspace Health: <span style={{ color: 'var(--green)' }}>Excellent</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                            {members.filter(m => m.status === 'Online').length} of {members.length} members online · {docs.length} active documents · MongoDB connected
                        </p>
                    </div>
                    <div style={{ padding: '12px 20px', borderRadius: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--green)' }}>{stats.totalEdits}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>Total Edits</div>
                    </div>
                </TiltCard>
            </div>
        </div>
    );
}