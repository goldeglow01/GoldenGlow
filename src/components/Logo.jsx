import { site } from '../data/site';

/**
 * GoldenGlow brand lockup: the official circular gold-on-navy badge
 * (public/images/logo-mark.png) paired with the GOLDENGLOW wordmark.
 */
export default function Logo({ variant = 'light', size = 46, withTagline = true, className = '' }) {
  return (
    <span className={`logo logo--${variant} ${className}`}>
      <img
        src="/images/logo-mark.png"
        alt={`${site.name} logo`}
        className="logo__mark"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        decoding="async"
      />

      <span className="logo__text">
        <span className="logo__word">
          GOLDEN<span className="logo__word-accent">GLOW</span>
        </span>
        {withTagline && <span className="logo__tag">SINCE {site.since}</span>}
      </span>
    </span>
  );
}
