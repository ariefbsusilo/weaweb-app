import React from 'react';

export default function Logo({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="arcGrad1" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="arcGrad2" x1="90%" y1="100%" x2="10%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d1f35" />
          <stop offset="100%" stopColor="#070d1a" />
        </linearGradient>
        
        {/* Glow Effects */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Orbiting Arcs / Swirls */}
      <g filter="url(#glow)">
        {/* Top/Right Arc */}
        <path
          d="M 20 50 C 20 25, 40 10, 65 15 C 80 18, 90 30, 90 45 C 90 55, 85 62, 78 68 C 72 73, 62 76, 55 76 C 45 76, 38 72, 33 65 C 28 58, 25 48, 30 38"
          stroke="url(#arcGrad1)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        {/* Bottom/Left Arc */}
        <path
          d="M 80 50 C 80 75, 60 90, 35 85 C 20 82, 10 70, 10 55 C 10 45, 15 38, 22 32 C 28 27, 38 24, 45 24 C 55 24, 62 28, 67 35 C 72 42, 75 52, 70 62"
          stroke="url(#arcGrad2)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
      </g>

      {/* Center Glow */}
      <circle cx="50" cy="50" r="15" fill="#10b981" opacity="0.4" filter="url(#strongGlow)" />

      {/* Central WhatsApp-like Chat Bubble */}
      <path
        d="M 50 32 C 60 32, 68 38.5, 68 47.5 C 68 56.5, 60 63, 50 63 C 46.5 63, 43.5 62, 41 60.5 L 34 62 L 35.5 56 C 33.5 53.5, 32 50.5, 32 47.5 C 32 38.5, 40 32, 50 32 Z"
        fill="url(#bubbleGrad)"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
