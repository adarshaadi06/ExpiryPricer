import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id:'', name:'', base_price:'', category:'', sku:'' });

  useEffect(() => { api.getProducts().then(setProducts); }, []);

  const submit = async e => {
    e.preventDefault();
    await api.createProduct(form);
    setProducts(await api.getProducts());
  };

  return (
    <div>
      <h1>Products</h1>
      <form onSubmit={submit}>
        {['product_id','name','base_price','category','sku'].map(field => (
          <input key={field}
            placeholder={field}
            value={form[field]}
            onChange={e=>setForm({...form,[field]:e.target.value})}
          />
        ))}
        <button type="submit">Add</button>
      </form>
      <ul>
        {products.map(p => <li key={p.product_id}>{p.product_id}: {p.name} (${p.current_price})</li>)}
      </ul>
    </div>
  );
}

export default ProductList;