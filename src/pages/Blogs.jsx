import React from 'react';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONCERT_IMAGES } from '../constants/images';

const Blogs = () => {
  const blogs = [
    { title: 'Taylor Swift Reputation Stadium', excerpt: 'Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.', author: 'Jonathan Wills', date: 'July 12, 2024 . 8 min', img: CONCERT_IMAGES.taylor_swift },
    { title: '3X Band Are Falling Apart!', excerpt: 'Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.', author: 'Mick Smith', date: 'July 17, 2024 . 12 min', img: CONCERT_IMAGES.coldplay },
    { title: 'Yanni Big Concert in England', excerpt: 'Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.', author: 'Rayan Gosling', date: 'June 18, 2024 . 6 min', img: CONCERT_IMAGES.bruno_mars },
    { title: 'New Festivals are Coming', excerpt: 'Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.', author: 'Nick Webster', date: 'July 21, 2024 . 5 min', img: CONCERT_IMAGES.billie_eilish },
    { title: 'New Band Was Born in Spain', excerpt: 'Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.', author: 'Loocie Hearts', date: 'May 10, 2024 . 8 min', img: CONCERT_IMAGES.enrique_iglesias },
    { title: 'Turkey\'s Festivals in Summer', excerpt: 'Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.', author: 'Nancy Sunser', date: 'July 01, 2024 . 4 min', img: CONCERT_IMAGES.pitbull },
    { title: 'Royal Albert Hall New Concerts', excerpt: 'Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.', author: 'Niko Niga', date: 'July 17, 2024 . 3 min', img: CONCERT_IMAGES.adele },
    { title: 'Summer Music Festivals', excerpt: 'Lorem ipsum dolor sit amet consectetur. A vivamus donec bibendum massa erat the ultrices nulla.', author: 'Amir Sakhif', date: 'June 03, 2024 . 7 min', img: CONCERT_IMAGES.dua_lipa }
  ];

  return (
    <div>
      <Navbar />

      {/* Page Header */}
      <section style={{ backgroundColor: '#F8F9FA', padding: '10rem 0 4rem 0' }}>
        <div className="container">
          <h1 className="title-lg" style={{ marginBottom: '1rem', color: '#111' }}>Our Blog</h1>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>Our place to share news about concerts, events and singers all around the world</p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="section bg-light" style={{ padding: '4rem 0' }}>
        <div className="container">

          {/* Search & Filter */}
          <div className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '0.75rem 1rem', width: '100%', maxWidth: '400px' }}>
              <input type="text" placeholder="Search any blogs..." style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }} />
              <Search size={20} color="#888" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '0.75rem 1rem', minWidth: '150px', cursor: 'pointer' }}>
              <span style={{ marginRight: 'auto' }}>Sort by</span>
              <ChevronDown size={20} color="#888" />
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-4 gap-6">
            {blogs.map((blog, idx) => (
              <div key={idx} style={{ background: 'white', cursor: 'pointer' }}>
                <img src={blog.img} alt={blog.title} referrerPolicy="no-referrer" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{blog.title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>{blog.excerpt}</p>
                <div className="flex items-center" style={{ gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden' }}>
                    <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Author" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{blog.author}</div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>{blog.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Popular Posts */}
      <section className="section bg-light" style={{ paddingTop: '0', paddingBottom: '5rem' }}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <h2 className="title-md">Popular Posts</h2>
            <a href="#" style={{ color: '#111', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              All News <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-4 gap-6">
             {blogs.slice(0, 4).map((blog, idx) => (
              <div key={`pop-${idx}`} style={{ background: 'white', cursor: 'pointer' }}>
                <img src={blog.img} alt={blog.title} referrerPolicy="no-referrer" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{blog.title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>{blog.excerpt}</p>
                <div className="flex items-center" style={{ gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden' }}>
                     <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Author" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{blog.author}</div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>{blog.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blogs;
