import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiMessageCircle, FiBookmark, FiUser,
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: `/profile/${user?._id}`, icon: <FiUser />, label: 'Profile' },
    { path: '/chat', icon: <FiMessageCircle />, label: 'Messages' },
    { path: '/bookmarks', icon: <FiBookmark />, label: 'Saved' },
  ];

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=6C5CE7&color=fff&bold=true`;

  return (
    <aside className="sidebar" id="main-sidebar">
      {/* User card */}
      <div className="sidebar-user-card">
        <img
          src={user?.profilePicture || defaultAvatar}
          alt={user?.username}
          className="avatar avatar-lg"
        />
        <div className="sidebar-user-info">
          <h4>{user?.fullName || user?.username}</h4>
          <p>@{user?.username}</p>
        </div>
        <div className="sidebar-user-stats">
          <div className="stat">
            <span className="stat-value">{user?.followers?.length || 0}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat">
            <span className="stat-value">{user?.following?.length || 0}</span>
            <span className="stat-label">Following</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            end={item.path === '/'}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <p>ConnectVerse</p>
        <p className="sidebar-credit">Developed by Gaurav</p>
      </div>
    </aside>
  );
};

export default Sidebar;
