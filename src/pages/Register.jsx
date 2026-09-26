import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/ToastProvider';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { Mail, Lock, User, Phone, CreditCard, UserPlus, CheckSquare } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@niet.co.in')) {
      newErrors.email = 'Must be an @niet.co.in email address';
    }
    
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.studentId) newErrors.studentId = 'Student ID is required';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (auth && auth.register) {
        await auth.register(formData);
      }
      if (toast && toast.showToast) {
        toast.showToast('Registration successful! Please login.', 'success');
      }
      navigate('/login');
    } catch (err) {
      if (toast && toast.showToast) {
        toast.showToast(err.message || 'Registration failed', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-logo">
            <CheckSquare className="text-primary" /> NIET Lost & Found
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the campus community</p>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              icon={<User size={18} />}
            />
            
            <Input
              label="NIET Email"
              name="email"
              type="email"
              placeholder="studentid@niet.co.in"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail size={18} />}
            />

            <Input
              label="Phone Number"
              name="phone"
              placeholder="10-digit number"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={<Phone size={18} />}
            />

            <Input
              label="Student ID"
              name="studentId"
              placeholder="e.g. 2021001"
              value={formData.studentId}
              onChange={handleChange}
              error={errors.studentId}
              icon={<CreditCard size={18} />}
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock size={18} />}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Match password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={<Lock size={18} />}
            />
            
            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              leftIcon={<UserPlus size={18} />}
            >
              Create Account
            </Button>
          </form>
          
          <div className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
