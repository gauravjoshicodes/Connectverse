const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc    Send a message
// @route   POST /api/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId, text } = req.body;

    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      text,
    });

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'senderId',
      'username fullName profilePicture'
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
exports.getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'username fullName profilePicture')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ chatId: req.params.chatId });

    res.json({
      messages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:chatId
exports.markAsRead = async (req, res, next) => {
  try {
    await Message.updateMany(
      {
        chatId: req.params.chatId,
        senderId: { $ne: req.user._id },
        read: false,
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};
