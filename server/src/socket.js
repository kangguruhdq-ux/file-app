const { v4: uuidv4 } = require('uuid');

function setupSocketIO(io, dbPromise) {
  // In-memory active sessions: sessionId -> { senderSocketId, receiverSocketId, pairingCode, qrToken, ... }
  const activeSessions = new Map();
  // pairingCode -> sessionId
  const codeToSession = new Map();
  // qrToken -> sessionId
  const qrToSession = new Map();

  // Connected devices: socketId -> deviceInfo
  const connectedDevices = new Map();

  io.on('connection', (socket) => {
    // console.log(`Socket connected: ${socket.id}`);

    // Register device info
    socket.on('register_device', (deviceInfo) => {
      connectedDevices.set(socket.id, {
        socketId: socket.id,
        deviceName: deviceInfo.deviceName || 'Unknown Device',
        platform: deviceInfo.platform || 'web',
        userId: deviceInfo.userId || 'guest',
        lastSeen: new Date().toISOString()
      });
      // Broadcast updated nearby list
      io.emit('nearby_devices_updated', getNearbyList());
    });

    // Request nearby devices
    socket.on('get_nearby_devices', () => {
      socket.emit('nearby_devices_list', getNearbyList());
    });

    // Create a new transfer session (Sender)
    socket.on('create_session', async (data) => {
      const db = await dbPromise;
      const sessionId = 'sess-' + uuidv4().substring(0, 8);
      // Generate 6-digit pairing code
      let pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
      const qrToken = 'qr-' + uuidv4().substring(0, 12);

      const sessionData = {
        sessionId,
        senderSocketId: socket.id,
        receiverSocketId: null,
        senderDevice: data.senderDevice || "Sender's Device",
        receiverDevice: null,
        senderId: data.senderId || 'guest',
        receiverId: null,
        pairingCode,
        qrToken,
        files: data.files || [],
        totalSize: data.totalSize || 0,
        totalFiles: (data.files || []).length,
        status: 'waiting',
        createdAt: new Date().toISOString()
      };

      activeSessions.set(sessionId, sessionData);
      codeToSession.set(pairingCode, sessionId);
      qrToSession.set(qrToken, sessionId);

      socket.join(sessionId);

      // Save to database
      try {
        db.run(
          `INSERT INTO transfer_sessions (id, sender_id, receiver_id, sender_device, receiver_device, pairing_code, qr_token, status, total_size, total_files, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [sessionId, sessionData.senderId, null, sessionData.senderDevice, null, pairingCode, qrToken, 'waiting', sessionData.totalSize, sessionData.totalFiles, sessionData.createdAt]
        );

        for (const file of sessionData.files) {
          db.run(
            `INSERT INTO transfer_files (id, session_id, file_name, file_type, file_size, stored_path, status, progress, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), sessionId, file.name, file.type, file.size, '', 'pending', 0, sessionData.createdAt]
          );
        }
      } catch (err) {
        console.error('Error saving transfer session to DB:', err);
      }

      socket.emit('session_created', {
        sessionId,
        pairingCode,
        qrToken,
        files: sessionData.files,
        totalSize: sessionData.totalSize
      });
    });

    // Join transfer session by pairing code or QR token (Receiver)
    socket.on('join_session', async (data) => {
      let sessionId = null;
      if (data.pairingCode) {
        sessionId = codeToSession.get(data.pairingCode.replace(/\s+/g, ''));
      } else if (data.qrToken) {
        sessionId = qrToSession.get(data.qrToken);
      } else if (data.sessionId) {
        sessionId = data.sessionId;
      }

      if (!sessionId || !activeSessions.has(sessionId)) {
        return socket.emit('join_error', { message: 'Kode transfer ini tidak valid atau sudah hangus' });
      }

      const session = activeSessions.get(sessionId);
      if (session.status === 'completed') {
        return socket.emit('join_error', { message: 'Kode transfer ini sudah hangus karena transfer telah selesai' });
      }
      if (session.status !== 'waiting' && session.status !== 'connected') {
        return socket.emit('join_error', { message: 'Sesi transfer ini sudah tidak aktif' });
      }

      session.receiverSocketId = socket.id;
      session.receiverDevice = data.receiverDevice || "Receiver's Device";
      session.receiverId = data.receiverId || 'guest';
      session.status = 'connected';

      socket.join(sessionId);

      // Update database
      try {
        const db = await dbPromise;
        db.run(
          `UPDATE transfer_sessions SET receiver_id = ?, receiver_device = ?, status = 'connected' WHERE id = ?`,
          [session.receiverId, session.receiverDevice, sessionId]
        );
      } catch (err) {
        console.error('Error updating transfer session:', err);
      }

      // Notify sender that receiver connected
      io.to(session.senderSocketId).emit('receiver_connected', {
        sessionId,
        receiverDevice: session.receiverDevice,
        receiverId: session.receiverId
      });

      // Notify receiver with session and incoming files
      socket.emit('session_joined_success', {
        sessionId,
        senderDevice: session.senderDevice,
        files: session.files,
        totalSize: session.totalSize
      });
    });

    // Receiver accepts or rejects incoming files
    socket.on('respond_transfer', async (data) => {
      const { sessionId, accepted } = data;
      const session = activeSessions.get(sessionId);
      if (!session) return;

      if (!accepted) {
        session.status = 'rejected';
        io.to(session.senderSocketId).emit('transfer_rejected', { sessionId });
        socket.emit('transfer_rejected', { sessionId });
        return;
      }

      session.status = 'transferring';
      session.startTime = Date.now();
      session.transferredBytes = 0;

      // Update DB
      try {
        const db = await dbPromise;
        db.run(`UPDATE transfer_sessions SET status = 'transferring' WHERE id = ?`, [sessionId]);
      } catch (err) {}

      // Tell both to begin transfer
      io.to(sessionId).emit('transfer_started', {
        sessionId,
        files: session.files,
        totalSize: session.totalSize
      });
    });

    // Progress updates relayed during transfer
    socket.on('transfer_progress_update', (data) => {
      const { sessionId, progress, currentFileIndex, speedMBps, etaSeconds, transferredBytes } = data;
      const session = activeSessions.get(sessionId);
      if (!session) return;

      // Broadcast progress to both sender and receiver
      io.to(sessionId).emit('transfer_progress', {
        sessionId,
        progress,
        currentFileIndex,
        speedMBps,
        etaSeconds,
        transferredBytes
      });
    });

    // File relay chunk (for actual data or simulation)
    socket.on('send_file_chunk', (data) => {
      const { sessionId, chunk, fileIndex, chunkIndex, totalChunks } = data;
      const session = activeSessions.get(sessionId);
      if (!session || !session.receiverSocketId) return;

      // Send to receiver
      io.to(session.receiverSocketId).emit('receive_file_chunk', {
        sessionId,
        chunk,
        fileIndex,
        chunkIndex,
        totalChunks
      });
    });

    // Session completed
    socket.on('transfer_complete', async (data) => {
      const { sessionId, receivedFiles } = data;
      const session = activeSessions.get(sessionId);
      if (!session) return;

      session.status = 'completed';
      const completedAt = new Date().toISOString();

      // Immediately burn/invalidate the pairing code & QR token so it cannot be reused
      if (session.pairingCode) codeToSession.delete(session.pairingCode);
      if (session.qrToken) qrToSession.delete(session.qrToken);

      try {
        const db = await dbPromise;
        db.run(
          `UPDATE transfer_sessions SET status = 'completed', completed_at = ? WHERE id = ?`,
          [completedAt, sessionId]
        );
        db.run(`UPDATE transfer_files SET status = 'completed', progress = 100 WHERE session_id = ?`, [sessionId]);

        // Auto-save received files directly into Boardsave Cloud repository
        const receiverUserId = (session.receiverId && session.receiverId !== 'guest') ? session.receiverId : 'user-florian';
        const filesToSave = (receivedFiles && receivedFiles.length > 0) ? receivedFiles : session.files;

        for (const file of filesToSave) {
          const fileId = 'file-' + uuidv4().substring(0, 8);
          const shareToken = 'share-' + uuidv4().substring(0, 10);
          const fileName = file.name || file.original_name || 'received-file';
          const category = file.category || 'other';

          db.run(
            `INSERT INTO cloud_files (id, user_id, original_name, stored_name, mime_type, size, path, share_token, visibility, category, expires_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fileId,
              receiverUserId,
              fileName,
              'received-' + fileName.replace(/[^a-zA-Z0-9._-]/g, '_'),
              file.type || 'application/octet-stream',
              Number(file.size) || 1024 * 1024,
              'uploads/received-' + fileName,
              shareToken,
              'private',
              category,
              null,
              new Date().toISOString()
            ]
          );
        }
      } catch (err) {
        console.error('Error completing session and auto-saving to Boardsave in DB:', err);
      }

      io.to(sessionId).emit('transfer_finished', {
        sessionId,
        completedAt,
        files: session.files,
        totalSize: session.totalSize,
        receivedFiles: receivedFiles || session.files,
        autoSavedToBoardsave: true
      });

      // Cleanup active session object
      activeSessions.delete(sessionId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      connectedDevices.delete(socket.id);
      io.emit('nearby_devices_updated', getNearbyList());
    });
  });

  function getNearbyList() {
    // Return real connected devices + standard simulated nearby devices
    const realDevices = Array.from(connectedDevices.values()).map(d => ({
      id: d.socketId,
      name: d.deviceName,
      platform: d.platform,
      isReal: true,
      signal: 95
    }));

    const simulatedDevices = [
      { id: 'sim-dev-1', name: "Sarah's iPhone 15 Pro", platform: 'ios', isReal: false, signal: 92 },
      { id: 'sim-dev-2', name: 'Samsung Galaxy Tab S9', platform: 'android', isReal: false, signal: 85 },
      { id: 'sim-dev-3', name: 'MacBook Air M3 (Work)', platform: 'desktop', isReal: false, signal: 78 },
      { id: 'sim-dev-4', name: 'Google Pixel 8 Pro', platform: 'android', isReal: false, signal: 64 }
    ];

    return [...realDevices, ...simulatedDevices];
  }
}

module.exports = {
  setupSocketIO
};
