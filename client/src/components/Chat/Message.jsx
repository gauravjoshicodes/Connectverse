import './Chat.css';

const Message = ({ message, own }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`message ${own ? 'own' : ''}`}>
      <div className="message-bubble">
        <p>{message.text}</p>
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default Message;
