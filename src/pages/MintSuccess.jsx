import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MintSuccess = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '10rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <CheckCircle size={64} color="#28a745" />
            </div>
            
            <h1 className="title-md" style={{ marginBottom: '1rem' }}>Ticket Minted Successfully!</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Your NFT ticket has been successfully created on the Polygon blockchain.</p>
            
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Token ID</span>
                <span style={{ fontWeight: 'bold' }}>#104</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Transaction Hash</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--clr-primary-500)', fontSize: '0.9rem' }}>0xabc123...def456</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Network</span>
                <span>Polygon Amoy Testnet</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button className="btn btn-outline" onClick={() => navigate('/concerts')}>Browse More</button>
              <button className="btn btn-primary flex items-center gap-2" onClick={() => navigate('/my-tickets')}>
                View My Tickets <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MintSuccess;
