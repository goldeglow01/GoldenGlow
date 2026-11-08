import { useEffect, useRef } from 'react';

const IDLE_MS = 150;

/**
 * Cursor spotlight: a soft glow that follows the pointer while it is over the
 * section that hosts it.
 *
 * Port of the shadcn `spotlight-background` snippet to this project's stack
 * (plain JSX + CSS, no Tailwind). Behaviour matches the original — the glow
 * contracts while the cursor moves and expands once it rests — but the
 * position is written straight to the element inside requestAnimationFrame,
 * so pointer movement never re-renders React. Skipped for touch pointers and
 * for visitors who prefer reduced motion.
 */
export default function SpotlightBackground({ className = '' }) {
  const hostRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const glow = glowRef.current;
    if (!host || !glow) return undefined;

    const media = (query) =>
      typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
    if (!media('(hover: hover) and (pointer: fine)') || media('(prefers-reduced-motion: reduce)')) {
      return undefined;
    }

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let idleTimer;
    let inside = false;
    let placed = false;

    const render = () => {
      const rect = host.getBoundingClientRect();
      const isInside =
        target.x >= rect.left &&
        target.x <= rect.right &&
        target.y >= rect.top &&
        target.y <= rect.bottom;

      if (isInside !== inside) {
        inside = isInside;
        host.classList.toggle('is-lit', inside);
      }

      if (!inside) {
        frame = 0;
        return;
      }

      // Convert viewport coordinates to coordinates inside the host so the
      // glow scrolls with the section and is clipped by it.
      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;
      glow.style.transform = `translate3d(${current.x - rect.left}px, ${current.y - rect.top}px, 0) translate(-50%, -50%)`;

      const settling = Math.abs(target.x - current.x) > 0.4 || Math.abs(target.y - current.y) > 0.4;
      frame = settling ? requestAnimationFrame(render) : 0;
    };

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;

      if (!placed) {
        current.x = target.x;
        current.y = target.y;
        placed = true;
      }

      glow.classList.add('is-moving');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => glow.classList.remove('is-moving'), IDLE_MS);

      if (!frame) frame = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div ref={hostRef} className={`spotlight ${className}`} aria-hidden="true">
      <span ref={glowRef} className="spotlight__glow" />
    </div>
  );
}
