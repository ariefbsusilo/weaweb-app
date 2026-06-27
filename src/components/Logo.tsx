import React from 'react';
import Image from 'next/image';

export default function Logo({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <Image 
      src="/logo.png" 
      alt="Weaweb Logo" 
      width={size} 
      height={size} 
      className={`object-contain ${className}`}
      priority
    />
  );
}
