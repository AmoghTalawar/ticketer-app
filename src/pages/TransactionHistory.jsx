import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ExternalLink } from 'lucide-react';

const TransactionHistory = () => {
  const transactions = [
    { id: 1, type: 'Mint Ticket', date: 'Oct 10, 2026 14:30', amount: '50 MATIC', status: 'Confirmed', hash: '0x123abc...' },
    { id: 2, type: 'List Resale', date: 'Oct 11, 2026 09:15', amount: '---', status: 'Confirmed', hash: '0x456def...' },
    { id: 3, type: 'Buy Ticket', date: 'Oct 15, 2026 18:45', amount: '55 MATIC', status: 'Pending', hash: '0x789ghi...' }
  ];

  return (
    <div>
      <Navbar />
      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
        <div className="container">
          <h1 className="title-md" style={{ marginBottom: '2rem' }}>Transaction History</h1>
          
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Type</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Explorer</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{tx.type}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#666' }}>{tx.date}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{tx.amount}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        background: tx.status === 'Confirmed' ? 'rgba(40,167,69,0.1)' : 'rgba(255,193,7,0.1)',
                        color: tx.status === 'Confirmed' ? '#28a745' : '#ffc107',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                       }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <a href={`https://amoy.polygonscan.com/tx/${tx.hash}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--clr-primary-500)', textDecoration: 'none' }}>
                        View <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', marginTop: '2rem' }}>
              <p className="text-muted">No transactions found for this wallet.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TransactionHistory;
