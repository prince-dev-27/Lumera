import React, { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-2 pb-12">
        <span className="text-xs text-luxury-gold uppercase tracking-widest font-bold">Connect With Us</span>
        <h1 className="text-4xl font-serif text-luxury-charcoal">Get in Touch</h1>
        <div className="h-0.5 w-16 bg-luxury-gold mx-auto mt-2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
        
        {/* Support Information */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-luxury-charcoal">Salon & Corporate Office</h2>
            <p className="text-xs text-luxury-gray font-light leading-relaxed">
              Lumera Jewellery House<br />
              102, Gold Palace Arcade, MG Road<br />
              Bangalore, Karnataka - 560001
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-serif text-luxury-charcoal">Customer Care Channels</h2>
            <div className="text-xs text-luxury-gray space-y-1 font-light">
              <p><strong>Email:</strong> support@lumerajewels.com</p>
              <p><strong>Phone:</strong> +91 80 4912 3456</p>
              <p><strong>Mon-Sat:</strong> 10:00 AM to 7:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[#FDFBF7] p-8 border border-luxury-border">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <svg className="w-12 h-12 text-luxury-gold mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-serif text-luxury-charcoal">Message Received</h3>
              <p className="text-xs text-luxury-gray font-light">
                Thank you for contacting us. A Lumera concierge will reply to your inquiry shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  required
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write details of custom requests, order inquiries, etc."
                  required
                  rows="4"
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-luxury-charcoal text-[#FDFBF7] hover:bg-luxury-gold hover:text-luxury-charcoal py-3 text-xs uppercase tracking-widest font-semibold transition"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
