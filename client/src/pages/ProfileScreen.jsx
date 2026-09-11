import React, { useState } from 'react';
import { User, Smartphone, Crown, LogOut, Trash2, Shield, Sparkles, Check, Edit2, Moon, Sun, Globe, Headphones, Lock, Camera, AlertTriangle, Receipt, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import AvatarPickerModal from '../components/AvatarPickerModal';
import PlanTransactionsModal from '../components/PlanTransactionsModal';

export default function ProfileScreen({ onNavigatePricing, onOpenAdmin, onOpenCS }) {
  const { user, logout, updateProfile, token } = useAuth();
  const { t, lang, toggleLang } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const { notifySuccess, notifyInfo, notifyError, notifyWarning } = useNotification();

  // Profile Edit
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Florian');
  const [deviceName, setDeviceName] = useState(user?.device_name || "Florian's Phone");
  const [savedToast, setSavedToast] = useState(false);

  // Modals
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Password fields
  const [curPassword, setCurPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile({ name, device_name: deviceName });
    setIsEditing(false);
    setSavedToast(true);
    notifySuccess('Profil Disimpan', 'Nama dan perangkat berhasil diperbarui!');
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleSelectAvatar = async (avatarUrl) => {
    await updateProfile({ avatar: avatarUrl });
    setSavedToast(true);
    notifySuccess('Avatar Diperbarui', 'Foto profil baru Anda berhasil dipasang!');
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(null);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: curPassword, newPassword })
      });

      if (res.ok) {
        setPwSuccess(true);
        notifySuccess('Password Diperbarui', 'Kata sandi berhasil diubah dengan aman.');
        setTimeout(() => {
          setPwSuccess(false);
          setIsPasswordModalOpen(false);
          setCurPassword('');
          setNewPassword('');
        }, 1500);
      } else {
        const err = await res.json();
        setPwError(err.error || 'Password change failed');
        notifyError('Gagal Ganti Password', err.error || 'Kata sandi lama tidak sesuai');
      }
    } catch (e) {
      setPwError('Failed to change password');
      notifyError('Error', 'Gagal memperbarui kata sandi');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        logout();
        notifyWarning('Akun Dihapus', 'Seluruh data akun telah dibersihkan secara permanen');
      } else {
        const err = await res.json();
        notifyError('Gagal Menghapus Akun', err.error || 'Terjadi kesalahan sistem');
      }
    } catch (e) {
      notifyError('Error', 'Gagal memproses penghapusan akun');
    }
  };

  const handleLogout = () => {
    logout();
    notifyInfo('Berhasil Keluar', 'Sesi akun Anda telah diakhiri dengan aman.');
  };

  const handleToggleTheme = () => {
    toggleTheme();
    notifyInfo(isDark ? 'Mode Terang' : 'Mode Gelap', 'Tema visual tampilan telah diperbarui.');
  };

  const handleToggleLang = () => {
    toggleLang();
    notifyInfo('Bahasa / Language', lang === 'id' ? 'Language switched to English' : 'Bahasa diubah ke Bahasa Indonesia');
  };

  const planName = user?.plan?.name || (user?.plan_id === 'pro' ? 'Pro' : user?.plan_id === 'unlimited' ? 'Unlimited' : 'Free');

  return (
    <div className={`flex-1 flex flex-col p-5 overflow-y-auto select-none ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Top Header */}
      <div className="pt-1 pb-4">
        <h2 className="text-xl font-black tracking-tight">{t('acc_title')}</h2>
        <p className="text-[11px] text-slate-400 font-medium">{t('acc_sub')}</p>
      </div>

      {/* Saved notification badge */}
      {savedToast && (
        <div className="mb-3 p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 animate-fadeIn">
          <Check size={14} />
          <span>Pengaturan profil berhasil disimpan!</span>
        </div>
      )}

      {/* User Info Card */}
      <div className={`p-5 rounded-3xl text-center relative border shadow-sm mb-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
        <div className="relative w-20 h-20 mx-auto mb-3">
          <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-sky-400 to-cyan-300 p-0.5 shadow-md">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'florian'}`}
              alt="Avatar"
              className="w-full h-full rounded-[22px] bg-white object-cover"
            />
          </div>

          {/* Change PP Button */}
          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute -bottom-1 -right-1 p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-md border-2 border-white dark:border-slate-900 active:scale-95 transition-all"
            title={t('acc_change_pp')}
          >
            <Camera size={13} />
          </button>
        </div>

        <h3 className="text-lg font-bold">{user?.name || 'Florian'}</h3>
        <p className="text-xs text-slate-400">{user?.email || 'user@app.com'}</p>

        {/* Plan Badge */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100/80 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-full text-xs font-bold text-sky-800 dark:text-sky-300">
          <Crown size={14} className="text-amber-500" />
          <span>{planName} Plan</span>
        </div>
      </div>

      {/* Plan Card Banner with Expiry Date */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-4 text-white mb-3 shadow-lg shadow-sky-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-200 block">
              {t('acc_membership_status')}
            </span>
            <h4 className="text-sm font-bold mt-0.5">
              {planName === 'Unlimited' ? 'Unlimited Cloud & Priority' : planName === 'Pro' ? 'Pro Plan Active' : 'Free Tier'}
            </h4>
          </div>

          <button
            onClick={onNavigatePricing}
            className="px-3.5 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-sm hover:bg-sky-50 transition-colors active:scale-95"
          >
            {planName === 'Free' ? 'Upgrade' : 'Ganti Paket'}
          </button>
        </div>

        {/* Plan Expiry Date & Remaining Days */}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px]">
          <span className="text-sky-100 flex items-center gap-1">
            <Calendar size={13} className="text-sky-200" />
            <span>Kapan Plan Berakhir:</span>
          </span>
          <span className="font-mono font-bold text-white">
            {planName === 'Free'
              ? 'Selamanya (Gratis)'
              : user?.plan_expires_at
              ? `${new Date(user.plan_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} (${user.daysRemaining ?? 30}h lagi)`
              : 'Aktif (30 Hari)'}
          </span>
        </div>
      </div>

      {/* Menu Riwayat Transaksi Plan */}
      <button
        onClick={() => setIsTxModalOpen(true)}
        className={`w-full p-3.5 mb-5 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-all active:scale-98 shadow-xs ${
          isDark
            ? 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-white'
            : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Receipt size={17} />
          </div>
          <div className="text-left">
            <p className="font-bold text-xs">Riwayat Transaksi Plan</p>
            <p className="text-[10px] text-slate-400">Bukti pembayaran & masa aktif langganan</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Buka
          </span>
          <ChevronRight size={15} />
        </div>
      </button>

      {/* Device & Profile Form */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('acc_device_identity')}
          </span>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-sky-500 hover:text-sky-600 font-bold flex items-center gap-1"
            >
              <Edit2 size={13} />
              <span>{t('acc_edit_profile')}</span>
            </button>
          ) : (
            <button
              onClick={handleSaveProfile}
              className="text-xs text-emerald-500 hover:text-emerald-600 font-bold flex items-center gap-1"
            >
              <Check size={14} />
              <span>{t('acc_save')}</span>
            </button>
          )}
        </div>

        <div className={`p-4 rounded-2xl border space-y-3 text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <div>
            <span className="text-slate-400 block mb-1 text-[11px]">{t('acc_display_name')}</span>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-sky-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            ) : (
              <span className="font-bold block">{user?.name}</span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block mb-1 text-[11px]">{t('acc_device_name')}</span>
            {isEditing ? (
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-sky-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            ) : (
              <span className="font-bold block">{user?.device_name || "Florian's Phone"}</span>
            )}
          </div>
        </div>
      </div>

      {/* App Customization: Theme, Language, Password */}
      <div className="space-y-2.5 mb-5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Pengaturan Aplikasi
        </span>

        {/* Theme Switcher */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            {isDark ? <Moon size={16} className="text-sky-400" /> : <Sun size={16} className="text-amber-500" />}
            <span className="font-semibold">{t('acc_theme')}</span>
          </div>
          <button
            onClick={handleToggleTheme}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-colors active:scale-95 ${
              isDark ? 'bg-slate-800 text-sky-400 border border-slate-700' : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
            }`}
          >
            <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

        {/* Language Switcher */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <Globe size={16} className="text-sky-500" />
            <span className="font-semibold">{t('acc_lang')}</span>
          </div>
          <button
            onClick={handleToggleLang}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-colors active:scale-95 ${
              isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
            }`}
          >
            <span>{lang === 'id' ? 'ID - Indonesia' : 'EN - English'}</span>
          </button>
        </div>

        {/* Change Password Button */}
        {user?.role !== 'guest' && (
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition-colors active:scale-98 ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Lock size={16} className="text-sky-500" />
              <span>{t('acc_change_pw')}</span>
            </div>
            <span className="text-slate-400">••••</span>
          </button>
        )}

        {/* Customer Service Live Chat Link */}
        <button
          onClick={onOpenCS}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-indigo-500/15 border border-sky-400/30 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-300 shadow-sm transition-all active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <Headphones size={18} className="text-sky-500" />
            <span>{t('acc_cs')}</span>
          </div>
          <span className="text-[10px] bg-emerald-500 text-white font-mono px-2 py-0.5 rounded-full">
            ONLINE
          </span>
        </button>
      </div>

      {/* Admin Panel Access Button if Admin */}
      {user?.role === 'admin' && (
        <button
          onClick={onOpenAdmin}
          className="w-full py-3 mb-3 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all"
        >
          <Shield size={16} className="text-emerald-400 dark:text-slate-950" />
          <span>{t('acc_admin_console')}</span>
        </button>
      )}

      {/* Sign Out & Delete Account */}
      <div className="space-y-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
        >
          <LogOut size={14} />
          <span>{t('acc_sign_out')}</span>
        </button>

        {user?.role !== 'guest' && user?.role !== 'admin' && (
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full py-1.5 text-red-500 hover:text-red-700 text-[11px] font-medium transition-colors"
          >
            {t('acc_delete_acc')}
          </button>
        )}
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={user?.avatar}
        onSelectAvatar={handleSelectAvatar}
      />

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">{t('acc_change_pw')}</h3>

            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            {pwSuccess && <p className="text-xs text-emerald-500">Password berhasil diubah!</p>}

            <form onSubmit={handleChangePassword} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  required
                  value={curPassword}
                  onChange={(e) => setCurPassword(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Password Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
                >
                  {t('acc_cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl"
                >
                  {t('acc_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hapus Akun Permanen?</h3>
            <p className="text-xs text-slate-500">
              Semua data profil, file cloud di Boardsave, dan riwayat transfer akan dihapus secara permanen.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl text-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Transactions History Modal */}
      <PlanTransactionsModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onNavigatePricing={onNavigatePricing}
      />
    </div>
  );
}
