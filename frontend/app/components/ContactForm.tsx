import React from 'react';
import { useState } from 'react';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="flex flex-col md:flex-row">
          <div className="w-full bg-white p-8 md:p-16 flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">Contact Us</h1>
            
            <p className="text-gray-700 mb-6">
              Want to collaborate? Just share a few details, and we'll be in touch soon. We're
              excited to connect with you!
            </p>
            
            <div className="mb-8">
              <a href="mailto:email@example.com" className="text-rose-400 hover:text-rose-500">
                email@example.com
              </a>
              <p className="text-gray-700">(555) 555-5555</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">Name <span className="text-gray-500 text-sm">(required)</span></label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full">
                    <label htmlFor="firstName" className="block text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="lastName" className="block text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-1">
                  Email <span className="text-gray-500 text-sm">(required)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 mb-1">
                  Message <span className="text-gray-500 text-sm">(required)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              
              <button
                type="submit"
                className="px-8 py-3 bg-rose-300 hover:bg-rose-400 text-white font-medium rounded-full transition duration-300"
              >
                SEND
              </button>
            </form>
          </div>
          
        </div>
      </main>
      
    </div>
  );
};

export default ContactPage;