import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Wallet } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Register = () => {
  const navigate = useNavigate();

  const handleMetamaskConnect = () => {
    // Simulated connect and redirect
    navigate('/account');
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

          {/* Web3 / Metamask Option */}
          <button 
            type="button" 
            onClick={handleMetamaskConnect}
            className="btn" 
            style={{ 
              width: '100%', 
              padding: '0.9rem', 
              background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', 
              color: '#fff',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Wallet size={20} /> Link MetaMask Wallet
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'rgba(255, 255, 255, 0.3)' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
            <span style={{ padding: '0 1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Or Email Signup</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
          </div>

          <form style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="John Doe" 
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
                  placeholder="name@domain.com" 
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
                  placeholder="Create a password" 
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

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '0.9rem', 
                fontSize: '1rem', 
                marginTop: '1rem', 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--clr-primary-500) 0%, var(--clr-primary-400) 100%)',
                boxShadow: '0 4px 15px rgba(41, 56, 184, 0.4)'
              }}
            >
              Sign Up
            </button>
          </form>

          <div style={{ margin: '2rem 0', position: 'relative', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.1)', zIndex: 1 }}></div>
            <span style={{ position: 'relative', background: '#0a0b10', padding: '0 1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', zIndex: 2 }}>Or Social Signup</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', color: '#fff' }}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '18px' }} />
              Google
            </button>
            <button style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', color: '#fff' }}>
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" style={{ width: '18px' }} />
              Facebook
            </button>
          </div>

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
