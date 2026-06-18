import AboutUsPage from './pages/AboutUsPage.jsx';
import React, { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import QRScannerPage from './pages/QRScannerPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { clearSession, getToken } from './api/client.js';

const pages = {
  Dashboard: DashboardPage,
  Customers: CustomersPage,
  Services: ServicesPage,
  Staff: StaffPage,
  Appointments: AppointmentsPage,
  Inventory: InventoryPage,
  'QR Scanner': QRScannerPage,
  Notifications: NotificationsPage,
  'About Us': AboutUsPage,
  Settings: SettingsPage,
};

export default function App() {
  const [token, setToken] = useState(getToken());
  const [activePage, setActivePage] = useState('Dashboard');

  const ActiveComponent = useMemo(() => pages[activePage] || DashboardPage, [activePage]);

  if (!token) return <LoginPage onLogin={() => setToken(getToken())} />;

  const logout = () => {
    clearSession();
    setToken(null);
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={logout} />
      <main className="content">
        <div className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p className="muted">The Gents Studio & Spa owner control panel</p>
          </div>
          <button className="btn secondary" onClick={logout}>Logout</button>
        </div>
        <ActiveComponent />
      </main>
    </div>
  );
}
