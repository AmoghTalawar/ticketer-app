import React from 'react';
import { Phone, Mail, Navigation } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactUs = () => {
  return (
    <div>
      <Navbar />

      {/* Header */}
      <section style={{ padding: '10rem 0 4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 className="title-lg" style={{ marginBottom: '1rem', color: '#111' }}>Contact Us</h1>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>We'd love to hear from you. contact us here.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section bg-light" style={{ padding: '4rem 0 8rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            
            {/* Left Image & Info overlay */}
            <div style={{ 
                position: 'relative', 
                minHeight: '600px',
                backgroundImage: 'url("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1200")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(0,0,50,0.8), rgba(0,50,200,0.6))' }}></div>
                <div style={{ position: 'relative', zIndex: 1, padding: '4rem 3rem', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Contact Info:</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Phone size={24} />
                        <span style={{ fontSize: '1.1rem' }}>Call directly at: +1-235678354</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'auto' }}>
                        <Mail size={24} />
                        <span style={{ fontSize: '1.1rem' }}>Email: Ticketer@gmail.com</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto' }}>
                        <Navigation size={24} style={{ cursor: 'pointer', transform: 'rotate(45deg)' }} />
                    </div>
                </div>
            </div>

            {/* Right Form */}
            <div style={{ padding: '4rem 3rem 4rem 1rem' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111', marginBottom: '0.5rem' }}>Get In Touch</h3>
                <p style={{ color: '#555', marginBottom: '2rem' }}>Feel free to drop us a line below.</p>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Full Name</label>
                        <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Email</label>
                        <input type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Phone Number</label>
                        <input type="tel" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Message</label>
                        <textarea rows="5" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', resize: 'vertical' }}></textarea>
                    </div>
                    
                    <button type="button" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>Send</button>
                </form>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
