import React, { useState } from 'react';
import { X, QrCode, KeyRound, Camera, Sparkles, ArrowRight } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function QRScannerModal({ isOpen, onClose }) {
  const [activeMode, setActiveMode] = useState('code'); // 'code' | 'scan'
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { joinSession, currentSession } = useSocket();

  if (!isOpen) return null;

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const cleanCode = pairingCodeInput.replace(/\s+/g, '');
    if (cleanCode.length >= 6) {
      joinSession(cleanCode);
      window.dispatchEvent(new CustomEvent('app:navigate-tab', { detail: { tab: 'transfer' } }));
      onClose();
    } else {
      alert('Masukkan 6 digit kode transfer yang valid');
    }
  };

  const handleSimulatedScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // If there's an active session in demo or test code
      if (currentSession && currentSession.pairingCode) {
        joinSession(currentSession.pairingCode);
      } else {
        // Sample test code
        joinSession('482910');
      }
      window.dispatchEvent(new CustomEvent('app:navigate-tab', { detail: { tab: 'transfer' } }));
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-sky-400 flex items-center justify-center mx-auto mb-2.5 shadow-md">
            <QrCode size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Receive Files</h3>
          <p className="text-xs text-slate-500">Connect to sender to accept incoming files</p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
          <button
            onClick={() => setActiveMode('code')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeMode === 'code'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyRound size={15} />
            <span>Enter Code</span>
          </button>
          <button
            onClick={() => setActiveMode('scan')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeMode === 'scan'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera size={15} />
            <span>Scan QR</span>
          </button>
        </div>

        {activeMode === 'code' ? (
          /* Code Input */
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 text-center">
                Enter 6-digit sender code
              </label>
              <input
                type="text"
                maxLength={7}
                placeholder="e.g. 839 204"
                value={pairingCodeInput}
                onChange={(e) => setPairingCodeInput(e.target.value)}
                className="w-full text-center tracking-widest text-2xl font-mono font-bold py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={pairingCodeInput.replace(/\s+/g, '').length < 6}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition-all"
            >
              <span>Connect to Sender</span>
              <ArrowRight size={16} />
            </button>

            {/* Quick test button */}
            {currentSession?.pairingCode && (
              <button
                type="button"
                onClick={() => {
                  joinSession(currentSession.pairingCode);
                  onClose();
                }}
                className="w-full py-2 text-xs text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl font-medium border border-sky-200/60 transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles size={14} />
                <span>Auto-fill active session ({currentSession.pairingCode})</span>
              </button>
            )}
          </form>
        ) : (
          /* QR Camera Simulator */
          <div className="space-y-4 text-center">
            <div className="relative w-56 h-56 mx-auto bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-sky-400 rounded-tl"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-sky-400 rounded-tr"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-sky-400 rounded-bl"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-sky-400 rounded-br"></div>

              {/* Animated Laser line */}
              <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_8px_#38bdf8] animate-scan-laser"></div>

              <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                <Camera size={32} className="text-slate-500 animate-pulse" />
                <span>Align QR code inside frame</span>
              </div>
            </div>

            <button
              onClick={handleSimulatedScan}
              disabled={isScanning}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Scanning QR Code...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Scan Sender's QR Code</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
