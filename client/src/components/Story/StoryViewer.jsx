import { useState, useEffect } from 'react';
import { viewStory } from '../../services/storyService';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Story.css';

const StoryViewer = ({ storyGroup, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const stories = storyGroup?.stories || [];
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory) return;

    // Mark as viewed
    viewStory(currentStory._id).catch(() => {});

    // Auto-progress
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          elapsed = 0;
          setProgress(0);
        } else {
          onClose();
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, currentStory]);

  if (!currentStory) return null;

  const mediaSrc = currentStory.media?.startsWith('http') ? currentStory.media : `/uploads/${currentStory.media}`;

  const getAvatar = (u) =>
    u?.profilePicture ||
    `https://ui-avatars.com/api/?name=${u?.username || 'U'}&background=6C5CE7&color=fff&bold=true`;

  return (
    <div className="story-viewer-overlay animate-fade-in" onClick={onClose}>
      <div className="story-viewer animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="story-progress-bar">
          {stories.map((_, i) => (
            <div key={i} className="progress-segment">
              <div
                className="progress-fill"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-viewer-header">
          <img src={getAvatar(storyGroup.user)} alt="" className="avatar avatar-sm" />
          <span className="story-viewer-username">
            {storyGroup.user?.username}
          </span>
          <button className="story-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Media */}
        <div className="story-viewer-media">
          {currentStory.mediaType === 'video' ? (
            <video src={mediaSrc} autoPlay muted className="story-content" />
          ) : (
            <img src={mediaSrc} alt="" className="story-content" />
          )}
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="story-caption">{currentStory.caption}</div>
        )}

        {/* Navigation */}
        {currentIndex > 0 && (
          <button
            className="story-nav prev"
            onClick={() => { setCurrentIndex((p) => p - 1); setProgress(0); }}
          >
            <FiChevronLeft />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            className="story-nav next"
            onClick={() => { setCurrentIndex((p) => p + 1); setProgress(0); }}
          >
            <FiChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
