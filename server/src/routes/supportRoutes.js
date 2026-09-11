const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, optionalAuthMiddleware } = require('../auth');

const FAQ_RESPONSES = {
  id: {
    gagal: "Jika transfer gagal, pastikan kedua perangkat berada di jaringan Wi-Fi/Hotspot yang sama atau coba gunakan metode Wi-Fi Direct atau kode pairing 6 digit manual.",
    kuota: "Pengguna akun Free mendapatkan 10 GB penyimpanan cloud Boardsave gratis. Anda dapat meng-upgrade ke Pro (1 TB) atau Unlimited melalui menu Plans & Pricing.",
    bayar: "Metode pembayaran pada aplikasi ini menggunakan simulasi (QRIS, VA Bank BCA/Mandiri/BRI, E-Wallet GoPay/OVO/DANA). Cukup klik 'Simulate Payment Success' untuk langsung mengaktifkan akun premium!",
    pairing: "Untuk pairing cepat, pengirim cukup membuka menu 'Send' untuk generate QR Code, lalu penerima memilih 'Receive' dan scan QR code tersebut.",
    default: "Halo! Saya Kiki dari Tim Customer Care File Transfer App. Ada yang bisa saya bantu terkait transfer file, penyimpanan Boardsave, atau upgrade akun? Anda juga dapat membuat Tiket Bantuan jika butuh bantuan khusus dari Admin."
  },
  en: {
    gagal: "If a transfer fails, make sure both devices are on the same Wi-Fi/Hotspot or try switching to Wi-Fi Direct or using the manual 6-digit pairing code.",
    kuota: "Free users receive 10 GB of free Boardsave cloud storage. You can upgrade to Pro (1 TB) or Unlimited anytime via Plans & Pricing.",
    bayar: "Payment in this app uses a sandbox simulation (QRIS, Bank VA, E-Wallets). Simply click 'Simulate Payment Success' to instantly activate your membership!",
    pairing: "For fast pairing, the sender opens 'Send' to generate a QR Code, and the receiver taps 'Receive' to scan it or types the 6-digit code.",
    default: "Hello! I'm Kiki from File Transfer App Customer Support. How can I assist you with file transfers, Boardsave cloud storage, or membership plans today? You can also create a Support Ticket for direct help from our Administrator."
  }
};

module.exports = function (dbPromise) {
  // Live Chat Auto-Reply
  router.post('/message', (req, res) => {
    const { text, lang = 'id' } = req.body;
    const lower = (text || '').toLowerCase();
    const l = lang === 'en' ? 'en' : 'id';

    let reply = FAQ_RESPONSES[l].default;
    if (lower.includes('gagal') || lower.includes('fail') || lower.includes('error') || lower.includes('batal')) {
      reply = FAQ_RESPONSES[l].gagal;
    } else if (lower.includes('kuota') || lower.includes('storage') || lower.includes('kapasitas') || lower.includes('limit')) {
      reply = FAQ_RESPONSES[l].kuota;
    } else if (lower.includes('bayar') || lower.includes('pay') || lower.includes('upgrade') || lower.includes('harga') || lower.includes('qris')) {
      reply = FAQ_RESPONSES[l].bayar;
    } else if (lower.includes('qr') || lower.includes('pair') || lower.includes('hubung') || lower.includes('connect')) {
      reply = FAQ_RESPONSES[l].pairing;
    }

    res.json({
      id: 'msg-' + uuidv4().substring(0, 8),
      sender: 'agent',
      name: 'Kiki (Customer Care)',
      text: reply,
      timestamp: new Date().toISOString()
    });
  });

  // Get user tickets
  router.get('/tickets', authMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const tickets = db.all('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id]);
      res.json({ tickets });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  });

  // Create new ticket (with optional image attachment)
  router.post('/tickets', authMiddleware, async (req, res) => {
    try {
      const { subject, category, priority, message, image_url } = req.body;
      if (!subject || (!message && !image_url)) {
        return res.status(400).json({ error: 'Subject and message or photo are required' });
      }

      const db = await dbPromise;
      const ticketId = 'tkt-' + uuidv4().substring(0, 8);
      const now = new Date().toISOString();

      db.run(
        `INSERT INTO support_tickets (id, user_id, user_name, user_email, subject, category, priority, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ticketId, req.user.id, req.user.name, req.user.email, subject, category || 'Umum', priority || 'medium', 'open', now, now]
      );

      // Insert initial message with image_url
      db.run(
        `INSERT INTO support_messages (id, ticket_id, sender_type, sender_name, message, image_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['msg-' + uuidv4().substring(0, 8), ticketId, 'user', req.user.name, message || 'Foto dilampirkan', image_url || null, now]
      );

      res.status(201).json({
        message: 'Ticket created',
        ticketId,
        ticket: { id: ticketId, subject, category, priority, status: 'open' }
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  });

  // Get ticket thread messages
  router.get('/tickets/:id/messages', authMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const ticket = db.get('SELECT * FROM support_tickets WHERE id = ?', [req.params.id]);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      const messages = db.all('SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC', [ticket.id]);
      res.json({ ticket, messages });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch ticket messages' });
    }
  });

  // Reply to ticket (user side with photo support)
  router.post('/tickets/:id/reply', authMiddleware, async (req, res) => {
    try {
      const { message, image_url } = req.body;
      if ((!message || !message.trim()) && !image_url) {
        return res.status(400).json({ error: 'Message or photo attachment required' });
      }

      const db = await dbPromise;
      const ticket = db.get('SELECT * FROM support_tickets WHERE id = ?', [req.params.id]);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      const now = new Date().toISOString();
      const msgId = 'msg-' + uuidv4().substring(0, 8);

      db.run(
        `INSERT INTO support_messages (id, ticket_id, sender_type, sender_name, message, image_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [msgId, ticket.id, 'user', req.user.name, message || 'Foto dilampirkan', image_url || null, now]
      );

      db.run('UPDATE support_tickets SET updated_at = ? WHERE id = ?', [now, ticket.id]);

      res.status(201).json({ message: 'Reply sent', msgId, image_url });
    } catch (e) {
      res.status(500).json({ error: 'Failed to send reply' });
    }
  });

  // Submit report (Kendala, File Rusak, Bug with photo attachment)
  router.post('/reports', authMiddleware, async (req, res) => {
    try {
      const { report_type, description, target_id, image_url } = req.body;
      if (!description && !image_url) {
        return res.status(400).json({ error: 'Description or screenshot is required' });
      }

      const db = await dbPromise;
      const repId = 'rep-' + uuidv4().substring(0, 8);

      db.run(
        `INSERT INTO user_reports (id, user_id, user_name, report_type, description, target_id, image_url, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [repId, req.user.id, req.user.name, report_type || 'Bug Aplikasi', description || 'Screenshot kendala', target_id || null, image_url || null, 'pending', new Date().toISOString()]
      );

      res.status(201).json({ message: 'Report submitted successfully', repId });
    } catch (e) {
      res.status(500).json({ error: 'Failed to submit report' });
    }
  });

  // Upload attachment image (optional helper returning URL/confirmation)
  router.post('/upload-attachment', authMiddleware, async (req, res) => {
    try {
      const { image, fileName } = req.body;
      if (!image) return res.status(400).json({ error: 'No image data provided' });
      // If client sends base64, return it or static path
      res.json({ url: image, message: 'Attachment processed' });
    } catch (e) {
      res.status(500).json({ error: 'Failed to upload attachment' });
    }
  });

  return router;
};
