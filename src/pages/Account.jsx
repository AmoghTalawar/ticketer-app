import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONCERT_IMAGES } from '../constants/images';

const Account = () => {
  const [activeTab, setActiveTab] = useState('My Hub');

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '6rem', flex: 1 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111' }}>Account</h1>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          
          {/* Sidebar Navigation */}
          <div style={{ width: '250px', background: '#fff', padding: '1rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['My Hub', 'Setting', 'Messages'].map(tab => (
                <li key={tab}>
                  <button 
                    onClick={() => setActiveTab(tab)}
                    style={{ 
                      width: '100%', 
                      textAlign: 'left', 
                      padding: '1rem 1.5rem', 
                      background: activeTab === tab ? '#111' : 'transparent', 
                      color: activeTab === tab ? '#fff' : '#555', 
                      border: 'none', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: activeTab === tab ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            
            {activeTab === 'My Hub' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                  <img src="https://ui-avatars.com/api/?name=Annette+Black&background=random" alt="Profile" referrerPolicy="no-referrer" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '0.25rem' }}>Annette Black</h2>
                    <p style={{ color: '#888' }}>London, United Kingdom</p>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111' }}>Your Upcoming Concerts</h3>
                
                <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', border: '1px solid #eaeaea', borderRadius: '12px', padding: '1rem' }}>
                    <img src={CONCERT_IMAGES.taylor_swift} alt="Concert" referrerPolicy="no-referrer" style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Taylor Swift: The Eras Tour</h4>
                      <div style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Mon, June 04 . 08:00 pm</div>
                      <div style={{ color: 'var(--clr-primary-500)', fontWeight: 'bold' }}>VIP Ticket</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Setting' && (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '2rem' }}>Profile Settings</h2>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Full Name</label>
                    <input type="text" defaultValue="Annette Black" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Email</label>
                    <input type="email" defaultValue="annette.black@example.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Location</label>
                    <input type="text" defaultValue="London, United Kingdom" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                  </div>
                  <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Save Changes</button>
                </form>
              </>
            )}

            {activeTab === 'Messages' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '1rem' }}>Messages</h2>
                <p style={{ color: '#888' }}>You have no new messages.</p>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
