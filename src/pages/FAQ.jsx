import React from 'react';
import { ChevronDown, Mail, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQ = () => {
  const faqs = [
    { question: "I haven't received any order confirmation yet. Did my booking go through?", answer: "Lorem ipsum dolor sit amet consectetur. Eleifend nunc habit loremut egestas. Convallis praesent egestas suscipit hendrerit sem aliquet feugiat. Amet vulputate rhoncus falactus duis in ultricies pharetra.", open: true },
    { question: "I am not able/do not want to attend an already booked event for personal reasons. Is there a possibility to cancel/rebook the tickets?", answer: "Cancellation policies vary by event organizer. Please check the specific event details or contact support.", open: false },
    { question: "I lost my e-Ticket. What can I do?", answer: "You can redownload your e-Ticket from your account dashboard under 'My Tickets'.", open: false },
    { question: "An event was canceled/postponed/relocated, and I am not able/do not want to attend the event. Is it possible to cancel my tickets?", answer: "Yes, if an event is significantly changed, you are typically entitled to a refund. Please contact support for processing.", open: false },
    { question: "I've already ordered tickets and now want to add another one. Is it possible yet to sit together?", answer: "Seat additions depend on availability. We cannot guarantee contiguous seating after the initial purchase.", open: false }
  ];

  return (
    <div>
      <Navbar />

      {/* Header */}
      <section style={{ padding: '10rem 0 4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 className="title-lg" style={{ marginBottom: '1rem', color: '#111' }}>FAQ</h1>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>Got any question? We respond you here.</p>
        </div>
      </section>

      {/* Main FAQ Content */}
      <section className="section bg-light" style={{ padding: '4rem 0', borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>How we can help you?</h2>
          <p style={{ color: '#555', marginBottom: '3rem', fontSize: '1.1rem' }}>Have a question? We may already have the answer for your question. Check out our frequently (FAQ) asked question below.</p>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111' }}>Frequently Asked Questions</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid #ddd', paddingBottom: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#111', paddingRight: '2rem' }}>{faq.question}</h4>
                  <ChevronDown size={24} color="#888" style={{ transform: faq.open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </div>
                {faq.open && (
                  <p style={{ marginTop: '1rem', color: '#555', lineHeight: '1.6' }}>{faq.answer}</p>
                )}
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ marginTop: '2rem' }}>Read More &darr;</button>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="section" style={{ padding: '5rem 0', backgroundColor: '#fff' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Still have question?</h3>
          <p style={{ color: '#555', marginBottom: '2rem', fontSize: '1.1rem' }}>Contact us using the information below. We'll respond promptly to your inquiries and feedback.</p>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ background: '#e0e0e0', padding: '0.75rem', borderRadius: '8px' }}><Mail size={24} color="#555" /></div>
                <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>helpcenter@ticketer.com</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ background: '#e0e0e0', padding: '0.75rem', borderRadius: '8px' }}><Phone size={24} color="#555" /></div>
                <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>(010) 123-4567</span>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
