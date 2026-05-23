import { useState, useCallback } from 'react';
import { proofreadAPI } from '../../services/api';

/**
 * ProofreadingPanel — AI Proofreading Agent sidebar.
 * Scans document text for spelling/spacing issues and suggests
 * Gen Z vocabulary upgrades via the Gemini API.
 * All text rendered via {expressions} to prevent XSS.
 */


export default function ProofreadingPanel({ editor, isOpen, onClose }) {
    const [suggestions, setSuggestions] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [appliedIds, setAppliedIds] = useState(new Set());
    const [error, setError] = useState(null);

    const handleScan = useCallback(async () => {
        if (!editor) return;

        setScanning(true);
        setScanComplete(false);
        setAppliedIds(new Set());
        setError(null);

        try {
            const text = editor.getText();
            const { data } = await proofreadAPI(text);
            
            // Validate and set suggestions
            setSuggestions(Array.isArray(data) ? data : []);
            setScanComplete(true);
        } catch (err) {
            setError('AI proofreading failed. Please try again.');
            if (process.env.NODE_ENV !== 'production') {
                console.error('Proofreading Error:', err);
            }
        } finally {
            setScanning(false);
        }
    }, [editor]);

    const handleApplyFix = useCallback((suggestion) => {
        if (!editor) return;

        if (suggestion.type === 'spacing') {
            // Replace double+ spaces with single
            const html = editor.getHTML();
            const fixed = html.replace(/ {2,}/g, ' ');
            editor.commands.setContent(fixed, false);
        } else {
            // Find and replace the word in the document
            const { state } = editor;
            const { doc } = state;
            const searchText = suggestion.original;
            let found = false;

            doc.descendants((node, pos) => {
                if (found || !node.isText) return;
                const idx = node.text.indexOf(searchText);
                if (idx !== -1) {
                    const from = pos + idx;
                    const to = from + searchText.length;
                    editor
                        .chain()
                        .focus()
                        .insertContentAt({ from, to }, suggestion.replacement)
                        .run();
                    found = true;
                }
            });
        }

        setAppliedIds(prev => new Set([...prev, suggestion.id]));
    }, [editor]);

    if (!isOpen) return null;

    const spellingFixes = suggestions.filter(s => s.type === 'spelling');
    const vocabUpgrades = suggestions.filter(s => s.type === 'vocabulary');
    const spacingFixes = suggestions.filter(s => s.type === 'spacing');

    return (
        <div className="proofreading-panel">
            {/* Header */}
            <div className="proofread-header">
                <div className="proofread-title-row">
                    <div className="proofread-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                    </div>
                    <h3 className="proofread-title">AI Proofread</h3>
                </div>
                <button className="proofread-close" onClick={onClose} title="Close panel" type="button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Scan button */}
            <button
                id="proofread-scan-btn"
                className={`proofread-scan-btn${scanning ? ' scanning' : ''}`}
                onClick={handleScan}
                disabled={scanning}
                type="button"
            >
                {scanning ? (
                    <>
                        <span className="scan-pulse-dot" />
                        <span>Scanning document...</span>
                    </>
                ) : (
                    <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span>{scanComplete ? 'Re-scan Document' : 'Scan Document'}</span>
                    </>
                )}
            </button>

            {/* Results */}
            {error && (
                <div className="proofread-error" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 12 }}>
                    {error}
                </div>
            )}
            
            {scanComplete && !error && (
                <div className="proofread-results">
                    {suggestions.length === 0 ? (
                        <div className="proofread-empty">
                            <span className="proofread-empty-icon">✨</span>
                            <p className="proofread-empty-text">Your document is looking clean! No suggestions found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary */}
                            <div className="proofread-summary">
                                <span className="proofread-count">{suggestions.length}</span>
                                <span className="proofread-count-label">
                                    {suggestions.length === 1 ? 'suggestion' : 'suggestions'} found
                                </span>
                            </div>

                            {/* Spelling section */}
                            {spellingFixes.length > 0 && (
                                <div className="proofread-section">
                                    <div className="proofread-section-header">
                                        <span className="proofread-section-dot spelling" />
                                        <span>Spelling ({spellingFixes.length})</span>
                                    </div>
                                    {spellingFixes.map(s => (
                                        <SuggestionCard
                                            key={s.id}
                                            suggestion={s}
                                            applied={appliedIds.has(s.id)}
                                            onApply={handleApplyFix}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Vocabulary section */}
                            {vocabUpgrades.length > 0 && (
                                <div className="proofread-section">
                                    <div className="proofread-section-header">
                                        <span className="proofread-section-dot vocabulary" />
                                        <span>Gen Z Vibes ({vocabUpgrades.length})</span>
                                    </div>
                                    {vocabUpgrades.map(s => (
                                        <SuggestionCard
                                            key={s.id}
                                            suggestion={s}
                                            applied={appliedIds.has(s.id)}
                                            onApply={handleApplyFix}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Spacing section */}
                            {spacingFixes.length > 0 && (
                                <div className="proofread-section">
                                    <div className="proofread-section-header">
                                        <span className="proofread-section-dot spacing" />
                                        <span>Spacing ({spacingFixes.length})</span>
                                    </div>
                                    {spacingFixes.map(s => (
                                        <SuggestionCard
                                            key={s.id}
                                            suggestion={s}
                                            applied={appliedIds.has(s.id)}
                                            onApply={handleApplyFix}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function SuggestionCard({ suggestion, applied, onApply }) {
    return (
        <div className={`proofread-card${applied ? ' applied' : ''}`}>
            <div className="proofread-card-body">
                <div className="proofread-change">
                    <span className="proofread-original">{suggestion.original}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                    <span className="proofread-replacement">{suggestion.replacement}</span>
                </div>
                <span className="proofread-reason">{suggestion.reason}</span>
            </div>
            <button
                className={`proofread-apply-btn${applied ? ' applied' : ''}`}
                onClick={() => onApply(suggestion)}
                disabled={applied}
                type="button"
            >
                {applied ? '✓ Applied' : 'Apply'}
            </button>
        </div>
    );
}
