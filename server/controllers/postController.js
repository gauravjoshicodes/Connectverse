const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Create a post
// @route   POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const postData = {
      userId: req.user._id,
      text,
    };

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video');
      if (isVideo) {
        postData.video = req.file.path; // Cloudinary URL
      } else {
        postData.image = req.file.path; // Cloudinary URL
      }
    }

    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id).populate(
      'userId',
      'username fullName profilePicture'
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Get timeline posts
// @route   GET /api/posts/timeline
exports.getTimeline = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const userIds = [req.user._id, ...user.following];

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId: { $in: userIds } })
      .populate('userId', 'username fullName profilePicture')
      .populate('comments.userId', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ userId: { $in: userIds } });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single post
// @route   GET /api/posts/:id
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username fullName profilePicture')
      .populate('comments.userId', 'username fullName profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.text = req.body.text || post.text;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('userId', 'username fullName profilePicture')
      .populate('comments.userId', 'username fullName profilePicture');

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Clean up Cloudinary assets
    if (post.image) {
      const publicId = post.image.split('/').slice(-2).join('/').split('.')[0];
      await deleteFromCloudinary(publicId);
    }
    if (post.video) {
      const publicId = post.video.split('/').slice(-2).join('/').split('.')[0];
      await deleteFromCloudinary(publicId, 'video');
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/:id/like
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      post.likes.push(req.user._id);

      // Create notification (don't notify self)
      if (post.userId.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: post.userId,
          senderId: req.user._id,
          type: 'like',
          referenceId: post._id,
          text: `${req.user.username} liked your post`,
        });
      }
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ likes: post.likes, likeCount: post.likes.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
exports.commentPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      userId: req.user._id,
      text: req.body.text,
    });

    // Create notification
    if (post.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: post.userId,
        senderId: req.user._id,
        type: 'comment',
        referenceId: post._id,
        text: `${req.user.username} commented on your post`,
      });
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('userId', 'username fullName profilePicture')
      .populate('comments.userId', 'username fullName profilePicture');

    res.json(updatedPost.comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:userId
exports.getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate('userId', 'username fullName profilePicture')
      .populate('comments.userId', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    next(error);
  }
};
