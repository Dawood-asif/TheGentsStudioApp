import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import { SEED_SERVICES } from '../data_seed_services.js';

export default function ServicesPage() {
  const [services, setServices] = useState(SEED_SERVICES);
  const [category, setCategory] = useState('All');
  const [message, setMessage] = useState('Seed services shown. Connect backend for live edit/delete.');

  useEffect(() => {
    api.services()
      .then(result => { setServices(result.data.map(row => ({ ...row, pricePkr: row.price_pkr ?? row.pricePkr }))); setMessage('Live services loaded.'); })
      .catch(() => setMessage('Backend offline: seed services shown.'));
  }, []);

  const categories = ['All', ...new Set(services.map(service => service.category))];
  const filtered = useMemo(() => category === 'All' ? services : services.filter(service => service.category === category), [services, category]);

  const columns = [
    { key: 'category', label: 'Category' },
    { key: 'name', label: 'Service' },
    { key: 'pricePkr', label: 'Price', render: row => `PKR ${Number(row.pricePkr || 0).toLocaleString('en-PK')}` },
    { key: 'active', label: 'Status', render: row => <span className="badge">{row.active === false ? 'Inactive' : 'Active'}</span> },
  ];

  return (
    <section className="card">
      <div className="toolbar">
        <select value={category} onChange={event => setCategory(event.target.value)}>
          {categories.map(item => <option key={item}>{item}</option>)}
        </select>
        <button className="btn">Add Service</button>
        <button className="btn secondary">Edit Selected</button>
      </div>
      <p className="muted">{message} Total services: {services.length}.</p>
      <DataTable columns={columns} rows={filtered} />
    </section>
  );
}
