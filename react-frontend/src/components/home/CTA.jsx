import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CTA.module.css';

const CTA = () => {
    return (
        <section className={styles.ctaSection}>
            <div className={styles.container}>
                <h2>Ready to Transform Your Business?</h2>
                <p>Join hundreds of companies already using AI to drive growth and innovation.</p>
                <Link to="/get-started" className={styles.ctaButton}>Schedule a Meeting</Link>
            </div>
        </section>
    );
};

export default CTA;
