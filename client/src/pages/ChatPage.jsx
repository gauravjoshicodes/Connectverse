import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import ChatList from '../components/Chat/ChatList';
import ChatBox from '../components/Chat/ChatBox';
import { getUserChats } from '../services/chatService';
import '../components/Chat/Chat.css';

const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(location.state?.activeChat || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, [location.state?.activeChat]);

  const loadChats = async () => {
    try {
      const res = await getUserChats();
      let fetchedChats = res.data;
      if (location.state?.activeChat) {
        if (!fetchedChats.find((c) => c._id === location.state.activeChat._id)) {
          fetchedChats = [location.state.activeChat, ...fetchedChats];
        }
      }
      setChats(fetchedChats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="chat-page">
      <Navbar />
      <div className="chat-layout">
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onSelectChat={setActiveChat}
          userId={user?._id}
        />
        <ChatBox
          chat={activeChat}
          onBack={() => setActiveChat(null)}
        />
      </div>
    </div>
  );
};

export default ChatPage;
