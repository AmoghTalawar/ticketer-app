import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONCERT_IMAGES } from '../constants/images';

const MyTickets = () => {
  const navigate = useNavigate();

  const myTickets = [
    { id: '101', event: 'Coldplay World Tour', date: 'Oct 24, 2026', venue: 'DY Patil Stadium', seat: 'Block A, Row 5', image: CONCERT_IMAGES.coldplay },
    { id: '102', event: 'Ed Sheeran Acoustic', date: 'Nov 12, 2026', venue: 'O2 Arena, London', seat: 'General Admission', image: CONCERT_IMAGES.ed_sheeran }
  ];

  return (
    <div>
      <Navbar />
      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
        <div className="container">
          <h1 className="title-md" style={{ marginBottom: '2rem' }}>My NFT Tickets</h1>
          
          <div className="grid grid-cols-2 gap-8">
            {myTickets.map(ticket => (
              <div key={ticket.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', display: 'flex' }}>
                <img src={ticket.image} alt={ticket.event} referrerPolicy="no-referrer" style={{ width: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{ticket.event}</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{ticket.date} • {ticket.venue}</p>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '1rem' }}>Seat: {ticket.seat}</div>
                    <div style={{ display: 'inline-block', background: 'rgba(var(--clr-primary-500-rgb), 0.1)', color: 'var(--clr-primary-500)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      Token ID: #{ticket.id}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }} onClick={() => navigate('/download-ticket')}>View QR</button>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}>Resell Ticket</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {myTickets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1rem' }}>No Tickets Found</h3>
              <p className="text-muted" style={{ marginBottom: '2rem' }}>You don't have any NFT tickets in your wallet yet.</p>
              <button className="btn btn-primary" onClick={() => navigate('/concerts')}>Browse Concerts</button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MyTickets;
