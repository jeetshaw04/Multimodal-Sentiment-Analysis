const AuthBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large teal infinity-like shape */}
      <svg
        viewBox="0 0 600 600"
        className="absolute -left-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-60"
      >
        <defs>
          <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(45, 212, 191, 0.4)" />
            <stop offset="50%" stopColor="rgba(34, 211, 238, 0.3)" />
            <stop offset="100%" stopColor="rgba(45, 212, 191, 0.2)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d="M150,300 C150,150 300,150 300,300 C300,450 450,450 450,300 C450,150 300,150 300,300 C300,450 150,450 150,300"
          fill="none"
          stroke="url(#tealGradient)"
          strokeWidth="60"
          strokeLinecap="round"
          filter="url(#glow)"
          className="animate-spin-slow"
          style={{ transformOrigin: '300px 300px' }}
        />
      </svg>

      {/* Purple/pink accent orb */}
      <div className="absolute top-32 left-48 w-48 h-48 rounded-full bg-gradient-to-br from-indisense-purple/30 to-indisense-pink/20 blur-2xl" />
      
      {/* Small floating particles */}
      <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-primary/40 animate-float" />
      <div className="absolute top-40 left-64 w-1.5 h-1.5 rounded-full bg-indisense-purple/50 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-32 w-2 h-2 rounded-full bg-indisense-cyan/40 animate-float" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default AuthBackground;
