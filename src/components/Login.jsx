import { useState } from 'react';
import { LogIn, LogOut, User as UserIcon, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const { user, isAdmin, login, loginWithEmail, logout, loading } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await login();
    } catch (error) {
      alert(error.message || 'Login failed. Please try again.');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Please enter email and password');
    
    setLoginLoading(true);
    try {
      await loginWithEmail(email, password);
      setShowEmailForm(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      alert(error.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
        console.error(error)
      alert('Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <button className="login-btn loading" disabled>
        Loading...
      </button>
    );
  }

  if (user && isAdmin) {
    return (
      <div className="login-info">
        <div className="user-info">
          <UserIcon size={18} />
          <span className="user-email">{user.email}</span>
        </div>
        <button onClick={handleLogout} className="login-btn logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  if (showEmailForm) {
    return (
      <div className="login-form-container">
        <form onSubmit={handleEmailLogin} className="email-login-form">
          <div className="form-group">
            <Mail size={16} />
            <input 
              type="email" 
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <Lock size={16} />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loginLoading}>
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
          <button 
            type="button" 
            className="login-btn google-btn"
            onClick={() => setShowEmailForm(false)}
          >
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-options">
      <button onClick={handleGoogleLogin} className="login-btn google-btn">
        <LogIn size={18} />
        <span>Login with Google</span>
      </button>
      <button 
        onClick={() => setShowEmailForm(true)} 
        className="login-btn email-btn"
      >
        <Mail size={18} />
        <span>Login with Email</span>
      </button>
    </div>
  );
};

export default Login;
