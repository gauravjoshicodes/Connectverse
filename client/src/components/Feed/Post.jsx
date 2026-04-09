import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { likePost, commentOnPost } from '../../services/postService';
import { savePost } from '../../services/userService';
import {
  FiHeart, FiMessageCircle, FiShare2, FiBookmark,
  FiMoreHorizontal, FiSend, FiTrash2
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Feed.css';

const Post = ({ post, onDelete }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [saved, setSaved] = useState(user?.savedPosts?.includes(post._id));
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    try {
      const res = await likePost(post._id);
      const wasLiked = liked;
      setLiked(!liked);
      setLikeCount(res.data.likeCount);

      // Emit real-time notification on like (not self)
      if (!wasLiked && post.userId?._id !== user?._id) {
        socket?.emit('sendNotification', {
          receiverId: post.userId._id,
          notification: {
            senderId: { _id: user._id, username: user.username, profilePicture: user.profilePicture },
            type: 'like',
            text: `${user.username} liked your post`,
            referenceId: post._id,
            createdAt: new Date().toISOString(),
            read: false,
          },
        });
      }
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await commentOnPost(post._id, commentText);
      setComments(res.data);

      // Emit real-time notification on comment (not self)
      if (post.userId?._id !== user?._id) {
        socket?.emit('sendNotification', {
          receiverId: post.userId._id,
          notification: {
            senderId: { _id: user._id, username: user.username, profilePicture: user.profilePicture },
            type: 'comment',
            text: `${user.username} commented on your post`,
            referenceId: post._id,
            createdAt: new Date().toISOString(),
            read: false,
          },
        });
      }

      setCommentText('');
    } catch (err) {
      toast.error('Failed to comment');
    }
  };

  const handleSave = async () => {
    try {
      await savePost(post._id);
      setSaved(!saved);
      toast.success(saved ? 'Removed from saved' : 'Post saved!');
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const handleDelete = () => {
    onDelete?.(post._id);
    setShowMenu(false);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const postUser = post.userId;
  const defaultAvatar = `https://ui-avatars.com/api/?name=${postUser?.username || 'U'}&background=6C5CE7&color=fff&bold=true`;

  return (
    <article className="post card animate-fade-in-up" id={`post-${post._id}`}>
      {/* Header */}
      <div className="post-header">
        <Link to={`/profile/${postUser?._id}`} className="post-user">
          <img
            src={postUser?.profilePicture || defaultAvatar}
            alt={postUser?.username}
            className="avatar"
          />
          <div>
            <h4 className="post-username">{postUser?.fullName || postUser?.username}</h4>
            <span className="post-time">{timeAgo(post.createdAt)}</span>
          </div>
        </Link>
        {postUser?._id === user?._id && (
          <div className="post-menu-container">
            <button className="btn-ghost btn-icon" onClick={() => setShowMenu(!showMenu)}>
              <FiMoreHorizontal />
            </button>
            {showMenu && (
              <div className="post-menu animate-fade-in-down">
                <button onClick={handleDelete}><FiTrash2 /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.text && <p className="post-text">{post.text}</p>}
      {post.image && (
        <div className="post-media">
          <img src={post.image} alt="Post" />
        </div>
      )}
      {post.video && (
        <div className="post-media">
          <video src={post.video} controls />
        </div>
      )}

      {/* Stats */}
      <div className="post-stats">
        <span>{likeCount} likes</span>
        <span>{comments.length} comments</span>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          {liked ? <FaHeart /> : <FiHeart />}
          <span>Like</span>
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          <FiMessageCircle />
          <span>Comment</span>
        </button>
        <button className="action-btn">
          <FiShare2 />
          <span>Share</span>
        </button>
        <button className={`action-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
          <FiBookmark />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="post-comments animate-fade-in">
          {comments.map((c, i) => (
            <div key={i} className="comment">
              <img
                src={c.userId?.profilePicture || `https://ui-avatars.com/api/?name=${c.userId?.username || 'U'}&background=6C5CE7&color=fff`}
                alt=""
                className="avatar avatar-sm"
              />
              <div className="comment-body">
                <span className="comment-author">{c.userId?.username || 'User'}</span>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn btn-primary btn-sm btn-icon">
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

export default Post;
