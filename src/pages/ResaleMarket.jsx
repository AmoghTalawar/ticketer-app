import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONCERT_IMAGES } from '../constants/images';

const ResaleMarket = () => {
  const navigate = useNavigate();

  const listings = [
    { id: '205', event: 'Taylor Swift Eras Tour', date: 'June 14, 2026', price: '850 MATIC', seller: '0x123...abc', originalPrice: '799.99 MATIC', image: CONCERT_IMAGES.taylor_swift },
    { id: '312', event: 'Adele Live', date: 'Sep 05, 2026', price: '520 MATIC', seller: '0x456...def', originalPrice: '499.99 MATIC', image: CONCERT_IMAGES.adele }
  ];

  return (
    <div>
      <Navbar />
      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 className="title-md">Secondary Ticket Market</h1>
            <p className="text-muted">Buy safe, verified NFT tickets from other fans. Prices are capped to prevent scalping.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            {listings.map(listing => (
              <div key={listing.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <img src={listing.image} alt={listing.event} referrerPolicy="no-referrer" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{listing.event}</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{listing.date}</p>
                  
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span className="text-muted">Seller</span>
                      <span style={{ fontFamily: 'monospace' }}>{listing.seller}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span className="text-muted">Original Price</span>
                      <span style={{ textDecoration: 'line-through' }}>{listing.originalPrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>Resale Price</span>
                      <span style={{ color: 'var(--clr-primary-500)' }}>{listing.price}</span>
                    </div>
                  </div>
                  
                  <button className="btn btn-primary" style={{ width: '100%' }}>Buy Ticket</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ResaleMarket;
