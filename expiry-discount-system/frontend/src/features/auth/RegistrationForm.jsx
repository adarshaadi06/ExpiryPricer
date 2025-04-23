import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Link, 
  Alert, 
  InputAdornment, 
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import zxcvbn from 'zxcvbn';

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .email('Must be a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup
    .string()
    .required('Role is required')
});

const PasswordStrengthMeter = ({ password }) => {
  const result = zxcvbn(password || '');
  const score = result.score;
  
  // Calculate percentage for progress bar
  const strengthPercentage = (score * 100) / 4;
  
  // Get text label based on score
  const getStrengthLabel = () => {
    switch (score) {
      case 0: return { text: 'Very Weak', color: '#e53935' };
      case 1: return { text: 'Weak', color: '#ff9800' };
      case 2: return { text: 'Fair', color: '#fdd835' };
      case 3: return { text: 'Good', color: '#4caf50' };
      case 4: return { text: 'Strong', color: '#2e7d32' };
      default: return { text: '', color: '#e0e0e0' };
    }
  };
  
  const { text, color } = getStrengthLabel();
  
  // Suggestions for improving password
  const suggestions = result.feedback.suggestions.length > 0 ? 
    result.feedback.suggestions[0] : 
    result.feedback.warning;
  
  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Password Strength
        </Typography>
        <Typography variant="caption" sx={{ color }}>
          {text}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={strengthPercentage}
        sx={{ 
          bgcolor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            bgcolor: color
          },
          borderRadius: 1,
          height: 6
        }}
      />
      {password && suggestions && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {suggestions}
        </Typography>
      )}
    </Box>
  );
};

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { register, user } = useAuth();
  const navigate = useNavigate();
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'staff' // Default role
    }
  });

  const password = watch('password');
  
  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  // Update password strength score
  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordScore(result.score);
    } else {
      setPasswordScore(0);
    }
  }, [password]);

  const handleRegisterSubmit = async (data) => {
    // Check if password is strong enough (Score >= 2)
    if (passwordScore < 2) {
      setFormError('Please choose a stronger password');
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    // Remove confirmPassword before sending
    const { confirmPassword, ...registerData } = data;
    
    const result = await register(registerData);
    
    if (result.success) {
      setSuccess(true);
      // Redirect to login after showing success message
      setTimeout(() => {
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      }, 3000);
    } else {
      setFormError(result.error?.message || 'Registration failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

}