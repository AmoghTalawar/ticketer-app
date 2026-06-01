import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, Filter, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONCERT_IMAGES } from '../constants/images';
import { resolveImageUrl, DEFAULT_EVENT_IMAGE } from '../utils/imageUrl';
import PriceTag from '../components/PriceTag';

const Concerts = () => {
  const navigate = useNavigate();
  const [dbEvents, setDbEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Fetch dynamic events from MongoDB
  const fetchDbEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events');
      const data = await res.json();
      if (data.success) {
        setDbEvents(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  useEffect(() => {
    fetchDbEvents();
  }, []);

  const mockEvents = [
    { title: 'Taylor Swift', img: CONCERT_IMAGES.taylor_swift, date: 'June 14 - June 19 London', price: '0.05', timeEnd: '15D, 08:45:03', isDynamic: false },
    { title: 'Dua Lipa', img: CONCERT_IMAGES.dua_lipa, date: 'July 20 - July 24 Paris', price: '0.03', timeEnd: '25D, 11:34:03', isDynamic: false },
    { title: 'Lady Gaga', img: CONCERT_IMAGES.lady_gaga, date: 'Aug 10 - Aug 15 New York', price: '0.04', timeEnd: '45D, 05:45:09', isDynamic: false },
    { title: 'Adele', img: CONCERT_IMAGES.adele, date: 'Sep 05 - Sep 09 Berlin', price: '0.04', timeEnd: '75D, 10:00:00', isDynamic: false },
    { title: 'Ed Sheeran', img: CONCERT_IMAGES.ed_sheeran, date: 'Oct 12 - Oct 18 Tokyo', price: '0.02', timeEnd: '105D, 12:30:00', isDynamic: false },
    { title: 'Rihanna', img: CONCERT_IMAGES.rihanna, date: 'Nov 22 - Nov 26 Sydney', price: '0.05', timeEnd: '145D, 09:15:00', isDynamic: false },
    { title: 'Billie Eilish', img: CONCERT_IMAGES.billie_eilish, date: 'Dec 01 - Dec 05 Toronto', price: '0.03', timeEnd: '160D, 14:20:00', isDynamic: false },
    { title: 'Pitbull', img: CONCERT_IMAGES.pitbull, date: 'Jan 10 - Jan 15 Miami', price: '0.02', timeEnd: '200D, 08:00:00', isDynamic: false }
  ];

  // Map database events to same structure
  // resolveImageUrl converts ipfs:// or bare CIDs → Pinata HTTPS gateway URL
  const formattedDbEvents = dbEvents.map(e => ({
    id: e._id,
    title: e.title,
    img: resolveImageUrl(e.imageUrl, DEFAULT_EVENT_IMAGE),
    date: `${new Date(e.date).toLocaleDateString()} • ${e.venue}`,
    price: e.ticketPrice,
    timeEnd: 'Sale Active',
    isDynamic: true
  }));

  // Combine lists: show newly created dynamic events first
  const allEvents = [...formattedDbEvents, ...mockEvents];

  // Search filter
  const filteredEvents = allEvents.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = e.date.toLowerCase().includes(locationQuery.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div style={{ background: '#fff', color: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Page Header */}
      <section className="bg-dark" style={{ paddingTop: '10rem', paddingBottom: '4rem', textAlign: 'center', color: '#fff' }}>
        <div className="container">
          <h1 className="title-lg" style={{ marginBottom: '1rem', color: '#fff' }}>Explore Concerts</h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>Find the best live events happening near you</p>
        </div>
      </section>

      {/* Filter and Content Section */}
      <section className="section bg-light" style={{ padding: '4rem 0', flex: 1 }}>
        <div className="container">
          
          <div className="flex justify-between items-center" style={{ marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Search Bar */}
            <div className="search-bar" style={{ display: 'inline-flex', background: 'white', borderRadius: '12px', padding: '0.5rem', margin: 0, gap: '0', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center" style={{ padding: '0.5rem 1rem' }}>
                <Search size={20} color="#888" style={{ marginRight: '0.5rem' }} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..." 
                  style={{ border: 'none', outline: 'none', fontSize: '1rem', color: '#000' }} 
                />
              </div>
              <div className="divider" style={{ height: '30px', margin: '0 0.5rem', background: '#ccc', width: '1px' }}></div>
              <div className="flex items-center" style={{ padding: '0.5rem 1rem' }}>
                <MapPin size={20} color="#888" style={{ marginRight: '0.5rem' }} />
                <input 
                  type="text" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Any Location" 
                  style={{ border: 'none', outline: 'none', fontSize: '1rem', color: '#000' }} 
                />
              </div>
              <button className="btn btn-primary" style={{ borderRadius: '8px', marginLeft: '0.5rem' }}>Search</button>
            </div>

            <button className="btn btn-outline" style={{ color: 'var(--clr-neutral-900)', border: '1px solid #ccc', background: 'white' }}>
              <Filter size={20} /> Filters
            </button>
          </div>

          {/* Grid of Concerts */}
          {filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
              No events found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {filteredEvents.map((event, idx) => (
                <div key={idx} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '250px' }}>
                    <img
                      src={event.img}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = DEFAULT_EVENT_IMAGE; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '2rem 1rem 1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div className="flex items-center gap-2"><Clock size={16} /> Time to end</div>
                       <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{event.timeEnd}</div>
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#111' }}>{event.title}</h3>
                      <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: '#666' }}>
                        <Calendar size={16} /> {event.date}
                      </div>
                    </div>
                    <div className="flex justify-between items-center" style={{ marginTop: 'auto' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--clr-primary-500)' }}>
                        <PriceTag eth={event.price} size="md" />
                      </div>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => {
                          if (event.isDynamic) {
                            navigate(`/event/${event.id}`);
                          } else {
                            navigate('/reservation');
                          }
                        }} 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center" style={{ marginTop: '4rem' }}>
            <button className="btn btn-outline" style={{ color: 'var(--clr-primary-500)', border: '1px solid var(--clr-primary-500)' }}>Load More</button>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Concerts;
