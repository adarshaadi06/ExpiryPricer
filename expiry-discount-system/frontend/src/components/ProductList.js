import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, calculateDiscounts } from '../services/api'; // Import API functions

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    product_id: '',
    name: '',
    base_price: '',
    category: '',
    sku: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProducts(); // Use the getProducts function
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      // Validate product data
      if (!newProduct.product_id || !newProduct.name || !newProduct.base_price || !newProduct.sku) {
        alert("Please fill all required fields");
        return;
      }

      // Convert base_price to number
      const productData = {
        ...newProduct,
        base_price: parseFloat(newProduct.base_price)
      };

      await createProduct(productData); // Use the createProduct function

      // Reset form and refresh product list
      setNewProduct({
        product_id: '',
        name: '',
        base_price: '',
        category: '',
        sku: ''
      });
      setShowAddForm(false);
      fetchProducts();

    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product: " + (err.response?.data?.error || err.message));
    }
  };

  const applyDiscount = async (productId) => {
    try {
      const response = await calculateDiscounts(); // Use the calculateDiscounts function
      alert(response.message);
      fetchProducts(); // Refresh list after applying discount
    } catch (err) {
      console.error("Error applying discount:", err);
      alert("Failed to apply discount: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list">
      <h1>Products</h1>

      <div className="action-container">
        <button
          className="action-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="form-container">
          <h2>Add New Product</h2>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label>Product ID:</label>
              <input
                type="text"
                name="product_id"
                value={newProduct.product_id}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Base Price:</label>
              <input
                type="number"
                step="0.01"
                name="base_price"
                value={newProduct.base_price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <input
                type="text"
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>SKU:</label>
              <input
                type="text"
                name="sku"
                value={newProduct.sku}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="submit-button">Add Product</button>
          </form>
        </div>
      )}

      <div className="products-table-container">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Base Price</th>
                <th>Current Price</th>
                <th>Discount</th>
                <th>Category</th>
                <th>Expiration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const discount = product.base_price - product.current_price;
                const discountPercent = ((discount / product.base_price) * 100).toFixed(2);

                return (
                  <tr key={product.product_id}>
                    <td>{product.product_id}</td>
                    <td>{product.name}</td>
                    <td>${product.base_price.toFixed(2)}</td>
                    <td>${product.current_price.toFixed(2)}</td>
                    <td>
                      {discount > 0 ? `${discountPercent}%` : 'None'}
                    </td>
                    <td>{product.category || '-'}</td>
                    <td>
                      {product.expiration_date ?
                        `${new Date(product.expiration_date).toLocaleDateString()} (${product.days_until_expiry} days)` :
                        'No inventory'}
                    </td>
                    <td>
                      <button
                        className="action-button small"
                        onClick={() => applyDiscount(product.product_id)}
                      >
                        Apply Discount
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ProductList;
