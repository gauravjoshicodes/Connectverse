import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import Navbar from '../components/Layout/Navbar';
import toast from 'react-hot-toast';
import '../components/Profile/Profile.css';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        bio: user.bio || '',
      });
      setPreview(user.profilePicture || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      return toast.error('Username is required');
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('username', formData.username);
      data.append('bio', formData.bio);
      if (profilePicture) {
        data.append('profilePicture', profilePicture);
      }

      const res = await updateProfile(data);
      updateUser(res.data);
      toast.success('Profile updated successfully!');
      navigate(`/profile/${user._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user.username || 'U'}&background=6C5CE7&color=fff&bold=true&size=200`;

  return (
    <div id="edit-profile-page">
      <Navbar />
      <div className="profile-page" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Edit Profile</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="profile-edit-avatar" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  overflow: 'hidden', 
                  margin: '0 auto', 
                  cursor: 'pointer',
                  border: '3px solid var(--primary)',
                  position: 'relative'
                }}
                onClick={() => fileRef.current?.click()}
              >
                <img 
                  src={preview || defaultAvatar} 
                  alt="Profile Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  padding: '4px',
                  fontSize: '12px'
                }}>
                  Change
                </div>
              </div>
              <input
                type="file"
                ref={fileRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input"
                placeholder="Your name"
              />
            </div>

            <div className="input-group">
              <label>Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input"
                placeholder="username"
                required
              />
            </div>

            <div className="input-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input"
                placeholder="Tell us about yourself"
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
