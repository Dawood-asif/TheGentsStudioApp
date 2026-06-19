import React from 'react';

const navItems = ['Dashboard', 'Customers', 'Services', 'Staff', 'Appointments', 'Inventory', 'Reviews', 'QR Scanner', 'Notifications', 'About Us', 'Settings'];

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="logo">GS</div>
      <div className="brand">The Gents<br />Studio & Spa</div>
      <nav className="nav">
        {navItems.map(item => (
          <button key={item} className={activePage === item ? 'active' : ''} onClick={() => setActivePage(item)}>
            {item}
          </button>
        ))}
        <button onClick={onLogout}>Logout</button>
      </nav>
    </aside>
  );
}
