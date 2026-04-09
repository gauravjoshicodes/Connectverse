const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  createChat,
  getUserChats,
  getChat,
} = require('../controllers/chatController');

router.post('/', auth, createChat);
router.get('/', auth, getUserChats);
router.get('/:id', auth, getChat);

module.exports = router;
