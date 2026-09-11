import React, { useState } from 'react';
import { ChevronRight, Layers, SendHorizontal, QrCode } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* SLIDE 1: Ultra-Polished 3D Folder & Realistic Document ("Surat") */
function FolderLetterIllustration({ isDark }) {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-2xl animate-float">
      <defs>
        <linearGradient id="f1_folderBack" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? "#0B132B" : "#0F172A"} />
          <stop offset="100%" stopColor={isDark ? "#050914" : "#0A192F"} />
        </linearGradient>
        <linearGradient id="f1_folderFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? "#1E293B" : "#1E293B"} />
          <stop offset="100%" stopColor={isDark ? "#0F172A" : "#0F172A"} />
        </linearGradient>
        <linearGradient id="f1_paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="f1_paperBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <linearGradient id="f1_foldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id="f1_glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="f1_ribbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="f1_sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <filter id="f1_shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity={isDark ? "0.45" : "0.15"} />
        </filter>
      </defs>

      {/* Floating lines / streaks */}
      <line x1="35" y1="175" x2="145" y2="135" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
      <line x1="175" y1="85" x2="285" y2="45" stroke="#38BDF8" strokeWidth="1.5" opacity="0.7" />

      {/* Small floating background folder */}
      <g transform="translate(42, 55) scale(0.36) rotate(-15)">
        <rect x="20" y="40" width="160" height="120" rx="16" fill="url(#f1_folderBack)" />
        <rect x="20" y="60" width="160" height="100" rx="16" fill="url(#f1_folderFront)" />
      </g>

      {/* Main 3D Center Composition */}
      <g transform="translate(56, 60) rotate(-5)">
        {/* Main Folder Back Flap with Tab */}
        <path
          d="M 20 45 L 85 45 L 105 65 L 205 65 C 215 65 220 70 220 80 L 220 185 C 220 195 210 200 200 200 L 25 200 C 15 200 10 195 10 185 L 10 55 C 10 47 15 45 20 45 Z"
          fill="url(#f1_folderBack)"
        />

        {/* Back Document Sheet (Tilted Right) */}
        <g transform="translate(100, 26) rotate(14)">
          <rect x="0" y="0" width="95" height="125" rx="8" fill="url(#f1_paperBackGrad)" opacity="0.8" />
          <line x1="15" y1="25" x2="75" y2="25" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          <line x1="15" y1="40" x2="65" y2="40" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="15" y1="52" x2="80" y2="52" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* Main "SURAT" / Document (Crisp Letter with Folded Corner, Header, Text Lines & Verified Stamp) */}
        <g transform="translate(40, 8) rotate(2)" filter="url(#f1_shadow)">
          {/* Base Paper Sheet */}
          <path
            d="M 12 0 L 105 0 L 132 27 L 132 145 C 132 152 126 156 120 156 L 12 156 C 5 156 0 152 0 145 L 0 12 C 0 5 5 0 12 0 Z"
            fill="url(#f1_paperGrad)"
          />
          {/* Folded Top-Right Corner (Dog-Ear) */}
          <path
            d="M 105 0 L 105 27 L 132 27 Z"
            fill="url(#f1_foldGrad)"
          />
          <path
            d="M 105 0 L 132 27"
            stroke="#60A5FA"
            strokeWidth="0.8"
            opacity="0.6"
          />

          {/* Document Header Pill */}
          <rect x="16" y="16" width="34" height="7" rx="3.5" fill="#38BDF8" />
          <rect x="56" y="17" width="32" height="5" rx="2.5" fill="#94A3B8" opacity="0.6" />

          {/* Letter Content Lines */}
          <line x1="16" y1="36" x2="116" y2="36" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <line x1="16" y1="48" x2="108" y2="48" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="58" x2="112" y2="58" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="68" x2="92" y2="68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

          {/* Paragraph 2 Lines */}
          <line x1="16" y1="84" x2="114" y2="84" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="94" x2="100" y2="94" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="104" x2="80" y2="104" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

          {/* Official Verification Seal / Stamp on Letter */}
          <g transform="translate(92, 118)">
            <circle cx="14" cy="14" r="13" fill="url(#f1_sealGrad)" />
            <circle cx="14" cy="14" r="11" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <path d="M 9 14 L 12.5 17.5 L 19 11" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </g>

        {/* Front Folder Flap with Translucent Pocket */}
        <path
          d="M 10 92 L 88 92 L 108 108 L 210 108 C 220 108 225 113 225 123 L 225 195 C 225 205 215 210 205 210 L 20 210 C 10 210 5 205 5 195 L 5 102 C 5 95 8 92 10 92 Z"
          fill="url(#f1_folderFront)"
        />

        {/* Cyan Translucent Frosted Glass Pocket Strip */}
        <polygon
          points="15,108 208,122 198,198 5,188"
          fill="url(#f1_glassGrad)"
        />

        {/* Hanging Bookmark Ribbon */}
        <path
          d="M 172 108 L 192 108 L 192 144 L 182 136 L 172 144 Z"
          fill="url(#f1_ribbonGrad)"
        />
      </g>

      {/* Floating Smaller Folder Bottom-Right */}
      <g transform="translate(195, 175) scale(0.42) rotate(12)">
        <rect x="20" y="40" width="160" height="120" rx="16" fill="url(#f1_folderBack)" />
        <rect x="20" y="60" width="160" height="100" rx="16" fill="url(#f1_folderFront)" />
      </g>

      {/* Decorative Clouds */}
      <path
        d="M 195 42 Q 210 22 230 32 Q 250 22 265 37 Q 280 52 265 67 L 205 67 Q 190 57 195 42 Z"
        fill={isDark ? "#1E293B" : "#FFFFFF"}
        stroke={isDark ? "#334155" : "#BAE6FD"}
        strokeWidth="1.5"
      />
      <path
        d="M 36 195 Q 52 180 72 187 Q 87 180 102 193 Q 112 205 102 217 L 46 217 Q 31 210 36 195 Z"
        fill={isDark ? "#0F172A" : "#E0F2FE"}
        opacity="0.85"
      />
    </svg>
  );
}

/* SLIDE 2: 3D Paper Airplane ("Pesawat") Soaring with Floating Media Packets */
function AirplaneTransferIllustration({ isDark }) {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-2xl animate-float">
      <defs>
        <linearGradient id="p_wingTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="60%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="p_wingBottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="p_wingRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="p_keelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <filter id="p_glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Aerodynamic Speed Trails & Waves */}
      <path
        d="M 20 240 Q 90 220 150 170 T 260 90"
        stroke="#38BDF8"
        strokeWidth="2.5"
        strokeDasharray="6 6"
        fill="none"
        opacity="0.75"
      />
      <path
        d="M 40 260 Q 110 240 170 190 T 280 110"
        stroke="#0284C7"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M 60 280 Q 130 260 190 210 T 300 130"
        stroke="#67E8F9"
        strokeWidth="1"
        strokeDasharray="3 5"
        fill="none"
        opacity="0.4"
      />

      {/* Speed Rings / Sonic Waves */}
      <ellipse cx="140" cy="180" rx="35" ry="14" transform="rotate(-35 140 180)" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 4" fill="none" opacity="0.6" />
      <ellipse cx="185" cy="140" rx="45" ry="18" transform="rotate(-35 185 140)" stroke="#67E8F9" strokeWidth="1" strokeDasharray="4 5" fill="none" opacity="0.4" />

      {/* Floating Media Card 1: Photo Polaroid (Left) */}
      <g transform="translate(26, 90) rotate(-14)">
        <rect x="0" y="0" width="56" height="66" rx="10" fill={isDark ? "#1E293B" : "#FFFFFF"} stroke={isDark ? "#334155" : "#BAE6FD"} strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
        {/* Photo Thumbnail */}
        <rect x="6" y="6" width="44" height="38" rx="6" fill="url(#p_wingTop)" />
        {/* Mountain landscape outline */}
        <path d="M 12 36 L 24 24 L 32 32 L 40 22 L 46 36 Z" fill="#FFFFFF" opacity="0.9" />
        <circle cx="38" cy="16" r="3" fill="#FEF08A" />
        <rect x="8" y="50" width="24" height="4" rx="2" fill={isDark ? "#475569" : "#CBD5E1"} />
      </g>

      {/* Floating Media Card 2: Video Player Capsule (Right) */}
      <g transform="translate(228, 160) rotate(12)">
        <rect x="0" y="0" width="62" height="44" rx="12" fill={isDark ? "#1E293B" : "#FFFFFF"} stroke={isDark ? "#334155" : "#BAE6FD"} strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
        <circle cx="22" cy="22" r="12" fill="#0284C7" />
        {/* Play triangle */}
        <path d="M 19 17 L 27 22 L 19 27 Z" fill="#FFFFFF" />
        <rect x="38" y="16" width="18" height="4" rx="2" fill="#38BDF8" />
        <rect x="38" y="24" width="12" height="3" rx="1.5" fill={isDark ? "#64748B" : "#CBD5E1"} />
      </g>

      {/* Floating Media Card 3: Document Pill (Top Center) */}
      <g transform="translate(182, 28) rotate(-6)">
        <rect x="0" y="0" width="46" height="54" rx="8" fill={isDark ? "#0F172A" : "#FFFFFF"} stroke="#38BDF8" strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
        <path d="M 32 0 L 46 14 L 32 14 Z" fill="#38BDF8" />
        <line x1="8" y1="18" x2="28" y2="18" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="26" x2="38" y2="26" stroke={isDark ? "#475569" : "#CBD5E1"} strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="34" x2="32" y2="34" stroke={isDark ? "#475569" : "#CBD5E1"} strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="42" x2="24" y2="42" stroke={isDark ? "#475569" : "#CBD5E1"} strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* MAIN 3D FACETED PAPER AIRPLANE ("PESAWAT") */}
      <g transform="translate(85, 62) rotate(15)">
        {/* Glow Halo behind airplane */}
        <ellipse cx="70" cy="85" rx="55" ry="30" transform="rotate(-30 70 85)" fill="#38BDF8" opacity="0.2" filter="url(#p_glow)" />

        {/* 1. Airplane Underside Shadow Keel */}
        <polygon
          points="80,10 50,115 72,98"
          fill="url(#p_keelGrad)"
          opacity="0.95"
        />

        {/* 2. Left Wing (Main Illuminated Wing Facet) */}
        <polygon
          points="80,10 5,100 70,95"
          fill="url(#p_wingTop)"
          filter="drop-shadow(0 8px 14px rgba(2,132,199,0.35))"
        />

        {/* 3. Center Fold Ridge / Spine */}
        <polygon
          points="80,10 70,95 72,118"
          fill="#BAE6FD"
          opacity="0.9"
        />

        {/* 4. Right Wing (Ocean Blue Shade Facet) */}
        <polygon
          points="80,10 72,118 145,95"
          fill="url(#p_wingRight)"
        />

        {/* 5. Right Wing Underside Flap */}
        <polygon
          points="80,10 72,98 125,92"
          fill="url(#p_wingBottom)"
          opacity="0.8"
        />

        {/* Crisp Center Glint Line */}
        <line x1="80" y1="10" x2="71" y2="105" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
      </g>

      {/* Sparkles / Particles */}
      <circle cx="215" cy="82" r="2.5" fill="#38BDF8" />
      <circle cx="95" cy="205" r="2" fill="#67E8F9" />
      <circle cx="265" cy="135" r="3" fill="#38BDF8" />
      <circle cx="160" cy="245" r="2" fill="#BAE6FD" />

      {/* Altitude Clouds at Base */}
      <path
        d="M 175 240 Q 195 220 220 228 Q 240 216 260 230 Q 280 245 265 260 L 180 260 Q 165 250 175 240 Z"
        fill={isDark ? "#1E293B" : "#FFFFFF"}
        stroke={isDark ? "#334155" : "#BAE6FD"}
        strokeWidth="1.5"
      />
      <path
        d="M 30 230 Q 50 215 70 222 Q 90 215 105 228 L 50 250 Q 25 245 30 230 Z"
        fill={isDark ? "#0F172A" : "#E0F2FE"}
        opacity="0.8"
      />
    </svg>
  );
}

/* SLIDE 3: 3D Browser File Manager & Pairing Scanner ("Browser File") */
function BrowserFileIllustration({ isDark }) {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-2xl animate-float">
      <defs>
        <linearGradient id="b_windowBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? "#0F172A" : "#FFFFFF"} />
          <stop offset="100%" stopColor={isDark ? "#0A192F" : "#F8FAFC"} />
        </linearGradient>
        <linearGradient id="b_headerBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? "#1E293B" : "#F1F5F9"} />
          <stop offset="100%" stopColor={isDark ? "#0F172A" : "#E2E8F0"} />
        </linearGradient>
        <filter id="b_shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity={isDark ? "0.5" : "0.12"} />
        </filter>
      </defs>

      {/* Radiating QR Radar Waves */}
      <circle cx="250" cy="75" r="28" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 4" fill="none" opacity="0.4" />
      <circle cx="250" cy="75" r="44" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 6" fill="none" opacity="0.25" />

      {/* MAIN 3D FLOATING BROWSER FILE MANAGER WINDOW */}
      <g transform="translate(30, 42) rotate(-3)" filter="url(#b_shadow)">
        {/* Browser Outer Frame */}
        <rect
          x="0"
          y="0"
          width="258"
          height="192"
          rx="18"
          fill="url(#b_windowBg)"
          stroke={isDark ? "#334155" : "#E2E8F0"}
          strokeWidth="1.5"
        />

        {/* Browser Header Bar */}
        <path
          d="M 0 18 C 0 8 8 0 18 0 L 240 0 C 250 0 258 8 258 18 L 258 36 L 0 36 Z"
          fill="url(#b_headerBg)"
          stroke={isDark ? "#334155" : "#E2E8F0"}
          strokeWidth="1.5"
        />

        {/* 3 Browser Traffic Light Dots */}
        <circle cx="16" cy="18" r="4.5" fill="#EF4444" />
        <circle cx="29" cy="18" r="4.5" fill="#F59E0B" />
        <circle cx="42" cy="18" r="4.5" fill="#10B981" />

        {/* URL / Path Bar in Browser */}
        <rect x="62" y="10" width="138" height="16" rx="8" fill={isDark ? "#0F172A" : "#FFFFFF"} stroke={isDark ? "#1E293B" : "#CBD5E1"} strokeWidth="1" />
        <circle cx="72" cy="18" r="2.5" fill="#38BDF8" />
        <rect x="80" y="15" width="88" height="6" rx="3" fill={isDark ? "#475569" : "#94A3B8"} opacity="0.7" />

        {/* Mini Action Icons in Browser Header */}
        <rect x="214" y="14" width="8" height="8" rx="2" fill="#38BDF8" opacity="0.6" />
        <rect x="228" y="14" width="16" height="8" rx="4" fill="#0284C7" opacity="0.8" />

        {/* Browser Content: File Manager Grid */}
        {/* Left Sidebar Pane */}
        <rect x="10" y="46" width="48" height="134" rx="10" fill={isDark ? "#0A192F" : "#F1F5F9"} />
        <rect x="18" y="56" width="32" height="6" rx="3" fill="#38BDF8" />
        <rect x="18" y="70" width="26" height="5" rx="2.5" fill={isDark ? "#334155" : "#CBD5E1"} />
        <rect x="18" y="82" width="28" height="5" rx="2.5" fill={isDark ? "#334155" : "#CBD5E1"} />
        <rect x="18" y="94" width="22" height="5" rx="2.5" fill={isDark ? "#334155" : "#CBD5E1"} />
        <circle cx="34" cy="150" r="10" fill="#38BDF8" opacity="0.2" />

        {/* Main Grid: 4 File Cards */}
        {/* File 1: Image / Photo File */}
        <g transform="translate(68, 48)">
          <rect x="0" y="0" width="84" height="60" rx="10" fill={isDark ? "#1E293B" : "#FFFFFF"} stroke={isDark ? "#334155" : "#E2E8F0"} strokeWidth="1" />
          <rect x="6" y="6" width="72" height="34" rx="6" fill="#0284C7" />
          <path d="M 14 34 L 28 20 L 40 30 L 52 18 L 70 34 Z" fill="#FFFFFF" opacity="0.85" />
          <circle cx="56" cy="14" r="3" fill="#FEF08A" />
          <rect x="8" y="46" width="44" height="5" rx="2.5" fill={isDark ? "#94A3B8" : "#64748B"} />
          <rect x="56" y="46" width="18" height="5" rx="2.5" fill="#38BDF8" />
        </g>

        {/* File 2: Document File */}
        <g transform="translate(160, 48)">
          <rect x="0" y="0" width="86" height="60" rx="10" fill={isDark ? "#1E293B" : "#FFFFFF"} stroke={isDark ? "#334155" : "#E2E8F0"} strokeWidth="1" />
          <path d="M 12 10 L 32 10 L 42 20 L 42 48 L 12 48 Z" fill="#38BDF8" opacity="0.15" stroke="#38BDF8" strokeWidth="1" />
          <path d="M 32 10 L 42 20 L 32 20 Z" fill="#38BDF8" />
          <line x1="16" y1="24" x2="30" y2="24" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="30" x2="36" y2="30" stroke={isDark ? "#64748B" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="36" x2="32" y2="36" stroke={isDark ? "#64748B" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round" />
          <rect x="48" y="16" width="30" height="5" rx="2.5" fill={isDark ? "#94A3B8" : "#64748B"} />
          <rect x="48" y="26" width="24" height="4" rx="2" fill="#10B981" opacity="0.8" />
          <rect x="48" y="36" width="20" height="4" rx="2" fill={isDark ? "#475569" : "#CBD5E1"} />
        </g>

        {/* File 3: Video / Media File */}
        <g transform="translate(68, 116)">
          <rect x="0" y="0" width="84" height="58" rx="10" fill={isDark ? "#1E293B" : "#FFFFFF"} stroke={isDark ? "#334155" : "#E2E8F0"} strokeWidth="1" />
          <circle cx="24" cy="24" r="12" fill="#0284C7" />
          <path d="M 21 19 L 29 24 L 21 29 Z" fill="#FFFFFF" />
          <rect x="42" y="16" width="34" height="5" rx="2.5" fill={isDark ? "#94A3B8" : "#64748B"} />
          <rect x="42" y="26" width="24" height="4" rx="2" fill="#38BDF8" />
          <rect x="10" y="44" width="64" height="4" rx="2" fill={isDark ? "#334155" : "#E2E8F0"} />
          <rect x="10" y="44" width="44" height="4" rx="2" fill="#38BDF8" />
        </g>

        {/* File 4: APK / ZIP Archive Package */}
        <g transform="translate(160, 116)">
          <rect x="0" y="0" width="86" height="58" rx="10" fill={isDark ? "#1E293B" : "#FFFFFF"} stroke={isDark ? "#334155" : "#E2E8F0"} strokeWidth="1" />
          <rect x="10" y="12" width="26" height="24" rx="6" fill="#10B981" opacity="0.2" stroke="#10B981" strokeWidth="1" />
          <path d="M 18 24 L 22 28 L 29 18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="42" y="16" width="36" height="5" rx="2.5" fill={isDark ? "#94A3B8" : "#64748B"} />
          <rect x="42" y="26" width="22" height="4" rx="2" fill="#10B981" />
          <rect x="10" y="44" width="66" height="5" rx="2.5" fill={isDark ? "#334155" : "#F1F5F9"} />
        </g>
      </g>

      {/* FLOATING 6-DIGIT PAIRING PILL (FOREGROUND) */}
      <g transform="translate(42, 218)">
        <rect
          x="0"
          y="0"
          width="196"
          height="48"
          rx="24"
          fill={isDark ? "#0B132B" : "#FFFFFF"}
          stroke="#38BDF8"
          strokeWidth="2"
          filter="drop-shadow(0 8px 16px rgba(56,189,248,0.25))"
        />
        <circle cx="24" cy="24" r="11" fill="#38BDF8" />
        <path d="M 20 24 L 23 27 L 29 21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Digits: 8  4  9  2  0  1 */}
        {['8', '4', '9', '2', '0', '1'].map((digit, i) => (
          <g key={i} transform={`translate(${50 + i * 23}, 12)`}>
            <rect x="0" y="0" width="19" height="24" rx="5" fill={isDark ? "#1E293B" : "#F0F9FF"} stroke={isDark ? "#334155" : "#BAE6FD"} strokeWidth="1" />
            <text x="9.5" y="16" textAnchor="middle" fill="#0284C7" fontSize="12" fontWeight="bold" fontFamily="monospace">{digit}</text>
          </g>
        ))}
      </g>

      {/* FLOATING QR CODE MINI-BADGE (TOP RIGHT) */}
      <g transform="translate(232, 44) rotate(8)">
        <rect x="0" y="0" width="54" height="54" rx="12" fill={isDark ? "#1E293B" : "#FFFFFF"} stroke="#38BDF8" strokeWidth="2" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.15))" />
        {/* QR Target Brackets */}
        <path d="M 6 12 L 6 6 L 12 6" stroke="#0284C7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 42 6 L 48 6 L 48 12" stroke="#0284C7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 6 42 L 6 48 L 12 48" stroke="#0284C7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 42 48 L 48 48 L 48 42" stroke="#0284C7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* QR Matrix Pattern */}
        <rect x="12" y="12" width="10" height="10" rx="2" fill={isDark ? "#F8FAFC" : "#0F172A"} />
        <rect x="14" y="14" width="6" height="6" fill="#38BDF8" />
        <rect x="32" y="12" width="10" height="10" rx="2" fill={isDark ? "#F8FAFC" : "#0F172A"} />
        <rect x="34" y="14" width="6" height="6" fill="#38BDF8" />
        <rect x="12" y="32" width="10" height="10" rx="2" fill={isDark ? "#F8FAFC" : "#0F172A"} />
        <rect x="14" y="34" width="6" height="6" fill="#38BDF8" />
        {/* Center Data Bits */}
        <rect x="25" y="14" width="4" height="4" fill="#0284C7" />
        <rect x="25" y="25" width="5" height="5" fill="#38BDF8" />
        <rect x="34" y="27" width="5" height="5" fill="#0284C7" />
        <rect x="25" y="35" width="4" height="4" fill="#0284C7" />
        <rect x="34" y="35" width="6" height="4" fill="#38BDF8" />
      </g>
    </svg>
  );
}

export default function OnboardingScreen({ onGetStarted, onLoginClick }) {
  const { isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTakingOff, setIsTakingOff] = useState(false);

  const slides = [
    {
      title: "File transfer,\nbookmark anything\nmade simple.",
      subtitle: "Transfer files, save links, and organize everything easily in one simple mobile app.",
      badge: "Productivity",
      badgeIcon: Layers
    },
    {
      title: "Send Photos,\nVideos, Documents\ninstantly.",
      subtitle: "Share multi-gigabyte media, APK packages and ZIP archives at lightning-fast local speed.",
      badge: "Fast Relay",
      badgeIcon: SendHorizontal
    },
    {
      title: "Connect with\nQR Code & 6-digit\npairing code.",
      subtitle: "No cables, no complex setups. Just scan, accept and watch your files transfer in real time.",
      badge: "Smart Pairing",
      badgeIcon: QrCode
    }
  ];

  const slide = slides[currentSlide];

  const triggerTakeoff = (callback) => {
    if (isTakingOff) return;
    setIsTakingOff(true);
    setTimeout(() => {
      callback();
    }, 1180);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      triggerTakeoff(onGetStarted);
    }
  };

  return (
    <div className={`flex-1 flex flex-col justify-between p-6 relative overflow-hidden select-none transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Full Takeoff Animation Overlay with Silky Smooth SVG Trajectory & Auto-Banking */}
      {isTakingOff && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between overflow-hidden">
          {/* Soft semi-transparent backdrop */}
          <div className="absolute inset-0 bg-sky-950/20 backdrop-blur-[2px] transition-opacity duration-300"></div>

          {/* Full-Screen Trajectory Path SVG with Native Motion along Bezier Curve */}
          <svg viewBox="0 0 360 760" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="takeoffTrailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
                <stop offset="25%" stopColor="#38BDF8" stopOpacity="0.3" />
                <stop offset="70%" stopColor="#0284C7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#67E8F9" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="planeTopWing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67E8F9" />
                <stop offset="60%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="planeBottomWing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0369A1" />
              </linearGradient>
              <filter id="trailGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Path 1: Wide Outer Vapour Glow Trail */}
            <path
              d="M 270 710 C 220 630, 95 500, 88 360 C 82 220, 195 130, 380 -80"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.25"
              filter="url(#trailGlowFilter)"
              pathLength="1000"
              strokeDasharray="1000"
              strokeDashoffset="1000"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="1000"
                to="0"
                dur="1.2s"
                keyTimes="0; 0.25; 0.7; 1"
                keySplines="0.4 0 0.2 1; 0.25 0.1 0.25 1; 0.2 0 0.1 1"
                calcMode="spline"
                fill="freeze"
              />
            </path>

            {/* Path 2: Core Bright Gradient Trail */}
            <path
              d="M 270 710 C 220 630, 95 500, 88 360 C 82 220, 195 130, 380 -80"
              fill="none"
              stroke="url(#takeoffTrailGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8 6"
              pathLength="1000"
              strokeDashoffset="1000"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="1000"
                to="0"
                dur="1.2s"
                keyTimes="0; 0.25; 0.7; 1"
                keySplines="0.4 0 0.2 1; 0.25 0.1 0.25 1; 0.2 0 0.1 1"
                calcMode="spline"
                fill="freeze"
              />
            </path>

            {/* Expanding Speed Ripple Rings along flight path */}
            <g transform="translate(190, 560)">
              <circle cx="0" cy="0" r="16" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0">
                <animate attributeName="r" values="8; 26; 38" dur="1.2s" keyTimes="0; 0.35; 1" repeatCount="1" fill="freeze" />
                <animate attributeName="opacity" values="0; 0.7; 0" dur="1.2s" keyTimes="0; 0.25; 0.8" repeatCount="1" fill="freeze" />
              </circle>
            </g>
            <g transform="translate(90, 360)">
              <circle cx="0" cy="0" r="22" stroke="#67E8F9" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0">
                <animate attributeName="r" values="12; 34; 50" dur="1.2s" keyTimes="0; 0.55; 1" repeatCount="1" fill="freeze" />
                <animate attributeName="opacity" values="0; 0.8; 0" dur="1.2s" keyTimes="0; 0.45; 0.9" repeatCount="1" fill="freeze" />
              </circle>
            </g>
            <g transform="translate(200, 160)">
              <circle cx="0" cy="0" r="28" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0">
                <animate attributeName="r" values="16; 42; 60" dur="1.2s" keyTimes="0; 0.75; 1" repeatCount="1" fill="freeze" />
                <animate attributeName="opacity" values="0; 0.85; 0" dur="1.2s" keyTimes="0; 0.65; 1" repeatCount="1" fill="freeze" />
              </circle>
            </g>

            {/* 3D Paper Airplane Gliding with Mathematical Vector Tangent (rotate="auto") */}
            <g>
              <animateMotion
                path="M 270 710 C 220 630, 95 500, 88 360 C 82 220, 195 130, 380 -80"
                dur="1.2s"
                rotate="auto"
                fill="freeze"
                calcMode="spline"
                keyTimes="0; 0.25; 0.7; 1"
                keySplines="0.4 0 0.2 1; 0.25 0.1 0.25 1; 0.2 0 0.1 1"
              />
              <animateTransform
                attributeName="transform"
                type="scale"
                values="0.65; 0.92; 1.35; 2.1"
                keyTimes="0; 0.25; 0.7; 1"
                keySplines="0.4 0 0.2 1; 0.25 0.1 0.25 1; 0.2 0 0.1 1"
                calcMode="spline"
                dur="1.2s"
                fill="freeze"
                additive="sum"
              />

              {/* Origami Paper Airplane geometry (oriented nose-right along +X axis) */}
              <g filter="drop-shadow(0 10px 16px rgba(2,132,199,0.45))">
                {/* Keel Shadow Underside */}
                <polygon points="34,0 -16,-6 -10,0" fill="#0F172A" opacity="0.95" />
                {/* Port Wing (Top Illuminated Wing) */}
                <polygon points="34,0 -26,-22 -10,0" fill="url(#planeTopWing)" />
                {/* Center Ridge Spine */}
                <polygon points="34,0 -10,0 -12,2" fill="#BAE6FD" opacity="0.95" />
                {/* Starboard Wing (Ocean Blue Shade Wing) */}
                <polygon points="34,0 -10,0 -26,22" fill="url(#planeBottomWing)" />
                {/* Center Crease Glint Line */}
                <line x1="34" y1="0" x2="-10" y2="0" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.9" />

                {/* Trailing Tail Sparks */}
                <circle cx="-16" cy="0" r="3" fill="#67E8F9" opacity="0.9" />
                <line x1="-16" y1="-3" x2="-28" y2="-7" stroke="#38BDF8" strokeWidth="1.5" opacity="0.75" />
                <line x1="-16" y1="3" x2="-28" y2="7" stroke="#38BDF8" strokeWidth="1.5" opacity="0.75" />
              </g>
            </g>
          </svg>

          {/* Center Flight Status Pill */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-slate-900/90 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-black shadow-2xl flex items-center gap-2 border border-sky-400/40 backdrop-blur-md animate-bounce">
            <SendHorizontal size={15} className="animate-pulse" />
            <span>Terbang ke Halaman Login...</span>
          </div>
        </div>
      )}

      {/* Top illustration area with floating 3D graphics & ambient clouds */}
      <div className="relative w-full h-[52%] flex items-center justify-center pt-4">
        {/* Soft Background Ambient Clouds */}
        <div className={`absolute top-6 left-8 w-24 h-12 rounded-full blur-[1px] ${isDark ? 'bg-sky-900/20' : 'bg-sky-100/60'}`}></div>
        <div className={`absolute top-12 right-10 w-28 h-14 rounded-full blur-[1px] ${isDark ? 'bg-sky-900/20' : 'bg-sky-100/70'}`}></div>
        <div className={`absolute bottom-10 left-12 w-32 h-16 rounded-full blur-[1px] ${isDark ? 'bg-sky-900/30' : 'bg-sky-200/50'}`}></div>

        {/* Dynamic 3D Artwork switching per slide */}
        <div key={currentSlide} className="relative w-72 h-72 flex items-center justify-center animate-fadeIn">
          {currentSlide === 0 && <FolderLetterIllustration isDark={isDark} />}
          {currentSlide === 1 && <AirplaneTransferIllustration isDark={isDark} />}
          {currentSlide === 2 && <BrowserFileIllustration isDark={isDark} />}

          {/* Slide Badge Pill (matching bottom left indicator from reference design) */}
          <div className={`absolute bottom-2 left-6 px-3 py-1.5 rounded-2xl shadow-lg border flex items-center gap-1.5 transition-all duration-300 ${
            isDark ? 'bg-slate-900 border-slate-800 text-sky-400' : 'bg-white border-slate-100 text-sky-600'
          }`}>
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-emerald-400 to-sky-400 animate-pulse shrink-0"></div>
            <span className="text-[10px] font-bold tracking-wide uppercase">{slide.badge}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`pt-2 pb-2 transition-opacity duration-300 ${isTakingOff ? 'opacity-40' : ''}`}>
        {/* Slide Indicators (Tappable) */}
        <div className="flex gap-1.5 mb-4">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => !isTakingOff && setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-6 bg-sky-500' : isDark ? 'w-1.5 bg-slate-800' : 'w-1.5 bg-slate-200'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Title */}
        <h2 className={`text-2xl sm:text-[26px] font-black tracking-tight leading-[1.15] whitespace-pre-line mb-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {slide.title}
        </h2>

        {/* Subtitle */}
        <p className={`text-xs leading-relaxed max-w-xs ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {slide.subtitle}
        </p>
      </div>

      {/* Bottom CTA Buttons matching reference design */}
      <div className={`pt-4 border-t flex items-center justify-between gap-4 ${
        isDark ? 'border-slate-800/80' : 'border-slate-100'
      }`}>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Already have an account?{' '}
          <button
            onClick={() => triggerTakeoff(onLoginClick)}
            className="text-sky-500 font-bold hover:underline"
          >
            Log in
          </button>
        </p>

        <button
          onClick={handleNext}
          disabled={isTakingOff}
          className={`px-7 py-3.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-full font-bold text-xs shadow-lg shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
            isTakingOff ? 'opacity-90 scale-95' : ''
          }`}
        >
          {isTakingOff ? (
            <>
              <SendHorizontal size={14} className="animate-pulse" />
              <span>Takeoff...</span>
            </>
          ) : (
            <>
              <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}</span>
              <ChevronRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
