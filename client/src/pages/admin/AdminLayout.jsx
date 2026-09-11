import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, SendHorizontal, HardDrive, Crown, CreditCard, ArrowLeft, RefreshCw, Check, X, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ onCloseAdmin }) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'transfers' | 'files' | 'plans' | 'transactions'

  // Data states
  const [metrics, setMetrics] = useState(null);
  const [dailyChart, setDailyChart] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [transfersList, setTransfersList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resOverview, resUsers, resTransfers, resFiles, resTx, resPlans] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/transfers', { headers }),
        fetch('/api/admin/files', { headers }),
        fetch('/api/admin/transactions', { headers }),
        fetch('/api/plans')
      ]);

      if (resOverview.ok) {
        const d = await resOverview.json();
        setMetrics(d.metrics);
        setDailyChart(d.dailyChart || []);
      }
      if (resUsers.ok) {
        const d = await resUsers.json();
        setUsersList(d.users || []);
      }
      if (resTransfers.ok) {
        const d = await resTransfers.json();
        setTransfersList(d.transfers || []);
      }
      if (resFiles.ok) {
        const d = await resFiles.json();
        setFilesList(d.files || []);
      }
      if (resTx.ok) {
        const d = await resTx.json();
        setTransactionsList(d.transactions || []);
      }
      if (resPlans.ok) {
        const d = await resPlans.json();
        setPlansList(d.plans || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchAllAdminData();
  };

  const handleChangeUserPlan = async (userId, planId) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ plan_id: planId })
    });
    if (res.ok) fetchAllAdminData();
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchAllAdminData();
  };

  // File Actions
  const handleDeleteFile = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    const res = await fetch(`/api/admin/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchAllAdminData();
  };

  const handleToggleShareLink = async (fileId) => {
    const res = await fetch(`/api/admin/files/${fileId}/toggle-link`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchAllAdminData();
  };

  // Transaction Status
  const handleUpdateTxStatus = async (txId, newStatus) => {
    const res = await fetch(`/api/admin/transactions/${txId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchAllAdminData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, count: usersList.length },
    { id: 'transfers', label: 'Transfers', icon: SendHorizontal, count: transfersList.length },
    { id: 'files', label: 'Files', icon: HardDrive, count: filesList.length },
    { id: 'plans', label: 'Plans', icon: Crown },
    { id: 'transactions', label: 'Payments', icon: CreditCard, count: transactionsList.length }
  ];

  return (
    <div className="w-full text-slate-100 flex flex-col space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseAdmin}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Return to Mobile App"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Admin Control Panel
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                LIVE RELAY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Overview, user roles, transfer monitoring, and transaction simulation
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-slate-900 text-sky-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Users', value: metrics?.totalUsers || 0, color: 'text-sky-400' },
              { label: 'Transfers', value: metrics?.totalTransfers || 0, color: 'text-emerald-400' },
              { label: 'Cloud Files', value: metrics?.totalFiles || 0, color: 'text-amber-400' },
              { label: 'Storage Used', value: formatBytes(metrics?.storageUsedBytes || 0), color: 'text-indigo-400' },
              { label: 'Premium Users', value: metrics?.premiumUsers || 0, color: 'text-purple-400' },
              { label: 'Simulated Rev', value: `$${metrics?.simulatedRevenue || 0}`, color: 'text-rose-400' }
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">{stat.label}</span>
                <span className={`text-xl font-extrabold tracking-tight mt-1 block ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Daily Transfer Chart */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Daily Transfer Sessions (Last 7 Days)
            </h3>
            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {dailyChart.map((d, i) => {
                const maxCount = Math.max(1, ...dailyChart.map(x => x.count));
                const barHeight = Math.max(12, Math.round((d.count / maxCount) * 120));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-sky-400 font-bold">{d.count}</span>
                    <div
                      className="w-full max-w-[40px] bg-gradient-to-t from-sky-600 to-cyan-400 rounded-xl transition-all"
                      style={{ height: `${barHeight}px` }}
                    ></div>
                    <span className="text-[10px] text-slate-400">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 w-full max-w-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Device</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList
                  .filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <img src={u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=florian'} className="w-7 h-7 rounded-full bg-slate-800" />
                          <div>
                            <span className="block font-bold">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono uppercase text-[11px] text-slate-400">{u.role}</td>
                      <td className="p-3">
                        <select
                          value={u.plan_id}
                          onChange={(e) => handleChangeUserPlan(u.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="unlimited">Unlimited</option>
                        </select>
                      </td>
                      <td className="p-3 text-slate-400">{u.device_name || 'My Device'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            u.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFER MONITORING */}
      {activeTab === 'transfers' && (
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Session ID</th>
                <th className="p-3">Sender Device</th>
                <th className="p-3">Receiver Device</th>
                <th className="p-3">Files & Size</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transfersList.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/50">
                  <td className="p-3 font-mono text-sky-400 font-bold">{t.id}</td>
                  <td className="p-3 font-semibold text-slate-200">{t.sender_device}</td>
                  <td className="p-3 text-slate-300">{t.receiver_device || 'Waiting for receiver...'}</td>
                  <td className="p-3 text-slate-300">
                    {t.total_files} files • {formatBytes(t.total_size)}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : t.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: FILE MANAGEMENT */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Category & Size</th>
                  <th className="p-3">Share Link</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filesList.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-slate-200">{f.original_name}</td>
                    <td className="p-3 text-slate-400">{f.user_name || f.user_email || 'Florian'}</td>
                    <td className="p-3 text-slate-300">
                      {f.category} • {formatBytes(f.size)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleShareLink(f.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          f.visibility === 'public'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {f.visibility}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteFile(f.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete File"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PLAN MANAGEMENT */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plansList.map((plan) => (
            <div key={plan.id} className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-white">{plan.name}</h4>
                <span className="text-sm font-bold text-sky-400">{plan.price_label}</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Storage: {plan.max_storage_label}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Upload Limit: {plan.max_upload_label}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Link Expiry: {plan.link_expiry_days === -1 ? 'Never' : `${plan.link_expiry_days} Days`}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Features: {(plan.features || []).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: TRANSACTIONS SIMULATION */}
      {activeTab === 'transactions' && (
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">TX ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactionsList.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/50">
                  <td className="p-3 font-mono font-bold text-sky-400">{tx.id}</td>
                  <td className="p-3 text-slate-200">
                    <span className="font-bold block">{tx.user_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{tx.user_email}</span>
                  </td>
                  <td className="p-3 font-bold uppercase text-slate-300">{tx.plan_id}</td>
                  <td className="p-3 font-mono font-extrabold text-emerald-400">${tx.amount}</td>
                  <td className="p-3 text-slate-400">{tx.method}</td>
                  <td className="p-3">
                    <select
                      value={tx.status}
                      onChange={(e) => handleUpdateTxStatus(tx.id, e.target.value)}
                      className={`text-xs rounded-lg px-2 py-1 font-bold ${
                        tx.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tx.status === 'failed'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <option value="pending">pending</option>
                      <option value="success">success</option>
                      <option value="failed">failed</option>
                    </select>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
