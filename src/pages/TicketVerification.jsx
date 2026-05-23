import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TicketVerification = () => {
  const [scanResult, setScanResult] = useState(null);

  const simulateScan = () => {
    // Simulate reading a QR code and verifying on-chain
    setScanResult({
      tokenId: '42',
      owner: '0x999...123',
      isValid: true,
      message: 'Ticket is valid and belongs to the owner.',
    });
  };

  const handleBurn = () => {
    alert('Ticket burned on-chain. Access granted.');
    setScanResult(null);
  };

  return (
    <div>
      <Navbar />
      <section className="section bg-dark" style={{ minHeight: '100vh', paddingTop: '8rem', color: 'white' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h1 className="title-md" style={{ marginBottom: '1rem' }}>Gate Verification Scanner</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '3rem' }}>Scan attendee QR codes to verify NFT ownership and burn the ticket.</p>
          
          <div style={{ background: '#222', padding: '2rem', borderRadius: '16px', border: '2px dashed #555', marginBottom: '2rem' }}>
            <div style={{ width: '100%', height: '300px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <span style={{ color: '#888' }}>[Camera View / QR Scanner Placeholder]</span>
            </div>
            <button className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }} onClick={simulateScan}>
              Simulate Scan
            </button>
          </div>

          {scanResult && (
            <div style={{ background: scanResult.isValid ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)', border: `1px solid ${scanResult.isValid ? '#28a745' : '#dc3545'}`, padding: '1.5rem', borderRadius: '12px', textAlign: 'left' }}>
              <h3 style={{ color: scanResult.isValid ? '#28a745' : '#dc3545', marginBottom: '1rem' }}>
                {scanResult.isValid ? 'Valid Ticket Found' : 'Invalid Ticket'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div><strong>Token ID:</strong> #{scanResult.tokenId}</div>
                <div><strong>Owner:</strong> {scanResult.owner}</div>
                <div><strong>Status:</strong> {scanResult.message}</div>
              </div>
              
              {scanResult.isValid && (
                <button className="btn btn-primary" style={{ width: '100%', background: '#28a745', borderColor: '#28a745' }} onClick={handleBurn}>
                  Grant Access & Burn Ticket
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TicketVerification;
