import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Calendar, Clock, Ticket, ShieldAlert } from 'lucide-react';
import { useContract } from '../hooks/useContract';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getNFTContract } = useContract();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remainingSupply, setRemainingSupply] = useState(0);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Event not found');
        }
        setEvent(data.data);
        setRemainingSupply(data.data.totalSupply - (data.data.ticketsSold || 0));

        // Attempt to fetch live remaining supply on-chain if contract address exists
        if (data.data.contractAddress) {
          try {
            const nftContract = getNFTContract(data.data.contractAddress);
            if (nftContract) {
              const maxSup = await nftContract.maxSupply();
              const totalSup = await nftContract.totalSupply();
              const liveRemaining = Number(maxSup) - Number(totalSup);
              setRemainingSupply(liveRemaining >= 0 ? liveRemaining : 0);
            }
          } catch (contractErr) {
            console.warn('Could not read dynamic supply from blockchain:', contractErr.message);
          }
        }
      } catch (err) {
        setError(err.message || 'Error fetching event details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEventDetails();
  }, [id, getNFTContract]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#111', fontSize: '1.2rem', fontWeight: '600' }}>Loading event details...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main className="container" style={{ flex: 1, paddingTop: '8rem', maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.2)', padding: '2rem', borderRadius: '16px', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <ShieldAlert size={48} />
            <h2 style={{ fontWeight: 'bold' }}>Error Loading Event</h2>
            <p>{error || 'Event could not be found.'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/concerts')}>Back to Concerts</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = ((event.totalSupply - remainingSupply) / event.totalSupply) * 100;
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  });

  return (
    <div>
      <Navbar />
      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="grid grid-cols-2 gap-8" style={{ alignItems: 'flex-start' }}>
            
            {/* Left Col: Image */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <img src={event.imageUrl} alt={event.title} referrerPolicy="no-referrer" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'cover' }} />
            </div>

            {/* Right Col: Details */}
            <div style={{ padding: '1rem', color: '#111' }}>
              <h1 className="title-lg" style={{ marginBottom: '1rem', fontSize: '2.5rem', fontWeight: '800' }}>{event.title}</h1>
              
              <div className="flex gap-4" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="flex items-center gap-2 text-muted" style={{ fontSize: '1rem', color: '#555' }}>
                  <Calendar size={18} /> {formattedDate}
                </div>
                <div className="flex items-center gap-2 text-muted" style={{ fontSize: '1rem', color: '#555' }}>
                  <Clock size={18} /> {formattedTime}
                </div>
                <div className="flex items-center gap-2 text-muted" style={{ fontSize: '1rem', color: '#555' }}>
                  <MapPin size={18} /> {event.venue}
                </div>
              </div>

              <p style={{ lineHeight: '1.8', marginBottom: '2rem', color: '#444' }}>
                {event.description}
              </p>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Ticket Price</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--clr-primary-500)' }}>{event.ticketPrice} MATIC</span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span className="text-muted flex items-center gap-1" style={{ color: '#666' }}><Ticket size={16}/> Remaining Supply</span>
                    <span style={{ fontWeight: 'bold' }}>{remainingSupply.toLocaleString()} / {event.totalSupply.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', background: '#eee', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, background: 'var(--clr-primary-500)', height: '100%' }}></div>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} 
                onClick={() => navigate('/reservation', { state: { event } })}
                disabled={remainingSupply === 0}
              >
                {remainingSupply === 0 ? 'Sold Out' : 'Select Seats & Book'}
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
