import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/logo.png" alt="KRISHX" className="nav-logo" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.svg'; }} />
        <span className="brand-name">KRISHX</span>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/trading" className="nav-link">Trade</Link>
        <Link to="/transactions" className="nav-link">History</Link>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
