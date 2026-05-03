import React from 'react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--clr-white)', padding: '4rem 0 2rem' }}>
      <div className="container">
        {/* Sponsors */}
        <div className="flex justify-between items-center" style={{ paddingBottom: '3rem', borderBottom: '1px solid #eee', marginBottom: '3rem', opacity: 0.6, flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.5rem' }}>COMPANY</div>
          <div style={{ fontWeight: 800, fontSize: '1.5rem' }}>ABSTRACT</div>
          <div style={{ fontWeight: 800, fontSize: '1.5rem' }}>ASPEN</div>
          <div style={{ fontWeight: 800, fontSize: '1.5rem' }}>Crop and Highlight</div>
          <div style={{ fontWeight: 800, fontSize: '1.5rem' }}>Millisy</div>
        </div>

        <div className="grid grid-cols-4 gap-8" style={{ marginBottom: '4rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>TICKETER</div>
            <p style={{ color: 'var(--clr-neutral-500)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Ticketer is a global ticketing platform for live experiences that allows anyone to create, share, find and attend events that fuel their passions and enrich their lives.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>TICKETER</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--clr-neutral-500)', fontSize: '0.9rem' }}>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Help</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--clr-neutral-500)', fontSize: '0.9rem' }}>
              <li><a href="#">Concert Ticketing</a></li>
              <li><a href="#">Account Support</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Legal</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--clr-neutral-500)', fontSize: '0.9rem' }}>
              <li><a href="#">Terms of Us</a></li>
              <li><a href="#">Acceptable</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h4 style={{ marginBottom: '1rem' }}>Join our mailing list to stay in the loop with our...</h4>
          </div>
          <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: 'var(--radius-full)', overflow: 'hidden', width: '400px', maxWidth: '100%' }}>
            <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: '1rem 1.5rem', border: 'none', outline: 'none' }} />
            <button style={{ padding: '0 1.5rem', background: 'transparent', border: 'none', borderLeft: '1px solid #ddd', cursor: 'pointer' }}>→</button>
          </div>
        </div>

        <div className="flex justify-between items-center" style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #eee', color: 'var(--clr-neutral-500)', fontSize: '0.9rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>©2024 NOT FULLTIME PVT.LTD.</div>
          <div className="flex gap-4">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
          </div>
          <div className="flex gap-4">
            <div style={{ width: 32, height: 32, background: 'var(--clr-primary-500)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</div>
            <div style={{ width: 32, height: 32, background: 'var(--clr-primary-500)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>F</div>
            <div style={{ width: 32, height: 32, background: 'var(--clr-primary-500)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>I</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
