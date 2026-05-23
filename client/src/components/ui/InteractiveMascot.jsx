import { useEffect, useRef, useState } from 'react';

/*  ──────────────────────────────────────────────────────────
    InteractiveMascot — cute little "CyberBot" friends
    whose eyes follow the cursor around the screen.
    Drop in anywhere:  <InteractiveMascot variant="bot" />
    ────────────────────────────────────────────────────────── */

const MASCOT_CONFIGS = {
  bot: {
    bodyColor: 'var(--pink)',
    bodyGlow: 'color-mix(in srgb, var(--pink) 35%, transparent)',
    earColor: 'var(--purple)',
    blush: 'color-mix(in srgb, var(--pink) 35%, transparent)',
    antenna: true,
  },
  coffee: {
    bodyColor: 'var(--blue)',
    bodyGlow: 'color-mix(in srgb, var(--blue) 35%, transparent)',
    earColor: 'var(--green)',
    blush: 'color-mix(in srgb, var(--blue) 30%, transparent)',
    antenna: false,
  },
  blob: {
    bodyColor: 'var(--green)',
    bodyGlow: 'color-mix(in srgb, var(--green) 35%, transparent)',
    earColor: 'var(--blue)',
    blush: 'color-mix(in srgb, var(--green) 30%, transparent)',
    antenna: true,
  },
};

export default function InteractiveMascot({
  variant = 'bot',
  size = 90,
  style = {},
  className = '',
  label = '',
}) {
  const ref = useRef(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const cfg = MASCOT_CONFIGS[variant] || MASCOT_CONFIGS.bot;

  /* ── track cursor → move pupils ── */
  useEffect(() => {
    const onMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxMove = size * 0.065;
      const ratio = Math.min(dist / 320, 1);
      setPupil({
        x: (dx / (dist || 1)) * maxMove * ratio,
        y: (dy / (dist || 1)) * maxMove * ratio,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [size]);

  /* ── random blinking ── */
  useEffect(() => {
    const blinker = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 2800 + Math.random() * 2500);
    return () => clearInterval(blinker);
  }, []);

  const s = size;
  const eyeW = s * 0.22;
  const eyeH = blink ? s * 0.04 : s * 0.26;
  const pupilR = s * 0.09;
  const earSize = s * 0.18;

  return (
    <div
      ref={ref}
      className={`mascot-wrap ${className}`}
      style={{ width: s, height: s + 30, position: 'relative', ...style }}
      title={label}
    >
      {/* body glow */}
      <div
        className="mascot-glow"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: s * 0.7,
          height: s * 0.18,
          borderRadius: '50%',
          background: cfg.bodyGlow,
          filter: `blur(${s * 0.12}px)`,
        }}
      />

      {/* antenna */}
      {cfg.antenna && (
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            className="mascot-antenna-ball"
            style={{
              width: s * 0.12,
              height: s * 0.12,
              borderRadius: '50%',
              background: cfg.earColor,
              boxShadow: `0 0 12px ${cfg.earColor}`,
            }}
          />
          <div style={{ width: 2, height: s * 0.1, background: 'rgba(255,255,255,0.15)' }} />
        </div>
      )}

      {/* ears */}
      <div style={{ position: 'absolute', top: s * 0.22, left: -earSize * 0.35 }}>
        <div style={{ width: earSize, height: earSize, borderRadius: '50%', background: cfg.earColor, opacity: 0.7, boxShadow: `0 0 8px color-mix(in srgb, ${cfg.earColor} 35%, transparent)` }} />
      </div>
      <div style={{ position: 'absolute', top: s * 0.22, right: -earSize * 0.35 }}>
        <div style={{ width: earSize, height: earSize, borderRadius: '50%', background: cfg.earColor, opacity: 0.7, boxShadow: `0 0 8px color-mix(in srgb, ${cfg.earColor} 35%, transparent)` }} />
      </div>

      {/* main body */}
      <div
        className="mascot-body"
        style={{
          position: 'absolute',
          top: cfg.antenna ? s * 0.2 : s * 0.05,
          left: '50%',
          transform: 'translateX(-50%)',
          width: s * 0.72,
          height: s * 0.72,
          borderRadius: s * 0.24,
          background: `color-mix(in srgb, ${cfg.bodyColor} 15%, transparent)`,
          border: `2px solid color-mix(in srgb, ${cfg.bodyColor} 30%, transparent)`,
          backdropFilter: 'blur(12px)',
          boxShadow: `0 8px 32px ${cfg.bodyGlow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: s * 0.12,
        }}
      >
        {/* left eye */}
        <div style={{
          width: eyeW, height: eyeH,
          borderRadius: blink ? eyeW : eyeW * 0.42,
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'height 0.1s ease, border-radius 0.1s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          {!blink && (
            <div style={{
              width: pupilR, height: pupilR,
              borderRadius: '50%',
              background: '#111',
              transform: `translate(${pupil.x}px, ${pupil.y}px)`,
              transition: 'transform 0.08s ease-out',
              position: 'relative',
            }}>
              {/* sparkle */}
              <div style={{
                position: 'absolute', top: 1, right: 1,
                width: pupilR * 0.35, height: pupilR * 0.35,
                borderRadius: '50%', background: '#fff',
              }} />
            </div>
          )}
        </div>

        {/* right eye */}
        <div style={{
          width: eyeW, height: eyeH,
          borderRadius: blink ? eyeW : eyeW * 0.42,
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'height 0.1s ease, border-radius 0.1s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          {!blink && (
            <div style={{
              width: pupilR, height: pupilR,
              borderRadius: '50%',
              background: '#111',
              transform: `translate(${pupil.x}px, ${pupil.y}px)`,
              transition: 'transform 0.08s ease-out',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 1, right: 1,
                width: pupilR * 0.35, height: pupilR * 0.35,
                borderRadius: '50%', background: '#fff',
              }} />
            </div>
          )}
        </div>
      </div>

      {/* blush cheeks */}
      <div style={{
        position: 'absolute',
        top: cfg.antenna ? s * 0.55 : s * 0.42,
        left: s * 0.08,
        width: s * 0.13, height: s * 0.07,
        borderRadius: '50%',
        background: cfg.blush,
        filter: `blur(${s * 0.03}px)`,
      }} />
      <div style={{
        position: 'absolute',
        top: cfg.antenna ? s * 0.55 : s * 0.42,
        right: s * 0.08,
        width: s * 0.13, height: s * 0.07,
        borderRadius: '50%',
        background: cfg.blush,
        filter: `blur(${s * 0.03}px)`,
      }} />

      {/* tiny mouth */}
      <div style={{
        position: 'absolute',
        top: cfg.antenna ? s * 0.64 : s * 0.5,
        left: '50%',
        transform: 'translateX(-50%)',
        width: s * 0.1, height: s * 0.05,
        borderRadius: `0 0 ${s * 0.05}px ${s * 0.05}px`,
        background: 'rgba(255,255,255,0.15)',
      }} />

      {/* label */}
      {label && (
        <div style={{
          position: 'absolute',
          bottom: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: s * 0.12,
          fontWeight: 800,
          color: cfg.bodyColor,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textShadow: `0 0 10px ${cfg.bodyGlow}`,
          whiteSpace: 'nowrap',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
