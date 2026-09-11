import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Headphones, Sparkles, CheckCheck, Clock, Paperclip, MessageSquare, Ticket, AlertTriangle, Plus, CheckCircle2, ChevronRight, Filter, Image as ImageIcon, X, Eye, UploadCloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export default function CustomerServiceScreen({ onBack }) {
  const { user, token } = useAuth();
  const { t, lang } = useLanguage();
  const { isDark } = useTheme();
  const { notifySuccess, notifyInfo, notifyError, notifyWarning } = useNotification();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tickets' | 'report'

  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 'msg-init-1',
      sender: 'agent',
      text: t('cs_greeting'),
      time: '12:00'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Tickets state
  const [ticketsList, setTicketsList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketImage, setTicketImage] = useState(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  // New Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Transfer');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketFirstMsg, setTicketFirstMsg] = useState('');
  const [newTicketImage, setNewTicketImage] = useState(null);

  // Report Form
  const [reportType, setReportType] = useState('Bug Aplikasi');
  const [reportDesc, setReportDesc] = useState('');
  const [reportImage, setReportImage] = useState(null);
  const [reportSent, setReportSent] = useState(false);

  // Lightbox Zoom
  const [previewZoomImage, setPreviewZoomImage] = useState(null);

  const quickChips = [
    { id: 'c1', label: t('cs_chip_fail'), query: 'Kenapa transfer saya sering gagal?' },
    { id: 'c2', label: t('cs_chip_quota'), query: 'Berapa kuota cloud untuk akun Free?' },
    { id: 'c3', label: t('cs_chip_pay'), query: 'Bagaimana cara bayar dan upgrade paket?' },
    { id: 'c4', label: t('cs_chip_pair'), query: 'Bagaimana cara scan QR dan pairing code?' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchUserTickets();
    }
  }, [activeTab]);

  const handlePickImage = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notifyWarning('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      callback(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const fetchUserTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTicketsList(data.tickets || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenTicketThread = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await fetch(`/api/support/tickets/${ticket.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTicketMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject: ticketSubject,
          category: ticketCategory,
          priority: ticketPriority,
          message: ticketFirstMsg,
          image_url: newTicketImage
        })
      });

      if (res.ok) {
        setIsNewTicketModalOpen(false);
        setTicketSubject('');
        setTicketFirstMsg('');
        setNewTicketImage(null);
        fetchUserTickets();
        notifySuccess('Tiket Berhasil Dibuat', 'Tim admin akan segera merespons tiket bantuan Anda.');
      } else {
        notifyError('Gagal Membuat Tiket', 'Lengkapi kolom subjek dan pesan.');
      }
    } catch (e) {
      notifyError('Error', 'Gagal menghubungi server.');
    }
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if ((!ticketReplyText.trim() && !ticketImage) || !selectedTicket) return;

    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: ticketReplyText || 'Foto dilampirkan',
          image_url: ticketImage
        })
      });

      if (res.ok) {
        setTicketMessages(prev => [
          ...prev,
          {
            id: 'msg-local-' + Date.now(),
            sender_type: 'user',
            sender_name: user?.name || 'Florian',
            message: ticketReplyText || 'Foto dilampirkan',
            image_url: ticketImage,
            created_at: new Date().toISOString()
          }
        ]);
        setTicketReplyText('');
        setTicketImage(null);
        notifySuccess('Balasan Terkirim', 'Pesan dan foto Anda diteruskan ke admin.');
      }
    } catch (e) {
      notifyError('Error', 'Gagal mengirim balasan.');
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportDesc.trim() && !reportImage) return;

    try {
      const res = await fetch('/api/support/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          report_type: reportType,
          description: reportDesc || 'Screenshot kendala',
          image_url: reportImage
        })
      });

      if (res.ok) {
        setReportSent(true);
        notifySuccess('Laporan Diterima', 'Laporan kendala & foto telah disimpan untuk ditinjau oleh Admin.');
        setTimeout(() => {
          setReportSent(false);
          setReportDesc('');
          setReportImage(null);
        }, 2200);
      }
    } catch (e) {
      notifyError('Error', 'Gagal mengirim laporan');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const message = textToSend || inputText;
    if (!message.trim()) return;

    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAgentTyping(true);

    try {
      const res = await fetch('/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, lang })
      });

      const data = await res.json();
      setTimeout(() => {
        setIsAgentTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: data.id,
            sender: 'agent',
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 800);
    } catch (e) {
      setTimeout(() => {
        setIsAgentTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender: 'agent',
            text: 'Admin telah menerima pesan Anda dan akan merespons melalui Tiket Bantuan.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 700);
    }
  };

  return (
    <div className={`flex-1 flex flex-col select-none ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedTicket) {
                setSelectedTicket(null);
              } else {
                onBack();
              }
            }}
            className={`p-1.5 rounded-xl ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
              <Headphones size={20} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </div>
          <div>
            <h3 className="text-xs font-bold leading-none flex items-center gap-1.5">
              <span>{selectedTicket ? `Tiket #${selectedTicket.id}` : 'Pusat Bantuan & CS'}</span>
              <span className="text-[10px] bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-mono px-1.5 py-0.2 rounded-full">
                ADMIN READY
              </span>
            </h3>
            <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online • Siap membantu</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3 Navigation Sub-Tabs */}
      {!selectedTicket && (
        <div className={`flex p-2 border-b gap-1 shrink-0 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'}`}>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-sky-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={13} />
            <span>Live Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'tickets'
                ? 'bg-sky-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket size={13} />
            <span>Tiket Bantuan</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-sky-500 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Lapor Kendala</span>
          </button>
        </div>
      )}

      {/* TAB 1: LIVE CHAT */}
      {activeTab === 'chat' && !selectedTicket && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-sky-500 text-white rounded-tr-xs'
                        : isDark
                        ? 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-xs'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1 px-1">
                    <span>{m.time}</span>
                    {isUser && <CheckCheck size={12} className="text-sky-400" />}
                  </span>
                </div>
              );
            })}

            {isAgentTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips Bar */}
          <div className={`p-2.5 border-t ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'} flex gap-1.5 overflow-x-auto scrollbar-none shrink-0`}>
            {quickChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleSendMessage(chip.query)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-100'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`p-3 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} flex items-center gap-2 shrink-0`}
          >
            <input
              type="text"
              placeholder={t('cs_placeholder')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`flex-1 px-4 py-2.5 rounded-2xl text-xs focus:outline-none transition-colors ${
                isDark
                  ? 'bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-sky-500'
                  : 'bg-slate-100 text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-sky-500 focus:bg-white'
              }`}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-sky-500/30 transition-all active:scale-95 shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: TIKET BANTUAN (Dengan Admin) */}
      {activeTab === 'tickets' && !selectedTicket && (
        <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daftar Tiket Anda ({ticketsList.length})
            </span>
            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Plus size={14} />
              <span>Buat Tiket</span>
            </button>
          </div>

          <div className="space-y-2">
            {ticketsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada tiket bantuan. Klik tombol Buat Tiket jika Anda butuh investigasi langsung dari admin.
              </div>
            ) : (
              ticketsList.map((tkt) => (
                <div
                  key={tkt.id}
                  onClick={() => handleOpenTicketThread(tkt)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] space-y-2 ${
                    isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-sky-500 font-bold">#{tkt.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      tkt.status === 'open' ? 'bg-sky-100 text-sky-700' : tkt.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {tkt.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{tkt.subject}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Kategori: {tkt.category}</span>
                    <span>{new Date(tkt.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TICKET THREAD VIEW */}
      {selectedTicket && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900 text-xs flex items-center justify-between shrink-0">
            <div>
              <p className="font-bold text-slate-800 dark:text-white truncate">{selectedTicket.subject}</p>
              <p className="text-[10px] text-slate-500">Prioritas: {selectedTicket.priority} • Status: {selectedTicket.status}</p>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Kembali
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {ticketMessages.map((msg, i) => {
              const isAdmin = msg.sender_type === 'admin';
              return (
                <div key={i} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} space-y-1`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-2 ${
                    isAdmin
                      ? isDark
                        ? 'bg-slate-800 text-slate-100 rounded-tl-xs'
                        : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-xs'
                      : 'bg-sky-500 text-white rounded-tr-xs'
                  }`}>
                    <span className="text-[9px] font-bold block opacity-75">
                      {isAdmin ? 'Admin Support' : msg.sender_name}
                    </span>
                    {msg.message && msg.message !== 'Foto dilampirkan' && (
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    )}
                    {msg.image_url && (
                      <div className="relative rounded-xl overflow-hidden border border-white/20 group cursor-pointer" onClick={() => setPreviewZoomImage(msg.image_url)}>
                        <img
                          src={msg.image_url}
                          alt="Lampiran"
                          className="max-h-48 w-full object-cover rounded-xl transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye size={18} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pending Photo Preview Bar */}
          {ticketImage && (
            <div className="px-3 pt-2 pb-1 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <img src={ticketImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-sky-400" />
                <span className="text-[11px] text-slate-500">1 foto siap dikirim</span>
              </div>
              <button
                onClick={() => setTicketImage(null)}
                className="p-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSendTicketReply} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
            <input
              type="file"
              accept="image/*"
              id="ticket-image-input"
              className="hidden"
              onChange={(e) => handlePickImage(e, setTicketImage)}
            />
            <label
              htmlFor="ticket-image-input"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors shrink-0"
              title="Lampirkan Foto"
            >
              <ImageIcon size={16} />
            </label>

            <input
              type="text"
              placeholder="Tulis balasan untuk admin..."
              value={ticketReplyText}
              onChange={(e) => setTicketReplyText(e.target.value)}
              className={`flex-1 px-4 py-2.5 text-xs rounded-xl focus:outline-none ${
                isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            />
            <button
              type="submit"
              disabled={!ticketReplyText.trim() && !ticketImage}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm shrink-0 flex items-center gap-1"
            >
              <Send size={14} />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LAPOR KENDALA */}
      {activeTab === 'report' && !selectedTicket && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Laporkan Masalah atau Bug</h3>
            <p className="text-xs text-slate-400">
              Tim engineering kami akan segera menginvestigasi laporan kendala transfer file atau bug sistem.
            </p>
          </div>

          {reportSent ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-3xl animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Laporan Berhasil Terkirim!</h4>
              <p className="text-xs text-slate-500">ID Laporan Anda beserta bukti foto telah dicatat di database untuk ditinjau admin.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Tipe Kendala</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-semibold ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                  }`}
                >
                  <option value="Bug Aplikasi">Bug / Tampilan Rusak</option>
                  <option value="Transfer Gagal">Transfer Gagal Terhubung</option>
                  <option value="File Rusak">File Gagal Dibuka</option>
                  <option value="Kendala Kuota">Kuota Cloud Tidak Sinkron</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Jelaskan Detail Masalah</label>
                <textarea
                  rows={4}
                  required={!reportImage}
                  placeholder="Ceritakan apa yang terjadi, file apa yang ditransfer, dan pesan error jika ada..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:border-sky-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              {/* Photo Attachment Picker for Report */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Bukti Foto / Tangkapan Layar Kendala</label>
                <input
                  type="file"
                  accept="image/*"
                  id="report-photo-input"
                  className="hidden"
                  onChange={(e) => handlePickImage(e, setReportImage)}
                />

                {!reportImage ? (
                  <label
                    htmlFor="report-photo-input"
                    className={`w-full p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-sky-400 transition-colors ${
                      isDark ? 'bg-slate-900/60 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-600'
                    }`}
                  >
                    <UploadCloud size={22} className="text-sky-500" />
                    <span className="font-semibold text-xs">Pilih Foto / Tangkapan Layar</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Maksimal 5 MB)</span>
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-sky-400 p-1 bg-slate-900/80">
                    <img src={reportImage} alt="Bukti Kendala" className="max-h-48 w-full object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setReportImage(null)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 font-bold rounded-2xl text-xs shadow-md active:scale-95 transition-all"
              >
                Kirim Laporan ke Admin
              </button>
            </form>
          )}
        </div>
      )}

      {/* Modal Buat Tiket Baru */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-xs rounded-3xl p-5 border shadow-2xl space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-sm font-bold">Buat Tiket Bantuan Baru</h3>
            <form onSubmit={handleCreateTicketSubmit} className="space-y-2.5 text-xs">
              <input
                type="text"
                required
                placeholder="Subjek Tiket (misal: Gagal pairing Wi-Fi)"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className={`w-full p-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
              />
              <div className="flex gap-2">
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className={`flex-1 p-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Transfer">Transfer</option>
                  <option value="Boardsave">Boardsave</option>
                  <option value="Pembayaran">Pembayaran</option>
                  <option value="Akun">Akun</option>
                </select>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className={`flex-1 p-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>

              <textarea
                rows={3}
                required={!newTicketImage}
                placeholder="Tuliskan pertanyaan atau kendala Anda..."
                value={ticketFirstMsg}
                onChange={(e) => setTicketFirstMsg(e.target.value)}
                className={`w-full p-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
              />

              {/* Photo attachment in modal */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="new-ticket-img"
                  className="hidden"
                  onChange={(e) => handlePickImage(e, setNewTicketImage)}
                />
                {!newTicketImage ? (
                  <label
                    htmlFor="new-ticket-img"
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-sky-400/60 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    <ImageIcon size={13} />
                    <span>+ Lampirkan Foto / Screenshot</span>
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-sky-400 p-1">
                    <img src={newTicketImage} alt="Preview" className="h-20 w-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setNewTicketImage(null)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="flex-1 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl font-bold bg-sky-500 text-white"
                >
                  Kirim Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-sm w-full max-h-[85vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <X size={18} />
            </button>
            <img
              src={previewZoomImage}
              alt="Lampiran Penuh"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
