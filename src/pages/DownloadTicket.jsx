import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DownloadTicket = () => {
  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12rem 1rem 6rem 1rem' }}>
        <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          
          <div style={{ width: '64px', height: '64px', background: '#e0ffe0', color: '#00cc00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2rem' }}>
            ✓
          </div>
          
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Payment Successful!</h1>
          <p style={{ color: '#888', marginBottom: '2.5rem' }}>Your ticket has been booked successfully. You can download your ticket below or view it in your account hub.</p>

          <div style={{ border: '2px dashed #ddd', borderRadius: '16px', padding: '2rem', marginBottom: '2.5rem', background: '#fafafa' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Taylor Swift: The Eras Tour</h3>
            <div style={{ color: '#555', marginBottom: '0.5rem' }}>VIP Ticket . Section 1 . Row 0 . Seat 1</div>
            <div style={{ color: '#555' }}>June 04, Mon. 08:00 pm</div>
            <div style={{ marginTop: '2rem' }}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TICKETER-VIP-S1R0S1" alt="QR Code" style={{ borderRadius: '8px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-outline" style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}>
              Download PDF
            </button>
            <Link to="/account" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 'bold', textDecoration: 'none' }}>
              Go to My Hub
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadTicket;
