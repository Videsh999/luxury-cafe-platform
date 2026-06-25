import React from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Menu',         to: '/menu' },
  { label: 'Gallery',      to: '/gallery' },
  { label: 'Reservations', to: '/reservations' },
];

const Footer = () => (
  <footer className="bg-[#040404] border-t border-white/5 relative z-10">

    {/* CTA strip */}
    <div className="border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24 flex flex-col md:flex-row items-center justify-between gap-10">
        <div>
          <p className="text-luxury-gold/70 tracking-[0.45em] uppercase text-[10px] font-sans mb-4">
            Reserve Your Table
          </p>
          <h3
            className="font-luxury italic font-light text-white leading-[1.15]"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            An evening unlike<br />any other awaits.
          </h3>
        </div>
        <Link
          to="/reservations"
          className="group shrink-0 relative px-12 py-4 overflow-hidden bg-luxury-gold text-[#050505] font-sans font-semibold text-xs tracking-[0.25em] uppercase hover:shadow-[0_0_40px_rgba(197,160,89,0.3)] transition-shadow duration-500"
        >
          <span className="absolute inset-0 bg-white/10 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 skew-x-12" />
          <span className="relative">Book a Table</span>
        </Link>
      </div>
    </div>

    {/* Main footer columns */}
    <div className="max-w-7xl mx-auto px-6 md:px-16 py-20 grid grid-cols-1 md:grid-cols-12 gap-14">

      {/* Brand */}
      <div className="md:col-span-5">
        <p className="font-luxury italic text-luxury-gold text-3xl mb-6 tracking-wide">Aura Reserve</p>
        <p className="font-sans font-light text-white/30 text-sm leading-relaxed max-w-xs">
          A sanctuary of flavor, stillness, and craft. Open daily from 8 am to midnight.
        </p>
        <div className="flex gap-6 mt-8">
          {['Instagram', 'X', 'LinkedIn'].map(s => (
            <a
              key={s}
              href="#"
              className="text-white/25 hover:text-luxury-gold text-[10px] tracking-[0.3em] uppercase font-sans transition-colors duration-500"
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="md:col-span-3 md:col-start-7">
        <p className="text-white/20 text-[9px] tracking-[0.35em] uppercase font-sans mb-8">Experience</p>
        <ul className="space-y-5">
          {NAV_LINKS.map(l => (
            <li key={l.label}>
              <Link
                to={l.to}
                className="font-luxury italic text-white/60 hover:text-luxury-gold text-base transition-colors duration-500"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div className="md:col-span-4">
        <p className="text-white/20 text-[9px] tracking-[0.35em] uppercase font-sans mb-8">Contact</p>
        <ul className="space-y-3 font-sans font-light text-white/30 text-sm">
          <li>123 Luxury Avenue</li>
          <li>Beverly Hills, CA 90210</li>
          <li className="pt-2">
            <a href="mailto:concierge@auracafe.com" className="text-luxury-gold/70 hover:text-luxury-gold transition-colors duration-500">
              concierge@auracafe.com
            </a>
          </li>
          <li>+1 (800) 123-AURA</li>
        </ul>
      </div>

    </div>

    {/* Legal strip */}
    <div className="border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/15 text-[10px] tracking-[0.2em] uppercase font-sans">
          © {new Date().getFullYear()} Aura Reserve. All rights reserved.
        </p>
        <div className="flex gap-8">
          <a href="#" className="text-white/15 hover:text-white/50 text-[10px] tracking-[0.2em] uppercase font-sans transition-colors duration-500">Privacy</a>
          <a href="#" className="text-white/15 hover:text-white/50 text-[10px] tracking-[0.2em] uppercase font-sans transition-colors duration-500">Terms</a>
          <a
            href="http://localhost:3001/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-luxury-gold/40 hover:text-luxury-gold text-[10px] tracking-[0.2em] uppercase font-sans font-semibold transition-colors duration-500"
          >
            Admin Portal
          </a>
        </div>
      </div>
    </div>

  </footer>
);

export default Footer;
