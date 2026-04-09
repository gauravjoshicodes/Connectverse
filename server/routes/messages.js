const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  markAsRead,
} = require('../controllers/messageController');

router.post('/', auth, sendMessage);
router.get('/:chatId', auth, getMessages);
router.put('/read/:chatId', auth, markAsRead);

module.exports = router;
