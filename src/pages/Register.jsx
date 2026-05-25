import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Wallet, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWallet } from '../context/WalletContext';

const Register = () => {
  const navigate = useNavigate();
  const { setUser, connect } = useWallet();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleMetamaskLink = async () => {
    setError(null);
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask first.');
      return;
    }
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0].toLowerCase());
      }
    } catch (err) {
      setError(err.message || 'Failed to link wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          walletAddress: walletAddress || undefined
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      setSuccess('Account created successfully!');
      localStorage.setItem('blockticket_token', data.token);
      setUser(data.user);

      // If a wallet address is linked, trigger context connection for provider/signer
      if (walletAddress && window.ethereum) {
        await connect();
      }

      setTimeout(() => {
        const target = role === 'organizer' ? '/organizer-dashboard' : '/account';
        navigate(target);
      }, 1500);

    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
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
        {/* Animated Background Blobs */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(74, 58, 255, 0.15) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(41, 56, 184, 0.15) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '3rem', 
          borderRadius: '24px', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)', 
          width: '100%', 
          maxWidth: '460px', 
          textAlign: 'center',
          zIndex: 10
        }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff 0%, #888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create Account</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Join us to secure and verify your event tickets.</p>

          {error && (
            <div style={{ background: 'rgba(220, 53, 69, 0.15)', border: '1px solid rgba(220, 53, 69, 0.4)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#ff6b6b', fontSize: '0.9rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(40, 167, 69, 0.15)', border: '1px solid rgba(40, 167, 69, 0.4)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#28a745', fontSize: '0.9rem', textAlign: 'left' }}>
              {success}
            </div>
          )}

          {/* Web3 / Metamask Option */}
          <button 
            type="button" 
            onClick={handleMetamaskLink}
            disabled={loading}
            className="btn" 
            style={{ 
              width: '100%', 
              padding: '0.9rem', 
              background: walletAddress 
                ? 'linear-gradient(135deg, #28a745 0%, #218838 100%)'
                : 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', 
              color: '#fff',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              boxShadow: walletAddress
                ? '0 4px 15px rgba(40, 167, 69, 0.3)'
                : '0 4px 15px rgba(230, 126, 34, 0.3)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <Wallet size={20} /> 
            {walletAddress 
              ? `Linked: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : 'Link MetaMask Wallet'
            }
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'rgba(255, 255, 255, 0.3)' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
            <span style={{ padding: '0 1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Details</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
          </div>

          <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="John Doe" 
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.85rem 1rem 0.85rem 2.75rem', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    color: '#fff',
                    outline: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com" 
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.85rem 1rem 0.85rem 2.75rem', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    color: '#fff',
                    outline: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }} 
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password" 
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.85rem 1rem 0.85rem 2.75rem', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    color: '#fff',
                    outline: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>Role Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.85rem 1rem', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  background: '#121422', 
                  color: '#fff',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              >
                <option value="user">Standard User (Buyer/Seller)</option>
                <option value="organizer">Event Organizer</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '0.9rem', 
                fontSize: '1rem', 
                marginTop: '1rem', 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--clr-primary-500) 0%, var(--clr-primary-400) 100%)',
                boxShadow: '0 4px 15px rgba(41, 56, 184, 0.4)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p style={{ marginTop: '2.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--clr-primary-400)', fontWeight: 'bold', textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
