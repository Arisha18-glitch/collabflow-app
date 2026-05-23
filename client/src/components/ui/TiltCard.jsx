import use3DTilt from '../../hooks/use3DTilt';

/*  ─── TiltCard ─────────────────────────────────────────
    Drop-in replacement for <div className="module-box">
    that automatically adds 3D perspective tilt on hover.
    ────────────────────────────────────────────────────── */

export default function TiltCard({
  children,
  className = 'module-box',
  style = {},
  maxTilt = 6,
  scale = 1.02,
  onClick,
  ...rest
}) {
  const { ref, handlers } = use3DTilt({ maxTilt, scale });

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: 'preserve-3d', ...style }}
      onClick={onClick}
      {...handlers}
      {...rest}
    >
      {children}
    </div>
  );
}
