import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, ChevronRight, ChevronLeft, CreditCard, Clock, Ticket, ShieldCheck, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SINGER_IMAGES, CONCERT_IMAGES } from '../constants/images';

const Home = () => {
  const navigate = useNavigate();

  const artists = [
    { name: 'Enrique Iglesias', img: SINGER_IMAGES.enrique_iglesias, location: 'Manchester', date: 'Oct 17 - Oct 21', price: 299.99 },
    { name: 'Ariana Grande', img: SINGER_IMAGES.ariana_grande, location: 'London', date: 'Oct 22 - Oct 26', price: 199.99 },
    { name: 'Justin Bieber', img: SINGER_IMAGES.justin_bieber, location: 'Manchester', date: 'Oct 24 - Oct 29', price: 199.99 },
    { name: 'Celine Dion', img: SINGER_IMAGES.celine_dion, location: 'Bristol', date: 'Oct 28 - Oct 30', price: 499.99 },
    { name: 'Selena Gomez', img: SINGER_IMAGES.selena_gomez, location: 'London', date: 'Oct 30 - Oct 31', price: 299.99 }
  ];

  const events = [
    { title: 'Taylor Swift', img: CONCERT_IMAGES.taylor_swift, date: 'June 14 - June 19 London', price: 799.99, timeEnd: '15D, 08:45:03' },
    { title: 'Dua Lipa', img: CONCERT_IMAGES.dua_lipa, date: 'July 20 - July 24 Paris', price: 399.99, timeEnd: '25D, 11:34:03' },
    { title: 'Lady Gaga', img: CONCERT_IMAGES.lady_gaga, date: 'Aug 10 - Aug 15 New York', price: 450.00, timeEnd: '45D, 05:45:09' },
    { title: 'Adele', img: CONCERT_IMAGES.adele, date: 'Sep 05 - Sep 09 Berlin', price: 499.99, timeEnd: '75D, 10:00:00' },
    { title: 'Ed Sheeran', img: CONCERT_IMAGES.ed_sheeran, date: 'Oct 12 - Oct 18 Tokyo', price: 150.00, timeEnd: '105D, 12:30:00' },
    { title: 'Rihanna', img: CONCERT_IMAGES.rihanna, date: 'Nov 22 - Nov 26 Sydney', price: 599.99, timeEnd: '145D, 09:15:00' }
  ];

  return (
    <div>
      <Navbar />

      {/* 1. Hero Section */}
      <section className="bg-dark" style={{ paddingTop: '10rem', paddingBottom: '8rem', textAlign: 'center' }}>
        <div className="container">
          <h1 className="title-lg" style={{ marginBottom: '1rem' }}>Book Tickets Of Your Favorite Singers!</h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>Make Sure Don't Miss These 5 Up Coming's Concerts!</p>
          
          <div className="search-bar" style={{ display: 'inline-flex', background: 'white', borderRadius: '12px', padding: '0.5rem', marginTop: '3rem', gap: '0', alignItems: 'center' }}>
            <div className="flex items-center" style={{ padding: '0.5rem 1rem' }}>
              <Search size={20} color="#888" style={{ marginRight: '0.5rem' }} />
              <input type="text" placeholder="Type a singer name" style={{ border: 'none', outline: 'none', fontSize: '1rem' }} />
            </div>
            <div className="divider" style={{ height: '30px', margin: '0 0.5rem' }}></div>
            <div className="flex items-center" style={{ padding: '0.5rem 1rem' }}>
              <Calendar size={20} color="#888" style={{ marginRight: '0.5rem' }} />
              <input type="text" placeholder="Date" style={{ border: 'none', outline: 'none', fontSize: '1rem' }} />
            </div>
            <div className="divider" style={{ height: '30px', margin: '0 0.5rem' }}></div>
            <div className="flex items-center" style={{ padding: '0.5rem 1rem' }}>
              <MapPin size={20} color="#888" style={{ marginRight: '0.5rem' }} />
              <input type="text" placeholder="Location" style={{ border: 'none', outline: 'none', fontSize: '1rem' }} />
            </div>
            <button className="btn btn-primary" style={{ borderRadius: '8px', marginLeft: '0.5rem' }}>Find Ticket</button>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '4rem', overflowX: 'auto', paddingBottom: '2rem' }}>
            {artists.map((artist, idx) => (
              <div key={idx} style={{ background: 'white', borderRadius: '12px', padding: '0.5rem', color: 'black', width: '220px', textAlign: 'left', flexShrink: 0 }}>
                <img src={artist.img} alt={artist.name} referrerPolicy="no-referrer" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ padding: '1rem 0.5rem 0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{artist.name}</h3>
                  <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{artist.location} • {artist.date}</p>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>₹{artist.price}</div>
                  <button className="btn btn-light" style={{ width: '100%', padding: '0.5rem' }} onClick={() => navigate('/reservation')}>Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Our Benefits Section */}
      <section className="section bg-light text-center">
        <div className="container">
          <h2 className="title-md">Our Benefits</h2>
          <p className="text-muted" style={{ marginBottom: '4rem' }}>we promise users with the standard of these 4 services</p>
          
          <div className="grid grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div style={{ width: 80, height: 80, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <CreditCard size={32} color="var(--clr-primary-500)" />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Instalment Payment!</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>You can pay a ticket in 2 portions throughout a fixed period of time. Start invoicing for free.</p>
            </div>
            <div className="flex flex-col items-center">
              <div style={{ width: 80, height: 80, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <Ticket size={32} color="var(--clr-primary-500)" />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Online Booking!</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>You can pay a ticket in 2 portions throughout a fixed period of time. Start invoicing for free.</p>
            </div>
            <div className="flex flex-col items-center">
              <div style={{ width: 80, height: 80, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <ShieldCheck size={32} color="var(--clr-primary-500)" />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Refundable Tickets!</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>You can pay a ticket in 2 portions throughout a fixed period of time. Start invoicing for free.</p>
            </div>
            <div className="flex flex-col items-center">
              <div style={{ width: 80, height: 80, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <Ticket size={32} color="var(--clr-primary-500)" />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Cheapest Tickets!</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>You can pay a ticket in 2 portions throughout a fixed period of time. Start invoicing for free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Time is Running Out */}
      <section className="section text-center">
        <div className="container">
          <h2 className="title-md">Time is Running Out!</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Explore nearby concerts and events here.</p>
          
          <div className="flex justify-center gap-4" style={{ marginBottom: '3rem' }}>
            <button style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #ccc', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={20} /></button>
            <button style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #ccc', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={20} /></button>
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', overflowX: 'auto', paddingBottom: '2rem' }}>
            {events.map((event, idx) => (
              <div key={idx} style={{ width: '300px', flexShrink: 0, textAlign: 'left' }}>
                <div style={{ position: 'relative', height: '350px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <img src={event.img} alt={event.title} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '2rem 1rem 1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div className="flex items-center gap-2"><Clock size={16} /> Time to end</div>
                     <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{event.timeEnd}</div>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{event.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{event.date}</p>
                <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>₹{event.price}</div>
                <button className="btn btn-light" style={{ width: '100%' }} onClick={() => navigate('/reservation')}>Book Now</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Steps Section */}
      <section className="section bg-light">
        <div className="container flex items-center" style={{ gap: '4rem' }}>
          <div style={{ flex: 1 }}>
            <h2 className="title-md" style={{ marginBottom: '1rem' }}>4 Easy Steps To Buy a Ticket!</h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Get Familiar with our 4 easy working process</p>
            <button className="btn btn-primary" onClick={() => navigate('/concerts')}>Buy Ticket</button>
          </div>
          <div style={{ flex: 2 }}>
             {/* A placeholder for the steps illustration, representing the 4 circles */}
             <div className="flex justify-between items-center" style={{ position: 'relative', padding: '2rem 0' }}>
               <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', borderTop: '2px dashed #ccc', zIndex: 0 }}></div>
               <div style={{ position: 'relative', zIndex: 1, background: 'white', padding: '2rem 1rem', borderRadius: '16px', width: '22%', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                 <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Choose A Concert</h4>
                 <p style={{ fontSize: '0.8rem', color: '#888' }}>You can see concert tickets in our website.</p>
               </div>
               <div style={{ position: 'relative', zIndex: 1, background: 'white', padding: '2rem 1rem', borderRadius: '16px', width: '22%', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                 <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Choose Date & Time</h4>
                 <p style={{ fontSize: '0.8rem', color: '#888' }}>You Can check date and time of your favorite concert.</p>
               </div>
               <div style={{ position: 'relative', zIndex: 1, background: 'white', padding: '2rem 1rem', borderRadius: '16px', width: '22%', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                 <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Pay Your Bill</h4>
                 <p style={{ fontSize: '0.8rem', color: '#888' }}>After choosing your date and time you can pay ticket online.</p>
               </div>
               <div style={{ position: 'relative', zIndex: 1, background: 'white', padding: '2rem 1rem', borderRadius: '16px', width: '22%', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                 <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Download Your Ticket!</h4>
                 <p style={{ fontSize: '0.8rem', color: '#888' }}>After completing checkout process you can download your ticket.</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. Upcoming Concerts */}
      <section className="section text-center">
        <div className="container">
          <h2 className="title-md">Upcoming Concerts</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>The best concerts will be held soon!</p>
          
          <div className="flex justify-center gap-4" style={{ marginBottom: '3rem' }}>
            <button style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #ccc', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={20} /></button>
            <button style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #ccc', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={20} /></button>
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', overflowX: 'auto', paddingBottom: '2rem' }}>
            {['Shakira', 'Pitbull', 'Lady Gaga', 'Bruno Mars'].map((name, idx) => (
              <div key={idx} style={{ width: '250px', flexShrink: 0, textAlign: 'left' }}>
                <div style={{ position: 'relative', height: '300px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem', background: '#333' }}>
                  <img src={CONCERT_IMAGES[name.toLowerCase().replace(' ', '_')]} alt={name} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8))' }}></div>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Coming soon</div>
                    <div style={{ fontSize: '0.85rem' }}>Sep 2024</div>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{name}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Sep - Nov • London / Bristol</p>
                <button className="btn btn-light" style={{ width: '100%' }}>View Details</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Newsletter & Blog */}
      <section className="section bg-light">
        <div className="container flex" style={{ gap: '4rem' }}>
          <div style={{ flex: 1 }}>
            <h2 className="title-md" style={{ marginBottom: '1rem' }}>Subscribe our news letter</h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>For weekly later news and offers about music world, Join us here.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'white' }}>
                 <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}><Mail size={20} color="#888" /></div>
                 <input type="email" placeholder="Enter your email" style={{ flex: 1, border: 'none', outline: 'none' }} />
              </div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Subscribe →</button>
            </div>
          </div>
          <div style={{ flex: 2, display: 'flex', gap: '2rem' }}>
             <div style={{ flex: 1 }}>
               <img src={CONCERT_IMAGES.taylor_swift} alt="Blog 1" referrerPolicy="no-referrer" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
               <h4 style={{ marginBottom: '0.5rem' }}>Taylor Swift in Biggest World Tour</h4>
               <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.</p>
               <div className="flex items-center gap-2">
                 <img src="https://ui-avatars.com/api/?name=Jonathan+Willis&background=random" alt="Jonathan" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                 <div style={{ fontSize: '0.8rem' }}><b>Jonathan Willis</b><br/><span style={{ color: '#888' }}>July 17, 2024. 5 min</span></div>
               </div>
             </div>
             <div style={{ flex: 1 }}>
               <img src={CONCERT_IMAGES.adele} alt="Blog 2" referrerPolicy="no-referrer" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
               <h4 style={{ marginBottom: '0.5rem' }}>Royal Albert Hall New Events</h4>
               <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.</p>
               <div className="flex items-center gap-2">
                 <img src="https://ui-avatars.com/api/?name=Marian+Ed&background=random" alt="Marian" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                 <div style={{ fontSize: '0.8rem' }}><b>Marian Ed</b><br/><span style={{ color: '#888' }}>June 13, 2024. 10 min</span></div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 7. What People Think About Us */}
      <section className="section text-center">
        <div className="container">
          <h2 className="title-md">What People Think About Us</h2>
          <p className="text-muted" style={{ marginBottom: '4rem' }}>Words of praise from others about our presence. You can read and also write about us here.</p>
          
          <div className="grid grid-cols-3 gap-8 text-left" style={{ marginBottom: '3rem' }}>
            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
               <div style={{ fontSize: '3rem', color: 'var(--clr-primary-500)', lineHeight: '1', marginBottom: '1rem' }}>"</div>
               <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>We got tickets for Taylor Swift when noone else could. We had the best time ever at teh concert. Thanks Ticketer, your reselling site made it possible to have what seemed impossible!</p>
               <div className="flex items-center gap-4">
                 <img src="https://ui-avatars.com/api/?name=Emily&background=random" alt="Emily" referrerPolicy="no-referrer" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                 <div>
                   <div style={{ fontWeight: 'bold' }}>Emily</div>
                   <div style={{ fontSize: '0.8rem', color: '#888' }}>Manchester, UK</div>
                 </div>
               </div>
            </div>
            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
               <div style={{ fontSize: '3rem', color: 'var(--clr-primary-500)', lineHeight: '1', marginBottom: '1rem' }}>"</div>
               <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>Ok so credit where its due having raised the issue with they quickly got back to me and refunded the difference. They also managed to get me the tickets so my daughter got to see Taylor Swift</p>
               <div className="flex items-center gap-4">
                 <img src="https://ui-avatars.com/api/?name=William&background=random" alt="William" referrerPolicy="no-referrer" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                 <div>
                   <div style={{ fontWeight: 'bold' }}>William</div>
                   <div style={{ fontSize: '0.8rem', color: '#888' }}>Birmingham, UK</div>
                 </div>
               </div>
            </div>
            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
               <div style={{ fontSize: '3rem', color: 'var(--clr-primary-500)', lineHeight: '1', marginBottom: '1rem' }}>"</div>
               <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>I had such a great experience!!! I bought an eras tour ticket and they promised to transfer it until the upcoming concert which is 10 days away. I got the ticket the day after.</p>
               <div className="flex items-center gap-4">
                 <img src="https://ui-avatars.com/api/?name=Daisy&background=random" alt="Daisy" referrerPolicy="no-referrer" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                 <div>
                   <div style={{ fontWeight: 'bold' }}>Daisy</div>
                   <div style={{ fontSize: '0.8rem', color: '#888' }}>Liverpool, UK</div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <button className="btn btn-outline" style={{ color: 'var(--clr-primary-500)', border: '1px solid var(--clr-primary-500)' }}>Read All Review</button>
            <button className="btn btn-primary">Leave a comment</button>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="section bg-light">
        <div className="container flex" style={{ gap: '4rem' }}>
           <div style={{ flex: 1 }}>
             <h2 className="title-md" style={{ marginBottom: '2rem' }}>Frequently Asked Questions</h2>
             
             <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
               <Mail size={20} color="var(--clr-primary-500)" />
               <span>helpcenter@ticketer.com</span>
             </div>
             <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', boxShadow: 'var(--shadow-sm)' }}>
               <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'var(--clr-primary-500)' }}>📞</span></div>
               <span>(010) 123-4567</span>
             </div>

             <h3 style={{ marginBottom: '1rem' }}>Still Have Questions?</h3>
             <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Can't find the answer you're looking for? Please contact our help center.</p>
             <button className="btn btn-primary">Contact Us</button>
           </div>
           <div style={{ flex: 2 }}>
             {/* Accordion placeholder */}
             <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
               <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 I haven't received any order confirmation yet. Did my booking go through?
                 <span style={{ color: 'var(--clr-primary-500)' }}>^</span>
               </h4>
               <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9rem', lineHeight: '1.6' }}>Lorem ipsum dolor sit amet consectetur. Eleifend nunc habit lorem egestas. Convallis praesent egestas suscipit hendrerit sem egestas feugiat.</p>
             </div>
             
             <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
               <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 I am not able/do not want to attend an already booked event for personal reasons. Is there a possibility to cancel/rebook the tickets?
                 <span>v</span>
               </h4>
             </div>
             <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
               <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 I lost my e-Ticket. What can I do?
                 <span>v</span>
               </h4>
             </div>
             <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
               <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 An event was canceled/postponed/relocated, and I am not able/do not want to attend the event. Is it possible to cancel my tickets?
                 <span>v</span>
               </h4>
             </div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
