import React, { useState } from 'react';
import { api } from '../api/client.js';

export default function NotificationsPage() {
  const [form, setForm] = useState({ title: 'The Gents Studio & Spa', body: 'Special offer available today. Visit us from 8 AM to 9 PM.' });
  const [status, setStatus] = useState('Firebase credentials are required on backend for real push delivery.');

  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const send = async event => {
    event.preventDefault();
    setStatus('Sending broadcast...');
    try {
      const result = await api.broadcastNotification({ ...form, data: { type: 'marketing_broadcast' } });
      setStatus(`Broadcast processed. Targets: ${result.data.targetCount || 0}. ${result.data.skipped ? result.data.reason : 'Sent via Firebase.'}`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <section className="card">
      <h2>Push Notifications</h2>
      <p className="muted">Send marketing broadcasts, stamp alerts, birthday wishes, and appointment reminders after Firebase is configured.</p>
      <form className="form-grid" onSubmit={send}>
        <input name="title" value={form.title} onChange={update} placeholder="Notification title" required />
        <textarea name="body" value={form.body} onChange={update} placeholder="Notification message" rows="5" required />
        <button className="btn" type="submit">Send Broadcast</button>
      </form>
      <p className="muted">{status}</p>
    </section>
  );
}
