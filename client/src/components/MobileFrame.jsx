import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { NotificationToasts } from '../context/NotificationContext';

export default function MobileFrame({ children }) {
  const { isDark } = useTheme();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-200'} flex items-center justify-center p-0 sm:p-4 md:p-6 select-none transition-colors duration-200`}>
      {/* 100% Pure Mobile Handset Container (iPhone 15 Pro / Android Style Frame) */}
      <div className="relative w-full max-w-[412px] h-[870px] max-h-[96vh] bg-slate-950 rounded-[50px] p-3 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85),0_0_0_10px_#1e293b] border-4 border-slate-800 flex flex-col">
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
          <div className="w-2 h-2 rounded-full bg-blue-900/60"></div>
        </div>

        {/* Screen Area */}
        <div className={`w-full h-full rounded-[40px] overflow-hidden flex flex-col relative transition-colors duration-200 ${
          isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
        }`}>
          {/* Mobile Status Bar */}
          <div className={`w-full h-11 px-7 flex items-center justify-between text-xs font-semibold select-none z-40 shrink-0 ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}>
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 18.25C2.89 16.51 2 14.36 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10c0 2.36-.89 4.51-2.35 6.25l-.62-.64C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9zm0 4c-2.76 0-5 2.24-5 5 0 1.34.53 2.56 1.39 3.46l.72-.72C8.42 14.1 8 13.1 8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.1-.42 2.1-1.11 2.74l.72.72c.86-.9 1.39-2.12 1.39-3.46 0-2.76-2.24-5-5-5zm0 4c-.55 0-1 .45-1 1 0 .28.11.53.29.71l.71.71.71-.71c.18-.18.29-.43.29-.71 0-.55-.45-1-1-1z"/>
              </svg>
              <span className="text-[10px] font-mono">5G</span>
              <div className="w-5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
                <div className="h-full w-3/4 bg-current rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Floating Dynamic Island Notification Toasts */}
          <NotificationToasts />

          {/* Inner Mobile Viewport */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="w-full h-3.5 flex items-center justify-center shrink-0 py-1">
            <div className={`w-32 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
