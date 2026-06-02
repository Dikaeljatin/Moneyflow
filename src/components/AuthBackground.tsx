'use client';

import { ReactNode } from 'react';

export default function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white flex items-center justify-center">
      {/* Mobile Background (Soft Gradient Blobs) */}
      <div className="absolute inset-0 pointer-events-none md:hidden overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[40%] bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-[30%] -right-[20%] w-[70%] h-[50%] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[80%] h-[40%] bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* Left Waves (Desktop Only) */}
      <div className="hidden md:block absolute top-0 left-0 w-1/3 lg:w-1/2 h-full pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 500 1000"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          {/* Layer 1 (Lightest, inner) */}
          <path
            d="M0,0 L200,0 C350,250 350,750 200,1000 L0,1000 Z"
            fill="#ffe4e6"
          />
          {/* Layer 2 */}
          <path
            d="M0,0 L140,0 C280,250 280,750 140,1000 L0,1000 Z"
            fill="#fecdd3"
          />
          {/* Layer 3 */}
          <path
            d="M0,0 L80,0 C200,250 200,750 80,1000 L0,1000 Z"
            fill="#fda4af"
          />
          {/* Layer 4 */}
          <path
            d="M0,0 L30,0 C120,250 120,750 30,1000 L0,1000 Z"
            fill="#fb7185"
            className="opacity-70"
          />
          {/* Layer 5 (Darkest, outer) */}
          <path
            d="M0,0 L0,0 C60,250 60,750 0,1000 Z"
            fill="#e11d48"
            className="opacity-40"
          />
        </svg>
      </div>

      {/* Right Waves (Desktop Only) */}
      <div className="hidden md:block absolute top-0 right-0 w-1/3 lg:w-1/2 h-full pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 500 1000"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          {/* Layer 1 (Lightest, inner) */}
          <path
            d="M500,0 L300,0 C150,250 150,750 300,1000 L500,1000 Z"
            fill="#ffe4e6"
          />
          {/* Layer 2 */}
          <path
            d="M500,0 L360,0 C220,250 220,750 360,1000 L500,1000 Z"
            fill="#fecdd3"
          />
          {/* Layer 3 */}
          <path
            d="M500,0 L420,0 C300,250 300,750 420,1000 L500,1000 Z"
            fill="#fda4af"
          />
          {/* Layer 4 */}
          <path
            d="M500,0 L470,0 C380,250 380,750 470,1000 L500,1000 Z"
            fill="#fb7185"
            className="opacity-70"
          />
          {/* Layer 5 (Darkest, outer) */}
          <path
            d="M500,0 L500,0 C440,250 440,750 500,1000 Z"
            fill="#e11d48"
            className="opacity-40"
          />
        </svg>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full px-6 md:px-4">
        {children}
      </div>
    </div>
  );
}
