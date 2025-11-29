import React, { useState } from 'react';
import { apiService } from '../../services/api';
import styles from './Contact.module.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await apiService.submitContact({
                name: formData.name,
                email: formData.email,
                message: `Subject: ${formData.subject}\n\n${formData.message}`
            });

            setStatus({
                type: 'success',
                message: response.message || 'Thank you for contacting us! We will get back to you soon.'
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send message. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.contactSection} id="contact">
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <h2>Get in Touch</h2>
                    <p>Have questions about our AI services? We're here to help you transform your business.</p>
                </div>

                <div className={styles.contactWrapper}>
                    <div className={styles.contactInfo}>
                        <div className={styles.infoTitle}>
                            <h3>Contact Information</h3>
                            <p>Fill out the form and our team will get back to you within 24 hours.</p>
                        </div>

                        <div className={styles.infoItems}>
                            <div className={styles.item}>
                                <div className={styles.icon}>
                                    <i className="fas fa-phone-alt"></i>
                                </div>
                                <p>+91 9346315162</p>
                            </div>
                            <div className={styles.item}>
                                <div className={styles.icon}>
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <p>aidaddy.in@gmail.com</p>
                            </div>
                            <div className={styles.item}>
                                <div className={styles.icon}>
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <p>Hyderabad, Telangana, India</p>
                            </div>
                        </div>

                        <div className={styles.socialLinks}>
                            <a href="#" className={styles.socialIcon}><i className="fab fa-twitter"></i></a>
                            <a href="#" className={styles.socialIcon}><i className="fab fa-linkedin-in"></i></a>
                            <a href="#" className={styles.socialIcon}><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>

                    <div className={styles.contactForm}>
                        <form onSubmit={handleSubmit}>
                            {status.message && (
                                <div className={`${styles.statusMessage} ${styles[status.type]}`}>
                                    {status.message}
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    placeholder="How can we help?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Tell us about your project..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
