import React, { useState, useEffect } from 'react';
import { X, Image, Video, Music, FileText, Smartphone, Archive, Plus, CheckCircle2, HardDriveUpload, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function FilePickerModal({ isOpen, onClose, onFilesSelected }) {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [customStorageFiles, setCustomStorageFiles] = useState([]);
  const [cloudFiles, setCloudFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchCloudFiles();
    }
  }, [isOpen]);

  const fetchCloudFiles = async () => {
    try {
      const res = await fetch('/api/cloud/files?sort=date', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.files || []).map(f => {
          let category = 'documents';
          let iconColor = 'from-amber-500 to-yellow-400';
          if (f.category === 'image') {
            category = 'photos';
            iconColor = 'from-blue-500 to-sky-400';
          } else if (f.category === 'video') {
            category = 'videos';
            iconColor = 'from-purple-500 to-pink-500';
          } else if (f.category === 'music') {
            category = 'music';
            iconColor = 'from-emerald-500 to-teal-400';
          } else if (f.category === 'app') {
            category = 'apps';
            iconColor = 'from-cyan-500 to-blue-500';
          } else if (f.category === 'archive') {
            category = 'zip';
            iconColor = 'from-indigo-500 to-violet-500';
          }
          return {
            id: 'cloud-' + f.id,
            realCloudId: f.id,
            name: f.original_name,
            size: f.size,
            type: f.mime_type,
            category,
            iconColor,
            isFromCloud: true
          };
        });
        setCloudFiles(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All', icon: FileText },
    { id: 'photos', label: 'Photos', icon: Image },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'documents', label: 'Docs', icon: FileText },
    { id: 'apps', label: 'Apps', icon: Smartphone },
    { id: 'zip', label: 'ZIP', icon: Archive }
  ];

  // Preset quick files for demonstration
  const presetFiles = [
    {
      id: 'pre-1',
      name: 'Bermain bersama chika.3gp',
      size: 43 * 1024 * 1024,
      type: 'video/3gpp',
      category: 'videos',
      iconColor: 'from-orange-500 to-amber-400'
    },
    {
      id: 'pre-2',
      name: 'Another iteration of mind.png',
      size: 1.3 * 1024 * 1024,
      type: 'image/png',
      category: 'photos',
      iconColor: 'from-blue-500 to-sky-400'
    },
    {
      id: 'pre-3',
      name: 'Color pallete inspo.png',
      size: 1.2 * 1024 * 1024,
      type: 'image/png',
      category: 'photos',
      iconColor: 'from-amber-500 to-yellow-400'
    },
    {
      id: 'pre-4',
      name: 'Endul ngeunah.png',
      size: 1.2 * 1024 * 1024,
      type: 'image/png',
      category: 'photos',
      iconColor: 'from-rose-500 to-orange-400'
    },
    {
      id: 'pre-5',
      name: 'Weekend_Travel_Vlog_4K.mp4',
      size: 154 * 1024 * 1024,
      type: 'video/mp4',
      category: 'videos',
      iconColor: 'from-purple-500 to-pink-500'
    },
    {
      id: 'pre-6',
      name: 'Sunset_LoFi_Chill_Beats.mp3',
      size: 8.7 * 1024 * 1024,
      type: 'audio/mpeg',
      category: 'music',
      iconColor: 'from-emerald-500 to-teal-400'
    },
    {
      id: 'pre-7',
      name: 'Q3_Product_Roadmap.pdf',
      size: 4.2 * 1024 * 1024,
      type: 'application/pdf',
      category: 'documents',
      iconColor: 'from-red-500 to-rose-400'
    },
    {
      id: 'pre-8',
      name: 'SHAREit_Clone_Release_v2.apk',
      size: 32.8 * 1024 * 1024,
      type: 'application/vnd.android.package-archive',
      category: 'apps',
      iconColor: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'pre-9',
      name: 'Source_Assets_Bundle.zip',
      size: 88.5 * 1024 * 1024,
      type: 'application/zip',
      category: 'zip',
      iconColor: 'from-indigo-500 to-violet-500'
    }
  ];

  const handleCustomFileUpload = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    const mapped = fileList.map((f, idx) => ({
      id: 'custom-' + Date.now() + '-' + idx,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      category: getCategoryFromMime(f.type, f.name),
      iconColor: 'from-sky-500 to-blue-500',
      isFromDevice: true,
      rawFile: f
    }));

    setCustomStorageFiles((prev) => [...mapped, ...prev]);
    setSelectedFiles((prev) => [...mapped, ...prev]);

    // Also upload to cloud in background so it's available in Boardsave immediately
    for (const file of fileList) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await fetch('/api/cloud/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData
        });
      } catch (err) {
        console.error('Failed to sync to cloud:', err);
      }
    }
    window.dispatchEvent(new CustomEvent('app:files-updated'));
  };

  const toggleFile = (file) => {
    setSelectedFiles((prev) => {
      const exists = prev.find((item) => item.id === file.id);
      if (exists) {
        return prev.filter((item) => item.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  // Combine real cloud files with presets (avoiding duplicate names)
  const combinedFiles = [
    ...cloudFiles,
    ...presetFiles.filter(p => !cloudFiles.some(c => c.name.toLowerCase() === p.name.toLowerCase()))
  ];

  const filteredItems = selectedCategory === 'all'
    ? combinedFiles
    : combinedFiles.filter((f) => f.category === selectedCategory);

  const handleConfirm = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to send');
      return;
    }
    onFilesSelected(selectedFiles, totalSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border relative flex flex-col max-h-[85vh] transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-left mb-4">
          <h3 className="text-lg font-black tracking-tight">Select Files to Send</h3>
          <p className="text-xs text-slate-400">Pick from device storage or choose presets</p>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-sm'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Device File Picker Input */}
        <label className={`flex items-center justify-center gap-2 p-3 mb-3 border-2 border-dashed rounded-2xl cursor-pointer transition-colors text-xs font-bold ${
          isDark
            ? 'border-sky-700/80 bg-sky-950/30 hover:bg-sky-950/50 text-sky-400'
            : 'border-sky-300 bg-sky-50/60 hover:bg-sky-100 text-sky-700'
        }`}>
          <HardDriveUpload size={16} />
          <span>Browse Files from This Device</span>
          <input
            type="file"
            multiple
            onChange={handleCustomFileUpload}
            className="hidden"
          />
        </label>

        {/* File List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
          {/* Files picked from device storage */}
          {customStorageFiles.length > 0 && (
            <div className="space-y-1.5 mb-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-extrabold text-sky-500 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDriveUpload size={13} />
                  <span>File dari Penyimpanan HP ({customStorageFiles.length})</span>
                </span>
                <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-md">
                  Auto-Selected
                </span>
              </div>
              {customStorageFiles.map((file) => {
                const isSelected = selectedFiles.some((f) => f.id === file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleFile(file)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-sky-950/60 border-sky-500 shadow-sm'
                          : 'bg-sky-50/90 border-sky-400 shadow-sm'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <HardDriveUpload size={18} />
                      </div>
                      <div className="truncate">
                        <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span className="text-sky-500 font-semibold">Storage HP</span>
                        </p>
                      </div>
                    </div>

                    <div className="ml-2 shrink-0">
                      {isSelected ? (
                        <CheckCircle2 size={20} className="text-sky-500 fill-sky-500/20" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cloud and Preset Files */}
          <div className="space-y-1.5">
            {customStorageFiles.length > 0 && (
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1 block">
                Berkas Cloud & Koleksi
              </span>
            )}
            {filteredItems.map((file) => {
              const isSelected = selectedFiles.some((f) => f.id === file.id);
              return (
                <div
                  key={file.id}
                  onClick={() => toggleFile(file)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? isDark
                        ? 'bg-sky-950/60 border-sky-500 shadow-sm'
                        : 'bg-sky-50/90 border-sky-400 shadow-sm'
                      : isDark
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${file.iconColor} text-white flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      {file.category === 'photos' && <Image size={18} />}
                      {file.category === 'videos' && <Video size={18} />}
                      {file.category === 'music' && <Music size={18} />}
                      {file.category === 'documents' && <FileText size={18} />}
                      {file.category === 'apps' && <Smartphone size={18} />}
                      {file.category === 'zip' && <Archive size={18} />}
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span className="capitalize">{file.category}</span>
                        {file.isFromCloud && (
                          <span className="text-sky-500 font-semibold text-[10px]">Cloud</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="ml-2 shrink-0">
                    {isSelected ? (
                      <CheckCircle2 size={20} className="text-sky-500 fill-sky-500/20" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary & Confirm Button */}
        <div className={`pt-3 border-t flex items-center justify-between gap-3 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{formatBytes(totalSize)}</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={selectedFiles.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 disabled:opacity-40 text-white rounded-xl text-xs font-black shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            Confirm & Send
          </button>
        </div>
      </div>
    </div>
  );
}

function getCategoryFromMime(mime, name) {
  if (mime?.startsWith('image/')) return 'photos';
  if (mime?.startsWith('video/')) return 'videos';
  if (mime?.startsWith('audio/')) return 'music';
  if (mime?.includes('pdf') || mime?.includes('text')) return 'documents';
  if (name?.endsWith('.apk')) return 'apps';
  if (name?.endsWith('.zip') || name?.endsWith('.rar')) return 'zip';
  return 'documents';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
