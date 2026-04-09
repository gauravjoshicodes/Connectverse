import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getSuggestions, followUser } from '../../services/userService';
import { FiUserPlus, FiUserCheck } from 'react-icons/fi';
import './RightBar.css';

const RightBar = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [suggestions, setSuggestions] = useState([]);
  const [followedIds, setFollowedIds] = useState(new Set());

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await getSuggestions();
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getAvatar = (u) =>
    u?.profilePicture ||
    `https://ui-avatars.com/api/?name=${u?.username || 'U'}&background=6C5CE7&color=fff&bold=true`;

  // Filter online users (excluding self) and find them in suggestions for avatar info
  const onlineOthers = onlineUsers.filter((id) => id !== user?._id);

  return (
    <aside className="rightbar" id="main-rightbar">
      {/* Online Friends */}
      <div className="rightbar-section">
        <h3 className="rightbar-title">🟢 Online Now</h3>
        <div className="online-users-list">
          {onlineOthers.length === 0 ? (
            <p className="empty-text">No one online yet</p>
          ) : (
            onlineOthers.slice(0, 8).map((id) => {
              const suggestion = suggestions.find((s) => s._id === id);
              return (
                <Link to={`/profile/${id}`} key={id} className="online-user-item" style={{ textDecoration: 'none' }}>
                  <div className="online-avatar-wrap">
                    <img
                      src={getAvatar(suggestion)}
                      alt=""
                      className="avatar"
                    />
                  </div>
                  {suggestion && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', maxWidth: '48px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {suggestion.username?.slice(0, 8)}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Suggestions */}
      <div className="rightbar-section">
        <h3 className="rightbar-title">✨ Suggested For You</h3>
        <div className="suggestions-list">
          {suggestions.length === 0 ? (
            <p className="empty-text">No suggestions yet. Start connecting!</p>
          ) : (
            suggestions.map((u) => (
              <div key={u._id} className="suggestion-item animate-fade-in-up">
                <Link to={`/profile/${u._id}`} className="suggestion-user">
                  <img src={getAvatar(u)} alt={u.username} className="avatar" />
                  <div>
                    <p className="suggestion-name">{u.fullName || u.username}</p>
                    <p className="suggestion-username">@{u.username}</p>
                  </div>
                </Link>
                <button
                  className={`btn btn-sm ${followedIds.has(u._id) ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => handleFollow(u._id)}
                >
                  {followedIds.has(u._id) ? <FiUserCheck /> : <FiUserPlus />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trending */}
      <div className="rightbar-section">
        <h3 className="rightbar-title">🔥 Trending</h3>
        <div className="trending-list">
          {['#Collaboration', '#WebDev', '#MERN', '#React', '#NodeJS'].map(
            (tag) => (
              <span key={tag} className="trending-tag">
                {tag}
              </span>
            )
          )}
        </div>
      </div>

      <div className="rightbar-footer">
        <p>© 2026 ConnectVerse</p>
        <p>Developed by <strong>Gaurav</strong></p>
      </div>
    </aside>
  );
};

export default RightBar;
