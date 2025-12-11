import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1>Transform Your Business with AI</h1>
            <p>Unlock the power of artificial intelligence to automate processes, gain insights, and drive growth for your business.</p>
            <div className={styles.heroButtons}>
              <Link to="/get-started" className={styles.ctaButton}>Get Started</Link>
              <a href="#services" className={styles.secondaryButton}>Learn More</a>
              <a href="https://agenti-frontend.vercel.app/" className={styles.secondaryButton}>Our Free Agent</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
