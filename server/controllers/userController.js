const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get user profile
// @route   GET /api/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { fullName, bio, location, website } = req.body;
    const updates = { fullName, bio, location, website };

    if (req.file) {
      updates.profilePicture = req.file.path; // Cloudinary URL
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select('-password');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile specifically
// @route   PUT /api/users/update
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, username, bio } = req.body;
    const updates = { fullName, username, bio };

    if (req.file) {
      updates.profilePicture = req.file.path; // Cloudinary URL
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / Unfollow a user
// @route   PUT /api/users/:id/follow
exports.followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);

      // Notification
      await Notification.create({
        userId: req.params.id,
        senderId: req.user._id,
        type: 'follow',
        text: `${req.user.username} started following you`,
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      following: currentUser.following,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=...
exports.searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username fullName profilePicture')
      .limit(10);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested users
// @route   GET /api/users/suggestions
exports.getSuggestions = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const users = await User.find({
      _id: { $nin: [req.user._id, ...currentUser.following] },
    })
      .select('username fullName profilePicture bio')
      .limit(5);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Save / Unsave a post
// @route   PUT /api/users/save/:postId
exports.savePost = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const index = user.savedPosts.indexOf(req.params.postId);

    if (index === -1) {
      user.savedPosts.push(req.params.postId);
    } else {
      user.savedPosts.splice(index, 1);
    }

    await user.save();
    res.json({ savedPosts: user.savedPosts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'followers',
      'username fullName profilePicture'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.followers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'following',
      'username fullName profilePicture'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.following);
  } catch (error) {
    next(error);
  }
};
