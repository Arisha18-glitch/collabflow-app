import { useState, useEffect } from 'react';
import { X, Clock, RotateCcw } from 'lucide-react';
import { fetchVersionsAPI } from '../../services/api';

export default function VersionHistory({ docId, isOpen, onClose, onRestore }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && docId) {
            setLoading(true);
            fetchVersionsAPI(docId)
                .then(res => {
                    setVersions(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching versions:', err);
                    setLoading(false);
                });
        }
    }, [isOpen, docId]);

    if (!isOpen) return null;

    // Helper: human-readable time ago
    const getTimeAgo = (dateStr) => {
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Yesterday';
        return `${days}d ago`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={20} style={{ color: 'var(--blue)' }} />
                        Version History
                    </div>
                    <button className="icon-btn" onClick={onClose}><X size={18} /></button>
                </div>

                {loading ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        Loading versions...
                    </div>
                ) : versions.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        No older versions found.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
                        {versions.map((v, i) => {
                            const d = new Date(v.savedAt);
                            const formattedDate = d.toLocaleString(undefined, {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            });
                            
                            return (
                                <div key={v.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>
                                            {i === 0 ? 'Previous Version' : `Older Version`}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>{getTimeAgo(v.savedAt)}</span>
                                            <span>•</span>
                                            <span>Saved by {v.savedBy}</span>
                                            <span>•</span>
                                            <span>{formattedDate}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="ghost-btn" 
                                        onClick={() => {
                                            if (window.confirm('Restore this version? This will overwrite current changes (but the current state will be saved as a new version).')) {
                                                onRestore(v.content);
                                                onClose();
                                            }
                                        }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', padding: '6px 12px' }}
                                    >
                                        <RotateCcw size={14} /> Restore
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}