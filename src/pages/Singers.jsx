import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Singers = () => {
  const navigate = useNavigate();

  const artists = [
    { name: 'Taylor Swift', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/960px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png', location: 'London', date: 'June 14 - June 19', price: 799.99 },
    { name: 'Dua Lipa', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Dua_Lipa-69798_%28cropped%29.jpg/960px-Dua_Lipa-69798_%28cropped%29.jpg', location: 'Paris', date: 'July 20 - July 24', price: 399.99 },
    { name: 'Ariana Grande', img: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Ariana_Grande_promoting_Wicked_%282024%29.jpg', location: 'Bristol', date: 'Aug 15 - Aug 18', price: 199.99 },
    { name: 'Adele', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Adele_2016.jpg/960px-Adele_2016.jpg', location: 'Berlin', date: 'Sep 05 - Sep 09', price: 499.99 },
    { name: 'Ed Sheeran', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ed_Sheeran-6886_%28cropped%29.jpg/960px-Ed_Sheeran-6886_%28cropped%29.jpg', location: 'Tokyo', date: 'Oct 12 - Oct 18', price: 150.00 },
    { name: 'Rihanna', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Rihanna_Fenty_2018.png', location: 'Sydney', date: 'Nov 22 - Nov 26', price: 599.99 },
    { name: 'Lady Gaga', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg/960px-Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg', location: 'New York', date: 'Aug 10 - Aug 15', price: 450.00 },
    { name: 'Drake', img: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Drake_at_The_Carter_Effect_2017_%2836818935200%29_%28cropped%29.jpg', location: 'Toronto', date: 'Aug 20 - Aug 25', price: 650.00 },
    { name: 'Eminem', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Eminem_2021_Color_Corrected.jpg/960px-Eminem_2021_Color_Corrected.jpg', location: 'Detroit', date: 'Sep 10 - Sep 12', price: 300.00 },
    { name: 'Celine Dion', img: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/C%C3%A9line_Dion_2012.jpg', location: 'Montreal', date: 'Sep 15 - Sep 18', price: 500.00 },
    { name: 'Billie Eilish', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg', location: 'Toronto', date: 'Dec 01 - Dec 05', price: 350.00 },
    { name: 'Nicki Minaj', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Nicki_Minaj_2025_%283x4_cropped%29.jpg/960px-Nicki_Minaj_2025_%283x4_cropped%29.jpg', location: 'Miami', date: 'Dec 10 - Dec 15', price: 400.00 },
    { name: 'Beyoncé', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Beyonc%C3%A9_-_Tottenham_Hotspur_Stadium_-_1st_June_2023_%2810_of_118%29_%2852946364598%29_%28best_crop%29.jpg', location: 'Houston', date: 'Jan 05 - Jan 10', price: 800.00 },
    { name: 'Shakira', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2902.jpg/960px-2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2902.jpg', location: 'Madrid', date: 'Jan 15 - Jan 20', price: 450.00 },
    { name: 'Enrique Iglesias', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Enrique_Iglesias_2011%2C_2.jpg/960px-Enrique_Iglesias_2011%2C_2.jpg', location: 'Manchester', date: 'Oct 17 - Oct 21', price: 299.99 },
    { name: 'Bruno Mars', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/BrunoMars24KMagicWorldTourLive_%28cropped%29.jpg/960px-BrunoMars24KMagicWorldTourLive_%28cropped%29.jpg', location: 'Las Vegas', date: 'Feb 10 - Feb 15', price: 750.00 }
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
                <img src={artist.img} alt={artist.name} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{artist.name}</h3>
                  <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{artist.location} • {artist.date}</p>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>${artist.price}</div>
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
