import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';

export default function ContactUs({ isLoggedIn, userRole }) {
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });

  // Auto-detect if user is logged in if props not provided
  const [authStatus, setAuthStatus] = useState({
    isLoggedIn: isLoggedIn || false,
    userRole: userRole || null
  });

  useEffect(() => {
    if (isLoggedIn === undefined) {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setAuthStatus({
          isLoggedIn: true,
          userRole: user?.role
        });
      }
    } else {
      setAuthStatus({ isLoggedIn, userRole });
    }
  }, [isLoggedIn, userRole]);

  // Define navigation links based on authentication and role
  const getNavLinks = () => {
    if (authStatus.isLoggedIn) {
      // For logged-in users, all links go back to landing page root
      return [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/' },
        { label: 'About Us', href: '/' },
        { label: 'Contact', href: '/' }
      ];
    }
    
    // Default links for logged-out users (anchor links on same page)
    return [
      { label: 'Home', href: '#home' },
      { label: 'Services', href: '#services' },
      { label: 'About Us', href: '#about' },
      { label: 'Contact', href: '#contact' }
    ];
  };

  const displayNavLinks = getNavLinks();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Add your form submission logic here
    alert('Form submitted successfully!');
    setFormData({ email: '', phone: '' });
  };

  return (
    <div className="bg-primary py-16 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
        
        {/* Logo Section */}
        <div className="flex justify-center md:justify-start items-start">
          <img src={logo} alt="PawSitter Logo" className="w-40 h-40 object-contain" />
        </div>

        {/* Navigation and Social Links Section */}
        <div>
          <div className="grid grid-cols-2 gap-12">
            {/* Navigation Links */}
            <nav className="flex flex-col items-start space-y-4">
              {displayNavLinks.map((link, index) => (
                authStatus.isLoggedIn ? (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-xl font-semibold hover:text-[#f0e6e4] transition"
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    key={index}
                    href={link.href} 
                    className="text-white text-xl font-semibold hover:text-[#f0e6e4] transition"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </nav>

            {/* Social Links */}
            <div className="text-left">
              <p className="text-white text-xl font-semibold mb-4">follow us:</p>
              <div className="space-y-2">
                <a href="#" className="block text-white text-lg hover:text-[#f0e6e4] transition">
                  linkedin
                </a>
                <a href="#" className="block text-white text-lg hover:text-[#f0e6e4] transition">
                  linkedin
                </a>
                <a href="#" className="block text-white text-lg hover:text-[#f0e6e4] transition">
                  linkedin
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div>
          <div className="bg-[#8b6f5e] border-2 border-[#9d8070] rounded-lg p-6 shadow-xl max-w-sm">
            <h2 className="text-primary text-xl font-bold mb-4">Contact Us</h2>
            
            <div className="space-y-3">
              <input
                type="email"
                name="email"
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f0e6e4] bg-white"
              />
              
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f0e6e4] bg-white"
              />
              
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSubmit}
                  className="bg-[#9d8070] hover:bg-[#a88d7a] text-primary font-semibold px-6 py-2 text-sm rounded-lg transition shadow-md hover:shadow-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}