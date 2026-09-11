import React, { useState, useEffect } from 'react';
import { Send, Download, Plus, Video, Image, FileText, Smartphone, ChevronRight, Radio, Headphones, Sparkles, HardDriveUpload, Music, Archive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import FilePickerModal from '../components/FilePickerModal';
import QRModal from '../components/QRModal';
import QRScannerModal from '../components/QRScannerModal';
import FilePreviewModal from '../components/FilePreviewModal';

export default function HomeScreen({ onNavigateTab, onOpenCS }) {
  const { user, token } = useAuth();
  const { createSession, currentSession, resetTransfer, runActiveTransfer, transferState } = useSocket();
  const { t, lang } = useLanguage();
  const { isDark } = useTheme();
  const { notifySuccess, notifyError } = useNotification();

  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // Auto-close modals when transfer process begins
  useEffect(() => {
    if (transferState === 'transferring' || transferState === 'completed') {
      setIsQRModalOpen(false);
      setIsScannerOpen(false);
    }
  }, [transferState]);

  useEffect(() => {
    fetchRecentFiles();

    const handleFilesUpdate = () => {
      fetchRecentFiles();
    };

    window.addEventListener('app:files-updated', handleFilesUpdate);
    window.addEventListener('focus', handleFilesUpdate);

    return () => {
      window.removeEventListener('app:files-updated', handleFilesUpdate);
      window.removeEventListener('focus', handleFilesUpdate);
    };
  }, [token]);

  const fetchRecentFiles = async () => {
    try {
      setIsLoadingRecent(true);
      const res = await fetch('/api/cloud/files?sort=date', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        const files = data.files || [];

        const mapped = files.map((f) => {
          const cat = f.category || 'other';
          let iconGradient = 'from-blue-600 via-sky-500 to-cyan-400';
          let iconType = 'image';

          if (cat === 'video') {
            iconGradient = 'from-purple-900 via-indigo-700 to-rose-500';
            iconType = 'video';
          } else if (cat === 'image') {
            iconGradient = 'from-blue-600 via-sky-500 to-cyan-400';
            iconType = 'image';
          } else if (cat === 'music') {
            iconGradient = 'from-emerald-600 via-teal-500 to-cyan-400';
            iconType = 'music';
          } else if (cat === 'document') {
            iconGradient = 'from-amber-500 via-orange-400 to-yellow-300';
            iconType = 'document';
          } else if (cat === 'app') {
            iconGradient = 'from-sky-500 via-indigo-600 to-blue-700';
            iconType = 'app';
          } else if (cat === 'archive') {
            iconGradient = 'from-violet-600 via-purple-600 to-indigo-600';
            iconType = 'archive';
          }

          return {
            id: f.id,
            original_name: f.original_name,
            name: f.original_name,
            size: f.size,
            category: f.category,
            sourceTag: f.sourceTag || (f.stored_name?.startsWith('cloud-') ? 'Storage HP' : 'Boardsave'),
            iconGradient,
            iconType,
            share_token: f.share_token,
            visibility: f.visibility,
            created_at: f.created_at,
            path: f.path
          };
        });

        setRecentItems(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch recent files:', err);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const handleDirectUploadFromStorage = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    let successCount = 0;
    for (const file of fileList) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/cloud/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.error(err);
      }
    }

    e.target.value = '';
    if (successCount > 0) {
      notifySuccess(
        lang === 'id' ? 'File Berhasil Diupload' : 'Uploaded Successfully',
        `${successCount} ${lang === 'id' ? 'file baru tersimpan dan muncul di Recent items.' : 'file(s) saved and added to Recent items.'}`
      );
      fetchRecentFiles();
      window.dispatchEvent(new CustomEvent('app:files-updated'));
    } else {
      notifyError('Gagal Upload', 'Periksa koneksi atau kapasitas storage');
    }
  };

  const handleFilesSelected = (files, totalSize) => {
    createSession(files, totalSize, user?.device_name);
    setIsQRModalOpen(true);
  };

  const userName = user?.name || 'Florian';

  return (
    <div className={`flex-1 flex flex-col p-5 overflow-y-auto select-none relative transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Top Greeting matching screenshot: "Hi, Florian" */}
      <div className="flex items-center justify-between pt-1 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t('home_hi')}, {userName}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            {user?.device_name || "Florian's Phone"} • {user?.plan?.name || 'Free'} Plan
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Customer Service Quick Icon */}
          <button
            onClick={onOpenCS}
            className={`p-2 rounded-full border transition-all active:scale-95 ${
              isDark ? 'bg-slate-900 border-slate-800 text-sky-400' : 'bg-sky-50 border-sky-100 text-sky-600'
            }`}
            title="Customer Service Live Chat"
          >
            <Headphones size={15} />
          </button>

          {/* Nearby Radar Button */}
          <button
            onClick={() => onNavigateTab('transfer')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all active:scale-95 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800'
                : 'bg-sky-50 border-sky-100 text-sky-600 hover:bg-sky-100'
            }`}
          >
            <Radio size={13} className="animate-pulse text-sky-500" />
            <span>{t('home_nearby_btn')}</span>
          </button>
        </div>
      </div>

      {/* Main Cards Grid matching reference screenshot */}
      <div className="space-y-3.5 mb-6">
        {/* 1. SEND CARD */}
        <div
          onClick={() => setIsFilePickerOpen(true)}
          className={`relative w-full h-32 rounded-3xl p-4 cursor-pointer group hover:scale-[1.01] active:scale-[0.98] transition-all overflow-hidden border ${
            isDark
              ? 'bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border-sky-900/60 shadow-[0_8px_25px_-4px_rgba(2,132,199,0.2)]'
              : 'bg-gradient-to-r from-sky-100 via-sky-200 to-sky-100 border-sky-300/80 shadow-[0_8px_25px_-4px_rgba(56,189,248,0.25)]'
          }`}
        >
          {/* Badge Counter Circle */}
          <div className={`absolute top-3.5 left-3.5 w-6 h-6 rounded-full border font-extrabold text-xs flex items-center justify-center shadow-sm ${
            isDark ? 'bg-sky-950/80 border-sky-800 text-sky-400' : 'bg-sky-400/60 border-white/70 text-slate-900'
          }`}>
            2
          </div>

          {/* Title */}
          <h3 className={`text-lg font-black absolute top-10 left-4 tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {t('home_send_title')}
          </h3>

          {/* Stylized Paper Airplane Illustration */}
          <div className="absolute right-4 top-1.5 w-32 h-24 pointer-events-none group-hover:-translate-y-1 transition-transform">
            <svg viewBox="0 0 140 100" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="homePlaneGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#BAE6FD" />
                </linearGradient>
                <linearGradient id="homePlaneGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7DD3FC" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
              </defs>
              <polygon points="15,20 120,40 40,85" fill="url(#homePlaneGrad1)" />
              <polygon points="120,40 40,85 55,60" fill="url(#homePlaneGrad2)" opacity="0.85" />
              <polygon points="120,40 55,60 15,20" fill="#0369A1" opacity="0.25" />
              <line x1="5" y1="35" x2="35" y2="35" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            </svg>
          </div>

          {/* Status Pill Badge */}
          <div className={`absolute bottom-3 left-4 max-w-[85%] backdrop-blur-sm border rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-semibold shadow-sm ${
            isDark ? 'bg-slate-900/90 border-sky-900/60 text-sky-300' : 'bg-sky-100/95 border-sky-300/70 text-slate-800'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="truncate">{t('home_send_pill')}</span>
          </div>
        </div>

        {/* 2. RECEIVE CARD */}
        <div
          onClick={() => setIsScannerOpen(true)}
          className={`relative w-full h-32 rounded-3xl p-4 cursor-pointer group hover:scale-[1.01] active:scale-[0.98] transition-all overflow-hidden border ${
            isDark
              ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]'
              : 'bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 border-blue-200/80 shadow-[0_8px_25px_-4px_rgba(99,102,241,0.15)]'
          }`}
        >
          {/* Badge Counter Circle */}
          <div className={`absolute top-3.5 left-3.5 w-6 h-6 rounded-full border font-extrabold text-xs flex items-center justify-center shadow-sm ${
            isDark ? 'bg-slate-800 border-slate-700 text-sky-400' : 'bg-indigo-100 border-indigo-200 text-indigo-700'
          }`}>
            12
          </div>

          {/* Title */}
          <h3 className={`text-lg font-black absolute top-10 left-4 tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {t('home_receive_title')}
          </h3>

          {/* Stylized Origami/Box Paper Illustration */}
          <div className="absolute right-4 top-2 w-32 h-24 pointer-events-none group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 140 100" className="w-full h-full drop-shadow-lg">
              <defs>
                <linearGradient id="homeInboxGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0369A1" />
                </linearGradient>
                <linearGradient id="homeInboxGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
              </defs>
              <polygon points="40,25 95,25 110,50 55,50" fill="url(#homeInboxGrad1)" opacity="0.9" />
              <polygon points="55,50 110,50 90,80 35,80" fill="url(#homeInboxGrad2)" />
              <polygon points="40,25 55,50 35,80 20,55" fill="#0284C7" opacity="0.4" />
            </svg>
          </div>

          {/* Status Pill Badge */}
          <div className={`absolute bottom-3 left-4 max-w-[85%] backdrop-blur-sm border rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-semibold shadow-sm ${
            isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-200' : 'bg-white/95 border-blue-200 text-slate-700'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate">{t('home_receive_pill')}</span>
          </div>
        </div>
      </div>

      {/* Section Header: "Recent items" */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold tracking-tight">
          {t('home_recent_items')}
        </h3>
        <div className="flex items-center gap-2">
          {/* Quick Direct Upload from Device Storage */}
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900/60 px-2.5 py-1 rounded-full cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-900/80 transition-all active:scale-95 shadow-sm">
            <HardDriveUpload size={12} />
            <span>+ Upload HP</span>
            <input
              type="file"
              multiple
              onChange={handleDirectUploadFromStorage}
              className="hidden"
            />
          </label>
          <button
            onClick={() => onNavigateTab('files')}
            className="text-[11px] font-semibold text-sky-500 hover:text-sky-600"
          >
            {t('home_view_all')}
          </button>
        </div>
      </div>

      {/* Recent items list matching reference screenshot */}
      <div className="space-y-2.5 pb-16">
        {recentItems.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
            Belum ada berkas. Tekan tombol <strong>+ Upload HP</strong> atau <strong>Kirim</strong> di atas untuk menambahkan berkas.
          </div>
        ) : (
          recentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedFileForPreview(item)}
              className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rounded colorful thumbnail icon */}
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${item.iconGradient} text-white flex items-center justify-center shrink-0 shadow-sm`}
                >
                  {item.iconType === 'video' ? (
                    <Video size={18} />
                  ) : item.iconType === 'music' ? (
                    <Music size={18} />
                  ) : item.iconType === 'document' ? (
                    <FileText size={18} />
                  ) : item.iconType === 'archive' ? (
                    <Archive size={18} />
                  ) : item.iconType === 'app' ? (
                    <Smartphone size={18} />
                  ) : (
                    <Image size={18} />
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="truncate">
                  <p className="text-xs font-bold truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{formatBytes(item.size)}</span>
                    <span>•</span>
                    <span className={item.sourceTag === 'Received' ? 'text-sky-500 font-semibold' : 'text-slate-400'}>
                      {item.sourceTag}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-slate-400">
                <ChevronRight size={16} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button '+' */}
      <button
        onClick={() => setIsFilePickerOpen(true)}
        className="absolute bottom-4 right-5 w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all z-20 border border-sky-400"
        title="Quick Send / Upload"
      >
        <Plus size={24} strokeWidth={2.4} />
      </button>

      {/* Modals */}
      <FilePickerModal
        isOpen={isFilePickerOpen}
        onClose={() => setIsFilePickerOpen(false)}
        onFilesSelected={handleFilesSelected}
      />

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => {
          setIsQRModalOpen(false);
          resetTransfer();
        }}
        pairingCode={currentSession?.pairingCode}
        qrToken={currentSession?.qrToken}
        totalFiles={currentSession?.files?.length || 0}
        totalSize={currentSession?.totalSize || 0}
        senderDevice={user?.device_name}
        onStartTransfer={() => {
          onNavigateTab('transfer');
          runActiveTransfer(currentSession?.files, currentSession?.sessionId, currentSession?.totalSize);
        }}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <FilePreviewModal
        isOpen={!!selectedFileForPreview}
        onClose={() => setSelectedFileForPreview(null)}
        file={selectedFileForPreview}
      />
    </div>
  );
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
