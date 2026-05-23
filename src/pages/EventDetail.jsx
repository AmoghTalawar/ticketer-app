import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';

const EventDetail = () => {
  const navigate = useNavigate();

  // Static mock data for now
  const event = {
    title: 'Coldplay World Tour Mumbai',
    description: 'The spectacular Music Of The Spheres World Tour comes to Mumbai! Experience a night of magic, lights, and unforgettable music as Coldplay performs their greatest hits and new classics. Each ticket is minted as an exclusive NFT on the Polygon blockchain, ensuring authenticity and a lasting digital collectible.',
    date: 'January 18, 2026',
    time: '19:00 IST',
    venue: 'DY Patil Stadium, Mumbai',
    price: '50 MATIC',
    totalSupply: 50000,
    remainingSupply: 12450,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Coldplay_-_Wembley_Stadium%2C_London_%282022%29_%282%29.jpg/960px-Coldplay_-_Wembley_Stadium%2C_London_%282022%29_%282%29.jpg'
  };

  const progress = ((event.totalSupply - event.remainingSupply) / event.totalSupply) * 100;

  return (
    <div>
      <Navbar />
      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="grid grid-cols-2 gap-8" style={{ alignItems: 'flex-start' }}>
            
            {/* Left Col: Image */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <img src={event.image} alt={event.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            {/* Right Col: Details */}
            <div style={{ padding: '1rem' }}>
              <h1 className="title-lg" style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>{event.title}</h1>
              
              <div className="flex gap-4" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="flex items-center gap-2 text-muted" style={{ fontSize: '1rem' }}>
                  <Calendar size={18} /> {event.date}
                </div>
                <div className="flex items-center gap-2 text-muted" style={{ fontSize: '1rem' }}>
                  <Clock size={18} /> {event.time}
                </div>
                <div className="flex items-center gap-2 text-muted" style={{ fontSize: '1rem' }}>
                  <MapPin size={18} /> {event.venue}
                </div>
              </div>

              <p style={{ lineHeight: '1.8', marginBottom: '2rem', color: '#444' }}>
                {event.description}
              </p>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Ticket Price</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--clr-primary-500)' }}>{event.price}</span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span className="text-muted flex items-center gap-1"><Ticket size={16}/> Remaining Supply</span>
                    <span style={{ fontWeight: 'bold' }}>{event.remainingSupply.toLocaleString()} / {event.totalSupply.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', background: '#eee', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, background: 'var(--clr-primary-500)', height: '100%' }}></div>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={() => navigate('/checkout')}>
                Mint Ticket Now
              </button>
            </div>
            
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default EventDetail;
