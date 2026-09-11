import React from 'react';
import { Home, FolderClosed, SendHorizontal, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const navItems = [
    { id: 'home', label: t('nav_home'), icon: Home },
    { id: 'files', label: t('nav_boardsave'), icon: FolderClosed },
    { id: 'transfer', label: t('nav_transfer'), icon: SendHorizontal },
    { id: 'account', label: t('nav_account'), icon: User }
  ];

  return (
    <nav className={`w-full border-t px-6 py-2 flex items-center justify-between z-30 shrink-0 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.04)] transition-colors ${
      isDark
        ? 'bg-slate-900/95 border-slate-800 backdrop-blur-md'
        : 'bg-white/95 border-slate-100 backdrop-blur-md'
    }`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center justify-center gap-1 group py-1 px-2 relative transition-all active:scale-90"
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-sky-500 scale-110'
                  : isDark
                  ? 'text-slate-500 group-hover:text-slate-300'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            >
              <Icon size={21} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>
            <span
              className={`text-[11px] font-medium tracking-tight transition-colors duration-200 ${
                isActive
                  ? 'text-sky-500 font-bold'
                  : isDark
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
