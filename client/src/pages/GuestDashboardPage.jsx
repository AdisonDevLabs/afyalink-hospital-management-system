// frontend/src/pages/GuestDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hospital, Info, Phone, Mail, Clock, CalendarCheck, LogIn,
  Stethoscope, LayoutDashboard, MessageSquareText, ShieldCheck,
  Award, HeartHandshake, Microscope, Users, Newspaper, MapPin, DollarSign, Briefcase,
  CheckCircle, AlertTriangle // Added for Notification component
} from 'lucide-react';

// --- Reusable Notification Component ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const colorClasses = {
    success: { bg: 'bg-green-100 dark:bg-green-900', border: 'border-green-400 dark:border-green-700', text: 'text-green-700 dark:text-green-200', icon: 'text-green-500 dark:text-green-400' },
    error: { bg: 'bg-red-100 dark:bg-red-900', border: 'border-red-400 dark:border-red-700', text: 'text-red-700 dark:text-red-200', icon: 'text-red-500 dark:text-red-400' },
    info: { bg: 'bg-blue-100 dark:bg-blue-900', border: 'border-blue-400 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-200', icon: 'text-blue-500 dark:text-blue-400' },
  };

  const { bg, border, text, icon } = colorClasses[type] || colorClasses.info;

  const IconComponent = type === 'success' ? CheckCircle : type === 'error' ? AlertTriangle : Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "50%" }}
      animate={{ opacity: 1, y: 0, x: "0%" }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg dark:shadow-xl flex items-center space-x-3
                  ${bg} ${border} ${text} border-l-4 transition-colors duration-300`}
      role="alert"
    >
      <IconComponent className={`h-6 w-6 ${icon}`} />
      <div>{message}</div>
      <button onClick={onClose} className={`ml-auto ${icon} hover:opacity-75`}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

// Static data for the guest dashboard - extracted outside the component
const HOSPITAL_INFO = {
  name: "AfyaLink Medical Center",
  tagline: "Your Health, Our Priority. Compassionate Care, Advanced Medicine.",
  address: "123 Healthway, Wellness City, Kenya",
  phone: "+254 712 345 678",
  emergencyPhone: "+254 799 888 777",
  email: "info@afyalink.com",
  hours: "24/7 Emergency, Mon-Fri 8 AM - 5 PM (Outpatient)",
  services: [
    "General Consultation", "Specialist Care", "Emergency Services",
    "Maternity & Child Health", "Laboratory Services", "Pharmacy", "Radiology"
  ],
  faqs: [
    { question: "How do I book an appointment?", answer: "You can book an appointment online through our 'Patient Portal' or by calling our reception during working hours." },
    { question: "What are your visiting hours?", answer: "General visiting hours are from 10 AM - 12 PM and 4 PM - 7 PM daily. ICU/HDU hours may vary." },
    { question: "Do you accept my insurance?", answer: "We work with most major insurance providers. Please contact our billing department or check the 'Insurance Partners' section for details." }
  ],
  features: [
    { icon: ShieldCheck, title: "Accredited Care", description: "Internationally recognized standards of medical excellence." },
    { icon: Stethoscope, title: "Expert Physicians", description: "A team of highly qualified and compassionate doctors." },
    { icon: Microscope, title: "Advanced Technology", description: "State-of-the-art equipment for accurate diagnosis and treatment." },
    { icon: HeartHandshake, title: "Patient-Centric Approach", description: "Your comfort and recovery are at the heart of everything we do." },
  ],
  doctors: [
    { id: 1, name: "Dr. Aisha Khan", specialization: "Pediatrician", imageUrl: "https://placehold.co/100x100/A7F3D0/065F46?text=AK" },
    { id: 2, name: "Dr. Ben Carter", specialization: "Cardiologist", imageUrl: "https://placehold.co/100x100/BFDBFE/1E40AF?text=BC" },
    { id: 3, name: "Dr. Clara Davies", specialization: "Dermatologist", imageUrl: "https://placehold.co/100x100/FED7AA/9A3412?text=CD" },
  ],
  testimonials: [
    { id: 1, quote: "AfyaLink provided exceptional care during my recovery. The nurses were incredibly supportive.", author: "Sarah M." },
    { id: 2, quote: "Booking an appointment was so easy, and Dr. Khan was very thorough and kind. Highly recommend!", author: "David L." },
    { id: 3, quote: "The emergency team was swift and professional. Grateful for their quick response.", author: "Emily R." },
  ],
  news: [
    { id: 1, title: "New Maternity Wing Opening Soon!", date: "July 15, 2025", link: "/news/maternity-wing" },
    { id: 2, title: "Free Health Screening Camp Next Month", date: "July 10, 2025", link: "/news/health-camp" },
    { id: 3, title: "Understanding Diabetes: A Community Talk", date: "July 01, 2025", link: "/news/diabetes-talk" },
  ]
};

// Animation variants for Framer Motion - extracted outside component
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const ITEM_VARIANTS = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function GuestDashboard() {
  const [notification, setNotification] = useState({ message: null, type: null });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: null, type: null }), 5000);
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300"
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ message: null, type: null })}
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.header variants={ITEM_VARIANTS} className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 text-white py-20 px-6 rounded-xl shadow-2xl overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://placehold.co/1920x1080/ffffff/000000?text=Medical+Background')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-up">
            Welcome to {HOSPITAL_INFO.name}
          </h1>
          <p className="text-lg md:text-2xl font-light mb-8 opacity-90 animate-fade-in">
            {HOSPITAL_INFO.tagline}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/appointments/schedule"
              className="inline-flex items-center px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <CalendarCheck className="mr-3 h-7 w-7" /> Book Appointment
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 border border-white border-opacity-30"
            >
              <LogIn className="mr-3 h-7 w-7" /> Patient Portal
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Quick Info Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <motion.div variants={ITEM_VARIANTS} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-start space-x-4 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <Phone className="h-10 w-10 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Contact Us</h3>
            <p className="text-gray-600 dark:text-gray-300">Phone: <a href={`tel:${HOSPITAL_INFO.phone}`} className="text-blue-600 hover:underline dark:text-blue-400">{HOSPITAL_INFO.phone}</a></p>
            <p className="text-gray-600 dark:text-gray-300">Emergency: <a href={`tel:${HOSPITAL_INFO.emergencyPhone}`} className="text-red-600 hover:underline dark:text-red-400 font-bold">{HOSPITAL_INFO.emergencyPhone}</a></p>
            <p className="text-gray-600 dark:text-gray-300">Email: <a href={`mailto:${HOSPITAL_INFO.email}`} className="text-blue-600 hover:underline dark:text-blue-400">{HOSPITAL_INFO.email}</a></p>
            <p className="text-gray-600 dark:text-gray-300">Address: {HOSPITAL_INFO.address}</p>
            <Link to="/contact" className="text-blue-600 hover:underline text-sm mt-3 inline-block dark:text-blue-400">Get Directions &rarr;</Link>
          </div>
        </motion.div>

        <motion.div variants={ITEM_VARIANTS} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-start space-x-4 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <Clock className="h-10 w-10 text-green-500 dark:text-green-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Operating Hours</h3>
            <p className="text-gray-600 dark:text-gray-300">{HOSPITAL_INFO.hours}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Our emergency department is open 24 hours a day, 7 days a week.</p>
          </div>
        </motion.div>

        <motion.div variants={ITEM_VARIANTS} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-start space-x-4 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <Stethoscope className="h-10 w-10 text-purple-500 dark:text-purple-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Our Services</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
              {HOSPITAL_INFO.services.slice(0, 4).map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
            <Link to="/services" className="text-blue-600 hover:underline text-sm mt-3 inline-block dark:text-blue-400">View All Services &rarr;</Link>
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us Section */}
      <section className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-10">
          Why Choose {HOSPITAL_INFO.name}?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOSPITAL_INFO.features.map((feature, index) => (
            <motion.div
              key={index}
              variants={ITEM_VARIANTS}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <feature.icon className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Doctor Spotlight Section */}
      <section className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-10">
          Meet Our Dedicated Doctors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {HOSPITAL_INFO.doctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              variants={ITEM_VARIANTS}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <img src={doctor.imageUrl} alt={doctor.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-200 dark:border-blue-700" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">{doctor.name}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium">{doctor.specialization}</p>
              <Link to={`/doctors/${doctor.id}`} className="text-sm text-gray-600 hover:underline mt-3 dark:text-gray-300">View Profile &rarr;</Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/doctors" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-105">
            <Users className="mr-2 h-5 w-5" /> View All Doctors
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-blue-50 dark:bg-blue-900 p-10 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700 text-center mb-12">
        <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-100 mb-8">What Our Patients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOSPITAL_INFO.testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={ITEM_VARIANTS}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <MessageSquareText className="h-12 w-12 text-green-500 dark:text-green-400 mb-4" />
              <p className="italic text-gray-700 dark:text-gray-200 mb-4">"{testimonial.quote}"</p>
              <p className="font-semibold text-gray-800 dark:text-gray-100">- {testimonial.author}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* News & Announcements Section */}
      <section className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-10">
          Latest News & Updates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOSPITAL_INFO.news.map((item) => (
            <motion.div
              key={item.id}
              variants={ITEM_VARIANTS}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <Newspaper className="h-10 w-10 text-orange-500 dark:text-orange-400 mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.date}</p>
              <Link to={item.link} className="text-blue-600 hover:underline dark:text-blue-400">Read More &rarr;</Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/news" className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
            View All News
          </Link>
        </div>
      </section>

      {/* Additional Quick Links / Footer Call to Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link to="/services" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <LayoutDashboard className="h-10 w-10 text-teal-500 dark:text-teal-400 mb-3" />
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Our Services</span>
          <p className="text-sm text-gray-500 dark:text-gray-300">Explore our comprehensive medical offerings.</p>
        </Link>
        <Link to="/billing" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <DollarSign className="h-10 w-10 text-green-500 dark:text-green-400 mb-3" />
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Billing & Payments</span>
          <p className="text-sm text-gray-500 dark:text-gray-300">Information on insurance and payment options.</p>
        </Link>
        <Link to="/careers" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <Briefcase className="h-10 w-10 text-indigo-500 dark:text-indigo-400 mb-3" />
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Careers</span>
          <p className="text-sm text-gray-500 dark:text-gray-300">Join our team of dedicated healthcare professionals.</p>
        </Link>
        <Link to="/contact" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <MapPin className="h-10 w-10 text-red-500 dark:text-red-400 mb-3" />
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Our Location</span>
          <p className="text-sm text-gray-500 dark:text-gray-300">Find us easily with our interactive map.</p>
        </Link>
      </section>

      {/* Footer Section */}
      <motion.footer variants={ITEM_VARIANTS} className="text-center text-gray-600 dark:text-gray-400 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="mb-2">&copy; {new Date().getFullYear()} {HOSPITAL_INFO.name}. All rights reserved.</p>
        <p className="text-sm mb-4">Providing compassionate and advanced healthcare to our community.</p>
        <div className="mt-4 space-x-4">
          <Link to="/privacy-policy" className="hover:underline text-blue-600 dark:text-blue-400">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:underline text-blue-600 dark:text-blue-400">Terms of Service</Link>
          <Link to="/sitemap" className="hover:underline text-blue-600 dark:text-blue-400">Sitemap</Link>
        </div>
      </motion.footer>
    </motion.div>
  );
}

export default GuestDashboard;