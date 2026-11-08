/**
 * Pointer-driven card polish: a warm glow that follows the cursor, and an
 * optional small 3D tilt. Written straight to CSS custom properties so the
 * interaction never triggers a React re-render. Skipped entirely when the
 * visitor prefers reduced motion or is on a touch-only pointer.
 */
const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const metrics = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
};

export function moveGlow(event) {
  if (reduced() || event.pointerType === 'touch') return;
  const { x, y } = metrics(event);
  const el = event.currentTarget;
  el.style.setProperty('--gx', `${x * 100}%`);
  el.style.setProperty('--gy', `${y * 100}%`);
}

export function moveTilt(event) {
  moveGlow(event);
  if (reduced() || event.pointerType === 'touch') return;
  const { x, y } = metrics(event);
  const el = event.currentTarget;
  el.style.setProperty('--ry', `${(x - 0.5) * 6}deg`);
  el.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
  el.style.setProperty('--ty', '-4px');
}

export function resetTilt(event) {
  const el = event.currentTarget;
  ['--gx', '--gy', '--rx', '--ry', '--ty'].forEach((name) => el.style.removeProperty(name));
}
