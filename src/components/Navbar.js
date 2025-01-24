import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link> | <Link to="/dashboard">Dashboard</Link> | <Link to="/logout">Logout</Link>
    </nav>
  );
}

export default Navbar;
