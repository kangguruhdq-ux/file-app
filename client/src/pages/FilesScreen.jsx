import React, { useState, useEffect } from 'react';
import { FolderClosed, Search, Plus, Filter, Image, Video, Music, FileText, Smartphone, Archive, Download, Share2, Trash2, HardDriveUpload, Check, Copy, UploadCloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import FilePreviewModal from '../components/FilePreviewModal';

export default function FilesScreen() {
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const { t, lang } = useLanguage();
  const { notifySuccess, notifyWarning, notifyError } = useNotification();
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({ usedBytes: 0, maxStorage: 10 * 1024 * 1024 * 1024, fileCount: 0 });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'size_desc' | 'name_asc'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  useEffect(() => {
    fetchFiles();

    const handleUpdate = () => {
      fetchFiles();
    };
    window.addEventListener('app:files-updated', handleUpdate);
    return () => window.removeEventListener('app:files-updated', handleUpdate);
  }, [categoryFilter, searchQuery, sortBy]);

  const fetchFiles = async () => {
    try {
      let url = `/api/cloud/files?category=${categoryFilter}&sort=${sortBy}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of fileList) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/cloud/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData
        });

        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setIsUploading(false);
    e.target.value = '';

    if (successCount > 0) {
      notifySuccess(
        lang === 'id' ? 'File Berhasil Diupload' : 'File Uploaded Successfully',
        `${successCount} ${lang === 'id' ? 'file telah tersimpan di Boardsave Cloud.' : 'file(s) saved to Boardsave Cloud.'}`
      );
      fetchFiles();
      window.dispatchEvent(new CustomEvent('app:files-updated'));
    } else {
      notifyError(
        lang === 'id' ? 'Gagal Mengunggah' : 'Upload Failed',
        lang === 'id' ? 'Periksa kapasitas storage atau ukuran file' : 'Check storage quota or file size'
      );
    }
  };

  const handleDeleteFile = async (file, e) => {
    e?.stopPropagation();
    if (!confirm(lang === 'id' ? `Hapus ${file.original_name}?` : `Delete ${file.original_name}?`)) return;
    try {
      const res = await fetch(`/api/cloud/files/${file.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notifyWarning(
          lang === 'id' ? 'File Dihapus' : 'File Deleted',
          `${file.original_name} ${lang === 'id' ? 'berhasil dihapus dari cloud storage.' : 'removed from cloud storage.'}`
        );
        if (selectedFile?.id === file.id) {
          setSelectedFile(null);
        }
        fetchFiles();
        window.dispatchEvent(new CustomEvent('app:files-updated'));
      } else {
        const err = await res.json();
        notifyError('Error', err.error || 'Gagal menghapus file');
      }
    } catch (e) {
      notifyError('Error', 'Gagal menghapus file');
    }
  };

  const handleToggleShare = async (file, e) => {
    e?.stopPropagation();
    try {
      const res = await fetch(`/api/cloud/share/${file.id}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const fullUrl = `${window.location.origin}/share/${data.shareToken}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiedToken(file.id);
        notifySuccess(
          lang === 'id' ? 'Tautan Disalin' : 'Link Copied',
          `${file.original_name} ${lang === 'id' ? 'aktif selama 24 jam.' : 'is active for 24 hours.'}`
        );
        setTimeout(() => setCopiedToken(null), 2500);
        fetchFiles();
      }
    } catch (e) {
      notifyError('Error', 'Gagal membagikan file');
    }
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
    { id: 'document', label: 'Docs' },
    { id: 'music', label: 'Music' },
    { id: 'app', label: 'Apps' }
  ];

  const storagePercent = stats.maxStorage === -1 ? 5 : Math.min(100, Math.round((stats.usedBytes / stats.maxStorage) * 100));

  return (
    <div className={`flex-1 flex flex-col p-5 overflow-y-auto select-none relative ${
      isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pt-1 pb-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            Boardsave
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            Internal storage & cloud repository
          </p>
        </div>

        {/* Header Upload Button */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all active:scale-95">
          <HardDriveUpload size={14} />
          <span>{isUploading ? 'Uploading...' : '+ Upload'}</span>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Cloud Storage Usage Card */}
      <div className="bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-400/30 rounded-3xl p-4 mb-3 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
            <FolderClosed size={15} />
            <span>Kapasitas Boardsave Cloud</span>
          </span>
          <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {formatBytes(stats.usedBytes)} / {stats.maxStorage === -1 ? 'Unlimited' : formatBytes(stats.maxStorage)}
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${storagePercent}%` }}
          ></div>
        </div>
      </div>

      {/* Prominent Storage Upload Dropzone / Button */}
      <label className="flex items-center justify-between p-3.5 mb-3 bg-sky-50/70 dark:bg-slate-900 border-2 border-dashed border-sky-300 dark:border-sky-800 rounded-2xl cursor-pointer hover:bg-sky-100/70 dark:hover:bg-slate-800/80 transition-all group active:scale-98">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30 shrink-0 group-hover:scale-105 transition-transform">
            <UploadCloud size={20} />
          </div>
          <div className="text-left truncate">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {isUploading ? 'Sedang Mengunggah...' : 'Upload File dari Storage HP'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Foto, video, musik, dokumen, APK & ZIP
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-xl text-xs font-extrabold shrink-0 ml-2">
          {isUploading ? 'Loading' : 'Pilih File'}
        </span>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
        />
      </label>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari file di Boardsave..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              categoryFilter === cat.id
                ? 'bg-sky-500 text-white shadow-sm'
                : isDark
                ? 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Files List */}
      <div className="space-y-2 pb-16 flex-1">
        {files.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada berkas di Boardsave Cloud.
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-all active:scale-[0.99] shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-slate-700">
                  {file.category === 'image' && <Image size={18} />}
                  {file.category === 'video' && <Video size={18} />}
                  {file.category === 'music' && <Music size={18} />}
                  {file.category === 'document' && <FileText size={18} />}
                  {file.category === 'app' && <Smartphone size={18} />}
                  {(file.category === 'other' || file.category === 'archive') && <FolderClosed size={18} />}
                </div>

                <div className="truncate text-left">
                  <p className="text-xs font-bold truncate">
                    {file.original_name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatBytes(file.size)} • {file.category}
                  </p>
                </div>
              </div>

              {/* Share & Delete Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  onClick={(e) => handleToggleShare(file, e)}
                  className={`p-2 rounded-xl transition-colors ${
                    file.visibility === 'public'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Bagikan Tautan Publik 24 Jam"
                >
                  {copiedToken === file.id ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Share2 size={14} />
                  )}
                </button>

                <button
                  onClick={(e) => handleDeleteFile(file, e)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Hapus Berkas"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
        onDelete={handleDeleteFile}
      />
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
