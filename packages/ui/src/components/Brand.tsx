import React from "react";

interface BrandProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export function BrandMark({ className = "", size = 36 }: { className?: string; size?: number | string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-label="AfriTrade Connect Mark"
      role="img"
    >
      <defs>
        <linearGradient id="brandBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="60%" stopColor="#047857" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>

        <linearGradient id="brandGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#fbbf24" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="brandLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        <filter id="brandShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodOpacity="0.25" floodColor="#000" />
        </filter>
      </defs>

      <rect width="512" height="512" rx="108" fill="url(#brandBgGrad)" />
      <circle cx="256" cy="240" r="180" fill="#10b981" opacity="0.12" />

      <g filter="url(#brandShadow)">
        <path
          d="M 256 64 L 130 136 A 24 24 0 0 0 118 157 L 118 300 C 118 308, 122 316, 130 321 L 230 379 C 238 384, 244 380, 244 370 L 244 330 C 244 322, 238 318, 232 314 L 162 274 L 162 172 L 248 122 C 254 118, 258 110, 258 100 L 258 72 C 258 64, 262 61, 256 64 Z"
          fill="url(#brandGoldGrad)"
        />

        <path
          d="M 256 64 L 382 136 A 24 24 0 0 1 394 157 L 394 355 A 24 24 0 0 1 382 376 L 256 448 L 256 404 L 350 350 L 350 172 L 264 122 C 258 118, 254 110, 254 100 L 254 72 C 254 64, 250 61, 256 64 Z"
          fill="url(#brandLeafGrad)"
        />

        <g transform="translate(198, 110) rotate(-12)">
          <path d="M 12 210 Q 18 110 32 10" stroke="url(#brandGoldGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M 32 10 C 35 -4, 45 -4, 40 12 C 37 22, 28 20, 32 10 Z" fill="url(#brandGoldGrad)" />
          <path d="M 30 35 C 16 25, 10 38, 24 45 C 31 48, 33 40, 30 35 Z" fill="url(#brandGoldGrad)" />
          <path d="M 32 32 C 46 22, 52 35, 38 42 C 31 45, 29 37, 32 32 Z" fill="url(#brandGoldGrad)" />
          <path d="M 26 62 C 10 50, 4 65, 20 73 C 27 76, 30 68, 26 62 Z" fill="url(#brandGoldGrad)" />
          <path d="M 29 58 C 45 46, 51 61, 35 69 C 28 72, 26 64, 29 58 Z" fill="url(#brandGoldGrad)" />
          <path d="M 23 90 C 5 76, -1 93, 16 102 C 24 106, 27 97, 23 90 Z" fill="url(#brandGoldGrad)" />
          <path d="M 26 85 C 44 71, 50 88, 33 97 C 25 101, 23 92, 26 85 Z" fill="url(#brandGoldGrad)" />
          <path d="M 19 120 C 0 105, -6 123, 12 133 C 20 137, 23 128, 19 120 Z" fill="url(#brandGoldGrad)" />
          <path d="M 23 114 C 42 99, 48 117, 30 127 C 22 131, 20 122, 23 114 Z" fill="url(#brandGoldGrad)" />
        </g>
      </g>
    </svg>
  );
}

export function BrandLogo({ className = "", size = 36, showText = true }: BrandProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark size={size} />
      {showText && (
        <div className="flex flex-col leading-none select-none">
          <span className="font-display font-extrabold text-lg tracking-tight text-foreground">
            AfriTrade
          </span>
          <span className="font-sans font-bold text-[10px] tracking-widest uppercase text-primary">
            Connect
          </span>
        </div>
      )}
    </div>
  );
}
