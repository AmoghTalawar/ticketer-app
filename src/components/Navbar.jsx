import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  // Pages that have a light header background need dark text
  const lightHeaderPages = ['/blogs', '/faq', '/contact', '/checkout'];
  // Reservation also has a light header.
  const isDarkText = lightHeaderPages.includes(location.pathname) || location.pathname === '/reservation';
  
  const textColor = isDarkText ? '#111' : 'white';
  const mutedTextColor = isDarkText ? '#555' : 'rgba(255,255,255,0.7)';

  return (
    <nav style={{
      position: 'absolute',
      top: 0,
      width: '100%',
      padding: '1.5rem 0',
      zIndex: 50
    }}>
      <div className="container flex justify-between items-center" style={{ color: textColor }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, border: `2px solid ${textColor}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>T</div>
            TICKETER
          </div>
          <div className="flex gap-4" style={{ fontSize: '0.9rem' }}>
            <Link to="/" style={{ color: location.pathname === '/' ? textColor : mutedTextColor }}>Home</Link>
            <Link to="/concerts" style={{ color: location.pathname === '/concerts' ? textColor : mutedTextColor }}>Concerts</Link>
            <Link to="/singers" style={{ color: location.pathname === '/singers' ? textColor : mutedTextColor }}>Singers</Link>
            <Link to="/blogs" style={{ color: location.pathname === '/blogs' ? textColor : mutedTextColor }}>Blogs</Link>
            <Link to="/contact" style={{ color: location.pathname === '/contact' ? textColor : mutedTextColor }}>Contact</Link>
            <Link to="/faq" style={{ color: location.pathname === '/faq' ? textColor : mutedTextColor }}>FAQ</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/reservation" style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={24} />
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ background: isDarkText ? '#111' : 'white', color: isDarkText ? 'white' : 'var(--clr-primary-900)', border: 'none', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 16, height: 16, background: isDarkText ? '#333' : '#e0e0e0', borderRadius: '50%' }}></div>
              Login/Register
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
