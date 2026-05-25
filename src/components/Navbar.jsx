import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Wallet, LogOut, ChevronDown, AlertTriangle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, isConnected, isCorrectNetwork, connect, disconnect, switchNetwork, connecting, user } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Pages that have a light header background need dark text
  const lightHeaderPages = ['/blogs', '/faq', '/contact', '/checkout', '/reservation',
    '/my-tickets', '/account', '/organizer-dashboard', '/create-event',
    '/ticket-verification', '/transaction-history', '/resale-market'];
  const isDarkText = lightHeaderPages.some(p => location.pathname.startsWith(p));

  const textColor = isDarkText ? '#111' : 'white';
  const mutedTextColor = isDarkText ? '#555' : 'rgba(255,255,255,0.7)';

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <>
      {/* Network warning banner */}
      {isConnected && !isCorrectNetwork && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: '#ff9800',
          color: '#000',
          textAlign: 'center',
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}>
          <AlertTriangle size={16} />
          Wrong network detected.
          <button
            onClick={switchNetwork}
            style={{ marginLeft: '0.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.75rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
          >
            Switch Network
          </button>
        </div>
      )}

      <nav style={{
        position: 'fixed',
        top: isConnected && !isCorrectNetwork ? '36px' : 0,
        width: '100%',
        padding: '1.5rem 0',
        zIndex: 50,
        background: isDarkText ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: isDarkText ? 'blur(8px)' : 'none',
        borderBottom: isDarkText ? '1px solid rgba(0,0,0,0.06)' : 'none',
        transition: 'top 0.2s',
      }}>
        <div className="container flex justify-between items-center" style={{ color: textColor }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
            <Link to="/" style={{ textDecoration: 'none', color: textColor }}>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 24, height: 24, border: `2px solid ${textColor}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>T</div>
                TICKETER
              </div>
            </Link>
            <div className="flex gap-4" style={{ fontSize: '0.9rem' }}>
              <Link to="/" style={{ color: location.pathname === '/' ? textColor : mutedTextColor, textDecoration: 'none' }}>Home</Link>
              <Link to="/concerts" style={{ color: location.pathname === '/concerts' ? textColor : mutedTextColor, textDecoration: 'none' }}>Concerts</Link>
              <Link to="/resale-market" style={{ color: location.pathname === '/resale-market' ? textColor : mutedTextColor, textDecoration: 'none' }}>Resale Market</Link>
              <Link to="/singers" style={{ color: location.pathname === '/singers' ? textColor : mutedTextColor, textDecoration: 'none' }}>Singers</Link>
              <Link to="/blogs" style={{ color: location.pathname === '/blogs' ? textColor : mutedTextColor, textDecoration: 'none' }}>Blogs</Link>
              <Link to="/contact" style={{ color: location.pathname === '/contact' ? textColor : mutedTextColor, textDecoration: 'none' }}>Contact</Link>
              <Link to="/faq" style={{ color: location.pathname === '/faq' ? textColor : mutedTextColor, textDecoration: 'none' }}>FAQ</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/reservation" style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <ShoppingCart size={24} />
            </Link>

            {isConnected ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: isDarkText ? '#111' : 'rgba(255,255,255,0.15)',
                    border: `1px solid ${isDarkText ? '#333' : 'rgba(255,255,255,0.3)'}`,
                    color: isDarkText ? '#fff' : '#fff',
                    borderRadius: '24px', padding: '0.5rem 1rem',
                    cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28a745' }} />
                  {shortAddress}
                  <ChevronDown size={14} />
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#fff', border: '1px solid #eee', borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '200px',
                    overflow: 'hidden', zIndex: 200,
                  }}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #eee', fontSize: '0.8rem', color: '#888' }}>
                      Connected Wallet
                      <div style={{ color: '#111', fontWeight: '600', fontFamily: 'monospace', marginTop: '2px' }}>{shortAddress}</div>
                    </div>
                    {(user?.role === 'organizer' ? [
                      { label: 'Organizer Dashboard', path: '/organizer-dashboard' },
                      { label: 'Create Event', path: '/create-event' },
                      { label: 'Gate Scanner', path: '/ticket-verification' },
                    ] : [
                      { label: 'My Tickets', path: '/my-tickets' },
                      { label: 'Resale Market', path: '/resale-market' },
                      { label: 'Account', path: '/account' },
                      { label: 'Transaction History', path: '/transaction-history' },
                    ]).map(item => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setDropdownOpen(false); }}
                        style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#333', fontSize: '0.9rem' }}
                        onMouseEnter={e => e.target.style.background = '#f8f9fa'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={() => { disconnect(); setDropdownOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderTop: '1px solid #eee', cursor: 'pointer', color: '#dc3545', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <LogOut size={14} /> Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="btn"
                style={{
                  background: isDarkText ? '#111' : 'white',
                  color: isDarkText ? 'white' : 'var(--clr-primary-900)',
                  border: 'none',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  opacity: connecting ? 0.7 : 1,
                  cursor: connecting ? 'not-allowed' : 'pointer',
                }}
              >
                <Wallet size={16} />
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
