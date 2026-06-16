import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';

const fallbackSettings = [
  { key: 'business', value: { appName: 'The Gents Studio & Spa', operatingHours: '8:00 AM – 9:00 PM', phones: ['0301 5092782', '0335 2279567'] } },
  { key: 'loyalty', value: { stampsNeeded: 10, pointsPerStamp: 100, rewardType: 'FREE_SERVICE' } },
  { key: 'referral', value: { referrerStamps: 2, referrerPoints: 200, friendDiscountPercent: 20 } },
  { key: 'packageBuilder', value: { minimumServicesForDiscount: 2, discountPercent: 20 } },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(fallbackSettings);
  const [message, setMessage] = useState('Fallback settings shown. Connect backend for live editable settings.');

  useEffect(() => {
    api.settings()
      .then(result => { setSettings(result.data); setMessage('Live settings loaded.'); })
      .catch(() => setMessage('Backend offline: fallback settings shown.'));
  }, []);

  const columns = [
    { key: 'key', label: 'Setting' },
    { key: 'value', label: 'Value', render: row => <code>{JSON.stringify(row.value)}</code> },
  ];

  return (
    <section className="card">
      <div className="toolbar">
        <button className="btn">Edit Business Hours</button>
        <button className="btn secondary">Edit Loyalty Rules</button>
      </div>
      <p className="muted">{message}</p>
      <DataTable columns={columns} rows={settings} />
    </section>
  );
}
