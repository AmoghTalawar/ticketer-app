import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10rem 2rem 4rem 2rem', backgroundColor: '#F8F9FA' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: '900', color: 'var(--clr-primary-500)', lineHeight: '1', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: '#555', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Back to Home
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
