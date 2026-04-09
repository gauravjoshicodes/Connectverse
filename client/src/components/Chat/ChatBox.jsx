import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getMessages, sendMessage as sendMsgApi } from '../../services/chatService';
import Message from './Message';
import { FiSend, FiPaperclip, FiSmile, FiArrowLeft } from 'react-icons/fi';
import './Chat.css';

const ChatBox = ({ chat, onBack }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const otherUser = chat?.participants?.find((p) => p._id !== user?._id);

  useEffect(() => {
    if (!chat) return;
    loadMessages();
    socket?.emit('joinChat', chat._id);

    return () => {
      socket?.emit('leaveChat', chat._id);
    };
  }, [chat?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleTyping = ({ userId, username }) => {
      if (userId !== user?._id) {
        setTypingUser(username);
        setTyping(true);
      }
    };

    const handleStopTyping = () => {
      setTyping(false);
      setTypingUser(null);
    };

    socket.on('receiveMessage', handleReceive);
    socket.on('userTyping', handleTyping);
    socket.on('userStopTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.off('userTyping', handleTyping);
      socket.off('userStopTyping', handleStopTyping);
    };
  }, [socket, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await getMessages(chat._id);
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTypingEmit = () => {
    socket?.emit('typing', {
      chatId: chat._id,
      userId: user._id,
      username: user.username,
    });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('stopTyping', { chatId: chat._id, userId: user._id });
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await sendMsgApi({ chatId: chat._id, text });
      const newMessage = res.data;
      setMessages((prev) => [...prev, newMessage]);

      socket?.emit('sendMessage', {
        chatId: chat._id,
        message: newMessage,
      });
      socket?.emit('stopTyping', { chatId: chat._id, userId: user._id });

      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  const getAvatar = (u) =>
    u?.profilePicture ||
    `https://ui-avatars.com/api/?name=${u?.username || 'U'}&background=6C5CE7&color=fff&bold=true`;

  if (!chat) {
    return (
      <div className="chatbox-empty">
        <div className="chatbox-empty-content">
          <h3>💬 Select a conversation</h3>
          <p>Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbox" id="chatbox">
      {/* Header */}
      <div className="chatbox-header">
        <button className="back-btn" onClick={onBack}>
          <FiArrowLeft />
        </button>
        <img src={getAvatar(otherUser)} alt="" className="avatar" />
        <div className="chatbox-user-info">
          <h4>{otherUser?.fullName || otherUser?.username}</h4>
          <span className={`status ${otherUser?.isOnline ? 'online' : ''}`}>
            {otherUser?.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="chatbox-messages">
        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="chat-loading">
            <p>No messages yet. Say hi! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg._id}
              message={msg}
              own={msg.senderId?._id === user?._id || msg.senderId === user?._id}
            />
          ))
        )}
        {typing && (
          <div className="typing-indicator animate-fade-in">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-text">{typingUser} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chatbox-input" onSubmit={handleSend}>
        <button type="button" className="chat-action-btn">
          <FiPaperclip />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTypingEmit();
          }}
          className="input"
          id="chat-message-input"
        />
        <button type="button" className="chat-action-btn">
          <FiSmile />
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-icon"
          disabled={!text.trim()}
          id="chat-send-btn"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
