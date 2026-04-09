import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { searchUsers } from '../../services/userService';
import { getNotifications, markAllAsRead } from '../../services/notificationService';
import NotificationPanel from '../Notification/NotificationPanel';
import {
  FiHome, FiMessageCircle, FiBell, FiSearch,
  FiLogOut, FiUser, FiSun, FiMoon
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchTimeout = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  // Real-time notification via socket
  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('receiveNotification', handleNewNotif);
    return () => socket.off('receiveNotification', handleNewNotif);
  }, [socket]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.trim().length < 2) { setSearchResults([]); return; }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await searchUsers(query);
        setSearchResults(res.data);
        setShowSearch(true);
      } catch (err) { console.error(err); }
    }, 300);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=6C5CE7&color=fff&bold=true`;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="nav-logo">
          <div className="logo-icon">
            <span>C</span>
          </div>
          <span className="logo-text">ConnectVerse</span>
        </Link>

        {/* Search */}
        <div className="navbar-search" ref={searchRef} id="nav-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
            className="search-input"
            id="search-input"
          />
          {showSearch && searchResults.length > 0 && (
            <div className="search-dropdown animate-fade-in-down">
              {searchResults.map((u) => (
                <Link
                  key={u._id}
                  to={`/profile/${u._id}`}
                  className="search-result-item"
                  onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                >
                  <img
                    src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}&background=6C5CE7&color=fff`}
                    alt={u.username}
                    className="avatar avatar-sm"
                  />
                  <div>
                    <p className="search-result-name">{u.fullName || u.username}</p>
                    <p className="search-result-username">@{u.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <Link to="/" className="nav-action-btn" id="nav-home" title="Home">
            <FiHome />
          </Link>
          <Link to="/chat" className="nav-action-btn" id="nav-chat" title="Messages">
            <FiMessageCircle />
          </Link>

          {/* Notifications */}
          <div className="nav-notif-wrapper" ref={notifRef}>
            <button
              className="nav-action-btn"
              id="nav-notifications"
              title="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
              />
            )}
          </div>

          <button
            className="nav-action-btn"
            onClick={toggleTheme}
            id="nav-theme-toggle"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>

          {/* Profile */}
          <div className="nav-profile" ref={profileRef}>
            <button
              className="nav-profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              id="nav-profile-btn"
            >
              <img
                src={user?.profilePicture || defaultAvatar}
                alt="Profile"
                className="avatar avatar-sm"
              />
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown animate-fade-in-down">
                <Link
                  to={`/profile/${user?._id}`}
                  className="dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <FiUser /> My Profile
                </Link>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
