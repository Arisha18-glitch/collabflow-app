import { useCallback, useRef } from 'react';

/*  ──────────────────────────────────────────────────────
    use3DTilt – adds a "hover-tilt" 3D effect to glass modules.
    Usage:
      const { ref, handlers } = use3DTilt({ maxTilt: 8 });
      <div ref={ref} {...handlers} className="module-box">
    ────────────────────────────────────────────────────── */

export default function use3DTilt({ maxTilt = 6, scale = 1.02, speed = 400 } = {}) {
  const ref = useRef(null);

  const handleMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateY = ((x - cx) / cx) * maxTilt;
      const rotateX = -((y - cy) / cy) * maxTilt;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale},${scale},${scale})`;
      el.style.transition = `transform 0.1s ease`;

      // dynamic highlight
      const percX = (x / rect.width) * 100;
      const percY = (y / rect.height) * 100;
      el.style.backgroundImage = `radial-gradient(circle at ${percX}% ${percY}%, rgba(255,255,255,0.06) 0%, transparent 60%)`;
    },
    [maxTilt, scale],
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = `transform ${speed}ms cubic-bezier(.34,1.56,.64,1)`;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    el.style.backgroundImage = '';
  }, [speed]);

  return {
    ref,
    handlers: {
      onMouseMove: handleMove,
      onMouseLeave: handleLeave,
    },
  };
}
