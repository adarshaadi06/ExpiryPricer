// ============================================
// File: src/components/Login.js
// ============================================
import React, { useState } from 'react';
import { useAuth } from '../App';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: call API to validate credentials
    login({ name: 'Admin User', email, avatar: null });
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;