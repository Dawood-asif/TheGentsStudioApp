import React from 'react';
import logo from '../assets/logo.png';

const navItems = [
  'Dashboard',
  'Customers',
  'Services',
  'Staff',
  'Appointments',
  'Inventory',
  'QR Scanner',
  'Notifications',
  'Reviews',
  'About Us',
  'Settings',
];

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  return (
    <aside className="sidebar">
      <img className="logo image-logo" src={logo} alt="The Gents Studio & Spa" />
      <div className="brand">The Gents<br />Studio & Spa</div>
      <nav className="nav">
        {navItems.map(item => (
          <button
            key={item}
            className={activePage === item ? 'active' : ''}
            onClick={() => setActivePage(item)}
          >
            {item}
          </button>
        ))}
        <button onClick={onLogout}>Logout</button>
      </nav>
    </aside>
  );
}
