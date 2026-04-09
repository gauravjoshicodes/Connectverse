import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { FiBell, FiHeart, FiMessageCircle, FiUserPlus, FiShare2, FiCheck } from 'react-icons/fi';
import './Notification.css';

const NotificationPanel = ({ notifications = [], onMarkAllRead }) => {
  const { socket } = useSocket();
  const [items, setItems] = useState(notifications);

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (notification) => {
      setItems((prev) => [notification, ...prev]);
    };
    socket.on('receiveNotification', handleNew);
    return () => socket.off('receiveNotification', handleNew);
  }, [socket]);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <FiHeart className="notif-icon like" />;
      case 'comment': return <FiMessageCircle className="notif-icon comment" />;
      case 'follow': return <FiUserPlus className="notif-icon follow" />;
      case 'share': return <FiShare2 className="notif-icon share" />;
      default: return <FiBell className="notif-icon" />;
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="notification-panel card animate-fade-in-down" id="notification-panel">
      <div className="notif-header">
        <h3>Notifications</h3>
        {items.some((n) => !n.read) && (
          <button className="btn btn-ghost btn-sm" onClick={onMarkAllRead}>
            <FiCheck /> Mark all read
          </button>
        )}
      </div>
      <div className="notif-list">
        {items.length === 0 ? (
          <div className="notif-empty">
            <FiBell size={32} />
            <p>No notifications yet</p>
          </div>
        ) : (
          items.map((n, i) => (
            <div key={n._id || i} className={`notif-item ${!n.read ? 'unread' : ''}`}>
              {getIcon(n.type)}
              <div className="notif-content">
                <div className="notif-text">
                  <strong>{n.senderId?.username || 'Someone'}</strong>{' '}
                  {n.text || `interacted with your content`}
                </div>
                <span className="notif-time">{timeAgo(n.createdAt)}</span>
              </div>
              {!n.read && <span className="notif-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
