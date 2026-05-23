import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CreateEvent = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: IPFS Upload + Smart Contract Call
    navigate('/organizer-dashboard');
  };

  return (
    <div>
      <Navbar />
      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 className="title-md" style={{ marginBottom: '2rem', textAlign: 'center' }}>Create New Event</h1>
          
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="grid grid-cols-2 gap-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '500' }}>Event Title</label>
                  <input type="text" placeholder="e.g. Coldplay World Tour" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '500' }}>Category</label>
                  <select style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} required>
                    <option value="">Select Category</option>
                    <option value="concert">Concert</option>
                    <option value="sports">Sports</option>
                    <option value="theater">Theater</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '500' }}>Description</label>
                <textarea placeholder="Event details..." rows="4" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }} required></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '500' }}>Date & Time</label>
                  <input type="datetime-local" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '500' }}>Venue / Location</label>
                  <input type="text" placeholder="e.g. DY Patil Stadium" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '500' }}>Total Supply</label>
                  <input type="number" placeholder="1000" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} required min="1" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '500' }}>Ticket Price (MATIC)</label>
                  <input type="number" placeholder="50" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} required min="0" step="0.01" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '500' }}>Resale Cap (%)</label>
                  <input type="number" placeholder="110" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} required min="100" />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '500' }}>Event Banner Image (IPFS Upload)</label>
                <input type="file" accept="image/*" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px dashed #ccc', background: '#f9f9f9', cursor: 'pointer' }} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>Create Event & Mint Collection</button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreateEvent;
