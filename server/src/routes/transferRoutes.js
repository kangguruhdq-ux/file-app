const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { optionalAuthMiddleware, authMiddleware } = require('../auth');

// Multer storage for transferred files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'transfer-' + uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
});

const upload = multer({ storage });

module.exports = function (dbPromise) {
  // Get transfer history for user
  router.get('/history', optionalAuthMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const filter = req.query.filter; // 'sent', 'received', 'failed'
      const userId = req.user ? req.user.id : null;

      let query = `
        SELECT ts.*, 
               (SELECT COUNT(*) FROM transfer_files tf WHERE tf.session_id = ts.id) as files_count
        FROM transfer_sessions ts
      `;
      let params = [];

      if (filter === 'sent') {
        if (userId) {
          query += ` WHERE ts.sender_id = ? AND ts.status != 'failed'`;
          params.push(userId);
        } else {
          query += ` WHERE ts.status != 'failed'`;
        }
      } else if (filter === 'received') {
        if (userId) {
          query += ` WHERE ts.receiver_id = ? AND ts.status != 'failed'`;
          params.push(userId);
        } else {
          query += ` WHERE ts.status != 'failed'`;
        }
      } else if (filter === 'failed') {
        query += ` WHERE ts.status = 'failed'`;
      }

      query += ` ORDER BY ts.created_at DESC LIMIT 50`;

      const sessions = db.all(query, params);

      // Fetch files for each session
      const result = sessions.map(s => {
        const files = db.all('SELECT * FROM transfer_files WHERE session_id = ?', [s.id]);
        return {
          ...s,
          files
        };
      });

      res.json({ history: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve transfer history' });
    }
  });

  // Upload file for transfer
  router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        message: 'File uploaded successfully',
        file: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to upload transfer file' });
    }
  });

  // Get session details
  router.get('/session/:id', async (req, res) => {
    try {
      const db = await dbPromise;
      const session = db.get('SELECT * FROM transfer_sessions WHERE id = ?', [req.params.id]);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const files = db.all('SELECT * FROM transfer_files WHERE session_id = ?', [session.id]);
      res.json({ session: { ...session, files } });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Delete single transfer session from history
  router.delete('/history/:id', optionalAuthMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const sessionId = req.params.id;
      const session = db.get('SELECT * FROM transfer_sessions WHERE id = ?', [sessionId]);
      if (!session) {
        return res.status(404).json({ error: 'Transfer session not found' });
      }

      // Find files to remove from disk if needed
      const files = db.all('SELECT * FROM transfer_files WHERE session_id = ?', [sessionId]);
      for (const f of files) {
        if (f.stored_path) {
          const diskPath = path.join(__dirname, '..', '..', f.stored_path);
          if (fs.existsSync(diskPath)) {
            try { fs.unlinkSync(diskPath); } catch (e) {}
          }
        }
      }

      db.run('DELETE FROM transfer_files WHERE session_id = ?', [sessionId]);
      db.run('DELETE FROM transfer_sessions WHERE id = ?', [sessionId]);

      res.json({ message: 'Transfer record deleted successfully', sessionId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete transfer history' });
    }
  });

  // Clear all transfer history for user
  router.delete('/history', optionalAuthMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const userId = req.user ? req.user.id : null;

      let sessions = [];
      if (userId) {
        sessions = db.all('SELECT id FROM transfer_sessions WHERE sender_id = ? OR receiver_id = ?', [userId, userId]);
      } else {
        sessions = db.all('SELECT id FROM transfer_sessions');
      }

      for (const s of sessions) {
        const files = db.all('SELECT * FROM transfer_files WHERE session_id = ?', [s.id]);
        for (const f of files) {
          if (f.stored_path) {
            const diskPath = path.join(__dirname, '..', '..', f.stored_path);
            if (fs.existsSync(diskPath)) {
              try { fs.unlinkSync(diskPath); } catch (e) {}
            }
          }
        }
        db.run('DELETE FROM transfer_files WHERE session_id = ?', [s.id]);
        db.run('DELETE FROM transfer_sessions WHERE id = ?', [s.id]);
      }

      res.json({ message: 'All transfer history cleared successfully', count: sessions.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to clear transfer history' });
    }
  });

  // Delete individual transfer file
  router.delete('/files/:id', optionalAuthMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const fileId = req.params.id;
      const file = db.get('SELECT * FROM transfer_files WHERE id = ?', [fileId]);
      if (!file) {
        return res.status(404).json({ error: 'Transfer file not found' });
      }

      if (file.stored_path) {
        const diskPath = path.join(__dirname, '..', '..', file.stored_path);
        if (fs.existsSync(diskPath)) {
          try { fs.unlinkSync(diskPath); } catch (e) {}
        }
      }

      db.run('DELETE FROM transfer_files WHERE id = ?', [fileId]);
      res.json({ message: 'Transfer file removed successfully', fileId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete transfer file' });
    }
  });

  // Save transferred file directly to user's Boardsave Cloud storage
  router.post('/save-to-cloud/:fileId', authMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const file = db.get('SELECT * FROM transfer_files WHERE id = ?', [req.params.fileId]);
      if (!file) {
        return res.status(404).json({ error: 'Transferred file not found' });
      }

      const cloudId = 'file-' + uuidv4().substring(0, 8);
      const shareToken = 'share-' + uuidv4().substring(0, 10);
      const now = new Date().toISOString();

      // Determine category
      let category = 'other';
      if (file.file_type.startsWith('image/')) category = 'image';
      else if (file.file_type.startsWith('video/')) category = 'video';
      else if (file.file_type.startsWith('audio/')) category = 'music';
      else if (file.file_type.includes('pdf') || file.file_type.includes('text') || file.file_name.endsWith('.pdf') || file.file_name.endsWith('.docx')) category = 'document';
      else if (file.file_name.endsWith('.apk')) category = 'app';
      else if (file.file_name.endsWith('.zip') || file.file_name.endsWith('.rar')) category = 'archive';

      db.run(
        `INSERT INTO cloud_files (id, user_id, original_name, stored_name, mime_type, size, path, share_token, visibility, category, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cloudId,
          req.user.id,
          file.file_name,
          file.stored_path || ('transfer-' + file.file_name),
          file.file_type,
          file.file_size,
          file.stored_path || ('uploads/' + file.file_name),
          shareToken,
          'private',
          category,
          new Date(Date.now() + 30 * 86400000).toISOString(),
          now
        ]
      );

      const savedCloud = db.get('SELECT * FROM cloud_files WHERE id = ?', [cloudId]);
      res.status(201).json({ message: 'File saved to Boardsave Cloud', file: savedCloud });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save to cloud' });
    }
  });

  return router;
};
