import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [analytics, setAnalytics] = useState({
    summary: { total: 0, avg_pct: 0 },
    by_category: [],
    soon_expiring: []
  });
  const [calculating, setCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const exp = await api.getExpiringInventory(7);
        const an  = await api.getDiscountAnalytics();
        setExpiringProducts(exp);
        setAnalytics({
          summary: {
            total: an.summary.total || 0,
            avg_pct: an.summary.avg_pct !== null ? parseFloat(an.summary.avg_pct) : 0
          },
          by_category: an.by_category.map(c => ({
            category: c.category,
            count: c.count,
            avg_pct: c.avg_pct !== null ? parseFloat(c.avg_pct) : 0
          })),
          soon_expiring: an.soon_expiring
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const runCalculation = async () => {
    setCalculating(true);
    try {
      const res = await api.calculateDiscounts();
      setCalculationResult(res.applied);
      // reload analytics after calculation
      const an  = await api.getDiscountAnalytics();
      setAnalytics({
        summary: {
          total: an.summary.total || 0,
          avg_pct: an.summary.avg_pct !== null ? parseFloat(an.summary.avg_pct) : 0
        },
        by_category: an.by_category.map(c => ({
          category: c.category,
          count: c.count,
          avg_pct: c.avg_pct !== null ? parseFloat(c.avg_pct) : 0
        })),
        soon_expiring: an.soon_expiring
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={runCalculation} disabled={calculating}>
        {calculating ? 'Calculating...' : 'Run Discount Calculation'}
      </button>
      {calculationResult && (
        <pre>{JSON.stringify(calculationResult, null, 2)}</pre>
      )}

      <h2>Expiring Soon</h2>
      <ul>
        {expiringProducts.map(item => (
          <li key={item.inventory_id}>
            {item.product_id} expires on {new Date(item.expiration_date).toLocaleDateString()}
          </li>
        ))}
      </ul>

      <h2>Analytics</h2>
      <p>Total Discounts: {analytics.summary.total}</p>
      <p>Avg Discount: {analytics.summary.avg_pct.toFixed(1)}%</p>

      <h3>By Category</h3>
      <ul>
        {analytics.by_category.map(cat => (
          <li key={cat.category}>
            {cat.category}: {cat.count} items, avg {cat.avg_pct.toFixed(1)}%
          </li>
        ))}
      </ul>

      <h3>Soon Expiring Discounts</h3>
      <ul>
        {analytics.soon_expiring.map(se => (
          <li key={se.product_id}>
            {se.product_id} expires on {new Date(se.expires_at).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;