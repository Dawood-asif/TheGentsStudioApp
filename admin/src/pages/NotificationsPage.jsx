import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { api } from '../api/client.js';

const emptyForm = {
  title: 'The Gents Studio & Spa',
  body: 'Special offer available today. Visit us from 8 AM to 9 PM.',
  imageUrl: '',
  audience: 'all',
  active: true,
  expiresAt: '',
};

export default function NotificationsPage() {
  const [form, setForm] = useState(emptyForm);
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState('Create in-app broadcasts. Customers will see them inside their app account.');

  const load = () => {
    api.appNotifications()
      .then(result => {
        setNotifications(result.data);
        setStatus('In-app notifications loaded.');
      })
      .catch(error => setStatus(error.message));
  };

  useEffect(() => {
    load();
  }, []);

  const update = event => {
    const { name, value, type, checked } = event.target;
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const send = async event => {
    event.preventDefault();

    try {
      await api.createAppNotification({
        ...form,
        imageUrl: form.imageUrl || null,
        expiresAt: form.expiresAt || null,
      });

      setStatus('In-app broadcast created successfully.');
      setForm(emptyForm);
      load();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const toggleActive = async notification => {
    try {
      await api.updateAppNotification(notification.id, {
        active: !notification.active,
      });

      setStatus(notification.active ? 'Notification disabled.' : 'Notification enabled.');
      load();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'body', label: 'Message' },
    { key: 'audience', label: 'Audience' },
    { key: 'read_count', label: 'Reads' },
    {
      key: 'active',
      label: 'Status',
      render: row => (
        <span className={`stock-badge ${row.active ? 'ok' : 'warning'}`}>
          {row.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <button className="btn secondary" onClick={() => toggleActive(row)}>
          {row.active ? 'Disable' : 'Enable'}
        </button>
      ),
    },
  ];

  return (
    <div className="grid">
      <section className="card">
        <h2>In-App Broadcast</h2>
        <p className="muted">
          Permanent free alternative to push notifications. Broadcasts are saved in the database and shown inside customer accounts.
        </p>

        <form className="form-grid" onSubmit={send}>
          <input name="title" value={form.title} onChange={update} placeholder="Notification title" required />
          <textarea name="body" value={form.body} onChange={update} placeholder="Notification message" rows="5" required />
          <input name="imageUrl" value={form.imageUrl} onChange={update} placeholder="Optional image URL or data image" />
          <input name="audience" value={form.audience} onChange={update} placeholder="Audience: all / vip / custom" />
          <input name="expiresAt" value={form.expiresAt} onChange={update} placeholder="Optional expiry date ISO e.g. 2026-12-31T23:59:00Z" />

          <label className="setting-check">
            <input name="active" type="checkbox" checked={form.active} onChange={update} />
            <span>Active</span>
          </label>

          <button className="btn" type="submit">Create In-App Broadcast</button>
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <button className="btn secondary" onClick={load}>Refresh Broadcasts</button>
        </div>

        <p className="muted">{status}</p>

        <DataTable columns={columns} rows={notifications} empty="No broadcasts yet." />
      </section>
    </div>
  );
}