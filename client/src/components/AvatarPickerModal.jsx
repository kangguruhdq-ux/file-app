import React, { useState } from 'react';
import { X, Upload, Check, Sparkles } from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'av-1', name: 'Florian (Default)', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=florian' },
  { id: 'av-2', name: 'Sarah Tech', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
  { id: 'av-3', name: 'Alex Cyber', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
  { id: 'av-4', name: 'Mia Creative', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia' },
  { id: 'av-5', name: 'Daniel Pro', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniel' },
  { id: 'av-6', name: 'Sophia Art', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia' },
  { id: 'av-7', name: 'Robot Bot-1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot1' },
  { id: 'av-8', name: 'Android Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=android' },
  { id: 'av-9', name: 'Neo Pixel', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel1' },
  { id: 'av-10', name: 'Pixel Gamer', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=gamer' },
  { id: 'av-11', name: 'Cat Explorer', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=cat' },
  { id: 'av-12', name: 'Adventurer Max', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=max' }
];

export default function AvatarPickerModal({ isOpen, onClose, currentAvatar, onSelectAvatar }) {
  const [selectedUrl, setSelectedUrl] = useState(currentAvatar || PRESET_AVATARS[0].url);

  if (!isOpen) return null;

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 Data URL for instant storage
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setSelectedUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    onSelectAvatar(selectedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-left mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Pilih Foto Profil</span>
            <Sparkles size={16} className="text-sky-500" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih avatar 3D keren atau upload foto sendiri
          </p>
        </div>

        {/* Upload Custom Photo Button */}
        <label className="flex items-center justify-center gap-2 p-3 mb-4 border-2 border-dashed border-sky-300 dark:border-sky-500/40 bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100/70 rounded-2xl cursor-pointer text-sky-700 dark:text-sky-300 transition-colors text-xs font-semibold">
          <Upload size={16} />
          <span>Upload Foto dari Galeri</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleCustomUpload}
            className="hidden"
          />
        </label>

        {/* Preset Avatars Grid */}
        <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1 mb-4">
          {PRESET_AVATARS.map((av) => {
            const isSelected = selectedUrl === av.url;
            return (
              <div
                key={av.id}
                onClick={() => setSelectedUrl(av.url)}
                className={`flex flex-col items-center p-2 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-sm scale-105'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 mb-1">
                  <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-sky-500/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                  {av.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20"
          >
            Gunakan Foto
          </button>
        </div>
      </div>
    </div>
  );
}
