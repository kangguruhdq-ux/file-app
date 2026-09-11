import React, { useState } from 'react';
import { Camera, Wifi, Radio, SmartphoneNfc, HardDrive, ShieldCheck, X, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const PERMISSION_CONFIGS = {
  camera: {
    id: 'camera',
    title: 'Izin Akses Kamera',
    subtitle: 'Diperlukan untuk Memindai QR Code',
    desc: 'Aplikasi memerlukan izin kamera untuk memindai QR Code transfer secara langsung tanpa mengetik PIN manual.',
    icon: Camera,
    color: 'from-sky-500 to-blue-600',
    iconColor: 'text-sky-500',
    hardware: 'Kamera Belakang / Depan',
    securityNote: 'Privasi terjamin: Video kamera hanya diproses lokal di perangkat dan tidak pernah diunggah ke server.'
  },
  wifi: {
    id: 'wifi',
    title: 'Izin Jaringan Lokal & Wi-Fi',
    subtitle: 'Diperlukan untuk Wi-Fi Direct 5GHz Hotspot',
    desc: 'Aplikasi memerlukan izin untuk mengelola koneksi Wi-Fi Direct & Local Area Network (LAN) guna transfer berkas berkecepatan hingga 45 MB/s tanpa kuota internet.',
    icon: Wifi,
    color: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-500',
    hardware: 'Antena Wi-Fi 5GHz / 2.4GHz Direct',
    securityNote: 'Koneksi peer-to-peer terisolasi dengan enkripsi WPA3 lokal.'
  },
  location_nearby: {
    id: 'location_nearby',
    title: 'Izin Perangkat Sekitar & Lokasi',
    subtitle: 'Diperlukan untuk Radar Pencarian WebRTC P2P',
    desc: 'Aplikasi memerlukan izin Perangkat Sekitar (Nearby Devices) & Lokasi presisi agar radar dapat mendeteksi smartphone atau laptop di sekitar Anda.',
    icon: Radio,
    color: 'from-purple-500 to-indigo-600',
    iconColor: 'text-purple-500',
    hardware: 'Bluetooth Low Energy & Location Provider',
    securityNote: 'Lokasi Anda tidak dilacak atau disimpan di server eksternal.'
  },
  motion_sensors: {
    id: 'motion_sensors',
    title: 'Izin Sensor Gerak & NFC',
    subtitle: 'Diperlukan untuk NFC Tap & Shake to Beam',
    desc: 'Aplikasi memerlukan akses sensor akselerometer & sensor NFC untuk mendeteksi gerakan goyangan HP serta sentuhan fisik antar perangkat.',
    icon: SmartphoneNfc,
    color: 'from-rose-500 to-pink-600',
    iconColor: 'text-rose-500',
    hardware: 'Akselerometer, Gyroscope & NFC Chip',
    securityNote: 'Hanya aktif selama proses transfer berkas berlangsung.'
  },
  storage: {
    id: 'storage',
    title: 'Izin Akses Penyimpanan Berkas',
    subtitle: 'Diperlukan untuk Membaca & Menyimpan File',
    desc: 'Aplikasi memerlukan izin penyimpanan untuk memilih berkas dari memori internal serta menyimpan file yang diterima ke Boardsave.',
    icon: HardDrive,
    color: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-500',
    hardware: 'Internal Storage & Cloud Cache',
    securityNote: 'Hanya berkas yang Anda pilih secara sadar yang akan ditransfer.'
  }
};

export const getStoredPermission = (permId) => {
  try {
    const raw = localStorage.getItem('app_device_permissions');
    if (!raw) return false;
    const data = JSON.parse(raw);
    return !!data[permId];
  } catch (e) {
    return false;
  }
};

export const saveStoredPermission = (permId, granted = true) => {
  try {
    const raw = localStorage.getItem('app_device_permissions');
    const data = raw ? JSON.parse(raw) : {};
    data[permId] = granted;
    localStorage.setItem('app_device_permissions', JSON.stringify(data));
  } catch (e) {}
};

export default function DevicePermissionModal({ isOpen, onClose, permissionType = 'camera', onGranted }) {
  const { isDark } = useTheme();
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const config = PERMISSION_CONFIGS[permissionType] || PERMISSION_CONFIGS.camera;
  const Icon = config.icon;

  const handleGrant = async () => {
    setIsRequesting(true);
    try {
      // Trigger native browser permission request if applicable
      if (permissionType === 'camera' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.warn('Native camera prompt declined or not available:', e);
        }
      } else if (permissionType === 'location_nearby' && navigator.geolocation) {
        try {
          await new Promise((res) => {
            navigator.geolocation.getCurrentPosition(res, res, { timeout: 2000 });
          });
        } catch (e) {}
      } else if (permissionType === 'motion_sensors' && typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          await DeviceMotionEvent.requestPermission();
        } catch (e) {}
      }
    } finally {
      saveStoredPermission(permissionType, true);
      setIsRequesting(false);
      if (onGranted) onGranted();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 relative ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <X size={16} />
        </button>

        {/* Icon & Heading */}
        <div className="text-center pt-2">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${config.color} text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/20`}>
            <Icon size={28} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-500 block mb-1">
            PERMINTAAN IZIN SISTEM
          </span>
          <h3 className="text-base font-black">
            {config.title}
          </h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {config.subtitle}
          </p>
        </div>

        {/* Description Box */}
        <div className={`p-3.5 rounded-2xl border space-y-2 text-xs leading-relaxed ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <p className="text-slate-700 dark:text-slate-300">
            {config.desc}
          </p>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Komponen:</span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{config.hardware}</span>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1">
          <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>{config.securityNote}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tolak / Batal
          </button>
          <button
            type="button"
            disabled={isRequesting}
            onClick={handleGrant}
            className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {isRequesting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Check size={15} />
                <span>Izinkan Akses</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
