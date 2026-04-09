const router = require('express').Router();
const auth = require('../middleware/auth');
const { uploadPostMedia } = require('../config/cloudinary');
const {
  createPost,
  getTimeline,
  getPost,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  getUserPosts,
} = require('../controllers/postController');

router.post('/', auth, uploadPostMedia.single('media'), createPost);
router.get('/timeline', auth, getTimeline);
router.get('/user/:userId', auth, getUserPosts);
router.get('/:id', auth, getPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.put('/:id/like', auth, likePost);
router.post('/:id/comment', auth, commentPost);

module.exports = router;
