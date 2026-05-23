import { useState, useId } from 'react';

/**
 * PageBorderFrame — wraps the editor canvas with an adjustable CSS border.
 * Controls for border style, thickness, padding, and color are in a collapsible row.
 * All state is local — no sensitive data exposed.
 */
export default function PageBorderFrame({ children }) {
    const [showControls, setShowControls] = useState(false);
    const [borderStyle, setBorderStyle] = useState('none');
    const [borderThickness, setBorderThickness] = useState(2);
    const [innerPadding, setInnerPadding] = useState(32);
    const [borderColor, setBorderColor] = useState('rgba(255,255,255,0.15)');

    const styleId = useId();

    const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'];
    const COLOR_OPTIONS = [
        { label: 'Ghost', value: 'rgba(255,255,255,0.15)' },
        { label: 'Neon Pink', value: 'rgba(236,72,153,0.5)' },
        { label: 'Cyan', value: 'rgba(34,211,238,0.5)' },
        { label: 'Emerald', value: 'rgba(16,185,129,0.5)' },
        { label: 'Purple', value: 'rgba(168,85,247,0.5)' },
    ];

    const frameStyles = borderStyle !== 'none'
        ? {
            border: `${borderThickness}px ${borderStyle} ${borderColor}`,
            padding: `${innerPadding}px`,
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }
        : {
            border: '1px solid transparent',
            padding: `${innerPadding}px`,
            transition: 'all 0.3s ease',
        };

    return (
        <div className="page-border-engine">
            {/* Toggle controls */}
            <button
                id="border-controls-toggle"
                className="border-controls-toggle"
                onClick={() => setShowControls(prev => !prev)}
                type="button"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                <span>Page Border</span>
                <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: showControls ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Controls panel */}
            {showControls && (
                <div className="border-controls-panel" role="group" aria-label="Page border controls">
                    {/* Style selector */}
                    <div className="border-control-group">
                        <label className="border-control-label" htmlFor={`${styleId}-style`}>Style</label>
                        <select
                            id={`${styleId}-style`}
                            className="border-control-select"
                            value={borderStyle}
                            onChange={e => setBorderStyle(e.target.value)}
                        >
                            {BORDER_STYLES.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Thickness slider */}
                    <div className="border-control-group">
                        <label className="border-control-label" htmlFor={`${styleId}-thickness`}>
                            Thickness: {borderThickness}px
                        </label>
                        <input
                            id={`${styleId}-thickness`}
                            type="range"
                            min="1"
                            max="8"
                            value={borderThickness}
                            onChange={e => setBorderThickness(Number(e.target.value))}
                            className="border-control-range"
                            disabled={borderStyle === 'none'}
                        />
                    </div>

                    {/* Padding slider */}
                    <div className="border-control-group">
                        <label className="border-control-label" htmlFor={`${styleId}-padding`}>
                            Padding: {innerPadding}px
                        </label>
                        <input
                            id={`${styleId}-padding`}
                            type="range"
                            min="16"
                            max="64"
                            value={innerPadding}
                            onChange={e => setInnerPadding(Number(e.target.value))}
                            className="border-control-range"
                        />
                    </div>

                    {/* Color selector */}
                    <div className="border-control-group">
                        <label className="border-control-label">Color</label>
                        <div className="border-color-swatches">
                            {COLOR_OPTIONS.map(c => (
                                <button
                                    key={c.label}
                                    type="button"
                                    className={`border-color-swatch${borderColor === c.value ? ' active' : ''}`}
                                    style={{ background: c.value }}
                                    onClick={() => setBorderColor(c.value)}
                                    title={c.label}
                                    disabled={borderStyle === 'none'}
                                    aria-label={`Border color: ${c.label}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bordered frame wrapping the editor content */}
            <div className="page-border-frame" style={frameStyles}>
                {children}
            </div>
        </div>
    );
}
