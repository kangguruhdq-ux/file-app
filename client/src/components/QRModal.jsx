import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Wifi, Smartphone, Radio, SendHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function QRModal({ isOpen, onClose, pairingCode, qrToken, totalFiles, totalSize, senderDevice, onStartTransfer }) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formattedCode = pairingCode ? pairingCode.replace(/(\d{3})(\d{3})/, '$1 $2') : '------';

  const handleCopy = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDirectStart = () => {
    if (onStartTransfer) {
      onStartTransfer();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border relative text-center transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <X size={18} />
        </button>

        {/* Radar Icon & Pulse */}
        <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-sky-400/20 animate-ping"></div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 relative z-10">
            <Radio size={22} className="animate-pulse" />
          </div>
        </div>

        <h3 className="text-lg font-black tracking-tight">Ready to Send</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Scan QR code or enter pairing code on the receiving device
        </p>

        {/* QR Code Container - High contrast white pad for optical camera scanning */}
        <div className={`my-4 p-4 rounded-2xl border inline-block shadow-inner ${
          isDark ? 'bg-white border-slate-300' : 'bg-slate-50 border-slate-200'
        }`}>
          <QRCodeSVG
            value={qrToken || pairingCode || 'filetransfer-session'}
            size={175}
            level="H"
            includeMargin={true}
            fgColor="#0F172A"
            bgColor="#FFFFFF"
          />
        </div>

        {/* Pairing Code Card */}
        <div className={`border rounded-2xl p-3 mb-4 transition-colors ${
          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-sky-50/80 border-sky-100'
        }`}>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-sky-500 block mb-1">
            6-Digit Pairing Code
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className={`text-2xl font-mono font-black tracking-widest ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {formattedCode}
            </span>
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-sky-400'
                  : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-600'
              }`}
              title="Copy pairing code"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Session Meta */}
        <div className={`flex items-center justify-between text-xs px-2 py-2 border-t mb-3 ${
          isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
        }`}>
          <div className="flex items-center gap-1.5">
            <Smartphone size={13} className="text-slate-400" />
            <span className={`font-medium truncate max-w-[120px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {senderDevice || 'My Device'}
            </span>
          </div>
          <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            {totalFiles} files ({formatBytes(totalSize)})
          </span>
        </div>

        {/* Action Button to Immediately Launch Live Transfer Process */}
        <button
          onClick={handleDirectStart}
          className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-black rounded-2xl text-xs shadow-lg shadow-sky-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 mb-2"
        >
          <SendHorizontal size={15} />
          <span>Mulai Proses Transfer Langsung</span>
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Menunggu perangkat terhubung atau klik tombol di atas</span>
        </div>
      </div>
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
