const User = require('../models/User');

// Map of userId -> socketId
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User comes online
    socket.on('userOnline', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      // Update DB
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Broadcast online status
      io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
      console.log(`✅ User online: ${userId}`);
    });

    // Join a chat room
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`📩 User joined chat: ${chatId}`);
    });

    // Leave a chat room
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
    });

    // Send message (real-time)
    socket.on('sendMessage', (data) => {
      const { chatId, message } = data;
      socket.to(chatId).emit('receiveMessage', message);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { chatId, userId, username } = data;
      socket.to(chatId).emit('userTyping', { userId, username });
    });

    socket.on('stopTyping', (data) => {
      const { chatId, userId } = data;
      socket.to(chatId).emit('userStopTyping', { userId });
    });

    // New post broadcast
    socket.on('newPost', (post) => {
      socket.broadcast.emit('postBroadcast', post);
    });

    // Notification (real-time)
    socket.on('sendNotification', (data) => {
      const { receiverId, notification } = data;
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('receiveNotification', notification);
      }
    });

    // Like notification
    socket.on('likePost', (data) => {
      const { receiverId, notification } = data;
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('receiveNotification', notification);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        // Update DB
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
        console.log(`❌ User offline: ${socket.userId}`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
