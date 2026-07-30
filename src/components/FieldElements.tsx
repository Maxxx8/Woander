import React from 'react';

/**
 * Terrain-inspired section divider — a soft elevation profile
 * drawn in hairline gold, replacing flat border separators.
 */
export const TerrainDivider: React.FC<{ className?: string; flip?: boolean }> = ({
  className = '',
  flip = false,
}) => (
  <div
    className={`relative w-full overflow-hidden pointer-events-none ${className}`}
    style={{ height: '48px' }}
    aria-hidden="true"
  >
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : undefined }}
    >
      <path
        d="M0,32 L120,28 L240,34 L360,18 L480,26 L600,14 L720,22 L840,10 L960,24 L1080,16 L1200,30 L1320,20 L1440,28 L1440,48 L0,48 Z"
        fill="#0a120a"
        stroke="#c9a84a"
        strokeWidth="0.5"
        strokeOpacity="0.18"
      />
      <path
        d="M0,38 L160,34 L320,40 L480,30 L640,36 L800,28 L960,34 L1120,30 L1280,38 L1440,32"
        fill="none"
        stroke="#c9a84a"
        strokeWidth="0.4"
        strokeOpacity="0.1"
      />
    </svg>
  </div>
);

/**
 * Subtle topographic contour background — concentric ellipses
 * in hairline gold at very low opacity. Sits behind section content.
 */
export const TopoBackground: React.FC<{ className?: string; opacity?: number }> = ({
  className = '',
  opacity = 0.05,
}) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="topo-bg" x="0" y="0" width="320" height="320" patternUnits="userSpaceOnUse">
        <ellipse cx="160" cy="160" rx="140" ry="108" fill="none" stroke="#c9a84a" strokeWidth="0.7" />
        <ellipse cx="160" cy="160" rx="104" ry="80" fill="none" stroke="#c9a84a" strokeWidth="0.5" />
        <ellipse cx="160" cy="160" rx="68" ry="52" fill="none" stroke="#c9a84a" strokeWidth="0.4" />
        <ellipse cx="160" cy="160" rx="32" ry="24" fill="none" stroke="#c9a84a" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#topo-bg)" />
  </svg>
);

/**
 * Field-journal caption overlay for images — a small coordinate
 * stamp and caption line, styled like a documentary photo label.
 */
export const FieldCaption: React.FC<{
  coordinate?: string;
  caption?: string;
  className?: string;
}> = ({ coordinate, caption, className = '' }) => (
  <div className={`absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-forest-950/90 via-forest-950/40 to-transparent ${className}`}>
    {coordinate && (
      <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest mb-1">{coordinate}</p>
    )}
    {caption && (
      <p className="font-display italic text-mist-300 text-sm leading-snug">{caption}</p>
    )}
  </div>
);
