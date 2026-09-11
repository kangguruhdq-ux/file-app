import React, { useState, useEffect } from 'react';
import { SendHorizontal, Download, Radio, History, QrCode, Wifi, ShieldCheck, Link2, SmartphoneNfc, CheckCircle2, XCircle, ArrowRight, Zap, RefreshCw, FileText, Check, Copy, Sparkles, Smartphone, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import FilePickerModal from '../components/FilePickerModal';
import QRModal from '../components/QRModal';
import QRScannerModal from '../components/QRScannerModal';
import TransferMethodSelector, { TRANSFER_METHODS } from '../components/TransferMethodSelector';
import FlightTransferAnimation from '../components/FlightTransferAnimation';
import DevicePermissionModal, { getStoredPermission, saveStoredPermission } from '../components/DevicePermissionModal';

export default function TransferScreen() {
  const { user, token } = useAuth();
  const { t, lang } = useLanguage();
  const { isDark } = useTheme();
  const { notifySuccess, notifyInfo, notifyWarning, notifyError } = useNotification();

  const {
    currentSession,
    sessionRole,
    transferState,
    incomingTransfer,
    progressData,
    receivedFiles,
    createSession,
    joinSession,
    respondTransfer,
    runActiveTransfer,
    resetTransfer,
    nearbyDevices
  } = useSocket();

  const [activeSubTab, setActiveSubTab] = useState('send'); // 'send' | 'receive' | 'nearby' | 'history'
  const [selectedMethod, setSelectedMethod] = useState('qr'); // 'qr' | 'wifi_direct' | 'webrtc_p2p' | 'cloud_magic_link' | 'nfc_shake'
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [pairingInput, setPairingInput] = useState('');

  // Device Permission Modal state
  const [permissionModalType, setPermissionModalType] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const executeWithPermission = (permType, actionFn) => {
    if (getStoredPermission(permType)) {
      actionFn();
    } else {
      setPermissionModalType(permType);
      setPendingAction(() => actionFn);
    }
  };

  const handlePermissionGranted = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // NFC / Shake simulation state
  const [isShaking, setIsShaking] = useState(false);
  const [shakeBeamed, setShakeBeamed] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [historyFilter]);

  // Trigger rich notification when transfer completes
  useEffect(() => {
    if (transferState === 'completed') {
      if (sessionRole === 'receiver') {
        notifySuccess(
          lang === 'id' ? 'File Berhasil Diterima' : 'Files Received Successfully',
          `${receivedFiles.length || 1} ${lang === 'id' ? 'berkas telah diterima & otomatis tersimpan di Boardsave.' : 'files received & auto-saved to Boardsave.'}`
        );
      } else {
        notifySuccess(
          lang === 'id' ? 'File Berhasil Dikirim' : 'Files Sent Successfully',
          lang === 'id' ? 'Seluruh berkas berhasil dikirim ke penerima.' : 'All files transferred to receiver.'
        );
      }
    }
  }, [transferState]);

  // Automatically close any open modals when transfer begins
  useEffect(() => {
    if (transferState === 'transferring' || transferState === 'completed') {
      setIsQRModalOpen(false);
      setIsScannerOpen(false);
    }
  }, [transferState]);

  const fetchHistory = async () => {
    try {
      const url = historyFilter === 'all'
        ? '/api/transfers/history'
        : `/api/transfers/history?filter=${historyFilter}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data.history || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHistoryItem = async (sessionId, e) => {
    e?.stopPropagation();
    if (!confirm(lang === 'id' ? 'Hapus riwayat transfer ini?' : 'Delete this transfer record?')) return;
    try {
      const res = await fetch(`/api/transfers/history/${sessionId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notifyWarning(
          lang === 'id' ? 'Riwayat Dihapus' : 'Record Deleted',
          lang === 'id' ? 'Catatan transfer berhasil dihapus' : 'Transfer record removed'
        );
        fetchHistory();
      }
    } catch (e) {
      notifyError('Error', 'Gagal menghapus riwayat');
    }
  };

  const handleClearAllHistory = async () => {
    if (!confirm(lang === 'id' ? 'Hapus seluruh riwayat transfer?' : 'Clear all transfer history?')) return;
    try {
      const res = await fetch('/api/transfers/history', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notifyWarning(
          lang === 'id' ? 'Riwayat Dibersihkan' : 'History Cleared',
          lang === 'id' ? 'Semua riwayat transfer berhasil dihapus' : 'All transfer history cleared'
        );
        fetchHistory();
      }
    } catch (e) {
      notifyError('Error', 'Gagal membersihkan riwayat');
    }
  };

  const handleSaveTransferredToCloud = async (file, e) => {
    e?.stopPropagation();
    try {
      const res = await fetch('/api/cloud/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          original_name: file.name || file.file_name,
          size: file.size || file.file_size,
          category: file.category || 'other'
        })
      });
      if (res.ok) {
        notifySuccess(
          lang === 'id' ? 'File Tersimpan di Boardsave!' : 'Saved to Boardsave!',
          `${file.name || file.file_name} ${lang === 'id' ? 'telah masuk ke cloud storage.' : 'added to cloud storage.'}`
        );
        window.dispatchEvent(new CustomEvent('app:files-updated'));
      } else {
        notifyError('Gagal Menyimpan', 'Periksa kuota cloud storage');
      }
    } catch (e) {
      notifyError('Error', 'Gagal menyimpan ke cloud');
    }
  };

  const handleDownloadFile = (file, e) => {
    e?.stopPropagation();
    const fileName = file.name || file.file_name || 'downloaded-file';
    const blob = new Blob([`Simulated content of ${fileName}`], { type: file.type || file.file_type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifySuccess(
      lang === 'id' ? 'File Diunduh' : 'File Downloaded',
      `${fileName} ${lang === 'id' ? 'berhasil diunduh' : 'download complete'}`
    );
  };

  const handleStartSending = (files, totalSize) => {
    createSession(files, totalSize, user?.device_name);
    notifyInfo(
      lang === 'id' ? 'Sesi Transfer Dibuat' : 'Transfer Session Created',
      `${files.length} file siap dikirim via ${TRANSFER_METHODS.find(m => m.id === selectedMethod)?.title}`
    );

    if (selectedMethod === 'qr') {
      setIsQRModalOpen(true);
    }
  };

  const handleTriggerTransfer = (overrideFiles, overrideSize) => {
    let files = overrideFiles;
    let totalSize = overrideSize;

    if (!files || files.length === 0) {
      if (currentSession && currentSession.files && currentSession.files.length > 0) {
        files = currentSession.files;
        totalSize = currentSession.totalSize;
      } else {
        files = [
          { name: 'Bermain bersama chika.3gp', size: 43 * 1024 * 1024, type: 'video/3gpp' },
          { name: 'Another iteration of mind.png', size: 1.3 * 1024 * 1024, type: 'image/png' }
        ];
        totalSize = 44.3 * 1024 * 1024;
      }
    }

    const sid = currentSession?.sessionId || 'sess-' + Date.now();
    notifyInfo(
      lang === 'id' ? 'Transfer Dimulai' : 'Transfer Started',
      lang === 'id' ? 'Mentransfer berkas dengan kecepatan tinggi...' : 'Transferring files at high speed...'
    );
    runActiveTransfer(files, sid, totalSize);
  };

  const handleSimulateShake = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setShakeBeamed(true);
      notifySuccess(
        lang === 'id' ? 'NFC / Shake Terhubung!' : 'NFC / Shake Connected!',
        lang === 'id' ? 'Perangkat penerima terdeteksi dan terhubung.' : 'Receiver device detected and connected.'
      );
      setTimeout(() => {
        handleTriggerTransfer();
      }, 500);
    }, 1200);
  };

  const handleConnectPairingCode = (code) => {
    const inputVal = (code || pairingInput || '').trim();
    if (!inputVal) {
      notifyWarning('Kode Kosong', 'Silakan masukkan PIN transfer.');
      return;
    }
    notifyInfo('Menghubungkan...', `Menghubungkan ke sesi #${inputVal}...`);
    // Immediately join session
    joinSession(inputVal);
    // Directly navigate & trigger transfer
    setTimeout(() => {
      if (transferState === 'idle' || transferState === 'waiting' || transferState === 'prompt_accept') {
        const sampleIncoming = {
          sessionId: 'sess-inc-' + inputVal,
          senderDevice: "Sarah's iPhone 15 Pro",
          pairingCode: inputVal,
          totalSize: 44.3 * 1024 * 1024,
          files: [
            { name: 'Bermain bersama chika.3gp', size: 43 * 1024 * 1024, type: 'video/3gpp' },
            { name: 'Another iteration of mind.png', size: 1.3 * 1024 * 1024, type: 'image/png' }
          ]
        };
        runActiveTransfer(sampleIncoming.files, sampleIncoming.sessionId, sampleIncoming.totalSize);
      }
    }, 450);
  };

  return (
    <div className={`flex-1 flex flex-col p-5 overflow-y-auto select-none relative ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 pb-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">{t('trans_hub')}</h2>
          <p className="text-[11px] text-slate-400 font-medium">{t('trans_sub')}</p>
        </div>

        {transferState !== 'idle' && (
          <button
            onClick={() => {
              resetTransfer();
              notifyWarning('Sesi Dibatalkan', 'Sesi transfer telah di-reset');
            }}
            className="text-xs text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-full"
          >
            Reset
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-4 shrink-0 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'send', label: t('trans_tab_send'), icon: SendHorizontal },
          { id: 'receive', label: t('trans_tab_receive'), icon: Download },
          { id: 'nearby', label: t('trans_tab_nearby'), icon: Radio },
          { id: 'history', label: t('trans_tab_history'), icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* LIVE TRANSFER VIEW */}
      {transferState === 'transferring' || transferState === 'completed' ? (
        <div className={`rounded-3xl p-5 shadow-2xl border space-y-4 my-auto animate-fadeIn ${
          isDark
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-gradient-to-b from-sky-50 via-white to-sky-50/50 text-slate-900 border-sky-200/80 shadow-[0_15px_35px_-5px_rgba(56,189,248,0.2)]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${transferState === 'completed' ? 'bg-emerald-500' : 'bg-sky-500 animate-ping'}`}></div>
              <div>
                <div className="flex items-center gap-1.5">
                  {transferState === 'completed' ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        TRANSFER BERKAS SELESAI
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="text-sky-500 animate-pulse" />
                      <span className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                        PROSES TRANSFER AKTIF
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Metode: {TRANSFER_METHODS.find(m => m.id === selectedMethod)?.title || 'Wi-Fi Direct 5GHz'}
                </span>
              </div>
            </div>
            <span className="text-base font-mono font-black text-sky-600 dark:text-sky-300">
              {progressData.progress}%
            </span>
          </div>

          {/* FLYING AIRPLANE ANIMATION TOWARDS DESTINATION FILE */}
          <FlightTransferAnimation
            progress={progressData.progress}
            speed={`${progressData.speedMBps || '34.8'} MB/s`}
            senderDevice={currentSession?.senderDevice || (sessionRole === 'receiver' ? "Sarah's iPhone" : user?.name || "Perangkat Pengirim")}
            receiverDevice={currentSession?.receiverDevice || "Perangkat Penerima"}
            fileName={
              currentSession?.files?.[progressData.currentFileIndex || 0]?.name ||
              receivedFiles?.[0]?.name ||
              'Bermain bersama chika.3gp'
            }
            isCompleted={transferState === 'completed'}
          />

          {/* Animated Speedometer Progress Bar */}
          <div className={`w-full h-4 rounded-full overflow-hidden p-0.5 border relative ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 rounded-full transition-all duration-150 relative overflow-hidden shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              style={{ width: `${progressData.progress}%` }}
            >
              <div className="absolute inset-0 bg-white/25 animate-pulse"></div>
            </div>
          </div>

          {/* Transfer Metrics Grid */}
          <div className={`grid grid-cols-3 gap-2 pt-2 text-xs border-t ${
            isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'
          }`}>
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">{t('trans_speed')}</span>
              <span className="font-mono font-black text-sky-600 dark:text-sky-400 text-sm flex items-center gap-1 mt-0.5">
                <Zap size={12} className="text-amber-500" />
                <span>{progressData.speedMBps || '34.8'} MB/s</span>
              </span>
            </div>
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">{t('trans_eta')}</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm block mt-0.5">
                {progressData.etaSeconds > 0 ? `${progressData.etaSeconds}s sisa` : '0s Selesai'}
              </span>
            </div>
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Data Terkirim</span>
              <span className="font-mono font-bold text-[11px] block mt-0.5 truncate">
                {formatBytes(progressData.transferredBytes || Math.round((progressData.progress / 100) * (currentSession?.totalSize || 45 * 1024 * 1024)))}
              </span>
            </div>
          </div>

          {/* Files List with dynamic status indicators */}
          <div className={`rounded-2xl p-3 border space-y-2 max-h-52 overflow-y-auto ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-sky-50/50 border-sky-100'
          }`}>
            {((currentSession?.files && currentSession.files.length > 0)
              ? currentSession.files
              : (receivedFiles && receivedFiles.length > 0)
              ? receivedFiles
              : [
                  { name: 'Bermain bersama chika.3gp', size: 43 * 1024 * 1024, type: 'video/3gpp' },
                  { name: 'Another iteration of mind.png', size: 1.3 * 1024 * 1024, type: 'image/png' }
                ]
            ).map((f, i) => {
              const isDone = progressData.progress >= 100 || progressData.currentFileIndex > i;
              const isCurrent = progressData.currentFileIndex === i && progressData.progress < 100;
              return (
                <div key={i} className={`flex items-center justify-between text-xs p-2 rounded-xl border transition-colors ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800/60 hover:bg-slate-850 text-slate-200'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-800 shadow-xs'
                }`}>
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <FileText size={15} className="text-sky-500 shrink-0" />
                    <div className="truncate text-left">
                      <span className="truncate block font-semibold">{f.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatBytes(f.size)}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isDone
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                            : isCurrent
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800/60 animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {isDone ? 'Selesai' : isCurrent ? 'Mentransfer...' : 'Menunggu'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={(e) => handleDownloadFile(f, e)}
                      title="Unduh / Buka File"
                      className={`p-1.5 rounded-lg transition-colors active:scale-95 ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-sky-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={(e) => handleSaveTransferredToCloud(f, e)}
                      title="Simpan ke Boardsave Cloud"
                      className="px-2 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-600 dark:text-sky-300 border border-sky-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors active:scale-95"
                    >
                      <span>+ Boardsave</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {transferState === 'completed' && (
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  resetTransfer();
                  fetchHistory();
                }}
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>{t('trans_done')} / Kembali</span>
              </button>
              <button
                onClick={() => {
                  resetTransfer();
                  setActiveSubTab('history');
                  fetchHistory();
                }}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition-all active:scale-95"
              >
                Riwayat
              </button>
            </div>
          )}
        </div>
      ) : transferState === 'prompt_accept' ? (
        /* Receiver Acceptance Prompt */
        <div className="bg-white dark:bg-slate-900 border-2 border-sky-400 rounded-3xl p-5 shadow-2xl space-y-4 my-auto animate-fadeIn">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Download size={24} />
            </div>
            <h3 className="text-lg font-bold">{t('trans_incoming_title')}</h3>
            <p className="text-xs text-slate-500">
              Pengirim: <strong className="text-slate-800 dark:text-slate-200">{incomingTransfer?.senderDevice || 'Perangkat Sekitar'}</strong>
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 max-h-40 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700">
            {(incomingTransfer?.files || []).map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-1">
                <span className="font-semibold truncate">{f.name}</span>
                <span className="text-[11px] text-slate-400 font-mono ml-2 shrink-0">
                  {formatBytes(f.size)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                respondTransfer(false);
                notifyWarning('Transfer Ditolak', 'Anda menolak berkas transfer.');
              }}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all"
            >
              {t('trans_decline_btn')}
            </button>
            <button
              onClick={() => {
                respondTransfer(true);
                handleTriggerTransfer();
                notifySuccess('Transfer Diterima', 'Sedang mengunduh berkas...');
              }}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-2xl text-xs font-extrabold transition-all shadow-lg active:scale-95"
            >
              {t('trans_accept_btn')}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* TAB 1: SEND (Dengan 5 Metode Transfer) */}
          {activeSubTab === 'send' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-sky-100 via-sky-200 to-sky-100 dark:from-slate-900 dark:via-sky-950/50 dark:to-slate-900 border border-sky-300/60 dark:border-slate-800 rounded-3xl relative overflow-hidden">
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                  {t('trans_choose_files')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-[240px] leading-relaxed">
                  {t('trans_send_desc')}
                </p>

                <button
                  onClick={() => setIsFilePickerOpen(true)}
                  className="mt-3.5 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-full text-xs font-extrabold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <SendHorizontal size={14} />
                  <span>Pilih Berkas Sekarang</span>
                </button>
              </div>

              {/* 5 Transfer Methods Selector Component */}
              <TransferMethodSelector
                selectedMethod={selectedMethod}
                onSelectMethod={(m) => {
                  setSelectedMethod(m);
                  notifyInfo('Metode Transfer Dipilih', TRANSFER_METHODS.find(x => x.id === m)?.title);
                }}
              />

              {/* Method 1: QR Code Method Info */}
              {selectedMethod === 'qr' && (
                <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-2xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-sky-900 dark:text-sky-300">
                    <span className="flex items-center gap-1.5">
                      <QrCode size={15} />
                      <span>QR Code & 6-Digit Pairing Siap</span>
                    </span>
                    <span className="text-[10px] font-mono bg-sky-200/60 dark:bg-sky-900/60 px-2 py-0.5 rounded-full">INSTANT</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Penerima cukup scan QR atau ketik 6 digit PIN untuk memulai transfer langsung.
                  </p>
                  <button
                    onClick={() => {
                      if (!currentSession) {
                        createSession([
                          { name: 'Bermain bersama chika.3gp', size: 43 * 1024 * 1024, type: 'video/3gpp' },
                          { name: 'Another iteration of mind.png', size: 1.3 * 1024 * 1024, type: 'image/png' }
                        ], 44.3 * 1024 * 1024, user?.device_name);
                      }
                      setIsQRModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <QrCode size={14} />
                    <span>Tampilkan QR Code & PIN</span>
                  </button>
                </div>
              )}

              {/* Method 2: Wi-Fi Direct 5GHz */}
              {selectedMethod === 'wifi_direct' && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Wifi size={15} />
                      <span>Wi-Fi Direct Hotspot Siap</span>
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">5GHz HIGH-BAND</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    SSID Otomatis: <strong className="font-mono">DIRECT-FT-{user?.name || 'Florian'}</strong> (Kecepatan hingga 40 MB/s)
                  </p>
                  <button
                    onClick={() => executeWithPermission('wifi', () => handleTriggerTransfer())}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Zap size={14} />
                    <span>Hubungkan 5GHz & Mulai Transfer Berkas</span>
                  </button>
                </div>
              )}

              {/* Method 3: WebRTC P2P Direct Tunnel */}
              {selectedMethod === 'webrtc_p2p' && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-2xl space-y-2.5 text-xs text-purple-800 dark:text-purple-300">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={15} />
                      <span>Jalur WebRTC Terenkripsi End-to-End</span>
                    </span>
                    <span className="text-[10px] font-mono bg-purple-200/60 dark:bg-purple-900/60 px-2 py-0.5 rounded-full">E2EE DTLS-SRTP</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Data dikirim langsung antar perangkat tanpa tersimpan di server relay cloud.
                  </p>
                  <button
                    onClick={() => executeWithPermission('location_nearby', () => handleTriggerTransfer())}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <ShieldCheck size={14} />
                    <span>Buka Terowongan P2P & Mulai Transfer</span>
                  </button>
                </div>
              )}

              {/* Method 4: Cloud Magic Link & Relay */}
              {selectedMethod === 'cloud_magic_link' && (
                <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-2xl space-y-2.5 text-xs text-sky-800 dark:text-sky-300">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Link2 size={15} />
                      <span>Cloud Magic Link & Auto Relay</span>
                    </span>
                    <span className="text-[10px] font-mono bg-sky-200/60 dark:bg-sky-900/60 px-2 py-0.5 rounded-full">GLOBAL</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Kirim berkas ke mana saja tanpa perlu satu jaringan Wi-Fi lokal.
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-sky-200 dark:border-slate-700">
                    <span className="font-mono text-[11px] truncate flex-1 text-slate-700 dark:text-slate-300">
                      https://share.filetransfer.app/m/{currentSession?.pairingCode || 'magic-7721'}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://share.filetransfer.app/m/${currentSession?.pairingCode || 'magic-7721'}`);
                        notifySuccess('Link Disalin', 'Tautan magic telah disalin ke clipboard');
                      }}
                      className="p-1 bg-sky-100 dark:bg-sky-950 text-sky-600 rounded-lg hover:bg-sky-200"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  <button
                    onClick={() => executeWithPermission('storage', () => handleTriggerTransfer())}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Link2 size={14} />
                    <span>Transfer Berkas via Cloud Magic Relay</span>
                  </button>
                </div>
              )}

              {/* Method 5: NFC Tap & Shake */}
              {selectedMethod === 'nfc_shake' && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-center space-y-2.5">
                  <div className={`w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md ${isShaking ? 'animate-bounce' : ''}`}>
                    <SmartphoneNfc size={24} />
                  </div>
                  <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    Dekatkan atau Goyangkan Ponsel untuk Transfer
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tekan tombol di bawah untuk menyimulasikan sensor getar & beam NFC.
                  </p>
                  <button
                    onClick={() => executeWithPermission('motion_sensors', () => handleSimulateShake())}
                    disabled={isShaking}
                    className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <SmartphoneNfc size={14} />
                    <span>{isShaking ? 'Mengirim Sinyal Beam...' : 'Simulasikan Goyang / Tap HP & Mulai Transfer'}</span>
                  </button>
                </div>
              )}

              {/* Active Session Status */}
              {currentSession && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-sky-500 uppercase tracking-wider block">
                        {t('trans_active_session')}
                      </span>
                      <h4 className="text-sm font-black font-mono mt-0.5">
                        Kode: {currentSession.pairingCode}
                      </h4>
                    </div>

                    <button
                      onClick={() => setIsQRModalOpen(true)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <QrCode size={13} />
                      <span>Buka QR</span>
                    </button>
                  </div>

                  <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-2xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {currentSession.receiverDevice ? `${currentSession.receiverDevice} terhubung!` : 'Sesi siap ditransfer'}
                    </span>
                    <button
                      onClick={() => handleTriggerTransfer()}
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <SendHorizontal size={14} />
                      <span>Mulai Transfer Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECEIVE */}
          {activeSubTab === 'receive' && (
            <div className="space-y-4">
              {/* Scan Card */}
              <div className={`p-5 rounded-3xl text-left border space-y-3 ${
                isDark
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-gradient-to-r from-sky-50 to-blue-50 text-slate-900 border-sky-200/80 shadow-sm'
              }`}>
                <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Terima Berkas dari Pengirim
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Pindai QR code pengirim, masukkan 6-digit pairing PIN, atau terima otomatis.
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => executeWithPermission('camera', () => setIsScannerOpen(true))}
                    className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                  >
                    <QrCode size={16} />
                    <span>{t('trans_scan_code')}</span>
                  </button>
                </div>
              </div>

              {/* 6-Digit PIN Pairing Input Card */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase tracking-wider block">
                    Metode 6-Digit PIN
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    Masukkan PIN dari Layar Pengirim
                  </h4>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleConnectPairingCode(pairingInput); }} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pairingInput}
                    onChange={(e) => setPairingInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Contoh: 482910"
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-mono font-black text-sm tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                  <button
                    type="submit"
                    disabled={pairingInput.length < 4}
                    className="px-4 py-2.5 bg-slate-900 dark:bg-sky-500 disabled:opacity-40 text-white dark:text-slate-950 rounded-xl text-xs font-bold active:scale-95 shadow-sm transition-all"
                  >
                    Hubungkan
                  </button>
                </form>
              </div>

              {/* Fast Simulated Receive Button */}
              <div className="p-4 bg-gradient-to-r from-sky-50 via-sky-100 to-indigo-50 dark:from-slate-900 dark:via-sky-950/40 dark:to-slate-900 rounded-3xl border border-sky-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-extrabold text-sky-800 dark:text-sky-300">
                  Simulasi Penerimaan Otomatis
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Ingin menguji tampilan penerima tanpa perangkat kedua? Klik tombol di bawah:
                </p>
                <button
                  onClick={() => handleConnectPairingCode('482910')}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download size={15} />
                  <span>Terima Berkas Masuk (Mulai Transfer Langsung)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NEARBY RADAR */}
          {activeSubTab === 'nearby' && (
            <div className="space-y-4 text-center">
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-4">
                <div className="absolute inset-0 rounded-full border border-sky-300/40 animate-radar-1"></div>
                <div className="absolute inset-4 rounded-full border border-sky-400/30 animate-radar-2"></div>
                <div className="absolute inset-8 rounded-full border border-sky-500/20 animate-radar-3"></div>

                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl z-10 ${
                  isDark ? 'bg-slate-900 text-sky-400 shadow-sky-500/10' : 'bg-sky-500 text-white shadow-sky-300/40'
                }`}>
                  <Radio size={28} className="animate-pulse" />
                </div>
              </div>

              <div className="text-left space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Perangkat Sekitar Terdeteksi ({nearbyDevices.length})
                </h4>
                {nearbyDevices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        <Smartphone size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{dev.name}</p>
                        <p className="text-[10px] text-slate-400">{dev.platform} • Sinyal {dev.signal}%</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsFilePickerOpen(true)}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-xl text-xs font-bold active:scale-95"
                    >
                      Kirim
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeSubTab === 'history' && (
            <div className="space-y-3">
              {/* Filter Tabs and Clear All Button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none flex-1">
                  {['all', 'sent', 'received', 'failed'].map((flt) => (
                    <button
                      key={flt}
                      onClick={() => setHistoryFilter(flt)}
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                        historyFilter === flt
                          ? 'bg-sky-500 text-white shadow-sm'
                          : isDark
                          ? 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {flt}
                    </button>
                  ))}
                </div>

                {historyList.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0"
                    title="Hapus Semua Riwayat Transfer"
                  >
                    <Trash2 size={12} />
                    <span>Hapus Semua</span>
                  </button>
                )}
              </div>

              {/* History Cards List */}
              <div className="space-y-2.5">
                {historyList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Belum ada riwayat transfer pada filter ini.
                  </div>
                ) : (
                  historyList.map((item) => {
                    const isExpanded = expandedHistoryId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">
                              {item.files?.[0]?.file_name || 'Transfer #' + item.pairing_code}
                              {(item.files?.length || 0) > 1 && ` (+${item.files.length - 1} lainnya)`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              item.status === 'completed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                            }`}>
                              {item.status}
                            </span>
                            <button
                              onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                              title="Hapus riwayat ini"
                              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors active:scale-95"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{item.sender_device} → {item.receiver_device || 'Receiver'}</span>
                          <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                            {formatBytes(item.total_size)}
                          </span>
                        </div>

                        {/* Files Accordion Toggle */}
                        {item.files && item.files.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                              className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold flex items-center justify-between w-full py-0.5"
                            >
                              <span className="flex items-center gap-1">
                                <span>{isExpanded ? 'Sembunyikan Berkas' : `Lihat ${item.files.length} Berkas`}</span>
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </span>
                              <span className="text-[10px] text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            </button>

                            {isExpanded && (
                              <div className="mt-2 space-y-1.5">
                                {item.files.map((file, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <FileText size={13} className="text-sky-500 shrink-0" />
                                      <div className="truncate text-left">
                                        <span className="truncate block text-slate-700 dark:text-slate-200 font-medium">
                                          {file.file_name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          {formatBytes(file.file_size)}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                      <button
                                        onClick={(e) => handleDownloadFile(file, e)}
                                        title="Unduh"
                                        className="p-1 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"
                                      >
                                        <Download size={13} />
                                      </button>
                                      <button
                                        onClick={(e) => handleSaveTransferredToCloud(file, e)}
                                        title="Simpan ke Boardsave Cloud"
                                        className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 rounded-md text-[10px] font-bold transition-colors hover:bg-sky-200"
                                      >
                                        + Boardsave
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <FilePickerModal
        isOpen={isFilePickerOpen}
        onClose={() => setIsFilePickerOpen(false)}
        onFilesSelected={handleStartSending}
      />

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        pairingCode={currentSession?.pairingCode}
        qrToken={currentSession?.qrToken}
        totalFiles={currentSession?.files?.length || 0}
        totalSize={currentSession?.totalSize || 0}
        senderDevice={user?.device_name}
        onStartTransfer={() => {
          setIsQRModalOpen(false);
          handleTriggerTransfer();
        }}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <DevicePermissionModal
        isOpen={!!permissionModalType}
        onClose={() => setPermissionModalType(null)}
        permissionType={permissionModalType}
        onGranted={handlePermissionGranted}
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
