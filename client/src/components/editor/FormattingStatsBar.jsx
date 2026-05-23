import { useState, useEffect, useCallback } from 'react';

/**
 * FormattingStatsBar — displays live word/char counts, reading time,
 * and provides a line spacing control dropdown.
 * All text rendered via {expression} — zero dangerouslySetInnerHTML.
 */
export default function FormattingStatsBar({ editor }) {
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [charNoSpaces, setCharNoSpaces] = useState(0);
    const [readingTime, setReadingTime] = useState(0);
    const [lineSpacing, setLineSpacing] = useState('1.75');

    const computeStats = useCallback(() => {
        if (!editor) return;
        const text = editor.getText();
        const words = text.trim().split(/\s+/).filter(Boolean);
        setWordCount(words.length);
        setCharCount(text.length);
        setCharNoSpaces(text.replace(/\s/g, '').length);
        setReadingTime(Math.max(1, Math.ceil(words.length / 200)));
    }, [editor]);

    useEffect(() => {
        if (!editor) return;
        // Compute on mount
        computeStats();
        // Listen for updates
        editor.on('update', computeStats);
        return () => {
            editor.off('update', computeStats);
        };
    }, [editor, computeStats]);

    // Apply line spacing to the editor
    useEffect(() => {
        if (!editor) return;
        const editorEl = editor.view?.dom;
        if (editorEl) {
            editorEl.style.lineHeight = lineSpacing;
        }
    }, [lineSpacing, editor]);

    return (
        <div className="formatting-stats-bar" role="status" aria-live="polite">
            <div className="stats-group">
                <div className="stat-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
                    </svg>
                    <span className="stat-chip-value">{wordCount}</span>
                    <span className="stat-chip-label">words</span>
                </div>

                <div className="stat-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
                    </svg>
                    <span className="stat-chip-value">{charCount}</span>
                    <span className="stat-chip-label">chars</span>
                </div>

                <div className="stat-chip stat-chip-dim">
                    <span className="stat-chip-value">{charNoSpaces}</span>
                    <span className="stat-chip-label">no spaces</span>
                </div>

                <div className="stat-chip-divider" />

                <div className="stat-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="stat-chip-value">{readingTime}</span>
                    <span className="stat-chip-label">min read</span>
                </div>
            </div>

            <div className="stats-group">
                <label className="spacing-label" htmlFor="line-spacing-select">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="21" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="3" y2="18" />
                    </svg>
                    Spacing
                </label>
                <select
                    id="line-spacing-select"
                    className="spacing-select"
                    value={lineSpacing}
                    onChange={e => setLineSpacing(e.target.value)}
                >
                    <option value="1.0">1.0×</option>
                    <option value="1.15">1.15×</option>
                    <option value="1.5">1.5×</option>
                    <option value="1.75">1.75×</option>
                    <option value="2.0">2.0×</option>
                    <option value="2.5">2.5×</option>
                </select>
            </div>
        </div>
    );
}
