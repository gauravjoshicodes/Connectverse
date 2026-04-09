const Story = require('../models/Story');
const User = require('../models/User');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Create a story
// @route   POST /api/stories
exports.createStory = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Media file is required' });
    }

    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    const story = await Story.create({
      userId: req.user._id,
      media: req.file.path, // Cloudinary URL
      mediaType,
      caption: req.body.caption || '',
    });

    const populatedStory = await Story.findById(story._id).populate(
      'userId',
      'username fullName profilePicture'
    );

    res.status(201).json(populatedStory);
  } catch (error) {
    next(error);
  }
};

// @desc    Get stories feed (from following + own)
// @route   GET /api/stories
exports.getStories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const userIds = [req.user._id, ...user.following];

    const stories = await Story.find({
      userId: { $in: userIds },
      expiresAt: { $gt: new Date() },
    })
      .populate('userId', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    // Group stories by user
    const groupedStories = {};
    stories.forEach((story) => {
      const uid = story.userId._id.toString();
      if (!groupedStories[uid]) {
        groupedStories[uid] = {
          user: story.userId,
          stories: [],
        };
      }
      groupedStories[uid].stories.push(story);
    });

    res.json(Object.values(groupedStories));
  } catch (error) {
    next(error);
  }
};

// @desc    View a story (marks as viewed)
// @route   PUT /api/stories/:id/view
exports.viewStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.json({ viewers: story.viewers });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Clean up Cloudinary asset
    if (story.media) {
      const publicId = story.media.split('/').slice(-2).join('/').split('.')[0];
      const resourceType = story.mediaType === 'video' ? 'video' : 'image';
      await deleteFromCloudinary(publicId, resourceType);
    }

    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted' });
  } catch (error) {
    next(error);
  }
};
