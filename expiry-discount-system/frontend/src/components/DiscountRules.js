import React, { useState, useEffect } from 'react';
import api from '../services/api';

function DiscountRules() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ name:'', days_before_expiry:'', discount_percentage:'', description:'', category:'', priority:'' });

  useEffect(() => { api.getDiscountRules().then(setRules); }, []);

  const submit = async e => {
    e.preventDefault();
    await api.createDiscountRule(form);
    setRules(await api.getDiscountRules());
  };

  return (
    <div>
      <h1>Discount Rules</h1>
      <form onSubmit={submit}>
        {['name','days_before_expiry','discount_percentage','description','category','priority'].map(f=> (
          <input key={f} placeholder={f} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}/>
        ))}
        <button type="submit">Add Rule</button>
      </form>
      <ul>
        {rules.map(r=> <li key={r.rule_id}>{r.name}: {r.discount_percentage}% at {r.days_before_expiry} days</li>)}
      </ul>
    </div>
  );
}

export default DiscountRules;