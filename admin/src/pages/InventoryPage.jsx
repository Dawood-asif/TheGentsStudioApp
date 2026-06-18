import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';

const seedInventory = [
  { id: 'inv-1', item_name: 'Shampoo', category: 'Supplies', quantity: 12, unit: 'bottles', reorder_level: 5, active: true },
  { id: 'inv-2', item_name: 'Hair Color', category: 'Colors', quantity: 8, unit: 'packs', reorder_level: 4, active: true },
  { id: 'inv-3', item_name: 'Disposable Razors', category: 'Hygiene', quantity: 100, unit: 'pcs', reorder_level: 25, active: true },
];

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
  const [message, setMessage] = useState('Inventory management scaffold for 0).toLocaleString()} {item.unit} left</span>
                </div>
                <span className={`stock-badge ${status.className}`}>{status.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <button className="btn">Add Inventory Item</button>
          <button className="btn secondary">Update Stock</button>
        </div>
        <p className="muted">{message}</p>
        <DataTable columns={columns} rows={items} />
      </section>
    </div>
  );
}
