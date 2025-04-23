import React, { useState, useEffect } from 'react';
import { getDiscountRules, createDiscountRule, updateDiscountRule, activateDiscountRule, deactivateDiscountRule } from '../services/api'; // Import API functions

function DiscountRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    days_before_expiry: '',
    discount_percentage: '',
    category: '',
    priority: '0',
    is_active: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editRuleId, setEditRuleId] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDiscountRules(); // Use the getDiscountRules function
      setRules(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching discount rules:", err);
      setError("Failed to load discount rules");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRule({
      ...newRule,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddRule = async (e) => {
    e.preventDefault();

    try {
      // Validate rule data
      if (!newRule.name || !newRule.days_before_expiry || !newRule.discount_percentage) {
        alert("Please fill all required fields");
        return;
      }

      // Convert numeric fields
      const ruleData = {
        ...newRule,
        days_before_expiry: parseInt(newRule.days_before_expiry, 10),
        discount_percentage: parseFloat(newRule.discount_percentage),
        priority: parseInt(newRule.priority, 10)
      };

      if (editRuleId) {
        // Update existing rule
        await updateDiscountRule(editRuleId, ruleData); // Use the updateDiscountRule function
      } else {
        // Add new rule
        await createDiscountRule(ruleData); // Use the createDiscountRule function
      }

      // Reset form and refresh rules list
      setNewRule({
        name: '',
        description: '',
        days_before_expiry: '',
        discount_percentage: '',
        category: '',
        priority: '0',
        is_active: true
      });
      setShowAddForm(false);
      setEditRuleId(null);
      fetchRules();

    } catch (err) {
      console.error("Error saving discount rule:", err);
      alert("Failed to save discount rule: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEditRule = (rule) => {
    setNewRule({
      name: rule.name,
      description: rule.description || '',
      days_before_expiry: rule.days_before_expiry.toString(),
      discount_percentage: rule.discount_percentage.toString(),
      category: rule.category || '',
      priority: rule.priority.toString(),
      is_active: rule.is_active
    });
    setEditRuleId(rule.rule_id);
    setShowAddForm(true);
  };

  const handleToggleActive = async (ruleId, currentStatus) => {
    try {
      if (currentStatus) {
        await deactivateDiscountRule(ruleId); // Use the deactivateDiscountRule function
      } else {
        await activateDiscountRule(ruleId); // Use the activateDiscountRule function
      }
      fetchRules();
    } catch (err) {
      console.error("Error toggling rule status:", err);
      alert("Failed to update rule status");
    }
  };

  if (loading) return <div className="loading">Loading discount rules...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="discount-rules">
      <h1>Discount Rules</h1>

      <div className="action-container">
        <button
          className="action-button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) {
              setEditRuleId(null);
              setNewRule({
                name: '',
                description: '',
                days_before_expiry: '',
                discount_percentage: '',
                category: '',
                priority: '0',
                is_active: true
              });
            }
          }}
        >
          {showAddForm ? 'Cancel' : editRuleId ? 'Edit Rule' : 'Add New Rule'}
        </button>
      </div>

      {showAddForm && (
        <div className="form-container">
          <h2>{editRuleId ? 'Edit Discount Rule' : 'Add New Discount Rule'}</h2>
          <form onSubmit={handleAddRule}>
            <div className="form-group">
              <label>Rule Name:</label>
              <input
                type="text"
                name="name"
                value={newRule.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={newRule.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Days Before Expiry:</label>
              <input
                type="number"
                name="days_before_expiry"
                value={newRule.days_before_expiry}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Discount Percentage:</label>
              <input
                type="number"
                step="0.01"
                name="discount_percentage"
                value={newRule.discount_percentage}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category (optional):</label>
              <input
                type="text"
                name="category"
                value={newRule.category}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Priority:</label>
              <input
                type="number"
                name="priority"
                value={newRule.priority}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={newRule.is_active}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            <button type="submit" className="submit-button">
              {editRuleId ? 'Update Rule' : 'Add Rule'}
            </button>
          </form>
        </div>
      )}

      <div className="rules-table-container">
        {rules.length === 0 ? (
          <p>No discount rules found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Days Before Expiry</th>
                <th>Discount %</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.rule_id} className={rule.is_active ? '' : 'inactive'}>
                  <td>{rule.name}</td>
                  <td>{rule.days_before_expiry}</td>
                  <td>{rule.discount_percentage}%</td>
                  <td>{rule.category || 'All'}</td>
                  <td>{rule.priority}</td>
                  <td>
                    <span className={`status-badge ${rule.is_active ? 'active' : 'inactive'}`}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-button small"
                        onClick={() => handleEditRule(rule)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-button small"
                        onClick={() => handleToggleActive(rule.rule_id, rule.is_active)}
                      >
                        {rule.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DiscountRules;
