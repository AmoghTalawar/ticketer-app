import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BlogDetail = () => {
  const { id } = useParams();

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <Navbar />

      <main>
        {/* Header Hero Image */}
        <div style={{ position: 'relative', width: '100%', height: '500px' }}>
          <img 
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=2000" 
            alt="Blog Cover" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
          <div className="container" style={{ position: 'absolute', bottom: '3rem', left: 0, right: 0, color: 'white' }}>
            <span style={{ background: 'var(--clr-primary-500)', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem', display: 'inline-block' }}>
              Music
            </span>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', maxWidth: '800px', lineHeight: 1.2, marginBottom: '1rem' }}>
              The Evolution of Live Concerts: From Intimate Venues to Massive Stadiums
            </h1>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#ccc' }}>
              <span>By Alex Johnson</span>
              <span>•</span>
              <span>October 12, 2023</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 0' }}>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#333', marginBottom: '2rem' }}>
            Live music has always been a powerful force, bringing people together to share an experience that goes beyond simply listening to a track. But the way we experience these concerts has drastically changed over the decades.
          </p>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111', marginTop: '3rem', marginBottom: '1.5rem' }}>The Early Days: Intimate and Raw</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555', marginBottom: '1.5rem' }}>
            Before the era of massive screens and pyrotechnics, concerts were raw, intimate affairs. Bands played in small clubs or local halls where the audience was close enough to feel the sweat of the performers. The focus was entirely on the music and the raw energy exchanged between the artist and the crowd.
          </p>

          <img 
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200" 
            alt="Small Club Gig" 
            style={{ width: '100%', height: 'auto', borderRadius: '12px', margin: '2rem 0' }} 
          />

          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111', marginTop: '3rem', marginBottom: '1.5rem' }}>The Arena Rock Boom</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555', marginBottom: '1.5rem' }}>
            As rock and roll exploded in popularity during the 1970s and 80s, the demand to see legendary bands outgrew the small venues. Enter the era of Arena Rock. The scale of productions increased exponentially. Sound systems got louder, lighting rigs became complex, and the stage setup itself became a spectacle.
          </p>

          <blockquote style={{ borderLeft: '4px solid var(--clr-primary-500)', paddingLeft: '1.5rem', fontStyle: 'italic', fontSize: '1.5rem', color: '#111', margin: '3rem 0' }}>
            "The energy of a stadium crowd is unmatched. It's a living, breathing entity that you feed off of as a performer."
          </blockquote>

          {/* Comment Section */}
          <div style={{ marginTop: '5rem', borderTop: '1px solid #eaeaea', paddingTop: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '2rem' }}>Leave a Comment</h3>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <input type="text" placeholder="Name" style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                <input type="email" placeholder="Email" style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
              </div>
              <textarea placeholder="Write your comment here..." rows={5} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', resize: 'vertical' }}></textarea>
              <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '1rem 2rem' }}>Post Comment</button>
            </form>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '2rem' }}>Comments (2)</h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#111' }}>Jane Doe</h4>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>2 days ago</span>
                </div>
                <p style={{ color: '#555', lineHeight: 1.6 }}>Great article! I definitely miss the intimacy of smaller venues, but the spectacle of modern stadium tours is truly something to behold.</p>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--clr-primary-500)', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem', padding: 0 }}>Reply</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginLeft: '4rem' }}>
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#111' }}>John Smith</h4>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>1 day ago</span>
                </div>
                <p style={{ color: '#555', lineHeight: 1.6 }}>I agree! Both have their merits depending on the artist.</p>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--clr-primary-500)', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem', padding: 0 }}>Reply</button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
