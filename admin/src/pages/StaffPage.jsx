import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';

const fallbackStaff = [
  { id: 'staff-01', name: 'Harry', specialty: 'Master Barber - Precision Fades & Scissor Cuts', rating: 5, commission_percentage: 0, active: true },
  { id: 'staff-02', name: 'Wahid', specialty: 'Beard Specialist - Hot Towel Shaves & Shaping', rating: 5, commission_percentage: 0, active: true },
  { id: 'staff-03', name: 'Bilal', specialty: 'Color Expert - Hair Coloring & Highlights', rating: 5, commission_percentage: 0, active: true },
  { id: 'staff-04', name: 'Aman', specialty: 'Skin & Spa Therapist - Facials & Scalp Treatments', rating: 5, commission_percentage: 0, active: true },
  { id: 'staff-05', name: 'Gulfam', specialty: 'Classic Cuts Specialist - Traditional & Military', rating: 5, commission_percentage: 0, active: true },
  { id: 'staff-06', name: 'Fakhar', specialty: 'Kids & Curly Hair Specialist', rating: 5, commission_percentage: 0, active: true },
  { id: 'staff-07', name: 'Abdul Rehman', specialty: 'Luxury Grooming Expert - Complete Packages', rating: 5, commission_percentage: 0, active: true },
];

export default function StaffPage() {
  const [staff, setStaff] = useState(fallbackStaff);
  const [message, setMessage] = useState('Staff seed list shown. Customer app does not allow staff selection.');

  useEffect(() => {
    api.staff()
      .then(result => { setStaff(result.data); setMessage('Live staff loaded.'); })
      .catch(() => setMessage('Backend offline: seed staff shown.'));
  }, []);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'specialty', label: 'Specialty' },
    { key: 'rating', label: 'Rating' },
    { key: 'commission_percentage', label: 'Commission', render: row => `${row.commission_percentage ?? 0}%` },
    { key: 'active', label: 'Status', render: row => <span className="badge">{row.active === false ? 'Inactive' : 'Active'}</span> },
  ];

  return (
    <section className="card">
      <div className="toolbar">
        <button className="btn">Add Staff</button>
        <button className="btn secondary">Edit Staff</button>
      </div>
      <p className="muted">{message}</p>
      <DataTable columns={columns} rows={staff} />
    </section>
  );
}
