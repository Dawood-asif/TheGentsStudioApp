import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import MetricCard from '../components/MetricCard.jsx';

const fallback = {
  totalCustomers: 0,
  totalAppointments: 0,
  totalStamps: 0,
  revenuePkr: 0,
  todayAppointments: 0,
  lowStockItems: 0,
  charts: {
    customerGrowth: [],
    revenueTrend: [],
    stampActivity: [],
    appointmentStatus: [],
    vipDistribution: [],
    topServices: [],
  },
  alerts: { lowStockItems: [] },
};

function formatPkr(value) {
  return `PKR ${Number(value || 0).toLocaleString('en-PK')}`;
}

function BarChart({ title, subtitle, data = [], valueFormatter = value => value }) {
  const max = Math.max(1, ...data.map(item => Number(item.value || 0)));

  return (
    <section className="card chart-card">
      <div className="chart-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
      </div>

      <div className="bar-chart">
        {data.length === 0 && <p className="muted">No chart data yet.</p>}

        {data.map(item => {
          const width = Math.max(4, Math.round((Number(item.value || 0) / max) * 100));

          return (
            <div className="bar-row" key={item.label}>
              <span className="bar-label">{item.label}</span>
              <div className="bar-track">
                <span className="bar-fill" style={{ width: `${width}%` }} />
              </div>
              <span className="bar-value">{valueFormatter(item.value)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Sparkline({ title, data = [], valueFormatter = value => value }) {
  const points = useMemo(() => {
    const max = Math.max(1, ...data.map(item => Number(item.value || 0)));

    return data.map((item, index) => {
      const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * 100;
      const y = 100 - (Number(item.value || 0) / max) * 82 - 8;
      return { x, y, ...item };
    });
  }, [data]);

  const safeId = title.replace(/\s+/g, '-');
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <section className="card chart-card">
      <h2>{title}</h2>

      <div className="sparkline-wrap">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sparkline">
          <defs>
            <linearGradient id={`spark-${safeId}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#8C6A20" />
              <stop offset="100%" stopColor="#F5D76E" />
            </linearGradient>
          </defs>
          <path d={path} fill="none" stroke={`url(#spark-${safeId})`} strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      <div className="sparkline-labels">
        {data.map(item => (
          <span key={item.label}>
            {item.label}
            <strong>{valueFormatter(item.value)}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}

function LowStockAlerts({ items = [] }) {
  return (
    <section className="card">
      <h2>Low Stock Alerts</h2>

      {!items.length && <p className="muted">No low-stock inventory alerts.</p>}

      <div className="alert-list">
        {items.map(item => (
          <div className="alert-item" key={item.item_name}>
            <strong>{item.item_name}</strong>
            <span>
              {Number(item.quantity).toLocaleString()} {item.unit} left | Reorder at {Number(item.reorder_level).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState('Connect backend to show live analytics.');

  useEffect(() => {
    api.dashboard()
      .then(result => {
        setData({
          ...fallback,
          ...result.data,
          charts: { ...fallback.charts, ...(result.data.charts || {}) },
          alerts: { ...fallback.alerts, ...(result.data.alerts || {}) },
        });
        setStatus('Live analytics loaded from backend.');
      })
      .catch(error => setStatus(`Backend offline or analytics unavailable: ${error.message}`));
  }, []);

  return (
    <div className="grid">
      <div className="grid cards">
        <MetricCard label="Total Customers" value={data.totalCustomers} />
        <MetricCard label="Revenue" value={formatPkr(data.revenuePkr)} />
        <MetricCard label="Appointments" value={data.totalAppointments} note={`${data.todayAppointments} today`} />
        <MetricCard label="Stamps Issued" value={data.totalStamps} />
        <MetricCard label="Low Stock" value={data.lowStockItems} />
      </div>

      <section className="card analytics-hero">
        <div>
          <h2>Executive Analytics</h2>
          <p className="muted">{status}</p>
          <p>Track growth, loyalty activity, VIP tier distribution, revenue, appointment status, and stock risk from one black-gold command center.</p>
        </div>
        <span className="badge">Live TGSS Intelligence</span>
      </section>

      <div className="analytics-grid">
        <Sparkline title="Customer Growth" data={data.charts.customerGrowth} />
        <Sparkline title="Revenue Trend" data={data.charts.revenueTrend} valueFormatter={formatPkr} />
      </div>

      <div className="analytics-grid">
        <BarChart title="Stamp Activity" subtitle="Last 14 days" data={data.charts.stampActivity} />
        <BarChart title="Appointment Status" data={data.charts.appointmentStatus} />
      </div>

      <div className="analytics-grid">
        <BarChart title="VIP Tier Distribution" data={data.charts.vipDistribution} />
        <BarChart title="Top Services" subtitle="Based on booked packages" data={data.charts.topServices} />
      </div>

      <LowStockAlerts items={data.alerts.lowStockItems} />
    </div>
  );
}
