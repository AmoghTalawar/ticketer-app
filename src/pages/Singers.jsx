import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SINGER_IMAGES } from '../constants/images';

const Singers = () => {
  const navigate = useNavigate();

  const artists = [
    { name: 'Taylor Swift', img: SINGER_IMAGES.taylor_swift, location: 'London', date: 'June 14 - June 19', price: 799.99 },
    { name: 'Dua Lipa', img: SINGER_IMAGES.dua_lipa, location: 'Paris', date: 'July 20 - July 24', price: 399.99 },
    { name: 'Ariana Grande', img: SINGER_IMAGES.ariana_grande, location: 'Bristol', date: 'Aug 15 - Aug 18', price: 199.99 },
    { name: 'Adele', img: SINGER_IMAGES.adele, location: 'Berlin', date: 'Sep 05 - Sep 09', price: 499.99 },
    { name: 'Ed Sheeran', img: SINGER_IMAGES.ed_sheeran, location: 'Tokyo', date: 'Oct 12 - Oct 18', price: 150.00 },
    { name: 'Rihanna', img: SINGER_IMAGES.rihanna, location: 'Sydney', date: 'Nov 22 - Nov 26', price: 599.99 },
    { name: 'Lady Gaga', img: SINGER_IMAGES.lady_gaga, location: 'New York', date: 'Aug 10 - Aug 15', price: 450.00 },
    { name: 'Drake', img: SINGER_IMAGES.drake, location: 'Toronto', date: 'Aug 20 - Aug 25', price: 650.00 },
    { name: 'Eminem', img: SINGER_IMAGES.eminem, location: 'Detroit', date: 'Sep 10 - Sep 12', price: 300.00 },
    { name: 'Celine Dion', img: SINGER_IMAGES.celine_dion, location: 'Montreal', date: 'Sep 15 - Sep 18', price: 500.00 },
    { name: 'Billie Eilish', img: SINGER_IMAGES.billie_eilish, location: 'Toronto', date: 'Dec 01 - Dec 05', price: 350.00 },
    { name: 'Nicki Minaj', img: SINGER_IMAGES.nicki_minaj, location: 'Miami', date: 'Dec 10 - Dec 15', price: 400.00 },
    { name: 'Beyoncé', img: SINGER_IMAGES.beyonce, location: 'Houston', date: 'Jan 05 - Jan 10', price: 800.00 },
    { name: 'Shakira', img: SINGER_IMAGES.shakira, location: 'Madrid', date: 'Jan 15 - Jan 20', price: 450.00 },
    { name: 'Enrique Iglesias', img: SINGER_IMAGES.enrique_iglesias, location: 'Manchester', date: 'Oct 17 - Oct 21', price: 299.99 },
    { name: 'Bruno Mars', img: SINGER_IMAGES.bruno_mars, location: 'Las Vegas', date: 'Feb 10 - Feb 15', price: 750.00 }
  ];

  return (
    <div>
      <Navbar />
      
      {/* Page Header */}
      <section className="bg-dark" style={{ paddingTop: '10rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="container">
          <h1 className="title-lg" style={{ marginBottom: '1rem' }}>Top Singers</h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>Discover artists and book tickets for their upcoming shows</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="section bg-light" style={{ padding: '4rem 0' }}>
        <div className="container">
          
          <div className="flex justify-center" style={{ marginBottom: '3rem' }}>
            <div className="search-bar" style={{ display: 'inline-flex', background: 'white', borderRadius: '12px', padding: '0.5rem', margin: 0, gap: '0', alignItems: 'center', boxShadow: 'var(--shadow-sm)', width: '100%', maxWidth: '600px' }}>
              <div className="flex items-center" style={{ padding: '0.5rem 1rem', width: '100%' }}>
                <Search size={20} color="#888" style={{ marginRight: '0.5rem' }} />
                <input type="text" placeholder="Search for a singer..." style={{ border: 'none', outline: 'none', fontSize: '1rem', width: '100%' }} />
              </div>
              <button className="btn btn-primary" style={{ borderRadius: '8px', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>Search</button>
            </div>
          </div>

          {/* Grid of Singers */}
          <div className="grid grid-cols-4 gap-6">
            {artists.map((artist, idx) => (
              <div key={idx} style={{ background: 'white', borderRadius: '12px', padding: '0.5rem', color: 'black', textAlign: 'left', boxShadow: 'var(--shadow-sm)' }}>
                <img src={artist.img} alt={artist.name} referrerPolicy="no-referrer" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{artist.name}</h3>
                  <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{artist.location} • {artist.date}</p>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>₹{artist.price}</div>
                  <button className="btn btn-light" style={{ width: '100%', padding: '0.5rem' }} onClick={() => navigate('/reservation')}>Book Now</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center" style={{ marginTop: '4rem' }}>
            <button className="btn btn-outline" style={{ color: 'var(--clr-primary-500)', border: '1px solid var(--clr-primary-500)' }}>Load More Singers</button>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Singers;
