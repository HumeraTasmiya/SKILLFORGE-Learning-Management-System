export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── Live Class ───────────────────────────────────────────
    socket.on('join-room', ({ roomId, userId, userName }) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', { userId, userName });
      console.log(`${userName} joined room: ${roomId}`);
    });

    socket.on('leave-room', ({ roomId, userId, userName }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userId, userName });
    });

    // WebRTC signaling for live class
    socket.on('offer', ({ roomId, offer, fromId }) => {
      socket.to(roomId).emit('offer', { offer, fromId });
    });

    socket.on('answer', ({ roomId, answer, fromId }) => {
      socket.to(roomId).emit('answer', { answer, fromId });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate });
    });

    // ─── Live Class Chat ──────────────────────────────────────
    socket.on('send-message', ({ roomId, message, userName, userId }) => {
      io.to(roomId).emit('receive-message', {
        message,
        userName,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    // ─── Notifications ────────────────────────────────────────
    socket.on('subscribe-notifications', (userId) => {
      socket.join(`user-${userId}`);
    });

    // ─── Coding Streak Update ─────────────────────────────────
    socket.on('activity', ({ userId }) => {
      io.to(`user-${userId}`).emit('streak-updated');
    });

    // ─── Quiz Real-time ───────────────────────────────────────
    socket.on('quiz-answer', ({ roomId, userId, questionId, answer }) => {
      socket.to(roomId).emit('quiz-answer-received', {
        userId,
        questionId,
        answer,
        timestamp: Date.now(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

// Utility to send notification to a specific user
export const sendNotification = (io, userId, notification) => {
  io.to(`user-${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};
