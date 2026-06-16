import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import MetricCard from '../components/MetricCard.jsx';

const fallback = {
  totalCustomers: 0,
  totalAppointments: 0,
  totalStamps: 0,
  revenuePkr: 0,
  todayAppointments: 0,
  lowStockItems: 0,
};

export default function DashboardPage() {
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState('Connect backend to show live analytics.');

  useEffect(() => {
    api.dashboard()
      .then(result => { setData(result.data); setStatus('Live data loaded from backend.'); })
      .catch(() => setStatus('Backend offline: showing scaffold metrics.'));
  }, []);

  return (
    <div className="grid">
      <div className="grid cards">
        <MetricCard label="Total Customers" value={data.totalCustomers} />
        <MetricCard label="Revenue" value={`PKR ${Number(data.revenuePkr || 0).toLocaleString('en-PK')}`} />
        <MetricCard label="Appointments" value={data.totalAppointments} note={`${data.todayAppointments} today`} />
        <MetricCard label="Stamps Issued" value={data.totalStamps} />
        <MetricCard label="Low Stock" value={data.lowStockItems} />
      </div>
      <section className="card">
        <h2>Owner Snapshot</h2>
        <p className="muted">{status}</p>
        <p>Use this panel to manage customers, manually edit stamps, update services/prices, staff, appointments, inventory, and business settings.</p>
        <span className="badge">Black + Gold luxury theme active</span>
      </section>
    </div>
  );
}
