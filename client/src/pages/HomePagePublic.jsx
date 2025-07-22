import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import heroBannerVideo from '../assets/hero-banner-video.mp4';
import heroBannerImage from '../assets/hero-banner-image.webp';
import afyalinkLogo from '../assets/afyalink-logo.svg';

import serviceIconOutpatient from '../assets/icons/icon-outpatient.png';
import serviceIconEmergency from '../assets/icons/icon-emergency.png';
import serviceIconLab from '../assets/icons/icon-lab.png';
import serviceIconPharmacy from '../assets/icons/icon-pharmacy.png';
import serviceIconRadiology from '../assets/icons/icon-radiology.png';
import serviceIconSurgery from '../assets/icons/icon-surgery.png';
import serviceIconMaternity from '../assets/icons/icon-maternity.png';

import doctorPhoto1 from '../assets/doctors/dr-aisha-khan.webp';
import doctorPhoto2 from '../assets/doctors/dr-ben-carter.webp';
import doctorPhoto3 from '../assets/doctors/dr-sarah-lee.webp';

import bgDoctors from '../assets/bg-doctors.webp';
import bgTestimonials from '../assets/bg-testimonials.webp';

import '/src/footer.css';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const servicesRef = useRef(null);
    const appointmentRef = useRef(null);
    const departmentsRef = useRef(null);
    const doctorsRef = useRef(null);
    const testimonialsRef = useRef(null);
    const contactRef = useRef(null);

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
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });

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
        setFormMessage({ type: '', text: '' });

        if (captchaInput.toLowerCase() !== captchaValue.toLowerCase()) {
            setFormMessage({ type: 'error', text: 'Incorrect CAPTCHA. Please try again.' });
            generateCaptcha();
            setCaptchaInput('');
            return;
        }

        try {
            console.log('Appointment Form Submitted:', appointmentForm);
            setFormMessage({ type: 'success', text: 'Your appointment request has been received! We will contact you shortly.' });

            setAppointmentForm({
                department: '',
                doctor: '',
                date: '',
                time: '',
                name: '',
                email: '',
                phone: '',
                captcha: ''
            });
            setCaptchaInput('');
            generateCaptcha();
        } catch (error) {
            console.error('Appointment booking error:', error);
            setFormMessage({ type: 'error', text: 'An error occurred during booking. Please try again later.' });
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const departments = [
        { name: 'Cardiology', description: 'Comprehensive heart care, diagnostics, and surgical interventions for cardiovascular health.', icon: '❤️' },
        { name: 'Pediatrics', description: 'Specialized medical care for infants, children, and adolescents, including vaccinations and developmental checks.', icon: '👶' },
        { name: 'Orthopedics', description: 'Diagnosis and treatment of musculoskeletal system disorders, including fractures, joint pain, and sports injuries.', icon: '🦴' },
        { name: 'Dental', description: 'Full range of dental services from routine check-ups and cleanings to advanced restorative and cosmetic dentistry.', icon: '🦷' },
        { name: 'General Surgery', description: 'Performing a wide array of surgical procedures, from minor operations to complex abdominal surgeries, with advanced techniques.', icon: '🔪' },
        { name: 'Internal Medicine', description: 'Providing primary care for adults, managing chronic diseases, and coordinating specialist care for complex conditions.', icon: '⚕️' },
        { name: 'Oncology', description: 'Dedicated cancer treatment and support, including chemotherapy, radiation, and palliative care.', icon: '🎗️' },
        { name: 'Dermatology', description: 'Expert care for skin, hair, and nail conditions, offering both medical and cosmetic treatments.', icon: '🧴' },
    ];

    const doctors = [
        { id: 1, name: 'Dr. Aisha Khan', specialization: 'Pediatrician', bio: 'A compassionate pediatrician with over 15 years of experience, focusing on holistic child development and preventive care.', photo: doctorPhoto1, link: '/doctors/aisha-khan' },
        { id: 2, name: 'Dr. Ben Carter', specialization: 'Cardiologist', bio: 'Leading cardiologist renowned for interventional cardiology and managing complex heart conditions with cutting-edge treatments.', photo: doctorPhoto2, link: '/doctors/ben-carter' },
        { id: 3, name: 'Dr. Sarah Lee', specialization: 'Orthopedic Surgeon', bio: 'Specializing in sports medicine and joint replacement surgery, helping patients regain mobility and improve quality of life.', photo: doctorPhoto3, link: '/doctors/sarah-lee' },
        { id: 4, name: 'Dr. John Muriithi', specialization: 'General Surgeon', bio: 'Experienced surgeon performing a wide range of procedures with a focus on minimally invasive techniques for faster recovery.', photo: 'https://via.placeholder.com/150/ff7f50/FFFFFF?text=Dr.+Muriithi', link: '/doctors/john-muriithi' },
    ];

    const newsItems = [
        { id: 1, title: 'AfyaLink Introduces New Telemedicine Platform', date: 'July 8, 2025', snippet: 'Access quality healthcare from the comfort of your home with our new secure telemedicine services.', link: '/news/telemedicine-platform' },
        { id: 2, title: 'Free Community Health Fair & Screenings', date: 'June 20, 2025', snippet: 'Join us on August 15th for free blood pressure, glucose, and BMI screenings, plus health talks.', link: '/news/health-fair-2025' },
        { id: 3, title: 'Dr. Emily Green Joins Oncology Department', date: 'May 28, 2025', snippet: 'We are delighted to welcome Dr. Emily Green, a leading oncologist, strengthening our cancer care team.', link: '/news/new-oncologist' },
        { id: 4, title: 'Innovations in Pain Management at AfyaLink', date: 'May 10, 2025', snippet: 'Discover our advanced techniques and multidisciplinary approach to chronic pain management.', link: '/news/pain-management-innovations' },
    ];

    const testimonials = [
        { id: 1, name: 'Grace M.', rating: 5, feedback: 'AfyaLink provided exceptional care during my surgery. The staff was incredibly supportive and made me feel at ease throughout the process. Highly recommend their services!', photo: 'https://via.placeholder.com/80/f8f9fa/333333?text=GM' },
        { id: 2, name: 'John D.', rating: 4, feedback: 'The online appointment system is so convenient, and I was able to see a specialist quickly. Dr. Ben was very thorough and helpful in explaining my condition.', photo: 'https://via.placeholder.com/80/e9ecef/333333?text=JD' },
        { id: 3, name: 'Amina K.', rating: 5, feedback: 'I brought my child for a check-up, and Dr. Aisha was fantastic with her. The clinic environment is very child-friendly and reassuring for parents.', photo: 'https://via.placeholder.com/80/dee2e6/333333?text=AK' },
        { id: 4, name: 'David L.', rating: 5, feedback: 'From emergency admission to recovery, the professionalism and care at AfyaLink were outstanding. The nurses and doctors went above and beyond.', photo: 'https://via.placeholder.com/80/cce5ff/333333?text=DL' },
    ];

    const services = [
        { title: 'Outpatient Services', icon: serviceIconOutpatient, desc: 'Convenient and efficient medical consultations, check-ups, and follow-ups for non-emergency needs.' },
        { title: 'Emergency & Trauma', icon: serviceIconEmergency, desc: '24/7 rapid response and critical care for urgent medical situations, supported by experienced emergency physicians.' },
        { title: 'Laboratory Testing', icon: serviceIconLab, desc: 'Accurate and timely diagnostic lab tests, including blood work, pathology, and microbiology, with quick results.' },
        { title: 'Pharmacy Services', icon: serviceIconPharmacy, desc: 'A well-stocked pharmacy providing prescription medications, over-the-counter drugs, and expert pharmaceutical advice.' },
        { title: 'Radiology & Imaging', icon: serviceIconRadiology, desc: 'Advanced diagnostic imaging services including X-rays, MRI, CT scans, and ultrasound for precise medical insights.' },
        { title: 'Advanced Surgery', icon: serviceIconSurgery, desc: 'Expert surgical procedures across various specialties, utilizing modern techniques for optimal patient outcomes.' },
        { title: 'Maternity Care', icon: serviceIconMaternity, desc: 'Compassionate prenatal, delivery, and postnatal care for mothers and newborns, ensuring a safe and joyful experience.' },
        { title: 'Wellness & Prevention', icon: serviceIconMaternity, desc: 'Programs focused on health education, disease prevention, and wellness promotion for a healthier community.' },
    ];

    return (
        <div className="home-page overflow-x-hidden">
            <header className="fixed w-full bg-white shadow-lg z-50 py-3 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center space-x-3">
                    <Link to="/" className="flex items-center space-x-2 animate-fadeInLeft">
                        <img src={afyalinkLogo} alt="AfyaLink Logo" className="h-10 md:h-12" />
                        <span className="text-2xl md:text-3xl font-extrabold text-blue-800">AfyaLink HMS</span>
                    </Link>
                </div>
                <nav className="hidden md:flex space-x-7">
                    <Link to="/" className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200">Home</Link>
                    <Link to="/about" className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200">About Us</Link>
                    <Link to="/services" className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200">Services</Link>
                    <Link to="/departments" className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200">Departments</Link>
                    <button
                        onClick={() => appointmentRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition duration-200"
                    >
                        Book Appointment
                    </button>
                    <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-semibold transition duration-200">Contact Us</Link>
                </nav>
                <div className="md:flex hidden items-center space-x-4">
                    {currentUser ? (
                        <Link to="/dashboard" className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition duration-300 shadow-md">
                            Dashboard
                        </Link>
                    ) : (
                        <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition duration-300 shadow-md">
                            Login
                        </Link>
                    )}
                </div>
                <button className="md:hidden text-gray-700 focus:outline-none">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </header>
            <main className="pt-[76px]">
                <section className="hero-section relative h-screen flex items-center justify-center text-white overflow-hidden">
                    <video
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        autoPlay loop muted playsInline poster={heroBannerImage}>
                        <source src={heroBannerVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent opacity-70 z-10"></div>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative z-20 text-center p-4 max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
                            Your Health, <span className="text-blue-300">Our Priority</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-10 font-light text-blue-100">
                            Providing compassionate, advanced, and patient-centered healthcare services right here in Rongai, Nakuru County.
                        </p>
                        <motion.button
                            onClick={() => appointmentRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-green-500 text-white text-xl px-10 py-4 rounded-full hover:bg-green-600 transition duration-300 transform hover:scale-105 shadow-lg font-semibold"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Book Appointment Today
                        </motion.button>
                        <Link to="/register" className="ml-4 text-white text-xl px-10 py-4 border-2 border-white rounded-full hover:bg-white hover:text-blue-700 transition duration-300 transform hover:scale-105 shadow-lg font-semibold">
                            Register as a Patient
                        </Link>
                    </motion.div>
                </section>

                <section ref={servicesRef} className="py-20 bg-gray-50">
                    <motion.div
                        className="container mx-auto px-6" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-14">Our Comprehensive Healthcare Services</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {services.map((service, index) => (
                                <motion.div
                                    key={index} className="bg-white rounded-xl shadow-lg p-7 text-center transform hover:scale-[1.02] transition duration-300 ease-out border border-gray-100 group" variants={itemVariants}>
                                    <img src={service.icon} alt={service.title} className="w-16 h-16 mx-auto mb-5 transition-transform duration-300 group-hover:rotate-6" />
                                    <h3 className="text-2xl font-semibold text-blue-700 mb-3">{service.title}</h3>
                                    <p className="text-gray-600 mb-5 text-sm leading-relaxed">{service.desc}</p>
                                    <Link to={`/services/${service.title.toLowerCase().replace(/\s/g, '-')}`} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group-hover:underline transition duration-200">
                                        Learn More
                                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                <section ref={appointmentRef} className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${bgDoctors})` }}></div>
                    <motion.div
                        className="container mx-auto px-6 relative z-10" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-14">Book Your Appointment Instantly</h2>
                        <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl max-w-3xl mx-auto text-gray-800 border-t-4 border-blue-500">
                            <form onSubmit={handleAppointmentSubmit} className="space-y-7">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="department" className="block text-lg font-medium text-gray-700 mb-2">Select Department</label>
                                        <select
                                            id="department" name="department" value={appointmentForm.department} onChange={handleAppointmentChange}
                                            className="form-select mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" required>
                                            <option value="">-- Choose Department --</option>
                                            {departments.map((dept, index) => (<option key={index} value={dept.name}>{dept.name}</option>))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="doctor" className="block text-lg font-medium text-gray-700 mb-2">Preferred Doctor (Optional)</label>
                                        <select
                                            id="doctor" name="doctor" value={appointmentForm.doctor} onChange={handleAppointmentChange}
                                            className="form-select mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base">
                                            <option value="">-- Any Doctor --</option>
                                            {doctors.filter(doc => !appointmentForm.department || doc.specialization.includes(appointmentForm.department.split(' ')[0])).map(doc => (
                                                    <option key={doc.id} value={doc.name}>{doc.name} ({doc.specialization})</option>))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="date" className="block text-lg font-medium text-gray-700 mb-2">Desired Date</label>
                                        <input
                                            type="date" id="date" name="date" value={appointmentForm.date} onChange={handleAppointmentChange}
                                            min={new Date().toISOString().split('T')[0]} className="form-input mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" required/>
                                    </div>
                                    <div>
                                        <label htmlFor="time" className="block text-lg font-medium text-gray-700 mb-2">Desired Time</label>
                                        <input
                                            type="time" id="time" name="time" value={appointmentForm.time} onChange={handleAppointmentChange}
                                            className="form-input mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" required/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">Your Full Name</label>
                                        <input
                                            type="text" id="name" name="name" value={appointmentForm.name} onChange={handleAppointmentChange}
                                            className="form-input mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="e.g., Jane Doe" required/>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email" id="email" name="email" value={appointmentForm.email} onChange={handleAppointmentChange}
                                            className="form-input mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="e.g., jane.doe@example.com" required/>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-lg font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel" id="phone" name="phone" value={appointmentForm.phone} onChange={handleAppointmentChange}
                                        className="form-input mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="e.g., +254 712 345 678" required/>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                    <label htmlFor="captcha" className="block text-lg font-medium text-gray-700">Enter CAPTCHA:</label>
                                    <div className="font-bold text-blue-700 text-3xl tracking-widest bg-blue-100 px-5 py-2 rounded-lg select-none border border-blue-300">
                                        {captchaValue}
                                    </div>
                                    <input
                                        type="text" id="captcha" name="captcha" value={captchaInput} onChange={handleCaptchaInputChange}
                                        className="form-input flex-grow border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" placeholder="Type characters here" required/>
                                </div>
                                {formMessage.text && (
                                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                        className={`mt-4 text-center font-medium ${formMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                        {formMessage.text}
                                    </motion.p>
                                )}
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition duration-300 text-xl font-semibold shadow-md transform hover:scale-[1.01]">
                                    Submit Appointment Request
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </section>

                <section ref={departmentsRef} className="py-20 bg-white">
                    <motion.div
                        className="container mx-auto px-6" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-14">Explore Our Specialized Departments</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {departments.map((dept, index) => (
                                <motion.div
                                    key={index} className="bg-blue-50 rounded-xl shadow-lg p-6 text-center transform hover:translate-y-[-5px] transition duration-300 ease-out border-t-4 border-blue-500" variants={itemVariants}>
                                    <div className="text-5xl mb-4 text-blue-700">{dept.icon}</div>
                                    <h3 className="text-2xl font-semibold text-blue-800 mb-2">{dept.name}</h3>
                                    <p className="text-gray-600 mb-4 text-sm">{dept.description}</p>
                                    <Link to={`/departments/${dept.name.toLowerCase().replace(/\s/g, '-')}`} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group">
                                        View Details
                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <Link to="/departments" className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition duration-300 text-lg font-semibold shadow-md transform hover:scale-[1.02]">
                                See All Departments
                            </Link>
                        </div>
                    </motion.div>
                </section>

                <section ref={doctorsRef} className="py-20 bg-blue-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${bgDoctors})` }}></div>
                    <motion.div
                        className="container mx-auto px-6 relative z-10" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-14">Meet Our Exceptional Medical Team</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {doctors.map(doctor => (
                                <motion.div
                                    key={doctor.id} className="bg-white rounded-xl shadow-lg p-7 text-center group transform hover:translate-y-[-5px] transition duration-300 ease-out border border-gray-100" variants={itemVariants}>
                                    <img
                                        src={doctor.photo} alt={doctor.name}
                                        className="w-32 h-32 rounded-full mx-auto mb-5 object-cover border-4 border-blue-300 group-hover:border-blue-500 transition duration-300"/>
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-1">{doctor.name}</h3>
                                    <p className="text-blue-600 font-medium mb-3 text-lg">{doctor.specialization}</p>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-5">{doctor.bio}</p>
                                    <Link to={doctor.link} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group">
                                        View Full Profile
                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <Link to="/doctors" className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition duration-300 text-lg font-semibold shadow-md transform hover:scale-[1.02]">
                                Meet All Our Specialists
                            </Link>
                        </div>
                    </motion.div>
                </section>

                <section className="py-20 bg-white">
                    <motion.div
                        className="container mx-auto px-6" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-14">Latest News & Health Insights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {newsItems.map(news => (
                                <motion.div
                                    key={news.id} className="bg-gray-50 rounded-xl shadow-lg p-6 group transform hover:translate-y-[-5px] transition duration-300 ease-out border border-gray-100" variants={itemVariants}>
                                    <p className="text-sm text-gray-500 mb-2">{news.date}</p>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-700 transition duration-200">{news.title}</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-5 line-clamp-3">{news.snippet}</p>
                                    <Link to={news.link} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group">
                                        Read More
                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <Link to="/news" className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition duration-300 text-lg font-semibold shadow-md transform hover:scale-[1.02]">
                                View All News & Articles
                            </Link>
                        </div>
                    </motion.div>
                </section>

                <section ref={testimonialsRef} className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${bgTestimonials})` }}></div>
                    <motion.div
                        className="container mx-auto px-6 relative z-10" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-14">Hear From Our Valued Patients</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {testimonials.map(testimonial => (
                                <motion.div
                                    key={testimonial.id} className="bg-white text-gray-800 rounded-xl shadow-xl p-7 flex flex-col items-center text-center border-t-4 border-yellow-400 transform hover:scale-[1.02] transition duration-300 ease-out" variants={itemVariants}>
                                    {testimonial.photo && (
                                        <img src={testimonial.photo} alt={testimonial.name} className="w-20 h-20 rounded-full object-cover mb-4 border-3 border-blue-200" />
                                    )}
                                    <div className="flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i} className={`w-6 h-6 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.374 2.45a1 1 00-.364 1.118l1.287 3.96c.3.921-.755 1.688-1.54 1.118l-3.374-2.45a1 1 00-1.176 0l-3.374 2.45c-.784.57-1.838-.197-1.539-1.118l1.287-3.96a1 1 00-.364-1.118L2.055 9.397c-.783-.57-.38-1.81.588-1.81h4.167a1 1 00.95-.69l1.286-3.96z" />
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

            <footer ref={contactRef} className="footer-section bg-gray-900 text-white py-16">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">Contact Us</h3>
                        <p className="mb-3 text-gray-300">123 AfyaLink Road, <br/>Rongai, Nakuru County, Kenya</p>
                        <p className="mb-3">Phone: <a href="tel:+254712345678" className="text-blue-400 hover:underline transition duration-200">+254 712 345 678</a></p>
                        <p className="mb-3">Email: <a href="mailto:info@afyalinkhms.com" className="text-blue-400 hover:underline transition duration-200">info@afyalinkhms.com</a></p>
                        <p className="mb-3">Open 24/7 for Emergencies</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">Emergency Services</h3>
                        <p className="text-red-400 text-4xl font-extrabold mb-3 leading-tight">📞 999</p>
                        <p className="text-lg text-gray-300 mb-4">Ambulance & Critical Care</p>
                        <p className="text-red-400 text-4xl font-extrabold mb-3 leading-tight">📞 112</p>
                        <p className="text-lg text-gray-300">General Emergency Hotline</p>
                    </div>

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

                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">Stay Connected</h3>
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
                                type="email" placeholder="Enter your email"
                                className="p-3 rounded-l-lg flex-grow bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" aria-label="Email for newsletter"/>
                            <button
                                type="submit" className="bg-blue-600 text-white px-5 py-3 rounded-r-lg hover:bg-blue-700 transition duration-300 font-semibold">
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