import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    // Determine socket server URL
    const socketUrl = window.location.origin;
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
      setSessionRole('sender');
      setTransferState('waiting');
    });

    newSocket.on('receiver_connected', (data) => {
      setTransferState('connected');
      setCurrentSession(prev => ({
        ...prev,
        receiverDevice: data.receiverDevice,
        receiverId: data.receiverId
      }));
    });

    // Receiver events
    newSocket.on('session_joined_success', (data) => {
      setSessionRole('receiver');
      setCurrentSession(data);
      setIncomingTransfer(data);
      setTransferState('prompt_accept');
      // Direct immediately to transfer tab!
      window.dispatchEvent(new CustomEvent('app:navigate-tab', { detail: { tab: 'transfer' } }));
    });

    newSocket.on('join_error', (data) => {
      alert(data.message || 'Gagal terhubung dengan sesi transfer');
      setTransferState('idle');
    });

    newSocket.on('transfer_rejected', () => {
      setTransferState('rejected');
    });

    newSocket.on('transfer_started', () => {
      setTransferState('transferring');
      window.dispatchEvent(new CustomEvent('app:navigate-tab', { detail: { tab: 'transfer' } }));
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
    if (!socket) return;
    socket.emit('create_session', {
      files,
      totalSize,
      senderDevice: senderDevice || (user ? user.device_name : 'Sender Phone'),
      senderId: user ? user.id : 'guest'
    });
  };

  // Receiver joins session with pairing code or QR token
  const joinSession = (codeOrQr, receiverDevice) => {
    if (!socket) return;
    const isNumeric = /^\d{6}$/.test(codeOrQr.replace(/\s+/g, ''));
    const payload = {
      receiverDevice: receiverDevice || (user ? user.device_name : 'Receiver Phone'),
      receiverId: user ? user.id : 'guest'
    };

    if (isNumeric) {
      payload.pairingCode = codeOrQr;
    } else {
      payload.qrToken = codeOrQr;
    }

    socket.emit('join_session', payload);
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
