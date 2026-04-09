const router = require('express').Router();
const auth = require('../middleware/auth');
const { uploadStoryMedia } = require('../config/cloudinary');
const {
  createStory,
  getStories,
  viewStory,
  deleteStory,
} = require('../controllers/storyController');

router.post('/', auth, uploadStoryMedia.single('media'), createStory);
router.get('/', auth, getStories);
router.put('/:id/view', auth, viewStory);
router.delete('/:id', auth, deleteStory);

module.exports = router;
