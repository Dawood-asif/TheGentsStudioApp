import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import { SEED_SERVICES } from '../data_seed_services.js';

const emptyForm = {
  category: 'Haircuts',
  name: '',
  pricePkr: 0,
  active: true,
};

export default function ServicesPage() {
  const [services, setServices] = useState(SEED_SERVICES);
  const [category, setCategory] = useState('All');
  const [message, setMessage] = useState('Seed services shown. Connect backend for live edit/delete.');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');

  const load = () => {
    api.services()
      .then(result => {
        setServices(result.data.map(row => ({ ...row, pricePkr: row.price_pkr ?? row.pricePkr })));
        setMessage('Live services loaded.');
      })
      .catch(() => setMessage('Backend offline: seed services shown.'));
  };

  useEffect(() => { load(); }, []);

  const categories = ['All', ...new Set(services.map(service => service.category))];

  const filtered = useMemo(() => (
    category === 'All'
      ? services
      : services.filter(service => service.category === category)
  ), [services, category]);

  const updateForm = event => {
    const { name, value, type, checked } = event.target;
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : name === 'pricePkr' ? Number(value || 0) : value,
    }));
  };

  const startEdit = service => {
    setEditingId(service.id);
    setForm({
      category: service.category,
      name: service.name,
      pricePkr: service.price_pkr ?? service.pricePkr,
      active: service.active !== false,
    });
    setMessage(`Editing service: ${service.name}`);
  };

  const resetForm = () => {
    setEditingId('');
    setForm(emptyForm);
  };

  const submit = async event => {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage('Service name is required.');
      return;
    }

    if (!form.category.trim()) {
      setMessage('Category is required.');
      return;
    }

    try {
      if (editingId) {
        await api.updateService(editingId, form);
        setMessage(`Service updated: ${form.name}`);
      } else {
        await api.createService(form);
        setMessage(`Service added: ${form.name}`);
      }

      resetForm();
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deactivate = async service => {
    const ok = window.confirm(`Deactivate ${service.name}?`);
    if (!ok) return;

    try {
      await api.deleteService(service.id);
      setMessage(`Service deactivated: ${service.name}`);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const columns = [
    { key: 'category', label: 'Category' },
    { key: 'name', label: 'Service' },
    { key: 'pricePkr', label: 'Price', render: row => `PKR ${Number(row.pricePkr || row.price_pkr || 0).toLocaleString('en-PK')}` },
    { key: 'active', label: 'Status', render: row => <span className="badge">{row.active === false ? 'Inactive' : 'Active'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="action-buttons">
          <button className="btn secondary" onClick={() => startEdit(row)}>Edit</button>
          <button className="btn secondary" onClick={() => deactivate(row)}>Deactivate</button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid">
      <section className="card">
        <h2>{editingId ? 'Edit Service' : 'Add Service'}</h2>

        <form className="service-form" onSubmit={submit}>
          <input name="category" value={form.category} onChange={updateForm} placeholder="Category" />
          <input name="name" value={form.name} onChange={updateForm} placeholder="Service name" />
          <input name="pricePkr" type="number" min="0" value={form.pricePkr} onChange={updateForm} placeholder="Price PKR" />
          <label className="setting-check">
            <input name="active" type="checkbox" checked={form.active} onChange={updateForm} />
            <span>Active</span>
          </label>
          <button className="btn" type="submit">{editingId ? 'Save Changes' : 'Add Service'}</button>
          {editingId && <button className="btn secondary" type="button" onClick={resetForm}>Cancel Edit</button>}
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <select value={category} onChange={event => setCategory(event.target.value)}>
            {categories.map(item => <option key={item}>{item}</option>)}
          </select>
          <button className="btn secondary" onClick={load}>Refresh</button>
        </div>

        <p className="muted">{message} Total services: {services.length}.</p>
        <DataTable columns={columns} rows={filtered} />
      </section>
    </div>
  );
}
