const ImaraLogo = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definitions - Enhanced */}
      <defs>
        {/* Main Emerald to Sapphire Gradient */}
        <linearGradient id="primaryGradient" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* Bright Accent Gradient */}
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>

        {/* Light Shine Gradient */}
        <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>

        {/* Shadow Filter */}
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Glow Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Shield - More Visible */}
      <path
        d="M60 15 L90 27 L90 58 Q90 82 60 100 Q30 82 30 58 L30 27 Z"
        fill="url(#primaryGradient)"
        opacity="0.25"
        filter="url(#dropShadow)"
      />

      {/* Shield Outline - For Definition */}
      <path
        d="M60 15 L90 27 L90 58 Q90 82 60 100 Q30 82 30 58 L30 27 Z"
        stroke="url(#accentGradient)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />

      {/* Left Pillar of 'A' - Enhanced */}
      <g filter="url(#glow)">
        <path
          d="M42 90 L42 48 L46 42 L54 30 L58 38 L60 48 L60 90 Z"
          fill="url(#primaryGradient)"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeLinejoin="miter"
        />
        {/* Shine Effect - Left */}
        <path
          d="M46 50 L48 45 L50 50 L50 85 L48 87 L46 85 Z"
          fill="url(#shineGradient)"
          opacity="0.6"
        />
        {/* Inner Line Detail - Left */}
        <line x1="50" y1="45" x2="50" y2="88" stroke="#34d399" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Right Pillar of 'A' - Enhanced */}
      <g filter="url(#glow)">
        <path
          d="M60 90 L60 48 L62 38 L66 30 L74 42 L78 48 L78 90 Z"
          fill="url(#primaryGradient)"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinejoin="miter"
        />
        {/* Shine Effect - Right */}
        <path
          d="M70 50 L72 45 L74 50 L74 85 L72 87 L70 85 Z"
          fill="url(#shineGradient)"
          opacity="0.6"
        />
        {/* Inner Line Detail - Right */}
        <line x1="70" y1="45" x2="70" y2="88" stroke="#60a5fa" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Crossbar - Unity Symbol - Enhanced */}
      <g filter="url(#glow)">
        <rect
          x="45"
          y="60"
          width="30"
          height="8"
          fill="url(#accentGradient)"
          rx="2"
        />
        {/* Crossbar Shine */}
        <rect
          x="47"
          y="61.5"
          width="26"
          height="2.5"
          fill="#ffffff"
          opacity="0.4"
          rx="1"
        />
        {/* Crossbar Border */}
        <rect
          x="45"
          y="60"
          width="30"
          height="8"
          stroke="#34d399"
          strokeWidth="1"
          fill="none"
          rx="2"
          opacity="0.6"
        />
      </g>

      {/* Top Shield Cap/Crown - 'A' Peak - Enhanced */}
      <g filter="url(#glow)">
        <path
          d="M54 30 L60 18 L66 30 L64 34 L60 31 L56 34 Z"
          fill="url(#accentGradient)"
          stroke="#60a5fa"
          strokeWidth="1"
        />
        {/* Crown Shine */}
        <path
          d="M57 30 L60 22 L63 30 Z"
          fill="#ffffff"
          opacity="0.3"
        />
        {/* Crown Jewel */}
        <circle cx="60" cy="23" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="60" cy="23" r="2" fill="url(#accentGradient)" />
      </g>

      {/* Interlocking Joints - Left - Enhanced */}
      <g filter="url(#glow)">
        <circle cx="54" cy="53" r="5" fill="#065f46" opacity="0.8" />
        <circle cx="54" cy="53" r="4" fill="url(#primaryGradient)" />
        <circle cx="54" cy="53" r="2.5" fill="#34d399" />
        <circle cx="54" cy="53" r="1.5" fill="#ffffff" opacity="0.8" />
      </g>

      {/* Interlocking Joints - Right - Enhanced */}
      <g filter="url(#glow)">
        <circle cx="66" cy="53" r="5" fill="#1e3a8a" opacity="0.8" />
        <circle cx="66" cy="53" r="4" fill="url(#primaryGradient)" />
        <circle cx="66" cy="53" r="2.5" fill="#60a5fa" />
        <circle cx="66" cy="53" r="1.5" fill="#ffffff" opacity="0.8" />
      </g>

      {/* Foundation Base - Enhanced */}
      <g filter="url(#dropShadow)">
        <rect
          x="38"
          y="90"
          width="44"
          height="6"
          fill="url(#primaryGradient)"
          rx="3"
        />
        {/* Base Shine */}
        <rect
          x="40"
          y="91"
          width="40"
          height="2"
          fill="#ffffff"
          opacity="0.3"
          rx="1"
        />
        {/* Base Border */}
        <rect
          x="38"
          y="90"
          width="44"
          height="6"
          stroke="url(#accentGradient)"
          strokeWidth="1"
          fill="none"
          rx="3"
        />
      </g>

      {/* Additional Geometric Details for Depth */}
      <g opacity="0.4">
        {/* Left Pillar Edge Lines */}
        <line x1="46" y1="50" x2="46" y2="88" stroke="#34d399" strokeWidth="0.8" />
        <line x1="56" y1="42" x2="56" y2="88" stroke="#10b981" strokeWidth="0.8" />
        
        {/* Right Pillar Edge Lines */}
        <line x1="64" y1="42" x2="64" y2="88" stroke="#3b82f6" strokeWidth="0.8" />
        <line x1="74" y1="50" x2="74" y2="88" stroke="#60a5fa" strokeWidth="0.8" />
      </g>

      {/* Highlight Dots for Premium Look */}
      <g opacity="0.6">
        <circle cx="48" cy="75" r="1" fill="#34d399" />
        <circle cx="52" cy="70" r="1" fill="#10b981" />
        <circle cx="68" cy="70" r="1" fill="#60a5fa" />
        <circle cx="72" cy="75" r="1" fill="#3b82f6" />
      </g>
    </svg>
  );
};

export default ImaraLogo;
