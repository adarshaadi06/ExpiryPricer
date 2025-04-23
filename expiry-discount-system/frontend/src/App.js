import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import InventoryList from './components/InventoryList';
import DiscountRules from './components/DiscountRules';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h2>Discount System</h2>
            <button 
              className="toggle-button" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li>
                <Link to="/">Dashboard</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
              <li>
                <Link to="/inventory">Inventory</Link>
              </li>
              <li>
                <Link to="/discount-rules">Discount Rules</Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/discount-rules" element={<DiscountRules />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;