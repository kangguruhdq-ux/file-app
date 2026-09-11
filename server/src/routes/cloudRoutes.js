const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, optionalAuthMiddleware } = require('../auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'cloud-' + uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
});

const upload = multer({ storage });

function getCategoryFromMime(mimeType, filename = '') {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'music';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text') || filename.endsWith('.txt') || filename.endsWith('.pdf') || filename.endsWith('.docx')) return 'document';
  if (mimeType.includes('android.package-archive') || filename.endsWith('.apk')) return 'app';
  if (filename.endsWith('.zip') || filename.endsWith('.rar') || filename.endsWith('.tar') || filename.endsWith('.7z')) return 'archive';
  return 'other';
}

module.exports = function (dbPromise) {
  // Get user cloud files (supports category & search query)
  router.get('/files', authMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const { category, search, sort } = req.query;

      let query = 'SELECT * FROM cloud_files WHERE user_id = ?';
      const params = [req.user.id];

      if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND original_name LIKE ?';
        params.push(`%${search}%`);
      }

      if (sort === 'size_desc') {
        query += ' ORDER BY size DESC';
      } else if (sort === 'name_asc') {
        query += ' ORDER BY original_name ASC';
      } else {
        query += ' ORDER BY created_at DESC';
      }

      const files = db.all(query, params);

      // Storage quota summary
      const plan = db.get('SELECT * FROM plans WHERE id = ?', [req.user.plan_id || 'free']);
      const storageUsage = db.get('SELECT SUM(size) as total_used, COUNT(*) as file_count FROM cloud_files WHERE user_id = ?', [req.user.id]);

      const usedBytes = storageUsage && storageUsage.total_used ? Number(storageUsage.total_used) : 0;
      const maxStorage = plan ? Number(plan.max_storage) : 10 * 1024 * 1024 * 1024;

      res.json({
        files,
        stats: {
          usedBytes,
          maxStorage,
          fileCount: storageUsage ? Number(storageUsage.file_count) : 0,
          planName: plan ? plan.name : 'Free'
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch cloud files' });
    }
  });

  // Upload file to cloud storage
  router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
      const db = await dbPromise;
      const user = db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
      const plan = db.get('SELECT * FROM plans WHERE id = ?', [user ? user.plan_id : 'free']);

      // Check file upload
      if (!req.file) {
        // Allow mock file creation if requested
        const { original_name, size, category } = req.body;
        if (!original_name) {
          return res.status(400).json({ error: 'No file uploaded or file metadata provided' });
        }

        const fileId = 'file-' + uuidv4().substring(0, 8);
        const shareToken = 'share-' + uuidv4().substring(0, 10);
        const expiryDays = plan && plan.link_expiry_days > 0 ? plan.link_expiry_days : 7;
        const expiresAt = plan && plan.link_expiry_days === -1 ? null : new Date(Date.now() + expiryDays * 86400000).toISOString();

        db.run(
          `INSERT INTO cloud_files (id, user_id, original_name, stored_name, mime_type, size, path, share_token, visibility, category, expires_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fileId,
            req.user.id,
            original_name,
            'virtual-' + original_name,
            category === 'image' ? 'image/png' : 'application/octet-stream',
            Number(size) || 1024 * 1024,
            'uploads/mock-' + original_name,
            shareToken,
            'private',
            category || 'other',
            expiresAt,
            new Date().toISOString()
          ]
        );

        const created = db.get('SELECT * FROM cloud_files WHERE id = ?', [fileId]);
        return res.status(201).json({ message: 'File added to cloud storage', file: created });
      }

      // Check quota
      const usage = db.get('SELECT SUM(size) as total_used FROM cloud_files WHERE user_id = ?', [req.user.id]);
      const currentUsed = usage && usage.total_used ? Number(usage.total_used) : 0;
      const maxAllowed = plan ? Number(plan.max_storage) : 10 * 1024 * 1024 * 1024;

      if (maxAllowed !== -1 && currentUsed + req.file.size > maxAllowed) {
        // remove uploaded temp file
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        return res.status(403).json({ error: 'Storage quota exceeded for your current plan. Please upgrade to Pro or Unlimited.' });
      }

      const fileId = 'file-' + uuidv4().substring(0, 8);
      const shareToken = 'share-' + uuidv4().substring(0, 12);
      const category = getCategoryFromMime(req.file.mimetype, req.file.originalname);
      const expiryDays = plan && plan.link_expiry_days > 0 ? plan.link_expiry_days : 7;
      const expiresAt = plan && plan.link_expiry_days === -1 ? null : new Date(Date.now() + expiryDays * 86400000).toISOString();

      db.run(
        `INSERT INTO cloud_files (id, user_id, original_name, stored_name, mime_type, size, path, share_token, visibility, category, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fileId,
          req.user.id,
          req.file.originalname,
          req.file.filename,
          req.file.mimetype,
          req.file.size,
          'uploads/' + req.file.filename,
          shareToken,
          'private',
          category,
          expiresAt,
          new Date().toISOString()
        ]
      );

      const savedFile = db.get('SELECT * FROM cloud_files WHERE id = ?', [fileId]);
      res.status(201).json({ message: 'File saved to cloud', file: savedFile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to upload to cloud' });
    }
  });

  // Generate / toggle public share link
  router.post('/share/:id', authMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const file = db.get('SELECT * FROM cloud_files WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      let shareToken = file.share_token;
      if (!shareToken) {
        shareToken = 'share-' + uuidv4().substring(0, 12);
      }

      const visibility = file.visibility === 'public' ? 'private' : 'public';
      db.run('UPDATE cloud_files SET visibility = ?, share_token = ? WHERE id = ?', [visibility, shareToken, file.id]);

      res.json({
        message: `File is now ${visibility}`,
        shareToken,
        visibility,
        shareUrl: `/share/${shareToken}`
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate share link' });
    }
  });

  // Delete cloud file
  router.delete('/files/:id', authMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const file = db.get('SELECT * FROM cloud_files WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // If real file on disk, remove
      const diskPath = path.join(__dirname, '..', '..', file.path);
      if (fs.existsSync(diskPath)) {
        try { fs.unlinkSync(diskPath); } catch (e) {}
      }

      db.run('DELETE FROM cloud_files WHERE id = ?', [file.id]);
      res.json({ message: 'File deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });

  // Rename cloud file
  router.put('/files/:id/rename', authMiddleware, async (req, res) => {
    try {
      const { newName } = req.body;
      if (!newName || !newName.trim()) {
        return res.status(400).json({ error: 'New name is required' });
      }

      const db = await dbPromise;
      db.run('UPDATE cloud_files SET original_name = ? WHERE id = ? AND user_id = ?', [newName.trim(), req.params.id, req.user.id]);
      const updated = db.get('SELECT * FROM cloud_files WHERE id = ?', [req.params.id]);
      res.json({ message: 'File renamed successfully', file: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to rename file' });
    }
  });

  // Public shared file view & download
  router.get('/public-share/:token', async (req, res) => {
    try {
      const db = await dbPromise;
      const file = db.get('SELECT * FROM cloud_files WHERE share_token = ?', [req.params.token]);
      if (!file) {
        return res.status(404).json({ error: 'Shared file not found or link is invalid' });
      }

      if (file.visibility !== 'public') {
        return res.status(403).json({ error: 'This file is private' });
      }

      // Check expiration
      if (file.expires_at) {
        const expiryDate = new Date(file.expires_at);
        if (expiryDate < new Date()) {
          return res.status(410).json({ error: 'This link has expired', isExpired: true });
        }
      }

      const user = db.get('SELECT name, avatar FROM users WHERE id = ?', [file.user_id]);

      res.json({
        file: {
          id: file.id,
          name: file.original_name,
          size: file.size,
          category: file.category,
          mimeType: file.mime_type,
          expiresAt: file.expires_at,
          uploaderName: user ? user.name : 'Anonymous',
          downloadUrl: `/api/cloud/download/${file.share_token}`
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error retrieving shared file' });
    }
  });

  // Download shared file
  router.get('/download/:token', async (req, res) => {
    try {
      const db = await dbPromise;
      const file = db.get('SELECT * FROM cloud_files WHERE share_token = ?', [req.params.token]);
      if (!file) {
        return res.status(404).send('File not found');
      }

      const diskPath = path.join(__dirname, '..', '..', file.path);
      if (fs.existsSync(diskPath)) {
        return res.download(diskPath, file.original_name);
      } else {
        // Create an on-the-fly text buffer if it was a demo virtual file
        res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
        res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
        res.send(Buffer.from(`Demo file content for ${file.original_name} from File Transfer App.`));
      }
    } catch (err) {
      res.status(500).send('Error downloading file');
    }
  });

  return router;
};
