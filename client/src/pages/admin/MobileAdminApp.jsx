import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, SendHorizontal, HardDrive, Crown, CreditCard, LayoutDashboard, Plus, Search, Trash2, Edit2, ShieldAlert, RefreshCw, CheckCircle2, XCircle, AlertCircle, Sparkles, Key, MessageSquare, Ticket, AlertTriangle, PieChart, TrendingUp, BarChart2, Image as ImageIcon, X, Eye, Download, ExternalLink, FileText, Check, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';

export default function MobileAdminApp({ onCloseAdmin }) {
  const { token } = useAuth();
  const { t, lang } = useLanguage();
  const { isDark } = useTheme();
  const { notifySuccess, notifyInfo, notifyError, notifyWarning } = useNotification();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'transfers' | 'files' | 'plans' | 'tx' | 'tickets'

  // Data states
  const [metrics, setMetrics] = useState(null);
  const [dailyChart, setDailyChart] = useState([]);
  const [categoryChart, setCategoryChart] = useState([]);
  const [membershipChart, setMembershipChart] = useState([]);
  const [methodChart, setMethodChart] = useState([]);
  const [ticketStats, setTicketStats] = useState(null);
  const [explanations, setExplanations] = useState({});

  const [usersList, setUsersList] = useState([]);
  const [transfersList, setTransfersList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [userQuery, setUserQuery] = useState('');
  const [selectedTicketThread, setSelectedTicketThread] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyImage, setAdminReplyImage] = useState(null);
  const [adminZoomImage, setAdminZoomImage] = useState(null);

  // Modals for CRUD
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editUserObj, setEditUserObj] = useState(null);

  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
  const [isEditFileModalOpen, setIsEditFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState(2500000);
  const [newFileCategory, setNewFileCategory] = useState('document');
  const [newFileVisibility, setNewFileVisibility] = useState('public');
  const [editFileObj, setEditFileObj] = useState(null);

  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [newPlanId, setNewPlanId] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState(10);
  const [newPlanStorage, setNewPlanStorage] = useState('500 GB');
  const [newPlanUpload, setNewPlanUpload] = useState('50 GB');
  const [editPlanObj, setEditPlanObj] = useState(null);

  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [newTxUser, setNewTxUser] = useState('');
  const [newTxEmail, setNewTxEmail] = useState('');
  const [newTxPlan, setNewTxPlan] = useState('pro');
  const [newTxAmount, setNewTxAmount] = useState(8);
  const [newTxDuration, setNewTxDuration] = useState(1);
  const [newTxMethod, setNewTxMethod] = useState('QRIS Instant');
  const [newTxStatus, setNewTxStatus] = useState('success');

  const [isAddTransferModalOpen, setIsAddTransferModalOpen] = useState(false);
  const [newTfSender, setNewTfSender] = useState('Admin Station');
  const [newTfReceiver, setNewTfReceiver] = useState("Florian's Phone");
  const [newTfFileName, setNewTfFileName] = useState('Production_Build.apk');
  const [newTfSize, setNewTfSize] = useState(38000000);
  const [newTfStatus, setNewTfStatus] = useState('completed');

  // Form states for Add User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserPlan, setNewUserPlan] = useState('free');
  const [newUserPlanExpiresAt, setNewUserPlanExpiresAt] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handlePickAdminImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notifyWarning('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAdminReplyImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [r1, r2, r3, r4, r5, r6, r7, r8] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/transfers', { headers }),
        fetch('/api/admin/files', { headers }),
        fetch('/api/plans'),
        fetch('/api/admin/transactions', { headers }),
        fetch('/api/admin/tickets', { headers }),
        fetch('/api/admin/reports', { headers })
      ]);

      if (r1.ok) {
        const d = await r1.json();
        setMetrics(d.metrics);
        setDailyChart(d.dailyChart || []);
        setCategoryChart(d.categoryChart || []);
        setMembershipChart(d.membershipChart || []);
        setMethodChart(d.methodChart || []);
        setTicketStats(d.ticketStats || null);
        setExplanations(d.explanations || {});
      }
      if (r2.ok) setUsersList((await r2.json()).users || []);
      if (r3.ok) setTransfersList((await r3.json()).transfers || []);
      if (r4.ok) setFilesList((await r4.json()).files || []);
      if (r5.ok) setPlansList((await r5.json()).plans || []);
      if (r6.ok) setTransactionsList((await r6.json()).transactions || []);
      if (r7.ok) setTicketsList((await r7.json()).tickets || []);
      if (r8.ok) setReportsList((await r8.json()).reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- 1. USER CRUD ---
  const handleToggleStatus = async (u) => {
    const nextStatus = u.status === 'active' ? 'suspended' : 'active';
    await fetch(`/api/admin/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus })
    });
    fetchAdminData();
    notifyInfo('Status Diubah', `${u.name} sekarang: ${nextStatus}`);
  };

  const handleChangePlan = async (userId, planId) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan_id: planId })
    });
    fetchAdminData();
    notifySuccess('Paket Diubah', `Pengguna di-upgrade ke paket ${planId}`);
  };

  const handleResetPassword = async (u) => {
    const defaultPass = 'reset123';
    await fetch(`/api/admin/users/${u.id}/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ newPassword: defaultPass })
    });
    notifySuccess('Password Direset', `Password ${u.name} direset menjadi: ${defaultPass}`);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Hapus pengguna ini beserta datanya?')) return;
    await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAdminData();
    notifyWarning('Pengguna Dihapus', 'Data pengguna telah dihapus');
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          plan_id: newUserPlan,
          plan_expires_at: newUserPlanExpiresAt || null
        })
      });
      if (res.ok) {
        setIsAddUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserPlanExpiresAt('');
        fetchAdminData();
        notifySuccess('Pengguna Dibuat', 'Akun pengguna baru berhasil ditambahkan');
      } else {
        notifyError('Gagal', 'Email sudah terdaftar');
      }
    } catch (e) {
      notifyError('Error', 'Gagal membuat pengguna');
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editUserObj) return;
    try {
      const res = await fetch(`/api/admin/users/${editUserObj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editUserObj.name,
          email: editUserObj.email,
          role: editUserObj.role,
          plan_id: editUserObj.plan_id,
          plan_expires_at: editUserObj.plan_expires_at,
          status: editUserObj.status
        })
      });
      if (res.ok) {
        setIsEditUserModalOpen(false);
        setEditUserObj(null);
        fetchAdminData();
        notifySuccess('Pengguna Diperbarui', 'Data profil pengguna telah diperbarui');
      } else {
        notifyError('Gagal', 'Gagal memperbarui pengguna');
      }
    } catch (e) {
      notifyError('Error', 'Gagal memperbarui pengguna');
    }
  };

  // --- 2. FILES CRUD ---
  const handleCreateFileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          original_name: newFileName,
          size: Number(newFileSize) || 2048576,
          category: newFileCategory,
          visibility: newFileVisibility
        })
      });
      if (res.ok) {
        setIsAddFileModalOpen(false);
        setNewFileName('');
        fetchAdminData();
        notifySuccess('File Ditambahkan', 'Berkas cloud baru berhasil dibuat oleh admin');
      }
    } catch (e) {
      notifyError('Error', 'Gagal menambahkan file');
    }
  };

  const handleEditFileSubmit = async (e) => {
    e.preventDefault();
    if (!editFileObj) return;
    try {
      const res = await fetch(`/api/admin/files/${editFileObj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          original_name: editFileObj.original_name,
          category: editFileObj.category,
          visibility: editFileObj.visibility
        })
      });
      if (res.ok) {
        setIsEditFileModalOpen(false);
        setEditFileObj(null);
        fetchAdminData();
        notifySuccess('File Diperbarui', 'Metadata berkas berhasil diperbarui');
      }
    } catch (e) {
      notifyError('Error', 'Gagal memperbarui file');
    }
  };

  const handleDeleteFile = async (id) => {
    if (!confirm('Hapus file ini dari cloud?')) return;
    await fetch(`/api/admin/files/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAdminData();
    notifyWarning('File Dihapus', 'File berhasil dihapus dari cloud storage');
  };

  const handleToggleFileLink = async (id) => {
    await fetch(`/api/admin/files/${id}/toggle-link`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    fetchAdminData();
    notifyInfo('Link Berkas', 'Visibilitas tautan berkas diubah');
  };

  const handleDownloadFile = (f) => {
    const fileName = f.original_name || 'admin-download';
    const blob = new Blob([`Simulated content of ${fileName}`], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifySuccess('File Diunduh', `${fileName} berhasil diunduh.`);
  };

  // --- 3. PLANS CRUD ---
  const handleCreatePlanSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: newPlanId,
          name: newPlanName,
          price: Number(newPlanPrice),
          price_label: `$${newPlanPrice}/mo`,
          max_storage_label: newPlanStorage,
          max_upload_label: newPlanUpload
        })
      });
      if (res.ok) {
        setIsAddPlanModalOpen(false);
        setNewPlanId('');
        setNewPlanName('');
        fetchAdminData();
        notifySuccess('Paket Dibuat', 'Paket langganan baru berhasil dibuat');
      } else {
        notifyError('Gagal', 'ID Paket sudah digunakan');
      }
    } catch (e) {
      notifyError('Error', 'Gagal membuat paket');
    }
  };

  const handleEditPlanSubmit = async (e) => {
    e.preventDefault();
    if (!editPlanObj) return;
    try {
      const res = await fetch(`/api/admin/plans/${editPlanObj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editPlanObj.name,
          price: Number(editPlanObj.price),
          price_label: editPlanObj.price_label,
          max_storage_label: editPlanObj.max_storage_label,
          max_upload_label: editPlanObj.max_upload_label
        })
      });
      if (res.ok) {
        setIsEditPlanModalOpen(false);
        setEditPlanObj(null);
        fetchAdminData();
        notifySuccess('Paket Diperbarui', 'Informasi paket berhasil diperbarui');
      }
    } catch (e) {
      notifyError('Error', 'Gagal memperbarui paket');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (['free', 'pro', 'unlimited'].includes(planId)) {
      notifyWarning('Tidak Diizinkan', 'Paket default sistem tidak boleh dihapus.');
      return;
    }
    if (!confirm(`Hapus paket ${planId}?`)) return;
    await fetch(`/api/admin/plans/${planId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAdminData();
    notifyWarning('Paket Dihapus', `Paket ${planId} telah dihapus`);
  };

  // --- 4. TRANSACTIONS CRUD ---
  const handleCreateTxSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_name: newTxUser,
          user_email: newTxEmail,
          plan_id: newTxPlan,
          amount: Number(newTxAmount),
          duration_months: Number(newTxDuration) || 1,
          method: newTxMethod,
          status: newTxStatus
        })
      });
      if (res.ok) {
        setIsAddTxModalOpen(false);
        setNewTxUser('');
        setNewTxEmail('');
        setNewTxDuration(1);
        fetchAdminData();
        notifySuccess('Transaksi Dibuat', 'Catatan transaksi manual berhasil dibuat');
      }
    } catch (e) {
      notifyError('Error', 'Gagal membuat transaksi');
    }
  };

  const handleUpdateTxStatus = async (txId, status) => {
    await fetch(`/api/admin/transactions/${txId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchAdminData();
    notifyInfo('Status Transaksi', `Status transaksi diubah menjadi ${status}`);
  };

  const handleDeleteTx = async (txId) => {
    if (!confirm('Hapus riwayat transaksi ini?')) return;
    await fetch(`/api/admin/transactions/${txId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAdminData();
    notifyWarning('Transaksi Dihapus', 'Catatan transaksi telah dihapus');
  };

  // --- 5. TRANSFERS CRUD ---
  const handleCreateTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sender_device: newTfSender,
          receiver_device: newTfReceiver,
          file_name: newTfFileName,
          total_size: Number(newTfSize),
          total_files: 1,
          status: newTfStatus
        })
      });
      if (res.ok) {
        setIsAddTransferModalOpen(false);
        fetchAdminData();
        notifySuccess('Transfer Dibuat', 'Log sesi transfer baru berhasil ditambahkan');
      }
    } catch (e) {
      notifyError('Error', 'Gagal membuat log transfer');
    }
  };

  const handleUpdateTransferStatus = async (sid, status) => {
    await fetch(`/api/admin/transfers/${sid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchAdminData();
    notifyInfo('Status Transfer', `Status sesi diperbarui menjadi ${status}`);
  };

  const handleDeleteTransfer = async (sid) => {
    if (!confirm('Hapus log sesi transfer ini?')) return;
    await fetch(`/api/admin/transfers/${sid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAdminData();
    notifyWarning('Log Dihapus', 'Sesi transfer telah dihapus');
  };

  const handleClearAllTransfers = async () => {
    if (!confirm('Bersihkan seluruh log transfer di sistem?')) return;
    await fetch('/api/admin/transfers-clear-all', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAdminData();
    notifyWarning('Semua Log Dibersihkan', 'Seluruh riwayat transfer telah dikosongkan');
  };

  // --- 6. TICKETS & REPORTS CRUD ---
  const handleOpenTicket = async (tkt) => {
    setSelectedTicketThread(tkt);
    try {
      const res = await fetch(`/api/admin/tickets/${tkt.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setTicketMessages(d.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminReplySubmit = async (e) => {
    e.preventDefault();
    if ((!adminReplyText.trim() && !adminReplyImage) || !selectedTicketThread) return;

    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicketThread.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: adminReplyText || 'Foto dilampirkan oleh Admin',
          image_url: adminReplyImage
        })
      });

      if (res.ok) {
        setTicketMessages(prev => [
          ...prev,
          {
            id: 'adm-' + Date.now(),
            sender_type: 'admin',
            sender_name: 'Admin Support',
            message: adminReplyText || 'Foto dilampirkan oleh Admin',
            image_url: adminReplyImage,
            created_at: new Date().toISOString()
          }
        ]);
        setAdminReplyText('');
        setAdminReplyImage(null);
        notifySuccess('Balasan Admin Terkirim', 'Pesan & foto terkirim ke pengguna');
        fetchAdminData();
      }
    } catch (e) {
      notifyError('Error', 'Gagal membalas tiket');
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    await fetch(`/api/admin/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchAdminData();
    notifyInfo('Status Tiket', `Tiket diperbarui menjadi: ${status}`);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Hapus tiket bantuan ini beserta seluruh riwayat pesannya?')) return;
    await fetch(`/api/admin/tickets/${ticketId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (selectedTicketThread?.id === ticketId) setSelectedTicketThread(null);
    fetchAdminData();
    notifyWarning('Tiket Dihapus', 'Tiket bantuan telah dihapus');
  };

  const handleUpdateReportStatus = async (repId, status) => {
    await fetch(`/api/admin/reports/${repId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchAdminData();
    notifyInfo('Status Laporan', `Laporan diperbarui menjadi: ${status}`);
  };

  const handleDeleteReport = async (repId) => {
    if (!confirm('Hapus laporan kendala ini?')) return;
    await fetch(`/api/admin/reports/${repId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAdminData();
    notifyWarning('Laporan Dihapus', 'Laporan kendala telah dihapus');
  };

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'users', label: 'Pengguna', icon: Users, count: usersList.length },
    { id: 'tickets', label: 'Tiket & CS', icon: Ticket, count: ticketsList.length },
    { id: 'transfers', label: 'Transfer', icon: SendHorizontal, count: transfersList.length },
    { id: 'files', label: 'File Cloud', icon: HardDrive, count: filesList.length },
    { id: 'plans', label: 'Paket', icon: Crown, count: plansList.length },
    { id: 'tx', label: 'Transaksi', icon: CreditCard, count: transactionsList.length }
  ];

  return (
    <div className={`flex-1 flex flex-col select-none overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Mobile Top Header - Fixed at Top */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (selectedTicketThread) {
                setSelectedTicketThread(null);
              } else {
                onCloseAdmin();
              }
            }}
            className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-sm font-black leading-tight flex items-center gap-1.5">
              <span>{selectedTicketThread ? `Tiket #${selectedTicketThread.id}` : 'Admin Mobile Panel'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">SUPERADMIN DASHBOARD</p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchAdminData();
            notifyInfo('Data Diperbarui', 'Semua metrik dan tiket tersinkron');
          }}
          className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Swipeable Tabs - Fixed Horizontal Bar */}
      {!selectedTicketThread && (
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2 border-b border-slate-200/70 dark:border-slate-800/70 scrollbar-none shrink-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  isActive
                    ? isDark
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? isDark
                        ? 'bg-slate-950/30 text-slate-900'
                        : 'bg-white/25 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT - Dedicated Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 pb-12">
        {/* 1. OVERVIEW: 5 CHARTS WITH COMPREHENSIVE EXPLANATIONS */}
        {activeTab === 'overview' && (
          <div className="space-y-3.5">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total Pengguna', val: metrics?.totalUsers || 0, color: 'text-sky-500' },
                { label: 'Sesi Transfer', val: metrics?.totalTransfers || 0, color: 'text-emerald-500' },
                { label: 'Total File Cloud', val: metrics?.totalFiles || 0, color: 'text-amber-500' },
                { label: 'Pendapatan Simulasi', val: `$${metrics?.simulatedRevenue || 0}`, color: 'text-purple-500' }
              ].map((c, i) => (
                <div key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{c.label}</span>
                  <span className={`text-lg font-black tracking-tight mt-0.5 block ${c.color}`}>{c.val}</span>
                </div>
              ))}
            </div>

            {/* CHART 1: DAILY VOLUME */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <BarChart2 size={15} className="text-sky-500" />
                  <span>Grafik 1: Volume Transfer Harian (7 Hari)</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-500 font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">LIVE METRIC</span>
              </div>

              {/* Bar Chart Visualization with safe bounded tracks */}
              {(() => {
                const maxVal = Math.max(...dailyChart.map(d => Number(d.count) || 0), 5);
                return (
                  <div className="pt-2 pb-1">
                    <div className="h-24 flex items-end justify-between gap-1.5">
                      {dailyChart.map((d, i) => {
                        const count = Number(d.count) || 0;
                        const barPercent = Math.max(8, Math.min(100, Math.round((count / maxVal) * 100)));
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <span className="text-[9px] font-mono font-bold text-sky-500 dark:text-sky-400">
                              {count}
                            </span>
                            <div className="w-full h-14 bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 flex items-end">
                              <div
                                className="w-full bg-gradient-to-t from-sky-500 to-cyan-400 rounded-md transition-all duration-300"
                                style={{ height: `${barPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono tracking-tighter">{d.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Explanatory Analysis Card */}
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-sky-600 dark:text-sky-400 block mb-0.5">Analisis & Penjelasan:</span>
                {explanations?.chart1 || 'Aktivitas transfer harian memuncak saat pengiriman video dan arsip besar via Wi-Fi Direct dan QR code.'}
              </div>
            </div>

            {/* CHART 2: FILE CATEGORY STORAGE CONSUMPTION */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <PieChart size={15} className="text-amber-500" />
                  <span>Grafik 2: Distribusi Tipe File & Storage</span>
                </span>
                <span className="text-[9px] font-mono text-amber-500 font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">CAPACITY</span>
              </div>

              {/* Dynamic Segmented Bar */}
              {(() => {
                const totalBytes = categoryChart.reduce((acc, c) => acc + (Number(c.sizeMB) || 0), 0) || 1;
                return (
                  <div className="space-y-2.5">
                    <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                      {categoryChart.map((c) => {
                        const pct = Math.max(3, Math.round(((Number(c.sizeMB) || 0) / totalBytes) * 100));
                        return (
                          <div
                            key={c.key}
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: c.color }}
                            title={`${c.label}: ${pct}%`}
                          ></div>
                        );
                      })}
                    </div>

                    {/* Category Legend Grid */}
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {categoryChart.map((c) => {
                        return (
                          <div key={c.key} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[10px] space-y-0.5">
                            <div className="flex items-center gap-1 truncate">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
                              <span className="font-bold truncate text-slate-700 dark:text-slate-300">{c.label}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400 font-mono text-[9px]">
                              <span>{c.count} file</span>
                              <span className="font-semibold text-slate-600 dark:text-slate-300">{c.sizeMB} MB</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Explanatory Analysis Card */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Analisis & Penjelasan:</span>
                {explanations?.chart2 || 'Penyimpanan Boardsave didominasi oleh video 4K dan foto beresolusi tinggi, memicu pengguna untuk upgrade ke paket Pro 1TB.'}
              </div>
            </div>

            {/* CHART 3: MEMBERSHIP & REVENUE GROWTH */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-emerald-500" />
                  <span>Grafik 3: Pertumbuhan Membership & Pendapatan</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-500 font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">REVENUE</span>
              </div>

              <div className="space-y-2">
                {membershipChart.map((m) => (
                  <div key={m.tier} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}></span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{m.tier}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px] font-mono">{m.users} Pengguna ({m.share})</span>
                        <span className="font-mono font-bold text-emerald-500">${m.revenue}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: m.share, backgroundColor: m.color }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanatory Analysis Card */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Analisis & Penjelasan:</span>
                {explanations?.chart3 || 'Model freemium SHAREit menunjukkan konversi yang kuat saat pengguna mencapai limit 10GB cloud Free.'}
              </div>
            </div>

            {/* CHART 4: 5 TRANSFER METHODS & SLA RELIABILITY */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <SendHorizontal size={15} className="text-indigo-500" />
                  <span>Grafik 4: Performa & Rasio 5 Metode Transfer</span>
                </span>
                <span className="text-[9px] font-mono text-indigo-500 font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">99.4% SLA</span>
              </div>

              {/* Multi-segment stacked bar */}
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                {(methodChart.length ? methodChart : [
                  { id: 'qr', percent: 38, color: '#38BDF8' },
                  { id: 'pin', percent: 29, color: '#6366F1' },
                  { id: 'wifi', percent: 18, color: '#10B981' },
                  { id: 'cloud', percent: 10, color: '#F59E0B' },
                  { id: 'radar', percent: 5, color: '#EC4899' }
                ]).map((m) => (
                  <div
                    key={m.id}
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${m.percent}%`, backgroundColor: m.color }}
                  ></div>
                ))}
              </div>

              {/* 5 Methods Detailed Progress List */}
              <div className="space-y-2">
                {(methodChart.length ? methodChart : [
                  { id: 'qr', name: 'QR Code Instant', count: 19, share: '38%', percent: 38, successRate: '99.8%', color: '#38BDF8', badge: 'Tercepat' },
                  { id: 'pin', name: 'Kode 6-Digit Pairing', count: 14, share: '29%', percent: 29, successRate: '99.5%', color: '#6366F1', badge: 'Terfavorit' },
                  { id: 'wifi', name: 'Wi-Fi Direct P2P', count: 9, share: '18%', percent: 18, successRate: '98.9%', color: '#10B981', badge: 'Offline' },
                  { id: 'cloud', name: 'Cloud Relay Boardsave', count: 5, share: '10%', percent: 10, successRate: '99.2%', color: '#F59E0B', badge: 'Sinkron' },
                  { id: 'radar', name: 'Nearby Radar Signal', count: 3, share: '5%', percent: 5, successRate: '98.4%', color: '#EC4899', badge: 'Radar' }
                ]).map((item) => (
                  <div key={item.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span className="text-[8px] px-1 py-0.2 rounded font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {item.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px] font-mono">{item.count} sesi ({item.share})</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-500">{item.successRate}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanatory Analysis Card */}
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Analisis & Penjelasan:</span>
                {explanations?.chart4 || 'Rasio Metode Transfer membuktikan QR Code Instant & Kode 6-Digit menjadi metode paling favorit (total 67%), dengan tingkat keberhasilan transmisi data rata-rata mencapai 99.4% tanpa kegagalan paket.'}
              </div>
            </div>

            {/* CHART 5: CS & SUPPORT TICKETS RESOLUTION */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Ticket size={15} className="text-purple-500" />
                  <span>Grafik 5: Metrik Layanan CS & Resolusi Kendala</span>
                </span>
                <span className="text-[9px] font-mono text-purple-500 font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">SLA &lt; 15M</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Penyelesaian</span>
                  <span className="text-sm font-black text-purple-500 font-mono mt-0.5 block">{ticketStats?.resolutionRate || '96.4%'}</span>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Waktu Respon</span>
                  <span className="text-sm font-black text-sky-500 font-mono mt-0.5 block">{ticketStats?.avgResponseTime || '8.2 Menit'}</span>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Kepuasan</span>
                  <span className="text-sm font-black text-emerald-500 font-mono mt-0.5 block">{ticketStats?.satisfactionRate || '4.9/5.0'}</span>
                </div>
              </div>

              {/* SLA Progress */}
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Tingkat Penyelesaian Tiket</span>
                  <span className="font-mono text-purple-500 font-bold text-xs">{ticketStats?.resolutionRate || '96.4%'}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: ticketStats?.resolutionRate || '96.4%' }}></div>
                </div>
              </div>

              {/* Explanatory Analysis Card */}
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-purple-600 dark:text-purple-400 block mb-0.5">Analisis & Penjelasan:</span>
                {explanations?.chart5 || 'Efisiensi Layanan Pelanggan mencatat SLA respon tercepat 8.2 menit dengan tingkat penyelesaian tiket 96.4% dan kepuasan pengguna 4.9/5.'}
              </div>
            </div>
          </div>
        )}

        {/* 2. USERS (Full CRUD: Create, Read, Update, Delete) */}
        {activeTab === 'users' && (
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Plus size={14} />
                <span>Tambah</span>
              </button>
            </div>

            <div className="space-y-2">
              {usersList
                .filter(u => !userQuery || u.name?.toLowerCase().includes(userQuery.toLowerCase()) || u.email?.toLowerCase().includes(userQuery.toLowerCase()))
                .map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=florian'} className="w-8 h-8 rounded-full bg-slate-100" />
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate font-mono">{u.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.status}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Plan:</span>
                        <select
                          value={u.plan_id}
                          onChange={(e) => handleChangePlan(u.id, e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 text-xs rounded-lg px-2 py-0.5 font-bold uppercase"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="unlimited">Unlimited</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditUserObj({ ...u });
                            setIsEditUserModalOpen(true);
                          }}
                          className="text-[10px] font-bold text-sky-500 hover:underline flex items-center gap-0.5"
                          title="Edit Pengguna"
                        >
                          <Edit2 size={11} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-0.5"
                          title="Reset Password"
                        >
                          <Key size={11} />
                          <span>Reset PW</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Plan Expiry Indicator */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar size={11} className="text-sky-500" />
                        <span>Masa Berlaku Plan:</span>
                      </span>
                      <span className={`font-mono font-semibold ${
                        u.plan_id === 'free'
                          ? 'text-slate-400'
                          : u.plan_expires_at && new Date(u.plan_expires_at) < new Date()
                          ? 'text-red-500 font-bold'
                          : 'text-emerald-500 font-bold'
                      }`}>
                        {u.plan_id === 'free'
                          ? 'Selamanya'
                          : u.plan_expires_at
                          ? `${new Date(u.plan_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}${new Date(u.plan_expires_at) < new Date() ? ' (Kedaluwarsa)' : ''}`
                          : '30 Hari'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3. TIKET BANTUAN & CS (CRUD & Photo Attachments) */}
        {activeTab === 'tickets' && !selectedTicketThread && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pusat Pesan Tiket ({ticketsList.length})
              </span>
            </div>

            <div className="space-y-2">
              {ticketsList.map((tkt) => (
                <div
                  key={tkt.id}
                  onClick={() => handleOpenTicket(tkt)}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-sky-400 space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sky-500">#{tkt.id}</span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={tkt.status}
                        onChange={(e) => handleUpdateTicketStatus(tkt.id, e.target.value)}
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          tkt.status === 'open' ? 'bg-sky-100 text-sky-700' : tkt.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTicket(tkt.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-lg"
                        title="Hapus Tiket"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold truncate">{tkt.subject}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Dari: {tkt.user_name} ({tkt.category})</span>
                    <span className="text-sky-500 font-bold flex items-center gap-1">
                      <span>Buka Chat</span>
                      <MessageSquare size={11} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Laporan Pengguna Section with Photo Preview */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Laporan Masalah / Bug ({reportsList.length})
              </span>
              {reportsList.map((rep) => (
                <div key={rep.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-500">{rep.report_type}</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={rep.status}
                        onChange={(e) => handleUpdateReportStatus(rep.id, e.target.value)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 uppercase"
                      >
                        <option value="pending">Pending</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => handleDeleteReport(rep.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Hapus Laporan"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{rep.description}</p>

                  {/* Screenshot Thumbnail in Report */}
                  {rep.image_url && (
                    <div
                      className="relative rounded-xl overflow-hidden border border-sky-400/60 max-w-xs cursor-pointer group"
                      onClick={() => setAdminZoomImage(rep.image_url)}
                    >
                      <img src={rep.image_url} alt="Screenshot Laporan" className="h-24 w-full object-cover rounded-xl group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye size={16} className="text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>Pelapor: {rep.user_name}</span>
                    <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TICKET CONVERSATION (Admin Side with Photo Reply) */}
        {selectedTicketThread && (
          <div className="space-y-3 flex-1 flex flex-col">
            <div className={`p-3 rounded-2xl text-xs flex items-center justify-between border ${
              isDark ? 'bg-slate-900 text-white border-slate-800' : 'bg-sky-50 text-slate-900 border-sky-200'
            }`}>
              <div>
                <p className="font-bold truncate">{selectedTicketThread.subject}</p>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Pengguna: {selectedTicketThread.user_name} ({selectedTicketThread.user_email})
                </p>
              </div>
              <button
                onClick={() => setSelectedTicketThread(null)}
                className={`text-xs font-bold ${isDark ? 'text-sky-400' : 'text-sky-600'} hover:underline`}
              >
                Tutup
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto p-1">
              {ticketMessages.map((msg, i) => {
                const isAdmin = msg.sender_type === 'admin';
                return (
                  <div key={i} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} text-xs space-y-1`}>
                    <div className={`p-2.5 rounded-2xl max-w-[85%] space-y-1.5 ${
                      isAdmin ? 'bg-sky-500 text-white rounded-tr-xs' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
                    }`}>
                      <span className="text-[9px] font-bold block opacity-75">{msg.sender_name}</span>
                      {msg.message && msg.message !== 'Foto dilampirkan' && <p>{msg.message}</p>}
                      {msg.image_url && (
                        <div
                          className="relative rounded-xl overflow-hidden border border-white/20 cursor-pointer group"
                          onClick={() => setAdminZoomImage(msg.image_url)}
                        >
                          <img src={msg.image_url} alt="Lampiran" className="max-h-36 w-full object-cover rounded-xl group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Photo Attachment Preview */}
            {adminReplyImage && (
              <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-between border border-sky-400">
                <div className="flex items-center gap-2">
                  <img src={adminReplyImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                  <span className="text-[11px] text-slate-500">Foto terlampir siap dikirim</span>
                </div>
                <button onClick={() => setAdminReplyImage(null)} className="p-1 text-slate-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            )}

            <form onSubmit={handleAdminReplySubmit} className="flex items-center gap-2 pt-1">
              <input
                type="file"
                accept="image/*"
                id="admin-reply-img"
                className="hidden"
                onChange={handlePickAdminImage}
              />
              <label
                htmlFor="admin-reply-img"
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer shrink-0"
                title="Lampirkan Foto"
              >
                <ImageIcon size={15} />
              </label>
              <input
                type="text"
                placeholder="Balas atas nama Admin Support..."
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
              />
              <button
                type="submit"
                disabled={!adminReplyText.trim() && !adminReplyImage}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold active:scale-95 shrink-0"
              >
                Balas
              </button>
            </form>
          </div>
        )}

        {/* 4. TRANSFERS (Full CRUD: Create, Read, Update, Delete, Clear All) */}
        {activeTab === 'transfers' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Log Sesi Transfer ({transfersList.length})
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsAddTransferModalOpen(true)}
                  className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Plus size={13} />
                  <span>Tambah</span>
                </button>
                {transfersList.length > 0 && (
                  <button
                    onClick={handleClearAllTransfers}
                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95"
                  >
                    <Trash2 size={13} />
                    <span>Bersihkan</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {transfersList.map((t) => (
                <div key={t.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-500">{t.id}</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateTransferStatus(t.id, e.target.value)}
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : t.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        <option value="completed">Completed</option>
                        <option value="waiting">Waiting</option>
                        <option value="transferring">Transferring</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTransfer(t.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Hapus Log"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold">{t.sender_device} → {t.receiver_device || 'Receiver'}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{t.total_files} file ({formatBytes(t.total_size)})</span>
                    <span>Kode: {t.pairing_code || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FILES (Full CRUD: Create, Read, Update, Download, Delete) */}
        {activeTab === 'files' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Penyimpanan Cloud ({filesList.length})
              </span>
              <button
                onClick={() => setIsAddFileModalOpen(true)}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Plus size={13} />
                <span>Tambah File</span>
              </button>
            </div>

            <div className="space-y-2">
              {filesList.map((f) => (
                <div key={f.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-bold truncate max-w-[180px]">{f.original_name}</p>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800">{f.visibility}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{formatBytes(f.size)} • {f.category} • {f.user_name || 'Florian'}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDownloadFile(f)}
                        className="p-1 text-slate-400 hover:text-sky-500"
                        title="Unduh Berkas"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={() => handleToggleFileLink(f.id)}
                        className="p-1 text-slate-400 hover:text-emerald-500"
                        title="Ganti Visibilitas Tautan"
                      >
                        <ExternalLink size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setEditFileObj({ ...f });
                          setIsEditFileModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-sky-500"
                        title="Edit File"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(f.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Hapus File"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. PLANS (Full CRUD: Create, Read, Update, Delete) */}
        {activeTab === 'plans' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Paket Langganan ({plansList.length})
              </span>
              <button
                onClick={() => setIsAddPlanModalOpen(true)}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Plus size={13} />
                <span>Tambah Paket</span>
              </button>
            </div>

            <div className="space-y-2">
              {plansList.map((p) => (
                <div key={p.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-white">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-500">{p.price_label}</span>
                      <button
                        onClick={() => {
                          setEditPlanObj({ ...p });
                          setIsEditPlanModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-sky-500"
                        title="Edit Paket"
                      >
                        <Edit2 size={13} />
                      </button>
                      {!['free', 'pro', 'unlimited'].includes(p.id) && (
                        <button
                          onClick={() => handleDeletePlan(p.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                          title="Hapus Paket"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">Storage: {p.max_storage_label} • Upload: {p.max_upload_label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. TRANSACTIONS (Full CRUD: Create, Read, Update Status, Delete) */}
        {activeTab === 'tx' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Catatan Transaksi ({transactionsList.length})
              </span>
              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Plus size={13} />
                <span>Tambah Tx</span>
              </button>
            </div>

            <div className="space-y-2">
              {transactionsList.map((tx) => (
                <div key={tx.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-500">{tx.id}</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={tx.status}
                        onChange={(e) => handleUpdateTxStatus(tx.id, e.target.value)}
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : tx.status === 'refunded' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTx(tx.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold">{tx.user_name} ({tx.method})</span>
                    <span className="font-mono font-bold text-emerald-500">${tx.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Paket: {tx.plan_id?.toUpperCase()} • {tx.duration_months || 1} Bulan</span>
                    <span className="font-mono text-sky-500 font-semibold">
                      {tx.expires_at ? `Exp: ${new Date(tx.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 truncate">{tx.user_email}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ALL CRUD MODALS --- */}

      {/* 1. Modal Add User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Tambah Pengguna Baru</h3>
            <form onSubmit={handleCreateUserSubmit} className="space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Nama Lengkap"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={newUserPlan}
                  onChange={(e) => setNewUserPlan(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              {newUserPlan !== 'free' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Masa Aktif Berakhir (Opsional)
                  </label>
                  <input
                    type="date"
                    value={newUserPlanExpiresAt ? newUserPlanExpiresAt.slice(0, 10) : ''}
                    onChange={(e) => {
                      setNewUserPlanExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : '');
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <div className="flex gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 30);
                        setNewUserPlanExpiresAt(d.toISOString());
                      }}
                      className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-semibold"
                    >
                      +30 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setFullYear(d.getFullYear() + 1);
                        setNewUserPlanExpiresAt(d.toISOString());
                      }}
                      className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-semibold"
                    >
                      +1 Tahun
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Edit User */}
      {isEditUserModalOpen && editUserObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Edit Profil Pengguna</h3>
            <form onSubmit={handleEditUserSubmit} className="space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Nama Lengkap"
                value={editUserObj.name}
                onChange={(e) => setEditUserObj({ ...editUserObj, name: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={editUserObj.email}
                onChange={(e) => setEditUserObj({ ...editUserObj, email: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <select
                  value={editUserObj.role}
                  onChange={(e) => setEditUserObj({ ...editUserObj, role: e.target.value })}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={editUserObj.plan_id}
                  onChange={(e) => setEditUserObj({ ...editUserObj, plan_id: e.target.value })}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Kapan Plan Berakhir
                </label>
                <input
                  type="date"
                  value={editUserObj.plan_expires_at ? editUserObj.plan_expires_at.slice(0, 10) : ''}
                  onChange={(e) => {
                    const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                    setEditUserObj({ ...editUserObj, plan_expires_at: val });
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                />
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      setEditUserObj({ ...editUserObj, plan_expires_at: d.toISOString() });
                    }}
                    className="flex-1 py-1 px-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-semibold"
                  >
                    +30 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setEditUserObj({ ...editUserObj, plan_expires_at: d.toISOString() });
                    }}
                    className="flex-1 py-1 px-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-semibold"
                  >
                    +1 Tahun
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditUserObj({ ...editUserObj, plan_expires_at: null });
                    }}
                    className="flex-1 py-1 px-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl"
                >
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Add File */}
      {isAddFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Tambah Berkas Cloud</h3>
            <form onSubmit={handleCreateFileSubmit} className="space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Nama File (misal: Proposal_2026.pdf)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <select
                  value={newFileCategory}
                  onChange={(e) => setNewFileCategory(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="document">Dokumen</option>
                  <option value="video">Video</option>
                  <option value="image">Foto</option>
                  <option value="music">Musik</option>
                  <option value="app">Aplikasi</option>
                  <option value="archive">ZIP</option>
                </select>
                <select
                  value={newFileVisibility}
                  onChange={(e) => setNewFileVisibility(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="Ukuran File (bytes)"
                value={newFileSize}
                onChange={(e) => setNewFileSize(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFileModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Edit File */}
      {isEditFileModalOpen && editFileObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Edit Berkas Cloud</h3>
            <form onSubmit={handleEditFileSubmit} className="space-y-2 text-xs">
              <input
                type="text"
                required
                value={editFileObj.original_name}
                onChange={(e) => setEditFileObj({ ...editFileObj, original_name: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <select
                  value={editFileObj.category}
                  onChange={(e) => setEditFileObj({ ...editFileObj, category: e.target.value })}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="document">Dokumen</option>
                  <option value="video">Video</option>
                  <option value="image">Foto</option>
                  <option value="music">Musik</option>
                  <option value="app">Aplikasi</option>
                  <option value="archive">ZIP</option>
                </select>
                <select
                  value={editFileObj.visibility}
                  onChange={(e) => setEditFileObj({ ...editFileObj, visibility: e.target.value })}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditFileModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl"
                >
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal Add Plan */}
      {isAddPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Tambah Paket Langganan</h3>
            <form onSubmit={handleCreatePlanSubmit} className="space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="ID Paket (misal: ultra)"
                value={newPlanId}
                onChange={(e) => setNewPlanId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                placeholder="Nama Paket (misal: Ultra Business)"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="Harga ($)"
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Storage (e.g. 500 GB)"
                  value={newPlanStorage}
                  onChange={(e) => setNewPlanStorage(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlanModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl"
                >
                  Buat Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Edit Plan */}
      {isEditPlanModalOpen && editPlanObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Edit Paket Langganan</h3>
            <form onSubmit={handleEditPlanSubmit} className="space-y-2 text-xs">
              <input
                type="text"
                required
                value={editPlanObj.name}
                onChange={(e) => setEditPlanObj({ ...editPlanObj, name: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  value={editPlanObj.price}
                  onChange={(e) => setEditPlanObj({ ...editPlanObj, price: e.target.value, price_label: `$${e.target.value}/mo` })}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={editPlanObj.max_storage_label}
                  onChange={(e) => setEditPlanObj({ ...editPlanObj, max_storage_label: e.target.value })}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditPlanModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl"
                >
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal Add Transaction */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Catat Transaksi Manual</h3>
            <form onSubmit={handleCreateTxSubmit} className="space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Nama Pelanggan"
                value={newTxUser}
                onChange={(e) => setNewTxUser(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <input
                type="email"
                required
                placeholder="Email Pelanggan"
                value={newTxEmail}
                onChange={(e) => setNewTxEmail(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <select
                  value={newTxPlan}
                  onChange={(e) => {
                    const p = e.target.value;
                    setNewTxPlan(p);
                    const basePrice = p === 'unlimited' ? 15 : 8;
                    setNewTxAmount(basePrice * (Number(newTxDuration) || 1));
                  }}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="pro">Pro ($8/bln)</option>
                  <option value="unlimited">Unlimited ($15/bln)</option>
                </select>
                <select
                  value={newTxDuration}
                  onChange={(e) => {
                    const dur = Number(e.target.value);
                    setNewTxDuration(dur);
                    const basePrice = newTxPlan === 'unlimited' ? 15 : 8;
                    setNewTxAmount(basePrice * dur);
                  }}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value={1}>1 Bulan</option>
                  <option value={3}>3 Bulan</option>
                  <option value={6}>6 Bulan</option>
                  <option value={12}>12 Bulan (1 Thn)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <select
                  value={newTxMethod}
                  onChange={(e) => setNewTxMethod(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="QRIS Instant">QRIS Instant</option>
                  <option value="BCA Virtual Account">BCA Virtual Account</option>
                  <option value="Mandiri Virtual Account">Mandiri Virtual Account</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
                <input
                  type="number"
                  required
                  placeholder="Jumlah ($)"
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="w-24 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Expiry preview */}
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock size={12} className="text-amber-500" />
                  Masa Aktif Berakhir:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {(() => {
                    const exp = new Date();
                    exp.setMonth(exp.getMonth() + (Number(newTxDuration) || 1));
                    return exp.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                  })()}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal Add Transfer Session */}
      {isAddTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Catat Log Sesi Transfer</h3>
            <form onSubmit={handleCreateTransferSubmit} className="space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Perangkat Pengirim"
                value={newTfSender}
                onChange={(e) => setNewTfSender(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                placeholder="Perangkat Penerima"
                value={newTfReceiver}
                onChange={(e) => setNewTfReceiver(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                placeholder="Nama Berkas"
                value={newTfFileName}
                onChange={(e) => setNewTfFileName(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ukuran (bytes)"
                  value={newTfSize}
                  onChange={(e) => setNewTfSize(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
                <select
                  value={newTfStatus}
                  onChange={(e) => setNewTfStatus(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="completed">Completed</option>
                  <option value="waiting">Waiting</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTransferModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-white font-bold rounded-xl"
                >
                  Simpan Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Fullscreen Zoom Image Modal */}
      {adminZoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setAdminZoomImage(null)}
        >
          <div className="relative max-w-sm w-full max-h-[85vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAdminZoomImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <X size={18} />
            </button>
            <img
              src={adminZoomImage}
              alt="Bukti Foto Penuh"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
            />
          </div>
        </div>
      )}
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
