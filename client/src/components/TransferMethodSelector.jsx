import React from 'react';
import { QrCode, Wifi, ShieldCheck, Link2, SmartphoneNfc, Zap, Check } from 'lucide-react';

export const TRANSFER_METHODS = [
  {
    id: 'qr',
    title: 'QR Code & 6-Digit Code',
    desc: 'Scan QR atau ketik kode pairing 6 digit',
    speed: '25 MB/s',
    icon: QrCode,
    badge: 'Standard',
    color: 'from-sky-500 to-blue-600',
    iconColor: 'text-sky-500'
  },
  {
    id: 'wifi_direct',
    title: 'Wi-Fi Direct Hotspot',
    desc: 'Koneksi lokal tanpa internet berkecepatan tinggi',
    speed: '45 MB/s',
    icon: Wifi,
    badge: 'Ultra Fast',
    color: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-500'
  },
  {
    id: 'webrtc_p2p',
    title: 'WebRTC P2P Tunnel',
    desc: 'Transfer langsung antar perangkat terenkripsi end-to-end',
    speed: '38 MB/s',
    icon: ShieldCheck,
    badge: 'Encrypted',
    color: 'from-purple-500 to-indigo-600',
    iconColor: 'text-purple-500'
  },
  {
    id: 'cloud_magic_link',
    title: 'Cloud Magic Link & Token',
    desc: 'Simpan ke cloud dan kirim tautan sekali unduh',
    speed: 'Cloud Relay',
    icon: Link2,
    badge: 'Anywhere',
    color: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-500'
  },
  {
    id: 'nfc_shake',
    title: 'NFC Tap & Shake to Beam',
    desc: 'Dekatkan ponsel atau goyangkan HP ke perangkat sekitar',
    speed: 'Instant Beam',
    icon: SmartphoneNfc,
    badge: 'Gesture',
    color: 'from-rose-500 to-pink-600',
    iconColor: 'text-rose-500'
  }
];

export default function TransferMethodSelector({ selectedMethod, onSelectMethod }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Pilih 1 dari 5 Metode Transfer
        </span>
        <span className="text-[10px] font-mono text-sky-500 font-bold bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
          5 METODE
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {TRANSFER_METHODS.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMethod === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectMethod(m.id)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between ${
                isSelected
                  ? 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${m.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon size={18} />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {m.title}
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {m.desc}
                  </p>
                </div>
              </div>

              <div className="ml-2 shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold text-emerald-500 hidden sm:inline">
                  {m.speed}
                </span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
