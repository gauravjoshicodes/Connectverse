import { useSocket } from '../../context/SocketContext';

const OnlineStatus = ({ userId }) => {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.includes(userId);

  return (
    <span
      className={`online-status-dot ${isOnline ? 'online' : 'offline'}`}
      title={isOnline ? 'Online' : 'Offline'}
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: isOnline ? 'var(--success)' : 'var(--text-tertiary)',
        marginLeft: 6,
      }}
    />
  );
};

export default OnlineStatus;
