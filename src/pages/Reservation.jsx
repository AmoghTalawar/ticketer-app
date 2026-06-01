import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Trash2, MapPin, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONCERT_IMAGES } from '../constants/images';
import PriceTag from '../components/PriceTag';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';
import { resolveImageUrl, DEFAULT_EVENT_IMAGE } from '../utils/imageUrl';

const isSeatReserved = (seatId) => {
  let hash = 0;
  for (let i = 0; i < seatId.length; i++) {
    hash = seatId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 5) === 0;
};

const Reservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ethToInr } = useCurrencyConverter();

  const event = location.state?.event || {
    _id: 'default',
    title: 'Taylor Swift: The Eras Tour',
    ticketPrice: '0.01',
    date: '2026-06-04T20:00:00.000Z',
    venue: 'Royal Albert Hall',
    imageUrl: CONCERT_IMAGES.taylor_swift,
  };

  const [selectedSeats, setSelectedSeats] = useState([]);

  const ticketPrice = parseFloat(event.ticketPrice || '0.01');
  const subtotal    = selectedSeats.length * ticketPrice;
  const serviceFee  = selectedSeats.length * (ticketPrice * 0.05);
  const total       = subtotal + serviceFee;

  const eventImage = resolveImageUrl(event.imageUrl, DEFAULT_EVENT_IMAGE);

  const renderSeatRow = (rowId, numSeats, sectionOffset) => (
    <div key={rowId} style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', marginBottom: '0.3rem' }}>
      {Array.from({ length: numSeats }).map((_, i) => {
        const seatId = `S${sectionOffset}-${rowId}-${i + 1}`;
        const isSelected = selectedSeats.includes(seatId);
        const isReserved = isSeatReserved(seatId);

        let bgColor = '#e0e0ff';
        if (isReserved) bgColor = '#4A3AFF';
        if (isSelected) bgColor = '#FF3B30';

        return (
          <div
            key={seatId}
            onClick={() => {
              if (!isReserved) {
                setSelectedSeats(prev =>
                  isSelected ? prev.filter(s => s !== seatId) : [...prev, seatId]
                );
              }
            }}
            style={{
              width: '20px', height: '20px',
              backgroundColor: bgColor,
              borderRadius: '4px 4px 0 0',
              cursor: isReserved ? 'not-allowed' : 'pointer',
              border: '1px solid rgba(0,0,0,0.08)',
              transition: 'transform 0.1s',
            }}
            title={isReserved ? 'Reserved' : `Seat ${seatId}`}
          />
        );
      })}
    </div>
  );

  const removeSeat = (seatId) => setSelectedSeats(prev => prev.filter(s => s !== seatId));

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: '2-digit',
  });
  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });

  const seatLabel = (seat) =>
    `Section ${seat.split('-')[0].replace('S', '')}, Row ${seat.split('-')[1]}, Seat ${seat.split('-')[2]}`;

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', color: '#111' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>

        {/* Progress Tracker */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
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
                margin: '0 auto 0.5rem', background: '#fff',
                fontWeight: step.active ? 'bold' : 'normal',
                color: step.done || step.active ? '#111' : '#888',
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

        {/* Main layout: Seat map (left, 2/3) + Sidebar (right, 1/3 fixed width) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'flex-start' }}>

          {/* ── Seat Selector Grid ─────────────────────────────────── */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>Select Your Seats</h2>
            <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Click on available seats to select them. Maximum 1 seat per transaction.
            </p>

            {/* Stage */}
            <div style={{ width: '80%', height: '28px', background: 'linear-gradient(to bottom, #d3d3d3, #eee)', border: '1px solid #ccc', margin: '0 auto 2.5rem auto', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '3px' }}>
              STAGE
            </div>

            {/* Section 1 — Main Hall */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
              {[10, 10, 10, 10, 10].map((num, i) => renderSeatRow(i, num, 1))}
              <div style={{ marginTop: '0.75rem', color: '#555', fontWeight: '600', fontSize: '0.85rem' }}>Main Hall (Section 1)</div>
            </div>

            {/* Sections 2, 3, 4 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {[6, 7, 8, 9, 8, 7, 6].map((num, i) => renderSeatRow(i, num, 3))}
                <div style={{ marginTop: '0.75rem', color: '#555', fontSize: '0.85rem' }}>Section 3</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1.5rem' }}>
                {[12, 10, 8, 6].map((num, i) => renderSeatRow(i, num, 2))}
                <div style={{ marginTop: '0.75rem', color: '#555', fontSize: '0.85rem' }}>Section 2</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {[6, 7, 8, 9, 8, 7, 6].map((num, i) => renderSeatRow(i, num, 4))}
                <div style={{ marginTop: '0.75rem', color: '#555', fontSize: '0.85rem' }}>Section 4</div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
              {[
                { color: '#e0e0ff', label: 'Available' },
                { color: '#4A3AFF', label: 'Reserved' },
                { color: '#FF3B30', label: 'Selected' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
                  <div style={{ width: '18px', height: '18px', background: color, borderRadius: '4px 4px 0 0' }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {selectedSeats.length === 0 ? (
              <div style={{ background: '#fff', padding: '2.5rem 1.5rem', borderRadius: '16px', textAlign: 'center', color: '#888', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🪑</div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#333' }}>No seat selected</div>
                <div style={{ fontSize: '0.85rem' }}>Click a seat on the map to add it here.</div>
              </div>
            ) : (
              <>
                {/* Ticket cards */}
                {selectedSeats.map(seat => (
                  <div key={seat} style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                    {/* Event image banner */}
                    <div style={{ position: 'relative', height: '120px' }}>
                      <img
                        src={eventImage}
                        alt={event.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = DEFAULT_EVENT_IMAGE; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
                      <button
                        onClick={() => removeSeat(seat)}
                        style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Ticket details */}
                    <div style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem', color: '#111' }}>{event.title}</div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#666' }}>
                          <Calendar size={13} /> {formattedDate} at {formattedTime}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#666' }}>
                          <MapPin size={13} /> {event.venue}
                        </div>
                      </div>

                      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.82rem', color: '#555', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
                        🪑 {seatLabel(seat)}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Price</span>
                        <PriceTag eth={ticketPrice} size="sm" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Order summary */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontWeight: '700', color: '#111', marginBottom: '1rem', fontSize: '1rem' }}>Order Summary</div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: '#555', fontSize: '0.9rem' }}>
                    <span>Subtotal ({selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''})</span>
                    <span style={{ fontWeight: '600' }}>{ethToInr(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#555', fontSize: '0.9rem' }}>
                    <span>Service Fee (5%)</span>
                    <span style={{ fontWeight: '600' }}>{ethToInr(serviceFee)}</span>
                  </div>

                  <div style={{ borderTop: '2px dashed #eee', paddingTop: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', fontSize: '1rem', color: '#111' }}>Total</span>
                    <PriceTag eth={total} size="md" />
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '700' }}
                    onClick={() => navigate('/checkout', { state: { selectedSeats, total, subtotal, serviceFee, event } })}
                  >
                    Proceed to Checkout →
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#aaa', marginTop: '0.75rem' }}>
                    Secure on-chain payment via MetaMask
                  </p>
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
