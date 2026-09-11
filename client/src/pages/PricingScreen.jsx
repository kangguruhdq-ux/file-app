import React, { useState } from 'react';
import { ChevronLeft, Plus, Check, Zap, Sparkles, Receipt, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PaymentModal from '../components/PaymentModal';
import PlanTransactionsModal from '../components/PlanTransactionsModal';

export default function PricingScreen({ onBack }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);

  const currentPlanId = user?.plan_id || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      price_label: '$0/mo',
      storageText: 'Send up to 4 GB',
      subText: 'Transfers expire after 7 days',
      cardBg: isDark
        ? 'bg-slate-900 text-slate-100 border border-slate-800 shadow-sm'
        : 'bg-white text-slate-900 border border-slate-200/90 shadow-xs',
      pillBg: isDark
        ? 'bg-slate-800 text-slate-300'
        : 'bg-slate-100 text-slate-700',
      pillText: 'Current plan',
      hasPlus: false,
      illustration: (
        <svg viewBox="0 0 100 80" className="w-20 h-16">
          <path
            d="M 10 35 L 85 15 L 45 65 Z"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M 45 65 L 55 45 L 85 15"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <line x1="2" y1="45" x2="25" y2="45" stroke="#BAE6FD" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      )
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 8,
      price_label: '$8/mo',
      storageText: 'Send & receive up to 300 GB',
      subText: '300 GB Boardsave\n1 TB Storage',
      cardBg: isDark
        ? 'bg-gradient-to-r from-slate-900 via-sky-950/70 to-slate-900 text-white border border-sky-900/60 shadow-md'
        : 'bg-gradient-to-r from-sky-100 via-sky-200 to-sky-100 text-slate-900 border border-sky-300/80 shadow-sm',
      pillBg: isDark
        ? 'bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold'
        : 'bg-sky-500 text-white hover:bg-sky-600 font-bold',
      pillText: 'Buy plan',
      hasPlus: true,
      illustration: (
        <svg viewBox="0 0 100 80" className="w-20 h-16">
          <defs>
            <linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
          <polygon points="20,25 65,15 85,30 40,40" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
          <polygon points="20,25 40,40 40,65 20,50" fill="url(#serverGrad)" stroke="#0284C7" strokeWidth="1.2" />
          <polygon points="40,40 85,30 85,55 40,65" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.2" />
          <line x1="45" y1="46" x2="75" y2="38" stroke="#0369A1" strokeWidth="1.5" />
          <line x1="45" y1="52" x2="75" y2="44" stroke="#0369A1" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: 15,
      price_label: '$15/mo',
      storageText: 'Anything unlimited',
      subText: 'Just save anything on internet\nStorage as much as you need',
      cardBg: isDark
        ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-md'
        : 'bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 text-slate-900 border border-blue-200 shadow-sm',
      pillBg: isDark
        ? 'bg-indigo-500 text-white hover:bg-indigo-400 font-bold'
        : 'bg-indigo-600 text-white hover:bg-indigo-700 font-bold',
      pillText: 'Buy plan',
      hasPlus: true,
      illustration: (
        <svg viewBox="0 0 100 80" className="w-20 h-16">
          <defs>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d="M 30 50 Q 20 40 32 30 Q 42 18 60 22 Q 78 18 82 35 Q 92 45 80 55 L 35 55 Q 22 55 30 50 Z"
            fill="url(#cloudGrad)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />
          <polygon points="20,25 22,20 27,22 22,24" fill="#F8FAFC" />
          <polygon points="75,15 76,11 80,13 77,15" fill="#38BDF8" />
        </svg>
      )
    }
  ];

  const handlePlanClick = (plan) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlanForPayment(plan);
  };

  return (
    <div className={`flex-1 flex flex-col p-5 overflow-y-auto select-none ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pt-1 pb-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors -ml-1 ${
              isDark ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold tracking-tight">
            Plans & Pricing
          </h2>
        </div>

        {/* Button to open Plan Transactions / Expiry History */}
        <button
          onClick={() => setIsTransactionsModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-sky-400'
              : 'bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-700'
          }`}
        >
          <Receipt size={14} />
          <span>Riwayat Plan</span>
        </button>
      </div>

      {/* Plan Expiry Notice if User has active paid plan */}
      {user?.plan_id && user.plan_id !== 'free' && (
        <div
          onClick={() => setIsTransactionsModalOpen(true)}
          className="mb-4 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between cursor-pointer hover:bg-sky-500/15 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-500 flex items-center justify-center">
              <Clock size={15} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                Masa Aktif Paket Berakhir
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {user?.plan_expires_at
                  ? `${new Date(user.plan_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} (${user.daysRemaining ?? 30} hari lagi)`
                  : 'Aktif (30 Hari)'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 underline">
            Lihat Bukti
          </span>
        </div>
      )}

      {/* Cards List matching reference screenshot */}
      <div className="space-y-4 pb-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-5 transition-all ${plan.cardBg}`}
            >
              {/* Top Row: Plan Name & Illustration */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs font-semibold mt-1">
                    {plan.storageText}
                  </p>
                  <p className="text-[11px] opacity-75 mt-0.5 whitespace-pre-line leading-relaxed">
                    {plan.subText}
                  </p>
                </div>

                <div className="shrink-0 -mt-1 -mr-1">
                  {plan.illustration}
                </div>
              </div>

              {/* Bottom Row: Pill Button + Price + Plus Circle */}
              <div className="mt-4 flex items-center justify-between pt-2">
                <button
                  onClick={() => handlePlanClick(plan)}
                  disabled={isCurrent}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                    isCurrent
                      ? 'bg-sky-100/90 text-sky-800 cursor-default'
                      : plan.pillBg
                  }`}
                >
                  {isCurrent ? 'Current plan' : 'Buy plan'}
                </button>

                <div className="flex items-center gap-3">
                  {plan.price > 0 && (
                    <span className="text-sm font-extrabold tracking-tight">
                      {plan.price_label}
                    </span>
                  )}

                  {plan.hasPlus && (
                    <button
                      onClick={() => handlePlanClick(plan)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        plan.id === 'unlimited'
                          ? 'border-slate-700 text-slate-300 hover:text-white'
                          : 'border-slate-800/30 text-slate-800 hover:border-slate-900'
                      }`}
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table brief */}
      <div className={`mt-2 p-4 rounded-2xl border space-y-2 text-xs ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
      }`}>
        <h4 className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          <Sparkles size={14} className="text-sky-500" />
          <span>Membership Benefits</span>
        </h4>
        <div className={`space-y-1.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <p className="flex items-center gap-1.5">
            <Check size={12} className="text-emerald-500" />
            <span>Fast cross-device transfer via QR & code pairing</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Check size={12} className="text-emerald-500" />
            <span>Encrypted cloud storage with public share links</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Check size={12} className="text-emerald-500" />
            <span>Instant sandbox payment simulation with zero actual charges</span>
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={!!selectedPlanForPayment}
        onClose={() => setSelectedPlanForPayment(null)}
        selectedPlan={selectedPlanForPayment}
        onPaymentComplete={() => setSelectedPlanForPayment(null)}
      />

      {/* Plan Transactions & Expiration Modal */}
      <PlanTransactionsModal
        isOpen={isTransactionsModalOpen}
        onClose={() => setIsTransactionsModalOpen(false)}
      />
    </div>
  );
}
