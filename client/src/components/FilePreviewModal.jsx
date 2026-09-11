import React, { useState } from 'react';
import { X, Download, Share2, FileText, Trash2, Calendar, HardDrive, Check, Copy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function FilePreviewModal({ isOpen, onClose, file, onShare, onDelete }) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !file) return null;

  const handleCopyLink = () => {
    if (file.share_token) {
      const url = `${window.location.origin}/share/${file.share_token}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border relative transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <X size={18} />
        </button>

        {/* File Visual */}
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-sky-500 shadow-inner border ${
          isDark ? 'bg-sky-950/60 border-sky-800/80' : 'bg-sky-50 border-sky-100'
        }`}>
          <FileText size={38} />
        </div>

        <h3 className={`text-base font-black text-center break-words px-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {file.original_name || file.name}
        </h3>
        <p className="text-xs text-slate-400 text-center mt-1">
          {formatBytes(file.size)} • {file.category || 'File'}
        </p>

        {/* File Metadata */}
        <div className={`rounded-2xl p-3.5 my-4 space-y-2 text-xs border ${
          isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-600'
        }`}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <HardDrive size={13} />
              <span>Storage</span>
            </span>
            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Boardsave Cloud</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar size={13} />
              <span>Uploaded</span>
            </span>
            <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {file.created_at ? new Date(file.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
            </span>
          </div>

          {file.share_token && (
            <div className={`flex items-center justify-between pt-2 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <span className="text-slate-400">Visibility</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                file.visibility === 'public'
                  ? isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700'
                  : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
              }`}>
                {file.visibility === 'public' ? 'Public Link Active' : 'Private'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {file.share_token && (
            <button
              onClick={handleCopyLink}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isDark
                  ? 'bg-sky-950/40 hover:bg-sky-900/50 text-sky-400 border-sky-800/80'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'
              }`}
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Share Link Copied!' : 'Copy Share Link'}</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                const downloadUrl = file.share_token
                  ? `/api/cloud/download/${file.share_token}`
                  : '#';
                window.open(downloadUrl, '_blank');
              }}
              className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/25 active:scale-95 transition-all"
            >
              <Download size={14} />
              <span>Download</span>
            </button>

            {onDelete && (
              <button
                onClick={() => {
                  onDelete(file);
                  onClose();
                }}
                className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-red-950/40 hover:bg-red-900/50 text-red-400 border-red-900/60'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                }`}
                title="Delete File"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
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
