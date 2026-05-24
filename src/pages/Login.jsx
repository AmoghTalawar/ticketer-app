import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Wallet } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWallet } from '../context/WalletContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connect, connecting, isConnected, error } = useWallet();

  // Redirect destination after login (from WalletGuard)
  const from = location.state?.from || '/account';

  // If already connected, redirect immediately
  useEffect(() => {
    if (isConnected) navigate(from, { replace: true });
  }, [isConnected, navigate, from]);

  const handleMetamaskConnect = async () => {
    const ok = await connect();
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0b10 0%, #121422 50%, #0a0b10 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff'
    }}>
      <Navbar />

      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10rem 1rem 6rem 1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(74,58,255,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(41,56,184,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '460px',
          textAlign: 'center',
          zIndex: 10
        }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff 0%, #888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Log In
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Connect your wallet to manage your NFT tickets.
          </p>

          {/* Error message */}
          {error && (
            <div style={{ background: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.4)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#ff6b6b', fontSize: '0.9rem', textAlign: 'left' }}>
              {error}
            </div>
          )}

          {/* MetaMask connect */}
          <button
            type="button"
            onClick={handleMetamaskConnect}
            disabled={connecting}
            className="btn"
            style={{
              width: '100%',
              padding: '0.9rem',
              background: connecting
                ? 'rgba(230,126,34,0.5)'
                : 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(230,126,34,0.3)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              border: 'none',
              cursor: connecting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Wallet size={20} />
            {connecting ? 'Connecting to MetaMask...' : 'Connect MetaMask Wallet'}
          </button>

          {!window.ethereum && (
            <p style={{ color: '#ff9800', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              MetaMask not detected.{' '}
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ color: '#e67e22', fontWeight: '600' }}>
                Install MetaMask →
              </a>
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ padding: '0 1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Or Email Login</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <form style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={e => e.preventDefault()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" placeholder="name@domain.com" style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', outline: 'none', fontSize: '1rem' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#fff', outline: 'none', fontSize: '1rem' }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', borderRadius: '12px' }}>
              Sign In
            </button>
          </form>

          <p style={{ marginTop: '2.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--clr-primary-400)', fontWeight: 'bold', textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
