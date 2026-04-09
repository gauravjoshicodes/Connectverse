import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import ProfileCard from '../components/Profile/ProfileCard';
import Post from '../components/Feed/Post';
import { getUser, followUser } from '../services/userService';
import { getUserPosts, deletePost as deletePostApi } from '../services/postService';
import toast from 'react-hot-toast';
import '../components/Profile/Profile.css';
import '../components/Feed/Feed.css';

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [userRes, postsRes] = await Promise.all([
        getUser(id),
        getUserPosts(id),
      ]);
      setProfileUser(userRes.data);
      setPosts(postsRes.data);
      setIsFollowing(userRes.data.followers?.includes(user?._id));
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await followUser(id);
      setIsFollowing(!isFollowing);
      setProfileUser((prev) => ({
        ...prev,
        followers: isFollowing
          ? prev.followers.filter((f) => f !== user._id)
          : [...prev.followers, user._id],
      }));
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePostApi(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
        </div>
      </>
    );
  }

  return (
    <div id="profile-page">
      <Navbar />
      <div className="profile-page">
        <ProfileCard
          profileUser={profileUser}
          isOwnProfile={user?._id === id}
          onFollow={handleFollow}
          isFollowing={isFollowing}
          postCount={posts.length}
        />

        <div className="profile-posts-section">
          <h2>Posts</h2>
          {posts.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-tertiary)' }}>No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <Post key={post._id} post={post} onDelete={handleDeletePost} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
