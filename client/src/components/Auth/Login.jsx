import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { auth } from '../../config/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const { login, firebaseLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: 'admin@socialapp.com', password: 'admin' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFirebaseGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      await firebaseLogin(idToken);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Firebase login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error('Please fill all fields');
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-container">
        {/* Left - Branding */}
        <div className="auth-branding">
          <div className="auth-brand-content">
            <div className="brand-logo">
              <span>C</span>
            </div>
            <h1>ConnectVerse</h1>
            <p>Connect, Share, and Collaborate with people around the world.</p>
            <div className="brand-features">
              <div className="brand-feature">
                <span className="feature-icon">💬</span>
                <span>Real-time Chat</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">📸</span>
                <span>Share Stories</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">🤝</span>
                <span>Collaborate</span>
              </div>
            </div>
          </div>
          <div className="auth-brand-bg" />
        </div>

        {/* Right - Form */}
        <div className="auth-form-section">
          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Login to continue your journey</p>

            <div className="input-group">
              <label htmlFor="login-email">Email</label>
              <div className="input-icon-wrapper">
                <FiMail className="input-icon" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-with-icon"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-icon-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="input input-with-icon"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Logging in...' : <>Login <FiArrowRight /></>}
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
                Sign in with Google
              </button>
            </div>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
