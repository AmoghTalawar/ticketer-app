import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONCERT_IMAGES } from '../constants/images';

const isSeatReserved = (seatId) => {
  let hash = 0;
  for (let i = 0; i < seatId.length; i++) {
    hash = seatId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 5) === 0; // Stable 20% reserved
};

const Reservation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Load event details passed from EventDetail, fallback to Taylor Swift default
  const event = location.state?.event || {
    _id: 'default',
    title: 'Taylor Swift: The Eras Tour',
    ticketPrice: '0.01',
    date: '2026-06-04T20:00:00.000Z',
    venue: 'Royal Albert Hall',
    imageUrl: CONCERT_IMAGES.taylor_swift
  };

  const [selectedSeats, setSelectedSeats] = useState([]);

  const ticketPrice = parseFloat(event.ticketPrice || '0.01');
  const subtotal = selectedSeats.length * ticketPrice;
  const serviceFee = selectedSeats.length * (ticketPrice * 0.05); // 5% fee
  const total = subtotal + serviceFee;

  // Generate a mock seat map layout (simplified grid for demonstration)
  const renderSeatRow = (rowId, numSeats, sectionOffset) => {
    return (
      <div key={rowId} style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginBottom: '0.25rem' }}>
        {Array.from({ length: numSeats }).map((_, i) => {
          const seatId = `S${sectionOffset}-${rowId}-${i + 1}`;
          const isSelected = selectedSeats.includes(seatId);
          const isReserved = isSeatReserved(seatId);
          
          let bgColor = '#e0e0ff'; // Available
          if (isReserved) bgColor = '#4A3AFF'; // Reserved (dark blue)
          if (isSelected) bgColor = '#FF3B30'; // Selected (red)

          return (
            <div 
              key={seatId} 
              onClick={() => {
                if (!isReserved) {
                  if (isSelected) {
                    setSelectedSeats(prev => prev.filter(s => s !== seatId));
                  } else {
                    setSelectedSeats(prev => [...prev, seatId]);
                  }
                }
              }}
              style={{ 
                width: '18px', 
                height: '18px', 
                backgroundColor: bgColor, 
                borderRadius: '4px 4px 0 0', 
                cursor: isReserved ? 'not-allowed' : 'pointer',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
              title={isReserved ? 'Reserved' : `Seat ${seatId}`}
            />
          );
        })}
      </div>
    );
  };

  const removeSeat = (seatId) => {
    setSelectedSeats(prev => prev.filter(s => s !== seatId));
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', weekday: 'short'
  });
  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  });

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', color: '#111' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
        
        {/* Progress Tracker */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          {[
            { label: 'Choose Time', done: true },
            { label: 'Choose Seat', active: true },
            { label: 'Checkout', done: false },
            { label: 'Get Ticket', done: false },
          ].map((step, i, arr) => (
            <div key={step.label} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: step.active ? '2px solid #111' : '1px solid ' + (step.done ? '#111' : '#ddd'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.5rem',
                background: '#fff',
                fontWeight: step.active ? 'bold' : 'normal',
                color: step.done || step.active ? '#111' : '#888'
              }}>
                {step.done ? <Check size={16} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.8rem', color: step.active ? '#111' : (step.done ? '#111' : '#888'), fontWeight: step.active ? 'bold' : 'normal' }}>
                {step.label}
              </span>
              {i < arr.length - 1 && (
                <div style={{ position: 'absolute', top: '16px', right: '-50%', width: '100%', height: '1px', background: step.done ? '#111' : '#ddd' }} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8" style={{ alignItems: 'flex-start' }}>
           
           {/* Seat Selector Grid */}
           <div style={{ flex: '2', background: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow-sm)' }} className="col-span-2">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Select Your Seats</h2>
              <p style={{ color: '#888', marginBottom: '2.5rem' }}>Click on the available seats to select them. Maximum 1 seat per transaction.</p>

              {/* Stage layout */}
              <div style={{ width: '80%', height: '24px', background: 'linear-gradient(to bottom, #d3d3d3, #eee)', border: '1px solid #ccc', margin: '0 auto 3rem auto', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px' }}>
                STAGE
              </div>

              {/* Seats Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                  {/* Central Block */}
                  <div>
                    {[10, 10, 10, 10, 10].map((num, i) => renderSeatRow(i, num, 1))}
                    <div style={{ textAlign: 'center', marginTop: '1rem', color: '#555', fontWeight: '600' }}>Main Hall (Section 1)</div>
                  </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem', marginTop: '2rem' }}>
                 <div>
                   {[6, 7, 8, 9, 8, 7, 6].map((num, i) => renderSeatRow(i, num, 3))}
                   <div style={{ textAlign: 'center', marginTop: '1rem', color: '#555' }}>Section 3</div>
                 </div>
                 <div style={{ marginTop: '2rem' }}>
                   {[12, 10, 8, 6].map((num, i) => renderSeatRow(i, num, 2))}
                   <div style={{ textAlign: 'center', marginTop: '1rem', color: '#555' }}>Section 2</div>
                 </div>
                 <div>
                   {[6, 7, 8, 9, 8, 7, 6].map((num, i) => renderSeatRow(i, num, 4))}
                   <div style={{ textAlign: 'center', marginTop: '1rem', color: '#555' }}>Section 4</div>
                 </div>
              </div>

              {/* Zoom Controls & Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginTop: '3rem' }}>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ border: '1px solid #ddd', background: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                    <button style={{ border: '1px solid #ddd', background: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                 </div>
                 <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <div style={{ width: '18px', height: '18px', background: '#e0e0ff', borderRadius: '4px 4px 0 0' }}></div>
                       <span style={{ color: '#555' }}>Available</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <div style={{ width: '18px', height: '18px', background: '#4A3AFF', borderRadius: '4px 4px 0 0' }}></div>
                       <span style={{ color: '#555' }}>Reserved</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <div style={{ width: '18px', height: '18px', background: '#FF3B30', borderRadius: '4px 4px 0 0' }}></div>
                       <span style={{ color: '#555' }}>Selected</span>
                    </div>
                 </div>
              </div>

           </div>

           {/* Selected Tickets Sidebar */}
           <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedSeats.length === 0 ? (
                 <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', textAlign: 'center', color: '#888', boxShadow: 'var(--shadow-sm)' }}>
                    Please select a seat from the map.
                 </div>
              ) : (
                <>
                  {selectedSeats.map(seat => (
                    <div key={seat} style={{ background: '#fff', padding: '1rem', borderRadius: '16px', display: 'flex', gap: '1rem', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
                       <img src={event.imageUrl} alt="Concert thumb" referrerPolicy="no-referrer" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                       <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>{event.title}</h4>
                          <div style={{ color: '#555', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{formattedDate} at {formattedTime}</div>
                          <div style={{ color: '#555', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Section {seat.split('-')[0].replace('S', '')}, Row {seat.split('-')[1]}, Seat {seat.split('-')[2]}</div>
                          <div style={{ fontWeight: 'bold' }}>{ticketPrice} MATIC</div>
                       </div>
                       <button onClick={() => removeSeat(seat)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', position: 'absolute', top: '1rem', right: '1rem' }}>
                          <Trash2 size={18} />
                       </button>
                    </div>
                  ))}

                  <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginTop: '1rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#555' }}>
                        <span>Subtotal</span>
                        <span>{subtotal.toFixed(3)} MATIC</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#555' }}>
                        <span>Service Fees</span>
                        <span>{serviceFee.toFixed(3)} MATIC</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <span>Total ({selectedSeats.length} item{selectedSeats.length > 1 ? 's' : ''})</span>
                        <span>{total.toFixed(3)} MATIC</span>
                     </div>
                     <button 
                       className="btn btn-primary" 
                       style={{ width: '100%', padding: '1rem', borderRadius: '8px' }}
                       onClick={() => navigate('/checkout', { state: { selectedSeats, total, subtotal, serviceFee, event } })}
                     >
                       Checkout &rarr;
                     </button>
                  </div>
                </>
              )}
           </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Reservation;
