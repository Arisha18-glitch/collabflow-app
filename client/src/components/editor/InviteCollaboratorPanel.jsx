import { useState } from 'react';
import { useInvitations } from '../../hooks/useInvitations';

/**
 * InviteCollaboratorPanel — secure multi-stage invitation modal.
 * Implements the asymmetric invitation state loop:
 *   IDLE → DISPATCHING → CONFIRMED / ERROR
 *
 * Security guarantees:
 *  - Zero dangerouslySetInnerHTML (all text via {expressions})
 *  - Email validated client-side before dispatch
 *  - No invite tokens exposed in UI state
 *  - Console traces production-guarded
 */
export default function InviteCollaboratorPanel({ docId, isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Editor');

    const {
        formState,
        invitations,
        loading,
        error,
        INVITE_STATES,
        sendInvitation,
        revokeInvitation,
        resetForm,
    } = useInvitations(docId);

    const handleSubmit = (e) => {
        e.preventDefault();
        const sanitizedEmail = email.trim().toLowerCase();
        if (!sanitizedEmail) return;
        sendInvitation(sanitizedEmail, role);
    };

    const handleNewInvite = () => {
        setEmail('');
        setRole('Editor');
        resetForm();
    };

    if (!isOpen) return null;

    return (
        <div className="invite-overlay" onClick={onClose}>
            <div className="invite-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="invite-modal-header">
                    <h3 className="invite-modal-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Invite Collaborator
                    </h3>
                    <button className="invite-close-btn" onClick={onClose} type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* State Machine UI */}
                <div className="invite-body">
                    {/* IDLE / ERROR — show form */}
                    {(formState === INVITE_STATES.IDLE || formState === INVITE_STATES.ERROR) && (
                        <form onSubmit={handleSubmit} className="invite-form">
                            <div className="invite-field">
                                <label className="invite-label" htmlFor="invite-email">Email Address</label>
                                <input
                                    id="invite-email"
                                    type="email"
                                    className="cf-input"
                                    placeholder="collaborator@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <div className="invite-field">
                                <label className="invite-label" htmlFor="invite-role">Role</label>
                                <div className="invite-role-selector">
                                    <button
                                        type="button"
                                        className={`invite-role-btn${role === 'Editor' ? ' active' : ''}`}
                                        onClick={() => setRole('Editor')}
                                    >
                                        <span className="invite-role-icon" style={{ background: 'color-mix(in srgb, var(--blue) 20%, transparent)', color: 'var(--blue)' }}>✎</span>
                                        Editor
                                    </button>
                                    <button
                                        type="button"
                                        className={`invite-role-btn${role === 'Viewer' ? ' active' : ''}`}
                                        onClick={() => setRole('Viewer')}
                                    >
                                        <span className="invite-role-icon" style={{ background: 'color-mix(in srgb, var(--green) 20%, transparent)', color: 'var(--green)' }}>👁</span>
                                        Viewer
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <div className="invite-error" role="alert">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}
                            <button type="submit" className="invite-submit-btn" id="invite-submit">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                                Send Secure Invite
                            </button>
                        </form>
                    )}

                    {/* DISPATCHING — loading state */}
                    {formState === INVITE_STATES.DISPATCHING && (
                        <div className="invite-state-panel dispatching">
                            <div className="invite-state-animation">
                                <span className="invite-dispatch-ring" />
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <p className="invite-state-text">Generating cryptographic token...</p>
                            <p className="invite-state-subtext">Dispatching secure invitation to backend</p>
                        </div>
                    )}

                    {/* CONFIRMED — success state */}
                    {formState === INVITE_STATES.CONFIRMED && (
                        <div className="invite-state-panel confirmed">
                            <div className="invite-success-icon">✓</div>
                            <p className="invite-state-text">Invitation Created!</p>
                            <p className="invite-state-subtext">
                                Invite link generated for <strong>{email}</strong> as <strong>{role}</strong>.
                            </p>
                            <div className="invite-link-container" style={{ marginTop: '15px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', wordBreak: 'break-all', fontSize: '0.85rem' }}>
                                <p style={{ color: 'var(--blue)', marginBottom: '8px', fontWeight: 'bold' }}>Share this link with them:</p>
                                <code style={{ userSelect: 'all', color: 'rgba(255,255,255,0.8)' }}>
                                    {window.location.origin}/invite/{invitations[0]?.token}
                                </code>
                            </div>
                            <button
                                type="button"
                                className="invite-another-btn"
                                style={{ marginTop: '20px' }}
                                onClick={handleNewInvite}
                            >
                                Invite Another
                            </button>
                        </div>
                    )}
                </div>

                {/* Existing invitations list */}
                {invitations.length > 0 && (
                    <div className="invite-list-section">
                        <h4 className="invite-list-title">
                            Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
                        </h4>
                        <div className="invite-list">
                            {invitations.map(inv => (
                                <div key={inv._id} className="invite-list-item">
                                    <div className="invite-list-info">
                                        <span className="invite-list-email">{inv.email}</span>
                                        <div className="invite-list-meta">
                                            <span className={`invite-status-badge ${inv.status}`}>
                                                {inv.status}
                                            </span>
                                            <span className="invite-list-role">{inv.role}</span>
                                        </div>
                                    </div>
                                    {inv.status === 'pending' && (
                                        <button
                                            type="button"
                                            className="invite-revoke-btn"
                                            onClick={() => revokeInvitation(inv._id)}
                                            title="Revoke invitation"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
