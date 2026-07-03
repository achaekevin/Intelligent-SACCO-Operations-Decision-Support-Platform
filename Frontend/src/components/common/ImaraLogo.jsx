const ImaraLogo = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Shield Background - Subtle */}
      <path
        d="M50 10 L75 20 L75 45 Q75 65 50 85 Q25 65 25 45 L25 20 Z"
        fill="url(#emeraldGradient)"
        opacity="0.15"
      />

      {/* Left Pillar of 'A' - Interlocking */}
      <path
        d="M35 75 L35 40 L42 25 L50 40 L50 75 Z"
        fill="url(#emeraldGradient)"
        stroke="url(#lightGradient)"
        strokeWidth="1"
      />

      {/* Right Pillar of 'A' - Interlocking */}
      <path
        d="M50 75 L50 40 L58 25 L65 40 L65 75 Z"
        fill="url(#emeraldGradient)"
        stroke="url(#lightGradient)"
        strokeWidth="1"
      />

      {/* Crossbar - Connecting the pillars */}
      <rect
        x="38"
        y="52"
        width="24"
        height="6"
        fill="url(#lightGradient)"
        rx="1"
      />

      {/* Top Shield Cap - Merging with 'A' */}
      <path
        d="M42 25 L50 15 L58 25 L55 30 L50 27 L45 30 Z"
        fill="url(#lightGradient)"
      />

      {/* Interlocking Detail - Left */}
      <circle cx="42" cy="48" r="3" fill="#3b82f6" opacity="0.8" />

      {/* Interlocking Detail - Right */}
      <circle cx="58" cy="48" r="3" fill="#10b981" opacity="0.8" />

      {/* Foundation Base */}
      <rect
        x="32"
        y="75"
        width="36"
        height="4"
        fill="url(#emeraldGradient)"
        rx="2"
      />
    </svg>
  );
};

export default ImaraLogo;
