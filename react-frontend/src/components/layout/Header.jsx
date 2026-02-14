import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../../media/Kyvanta innovations Pvt Ltd.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const scrollToSection = (sectionId) => {
        if (location.pathname !== '/') {
            window.location.href = `/#${sectionId}`;
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setIsMenuOpen(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <nav className={styles.navbar}>
                    <Link to="/" className={styles.logo}>
                        <img src={logo} alt="Aidaddy Logo" className={styles.logoImage} />
                        <span className={styles.logoText}>Kyvanta Innovations</span>
                    </Link>

                    <div className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`} onClick={toggleMenu}>
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                    </div>

                    <ul className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
                        <li><a href="#home" onClick={() => scrollToSection('home')}>Home</a></li>
                        <li><a href="#services" onClick={() => scrollToSection('services')}>Services</a></li>
                        <li><a href="#features" onClick={() => scrollToSection('features')}>Features</a></li>
                        <li><Link to="/blog" onClick={() => setIsMenuOpen(false)}>Blog</Link></li>
                        <li><a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a></li>
                        <li><Link to="/get-started" className={styles.ctaButton}>Get Started</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
