import React, { useState } from 'react';
import { X, QrCode, Building2, Wallet, CreditCard, CheckCircle2, ShieldCheck, Sparkles, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function PaymentModal({ isOpen, onClose, selectedPlan, onPaymentComplete }) {
  const { isDark } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('qris'); // 'qris' | 'va' | 'ewallet' | 'card'
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [selectedWallet, setSelectedWallet] = useState('GoPay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const { refreshUser, token } = useAuth();

  if (!isOpen || !selectedPlan) return null;

  const paymentMethods = [
    { id: 'qris', label: 'QRIS', icon: QrCode },
    { id: 'va', label: 'Bank Transfer', icon: Building2 },
    { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
    { id: 'card', label: 'Credit Card', icon: CreditCard }
  ];

  const handleCopyVA = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/plans/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          method: `${selectedMethod.toUpperCase()} (${selectedMethod === 'va' ? selectedBank : selectedMethod === 'ewallet' ? selectedWallet : 'Instant'})`
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        refreshUser();
        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(false);
          onPaymentComplete && onPaymentComplete(selectedPlan);
          onClose();
        }, 1800);
      } else {
        alert('Payment failed to process');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border relative max-h-[90vh] overflow-y-auto transition-all ${
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

        {isSuccess ? (
          /* Success Screen */
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black">Payment Successful!</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Your account has been instantly upgraded to the <span className="font-bold text-sky-500">{selectedPlan.name}</span> plan. Enjoy high-speed transfers and expanded cloud storage!
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-left mb-4">
              <span className="text-[10px] font-extrabold text-sky-500 uppercase tracking-widest">
                Simulated Payment
              </span>
              <h3 className="text-xl font-black mt-0.5">
                Upgrade to {selectedPlan.name}
              </h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-sky-500">
                  {selectedPlan.price_label || `$${selectedPlan.price}/mo`}
                </span>
                <span className="text-xs text-slate-400">billed monthly</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {paymentMethods.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all active:scale-95 ${
                      isSelected
                        ? isDark
                          ? 'border-sky-500 bg-sky-950/60 text-sky-400 shadow-sm'
                          : 'border-sky-500 bg-sky-50/90 text-sky-700 shadow-sm'
                        : isDark
                        ? 'border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-400'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon size={18} className={isSelected ? 'text-sky-500' : 'text-slate-400'} />
                    <span className="text-[10px] font-bold mt-1 truncate w-full">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Method Details */}
            <div className={`border rounded-2xl p-4 mb-4 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              {selectedMethod === 'qris' && (
                <div className="text-center space-y-2.5">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Scan with any e-wallet / mobile banking
                  </span>
                  <div className="bg-white p-3 rounded-xl border border-slate-300 inline-block shadow-sm">
                    <QRCodeSVG
                      value={`qris://payment?amount=${selectedPlan.price}&merchant=FileTransferApp`}
                      size={140}
                      level="M"
                      fgColor="#0F172A"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>Instant automatic verification</span>
                  </div>
                </div>
              )}

              {selectedMethod === 'va' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {['BCA', 'Mandiri', 'BRI'].map((bank) => (
                      <button
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          selectedBank === bank
                            ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                            : isDark
                            ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                        {selectedBank} Virtual Account
                      </span>
                      <span className={`text-sm font-mono font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        8274 9182 0481 294
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyVA('827491820481294')}
                      className="p-2 text-slate-400 hover:text-sky-500 transition-colors"
                    >
                      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'ewallet' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {['GoPay', 'OVO', 'DANA'].map((wallet) => (
                      <button
                        key={wallet}
                        onClick={() => setSelectedWallet(wallet)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          selectedWallet === wallet
                            ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                            : isDark
                            ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {wallet}
                      </button>
                    ))}
                  </div>

                  <div className={`p-3 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    Enter phone number linked with your {selectedWallet}:
                    <input
                      type="tel"
                      defaultValue="0812-3456-7890"
                      className={`mt-1.5 w-full px-3 py-2 border rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-sky-500 ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Card Number</span>
                    <input
                      type="text"
                      defaultValue="4242 •••• •••• 4242"
                      className={`w-full px-3 py-2 border rounded-xl font-mono text-sm font-bold focus:outline-none focus:border-sky-500 ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-slate-400 block mb-1">Exp Date</span>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className={`w-full px-3 py-2 border rounded-xl font-mono text-sm font-bold focus:outline-none focus:border-sky-500 ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <div className="w-20">
                      <span className="text-slate-400 block mb-1">CVV</span>
                      <input
                        type="text"
                        defaultValue="888"
                        className={`w-full px-3 py-2 border rounded-xl font-mono text-sm font-bold focus:outline-none focus:border-sky-500 ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simulate button */}
            <button
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-sky-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Transaction...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Simulate Payment Success</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-2.5">
              This is a simulation sandbox. No real charges will be made.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
