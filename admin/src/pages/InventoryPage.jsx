import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';

const seedInventory = [
  { id: 'inv-1', item_name: 'Shampoo', category: 'Supplies', quantity: 12, unit: 'bottles', reorder_level: 5, active: true },
  { id: 'inv-2', item_name: 'Hair Color', category: 'Colors', quantity: 8, unit: 'packs', reorder_level: 4, active: true },
  { id: 'inv-3', item_name: 'Disposable Razors', category: 'Hygiene', quantity: 100, unit: 'pcs', reorder_level: 25, active: true },
];

const emptyForm = {
  itemName: '',
  category: '',
  quantity: 0,
  unit: 'pcs',
  reorderLevel: 0,
  notes: '',
};

function stockStatus(item) {
  const quantity = Number(item.quantity || 0);
  const reorder = Number(item.reorder_level || 0);

  if (quantity <= 0) return { label: 'Out of Stock', className: 'danger' };
  if (quantity <= reorder) return { label: 'Low Stock', className: 'warning' };
  if (quantity <= reorder * 1.5) return { label: 'Watch', className: 'watch' };

  return { label: 'OK', className: 'ok' };
}

export default function InventoryPage() {
  const [items, setItems] = useState(seedInventory);
  const [message, setMessage] = useState('Inventory management for shampoo, colors, supplies, razors, and towels.');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  const load = () => {
    api.inventory()
      .then(result => {
        setItems(result.data);
        setMessage('Live inventory loaded.');
      })
      .catch(() => setMessage('Backend offline: seed inventory shown.'));
  };

  useEffect(() => { load(); }, []);

  const summary = useMemo(() => {
    const total = items.length;
    const low = items.filter(item => stockStatus(item).className === 'warning').length;
    const out = items.filter(item => stockStatus(item).className === 'danger').length;
    const watch = items.filter(item => stockStatus(item).className === 'watch').length;

    return { total, low, out, watch };
  }, [items]);

  const lowStockItems = items.filter(item => ['warning', 'danger'].includes(stockStatus(item).className));

  const updateForm = event => {
    const { name, value } = event.target;
    setForm(current => ({
      ...current,
      [name]: ['quantity', 'reorderLevel'].includes(name) ? Number(value || 0) : value,
    }));
  };

  const addInventoryItem = async event => {
    event.preventDefault();

    if (!form.itemName.trim()) {
      setMessage('Item name is required.');
      return;
    }

    try {
      await api.createInventoryItem(form);
      setMessage(`Inventory item added: ${form.itemName}`);
      setForm(emptyForm);
      setShowAddForm(false);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateStock = async event => {
    event.preventDefault();

    if (!selectedItemId) {
      setMessage('Select an item to update.');
      return;
    }

    try {
      await api.updateInventoryItem(selectedItemId, { quantity: Number(newQuantity || 0) });
      setMessage('Stock quantity updated.');
      setNewQuantity('');
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const quickRestock = async item => {
    const target = Math.max(Number(item.reorder_level || 0) * 2, Number(item.quantity || 0) + 10);

    try {
      await api.updateInventoryItem(item.id, { quantity: target });
      setMessage(`${item.item_name} restocked to ${target} ${item.unit}.`);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const columns = [
    { key: 'item_name', label: 'Item' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Quantity', render: row => `${Number(row.quantity || 0).toLocaleString()} ${row.unit}` },
    { key: 'reorder_level', label: 'Reorder Level' },
    {
      key: 'active',
      label: 'Status',
      render: row => {
        const status = stockStatus(row);
        return <span className={`stock-badge ${status.className}`}>{status.label}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: row => <button className="btn secondary" onClick={() => quickRestock(row)}>Quick Restock</button>,
    },
  ];

  return (
    <div className="grid">
      <section className="card inventory-hero">
        <div>
          <h2>Inventory Command Center</h2>
          <p className="muted">Track products, colors, supplies, razors, towels, and low-stock risk before it affects customers.</p>
        </div>
        <span className="badge">Live Stock Intelligence</span>
      </section>

      <div className="grid cards">
        <div className="metric"><span className="muted">Total Items</span><strong>{summary.total}</strong></div>
        <div className="metric"><span className="muted">Low Stock</span><strong>{summary.low}</strong></div>
        <div className="metric"><span className="muted">Out of Stock</span><strong>{summary.out}</strong></div>
        <div className="metric"><span className="muted">Watch Items</span><strong>{summary.watch}</strong></div>
      </div>

      <section className="card">
        <h2>Low Stock Alerts</h2>

        {!lowStockItems.length && <p className="muted">No urgent stock alerts. Everything looks healthy.</p>}

        <div className="inventory-alert-list">
          {lowStockItems.map(item => {
            const status = stockStatus(item);

            return (
              <div className={`inventory-alert ${status.className}`} key={item.id || item.item_name}>
                <div>
                  <strong>{item.item_name}</strong>
                  <span>{item.category || 'General'} | {Number(item.quantity || 0).toLocaleString()} {item.unit} left</span>
                </div>
                <div className="toolbar">
                  <span className={`stock-badge ${status.className}`}>{status.label}</span>
                  <button className="btn secondary" onClick={() => quickRestock(item)}>Quick Restock</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <button className="btn" onClick={() => setShowAddForm(value => !value)}>{showAddForm ? 'Close Add Form' : 'Add Inventory Item'}</button>
          <button className="btn secondary" onClick={load}>Refresh</button>
        </div>

        {showAddForm && (
          <form className="inventory-form" onSubmit={addInventoryItem}>
            <input name="itemName" value={form.itemName} onChange={updateForm} placeholder="Item name" />
            <input name="category" value={form.category} onChange={updateForm} placeholder="Category" />
            <input name="quantity" type="number" value={form.quantity} onChange={updateForm} placeholder="Quantity" />
            <input name="unit" value={form.unit} onChange={updateForm} placeholder="Unit (pcs, bottles, packs)" />
            <input name="reorderLevel" type="number" value={form.reorderLevel} onChange={updateForm} placeholder="Reorder level" />
            <input name="notes" value={form.notes} onChange={updateForm} placeholder="Notes" />
            <button className="btn" type="submit">Save Item</button>
          </form>
        )}

        <form className="inventory-form compact" onSubmit={updateStock}>
          <select value={selectedItemId} onChange={event => setSelectedItemId(event.target.value)}>
            <option value="">Select item to update quantity</option>
            {items.map(item => <option key={item.id} value={item.id}>{item.item_name} ({item.quantity} {item.unit})</option>)}
          </select>
          <input type="number" value={newQuantity} onChange={event => setNewQuantity(event.target.value)} placeholder="New quantity" />
          <button className="btn secondary" type="submit">Update Quantity</button>
        </form>

        <p className="muted">{message}</p>
        <DataTable columns={columns} rows={items} />
      </section>
    </div>
  );
}
