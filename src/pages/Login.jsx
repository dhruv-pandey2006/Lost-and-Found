import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/ToastProvider';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { Mail, Lock, LogIn, CheckSquare } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.endsWith('@niet.co.in')) {
      newErrors.email = 'Must be an @niet.co.in email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      let result;
      if (auth && auth.login) {
        result = await auth.login(email, password);
      }
      if (result && result.success) {
        if (toast && toast.showToast) {
          toast.showToast('Logged in successfully', 'success');
        }
        navigate('/dashboard');
      } else {
        if (toast && toast.showToast) {
          toast.showToast(result?.error || 'Invalid email or password', 'error');
        }
      }
    } catch (err) {
      if (toast && toast.showToast) {
        toast.showToast(err.message || 'Login failed', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (toast && toast.showToast) {
      toast.showToast('Password reset link sent to your email', 'info');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-logo">
            <CheckSquare className="text-primary" /> NIET Lost & Found
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="NIET Email"
              type="email"
              placeholder="studentid@niet.co.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail size={18} />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock size={18} />}
            />

            <div className="auth-options">
              <a href="#" onClick={handleForgotPassword} className="auth-link">Forgot password?</a>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              leftIcon={<LogIn size={18} />}
            >
              Sign In
            </Button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/register" className="auth-link">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
