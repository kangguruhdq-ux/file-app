import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = ({ type = 'info', title, message, duration = 3200 }) => {
    const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newNotif = { id, type, title, message };

    setNotifications(prev => [newNotif, ...prev.slice(0, 2)]);

    // Vibration feedback if supported
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(type === 'error' ? [50, 50, 50] : [40]);
      }
    } catch (e) {}

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const notifySuccess = (title, message) => addNotification({ type: 'success', title, message });
  const notifyError = (title, message) => addNotification({ type: 'error', title, message });
  const notifyInfo = (title, message) => addNotification({ type: 'info', title, message });
  const notifyWarning = (title, message) => addNotification({ type: 'warning', title, message });

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        removeNotification,
        addNotification,
        notifySuccess,
        notifyError,
        notifyInfo,
        notifyWarning
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function NotificationToasts() {
  const context = useContext(NotificationContext);
  if (!context) return null;
  const { notifications, removeNotification } = context;

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="absolute top-12 left-3 right-3 z-50 pointer-events-none flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto w-full bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 animate-slideDown"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50">
              {n.type === 'success' && <CheckCircle2 size={17} className="text-emerald-500 dark:text-emerald-400" />}
              {n.type === 'error' && <AlertCircle size={17} className="text-rose-500 dark:text-rose-400" />}
              {n.type === 'warning' && <AlertTriangle size={17} className="text-amber-500 dark:text-amber-400" />}
              {n.type === 'info' && <Info size={17} className="text-sky-500 dark:text-sky-400" />}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold leading-tight truncate">{n.title}</p>
              {n.message && (
                <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-tight mt-0.5 truncate">{n.message}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => removeNotification(n.id)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      removeNotification: () => {},
      addNotification: () => {},
      notifySuccess: () => {},
      notifyError: () => {},
      notifyInfo: () => {},
      notifyWarning: () => {}
    };
  }
  return context;
}
