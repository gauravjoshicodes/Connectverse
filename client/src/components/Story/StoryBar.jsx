import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createStory } from '../../services/storyService';
import { FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Story.css';

const StoryBar = ({ stories = [], onViewStory, onStoryCreated }) => {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleCreate = async () => {
    if (!media) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('media', media);
      if (caption) formData.append('caption', caption);
      await createStory(formData);
      toast.success('Story created! ✨');
      if (onStoryCreated) onStoryCreated();
      setShowCreate(false);
      setMedia(null);
      setPreview(null);
      setCaption('');
    } catch (err) {
      toast.error('Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(file);
    setPreview(URL.createObjectURL(file));
    setShowCreate(true);
  };

  const getAvatar = (u) =>
    u?.profilePicture ||
    `https://ui-avatars.com/api/?name=${u?.username || 'U'}&background=6C5CE7&color=fff&bold=true`;

  return (
    <>
      <div className="story-bar card" id="story-bar">
        <div className="story-list">
          {/* Add story */}
          <div className="story-item add-story" onClick={() => fileRef.current?.click()}>
            <div className="story-avatar-wrapper add">
              <img src={getAvatar(user)} alt="Your story" className="story-avatar" />
              <span className="story-add-icon"><FiPlus /></span>
            </div>
            <span className="story-username">Your Story</span>
          </div>

          {/* Stories */}
          {stories.map((group, i) => (
            <div
              key={i}
              className="story-item"
              onClick={() => onViewStory?.(group)}
            >
              <div className="story-avatar-wrapper has-story">
                <img src={getAvatar(group.user)} alt="" className="story-avatar" />
              </div>
              <span className="story-username">
                {group.user?.username?.slice(0, 10)}
              </span>
            </div>
          ))}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </div>

      {/* Create Story Modal */}
      {showCreate && preview && (
        <div className="story-modal-overlay animate-fade-in">
          <div className="story-modal animate-scale-in">
            <button className="story-modal-close" onClick={() => setShowCreate(false)}>
              <FiX />
            </button>
            <h3>Create Story</h3>
            <div className="story-preview">
              {media?.type?.startsWith('video') ? (
                <video src={preview} controls className="story-media-preview" />
              ) : (
                <img src={preview} alt="Story" className="story-media-preview" />
              )}
            </div>
            <input
              type="text"
              className="input"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Share Story'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryBar;
