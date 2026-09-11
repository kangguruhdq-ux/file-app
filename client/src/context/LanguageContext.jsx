import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  id: {
    // Navigation
    nav_home: 'Beranda',
    nav_boardsave: 'Boardsave',
    nav_transfer: 'Transfer',
    nav_account: 'Akun',

    // Home
    home_hi: 'Halo',
    home_nearby_btn: 'Perangkat Sekitar',
    home_send_title: 'Kirim',
    home_send_pill: 'Sedang upload 2 file 128 MB / 1.23 GB',
    home_receive_title: 'Terima',
    home_receive_pill: 'Kamu punya 6 file baru',
    home_recent_items: 'Item terbaru',
    home_view_all: 'Lihat semua',

    // Transfer
    trans_hub: 'Pusat Transfer',
    trans_sub: 'Kirim & terima file super cepat',
    trans_tab_send: 'Kirim',
    trans_tab_receive: 'Terima',
    trans_tab_nearby: 'Sekitar',
    trans_tab_history: 'Riwayat',
    trans_choose_files: 'Pilih File untuk Dikirim',
    trans_send_desc: 'Pilih foto, video, musik, dokumen, APK atau ZIP untuk dibuatkan QR code & kode pairing.',
    trans_active_session: 'Sesi Transfer Aktif',
    trans_wait_receiver: 'Menunggu penerima terhubung...',
    trans_scan_code: 'Scan QR / Masukkan Kode',
    trans_incoming_title: 'File Masuk',
    trans_accept_btn: 'Terima & Unduh',
    trans_decline_btn: 'Tolak',
    trans_speed: 'Kecepatan',
    trans_eta: 'Sisa Waktu',
    trans_done: 'Selesai & Lihat Riwayat',

    // Boardsave
    board_title: 'Boardsave',
    board_sub: 'Penyimpanan lokal & repositori cloud',
    board_upload: 'Simpan File',
    board_storage_usage: 'Penggunaan Penyimpanan',
    board_search_placeholder: 'Cari file di Boardsave...',
    board_copy_link: 'Salin Tautan',
    board_link_copied: 'Tautan Tersalin!',

    // Pricing
    price_title: 'Paket & Harga',
    price_current: 'Paket saat ini',
    price_buy: 'Beli paket',
    price_billed: 'ditagih per bulan',
    price_benefits: 'Keuntungan Membership',

    // Account & Profile
    acc_title: 'Akun & Profil',
    acc_sub: 'Pengaturan perangkat & membership',
    acc_membership_status: 'Status Membership',
    acc_edit_profile: 'Ubah Profil',
    acc_device_identity: 'Identitas & Perangkat',
    acc_display_name: 'Nama Tampilan',
    acc_device_name: 'Nama Perangkat (Terlihat di radar)',
    acc_save: 'Simpan',
    acc_cancel: 'Batal',
    acc_change_pp: 'Ganti Foto Profil',
    acc_change_pw: 'Ganti Password',
    acc_theme: 'Tema Tampilan',
    acc_lang: 'Bahasa Aplikasi',
    acc_cs: 'Pusat Bantuan & CS Live',
    acc_admin_console: 'Buka Admin Mobile Panel',
    acc_sign_out: 'Keluar',
    acc_delete_acc: 'Hapus Akun Permanen',

    // Customer Service
    cs_title: 'Pusat Bantuan CS',
    cs_status: 'Online • Siap membantu',
    cs_greeting: 'Halo! Ada yang bisa kami bantu seputar transfer file, cloud Boardsave, atau upgrade akun?',
    cs_chip_fail: 'Transfer sering gagal',
    cs_chip_quota: 'Berapa kuota free?',
    cs_chip_pay: 'Cara bayar & upgrade',
    cs_chip_pair: 'Cara scan & pair',
    cs_placeholder: 'Ketik pesan pertanyaanmu...',
    cs_send: 'Kirim',

    // Admin Mobile
    admin_title: 'Admin Mobile Panel',
    admin_tab_overview: 'Ringkasan',
    admin_tab_users: 'Pengguna',
    admin_tab_transfers: 'Transfer',
    admin_tab_files: 'File Cloud',
    admin_tab_plans: 'Paket',
    admin_tab_tx: 'Transaksi',
    admin_add_user: 'Tambah Pengguna',
    admin_add_plan: 'Tambah Paket',
    admin_clear_transfers: 'Hapus Semua Log'
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_boardsave: 'Boardsave',
    nav_transfer: 'Transfer',
    nav_account: 'Account',

    // Home
    home_hi: 'Hi',
    home_nearby_btn: 'Nearby Devices',
    home_send_title: 'Send',
    home_send_pill: 'Uploading 2 files 128 MB / 1.23 GB',
    home_receive_title: 'Receive',
    home_receive_pill: 'You have 6 new files',
    home_recent_items: 'Recent items',
    home_view_all: 'View all',

    // Transfer
    trans_hub: 'Transfer Hub',
    trans_sub: 'Fast local & relay file sharing',
    trans_tab_send: 'Send',
    trans_tab_receive: 'Receive',
    trans_tab_nearby: 'Nearby',
    trans_tab_history: 'History',
    trans_choose_files: 'Choose Files to Send',
    trans_send_desc: 'Select photos, videos, music, documents, APK or ZIP to generate QR & pairing code.',
    trans_active_session: 'Active Transfer Session',
    trans_wait_receiver: 'Waiting for receiver to connect...',
    trans_scan_code: 'Scan QR / Enter Code',
    trans_incoming_title: 'Incoming Transfer',
    trans_accept_btn: 'Accept & Download',
    trans_decline_btn: 'Decline',
    trans_speed: 'Speed',
    trans_eta: 'Remaining Time',
    trans_done: 'Done & View History',

    // Boardsave
    board_title: 'Boardsave',
    board_sub: 'Internal storage & cloud repository',
    board_upload: 'Save File',
    board_storage_usage: 'Storage Usage',
    board_search_placeholder: 'Search files in Boardsave...',
    board_copy_link: 'Copy Link',
    board_link_copied: 'Link Copied!',

    // Pricing
    price_title: 'Plans & Pricing',
    price_current: 'Current plan',
    price_buy: 'Buy plan',
    price_billed: 'billed monthly',
    price_benefits: 'Membership Benefits',

    // Account & Profile
    acc_title: 'Account & Profile',
    acc_sub: 'Device settings and cloud membership',
    acc_membership_status: 'Membership Status',
    acc_edit_profile: 'Edit Profile',
    acc_device_identity: 'Identity & Device',
    acc_display_name: 'Display Name',
    acc_device_name: 'Device Name (Visible on radar)',
    acc_save: 'Save',
    acc_cancel: 'Cancel',
    acc_change_pp: 'Change Profile Picture',
    acc_change_pw: 'Change Password',
    acc_theme: 'App Theme',
    acc_lang: 'App Language',
    acc_cs: 'Help Center & CS Live',
    acc_admin_console: 'Open Admin Mobile Panel',
    acc_sign_out: 'Sign Out',
    acc_delete_acc: 'Delete Account Permanently',

    // Customer Service
    cs_title: 'Customer Service',
    cs_status: 'Online • Here to help',
    cs_greeting: 'Hello! How can we help you with file transfers, Boardsave cloud storage, or account plans today?',
    cs_chip_fail: 'Transfer failed',
    cs_chip_quota: 'Free quota limit?',
    cs_chip_pay: 'How to pay & upgrade',
    cs_chip_pair: 'How to pair devices',
    cs_placeholder: 'Type your message...',
    cs_send: 'Send',

    // Admin Mobile
    admin_title: 'Admin Mobile Panel',
    admin_tab_overview: 'Overview',
    admin_tab_users: 'Users',
    admin_tab_transfers: 'Transfers',
    admin_tab_files: 'Cloud Files',
    admin_tab_plans: 'Plans',
    admin_tab_tx: 'Transactions',
    admin_add_user: 'Add User',
    admin_add_plan: 'Add Plan',
    admin_clear_transfers: 'Clear All Logs'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('ft_lang') || 'id');

  useEffect(() => {
    localStorage.setItem('ft_lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => (prev === 'id' ? 'en' : 'id'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
