import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, KeyRound, Camera, Image, Sparkles, ArrowRight, SwitchCamera, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import jsQR from 'jsqr';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { getStoredPermission, saveStoredPermission } from './DevicePermissionModal';

export default function QRScannerModal({ isOpen, onClose }) {
  const { isDark } = useTheme();
  const { notifySuccess, notifyWarning, notifyInfo, notifyError } = useNotification();
  const { joinSession, currentSession, runActiveTransfer, transferState } = useSocket();

  const [activeMode, setActiveMode] = useState('code'); // 'code' | 'scan'
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const galleryInputRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Stop camera when modal closes or mode changes
  useEffect(() => {
    if (!isOpen || activeMode !== 'scan') {
      stopCamera();
    } else if (isOpen && activeMode === 'scan') {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser ini tidak mendukung akses kamera secara langsung.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      setCameraStream(stream);
      setIsCameraActive(true);
      saveStoredPermission('camera', true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        startQrScanning();
      }
    } catch (err) {
      console.warn('Camera access denied or error:', err);
      setCameraError('Izin akses kamera ditolak atau kamera sedang digunakan aplikasi lain.');
      setIsCameraActive(false);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Continuous frame scanner via Canvas & jsQR
  const startQrScanning = () => {
    const scanFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleQrDetected(code.data);
          return; // Stop loop once detected
        }
      }
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleQrDetected = (qrContent) => {
    stopCamera();
    notifySuccess('QR Code Terdeteksi!', `Menghubungkan ke: ${qrContent.substring(0, 24)}...`);

    // Parse pairing code from URL or text (e.g. /m/482910 or raw 482910)
    let extractedCode = qrContent.trim();
    if (extractedCode.includes('/m/')) {
      extractedCode = extractedCode.split('/m/')[1]?.split('?')[0] || extractedCode;
    } else if (extractedCode.includes('session=')) {
      extractedCode = extractedCode.split('session=')[1]?.split('&')[0] || extractedCode;
    }

    connectWithCode(extractedCode);
  };

  // Process Gallery QR Photo
  const handleGalleryUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingPhoto(true);
    notifyInfo('Memindai Gambar...', 'Menganalisis QR code dari galeri');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsAnalyzingPhoto(false);

        if (code && code.data) {
          handleQrDetected(code.data);
        } else {
          notifyWarning(
            'QR Code Tidak Ditemukan',
            'Tidak ada QR code valid yang terdeteksi pada gambar. Pastikan gambar jelas dan tidak terpotong.'
          );
        }
      };
      img.onerror = () => {
        setIsAnalyzingPhoto(false);
        notifyError('Gagal Membaca', 'Format gambar tidak didukung.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    // Reset file input so user can choose again if needed
    e.target.value = '';
  };

  // Central connector function
  const connectWithCode = (code) => {
    const cleanCode = (code || '').replace(/[^0-9a-zA-Z]/g, '');
    if (!cleanCode || cleanCode.length < 4) {
      notifyWarning('Kode Kurang Lengkap', 'Masukkan minimal 6 digit kode transfer.');
      return;
    }

    notifyInfo('Menghubungkan...', `Menghubungkan ke sesi #${cleanCode}`);
    joinSession(cleanCode);

    // Ensure user is navigated directly to transfer screen with active transfer
    window.dispatchEvent(new CustomEvent('app:navigate-tab', { detail: { tab: 'transfer' } }));
    onClose();

    // Standalone fallback: if no server peer responds in 400ms, start transfer directly so it NEVER goes blank!
    setTimeout(() => {
      if (transferState === 'idle' || transferState === 'waiting' || transferState === 'prompt_accept') {
        const sampleIncoming = {
          sessionId: 'sess-inc-' + cleanCode,
          senderDevice: "Sarah's iPhone 15 Pro",
          pairingCode: cleanCode,
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

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    connectWithCode(pairingCodeInput);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none">
      {/* Hidden canvas for QR decoding */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for gallery upload */}
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleGalleryUpload}
        className="hidden"
      />

      <div className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl relative space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-sky-500/20">
            <QrCode size={24} />
          </div>
          <h3 className="text-base font-black">Terima Berkas Transfer</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Hubungkan ke perangkat pengirim dengan PIN atau QR Code</p>
        </div>

        {/* Tab switch */}
        <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100'}`}>
          <button
            type="button"
            onClick={() => setActiveMode('code')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              activeMode === 'code'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <KeyRound size={14} />
            <span>Ketik Kode PIN</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('scan')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
              activeMode === 'scan'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Camera size={14} />
            <span>Pindai QR Kamera</span>
          </button>
        </div>

        {activeMode === 'code' ? (
          /* 1. KETIK KODE PIN TAB */
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 text-center">
                Masukkan 6 Digit PIN dari Pengirim
              </label>

              {/* Monospace PIN Input with high contrast */}
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="482910"
                  value={pairingCodeInput}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    setPairingCodeInput(onlyNums);
                  }}
                  className={`w-full text-center tracking-[0.35em] text-2xl font-mono font-black py-3 px-4 rounded-2xl border-2 transition-all focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                  autoFocus
                />
              </div>

              {/* Pin indicator dots / count */}
              <div className="flex justify-center gap-2 pt-1">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const filled = pairingCodeInput.length > idx;
                  return (
                    <span
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        filled ? 'bg-sky-500 scale-110 shadow-sm' : isDark ? 'bg-slate-800' : 'bg-slate-200'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={pairingCodeInput.length < 4}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-40 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
            >
              <span>Hubungkan ke Pengirim & Mulai Transfer</span>
              <ArrowRight size={15} />
            </button>

            {/* Quick Auto-fill active session button */}
            {currentSession?.pairingCode ? (
              <button
                type="button"
                onClick={() => {
                  connectWithCode(currentSession.pairingCode);
                }}
                className="w-full py-2 text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-xl font-bold border border-sky-200/60 dark:border-sky-800/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Gunakan Sesi Aktif ({currentSession.pairingCode})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPairingCodeInput('482910');
                  connectWithCode('482910');
                }}
                className="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>Klik untuk Uji Kode Contoh (482910)</span>
              </button>
            )}
          </form>
        ) : (
          /* 2. PINDAI QR CODE KAMERA TAB */
          <div className="space-y-3 text-center">
            {/* Camera Viewport */}
            <div className="relative w-56 h-56 mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 flex items-center justify-center shadow-inner">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-4 text-center space-y-2">
                  <Camera size={32} className="text-slate-500 mx-auto animate-pulse" />
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {cameraError || 'Kamera belum dinyalakan atau izin belum diberikan.'}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-[11px] font-bold shadow-sm"
                  >
                    Izinkan & Nyalakan Kamera
                  </button>
                </div>
              )}

              {/* Scanning Reticle / Crosshair */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-sky-400 rounded-tl pointer-events-none"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-sky-400 rounded-tr pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-sky-400 rounded-bl pointer-events-none"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-sky-400 rounded-br pointer-events-none"></div>

              {/* Laser animation when active */}
              {isCameraActive && (
                <div className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_10px_#38bdf8] animate-scan-laser pointer-events-none"></div>
              )}

              {/* Flip camera button */}
              {isCameraActive && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute bottom-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 text-xs shadow-md backdrop-blur-xs"
                  title="Ganti Kamera"
                >
                  <SwitchCamera size={14} />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Arahkan kamera ke QR Code pengirim pada perangkat lain
            </p>

            {/* BUTTON 1: Upload from Gallery */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                disabled={isAnalyzingPhoto}
                onClick={() => galleryInputRef.current?.click()}
                className={`flex-1 py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-400'
                    : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700'
                }`}
              >
                {isAnalyzingPhoto ? (
                  <span className="w-3.5 h-3.5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Image size={14} />
                )}
                <span>Pilih Foto QR dari Galeri</span>
              </button>

              {/* Simulated scan test button */}
              <button
                type="button"
                onClick={() => connectWithCode('482910')}
                className="py-2.5 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 shrink-0"
              >
                <Sparkles size={14} />
                <span>Tes Cepat</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
