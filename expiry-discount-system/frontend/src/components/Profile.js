// ============================================
// File: src/components/Profile.js
// ============================================
import React, { useState } from 'react';
import { useAuth } from '../App';

function Profile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [password, setPassword] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: call API to update profile
    alert('Profile updated');
  };

  return (
    <div>
      <h1>Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="avatar-upload">
          <img src={avatar || '/default-avatar.png'} alt="avatar" className="avatar-img" />
          <input type="file" onChange={e=>setAvatar(URL.createObjectURL(e.target.files[0]))} />
        </div>
        <input value={name} onChange={e=>setName(e.target.value)} />
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="New Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default Profile;