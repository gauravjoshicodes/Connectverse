const router = require('express').Router();
const { register, login, getMe, firebaseAuth } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseAuth);
router.get('/me', auth, getMe);

module.exports = router;
