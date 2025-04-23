import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard() {
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    discounted_products_count: 0,
    average_discount_percentage: 0,
    category_distribution: [],
    expiring_soon: []
  });
  const [calculating, setCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expiringData, analyticsData] = await Promise.all([
          api.getExpiringInventory(7),
          api.getDiscountAnalytics()
        ]);
        
        setExpiringProducts(expiringData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCalculateDiscounts = async () => {
    try {
      setCalculating(true);
      const result = await api.calculateDiscounts();
      setCalculationResult(result);
      
      // Refresh data after calculation
      const [expiringData, analyticsData] = await Promise.all([
        api.getExpiringInventory(7),
        api.getDiscountAnalytics()
      ]);
      
      setExpiringProducts(expiringData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error calculating discounts:', error);
    } finally {
      setCalculating(false);
    }
  };

  const getDaysLabel = (days) => {
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      
      <div className="card">
        <div className="card-header">
          <h3>Discount System Controls</h3>
        </div>
        <div className="card-body">
          <button 
            className="button button-success" 
            onClick={handleCalculateDiscounts}
            disabled={calculating}
          >
            {calculating ? 'Calculating...' : 'Calculate Discounts Now'}
          </button>
          
          {calculationResult && (
            <div className="calculation-results">
              <h4>Last Calculation Results:</h4>
              <ul>
                <li><strong>Processed:</strong> {calculationResult.processed} products</li>
                <li><strong>Newly Discounted:</strong> {calculationResult.discounted} products</li>
                <li><strong>Already Discounted:</strong> {calculationResult.already_discounted} products</li>
                <li><strong>No Rule Applied:</strong> {calculationResult.no_rule_found} products</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Active Discounts</h3>
          <div className="value">{analytics.discounted_products_count}</div>
          <div className="label">Products</div>
        </div>
        
        <div className="stats-card">
          <h3>Average Discount</h3>
          <div className="value">{analytics.average_discount_percentage.toFixed(1)}%</div>
          <div className="label">Off Regular Price</div>
        </div>
        
        <div className="stats-card">
          <h3>Products Expiring Soon</h3>
          <div className="value">{analytics.expiring_soon.length}</div>
          <div className="label">Within 7 Days</div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3>Products Expiring Soon</h3>
        </div>
        <div className="card-body">
          {expiringProducts.length === 0 ? (
            <p>No products expiring in the next 7 days.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Expiry Date</th>
                  <th>Time Left</th>
                  <th>Base Price</th>
                  <th>Current Price</th>
                  <th>Discount</th>
                </tr>
              </thead>
              <tbody>
                {expiringProducts.map((product) => {
                  const daysUntilExpiry = product.days_until_expiry;
                  const discountPercentage = ((product.base_price - product.current_price) / product.base_price * 100).toFixed(1);
                  
                  return (
                    <tr key={`${product.product_id}-${product.inventory_id}`}>
                      <td>{product.product_name}</td>
                      <td>{product.expiration_date}</td>
                      <td>
                        <span className={`badge ${daysUntilExpiry <= 1 ? 'badge-danger' : daysUntilExpiry <= 3 ? 'badge-warning' : 'badge-success'}`}>
                          {getDaysLabel(daysUntilExpiry)}
                        </span>
                      </td>
                      <td>${product.base_price}</td>
                      <td>${product.current_price}</td>
                      <td>{discountPercentage !== '0.0' ? `${discountPercentage}%` : 'None'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3>Discount by Category</h3>
        </div>
        <div className="card-body">
          {analytics.category_distribution.length === 0 ? (
            <p>No discounts applied by category yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Products</th>
                  <th>Average Discount</th>
                </tr>
              </thead>
              <tbody>
                {analytics.category_distribution.map((category) => (
                  <tr key={category.category || 'Uncategorized'}>
                    <td>{category.category || 'Uncategorized'}</td>
                    <td>{category.count}</td>
                    <td>{category.avg_discount.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;