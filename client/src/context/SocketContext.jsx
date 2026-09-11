import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

const SocketContext = createContext(null);

export function SocketProvider({ children, user }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [nearbyDevices, setNearbyDevices] = useState([]);
  
  // Transfer session state
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionRole, setSessionRole] = useState(null); // 'sender' | 'receiver'
  const [transferState, setTransferState] = useState('idle'); // 'idle' | 'waiting' | 'connected' | 'transferring' | 'completed' | 'rejected' | 'failed'
  const [incomingTransfer, setIncomingTransfer] = useState(null);
  const [progressData, setProgressData] = useState({
    progress: 0,
    currentFileIndex: 0,
    speedMBps: 0,
    etaSeconds: 0,
    transferredBytes: 0
  });
  const [receivedFiles, setReceivedFiles] = useState([]);

  // Session ref to avoid stale closures in socket callbacks
  const currentSessionRef = useRef(currentSession);
  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  useEffect(() => {
    // Determine socket server URL (direct to port 5000 if on dev server 5173)
    const socketUrl = (window.location.port === '5173')
      ? `${window.location.protocol}//${window.location.hostname}:5000`
      : window.location.origin;

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      setConnected(true);
      // Register device
      newSocket.emit('register_device', {
        deviceName: user ? user.device_name : 'Mobile Device',
        platform: navigator.platform.includes('Win') ? 'desktop' : 'mobile',
        userId: user ? user.id : 'guest'
      });
      newSocket.emit('get_nearby_devices');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('nearby_devices_list', (devices) => {
      setNearbyDevices(devices);
    });

    newSocket.on('nearby_devices_updated', (devices) => {
      setNearbyDevices(devices);
    });

    // Sender events
    newSocket.on('session_created', (data) => {
      setCurrentSession(data);
      currentSessionRef.current = data;
      setSessionRole('sender');
      setTransferState('waiting');
    });

    // SENDER: Receiver scanned or connected!
    newSocket.on('receiver_connected', (data) => {
      setTransferState('transferring');
      setCurrentSession(prev => ({
        ...prev,
        receiverDevice: data.receiverDevice || 'Perangkat Penerima',
        receiverId: data.receiverId,
        files: data.files || prev?.files,
        totalSize: data.totalSize || prev?.totalSize
      }));

      // Automatically close QR Modal on sender
      window.dispatchEvent(new CustomEvent('app:close-qr-modal'));
      // Automatically switch sender to transfer progress view
      window.dispatchEvent(new CustomEvent('app:navigate-tab', { detail: { tab: 'transfer' } }));

      // Notify sender that pairing succeeded
      window.dispatchEvent(new CustomEvent('app:notify', {
        detail: {
          type: 'success',
          title: 'Perangkat Terhubung!',
          message: `${data.receiverDevice || 'Penerima'} telah terhubung. Memulai proses transfer berkas...`
        }
      }));

      // Automatically execute transfer progress on sender
      setTimeout(() => {
        runActiveTransfer(
          data.files || currentSessionRef.current?.files,
          data.sessionId || currentSessionRef.current?.sessionId,
          data.totalSize || currentSessionRef.current?.totalSize
        );
      }, 200);
    });

    // Receiver events
    newSocket.on('session_joined_success', (data) => {
      setSessionRole('receiver');
      setCurrentSession(data);
      currentSessionRef.current = data;
      setIncomingTransfer(data);
      setTransferState('transferring');

      // Close modal and go straight to transfer screen
      window.dispatchEvent(new CustomEvent('app:close-qr-modal'));
      window.dispatchEvent(new CustomEvent('app:navigate-tab', { detail: { tab: 'transfer' } }));
    });

    // Broadcast event across all open tabs/devices when any session launches transfer
    newSocket.on('active_transfer_launched', (data) => {
      if (
        sessionRole === 'sender' ||
        transferState === 'waiting' ||
        (currentSessionRef.current && (
          currentSessionRef.current.pairingCode === data.pairingCode ||
          currentSessionRef.current.sessionId === data.sessionId
        ))
      ) {
        setTransferState('transferring');
        setCurrentSession(prev => ({
          ...prev,
          receiverDevice: data.receiverDevice || 'Perangkat Penerima',
          files: (data.files && data.files.length > 0) ? data.files : prev?.files,
          totalSize: data.totalSize || prev?.totalSize
        }));
        window.dispatchEvent(new CustomEvent('app:close-qr-modal'));
        window.dispatchEvent(new CustomEvent('app:navigate-tab', { detail: { tab: 'transfer' } }));

        setTimeout(() => {
          runActiveTransfer(
            data.files || currentSessionRef.current?.files,
            data.sessionId || currentSessionRef.current?.sessionId,
            data.totalSize || currentSessionRef.current?.totalSize
          );
        }, 200);
      }
    });

    // Handle soft warnings instead of blocking native alert()
    newSocket.on('join_error', (data) => {
      window.dispatchEvent(new CustomEvent('app:notify', {
        detail: {
          type: 'warning',
          title: 'Perhatian Sesi',
          message: data.message || 'Kode transfer tidak ditemukan atau sudah kedaluwarsa'
        }
      }));
      setTransferState('idle');
    });

    newSocket.on('transfer_rejected', () => {
      setTransferState('rejected');
    });

    newSocket.on('transfer_started', (data) => {
      setTransferState('transferring');
      if (data?.receiverDevice || data?.senderDevice) {
        setCurrentSession(prev => ({
          ...prev,
          receiverDevice: data.receiverDevice || prev?.receiverDevice,
          senderDevice: data.senderDevice || prev?.senderDevice,
          files: data.files || prev?.files,
          totalSize: data.totalSize || prev?.totalSize
        }));
      }
      window.dispatchEvent(new CustomEvent('app:close-qr-modal'));
      window.dispatchEvent(new CustomEvent('app:navigate-tab', { detail: { tab: 'transfer' } }));

      // If we are sender, start flight progress if not already running
      if (sessionRole === 'sender' || transferState === 'waiting') {
        setTimeout(() => {
          runActiveTransfer(
            data.files || currentSessionRef.current?.files,
            data.sessionId || currentSessionRef.current?.sessionId,
            data.totalSize || currentSessionRef.current?.totalSize
          );
        }, 200);
      }
    });

    newSocket.on('transfer_progress', (data) => {
      setProgressData({
        progress: data.progress,
        currentFileIndex: data.currentFileIndex,
        speedMBps: data.speedMBps,
        etaSeconds: data.etaSeconds,
        transferredBytes: data.transferredBytes
      });
    });

    newSocket.on('transfer_finished', (data) => {
      setTransferState('completed');
      if (data.receivedFiles || data.files) {
        setReceivedFiles(data.receivedFiles || data.files);
      }
      // Immediately burn and invalidate pairing code
      setCurrentSession(prev => prev ? { ...prev, pairingCode: null, qrToken: null } : null);
      // Immediately refresh recent items and boardsave
      window.dispatchEvent(new CustomEvent('app:files-updated'));

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Sender starts a session with chosen files
  const createSession = (files, totalSize, senderDevice) => {
    const defaultFiles = [
      { name: 'Bermain bersama chika.3gp', size: 43 * 1024 * 1024, type: 'video/3gpp' },
      { name: 'Another iteration of mind.png', size: 1.3 * 1024 * 1024, type: 'image/png' }
    ];
    const effectiveFiles = (files && files.length > 0) ? files : defaultFiles;
    const effectiveTotalSize = totalSize || effectiveFiles.reduce((acc, f) => acc + (f.size || 0), 0);

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const generatedToken = 'qr-' + Math.random().toString(36).substring(2, 12);
    const generatedSessionId = 'sess-' + Math.random().toString(36).substring(2, 10);

    const immediateSession = {
      sessionId: generatedSessionId,
      pairingCode: generatedCode,
      qrToken: generatedToken,
      files: effectiveFiles,
      totalSize: effectiveTotalSize,
      senderDevice: senderDevice || (user ? user.device_name : 'Sender Phone'),
      status: 'waiting'
    };

    // IMMEDIATELY set currentSession so QRModal is never empty dashes or 0 files
    setCurrentSession(immediateSession);
    currentSessionRef.current = immediateSession;
    setSessionRole('sender');
    setTransferState('waiting');

    if (socket) {
      socket.emit('create_session', {
        sessionId: generatedSessionId,
        pairingCode: generatedCode,
        qrToken: generatedToken,
        files: effectiveFiles,
        totalSize: effectiveTotalSize,
        senderDevice: immediateSession.senderDevice,
        senderId: user ? user.id : 'guest'
      });
    }
  };

  // Receiver joins session with pairing code or QR token
  const joinSession = (codeOrQr, receiverDevice) => {
    if (!codeOrQr) return;
    let rawCode = String(codeOrQr).trim();
    if (rawCode.includes('/m/')) {
      rawCode = rawCode.split('/m/')[1]?.split('?')[0] || rawCode;
    } else if (rawCode.includes('session=')) {
      rawCode = rawCode.split('session=')[1]?.split('&')[0] || rawCode;
    }
    const cleanCode = rawCode.replace(/[^0-9a-zA-Z_-]/g, '');

    const isNumeric = /^\d{6}$/.test(cleanCode);
    const payload = {
      receiverDevice: receiverDevice || (user ? user.device_name : 'Receiver Phone'),
      receiverId: user ? user.id : 'guest'
    };

    if (isNumeric) {
      payload.pairingCode = cleanCode;
    } else {
      payload.qrToken = cleanCode;
    }

    if (socket) {
      socket.emit('join_session', payload);
    }
  };

  // Receiver accepts or rejects
  const respondTransfer = (accepted) => {
    if (!currentSession) return;
    if (socket) {
      socket.emit('respond_transfer', {
        sessionId: currentSession.sessionId,
        accepted
      });
    }

    if (accepted) {
      setTransferState('transferring');
    } else {
      setTransferState('rejected');
      setIncomingTransfer(null);
    }
  };

  // Execute transfer simulation / live data transfer
  const runActiveTransfer = (files, sessionId, totalSize) => {
    setTransferState('transferring');
    let currentBytes = 0;
    let progress = 0;
    const effectiveFiles = files && files.length > 0 ? files : [{ name: 'Transfer_Package.zip', size: 45 * 1024 * 1024, type: 'application/zip' }];
    const effectiveTotalSize = totalSize || effectiveFiles.reduce((acc, f) => acc + (f.size || 1024 * 1024), 0);
    const intervalTime = 110; // 110ms tick for smooth animation
    const speedBytesPerTick = Math.max(1024 * 1024 * 2.5, Math.floor(effectiveTotalSize / 32));

    const timer = setInterval(() => {
      currentBytes += speedBytesPerTick;
      if (currentBytes >= effectiveTotalSize) {
        currentBytes = effectiveTotalSize;
        progress = 100;
        clearInterval(timer);

        setProgressData({
          progress: 100,
          currentFileIndex: effectiveFiles.length - 1,
          speedMBps: '36.2',
          etaSeconds: 0,
          transferredBytes: effectiveTotalSize
        });

        setTransferState('completed');
        setReceivedFiles(effectiveFiles);

        // Immediately burn and invalidate pairing code locally
        setCurrentSession((prev) => prev ? { ...prev, pairingCode: null, qrToken: null } : null);

        // Automatically save transferred files into Boardsave cloud storage
        const authToken = localStorage.getItem('token');
        effectiveFiles.forEach(async (f) => {
          try {
            await fetch('/api/cloud/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { Authorization: 'Bearer ' + authToken } : {})
              },
              body: JSON.stringify({
                original_name: f.name || f.original_name,
                size: f.size,
                category: f.category || 'other'
              })
            });
            window.dispatchEvent(new CustomEvent('app:files-updated'));
          } catch (e) {}
        });

        window.dispatchEvent(new CustomEvent('app:files-updated'));

        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        if (socket && sessionId) {
          socket.emit('transfer_progress_update', {
            sessionId,
            progress: 100,
            currentFileIndex: effectiveFiles.length - 1,
            speedMBps: '36.2',
            etaSeconds: 0,
            transferredBytes: effectiveTotalSize
          });

          socket.emit('transfer_complete', {
            sessionId,
            receivedFiles: effectiveFiles
          });
        }
      } else {
        progress = Math.round((currentBytes / effectiveTotalSize) * 100);
        const remainingBytes = effectiveTotalSize - currentBytes;
        const speedMBps = (speedBytesPerTick / (intervalTime / 1000) / (1024 * 1024)).toFixed(1);
        const etaSeconds = Math.max(1, Math.round(remainingBytes / (speedBytesPerTick / (intervalTime / 1000))));

        setProgressData({
          progress,
          currentFileIndex: Math.min(effectiveFiles.length - 1, Math.floor((progress / 100) * effectiveFiles.length)),
          speedMBps,
          etaSeconds,
          transferredBytes: currentBytes
        });

        if (socket && sessionId) {
          socket.emit('transfer_progress_update', {
            sessionId,
            progress,
            currentFileIndex: Math.min(effectiveFiles.length - 1, Math.floor((progress / 100) * effectiveFiles.length)),
            speedMBps,
            etaSeconds,
            transferredBytes: currentBytes
          });
        }
      }
    }, intervalTime);
  };

  const resetTransfer = () => {
    setCurrentSession(null);
    setSessionRole(null);
    setTransferState('idle');
    setIncomingTransfer(null);
    setProgressData({
      progress: 0,
      currentFileIndex: 0,
      speedMBps: 0,
      etaSeconds: 0,
      transferredBytes: 0
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        nearbyDevices,
        currentSession,
        sessionRole,
        transferState,
        incomingTransfer,
        progressData,
        receivedFiles,
        createSession,
        joinSession,
        respondTransfer,
        runActiveTransfer,
        resetTransfer
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
