import React, { useState, useEffect } from 'react';
import api from '../services/api';

function InventoryList() {
  const [inv, setInv] = useState([]);
  const [form, setForm] = useState({ product_id:'', batch_id:'', quantity:'', location:'', manufacture_date:'', expiration_date:'' });

  useEffect(() => { api.getInventory().then(setInv); }, []);

  const submit = async e => {
    e.preventDefault();
    await api.createInventory(form);
    setInv(await api.getInventory());
  };

  return (
    <div>
      <h1>Inventory</h1>
      <form onSubmit={submit}>
        {['product_id','batch_id','quantity','location','manufacture_date','expiration_date'].map(f=> (
          <input key={f} placeholder={f} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}/>
        ))}
        <button type="submit">Add</button>
      </form>
      <ul>
        {inv.map(i => (
          <li key={i.inventory_id}>
            {i.product_id}—{i.batch_id} expires {new Date(i.expiration_date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InventoryList;