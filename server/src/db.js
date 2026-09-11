const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', 'data.sqlite');
let dbInstance = null;

async function getDatabase() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  let db;

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Helper method to save to disk
  db.persist = () => {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  };

  // Intercept db.run so every mutation is automatically and immediately saved to disk!
  const rawRun = db.run.bind(db);
  db.run = (sql, params = []) => {
    const res = rawRun(sql, params);
    db.persist();
    return res;
  };

  // Helper to query all rows
  db.all = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  };

  // Helper to get one row
  db.get = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    let row = null;
    if (stmt.step()) {
      row = stmt.getAsObject();
    }
    stmt.free();
    return row;
  };

  // Helper to run insert/update/delete
  db.execute = (sql, params = []) => {
    const res = db.run(sql, params);
    return {
      changes: db.getRowsModified ? db.getRowsModified() : 1
    };
  };

  dbInstance = db;
  initSchema(db);
  seedData(db);

  return db;
}

function initSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      plan_id TEXT NOT NULL DEFAULT 'free',
      plan_expires_at TEXT,
      device_name TEXT DEFAULT 'My Mobile Device',
      avatar TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      device_name TEXT NOT NULL,
      platform TEXT NOT NULL,
      last_seen TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transfer_sessions (
      id TEXT PRIMARY KEY,
      sender_id TEXT,
      receiver_id TEXT,
      sender_device TEXT NOT NULL,
      receiver_device TEXT,
      pairing_code TEXT NOT NULL,
      qr_token TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting',
      total_size INTEGER NOT NULL DEFAULT 0,
      total_files INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS transfer_files (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      stored_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      progress INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cloud_files (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      share_token TEXT UNIQUE,
      visibility TEXT NOT NULL DEFAULT 'private',
      category TEXT NOT NULL DEFAULT 'other',
      expires_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      price_label TEXT NOT NULL,
      max_storage INTEGER NOT NULL,
      max_storage_label TEXT NOT NULL,
      max_upload_size INTEGER NOT NULL,
      max_upload_label TEXT NOT NULL,
      link_expiry_days INTEGER NOT NULL,
      features TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      duration_months INTEGER DEFAULT 1,
      expires_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      sender_type TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      report_type TEXT NOT NULL,
      description TEXT NOT NULL,
      target_id TEXT,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
  `);

  // Safe migrations for existing databases
  try {
    db.run('ALTER TABLE support_messages ADD COLUMN image_url TEXT');
  } catch (e) {}

  try {
    db.run('ALTER TABLE user_reports ADD COLUMN image_url TEXT');
  } catch (e) {}

  try {
    db.run('ALTER TABLE users ADD COLUMN plan_expires_at TEXT');
  } catch (e) {}

  try {
    db.run('ALTER TABLE transactions ADD COLUMN duration_months INTEGER DEFAULT 1');
  } catch (e) {}

  try {
    db.run('ALTER TABLE transactions ADD COLUMN expires_at TEXT');
  } catch (e) {}

  // Backfill any existing transactions or paid users without expiration dates
  try {
    const future30d = new Date(Date.now() + 30 * 86400000).toISOString();
    db.run("UPDATE users SET plan_expires_at = ? WHERE plan_id IN ('pro', 'unlimited') AND (plan_expires_at IS NULL OR plan_expires_at = '')", [future30d]);
  } catch (e) {}

  try {
    const rows = db.all('SELECT id, created_at, duration_months FROM transactions WHERE expires_at IS NULL OR expires_at = ""');
    for (const r of rows) {
      const created = r.created_at ? new Date(r.created_at) : new Date();
      const months = r.duration_months || 1;
      const exp = new Date(created.getTime() + months * 30 * 86400000).toISOString();
      db.run('UPDATE transactions SET duration_months = ?, expires_at = ? WHERE id = ?', [months, exp, r.id]);
    }
  } catch (e) {}

  db.persist();
}

function seedData(db) {
  // Check if plans exist
  const existingPlans = db.all('SELECT * FROM plans');
  if (existingPlans.length === 0) {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        price_label: '$0/mo',
        max_storage: 10 * 1024 * 1024 * 1024, // 10 GB
        max_storage_label: '10 GB Storage',
        max_upload_size: 4 * 1024 * 1024 * 1024, // 4 GB
        max_upload_label: 'Send up to 4 GB',
        link_expiry_days: 7,
        features: JSON.stringify([
          'Send up to 4 GB',
          'Transfers expire after 7 days',
          'Free file transfer',
          'Standard transfer speed'
        ])
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 8,
        price_label: '$8/mo',
        max_storage: 1024 * 1024 * 1024 * 1024, // 1 TB
        max_storage_label: '1 TB Storage',
        max_upload_size: 300 * 1024 * 1024 * 1024, // 300 GB
        max_upload_label: 'Send & receive up to 300 GB',
        link_expiry_days: 30,
        features: JSON.stringify([
          'Send & receive up to 300 GB',
          '300 GB Boardsave',
          '1 TB Storage',
          'Links expire after 30 days',
          'High speed transfer',
          'No ads'
        ])
      },
      {
        id: 'unlimited',
        name: 'Unlimited',
        price: 15,
        price_label: '$15/mo',
        max_storage: -1, // Unlimited
        max_storage_label: 'Unlimited Storage',
        max_upload_size: -1,
        max_upload_label: 'Unlimited Upload',
        link_expiry_days: -1, // Never expire
        features: JSON.stringify([
          'Anything unlimited',
          'Just save anything on internet',
          'Storage as much as you need',
          'Links never expire',
          'Priority transfer queue',
          '24/7 VIP Support'
        ])
      }
    ];

    for (const p of plans) {
      db.run(
        `INSERT INTO plans (id, name, price, price_label, max_storage, max_storage_label, max_upload_size, max_upload_label, link_expiry_days, features)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.price, p.price_label, p.max_storage, p.max_storage_label, p.max_upload_size, p.max_upload_label, p.link_expiry_days, p.features]
      );
    }
  }

  // Check if admin and user exist
  const existingUsers = db.all('SELECT * FROM users');
  if (existingUsers.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminPassHash = bcrypt.hashSync('admin123', salt);
    const userPassHash = bcrypt.hashSync('user123', salt);
    const now = new Date().toISOString();

    const adminId = 'admin-' + uuidv4().substring(0, 8);
    const userId = 'user-florian';

    db.run(
      `INSERT INTO users (id, name, email, password_hash, role, plan_id, device_name, avatar, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, 'Administrator', 'admin@app.com', adminPassHash, 'admin', 'unlimited', 'Admin Workstation', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'active', now]
    );

    db.run(
      `INSERT INTO users (id, name, email, password_hash, role, plan_id, device_name, avatar, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'Florian', 'user@app.com', userPassHash, 'user', 'free', "Florian's Phone", 'https://api.dicebear.com/7.x/avataaars/svg?seed=florian', 'active', now]
    );

    // Seed dummy cloud files matching screenshot items for Florian
    const sampleFiles = [
      {
        id: 'file-1',
        original_name: 'Bermain bersama chika.3gp',
        stored_name: 'sample_video.3gp',
        mime_type: 'video/3gpp',
        size: 43 * 1024 * 1024, // 43 MB
        category: 'video',
        visibility: 'private',
        share_token: 'share-chika-3gp',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'file-2',
        original_name: 'Another iteration of mind.png',
        stored_name: 'sample_mind.png',
        mime_type: 'image/png',
        size: 1.3 * 1024 * 1024, // 1.3 MB
        category: 'image',
        visibility: 'public',
        share_token: 'share-iteration-mind',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'file-3',
        original_name: 'Color pallete inspo.png',
        stored_name: 'sample_palette.png',
        mime_type: 'image/png',
        size: 1.2 * 1024 * 1024, // 1.2 MB
        category: 'image',
        visibility: 'private',
        share_token: 'share-palette-inspo',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'file-4',
        original_name: 'Endul ngeunah.png',
        stored_name: 'sample_food.png',
        mime_type: 'image/png',
        size: 1.2 * 1024 * 1024, // 1.2 MB
        category: 'image',
        visibility: 'private',
        share_token: 'share-endul-ngeunah',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'file-5',
        original_name: 'Q3_Financial_Presentation.pdf',
        stored_name: 'presentation.pdf',
        mime_type: 'application/pdf',
        size: 8.5 * 1024 * 1024, // 8.5 MB
        category: 'document',
        visibility: 'public',
        share_token: 'share-q3-pdf',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: 'file-6',
        original_name: 'SHAREit_Clone_Release.apk',
        stored_name: 'filetransfer_app.apk',
        mime_type: 'application/vnd.android.package-archive',
        size: 28.4 * 1024 * 1024, // 28.4 MB
        category: 'app',
        visibility: 'public',
        share_token: 'share-app-release',
        created_at: new Date(Date.now() - 3600000 * 72).toISOString()
      }
    ];

    for (const f of sampleFiles) {
      db.run(
        `INSERT INTO cloud_files (id, user_id, original_name, stored_name, mime_type, size, path, share_token, visibility, category, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          f.id,
          userId,
          f.original_name,
          f.stored_name,
          f.mime_type,
          f.size,
          'uploads/' + f.stored_name,
          f.share_token,
          f.visibility,
          f.category,
          new Date(Date.now() + 86400000 * 7).toISOString(),
          f.created_at
        ]
      );
    }

    // Seed dummy transfer history
    const sampleTransfers = [
      {
        id: 'sess-101',
        sender_id: userId,
        receiver_id: 'device-iphone-sarah',
        sender_device: "Florian's Phone",
        receiver_device: "Sarah's iPhone 15",
        pairing_code: '482910',
        qr_token: 'qr-sess-101',
        status: 'completed',
        total_size: 44.3 * 1024 * 1024,
        total_files: 2,
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        completed_at: new Date(Date.now() - 3600000 * 3 + 15000).toISOString(),
        files: [
          { name: 'Bermain bersama chika.3gp', type: 'video/3gpp', size: 43 * 1024 * 1024 },
          { name: 'Color pallete inspo.png', type: 'image/png', size: 1.3 * 1024 * 1024 }
        ]
      },
      {
        id: 'sess-102',
        sender_id: 'device-macbook-office',
        receiver_id: userId,
        sender_device: 'MacBook Pro 16"',
        receiver_device: "Florian's Phone",
        pairing_code: '893412',
        qr_token: 'qr-sess-102',
        status: 'completed',
        total_size: 1.3 * 1024 * 1024,
        total_files: 1,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        completed_at: new Date(Date.now() - 3600000 * 5 + 3000).toISOString(),
        files: [
          { name: 'Another iteration of mind.png', type: 'image/png', size: 1.3 * 1024 * 1024 }
        ]
      },
      {
        id: 'sess-103',
        sender_id: userId,
        receiver_id: 'device-galaxy-tab',
        sender_device: "Florian's Phone",
        receiver_device: 'Samsung Galaxy Tab S9',
        pairing_code: '129485',
        qr_token: 'qr-sess-103',
        status: 'failed',
        total_size: 120 * 1024 * 1024,
        total_files: 1,
        created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
        completed_at: null,
        files: [
          { name: 'Vacation_Bali_4K.mp4', type: 'video/mp4', size: 120 * 1024 * 1024 }
        ]
      }
    ];

    for (const sess of sampleTransfers) {
      db.run(
        `INSERT INTO transfer_sessions (id, sender_id, receiver_id, sender_device, receiver_device, pairing_code, qr_token, status, total_size, total_files, created_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sess.id, sess.sender_id, sess.receiver_id, sess.sender_device, sess.receiver_device, sess.pairing_code, sess.qr_token, sess.status, sess.total_size, sess.total_files, sess.created_at, sess.completed_at]
      );

      for (const file of sess.files) {
        db.run(
          `INSERT INTO transfer_files (id, session_id, file_name, file_type, file_size, stored_path, status, progress, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), sess.id, file.name, file.type, file.size, '', sess.status, sess.status === 'completed' ? 100 : 45, sess.created_at]
        );
      }
    }

    // Seed dummy transactions
    const sampleTx = [
      {
        id: 'tx-1001',
        user_id: 'user-demo-2',
        user_name: 'Alex Johnson',
        user_email: 'alex@example.com',
        plan_id: 'pro',
        amount: 8.00,
        method: 'QRIS Instant',
        status: 'success',
        duration_months: 1,
        expires_at: new Date(Date.now() + 28 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'tx-1002',
        user_id: 'user-demo-3',
        user_name: 'Maria Garcia',
        user_email: 'maria@example.com',
        plan_id: 'unlimited',
        amount: 15.00,
        method: 'Bank Transfer (BCA)',
        status: 'success',
        duration_months: 1,
        expires_at: new Date(Date.now() + 29 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'tx-1003',
        user_id: userId,
        user_name: 'Florian',
        user_email: 'user@app.com',
        plan_id: 'pro',
        amount: 8.00,
        method: 'E-Wallet (GoPay)',
        status: 'pending',
        duration_months: 1,
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        id: 'tx-1004',
        user_id: userId,
        user_name: 'Florian',
        user_email: 'user@app.com',
        plan_id: 'pro',
        amount: 8.00,
        method: 'QRIS Instant',
        status: 'success',
        duration_months: 1,
        expires_at: new Date(Date.now() + 27 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];

    for (const tx of sampleTx) {
      db.run(
        `INSERT INTO transactions (id, user_id, user_name, user_email, plan_id, amount, method, status, duration_months, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tx.id, tx.user_id, tx.user_name, tx.user_email, tx.plan_id, tx.amount, tx.method, tx.status, tx.duration_months, tx.expires_at, tx.created_at]
      );
    }

    // Seed dummy support tickets
    const sampleTickets = [
      {
        id: 'tkt-101',
        user_id: userId,
        user_name: 'Florian',
        user_email: 'user@app.com',
        subject: 'Kecepatan transfer Wi-Fi Direct',
        category: 'Transfer',
        priority: 'high',
        status: 'open',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        messages: [
          { sender_type: 'user', sender_name: 'Florian', message: 'Halo admin, apakah transfer via Wi-Fi Direct bisa lebih cepat dari QR code biasa?' },
          { sender_type: 'admin', sender_name: 'Admin Support', message: 'Tentu Florian! Wi-Fi Direct menggunakan frekuensi 5GHz langsung antar kartu Wi-Fi ponsel sehingga kecepatan bisa mencapai 30-50 MB/s tanpa kuota internet.' }
        ]
      },
      {
        id: 'tkt-102',
        user_id: 'user-demo-2',
        user_name: 'Alex Johnson',
        user_email: 'alex@example.com',
        subject: 'Kendala aktivasi kuota Pro 1TB',
        category: 'Pembayaran',
        priority: 'medium',
        status: 'resolved',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1 + 1800000).toISOString(),
        messages: [
          { sender_type: 'user', sender_name: 'Alex Johnson', message: 'Saya sudah simulasi bayar lewat QRIS, apakah kuota langsung bertambah?' },
          { sender_type: 'admin', sender_name: 'Admin Support', message: 'Halo Alex, kuota Pro 1TB sudah otomatis aktif di akun Anda. Silakan cek menu Boardsave!' }
        ]
      }
    ];

    for (const tkt of sampleTickets) {
      db.run(
        `INSERT INTO support_tickets (id, user_id, user_name, user_email, subject, category, priority, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tkt.id, tkt.user_id, tkt.user_name, tkt.user_email, tkt.subject, tkt.category, tkt.priority, tkt.status, tkt.created_at, tkt.updated_at]
      );

      for (const msg of tkt.messages) {
        db.run(
          `INSERT INTO support_messages (id, ticket_id, sender_type, sender_name, message, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['msg-' + Math.random().toString(36).substring(2, 8), tkt.id, msg.sender_type, msg.sender_name, msg.message, tkt.created_at]
        );
      }
    }

    // Seed dummy user reports
    const sampleReports = [
      {
        id: 'rep-1',
        user_id: userId,
        user_name: 'Florian',
        report_type: 'File Rusak',
        description: 'File video 3gp gagal di-decode saat di-preview di browser lama.',
        target_id: 'file-1',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'rep-2',
        user_id: 'user-demo-3',
        user_name: 'Maria Garcia',
        report_type: 'Bug Aplikasi',
        description: 'Animasi radar getar terlalu cepat pada mode baterai hemat.',
        target_id: 'radar-ui',
        status: 'resolved',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];

    for (const rep of sampleReports) {
      db.run(
        `INSERT INTO user_reports (id, user_id, user_name, report_type, description, target_id, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [rep.id, rep.user_id, rep.user_name, rep.report_type, rep.description, rep.target_id, rep.status, rep.created_at]
      );
    }
  }

  db.persist();
}

module.exports = {
  getDatabase
};
