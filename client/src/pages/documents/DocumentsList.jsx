import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocStore } from '../../store/useDocStore';
import { FileText, Trash2, Plus, X, ChevronRight } from 'lucide-react';
import TiltCard from '../../components/ui/TiltCard';

export default function DocumentsList() {
    const navigate = useNavigate();
    const { docs, deleteDocument, addDocument, setActiveDoc, fetchDocuments, loading } = useDocStore();

    const [showModal,  setShowModal]  = useState(false);
    const [newTitle,   setNewTitle]   = useState('');

    // Fetch docs on mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleCreate = async () => {
        const t = newTitle.trim();
        if (!t) return;
        try {
            await addDocument(t);
            setNewTitle('');
            setShowModal(false);
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Error creating document:', err);
            }
            alert(err.message || 'Error creating document');
        }
    };

    const handleOpen = (doc) => {
        setActiveDoc(doc.id);
        navigate(`/editor/${doc.id}`);
    };

    const CATEGORY_COLORS = {
        Academic: 'var(--pink)',
        Design:   'var(--blue)',
        Planning: 'var(--purple)',
        Research: 'var(--green)',
        General:  '#f59e0b',
    };

    return (
        <>
            {/* New Doc Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div className="modal-title">New Document</div>
                            <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <input
                            id="new-doc-title-input"
                            className="cf-input"
                            placeholder="Document title..."
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                            <button className="ghost-btn" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                            <button className="neon-btn" onClick={handleCreate} style={{ flex: 1 }}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 920, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <span className="label-text">Library</span>
                        <h1 className="hero-text" style={{ fontSize: '2.6rem', marginBottom: 0 }}>
                            Documents
                        </h1>
                    </div>
                    <button
                        id="new-doc-btn"
                        className="neon-btn"
                        onClick={() => setShowModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <Plus size={16} /> New Document
                    </button>
                </div>

                {loading ? (
                    <TiltCard style={{ textAlign: 'center', padding: '60px 32px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>Loading documents...</div>
                    </TiltCard>
                ) : docs.length === 0 ? (
                    <TiltCard style={{ textAlign: 'center', padding: '60px 32px' }}>
                        <FileText size={40} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem' }}>No documents yet. Create your first one!</p>
                    </TiltCard>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {docs.map((doc) => {
                            const catColor = CATEGORY_COLORS[doc.category] ?? '#fff';
                            const preview  = doc.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 72);
                            return (
                                <div key={doc.id} className="doc-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                                        <div className="doc-icon-wrap" style={{ background: `${catColor}18`, border: `1px solid ${catColor}35` }}>
                                            <FileText size={20} style={{ color: catColor }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {doc.title}
                                                </div>
                                                <span className="category-tag" style={{ color: catColor, background: `${catColor}15`, flexShrink: 0 }}>
                                                    {doc.category}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                                                {preview}{preview.length >= 72 ? '…' : ''}  ·  {doc.lastEdited}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 16 }}>
                                        <button
                                            id={`delete-doc-${doc.id}`}
                                            className="icon-btn"
                                            onClick={() => deleteDocument(doc.id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            id={`open-doc-${doc.id}`}
                                            className="ghost-btn"
                                            onClick={() => handleOpen(doc)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                        >
                                            Open <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}