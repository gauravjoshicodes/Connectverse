import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { createPost } from '../../services/postService';
import { FiImage, FiVideo, FiSmile, FiX, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Feed.css';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleMedia = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMedia(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !media) return;

    setLoading(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text);
      if (media) formData.append('media', media);

      const res = await createPost(formData);
      onPostCreated?.(res.data);
      socket?.emit('newPost', res.data);
      setText('');
      removeMedia();
      toast.success('Post created! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=6C5CE7&color=fff&bold=true`;

  return (
    <div className="create-post card" id="create-post">
      <form onSubmit={handleSubmit}>
        <div className="create-post-top">
          <img
            src={user?.profilePicture || defaultAvatar}
            alt="You"
            className="avatar"
          />
          <textarea
            placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0] || user?.username}?`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="create-post-input"
            rows="2"
            id="post-text-input"
          />
        </div>

        {preview && (
          <div className="media-preview animate-scale-in">
            <button type="button" className="preview-remove" onClick={removeMedia}>
              <FiX />
            </button>
            {media?.type?.startsWith('video') ? (
              <video src={preview} controls className="preview-media" />
            ) : (
              <img src={preview} alt="Preview" className="preview-media" />
            )}
          </div>
        )}

        <div className="create-post-bottom">
          <div className="media-actions">
            <button
              type="button"
              className="media-btn"
              onClick={() => fileRef.current?.click()}
            >
              <FiImage className="icon-image" /> Photo
            </button>
            <button
              type="button"
              className="media-btn"
              onClick={() => fileRef.current?.click()}
            >
              <FiVideo className="icon-video" /> Video
            </button>
            <button type="button" className="media-btn">
              <FiSmile className="icon-emoji" /> Feeling
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || (!text.trim() && !media)}
            id="post-submit-btn"
          >
            {loading ? 'Posting...' : <><FiSend /> Post</>}
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleMedia}
          style={{ display: 'none' }}
        />
      </form>
    </div>
  );
};

export default CreatePost;
