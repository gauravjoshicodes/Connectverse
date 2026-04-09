const router = require('express').Router();
const auth = require('../middleware/auth');
const { uploadProfilePic } = require('../config/cloudinary');
const {
  getUser,
  updateUser,
  updateProfile,
  followUser,
  searchUsers,
  getSuggestions,
  savePost,
  getFollowers,
  getFollowing,
} = require('../controllers/userController');

router.get('/search', auth, searchUsers);
router.get('/suggestions', auth, getSuggestions);
router.put('/update', auth, uploadProfilePic.single('profilePicture'), updateProfile);
router.get('/:id', auth, getUser);
router.put('/:id', auth, uploadProfilePic.single('profilePicture'), updateUser);
router.put('/:id/follow', auth, followUser);
router.put('/save/:postId', auth, savePost);
router.get('/:id/followers', auth, getFollowers);
router.get('/:id/following', auth, getFollowing);

module.exports = router;
