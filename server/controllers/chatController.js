const Chat = require('../models/Chat');
const Message = require('../models/Message');

// @desc    Create or get a chat
// @route   POST /api/chats
exports.createChat = async (req, res, next) => {
  try {
    const { receiverId } = req.body;

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, receiverId] },
    }).populate('participants', 'username fullName profilePicture isOnline lastSeen');

    if (existingChat) {
      return res.json(existingChat);
    }

    const chat = await Chat.create({
      participants: [req.user._id, receiverId],
    });

    const populatedChat = await Chat.findById(chat._id).populate(
      'participants',
      'username fullName profilePicture isOnline lastSeen'
    );

    res.status(201).json(populatedChat);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's chats
// @route   GET /api/chats
exports.getUserChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate('participants', 'username fullName profilePicture isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single chat
// @route   GET /api/chats/:id
exports.getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'username fullName profilePicture isOnline lastSeen')
      .populate('lastMessage');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    res.json(chat);
  } catch (error) {
    next(error);
  }
};
