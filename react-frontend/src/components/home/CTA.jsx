import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CTA.module.css';

const CTA = () => {
    return (
        <section className={styles.ctaSection}>
            <div className={styles.container}>
                <h2>Ready to Transform Your Business?</h2>
                <p className={styles.subtitle}>Join hundreds of companies already using AI to drive growth and innovation.</p>
                <p className={styles.description}>
                    At Kyvanta Innovations, we help businesses leverage cutting-edge AI solutions
                    to automate processes, gain insights from data, and create competitive advantages.
                    Our expert team delivers tailored AI implementations that scale with your needs.
                </p>
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statNumber}>500+</span>
                        <span className={styles.statLabel}>Projects Delivered</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNumber}>98%</span>
                        <span className={styles.statLabel}>Client Satisfaction</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNumber}>50+</span>
                        <span className={styles.statLabel}>AI Experts</span>
                    </div>
                </div>
                <div className={styles.buttonGroup}>
                    <Link to="/get-started" className={styles.ctaButton}>Schedule a Meeting</Link>
                    <Link to="/services" className={styles.ctaButtonSecondary}>Explore Services</Link>
                </div>
            </div>
        </section>
    );
};

export default CTA;
