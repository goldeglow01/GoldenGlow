/** Lightweight inline icon set (no icon-font dependency). */
const paths = {
  hardhat: (
    <>
      <path d="M2 18h20" />
      <path d="M4 18v-3a8 8 0 0 1 16 0v3" />
      <path d="M9 6.2a3 3 0 0 1 6 0V11" />
      <path d="M9 7v4M15 7v4" />
    </>
  ),
  droplet: <path d="M12 2.7c3.3 3.7 6 6.9 6 10.2a6 6 0 0 1-12 0c0-3.3 2.7-6.5 6-10.2z" />,
  zap: <path d="M13 2 4.5 13.5H11l-1 8.5 9.5-12H13l1-8z" />,
  wind: (
    <>
      <path d="M3 8h8.5a3 3 0 1 0-3-3" />
      <path d="M3 12h13a3 3 0 1 1-3 3" />
      <path d="M3 16h6" />
    </>
  ),
  flame: <path d="M12 2c0 4-5 6-5 11a5 5 0 0 0 10 0c0-3-2-5-3-7-1 2-2 2-2 2s0-3 0-6z" />,
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  sparkles: (
    <>
      <path d="M12 3.2l1.9 4.6 4.6 1.9-4.6 1.9L12 16.2l-1.9-4.6L5.5 9.7l4.6-1.9L12 3.2z" />
      <path d="M18.5 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9z" />
    </>
  ),
  shield: <path d="M12 3l7.5 3v5.6c0 4.2-3.2 7.6-7.5 9.4-4.3-1.8-7.5-5.2-7.5-9.4V6L12 3z" />,
  'shield-check': (
    <>
      <path d="M12 3l7.5 3v5.6c0 4.2-3.2 7.6-7.5 9.4-4.3-1.8-7.5-5.2-7.5-9.4V6L12 3z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  steering: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 3v6.4M12 14.6V21M3 12h6.4M14.6 12H21" />
    </>
  ),
  boxes: (
    <>
      <rect x="2.5" y="8" width="8.5" height="9" rx="1.4" />
      <rect x="13" y="3" width="8.5" height="9" rx="1.4" />
      <path d="M2.5 12.4h8.5M13 7.4h8.5M17.2 3v4.4" />
    </>
  ),
  factory: (
    <>
      <path d="M3 21V9l6 4V9l6 4V8l6 4v9H3z" />
      <path d="M7 21v-4M12 21v-4M17 21v-4" />
    </>
  ),
  hotel: (
    <>
      <path d="M2 19v-6h13a5 5 0 0 1 5 5v1" />
      <path d="M2 19h20M6 13V8h5v5" />
      <path d="M2 8v11" />
    </>
  ),
  utensils: (
    <>
      <path d="M6 3v6a2.5 2.5 0 0 0 5 0V3" />
      <path d="M8.5 11.5V21" />
      <path d="M17.5 3c-1.8 1.6-2.5 3.6-2.5 5.6s.9 3.4 2.5 3.4V21" />
    </>
  ),
  pulse: (
    <>
      <path d="M20.6 5.8a4.9 4.9 0 0 0-7 0L12 7.4l-1.6-1.6a4.9 4.9 0 1 0-7 7L12 21.5l8.6-8.7a4.9 4.9 0 0 0 0-7z" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-7" />
      <path d="M12 14c0-3.9-3-7-7-7 0 3.9 3 7 7 7z" />
      <path d="M12 14c0-3.9 3-7 7-7 0 3.9-3 7-7 7z" />
    </>
  ),
  oil: (
    <>
      <path d="M12 3c3 4 6 7.2 6 10.5A6 6 0 0 1 6 13.5C6 10.2 9 7 12 3z" />
      <path d="M9.5 14h5" />
    </>
  ),
  monitor: (
    <>
      <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
      <path d="M8.5 20.5h7M12 16.5v4" />
    </>
  ),
  bag: (
    <>
      <path d="M5.8 8h12.4l1.1 12.5H4.7L5.8 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  roller: (
    <>
      <rect x="3" y="4" width="12" height="5" rx="1.2" />
      <path d="M15 6.5h4.5v4.5H12v3" />
      <path d="M12 14v7" />
    </>
  ),
  hammer: (
    <>
      <path d="M15 12.5 6 21.5l-2.5-2.5 9-9" />
      <path d="M14 4l6 6-2.5 2.5-6-6L14 4z" />
      <path d="M12 6l6 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20.5 20.5l-4.3-4.3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M21.5 16.9v2.8a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.6-3.1 19.3 19.3 0 0 1-5.9-5.9A19.6 19.6 0 0 1 1.7 4.2 2 2 0 0 1 3.7 2h2.8a2 2 0 0 1 2 1.7c.13 1 .36 1.95.7 2.85a2 2 0 0 1-.45 2.1L7.5 9.9a15.8 15.8 0 0 0 6 6l1.25-1.25a2 2 0 0 1 2.1-.45c.9.34 1.85.57 2.85.7a2 2 0 0 1 1.8 2z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.3 2" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  'user-plus': (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
      <path d="M19 8v6M16 11h6" />
    </>
  ),
  check: <path d="M20 6.5 9.2 17.3 4 12.1" />,
  'arrow-right': (
    <>
      <path d="M4 12h16" />
      <path d="M14 6l6 6-6 6" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M20 12H4" />
      <path d="M10 6l-6 6 6 6" />
    </>
  ),
  'chevron-down': <path d="M6 9.5l6 6 6-6" />,
  'chevron-right': <path d="M9 5l7 7-7 7" />,
  'chevron-left': <path d="M15 5l-7 7 7 7" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3.2 3.6 3.2 14.4 0 18M12 3c-3.2 3.6-3.2 14.4 0 18" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2.5" y="7" width="19" height="13.5" rx="2" />
      <path d="M8 7V5.2A2.2 2.2 0 0 1 10.2 3h3.6A2.2 2.2 0 0 1 16 5.2V7" />
      <path d="M2.5 12h19" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-2.5h4V21" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  star: <path d="M12 2.7l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5L2.5 9.6l6.6-.9 2.9-6z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  'arrow-up-right': (
    <>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  linkedin: (
    <>
      <path d="M6.5 9.5V20M6.5 5v.01" />
      <path d="M11 20V9.5" />
      <path d="M11 13.6c0-2.2 1.4-3.8 3.5-3.8S18 11.4 18 13.6V20" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20.5 11.6a8.6 8.6 0 0 1-12.7 7.6L3 20.5l1.5-4.4a8.6 8.6 0 1 1 16-4.5z" />
      <path d="M8.6 8.4c.5 2.4 2.4 4.3 4.8 4.8.7.15 1.35-.25 1.55-.95l.2-.7-1.9-1-.95.8c-.95-.4-1.7-1.15-2.1-2.1l.8-.95-1-1.9-.7.2c-.7.2-1.1.85-.95 1.55" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4.5 4.5V21H6z" />
      <path d="M14 3v4.5h4.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L20 8l-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6.5 7l1 14h9l1-14" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bookmark: <path d="M6.2 3h11.6v18l-5.8-4.1L6.2 21V3z" />,
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="M7 4.2 20 12 7 19.8V4.2z" />,
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  message: <path d="M21 11.6a8.4 8.4 0 0 1-8.4 8.4H8l-5 3 1-5v-6.4A8.4 8.4 0 0 1 12.4 3.2h.2A8.4 8.4 0 0 1 21 11.6z" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  send: (
    <>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </>
  ),
  filter: <path d="M3 5h18M7 12h10M10 19h4" />,
  award: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.6 14.2 7 22l5-3 5 3-1.6-7.8" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.4" />
      <path d="M3.5 17l5-4.8 4 3.8 3-2.8 5 4.8" />
    </>
  ),
  'log-in': (
    <>
      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19" />
    </>
  ),
  facebook: (
    <>
      <path d="M18 2h-2V6h2V2zm-2 14H4V4h2v12h12v-2h-2v2h2v2H6v-2z" />
    </>
  ),
  instagram: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="11.5" cy="11.5" r="1.5" />
    </>
  ),
  twitter: (
    <>
      <path d="M4 4l9.039 16.881H19L15 4H4z" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </>
  ),
  youtube: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polygon points="8.5 11.5 12 15 15.5 11.5 12 8" />
    </>
  ),
  telegram: (
    <>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </>
  ),
  github: (
    <>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.08-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85 0 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.53 1.37.18 2.39.08 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .26.16.57.67.48A10.52 10.52 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </>
  ),
  viber: (
    <>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M8.5 12.5l4 4 8-8" />
    </>
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5c0 1.5-2 3-4 3-2 0-4-1.5-4-3z" />
    </>
  ),
  tiktok: (
    <>
      <path d="M15 3v9.3a3.9 3.9 0 1 1-3.1-3.8" />
      <path d="M15 3c.5 2.4 2.2 4 4.6 4.3" />
    </>
  ),
};

export default function Icon({ name, size = 20, strokeWidth = 1.7, className = '', ...rest }) {
  const content = paths[name] ?? paths.sparkles;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon ${className}`}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {content}
    </svg>
  );
}
