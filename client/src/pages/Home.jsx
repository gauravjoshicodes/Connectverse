import { useState, useEffect } from 'react';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import RightBar from '../components/Layout/RightBar';
import Feed from '../components/Feed/Feed';
import StoryBar from '../components/Story/StoryBar';
import StoryViewer from '../components/Story/StoryViewer';
import { getStories } from '../services/storyService';
import './Home.css';

const Home = () => {
  const [stories, setStories] = useState([]);
  const [viewingStory, setViewingStory] = useState(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const res = await getStories();
      setStories(res.data);
    } catch (err) {
      console.error('Failed to load stories:', err);
    }
  };

  return (
    <div className="home-layout" id="home-page">
      <Navbar />
      <Sidebar />
      <main className="home-main">
        <StoryBar stories={stories} onViewStory={setViewingStory} onStoryCreated={loadStories} />
        <Feed />
      </main>
      <RightBar />

      {viewingStory && (
        <StoryViewer
          storyGroup={viewingStory}
          onClose={() => setViewingStory(null)}
        />
      )}
    </div>
  );
};

export default Home;
