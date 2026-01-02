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
          <div className={styles.heroImage}>
            <div className={styles.animatedPerson}>
              {/* Animated Person Character */}
              <div className={styles.person}>
                <div className={styles.head}>
                  <div className={styles.face}>
                    <div className={styles.eyes}>
                      <div className={styles.eye}></div>
                      <div className={styles.eye}></div>
                    </div>
                    <div className={styles.smile}></div>
                  </div>
                </div>
                <div className={styles.body}>
                  <div className={styles.arm} id={styles.leftArm}></div>
                  <div className={styles.torso}>
                    <div className={styles.laptopContainer}>
                      <div className={styles.laptop}>
                        <div className={styles.screen}>
                          <div className={styles.codeEditor}>
                            {/* Code Lines */}
                            <div className={styles.codeLine} style={{ width: '70%', animationDelay: '0s' }}></div>
                            <div className={styles.codeLine} style={{ width: '85%', animationDelay: '0.3s' }}></div>
                            <div className={styles.codeLine} style={{ width: '60%', animationDelay: '0.6s' }}></div>
                            <div className={styles.codeLine} style={{ width: '75%', animationDelay: '0.9s' }}></div>
                            {/* Cursor */}
                            <div className={styles.cursor}></div>
                          </div>
                          {/* File Icons */}
                          <div className={styles.fileIcons}>
                            <div className={styles.fileIcon}>
                              <i className="fab fa-python"></i>
                            </div>
                            <div className={styles.fileIcon}>
                              <i className="fab fa-js"></i>
                            </div>
                            <div className={styles.fileIcon}>
                              <i className="fab fa-react"></i>
                            </div>
                          </div>
                        </div>
                        {/* Progress Indicator */}
                        <div className={styles.progressBar}>
                          <div className={styles.progress}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.arm} id={styles.rightArm}></div>
                </div>
                {/* Floating Action Icons */}
                <div className={`${styles.floatingIcon} ${styles.icon1}`} style={{ top: '10%', left: '5%' }}>
                  <i className="fas fa-code"></i>
                  <span className={styles.tooltip}>Coding</span>
                </div>
                <div className={`${styles.floatingIcon} ${styles.icon2}`} style={{ top: '20%', right: '10%' }}>
                  <i className="fas fa-cogs"></i>
                  <span className={styles.tooltip}>Building</span>
                </div>
                <div className={`${styles.floatingIcon} ${styles.icon3}`} style={{ bottom: '15%', left: '8%' }}>
                  <i className="fas fa-rocket"></i>
                  <span className={styles.tooltip}>Deploying</span>
                </div>
                <div className={`${styles.floatingIcon} ${styles.icon4}`} style={{ bottom: '25%', right: '5%' }}>
                  <i className="fas fa-check-double"></i>
                  <span className={styles.tooltip}>Testing</span>
                </div>

                {/* Project Status Indicators */}
                <div className={styles.projectStatus} style={{ top: '5%', right: '0%' }}>
                  <i className="fas fa-project-diagram"></i>
                  <span>Active Projects</span>
                  <div className={styles.statusDot}></div>
                </div>

                <div className={styles.projectStatus} style={{ bottom: '5%', left: '0%' }}>
                  <i className="fab fa-github"></i>
                  <span>Deploying...</span>
                  <div className={styles.loadingSpinner}></div>
                </div>

                {/* Animated Particles */}
                <div className={styles.particle} style={{ top: '30%', left: '15%' }}></div>
                <div className={styles.particle} style={{ top: '60%', right: '20%' }}></div>
                <div className={styles.particle} style={{ bottom: '40%', left: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
