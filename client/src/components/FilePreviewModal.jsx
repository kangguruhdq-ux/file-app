import React from 'react';
import { X, Download, Share2, FileText, Trash2, Calendar, HardDrive, Check, Copy } from 'lucide-react';

export default function FilePreviewModal({ isOpen, onClose, file, onShare, onDelete }) {
  const [copied, setCopied] = React.useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        {/* File Visual */}
        <div className="w-20 h-20 rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-center mx-auto mb-4 text-sky-500 shadow-inner">
          <FileText size={38} />
        </div>

        <h3 className="text-base font-bold text-slate-900 text-center break-words px-2">
          {file.original_name || file.name}
        </h3>
        <p className="text-xs text-slate-400 text-center mt-1">
          {formatBytes(file.size)} • {file.category || 'File'}
        </p>

        {/* File Metadata */}
        <div className="bg-slate-50 rounded-2xl p-3 my-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <HardDrive size={13} />
              <span>Storage</span>
            </span>
            <span className="font-semibold text-slate-700">Boardsave Cloud</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar size={13} />
              <span>Uploaded</span>
            </span>
            <span className="text-slate-700">
              {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Today'}
            </span>
          </div>

          {file.share_token && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-400">Visibility</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                file.visibility === 'public' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
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
              className="w-full py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border border-sky-200 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
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
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
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
                className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors"
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
