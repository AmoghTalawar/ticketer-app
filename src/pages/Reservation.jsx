import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Reservation = () => {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Generate a mock seat map layout (simplified grid for demonstration)
  const renderSeatRow = (rowId, numSeats, sectionOffset) => {
    return (
      <div key={rowId} style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginBottom: '0.25rem' }}>
        {Array.from({ length: numSeats }).map((_, i) => {
          const seatId = `S${sectionOffset}-${rowId}-${i + 1}`;
          const isSelected = selectedSeats.includes(seatId);
          const isReserved = Math.random() < 0.2; // Mock 20% reserved
          
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

  const ticketPrice = 399.00;
  const subtotal = selectedSeats.length * ticketPrice;
  const serviceFee = selectedSeats.length > 0 ? 1.00 * selectedSeats.length : 0;
  const total = subtotal + serviceFee;

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
           <div style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', background: '#fff' }}><Check size={16} /></div>
              <span style={{ fontSize: '0.8rem', color: '#111' }}>Choose Time</span>
              <div style={{ position: 'absolute', top: '16px', right: '-50%', width: '100%', height: '1px', background: '#111' }}></div>
           </div>
           <div style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', background: '#fff' }}>2</div>
              <span style={{ fontSize: '0.8rem', color: '#111', fontWeight: 'bold' }}>Choose Seat</span>
              <div style={{ position: 'absolute', top: '16px', right: '-50%', width: '100%', height: '1px', background: '#ddd' }}></div>
           </div>
           <div style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', background: '#fff', color: '#888' }}>3</div>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Checkout</span>
              <div style={{ position: 'absolute', top: '16px', right: '-50%', width: '100%', height: '1px', background: '#ddd' }}></div>
           </div>
           <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', background: '#fff', color: '#888' }}>4</div>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Get Ticket</span>
           </div>
        </div>

        {/* Concert Info */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Taylor Swift Concert "The Eras Tour"</h1>
        
        <img src="https://images.unsplash.com/photo-1540039155732-d674d5e8ac04?auto=format&fit=crop&q=80&w=1200" alt="Concert" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '16px', marginBottom: '1.5rem' }} />
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>The Eras Tour: Taylor Swift</h2>
        <p style={{ color: '#555', marginBottom: '2rem' }}>Mon, June 04 . 08:00 pm . Royal Albert Hall.</p>

        {/* Ticket Prices */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
          <span style={{ fontSize: '1.2rem', color: '#111' }}>Ticket Price:</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1rem', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>$399</span> | <span style={{ color: '#555' }}>VIP tickets</span>
            </div>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1rem', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>$299</span> | <span style={{ color: '#555' }}>Standard tickets</span>
            </div>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1rem', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>$199</span> | <span style={{ color: '#555' }}>Economic tickets</span>
            </div>
          </div>
        </div>

        {/* Main Seat Layout & Sidebar */}
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
           
           {/* Seat Map Area */}
           <div style={{ flex: '2', background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              
              {/* Stage */}
              <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto 3rem auto', background: '#f5f5f5', padding: '1rem', textAlign: 'center', borderRadius: '8px', color: '#555', fontWeight: 'bold' }}>
                Stage
              </div>

              {/* Simplified Layouts for Sections */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                 <div>
                   {[10, 10, 10, 10, 10, 10, 10].map((num, i) => renderSeatRow(i, num, 1))}
                   <div style={{ textAlign: 'center', marginTop: '1rem', color: '#555' }}>Section 1</div>
                 </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem' }}>
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
                       <img src="https://images.unsplash.com/photo-1540039155732-d674d5e8ac04?auto=format&fit=crop&q=80&w=150" alt="Concert thumb" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                       <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>Taylor Swift: The Eras Tour</h4>
                          <div style={{ color: '#555', fontSize: '0.85rem', marginBottom: '0.25rem' }}>June 04, Mon. 08:00 pm . VIP Ticket</div>
                          <div style={{ color: '#555', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Section {seat.split('-')[0].replace('S', '')}, Row {seat.split('-')[1]}, Seat {seat.split('-')[2]}</div>
                          <div style={{ fontWeight: 'bold' }}>${ticketPrice.toFixed(2)}</div>
                       </div>
                       <button onClick={() => removeSeat(seat)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', position: 'absolute', top: '1rem', right: '1rem' }}>
                          <Trash2 size={18} />
                       </button>
                    </div>
                  ))}

                  <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginTop: '1rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#555' }}>
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#555' }}>
                        <span>Service Fees</span>
                        <span>${serviceFee.toFixed(2)}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <span>Total USD ({selectedSeats.length} item{selectedSeats.length > 1 ? 's' : ''})</span>
                        <span>${total.toFixed(2)}</span>
                     </div>
                     <button 
                       className="btn btn-primary" 
                       style={{ width: '100%', padding: '1rem', borderRadius: '8px' }}
                       onClick={() => navigate('/checkout', { state: { selectedSeats, total, subtotal, serviceFee } })}
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
