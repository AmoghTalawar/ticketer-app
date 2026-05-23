import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Users, Ticket, Plus, IndianRupee } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrganizerDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Events', value: '4', icon: <Ticket size={24} color="var(--clr-primary-500)" /> },
    { label: 'Tickets Sold', value: '1,245', icon: <Users size={24} color="var(--clr-primary-500)" /> },
    { label: 'Total Revenue', value: '₹45,230', icon: <IndianRupee size={24} color="var(--clr-primary-500)" /> },
    { label: 'Active Listings', value: '2', icon: <BarChart size={24} color="var(--clr-primary-500)" /> }
  ];

  const events = [
    { id: 1, title: 'Coldplay World Tour', date: 'Oct 24, 2026', ticketsSold: 850, totalSupply: 1000, revenue: '₹85,000' },
    { id: 2, title: 'Ed Sheeran Acoustic', date: 'Nov 12, 2026', ticketsSold: 395, totalSupply: 500, revenue: '₹19,750' }
  ];

  return (
    <div>
      <Navbar />
      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <h1 className="title-md">Organizer Dashboard</h1>
            <button className="btn btn-primary flex items-center gap-2" onClick={() => navigate('/create-event')}>
              <Plus size={20} /> Create New Event
            </button>
          </div>

          <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '3rem' }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(var(--clr-primary-500-rgb), 0.1)', padding: '1rem', borderRadius: '50%' }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="title-md" style={{ marginBottom: '1.5rem' }}>My Events</h2>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Event</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Tickets Sold</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Revenue</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>{event.title}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{event.date}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '100%', background: '#eee', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${(event.ticketsSold / event.totalSupply) * 100}%`, background: 'var(--clr-primary-500)', height: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>{event.ticketsSold}/{event.totalSupply}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>{event.revenue}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => navigate('/ticket-verification')}>Verify Scanner</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
