import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONCERT_IMAGES } from '../constants/images';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve passed state or use defaults
  const selectedSeats = location.state?.selectedSeats || ['S1-0-1', 'S1-0-2'];
  const ticketPrice = 399.00;
  const subtotal = location.state?.subtotal || selectedSeats.length * ticketPrice;
  const serviceFee = location.state?.serviceFee || selectedSeats.length * 1.00;
  const total = location.state?.total || subtotal + serviceFee;

  const [paymentMethod, setPaymentMethod] = useState('credit');

  const handleCheckout = () => {
    // In a real app, integrate Stripe/PayPal here
    navigate('/ticket'); // Redirect to ticket download page
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
           <div style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', background: '#fff' }}><Check size={16} /></div>
              <span style={{ fontSize: '0.8rem', color: '#111' }}>Choose Time</span>
              <div style={{ position: 'absolute', top: '16px', right: '-50%', width: '100%', height: '1px', background: '#111' }}></div>
           </div>
           <div style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', background: '#fff' }}><Check size={16} /></div>
              <span style={{ fontSize: '0.8rem', color: '#111' }}>Choose Seat</span>
              <div style={{ position: 'absolute', top: '16px', right: '-50%', width: '100%', height: '1px', background: '#111' }}></div>
           </div>
           <div style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', background: '#fff', fontWeight: 'bold' }}>3</div>
              <span style={{ fontSize: '0.8rem', color: '#111', fontWeight: 'bold' }}>Checkout</span>
              <div style={{ position: 'absolute', top: '16px', right: '-50%', width: '100%', height: '1px', background: '#ddd' }}></div>
           </div>
           <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', background: '#fff', color: '#888' }}>4</div>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Get Ticket</span>
           </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
           <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', marginBottom: '0.5rem' }}>Checkout</h1>
           <p style={{ color: '#888' }}>Fill Out Necessary Information here.</p>
           <div style={{ display: 'inline-block', border: '1px solid #FFA500', color: '#FFA500', padding: '0.25rem 1rem', borderRadius: '16px', marginTop: '1rem', fontWeight: 'bold' }}>
             05:12
           </div>
        </div>

        <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
           
           {/* Left Column: Ticket List */}
           <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '0.5rem' }}>Your Ticket List</h3>
              
              {selectedSeats.map(seat => (
                <div key={seat} style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '1.5rem' }}>
                   <img src={CONCERT_IMAGES.taylor_swift} alt="Concert thumb" referrerPolicy="no-referrer" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Taylor Swift: The Eras Tour</h4>
                      <div style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.25rem' }}>June 04, Mon. 08:00 pm . VIP Ticket</div>
                      <div style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Section {seat.split('-')[0].replace('S', '')}, Row {seat.split('-')[1]}, Seat {seat.split('-')[2]}</div>
                      <div style={{ fontWeight: 'bold', marginTop: 'auto' }}>₹{ticketPrice.toFixed(2)}</div>
                   </div>
                </div>
              ))}

              <div style={{ marginTop: '1rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#555', fontSize: '1.1rem' }}>
                    <span>Subtotal</span>
                    <span>₹{ticketPrice.toFixed(2)} x{selectedSeats.length}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#555', fontSize: '1.1rem' }}>
                    <span>Service Fees</span>
                    <span>₹1.00 x{selectedSeats.length}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontWeight: 'bold', fontSize: '1.3rem', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
                    <span>Total INR <span style={{ fontWeight: 'normal', color: '#888', fontSize: '1.1rem' }}>({selectedSeats.length} item{selectedSeats.length > 1 ? 's' : ''})</span></span>
                    <span>₹{total.toFixed(2)}</span>
                 </div>
              </div>
           </div>

           {/* Right Column: Payment Details */}
           <div style={{ flex: '1', background: '#fff', borderRadius: '16px', padding: '3rem 2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '2rem' }}>Payment Details</h3>
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} style={{ transform: 'scale(1.2)' }} />
                    <span style={{ fontWeight: 'bold', color: '#003087' }}>PayPal</span>
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} style={{ transform: 'scale(1.2)' }} />
                    <span style={{ fontWeight: 'bold', color: '#EB001B' }}>Credit Card</span>
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'venmo'} onChange={() => setPaymentMethod('venmo')} style={{ transform: 'scale(1.2)' }} />
                    <span style={{ fontWeight: 'bold', color: '#008CFF' }}>Venmo</span>
                 </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Card Number</label>
                    <input type="text" placeholder="xxxx xxxx xxxx xxxx" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} />
                 </div>
                 
                 <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                       <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Expiration Date</label>
                       <input type="text" placeholder="MM/YY" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>CVV</label>
                       <input type="text" placeholder="XXX" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} />
                    </div>
                 </div>

                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Name On Card</label>
                    <input type="text" placeholder="Enter your name" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} />
                 </div>

                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>Discount Code</label>
                    <input type="text" placeholder="Enter discount code" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} />
                 </div>
              </div>

              <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                    <input type="checkbox" style={{ transform: 'scale(1.2)' }} defaultChecked />
                    <span>By clicking this, I agree to Ticketer <a href="#" style={{ color: 'var(--clr-primary-500)', textDecoration: 'none' }}>Privacy Policy</a></span>
                 </label>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={handleCheckout}>
                 Pay ₹{total.toFixed(2)}
              </button>

           </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
