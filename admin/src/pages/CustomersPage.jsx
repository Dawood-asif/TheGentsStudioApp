import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import { downloadCsv } from '../utils/csv.js';

const fallbackCustomers = [
  { id: 'demo-1', customer_code: 'GST-DEMO-0001', full_name: 'Demo Customer', phone: '0301 5092782', email: 'demo@example.com', stamps: 6, points: 600, visits: 6, current_streak: 4, referral_code: 'GENTSDEMO1' },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(fallbackCustomers);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('Backend offline: demo row shown until API is connected.');

  const load = () => {
    api.customers(search)
      .then(result => { setCustomers(result.data); setMessage('Live customers loaded.'); })
      .catch(() => setMessage('Backend offline: demo row shown until API is connected.'));
  };

  useEffect(() => { load(); }, []);

  const addStamp = async customer => {
    try {
      await api.addStamp({ customerId: customer.id, note: 'Manual admin stamp' });
      setMessage(`Stamp added for ${customer.full_name}.`);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const columns = [
    { key: 'customer_code', label: 'Customer ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'stamps', label: 'Stamps' },
    { key: 'points', label: 'Points' },
    { key: 'visits', label: 'Visits' },
    { key: 'current_streak', label: 'Streak' },
    { key: 'referral_code', label: 'Referral' },
    { key: 'actions', label: 'Actions', render: row => <button className="btn secondary" onClick={() => addStamp(row)}>+ Stamp</button> },
  ];

  return (
    <section className="card">
      <div className="toolbar">
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name, phone, email, customer ID" />
        <button className="btn" onClick={load}>Search</button>
        <button className="btn secondary" onClick={() => downloadCsv('gents-customers.csv', customers)}>Export CSV</button>
      </div>
      <p className="muted">{message}</p>
      <DataTable columns={columns} rows={customers} />
    </section>
  );
}
