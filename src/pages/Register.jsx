import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Register = () => {
  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12rem 1rem 6rem 1rem' }}>
        <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>Create an account</h1>
          <p style={{ color: '#888', marginBottom: '2.5rem' }}>Start your journey with us today.</p>

          <form style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Name</label>
              <input type="text" placeholder="Enter your full name" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Email</label>
              <input type="email" placeholder="Enter your email" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Password</label>
              <input type="password" placeholder="Create a password" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '1rem' }}>
              Sign Up
            </button>
          </form>

          <div style={{ margin: '2rem 0', position: 'relative', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#eee', zIndex: 1 }}></div>
            <span style={{ position: 'relative', background: '#fff', padding: '0 1rem', color: '#888', fontSize: '0.9rem', zIndex: 2 }}>Or sign up with</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px' }} />
              Google
            </button>
            <button style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" style={{ width: '20px' }} />
              Facebook
            </button>
          </div>

          <p style={{ marginTop: '2.5rem', color: '#555', fontSize: '0.95rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--clr-primary-500)', fontWeight: 'bold', textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
