import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiArrowRight, FiSmile } from 'react-icons/fi';
import { auth } from '../../config/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const { register, firebaseLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFirebaseGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      await firebaseLogin(idToken);
      toast.success('Account created with Google! Welcome! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Firebase registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, fullName } = formData;

    if (!username || !email || !password) {
      return toast.error('Please fill all required fields');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(username, email, password, fullName);
      toast.success('Account created! Welcome! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-container">
        {/* Left - Branding */}
        <div className="auth-branding">
          <div className="auth-brand-content">
            <div className="brand-logo">
              <span>C</span>
            </div>
            <h1>Join ConnectVerse</h1>
            <p>Create your account and start connecting with amazing people.</p>
            <div className="brand-features">
              <div className="brand-feature">
                <span className="feature-icon">🚀</span>
                <span>Free Forever</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">🌍</span>
                <span>Global Community</span>
              </div>
            </div>
          </div>
          <div className="auth-brand-bg" />
        </div>

        {/* Right - Form */}
        <div className="auth-form-section">
          <form onSubmit={handleSubmit} className="auth-form" id="register-form">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Start your social journey today</p>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="reg-username">Username *</label>
                <div className="input-icon-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    id="reg-username"
                    name="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    className="input input-with-icon"
                  />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="reg-fullname">Full Name</label>
                <div className="input-icon-wrapper">
                  <FiSmile className="input-icon" />
                  <input
                    id="reg-fullname"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="input input-with-icon"
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="reg-email">Email *</label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-with-icon"
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="reg-password">Password *</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-with-icon"
                  />
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="reg-confirm">Confirm Password *</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    id="reg-confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input input-with-icon"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? 'Creating Account...' : <>Create Account <FiArrowRight /></>}
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="google-auth-wrapper" style={{ margin: '1rem 0' }}>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={handleFirebaseGoogle}
                disabled={loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width: 20}} />
                Sign up with Google
              </button>
            </div>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
