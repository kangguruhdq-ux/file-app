import React from 'react';
import { Smartphone, FileText, CheckCircle2, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * FlightTransferAnimation
 * Renders an animated paper airplane flying from sender device to destination file graphic.
 * Completely code-based SVG animation with zero emojis.
 */
export default function FlightTransferAnimation({
  progress = 0,
  speed = '34.8 MB/s',
  senderDevice = 'Pengirim',
  receiverDevice = 'Penerima',
  fileName = 'Berkas',
  isCompleted = false
}) {
  const { isDark } = useTheme();
  const flightPath = "M 52 46 Q 160 16, 268 46";

  return (
    <div className={`w-full rounded-2xl p-4 border relative overflow-hidden shadow-inner select-none ${
      isDark ? 'bg-slate-950/90 border-sky-500/30' : 'bg-gradient-to-r from-sky-50/80 via-blue-50/50 to-sky-50/80 border-sky-200 shadow-xs'
    }`}>
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-36 h-20 bg-sky-500/10 blur-2xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-36 h-20 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none"></div>

      {/* SVG Flight Arena */}
      <div className="relative w-full h-28 flex items-center justify-center">
        <svg
          viewBox="0 0 320 92"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient for flight trail */}
            <linearGradient id="flightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="airplaneGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#38bdf8" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* SENDER DEVICE GRAPHIC (Left) */}
          <g transform="translate(18, 16)">
            {/* Glow halo */}
            <circle cx="22" cy="30" r="24" fill="#0284c7" fillOpacity="0.12" />
            <circle cx="22" cy="30" r="18" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" className="animate-spin-slow" />

            {/* Smartphone Graphic */}
            <rect x="10" y="10" width="24" height="40" rx="5" fill={isDark ? "#0f172a" : "#ffffff"} stroke={isDark ? "#38bdf8" : "#0284c7"} strokeWidth="1.6" />
            {/* Screen */}
            <rect x="13" y="14" width="18" height="30" rx="2" fill="#0284c7" fillOpacity={isDark ? "0.25" : "0.15"} />
            {/* Speaker bar */}
            <line x1="19" y1="12" x2="25" y2="12" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
            {/* Home pill */}
            <line x1="19" y1="47" x2="25" y2="47" stroke={isDark ? "#38bdf8" : "#0284c7"} strokeWidth="1" strokeLinecap="round" />
            {/* Signal waves emitting */}
            <path d="M 37 24 C 42 27, 42 33, 37 36" fill="none" stroke={isDark ? "#38bdf8" : "#0284c7"} strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
            <path d="M 41 20 C 48 25, 48 35, 41 40" fill="none" stroke={isDark ? "#38bdf8" : "#0284c7"} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" className="animate-pulse" />
          </g>

          {/* FLIGHT TRAJECTORY PATH */}
          {/* Base shadow path */}
          <path
            d={flightPath}
            fill="none"
            stroke={isDark ? "#1e293b" : "#bae6fd"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Glowing animated dashed flight trajectory */}
          <path
            d={flightPath}
            fill="none"
            stroke="url(#flightGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="5 4"
            className="animate-pulse"
          />

          {/* FLYING PAPER AIRPLANE */}
          {!isCompleted ? (
            <g filter="url(#airplaneGlow)">
              {/* Origami Paper Airplane pointing along positive X */}
              <path
                d="M -14 -9 L 14 0 L -6 0 Z"
                fill="#e0f2fe"
              />
              <path
                d="M -6 0 L 14 0 L -14 9 Z"
                fill="#38bdf8"
              />
              <path
                d="M -14 -9 L -6 0 L -14 9 L -9 0 Z"
                fill="#0284c7"
              />
              {/* Airplane Center Crease Spine */}
              <line x1="-9" y1="0" x2="14" y2="0" stroke="#0369a1" strokeWidth="0.8" />

              {/* Trailing Wind Streaks */}
              <line x1="-16" y1="-5" x2="-22" y2="-5" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
              <line x1="-15" y1="0" x2="-25" y2="0" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
              <line x1="-16" y1="5" x2="-22" y2="5" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.7" />

              {/* Smooth Animate Motion along the curved trajectory */}
              <animateMotion
                path={flightPath}
                dur="2.2s"
                repeatCount="indefinite"
                rotate="auto"
              />
            </g>
          ) : (
            /* Landed State Airplane rested on Destination File */
            <g transform="translate(262, 28) rotate(-15)">
              <path d="M -10 -7 L 10 0 L -4 0 Z" fill="#a7f3d0" />
              <path d="M -4 0 L 10 0 L -10 7 Z" fill="#10b981" />
              <path d="M -10 -7 L -4 0 L -10 7 L -7 0 Z" fill="#047857" />
            </g>
          )}

          {/* DESTINATION FILE GRAPHIC (Right) */}
          <g transform="translate(254, 15)">
            {/* Target reception aura / pulse */}
            <circle cx="22" cy="31" r="26" fill="#10b981" fillOpacity={isCompleted ? "0.2" : "0.08"} />
            {!isCompleted ? (
              <circle cx="22" cy="31" r="22" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" className="animate-spin-reverse-slow" />
            ) : (
              <circle cx="22" cy="31" r="22" fill="none" stroke="#10b981" strokeWidth="1.5" />
            )}

            {/* Destination File Graphic Document */}
            <path
              d="M 10 12 L 26 12 L 34 20 L 34 50 L 10 50 Z"
              fill={isDark ? "#0f172a" : "#ffffff"}
              stroke={isCompleted ? "#10b981" : (isDark ? "#38bdf8" : "#0284c7")}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Folded corner */}
            <path
              d="M 26 12 L 26 20 L 34 20 Z"
              fill={isCompleted ? "#059669" : (isDark ? "#0284c7" : "#38bdf8")}
            />
            {/* File text lines */}
            <line x1="15" y1="26" x2="29" y2="26" stroke={isCompleted ? "#34d399" : (isDark ? "#94a3b8" : "#64748b")} strokeWidth="1.4" strokeLinecap="round" />
            <line x1="15" y1="32" x2="27" y2="32" stroke={isCompleted ? "#34d399" : (isDark ? "#64748b" : "#94a3b8")} strokeWidth="1.4" strokeLinecap="round" />
            <line x1="15" y1="38" x2="23" y2="38" stroke={isCompleted ? "#34d399" : (isDark ? "#475569" : "#cbd5e1")} strokeWidth="1.4" strokeLinecap="round" />

            {/* Badge Status on file */}
            {isCompleted && (
              <circle cx="34" cy="48" r="7" fill="#10b981" stroke={isDark ? "#0f172a" : "#ffffff"} strokeWidth="1.5" />
            )}
          </g>
        </svg>
      </div>

      {/* Flight Transfer Status Bar */}
      <div className={`flex items-center justify-between mt-1 pt-2 border-t text-[11px] ${
        isDark ? 'border-slate-800 text-slate-300' : 'border-sky-200/70 text-slate-700'
      }`}>
        <div className="flex items-center gap-1.5">
          <Smartphone size={12} className={isDark ? "text-sky-400" : "text-sky-600"} />
          <span className="font-semibold truncate max-w-[100px]">{senderDevice}</span>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted ? (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
              isDark ? 'bg-sky-950/80 border border-sky-800/60 text-sky-300' : 'bg-sky-100 border border-sky-200 text-sky-800 font-bold'
            }`}>
              <Zap size={10} className="text-amber-500 animate-pulse" />
              <span className="font-mono text-[10px]">{speed}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/60 px-2 py-0.5 rounded-full text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
              <CheckCircle2 size={10} />
              <span>Tersimpan di Boardsave</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <FileText size={12} className={isCompleted ? "text-emerald-500" : (isDark ? "text-sky-400" : "text-sky-600")} />
          <span className="font-semibold truncate max-w-[100px]">{fileName}</span>
        </div>
      </div>
    </div>
  );
}
