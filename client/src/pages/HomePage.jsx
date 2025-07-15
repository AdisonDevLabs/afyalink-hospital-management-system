import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext provides user status

// Image & Video Assets (Place your actual assets here)
import afyalinkLogo from '../assets/afyalink-logo.svg';
import heroVideoMp4 from '../assets/videos/afyalink-hero-video.mp4'; // High-quality hospital overview video
import heroVideoWebm from '../assets/hero-banner-video.mp4'; // WebM for broader browser support
import heroImageFallback from '../assets/hero-banner-image.webp'; // Still image for video fallback

// Service Icons (Prefer SVG icons for scalability and modern look)
import IconOutpatient from '../assets/icons/icon-outpatient.png';
import IconEmergency from '../assets/icons/icon-emergency.png';
import IconLab from '../assets/icons/icon-lab.png';
import IconPharmacy from '../assets/icons/icon-pharmacy.png';
import IconRadiology from '../assets/icons/icon-radiology.png';
import IconSurgery from '../assets/icons/icon-surgery.png';
import IconMaternity from '../assets/icons/icon-maternity.png';
import IconWellness from '../assets/icons/icon-wellness.png'; // New service icon

// Doctor Photos (High-resolution, professional headshots)
import doctorAisha from '../assets/doctors/dr-aisha-khan.webp';
import doctorBen from '../assets/doctors/dr-ben-carter.webp';
import doctorSarah from '../assets/doctors/dr-sarah-lee.webp';
import doctorJohn from '../assets/doctors/dr-john-muriithi.webp';

// Background Textures (Subtle patterns or blurred medical imagery)
import bgPatternMedical from '../assets/bg-pattern-medical.webp';
import bgAbstractBlue from '../assets/bg-abstract-blue.webp';

// CSS Imports
import './HomePage.css'; // For custom animations and intricate styles
import '/src/footer.css'; // For consistent footer styling

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//${backendUrl}

const HomePage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // Destructure currentUser from AuthContext

    // Refs for smooth scrolling to sections
    const servicesRef = useRef(null);
    const appointmentRef = useRef(null);
    const departmentsRef = useRef(null);
    const doctorsRef = useRef(null);
    const testimonialsRef = useRef(null);

    // State for Appointment Booking Widget
    const [appointmentForm, setAppointmentForm] = useState({
        department: '',
        doctor: '',
        date: '',
        time: '',
        name: '',
        email: '',
        phone: '',
        captcha: ''
    });
    const [captchaValue, setCaptchaValue] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [formStatus, setFormStatus] = useState({ type: '', message: '' }); // { type: 'success'|'error', message: '...' }

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setCaptchaValue(result);
    };

    const handleAppointmentChange = (e) => {
        const { name, value } = e.target;
        setAppointmentForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCaptchaInputChange = (e) => {
        setCaptchaInput(e.target.value);
    };

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault();
        setFormStatus({ type: '', message: '' }); // Clear previous status

        if (captchaInput.toLowerCase() !== captchaValue.toLowerCase()) {
            setFormStatus({ type: 'error', message: 'Incorrect CAPTCHA. Please try again.' });
            generateCaptcha();
            setCaptchaInput('');
            return;
        }

        try {
            // Simulate API call for booking
            // In a real application, replace this with actual backend integration
            console.log('Appointment Form Submitted:', appointmentForm);
            // const response = await fetch('/api/book-appointment', { method: 'POST', body: JSON.stringify(appointmentForm) });
            // if (!response.ok) throw new Error('Network response was not ok.');
            // const data = await response.json();

            setFormStatus({ type: 'success', message: 'Your appointment request has been successfully submitted! We will contact you within 24 hours.' });
            setAppointmentForm({
                department: '', doctor: '', date: '', time: '', name: '', email: '', phone: '', captcha: ''
            });
            setCaptchaInput('');
            generateCaptcha(); // Regenerate CAPTCHA for next submission
        } catch (error) {
            console.error('Appointment booking error:', error);
            setFormStatus({ type: 'error', message: 'Failed to book appointment. Please check your details and try again.' });
        }
    };

    // Framer Motion Variants for staggered animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const fadeInUp = {
        hidden: { y: 60, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.6, 0.05, -0.01, 0.9],
            },
        },
    };

    // Dummy Data (Replace with real data from your HMS backend)
    const departments = [
        { name: 'Cardiology', description: 'Advanced diagnostics & treatment for heart conditions.', icon: '❤️' },
        { name: 'Pediatrics', description: 'Compassionate care for infants, children, & adolescents.', icon: '👶' },
        { name: 'Orthopedics', description: 'Specialized care for bone, joint, and muscle health.', icon: '🦴' },
        { name: 'Dermatology', description: 'Expert solutions for skin, hair, and nail concerns.', icon: '✨' },
        { name: 'Oncology', description: 'Comprehensive cancer treatment & supportive care.', icon: '🎗️' },
        { name: 'General Surgery', description: 'Skilled surgeons for a wide range of procedures.', icon: '🔪' },
    ];

    const services = [
        { title: 'Outpatient Consultations', icon: IconOutpatient, desc: 'Convenient medical consultations and follow-ups without hospital admission.' },
        { title: '24/7 Emergency Care', icon: IconEmergency, desc: 'Immediate, life-saving medical attention for critical conditions and injuries.' },
        { title: 'Advanced Lab Services', icon: IconLab, desc: 'Accurate and timely diagnostic testing for precise medical insights.' },
        { title: 'Pharmacy & Prescriptions', icon: IconPharmacy, desc: 'Fully stocked pharmacy providing essential medications and expert advice.' },
        { title: 'Diagnostic Radiology', icon: IconRadiology, desc: 'State-of-the-art imaging for X-rays, MRI, CT scans, and ultrasounds.' },
        { title: 'Specialized Surgery', icon: IconSurgery, desc: 'Modern surgical techniques across various specialties for optimal recovery.' },
        { title: 'Maternity & Child Health', icon: IconMaternity, desc: 'Comprehensive care for expectant mothers and newborns, ensuring healthy outcomes.' },
        { title: 'Preventive Health & Wellness', icon: IconWellness, desc: 'Programs focused on health education, vaccinations, and disease prevention.' },
    ];

    const doctors = [
        { id: 'dr-aisha', name: 'Dr. Aisha Khan', specialization: 'Pediatrician', bio: 'With 15+ years experience, Dr. Khan is dedicated to nurturing children\'s health through comprehensive and compassionate care.', photo: doctorAisha, link: '/doctors/dr-aisha-khan' },
        { id: 'dr-ben', name: 'Dr. Ben Carter', specialization: 'Cardiologist', bio: 'A leading cardiologist specializing in interventional procedures and chronic heart disease management. Committed to patient well-being.', photo: doctorBen, link: '/doctors/dr-ben-carter' },
        { id: 'dr-sarah', name: 'Dr. Sarah Lee', specialization: 'Orthopedic Surgeon', bio: 'Expert in sports injuries and joint replacement. Dr. Lee helps patients regain mobility and improve their quality of life.', photo: doctorSarah, link: '/doctors/dr-sarah-lee' },
        { id: 'dr-john', name: 'Dr. John Muriithi', specialization: 'General Surgeon', bio: 'Performing a wide array of surgical procedures with a focus on minimally invasive techniques for faster patient recovery.', photo: doctorJohn, link: '/doctors/dr-john-muriithi' },
    ];

    const newsItems = [
        { id: 1, title: 'AfyaLink Launches Telemedicine Services', date: 'July 8, 2025', snippet: 'Access expert medical consultations remotely. Our new platform ensures quality care from your home.', link: '/news/telemedicine-launch' },
        { id: 2, title: 'Free Diabetes Screening Camp Announced', date: 'June 25, 2025', snippet: 'Join our community health initiative on August 15th for free diabetes screenings and health advice.', link: '/news/diabetes-camp' },
        { id: 3, title: 'Welcoming Dr. Emily Green, New Oncologist', date: 'May 28, 2025', snippet: 'Dr. Emily Green, a distinguished oncologist, joins our team, enhancing our comprehensive cancer care.', link: '/news/new-oncologist-joins' },
        { id: 4, title: 'Advanced Pain Management Unit Opens', date: 'May 10, 2025', snippet: 'Discover our multidisciplinary approach to chronic pain, featuring cutting-edge treatments for lasting relief.', link: '/news/pain-management-unit' },
    ];

    const testimonials = [
        { id: 1, name: 'Grace M.', rating: 5, feedback: 'The care I received at AfyaLink was truly exceptional. The surgical team and nurses were supportive and incredibly professional. I felt completely safe and well-cared for.', photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
        { id: 2, name: 'John D.', rating: 4, feedback: 'Booking an appointment online was seamless. Dr. Carter was thorough, patient, and explained everything clearly. A truly positive experience.', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 3, name: 'Amina K.', rating: 5, feedback: 'Bringing my child to Dr. Khan was the best decision. Her gentle approach and expert advice put us at ease. The clinic atmosphere is very comforting.', photo: 'https://randomuser.me/api/portraits/women/8.jpg' },
        { id: 4, name: 'David L.', rating: 5, feedback: 'From the emergency room to my recovery, the entire AfyaLink team demonstrated outstanding professionalism and compassion. They literally saved my life.', photo: 'https://randomuser.me/api/portraits/men/44.jpg' },
    ];

    return (
        <div className="home-page-container font-sans text-gray-800 antialiased overflow-x-hidden">
            {/* A. Header / Navigation */}
            <header className="fixed w-full bg-white shadow-lg z-50 py-3 md:py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center space-x-3">
                    <Link to="/" className="flex items-center space-x-2 outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
                        <img src={afyalinkLogo} alt="AfyaLink Logo" className="h-10 md:h-12 transform hover:scale-105 transition-transform duration-200" />
                        <span className="text-2xl md:text-3xl font-extrabold text-blue-800 tracking-tight">AfyaLink HMS</span>
                    </Link>
                </div>
                <nav className="hidden lg:flex space-x-7 items-center">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/about" className="nav-link">About Us</Link>
                    <Link to="/services" className="nav-link">Services</Link>
                    <Link to="/departments" className="nav-link">Departments</Link>
                    <button
                        onClick={() => appointmentRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="nav-link font-bold text-blue-600 hover:text-blue-800"
                    >
                        Book Appointment
                    </button>
                    <Link to="/contact" className="nav-link">Contact Us</Link>
                </nav>
                <div className="hidden lg:flex items-center space-x-4">
                    {currentUser ? (
                        <Link to="/dashboard" className="btn btn-primary">
                            Dashboard
                        </Link>
                    ) : (
                        <Link to="/login" className="btn btn-secondary">
                            Login
                        </Link>
                    )}
                </div>
                {/* Mobile Menu Toggle (Implement with a separate component/logic) */}
                <button className="lg:hidden text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </header>

            <main className="pt-[76px] lg:pt-[84px]"> {/* Adjust padding-top based on header height */}
                {/* B. Hero Section / Welcome Message */}
                <section className="hero-section relative h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden bg-gray-900">
                    <video
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={heroImageFallback}
                    >
                        <source src={heroVideoMp4} type="video/mp4" />
                        <source src={heroVideoWebm} type="video/webm" />
                        Your browser does not support the video tag or its format.
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent opacity-80 z-10"></div>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="relative z-20 text-center p-4 max-w-5xl"
                    >
                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight tracking-tighter"
                        >
                            Your Health, <span className="text-blue-300">Our Compassionate Care</span>
                        </motion.h1>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-2xl mb-10 font-light text-blue-100 max-w-3xl mx-auto"
                        >
                            Located in Rongai, Nakuru County, AfyaLink HMS is committed to providing **innovative, patient-centered healthcare solutions** with integrity and excellence.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4">
                            <motion.button
                                onClick={() => appointmentRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="btn btn-primary btn-lg transform hover:scale-105"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Book An Appointment
                            </motion.button>
                            <Link to="/about" className="btn btn-secondary btn-lg transform hover:scale-105">
                                Learn More About Us
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* C. Key Services Section */}
                <section ref={servicesRef} className="py-20 bg-gray-50">
                    <motion.div
                        className="container mx-auto px-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                    >
                        <motion.h2 variants={fadeInUp} className="section-heading">
                            Comprehensive Healthcare Services
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {services.map((service, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="service-card"
                                >
                                    <img src={service.icon} alt={service.title} className="w-16 h-16 mx-auto mb-5 icon-shadow" />
                                    <h3 className="text-2xl font-semibold text-blue-700 mb-3">{service.title}</h3>
                                    <p className="text-gray-600 mb-5 text-sm leading-relaxed">{service.desc}</p>
                                    <Link to={`/services/${service.title.toLowerCase().replace(/\s/g, '-')}`} className="link-arrow">
                                        Discover More
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* D. Appointment Booking Widget */}
                <section ref={appointmentRef} className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-repeat bg-contain" style={{ backgroundImage: `url(${bgPatternMedical})` }}></div>
                    <motion.div
                        className="container mx-auto px-6 relative z-10"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                    >
                        <motion.h2 variants={fadeInUp} className="section-heading text-white">
                            Schedule Your Visit
                        </motion.h2>
                        <motion.div variants={itemVariants} className="appointment-form-container">
                            <form onSubmit={handleAppointmentSubmit} className="space-y-7">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="department" className="form-label">Select Department</label>
                                        <select
                                            id="department"
                                            name="department"
                                            value={appointmentForm.department}
                                            onChange={handleAppointmentChange}
                                            className="form-input"
                                            required
                                        >
                                            <option value="">-- Choose a Department --</option>
                                            {departments.map((dept, index) => (
                                                <option key={index} value={dept.name}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="doctor" className="form-label">Preferred Doctor (Optional)</label>
                                        <select
                                            id="doctor"
                                            name="doctor"
                                            value={appointmentForm.doctor}
                                            onChange={handleAppointmentChange}
                                            className="form-input"
                                        >
                                            <option value="">-- Any Doctor --</option>
                                            {doctors
                                                .filter(doc => !appointmentForm.department || doc.specialization.includes(appointmentForm.department.split(' ')[0]))
                                                .map(doc => (
                                                    <option key={doc.id} value={doc.name}>{doc.name} ({doc.specialization})</option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="date" className="form-label">Desired Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            value={appointmentForm.date}
                                            onChange={handleAppointmentChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="time" className="form-label">Desired Time</label>
                                        <input
                                            type="time"
                                            id="time"
                                            name="time"
                                            value={appointmentForm.time}
                                            onChange={handleAppointmentChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="form-label">Your Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={appointmentForm.name}
                                            onChange={handleAppointmentChange}
                                            className="form-input"
                                            placeholder="e.g., Jane Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={appointmentForm.email}
                                            onChange={handleAppointmentChange}
                                            className="form-input"
                                            placeholder="e.g., jane.doe@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={appointmentForm.phone}
                                        onChange={handleAppointmentChange}
                                        className="form-input"
                                        placeholder="e.g., +254 7XX XXX XXX"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                    <label htmlFor="captcha" className="form-label mb-0">
                                        Enter CAPTCHA:
                                    </label>
                                    <div className="captcha-display">
                                        {captchaValue}
                                    </div>
                                    <input
                                        type="text"
                                        id="captcha"
                                        name="captcha"
                                        value={captchaInput}
                                        onChange={handleCaptchaInputChange}
                                        className="form-input flex-grow"
                                        placeholder="Type characters here"
                                        autoComplete="off"
                                        required
                                    />
                                </div>
                                <AnimatePresence>
                                    {formStatus.message && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={`mt-4 text-center font-medium ${formStatus.type === 'error' ? 'text-red-600' : 'text-green-600'}`}
                                        >
                                            {formStatus.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                                <button type="submit" className="btn btn-submit">
                                    Confirm Appointment Request
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </section>

                {/* E. Departments / Specialties */}
                <section ref={departmentsRef} className="py-20 bg-white">
                    <motion.div
                        className="container mx-auto px-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                    >
                        <motion.h2 variants={fadeInUp} className="section-heading">
                            Our Specialized Medical Departments
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {departments.map((dept, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="department-card"
                                >
                                    <div className="text-5xl mb-4 text-blue-700">{dept.icon}</div>
                                    <h3 className="text-2xl font-semibold text-blue-800 mb-2">{dept.name}</h3>
                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{dept.description}</p>
                                    <Link to={`/departments/${dept.name.toLowerCase().replace(/\s/g, '-')}`} className="link-arrow">
                                        Explore Department
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <Link to="/departments" className="btn btn-primary btn-md transform hover:scale-[1.02]">
                                View All Departments
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* F. Meet Our Doctors / Team */}
                <section ref={doctorsRef} className="py-20 bg-blue-50 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${bgAbstractBlue})` }}></div>
                    <motion.div
                        className="container mx-auto px-6 relative z-10"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                    >
                        <motion.h2 variants={fadeInUp} className="section-heading">
                            Meet Our Dedicated Medical Team
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {doctors.map(doctor => (
                                <motion.div
                                    key={doctor.id}
                                    variants={itemVariants}
                                    className="doctor-card"
                                >
                                    <img
                                        src={doctor.photo}
                                        alt={`Dr. ${doctor.name}`}
                                        className="w-32 h-32 rounded-full mx-auto mb-5 object-cover border-4 border-blue-300 group-hover:border-blue-500 transition-colors duration-300 shadow-md"
                                    />
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-1">{doctor.name}</h3>
                                    <p className="text-blue-600 font-medium mb-3 text-lg">{doctor.specialization}</p>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-5">{doctor.bio}</p>
                                    <Link to={doctor.link} className="link-arrow">
                                        View Full Profile
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <Link to="/doctors" className="btn btn-primary btn-md transform hover:scale-[1.02]">
                                Browse All Specialists
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* G. News & Announcements */}
                <section className="py-20 bg-white">
                    <motion.div
                        className="container mx-auto px-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                    >
                        <motion.h2 variants={fadeInUp} className="section-heading">
                            Latest Healthcare News & Updates
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {newsItems.map(news => (
                                <motion.div
                                    key={news.id}
                                    variants={itemVariants}
                                    className="news-card"
                                >
                                    <p className="text-sm text-gray-500 mb-2">{news.date}</p>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-700 transition-colors duration-200">{news.title}</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-5 line-clamp-3">{news.snippet}</p>
                                    <Link to={news.link} className="link-arrow">
                                        Read More
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <Link to="/news" className="btn btn-primary btn-md transform hover:scale-[1.02]">
                                View All News & Articles
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* H. Patient Testimonials */}
                <section ref={testimonialsRef} className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${bgAbstractBlue})` }}></div>
                    <motion.div
                        className="container mx-auto px-6 relative z-10"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                    >
                        <motion.h2 variants={fadeInUp} className="section-heading text-white">
                            What Our Patients Say
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {testimonials.map(testimonial => (
                                <motion.div
                                    key={testimonial.id}
                                    variants={itemVariants}
                                    className="testimonial-card"
                                >
                                    {testimonial.photo && (
                                        <img src={testimonial.photo} alt={testimonial.name} className="w-20 h-20 rounded-full object-cover mb-4 border-3 border-blue-200 shadow-md" />
                                    )}
                                    <div className="flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-6 h-6 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.374 2.45a1 1 0 00-.364 1.118l1.287 3.96c.3.921-.755 1.688-1.54 1.118l-3.374-2.45a1 1 0 00-1.176 0l-3.374 2.45c-.784.57-1.838-.197-1.539-1.118l1.287-3.96a1 1 00-.364-1.118L2.055 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.96z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="italic text-lg mb-4 leading-relaxed">"{testimonial.feedback}"</p>
                                    <p className="font-semibold text-gray-700 text-lg">- {testimonial.name}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* I. Footer */}
            <footer className="footer-section bg-gray-900 text-white py-16">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Contact Info */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">Contact Us</h3>
                        <p className="mb-3 text-gray-300">123 AfyaLink Road, <br/>Rongai, Nakuru County, Kenya</p>
                        <p className="mb-3">Phone: <a href="tel:+254712345678" className="text-blue-400 hover:underline transition duration-200">+254 712 345 678</a></p>
                        <p className="mb-3">Email: <a href="mailto:info@afyalinkhms.com" className="text-blue-400 hover:underline transition duration-200">info@afyalinkhms.com</a></p>
                        <p className="mb-3">Open 24/7 for Emergencies</p>
                    </div>

                    {/* Emergency Numbers */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">Emergency Services</h3>
                        <p className="text-red-400 text-4xl font-extrabold mb-3 leading-tight">📞 999</p>
                        <p className="text-lg text-gray-300 mb-4">Ambulance & Critical Care</p>
                        <p className="text-red-400 text-4xl font-extrabold mb-3 leading-tight">📞 112</p>
                        <p className="text-lg text-gray-300">General Emergency Hotline</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">Quick Links</h3>
                        <ul>
                            <li className="mb-3"><Link to="/privacy-policy" className="text-blue-400 hover:text-white transition duration-200">Privacy Policy</Link></li>
                            <li className="mb-3"><Link to="/terms-of-service" className="text-blue-400 hover:text-white transition duration-200">Terms of Service</Link></li>
                            <li className="mb-3"><Link to="/careers" className="text-blue-400 hover:text-white transition duration-200">Careers at AfyaLink</Link></li>
                            <li className="mb-3"><Link to="/faqs" className="text-blue-400 hover:text-white transition duration-200">Frequently Asked Questions</Link></li>
                            <li className="mb-3"><Link to="/sitemap" className="text-blue-400 hover:text-white transition duration-200">Sitemap</Link></li>
                        </ul>
                    </div>

                    {/* Social Media & Newsletter */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">Connect With Us</h3>
                        <div className="flex space-x-5 mb-8">
                            <a href="https://facebook.com/afyalinkhms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-white transition duration-300 transform hover:scale-110">
                                <svg fill="currentColor" className="w-9 h-9" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.77c0-2.502 1.492-3.889 3.776-3.889 1.094 0 2.24.195 2.24.195v2.455H14.23c-1.244 0-1.628.777-1.628 1.563V12h2.773l-.443 2.89h-2.33V22h5.51c4.782-.751 8.432-4.888 8.432-9.879C22 6.477 17.523 2 12 2z"></path></svg>
                            </a>
                            <a href="https://twitter.com/afyalinkhms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-white transition duration-300 transform hover:scale-110">
                                <svg fill="currentColor" className="w-9 h-9" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.37-.83.5-1.75.85-2.73 1.05C18.3 4.84 17.23 4.2 16 4.2c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.99-3.56-.18-6.7-1.89-8.81-4.48-.37.64-.58 1.38-.58 2.18 0 1.49.75 2.81 1.91 3.56-.7-.02-1.36-.22-1.93-.53v.06c0 2.08 1.48 3.82 3.44 4.2-1.33.36-2.75.4-4.18.16.55 1.71 2.14 2.95 4.03 2.98-1.48 1.16-3.34 1.85-5.36 1.85-.35 0-.7-.02-1.04-.06 1.92 1.23 4.19 1.95 6.64 1.95 7.97 0 12.31-6.59 12.31-12.31 0-.2-.01-.4-.02-.6.85-.61 1.58-1.37 2.17-2.24z"></path></svg>
                            </a>
                            <a href="https://instagram.com/afyalinkhms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-white transition duration-300 transform hover:scale-110">
                                <svg fill="currentColor" className="w-9 h-9" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.58.012 4.851.071C18.069 2.296 18.73 2.583 19.34 2.99a3.784 3.784 0 012.328 2.328c.407.61.694 1.27.817 2.031.059 1.271.071 1.647.071 4.851s-.012 3.58-.071 4.851c-.123.76-.41 1.42-.817 2.031a3.784 3.784 0 01-2.328 2.328c-.61.407-1.27.694-2.031.817-1.271.059-1.647.071-4.851.071s-3.58-.012-4.851-.071c-.76-.123-1.42-.41-2.031-.817a3.784 3.784 0 01-2.328-2.328c-.407-.61-.694-1.27-.817-2.031-.059-1.271-.071-1.647-.071-4.851s.012-3.58.071-4.851c.123-.76.41-1.42.817-2.031A3.784 3.784 0 014.66 2.99c.61-.407 1.27-.694 2.031-.817C7.962 2.172 8.338 2.163 12 2.163zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm6.5-.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z"></path></svg>
                            </a>
                            <a href="https://linkedin.com/company/afyalinkhms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-white transition duration-300 transform hover:scale-110">
                                <svg fill="currentColor" className="w-9 h-9" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.563c0-1.336-.027-3.054-1.852-3.054-1.853 0-2.136 1.445-2.136 2.955v5.662h-3.554V9.297h3.419v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.46V20.452zM4.337 8.063a2.41 2.41 0 01-2.404-2.41 2.407 2.407 0 012.404-2.406 2.408 2.408 0 012.404 2.406 2.406 2.406 0 01-2.404 2.41zm1.772 12.389H2.565V9.297h3.554v11.155zM12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2z"></path></svg>
                            </a>
                        </div>
                        <h4 className="text-xl font-bold mb-4 text-blue-300">Newsletter Subscription</h4>
                        <p className="mb-4 text-gray-300">Receive health tips, news, and special announcements directly in your inbox.</p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="p-3 rounded-l-lg flex-grow bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                aria-label="Email for newsletter"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-5 py-3 rounded-r-lg hover:bg-blue-700 transition duration-300 font-semibold"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                <div className="text-center text-gray-500 mt-16 pt-8 border-t border-gray-700">
                    &copy; {new Date().getFullYear()} AfyaLink HMS. All rights reserved. Powered by AfyaLink.
                </div>
            </footer>
        </div>
    );
};

export default HomePage;