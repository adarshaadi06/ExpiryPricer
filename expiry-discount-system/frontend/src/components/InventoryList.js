import React, { useState, useEffect } from 'react';
import { getInventory, getProducts, createInventory } from '../services/api'; // Import API functions

function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newInventory, setNewInventory] = useState({
    product_id: '',
    batch_id: '',
    quantity: '',
    location: '',
    manufacture_date: '',
    expiration_date: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch inventory data
      const inventoryData = await getInventory(); // Use the getInventory function
      setInventory(inventoryData);

      // Fetch products for dropdown
      const productsData = await getProducts(); // Use the getProducts function
      setProducts(productsData);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError("Failed to load inventory data");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInventory({
      ...newInventory,
      [name]: value
    });
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();

    try {
      // Validate inventory data
      if (!newInventory.product_id || !newInventory.batch_id || !newInventory.quantity || !newInventory.expiration_date) {
        alert("Please fill all required fields");
        return;
      }

      // Convert quantity to number
      const inventoryData = {
        ...newInventory,
        quantity: parseInt(newInventory.quantity, 10)
      };

      await createInventory(inventoryData); // Use the createInventory function

      // Reset form and refresh inventory list
      setNewInventory({
        product_id: '',
        batch_id: '',
        quantity: '',
        location: '',
        manufacture_date: '',
        expiration_date: ''
      });
      setShowAddForm(false);
      fetchData();

    } catch (err) {
      console.error("Error adding inventory:", err);
      alert("Failed to add inventory: " + (err.response?.data?.error || err.message));
    }
  };

  const getExpirationStatusClass = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'critical';
    if (daysUntilExpiry <= 7) return 'warning';
    if (daysUntilExpiry <= 14) return 'attention';
    return '';
  };

  if (loading) return <div className="loading">Loading inventory data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="inventory-list">
      <h1>Inventory</h1>

      <div className="action-container">
        <button
          className="action-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Inventory'}
        </button>
      </div>

      {showAddForm && (
        <div className="form-container">
          <h2>Add New Inventory</h2>
          <form onSubmit={handleAddInventory}>
            <div className="form-group">
              <label>Product:</label>
              <select
                name="product_id"
                value={newInventory.product_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.name} ({product.product_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Batch ID:</label>
              <input
                type="text"
                name="batch_id"
                value={newInventory.batch_id}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={newInventory.quantity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={newInventory.location}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Manufacture Date:</label>
              <input
                type="date"
                name="manufacture_date"
                value={newInventory.manufacture_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Expiration Date:</label>
              <input
                type="date"
                name="expiration_date"
                value={newInventory.expiration_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="submit-button">Add Inventory</button>
          </form>
        </div>
      )}

      <div className="inventory-table-container">
        {inventory.length === 0 ? (
          <p>No inventory items found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Batch ID</th>
                <th>Quantity</th>
                <th>Location</th>
                <th>Expiration Date</th>
                <th>Days Until Expiry</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr
                  key={item.inventory_id}
                  className={getExpirationStatusClass(item.days_until_expiry)}
                >
                  <td>{item.inventory_id}</td>
                  <td>{item.product_name}</td>
                  <td>{item.batch_id}</td>
                  <td>{item.quantity}</td>
                  <td>{item.location || '-'}</td>
                  <td>{new Date(item.expiration_date).toLocaleDateString()}</td>
                  <td>{item.days_until_expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default InventoryList;
