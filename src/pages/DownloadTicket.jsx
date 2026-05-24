import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWallet } from '../context/WalletContext';

const DownloadTicket = () => {
  const location = useLocation();
  const { account } = useWallet();
  const ticketRef = useRef(null);

  // Data passed from MyTickets or MintSuccess
  const tokenId  = location.state?.tokenId  ?? null;
  const metadata = location.state?.metadata ?? null;
  const qrValue  = location.state?.qrValue  ?? (tokenId ? `BLOCKTICKET:${tokenId}:${account}` : 'BLOCKTICKET:DEMO');

  const eventName = metadata?.name        ?? 'Taylor Swift: The Eras Tour';
  const seat      = metadata?.attributes?.find(a => a.trait_type === 'Seat')?.value ?? 'VIP · Section 1 · Row 0 · Seat 1';
  const date      = metadata?.attributes?.find(a => a.trait_type === 'Date')?.value ?? 'June 04, Mon. 08:00 pm';

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `blockticket-${tokenId ?? 'ticket'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10rem 1rem 6rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>

          {/* Downloadable ticket card */}
          <div
            ref={ticketRef}
            style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
              marginBottom: '2rem',
            }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #111 0%, #2938b8 100%)', padding: '2rem', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', letterSpacing: '3px', opacity: 0.7, marginBottom: '0.5rem' }}>BLOCKTICKET · NFT VERIFIED</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{eventName}</h2>
            </div>

            {/* Body */}
            <div style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Seat</div>
                  <div style={{ fontWeight: '600', color: '#111' }}>{seat}</div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Date & Time</div>
                  <div style={{ fontWeight: '600', color: '#111' }}>{date}</div>
                </div>
                {tokenId && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Token ID</div>
                    <div style={{ fontWeight: '600', color: 'var(--clr-primary-500)', fontFamily: 'monospace' }}>#{tokenId}</div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <QRCodeSVG
                  value={qrValue}
                  size={140}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#111111"
                />
                <span style={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>Scan at gate</span>
              </div>
            </div>

            {/* Footer strip */}
            <div style={{ background: '#f8f9fa', borderTop: '2px dashed #ddd', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Powered by Polygon Blockchain</span>
              <span style={{ fontSize: '0.8rem', color: '#888', fontFamily: 'monospace' }}>
                {account ? `${account.slice(0, 10)}…` : 'Not connected'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontWeight: 'bold' }}
              onClick={handleDownload}
            >
              <Download size={18} /> Download PNG
            </button>
            <Link
              to="/my-tickets"
              className="btn btn-outline"
              style={{ padding: '0.75rem 2rem', fontWeight: 'bold', textDecoration: 'none' }}
            >
              My Tickets
            </Link>
            <Link
              to="/account"
              className="btn btn-outline"
              style={{ padding: '0.75rem 2rem', fontWeight: 'bold', textDecoration: 'none' }}
            >
              My Hub
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadTicket;
