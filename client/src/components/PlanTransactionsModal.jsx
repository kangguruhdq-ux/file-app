import React, { useState, useEffect } from 'react';
import { X, Receipt, Crown, CheckCircle2, Clock, AlertCircle, Copy, Check, ChevronRight, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export default function PlanTransactionsModal({ isOpen, onClose, onNavigatePricing }) {
  const { token, user } = useAuth();
  const { isDark } = useTheme();
  const { notifySuccess, notifyInfo } = useNotification();

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans/my-transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (txId) => {
    navigator.clipboard.writeText(txId);
    setCopiedId(txId);
    notifySuccess('Disalin', `ID Transaksi ${txId} disalin ke clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const currentPlan = subscription?.plan_name || (user?.plan_id === 'pro' ? 'Pro' : user?.plan_id === 'unlimited' ? 'Unlimited' : 'Free');
  const isFree = user?.plan_id === 'free' || !user?.plan_id;
  const expiresAt = subscription?.plan_expires_at || user?.plan_expires_at;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn select-none">
      <div className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border flex flex-col max-h-[88vh] relative ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
              <Receipt size={17} />
            </div>
            <div>
              <h3 className="text-sm font-black leading-tight">Riwayat Transaksi Plan</h3>
              <p className="text-[10px] text-slate-400 font-mono">LANGGANAN & MASA AKTIF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3.5 space-y-3.5 pr-0.5">
          {/* Active Plan Status Card */}
          <div className={`p-4 rounded-2xl border relative overflow-hidden ${
            isDark
              ? 'bg-gradient-to-br from-slate-800/90 to-slate-900 border-slate-700/80 shadow-md'
              : 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50/70 border-sky-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Crown size={15} className="text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Paket Aktif: {currentPlan}
                </span>
              </div>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isFree
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  : subscription?.isPlanExpired
                  ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
              }`}>
                {isFree ? 'FREE TIER' : subscription?.isPlanExpired ? 'KEDALUWARSA' : 'AKTIF'}
              </span>
            </div>

            {/* Expiry Details */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar size={13} className="text-sky-500" />
                  <span>Kapan Plan Berakhir:</span>
                </span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {isFree
                    ? 'Permanen (Selamanya)'
                    : expiresAt
                    ? new Date(expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '30 Hari dari Aktivasi'}
                </span>
              </div>

              {!isFree && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock size={13} className="text-amber-500" />
                    <span>Sisa Waktu:</span>
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400 font-mono">
                    {subscription?.daysRemaining !== null && subscription?.daysRemaining !== undefined
                      ? `${subscription.daysRemaining} Hari Tersisa`
                      : 'Aktif'}
                  </span>
                </div>
              )}
            </div>

            {/* Upgrade/Renew Button */}
            <button
              onClick={() => {
                onClose();
                onNavigatePricing && onNavigatePricing();
              }}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>{isFree ? 'Tingkatkan ke Pro (1 TB)' : 'Perpanjang / Ganti Paket'}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Section Title */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Catatan Transaksi ({transactions.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">TERENKRIPSI</span>
          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Memuat riwayat transaksi...
            </div>
          ) : transactions.length === 0 ? (
            <div className={`p-4 rounded-2xl border text-center space-y-2 ${
              isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center mx-auto">
                <Receipt size={18} />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Transaksi</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Anda saat ini menggunakan akun Free. Upgrade ke Pro untuk menikmati kuota 1 TB dan transfer tanpa batas!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {transactions.map((tx) => {
                const isSuccess = tx.status === 'success';
                const isPending = tx.status === 'pending';
                const txExpDate = tx.expires_at ? new Date(tx.expires_at) : null;
                return (
                  <div
                    key={tx.id}
                    className={`p-3.5 rounded-2xl border space-y-2 text-xs transition-all ${
                      isDark ? 'bg-slate-800/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50/90 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Top row: Plan & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          tx.plan_id === 'unlimited' ? 'bg-indigo-500' : tx.plan_id === 'pro' ? 'bg-sky-500' : 'bg-slate-400'
                        }`}></span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Paket {tx.plan_id ? tx.plan_id.toUpperCase() : 'PRO'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {tx.duration_months || 1} Bulan
                        </span>
                      </div>

                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isSuccess
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : isPending
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                      }`}>
                        {isSuccess ? 'BERHASIL' : isPending ? 'PENDING' : tx.status?.toUpperCase()}
                      </span>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                      <div className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                        <span>{tx.id}</span>
                        <button
                          onClick={() => handleCopy(tx.id)}
                          className="hover:text-sky-500 transition-colors"
                          title="Salin ID Transaksi"
                        >
                          {copiedId === tx.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <span className="font-bold font-mono text-emerald-500 text-xs">
                        ${Number(tx.amount).toFixed(2)}
                      </span>
                    </div>

                    {/* Method & Expiry */}
                    <div className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span>Metode Pembayaran:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{tx.method}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Tanggal Transaksi:</span>
                        <span className="font-mono">{new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold text-sky-600 dark:text-sky-400 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                        <span>Masa Aktif Berakhir:</span>
                        <span className="font-mono">
                          {txExpDate
                            ? txExpDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '30 Hari Setelah Pembelian'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-center text-slate-400 flex items-center justify-center gap-1 shrink-0">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Transaksi dilindungi enkripsi SSL 256-bit</span>
        </div>
      </div>
    </div>
  );
}
