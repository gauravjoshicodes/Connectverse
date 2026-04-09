import { useSocket } from '../../context/SocketContext';
import './Chat.css';

const ChatList = ({ chats, activeChat, onSelectChat, userId }) => {
  const { onlineUsers } = useSocket();

  const getOtherUser = (chat) => {
    return chat.participants?.find((p) => p._id !== userId);
  };

  const getAvatar = (user) =>
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=6C5CE7&color=fff&bold=true`;

  return (
    <div className="chat-list" id="chat-list">
      <div className="chat-list-header">
        <h2>Messages</h2>
      </div>
      <div className="chat-list-items">
        {chats.length === 0 ? (
          <div className="empty-text" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No conversations yet</p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Start chatting with someone!</p>
          </div>
        ) : (
          chats.map((chat) => {
            const other = getOtherUser(chat);
            const isOnline = onlineUsers.includes(other?._id);
            return (
              <div
                key={chat._id}
                className={`chat-list-item ${activeChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="chat-avatar-wrapper">
                  <img src={getAvatar(other)} alt="" className="avatar" />
                  {isOnline && <span className="online-indicator" />}
                </div>
                <div className="chat-list-info">
                  <h4>{other?.fullName || other?.username}</h4>
                  <p className="last-msg">
                    {chat.lastMessage?.text?.slice(0, 40) || 'Start a conversation'}
                    {chat.lastMessage?.text?.length > 40 ? '...' : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
