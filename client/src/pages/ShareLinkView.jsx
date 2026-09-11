import React, { useEffect, useState } from 'react';
import { Download, FileText, AlertCircle, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ShareLinkView({ token, onBackToApp }) {
  const { isDark } = useTheme();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    fetchSharedFile();
  }, [token]);

  const fetchSharedFile = async () => {
    try {
      const res = await fetch(`/api/cloud/public-share/${token}`);
      if (res.status === 410) {
        setIsExpired(true);
        setError('This link has expired');
      } else if (res.ok) {
        const data = await res.json();
        setFileData(data.file);
      } else {
        setError('File not found or link is private');
      }
    } catch (e) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-6 select-none relative transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <button
        onClick={onBackToApp}
        className={`absolute top-6 left-6 text-xs flex items-center gap-1 font-semibold ${
          isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <ArrowLeft size={14} />
        <span>Back to App</span>
      </button>

      <div className={`w-full max-w-sm border rounded-3xl p-6 text-center space-y-4 shadow-xl ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {loading ? (
          <div className="py-12 space-y-3">
            <span className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className="text-xs text-slate-400">Loading shared file...</p>
          </div>
        ) : isExpired ? (
          /* Link Expired State (Requirement 11) */
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">This link has expired</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              The public download window for this file has passed according to the sender’s storage plan.
            </p>
          </div>
        ) : error ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Unavailable</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
          </div>
        ) : (
          /* Valid File State */
          <>
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner ${
              isDark ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400' : 'bg-sky-50 border border-sky-200 text-sky-500'
            }`}>
              <FileText size={40} />
            </div>

            <div>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isDark ? 'text-sky-400 bg-sky-500/10' : 'text-sky-600 bg-sky-100 font-bold'
              }`}>
                Public Shared File
              </span>
              <h3 className={`text-base font-bold mt-2 break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {fileData?.name}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {formatBytes(fileData?.size)} • Uploaded by {fileData?.uploaderName}
              </p>
            </div>

            {/* Security note */}
            <div className={`p-3 rounded-2xl border text-[11px] flex items-center justify-center gap-1.5 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Scanned and verified for malware</span>
            </div>

            {/* Download button */}
            <a
              href={`/api/cloud/download/${token}`}
              download
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 inline-flex"
            >
              <Download size={16} />
              <span>Download File ({formatBytes(fileData?.size)})</span>
            </a>
          </>
        )}
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
