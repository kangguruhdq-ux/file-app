const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Server } = require('socket.io');

const { getDatabase } = require('./db');
const { setupSocketIO } = require('./socket');

const authRoutes = require('./routes/authRoutes');
const transferRoutes = require('./routes/transferRoutes');
const cloudRoutes = require('./routes/cloudRoutes');
const planRoutes = require('./routes/planRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e8 // 100 MB buffer
});

// Initialize Database & Routes
const dbPromise = getDatabase();
setupSocketIO(io, dbPromise);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'File Transfer App Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes(dbPromise));
app.use('/api/transfers', transferRoutes(dbPromise));
app.use('/api/cloud', cloudRoutes(dbPromise));
app.use('/api/plans', planRoutes(dbPromise));
app.use('/api/admin', adminRoutes(dbPromise));
app.use('/api/support', supportRoutes(dbPromise));

// Serve built frontend if dist exists
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`[SERVER] File Transfer App Server running on port ${PORT}`);
  console.log(`[SOCKET] WebSocket ready on ws://localhost:${PORT}`);
  console.log(`[STORAGE] Storage path: ${uploadsDir}`);
  console.log(`=============================================`);
});
