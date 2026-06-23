import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';

const fallbackAppointments = [
  { id: 'appt-demo', customer_name: 'Walk-in Demo', phone: '0301 5092782', appointment_at: new Date().toISOString(), status: 'pending', package_total: 0, sync_status: 'synced' },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(fallbackAppointments);
  const [message, setMessage] = useState('Demo appointment shown until backend is connected.');

  useEffect(() => {
    api.appointments()
      .then(result => { setAppointments(result.data); setMessage('Live appointments loaded.'); })
      .catch(() => setMessage('Backend offline: demo appointment shown.'));
  }, []);

  const columns = [
    { key: 'customer_name', label: 'Customer', render: row => row.customer_full_name || row.customer_name || 'Walk-in' },
    { key: 'phone', label: 'Phone' },
    { key: 'appointment_at', label: 'Date', render: row => row.appointment_at ? new Date(row.appointment_at).toLocaleString() : 'Walk-in' },
    { key: 'package_total', label: 'Total', render: row => `PKR ${Number(row.package_total || 0).toLocaleString('en-PK')}` },
    { key: 'status', label: 'Status', render: row => <span className="badge">{row.status}</span> },
    { key: 'sync_status', label: 'Sync' },
  ];

  return (
    <section className="card">
      <div className="toolbar">
        <button className="btn">Create Walk-in</button>
        <button className="btn secondary">Change Status</button>
      </div>
      <p className="muted">{message} Online cancellation is disabled; customers must call.</p>
      <DataTable columns={columns} rows={appointments} />
    </section>
  );
}
