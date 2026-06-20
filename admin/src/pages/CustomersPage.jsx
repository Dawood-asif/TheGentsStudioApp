import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import { downloadCsv } from '../utils/csv.js';
import { getVipTier, VIP_TIERS, normalizeTiers } from '../utils/vipTiers.js';

const fallbackCustomers = [
  {
    id: 'demo-1',
    customer_code: 'TGSS-DEMO-0001',
    full_name: 'Demo Customer',
    phone: '0301 5092782',
    email: 'demo@example.com',
    stamps: 6,
    points: 600,
    visits: 6,
    current_streak: 4,
    referral_code: 'TGSSDEMO1',
    profile_image_url: '',
    customer_notes: '',
    preferences: {},
    vip_tier_override: '',
  },
];

function CustomerPhoto({ row }) {
  if (row.profile_image_url) {
    return <img className="customer-photo" src={row.profile_image_url} alt={row.full_name || 'Customer'} />;
  }

  const initial = (row.full_name || '?').slice(0, 1).toUpperCase();
  return <span className="customer-photo placeholder">{initial}</span>;
}

function VipBadge({ row, tiers }) {
  const tier = row.vip_tier_override
    ? { id: row.vip_tier_override.toLowerCase(), name: row.vip_tier_override, color: '#D4AF37' }
    : getVipTier(row.points, tiers);

  return <span className={`vip-badge ${tier.id}`} style={{ '--tier-color': tier.color }}>{tier.name}</span>;
}

export default function CustomersPage() {
const [customers, setCustomers] = useState(fallbackCustomers);
const [vipTiers, setVipTiers] = useState(VIP_TIERS);
const [search, setSearch] = useState('');
const [message, setMessage] = useState('Backend offline: demo row shown until API is connected.');
const [notesModalOpen, setNotesModalOpen] = useState(false);
const [selectedCustomer, setSelectedCustomer] = useState(null);
const [notesDraft, setNotesDraft] = useState('');
const [preferencesDraft, setPreferencesDraft] = useState('{}');
const [vipDraft, setVipDraft] = useState('Auto');

  const load = () => {
    Promise.all([api.customers(search), api.settings()])
      .then(([customersResult, settingsResult]) => {
        setCustomers(customersResult.data);

        const vipRow = settingsResult.data?.find(item => item.key === 'vipTiers');
        if (Array.isArray(vipRow?.value)) setVipTiers(normalizeTiers(vipRow.value));

        setMessage('Live customers loaded.');
      })
      .catch(error => setMessage(error.message || 'Backend offline: demo row shown until API is connected.'));
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

  const editNotes = async customer => {
    const notes = window.prompt(`Notes for ${customer.full_name}`, customer.customer_notes || '');
    if (notes === null) return;

    const preferencesText = window.prompt(
      'Preferences JSON example: {"haircut":"low fade","skin":"sensitive"}',
      JSON.stringify(customer.preferences || {}, null, 2),
    );
    if (preferencesText === null) return;

    let preferences = {};
    try {
      preferences = JSON.parse(preferencesText || '{}');
    } catch (_) {
      setMessage('Invalid preferences JSON.');
      return;
    }

    try {
      await api.updateCustomer(customer.id, { customer_notes: notes, preferences });
      setMessage(`Notes updated for ${customer.full_name}.`);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editVip = async customer => {
    const options = ['Auto', 'Member', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const current = customer.vip_tier_override || 'Auto';
    const value = window.prompt(`VIP tier for ${customer.full_name}: ${options.join(', ')}`, current);

    if (value === null) return;

    const clean = value.trim();
    if (!options.map(item => item.toLowerCase()).includes(clean.toLowerCase())) {
      setMessage(`Invalid VIP tier. Use: ${options.join(', ')}`);
      return;
    }

    const vip_tier_override = clean.toLowerCase() === 'auto' ? null : clean;

    try {
      await api.updateCustomer(customer.id, { vip_tier_override });
      setMessage(`VIP tier updated for ${customer.full_name}.`);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const columns = [
    { key: 'profile_image_url', label: 'Photo', render: row => <CustomerPhoto row={row} /> },
    { key: 'customer_code', label: 'Customer ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'vip_tier', label: 'VIP Tier', render: row => <VipBadge row={row} tiers={vipTiers} /> },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'stamps', label: 'Stamps' },
    { key: 'points', label: 'Points' },
    { key: 'visits', label: 'Visits' },
    { key: 'current_streak', label: 'Streak' },
    { key: 'referral_code', label: 'Referral' },
    {
      key: 'customer_notes',
      label: 'Notes',
      render: row => row.customer_notes ? <span className="badge">Has Notes</span> : <span className="muted">No notes</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="action-buttons">
          <button className="btn secondary" onClick={() => addStamp(row)}>+ Stamp</button>
          <button className="btn secondary" onClick={() => editNotes(row)}>Notes</button>
          <button className="btn secondary" onClick={() => editVip(row)}>VIP</button>
        </div>
      ),
    },
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
