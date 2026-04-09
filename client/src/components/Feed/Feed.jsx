import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { getTimeline, deletePost as deletePostApi } from '../../services/postService';
import CreatePost from './CreatePost';
import Post from './Post';
import toast from 'react-hot-toast';
import './Feed.css';

const Feed = () => {
  const { socket } = useSocket();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const loadPosts = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum > 1) setLoadingMore(true);
      const res = await getTimeline(pageNum);
      if (pageNum === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts((prev) => [...prev, ...res.data.posts]);
      }
      setHasMore(res.data.currentPage < res.data.totalPages);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => {
            const next = prev + 1;
            loadPosts(next);
            return next;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, loadingMore, loadPosts]);

  // Listen for new posts via socket
  useEffect(() => {
    if (!socket) return;
    const handleNewPost = (post) => {
      setPosts((prev) => [post, ...prev]);
    };
    socket.on('postBroadcast', handleNewPost);
    return () => socket.off('postBroadcast', handleNewPost);
  }, [socket]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePostApi(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="feed">
        <CreatePost onPostCreated={handlePostCreated} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="post-skeleton card">
            <div className="skeleton" style={{ width: '200px', height: '16px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '100%', height: '12px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '80%', height: '12px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '200px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="feed" id="main-feed">
      <CreatePost onPostCreated={handlePostCreated} />
      {posts.length === 0 ? (
        <div className="empty-feed card">
          <h3>No posts yet 📭</h3>
          <p>Follow people or create your first post!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <Post key={post._id} post={post} onDelete={handleDeletePost} />
          ))}
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="scroll-sentinel">
            {loadingMore && (
              <div className="feed-loading-more">
                <div className="spinner-small" />
                <span>Loading more posts...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Feed;
