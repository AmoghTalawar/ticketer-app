import React, { useState } from 'react';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONCERT_IMAGES } from '../constants/images';

const SearchResults = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const mockResults = [
    { id: 1, title: 'Taylor Swift: The Eras Tour', date: 'Jun 04, 2024', location: 'London, UK', price: 399, image: CONCERT_IMAGES.taylor_swift },
    { id: 2, title: 'Coldplay: Music of the Spheres', date: 'Aug 12, 2024', location: 'Paris, France', price: 250, image: CONCERT_IMAGES.coldplay },
    { id: 3, title: 'Dua Lipa: Future Nostalgia', date: 'Sep 20, 2024', location: 'New York, USA', price: 300, image: CONCERT_IMAGES.dua_lipa },
  ];

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem', flex: 1 }}>
        
        {/* Search Header */}
        <div style={{ background: '#111', borderRadius: '16px', padding: '3rem 2rem', marginBottom: '3rem', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Search Results</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>Showing results for "Pop Concerts"</p>

          <div style={{ display: 'flex', background: 'white', borderRadius: '50px', padding: '0.5rem', maxWidth: '800px', margin: '0 auto', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem', borderRight: '1px solid #eee' }}>
              <Search color="#888" size={20} />
              <input type="text" placeholder="Search by Singer, Concert..." defaultValue="Pop" style={{ border: 'none', outline: 'none', width: '100%', color: '#111' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem', borderRight: '1px solid #eee' }}>
              <MapPin color="#888" size={20} />
              <input type="text" placeholder="Location" style={{ border: 'none', outline: 'none', width: '100%', color: '#111' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem' }}>
              <Calendar color="#888" size={20} />
              <input type="text" placeholder="Date" style={{ border: 'none', outline: 'none', width: '100%', color: '#111' }} />
            </div>
            <button className="btn btn-primary" style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}>Search</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
          
          {/* Filters Sidebar */}
          <div style={{ width: '280px', background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <Filter size={20} color="#111" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111', margin: 0 }}>Filters</h3>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>Category</h4>
              {['All', 'Concert', 'Singer', 'Location', 'Date'].map(cat => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
                  <input type="radio" name="category" checked={activeFilter === cat} onChange={() => setActiveFilter(cat)} />
                  <span style={{ color: '#555' }}>{cat}</span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>Price Range</h4>
              <input type="range" min="0" max="1000" style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <span>₹0</span>
                <span>₹1000+</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111' }}>{mockResults.length} Results Found</h2>
              <select style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: '#fff' }}>
                <option>Sort by: Recommended</option>
                <option>Sort by: Lowest Price</option>
                <option>Sort by: Highest Price</option>
                <option>Sort by: Date</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {mockResults.map(result => (
                <div key={result.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <img src={result.image} alt={result.title} referrerPolicy="no-referrer" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111', marginBottom: '0.5rem' }}>{result.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      <Calendar size={16} /> {result.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      <MapPin size={16} /> {result.location}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111' }}>₹{result.price}</span>
                      <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Book Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
