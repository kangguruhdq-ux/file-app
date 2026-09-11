import React, { useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SplashScreen({ onFinish }) {
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none transition-colors duration-200 ${
      isDark
        ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white'
        : 'bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900'
    }`}>
      {/* Background ambient glow */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-sky-500/10' : 'bg-sky-200/50'
      }`}></div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-cyan-300 p-0.5 shadow-xl shadow-sky-500/25 animate-bounce">
          <div className={`w-full h-full rounded-[22px] flex items-center justify-center ${
            isDark ? 'bg-slate-900 text-sky-400' : 'bg-white text-sky-500'
          }`}>
            <SendHorizontal size={38} className="transform -rotate-12 translate-x-0.5 -translate-y-0.5" />
          </div>
        </div>

        <div>
          <h1 className={`text-2xl font-black tracking-tight flex items-center justify-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            File Transfer <span className="text-sky-500">App</span>
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Fast, Free & Easy Cross-Device Sharing
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="pt-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
          <span className={`text-xs font-medium tracking-wide ${isDark ? 'text-sky-400/90' : 'text-sky-600'}`}>Starting engine...</span>
        </div>
      </div>

      <div className={`absolute bottom-6 text-[10px] font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        v1.0.0 • Mobile & Desktop Relay
      </div>
    </div>
  );
}
