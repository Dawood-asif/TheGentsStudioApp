import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';

const fallbackStaff = [
  { id: 'staff-01', name: 'Harry', specialty: 'Master Barber - Precision Fades & Scissor Cuts', rating: 5, commission_percentage: 0, active: true, photo_url: '' },
  { id: 'staff-02', name: 'Wahid', specialty: 'Beard Specialist - Hot Towel Shaves & Shaping', rating: 5, commission_percentage: 0, active: true, photo_url: '' },
  { id: 'staff-03', name: 'Bilal', specialty: 'Color Expert - Hair Coloring & Highlights', rating: 5, commission_percentage: 0, active: true, photo_url: '' },
];

const emptyForm = {
  name: '',
  specialty: '',
  rating: 5,
  phone: '',
  commissionPercentage: 0,
  photoUrl: '',
  active: true,
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function StaffPhoto({ row }) {
  if (row.photo_url) {
    return <img className="customer-photo" src={row.photo_url} alt={row.name} />;
  }

  return <span className="customer-photo placeholder">{(row.name || '?').slice(0, 1).toUpperCase()}</span>;
}

export default function StaffPage() {
  const [staff, setStaff] = useState(fallbackStaff);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('Staff seed list shown. Customer app does not allow staff selection.');

  const load = () => {
    api.staff()
      .then(result => {
        setStaff(result.data);
        setMessage('Live staff loaded.');
      })
      .catch(() => setMessage('Backend offline: seed staff shown.'));
  };

  useEffect(() => { load(); }, []);

  const updateForm = event => {
    const { name, value, type, checked } = event.target;

    setForm(current => ({
      ...current,
      [name]: type === 'checkbox'
        ? checked
        : ['rating', 'commissionPercentage'].includes(name)
          ? Number(value || 0)
          : value,
    }));
  };

  const uploadPhoto = async file => {
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm(current => ({ ...current, photoUrl: dataUrl }));
      setMessage('Staff photo loaded. Click Save to apply.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const startEdit = member => {
    setEditingId(member.id);
    setForm({
      name: member.name || '',
      specialty: member.specialty || '',
      rating: Number(member.rating || 5),
      phone: member.phone || '',
      commissionPercentage: Number(member.commission_percentage || 0),
      photoUrl: member.photo_url || '',
      active: member.active !== false,
    });
    setMessage(`Editing staff: ${member.name}`);
  };

  const resetForm = () => {
    setEditingId('');
    setForm(emptyForm);
  };

  const submit = async event => {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage('Staff name is required.');
      return;
    }

    if (!form.specialty.trim()) {
      setMessage('Specialty is required.');
      return;
    }

    try {
      if (editingId) {
        await api.updateStaff(editingId, form);
        setMessage(`Staff updated: ${form.name}`);
      } else {
        await api.createStaff(form);
        setMessage(`Staff added: ${form.name}`);
      }

      resetForm();
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deactivate = async member => {
    const ok = window.confirm(`Deactivate ${member.name}?`);
    if (!ok) return;

    try {
      await api.updateStaff(member.id, { active: false });
      setMessage(`Staff deactivated: ${member.name}`);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const columns = [
    { key: 'photo_url', label: 'Photo', render: row => <StaffPhoto row={row} /> },
    { key: 'name', label: 'Name' },
    { key: 'specialty', label: 'Specialty' },
    { key: 'rating', label: 'Rating' },
    { key: 'commission_percentage', label: 'Commission', render: row => `${row.commission_percentage ?? 0}%` },
    { key: 'active', label: 'Status', render: row => <span className="badge">{row.active === false ? 'Inactive' : 'Active'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="action-buttons">
          <button className="btn secondary" onClick={() => startEdit(row)}>Edit</button>
          <button className="btn secondary" onClick={() => deactivate(row)}>Deactivate</button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid">
      <section className="card">
        <h2>{editingId ? 'Edit Staff' : 'Add Staff'}</h2>

        <form className="staff-form" onSubmit={submit}>
          <div className="staff-photo-editor">
            {form.photoUrl ? <img src={form.photoUrl} alt="Staff" /> : <span>No photo</span>}
            <input type="file" accept="image/*" onChange={event => uploadPhoto(event.target.files?.[0])} />
          </div>

          <input name="name" value={form.name} onChange={updateForm} placeholder="Staff name" />
          <input name="specialty" value={form.specialty} onChange={updateForm} placeholder="Specialty" />
          <input name="rating" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={updateForm} placeholder="Rating" />
          <input name="phone" value={form.phone} onChange={updateForm} placeholder="Phone" />
          <input name="commissionPercentage" type="number" min="0" max="100" value={form.commissionPercentage} onChange={updateForm} placeholder="Commission %" />

          <label className="setting-check">
            <input name="active" type="checkbox" checked={form.active} onChange={updateForm} />
            <span>Active</span>
          </label>

          <button className="btn" type="submit">{editingId ? 'Save Staff' : 'Add Staff'}</button>
          {editingId && <button className="btn secondary" type="button" onClick={resetForm}>Cancel Edit</button>}
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <button className="btn secondary" onClick={load}>Refresh</button>
        </div>

        <p className="muted">{message}</p>
        <DataTable columns={columns} rows={staff} />
      </section>
    </div>
  );
}
