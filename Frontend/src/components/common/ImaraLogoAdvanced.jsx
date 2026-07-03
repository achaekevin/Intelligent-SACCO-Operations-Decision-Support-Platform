const ImaraLogoAdvanced = ({ size = 40, className = '', variant = 'default' }) => {
  const variants = {
    default: {
      primary: '#064e3b',
      secondary: '#1e40af',
      accent: '#10b981',
      highlight: '#3b82f6'
    },
    light: {
      primary: '#10b981',
      secondary: '#3b82f6',
      accent: '#34d399',
      highlight: '#60a5fa'
    },
    dark: {
      primary: '#022c22',
      secondary: '#1e3a8a',
      accent: '#065f46',
      highlight: '#1d4ed8'
    }
  };

  const colors = variants[variant] || variants.default;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Main Gradient - Emerald to Sapphire */}
        <linearGradient id={`mainGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="50%" stopColor={colors.accent} />
          <stop offset="100%" stopColor={colors.secondary} />
        </linearGradient>

        {/* Accent Gradient */}
        <linearGradient id={`accentGradient-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.accent} />
          <stop offset="100%" stopColor={colors.highlight} />
        </linearGradient>

        {/* Glow Filter */}
        <filter id={`glow-${variant}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Shadow */}
        <filter id={`shadow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Background Shield - Subtle */}
      <path
        d="M60 20 L90 30 L90 60 Q90 85 60 105 Q30 85 30 60 L30 30 Z"
        fill={`url(#mainGradient-${variant})`}
        opacity="0.12"
        filter={`url(#shadow-${variant})`}
      />

      {/* Left Pillar - Geometric and Strong */}
      <g filter={`url(#glow-${variant})`}>
        <path
          d="M42 95 L42 50 L45 45 L52 35 L55 40 L60 50 L60 95 L55 97 L47 97 Z"
          fill={`url(#mainGradient-${variant})`}
          stroke={colors.accent}
          strokeWidth="0.5"
          strokeLinejoin="miter"
        />
      </g>

      {/* Right Pillar - Mirror and Interlock */}
      <g filter={`url(#glow-${variant})`}>
        <path
          d="M60 95 L60 50 L65 40 L68 35 L75 45 L78 50 L78 95 L73 97 L65 97 Z"
          fill={`url(#mainGradient-${variant})`}
          stroke={colors.highlight}
          strokeWidth="0.5"
          strokeLinejoin="miter"
        />
      </g>

      {/* Crossbar - Unity Symbol */}
      <g filter={`url(#glow-${variant})`}>
        <rect
          x="45"
          y="62"
          width="30"
          height="7"
          fill={`url(#accentGradient-${variant})`}
          rx="1.5"
        />
        {/* Crossbar Detail Lines */}
        <line x1="48" y1="65.5" x2="72" y2="65.5" stroke={colors.highlight} strokeWidth="1" opacity="0.5" />
      </g>

      {/* Top Shield Cap - 'A' Peak */}
      <g filter={`url(#glow-${variant})`}>
        <path
          d="M52 35 L60 22 L68 35 L65 38 L60 34 L55 38 Z"
          fill={`url(#accentGradient-${variant})`}
        />
        {/* Crown Detail */}
        <circle cx="60" cy="25" r="2.5" fill={colors.highlight} opacity="0.8" />
      </g>

      {/* Interlocking Joints - Left */}
      <g>
        <circle cx="52" cy="55" r="4" fill={colors.accent} opacity="0.9" />
        <circle cx="52" cy="55" r="2.5" fill={colors.highlight} />
      </g>

      {/* Interlocking Joints - Right */}
      <g>
        <circle cx="68" cy="55" r="4" fill={colors.highlight} opacity="0.9" />
        <circle cx="68" cy="55" r="2.5" fill={colors.accent} />
      </g>

      {/* Foundation Base - Stability */}
      <g filter={`url(#shadow-${variant})`}>
        <rect
          x="38"
          y="95"
          width="44"
          height="5"
          fill={`url(#mainGradient-${variant})`}
          rx="2.5"
        />
        {/* Base Detail */}
        <rect
          x="41"
          y="97"
          width="38"
          height="1"
          fill={colors.accent}
          opacity="0.5"
        />
      </g>

      {/* Geometric Detail Lines - Left Pillar */}
      <line x1="48" y1="50" x2="48" y2="90" stroke={colors.accent} strokeWidth="0.5" opacity="0.3" />
      <line x1="54" y1="45" x2="54" y2="90" stroke={colors.highlight} strokeWidth="0.5" opacity="0.3" />

      {/* Geometric Detail Lines - Right Pillar */}
      <line x1="66" y1="45" x2="66" y2="90" stroke={colors.accent} strokeWidth="0.5" opacity="0.3" />
      <line x1="72" y1="50" x2="72" y2="90" stroke={colors.highlight} strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
};

export default ImaraLogoAdvanced;
