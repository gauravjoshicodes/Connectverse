import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { createChat } from '../../services/chatService';
import toast from 'react-hot-toast';
import './Profile.css';

const ProfileCard = ({ profileUser, isOwnProfile, onFollow, isFollowing, postCount }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();
  const isOnline = onlineUsers.includes(profileUser?._id);

  const handleFollow = () => {
    onFollow?.();
    // Emit real-time notification when following (not unfollowing)
    if (!isFollowing && profileUser?._id !== user?._id) {
      socket?.emit('sendNotification', {
        receiverId: profileUser._id,
        notification: {
          senderId: { _id: user._id, username: user.username, profilePicture: user.profilePicture },
          type: 'follow',
          text: `${user.username} started following you`,
          createdAt: new Date().toISOString(),
          read: false,
        },
      });
    }
  };

  const handleMessageClick = async () => {
    try {
      const res = await createChat(profileUser._id);
      navigate('/chat', { state: { activeChat: res.data } });
    } catch (err) {
      toast.error('Failed to start chat');
    }
  };

  const getAvatar = (u) =>
    u?.profilePicture ||
    `https://ui-avatars.com/api/?name=${u?.username || 'U'}&background=6C5CE7&color=fff&bold=true&size=200`;

  const getCover = () =>
    profileUser?.coverPicture || '';

  return (
    <div className="profile-card card" id="profile-card">
      {/* Cover */}
      <div className="profile-cover" style={getCover() ? { backgroundImage: `url(${getCover()})` } : {}}>
        <div className="profile-cover-overlay" />
      </div>

      {/* Info */}
      <div className="profile-info">
        <div className="profile-avatar-section">
          <div className={`profile-avatar-wrapper ${isOnline ? 'online glow-online' : ''}`}>
            <img src={getAvatar(profileUser)} alt="" className="profile-avatar" />
          </div>
        </div>

        <div className="profile-details">
          <h1 className="profile-name">{profileUser?.fullName || profileUser?.username}</h1>
          <p className="profile-username">@{profileUser?.username}</p>
          {profileUser?.bio && <p className="profile-bio">{profileUser.bio}</p>}

          <div className="profile-meta">
            {profileUser?.location && (
              <span className="meta-item">📍 {profileUser.location}</span>
            )}
            {profileUser?.website && (
              <a href={profileUser.website} target="_blank" rel="noreferrer" className="meta-item">
                🔗 {profileUser.website}
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-number">{postCount || 0}</span>
            <span className="stat-text">Posts</span>
          </div>
          <div className="profile-stat">
            <span className="stat-number">{profileUser?.followers?.length || 0}</span>
            <span className="stat-text">Followers</span>
          </div>
          <div className="profile-stat">
            <span className="stat-number">{profileUser?.following?.length || 0}</span>
            <span className="stat-text">Following</span>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          {isOwnProfile ? (
            <Link to="/edit-profile" className="btn btn-secondary">
              Edit Profile
            </Link>
          ) : (
            <>
              <button className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`} onClick={handleFollow}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button className="btn btn-secondary" onClick={handleMessageClick}>
                Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
