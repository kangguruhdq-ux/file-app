import React, { useState } from 'react';
import { ArrowLeft, SendHorizontal, Mail, Lock, User, Smartphone, ArrowRight, UserCheck, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export default function LoginScreen({ onBackToOnboarding }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);

  const { login, register, loginAsGuest, loginAsDemoUser, loginAsAdmin } = useAuth();
  const { isDark } = useTheme();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const u = await register(name, email, password, deviceName);
        notifySuccess('Registrasi Berhasil!', `Selamat datang di File Transfer App, ${name}!`);
      } else {
        const u = await login(email, password);
        notifySuccess('Login Berhasil!', `Selamat datang kembali, ${u?.name || 'User'}!`);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      notifyError('Gagal Masuk', err.message || 'Cek kembali email dan password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      const u = await loginAsDemoUser();
      notifySuccess('Selamat Datang, Florian!', 'Masuk sebagai Demo User dengan file lengkap & Boardsave.');
    } catch (err) {
      notifyError('Gagal Masuk Demo', err.message);
    }
  };

  const handleAdminLogin = async () => {
    try {
      const u = await loginAsAdmin();
      notifySuccess('Admin Console Aktif', 'Selamat datang Admin. Kontrol penuh sistem diakses.');
    } catch (err) {
      notifyError('Gagal Masuk Admin', err.message);
    }
  };

  const handleGuestLogin = async () => {
    try {
      const u = await loginAsGuest();
      notifyInfo('Mode Tamu Dimulai', 'Transfer file instan siap digunakan tanpa registrasi.');
    } catch (err) {
      notifyError('Gagal Masuk Tamu', err.message);
    }
  };

  return (
    <div className={`flex-1 flex flex-col justify-between p-6 overflow-y-auto select-none animate-fadeIn ${
      isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      <div>
        {/* Back / Top Indicator */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToOnboarding}
            className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <span className="text-[11px] font-mono font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
            <SendHorizontal size={11} className="text-sky-500 -rotate-12" />
            <span>Mobile Auth</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black tracking-tight">
          {isRegister ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          {isRegister
            ? 'Sign up to sync transfer history and unlock 10GB cloud storage'
            : 'Log in to continue your fast file transfers and manage cloud files'}
        </p>

        {/* Tab switch */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-5 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegister
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              isRegister
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Florian Miller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-sky-500 transition-colors border ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-semibold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Device Name
                </label>
                <div className="relative">
                  <Smartphone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Florian's Phone"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-sky-500 transition-colors border ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                    }`}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={`block text-[11px] font-semibold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-sky-500 transition-colors border ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`block text-[11px] font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Password
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-[11px] font-medium text-sky-500 hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-sky-500 transition-colors border ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{isRegister ? 'Complete Sign Up' : 'Sign In'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Quick One-Tap Login
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        </div>

        {/* Demo Accounts */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors shadow-xs active:scale-98 border ${
              isDark
                ? 'bg-sky-950/30 hover:bg-sky-950/50 border-sky-900/60 text-sky-300'
                : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-sky-500" />
              <div className="text-left">
                <span className="block font-bold">Florian (Demo User)</span>
                <span className="text-[10px] opacity-80">Pre-seeded with recent files</span>
              </div>
            </div>
            <Sparkles size={14} className="text-sky-500" />
          </button>

          <button
            type="button"
            onClick={handleAdminLogin}
            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors shadow-xs active:scale-98 border ${
              isDark
                ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-900/60 text-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <div className="text-left">
                <span className="block font-bold">Admin Console</span>
                <span className="text-[10px] opacity-80">admin@app.com • Full control</span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
              ROOT
            </span>
          </button>
        </div>
      </div>

      {/* Guest Mode */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-center">
        <button
          onClick={handleGuestLogin}
          className="text-xs text-slate-400 hover:text-sky-500 font-medium transition-colors"
        >
          Skip for now and <span className="font-bold underline">Continue as Guest</span>
        </button>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className={`rounded-3xl p-6 max-w-xs w-full text-center space-y-3 border shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h4 className="font-bold text-base">Password Reset</h4>
            <p className="text-xs text-slate-400">
              For demo testing, you can use the default credentials:
              <br />
              <strong className="text-sky-500">user@app.com / user123</strong>
              <br />
              <strong className="text-sky-500">admin@app.com / admin123</strong>
            </p>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
