import React, { useState } from 'react';
import { api, setSession } from '../api/client.js';

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: 'admin@thegentsstudio.com', password: 'Admin@2024', twoFactorCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = await api.login({
        email: form.email,
        password: form.password,
        ...(form.twoFactorCode ? { twoFactorCode: form.twoFactorCode } : {}),
      });
      setSession(session);
      onLogin();
    } catch (err) {
      setError(err.message || 'Login failed. Make sure backend is running and seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="logo">GS</div>
        <h1>Admin Login</h1>
        <p className="subtitle">Secure owner panel with 2FA-ready login.</p>
        <div className="form-grid">
          <input name="email" type="email" value={form.email} onChange={update} placeholder="Email" required />
          <input name="password" type="password" value={form.password} onChange={update} placeholder="Password" required />
          <input name="twoFactorCode" value={form.twoFactorCode} onChange={update} placeholder="Google Authenticator code (if enabled)" />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </div>
        {error && <p className="error">{error}</p>}
        <p className="muted">Default seed: admin@thegentsstudio.com / Admin@2024</p>
      </form>
    </div>
  );
}
