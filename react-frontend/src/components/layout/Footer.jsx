import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer} id="contact">
            <div className={styles.container}>
                <div className={styles.footerContent}>
                    <div className={styles.footerColumn}>
                        <h3>About Aidaddy</h3>
                        <p>We provide cutting-edge AI solutions to help businesses automate, optimize, and grow. Our team of experts is dedicated to delivering innovative AI services tailored to your needs.</p>
                        <div className={styles.socialLinks}>
                            <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>

                    <div className={styles.footerColumn}>
                        <h3>Quick Links</h3>
                        <ul className={styles.footerLinks}>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#services">Services</a></li>
                            <li><a href="#features">Features</a></li>
                            <li><a href="/get-started">Get Started</a></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className={styles.footerColumn}>
                        <h3>Services</h3>
                        <ul className={styles.footerLinks}>
                            <li><a href="#services">AI Consulting</a></li>
                            <li><a href="#services">Machine Learning</a></li>
                            <li><a href="#services">Data Analytics</a></li>
                            <li><a href="#services">Automation</a></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.copyright}>
                    <p>&copy; 2025-2026 Aidaddy.in. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
