import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';

const seedInventory = [
  { id: 'inv-1', item_name: 'Shampoo', category: 'Supplies', quantity: 12, unit: 'bottles', reorder_level: 5, active: true },
  { id: 'inv-2', item_name: 'Hair Color', category: 'Colors', quantity: 8, unit: 'packs', reorder_level: 4, active: true },
  { id: 'inv-3', item_name: 'Disposable Razors', category: 'Hygiene', quantity: 100, unit: 'pcs', reorder_level: 25, active: true },
];

export default function InventoryPage() {
  const [items, setItems] = useState(seedInventory);
  const [message, setMessage] = useState('Inventory management scaffold for shampoo, colors, and supplies.');

  useEffect(() => {
    api.inventory()
      .then(result => { setItems(result.data); setMessage('Live inventory loaded.'); })
      .catch(() => setMessage('Backend offline: seed inventory shown.'));
  }, []);

  const columns = [
    { key: 'item_name', label: 'Item' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Quantity', render: row => `${row.quantity} ${row.unit}` },
    { key: 'reorder_level', label: 'Reorder Level' },
    { key: 'active', label: 'Status', render: row => <span className="badge">{row.quantity <= row.reorder_level ? 'Low Stock' : 'OK'}</span> },
  ];

  return (
    <section className="card">
      <div className="toolbar">
        <button className="btn">Add Inventory Item</button>
        <button className="btn secondary">Update Stock</button>
      </div>
      <p className="muted">{message}</p>
      <DataTable columns={columns} rows={items} />
    </section>
  );
}
