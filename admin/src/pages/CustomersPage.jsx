import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import { downloadCsv } from '../utils/csv.js';
import { getVipTier, VIP_TIERS, normalizeTiers } from '../utils/vipTiers.js';

const fallbackCustomers = [
  { id: 'demo-1', customer_code: 'TGSS-DEMO-0001', full_name: 'Demo Customer', phone: '0301 5092782', email: 'demo@example.com', stamps: 6, points: 600, visits: 6, current_streak: 4, referral_code: 'TGSSDEMO1', profile_image_url: '' },
];

function CustomerPhoto({ row }) {
  if (row.profile_image_url) {
    return <img className="customer-photo" src={row.profile_image_url} alt={row.full_name || 'Customer'} />;
  }
  const initial = (row.full_name || '?').slice(0, 1).toUpperCase();
  return <span className="customer-photo placeholder">{initial}</span>;
}

function VipBadge({ points, tiers }) {
  const tier = getVipTier(points, tiers);
  return <span className={`vip-badge ${tier.id}`} style={{ '--tier-color': tier.color }}>{tier.name}</span>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState(fallbackCustomers);
  const [vipTiers, setVipTiers] = useState(VIP_TIERS);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('Backend offline: demo row shown until API is connected.');

  const load = () => {
    Promise.all([api.customers(search), api.settings()])
      .then(([customersResult, settingsResult]) => {
        setCustomers(customersResult.data);
        const vipRow = settingsResult.data?.find(item => item.key === 'vipTiers');
        if (Array.isArray(vipRow?.value)) setVipTiers(normalizeTiers(vipRow.value));
        setMessage('Live customers loaded.');
      })
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
    const editNotes = async customer => {
  const currentNotes = customer.customer_notes || '';
  const notes = window.prompt(`Notes for ${customer.full_name}`, currentNotes);

  if (notes === null) return;

  const currentPreferences = customer.preferences || {};
  const preferencesText = window.prompt(
    'Preferences JSON (example: {"haircut":"low fade","skin":"sensitive"})',
    JSON.stringify(currentPreferences, null, 2)
  );

  if (preferencesText === null) return;

  let preferences = {};
  try {
    preferences = JSON.parse(preferencesText || '{}');
  } catch (error) {
    setMessage('Invalid preferences JSON.');
    return;
  }

  try {
    await api.updateCustomer(customer.id, {
      customer_notes: notes,
      preferences,
    });
    setMessage(`Notes updated for ${customer.full_name}.`);
    load();
  } catch (error) {
    setMessage(error.message);
  }
};
  };

  const columns = [
    { key: 'profile_image_url', label: 'Photo', render: row => <CustomerPhoto row={row} /> },
    { key: 'customer_code', label: 'Customer ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'vip_tier', label: 'VIP Tier', render: row => <VipBadge points={row.points} tiers={vipTiers} /> },
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
