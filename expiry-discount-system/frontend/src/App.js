// ============================================
// File: src/App.js
// ============================================
import React, { useState, useContext, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import InventoryList from './components/InventoryList';
import DiscountRules from './components/DiscountRules';
import Login from './components/Login';
import Profile from './components/Profile';

// Auth Context
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        {user ? (
          <div className="app-container">
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>  
              <div className="sidebar-header">
                <h2>Admin Panel</h2>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}> {sidebarOpen ? '←' : '→'} </button>
              </div>
              <nav>
                <Link to="/">Dashboard</Link>
                <Link to="/products">Products</Link>
                <Link to="/inventory">Inventory</Link>
                <Link to="/discount-rules">Rules</Link>
                <Link to="/profile">Profile</Link>
                <button className="logout-btn" onClick={logout}>Logout</button>
              </nav>
            </aside>
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/inventory" element={<InventoryList />} />
                <Route path="/discount-rules" element={<DiscountRules />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </Router>
    </AuthContext.Provider>
  );
}

export default App;