import React from 'react';
import { Link } from 'react-router-dom';
import styles from './FreeTrial.module.css';

const FreeTrial = () => {
    return (
        <section className={styles.freeTrial} id="free-trial">
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.badge}>
                        <i className="fas fa-gift"></i>
                        <span>Limited Time Offer</span>
                    </div>

                    <h2>Try Our Services Risk-Free</h2>
                    <p className={styles.subtitle}>
                        Get a FREE small project to experience the quality of our AI solutions firsthand
                    </p>

                    <div className={styles.offerBox}>
                        <div className={styles.offerHeader}>
                            <div className={styles.icon}>
                                <i className="fas fa-rocket"></i>
                            </div>
                            <h3>Free Small Project Trial</h3>
                        </div>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <strong>Project Duration:</strong>
                                    <span>10-15 days completion timeline</span>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <strong>Full Development Cycle:</strong>
                                    <span>Analysis, development, testing & deployment</span>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <strong>Professional Quality:</strong>
                                    <span>Same quality standards as paid projects</span>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <strong>No Credit Card Required:</strong>
                                    <span>Zero risk, just results</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.projectTypes}>
                            <h4>What qualifies as a small project?</h4>
                            <div className={styles.examples}>
                                <div className={styles.example}>
                                    <i className="fas fa-robot"></i>
                                    <span>Simple chatbot integration</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-database"></i>
                                    <span>Data analysis dashboard</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-chart-pie"></i>
                                    <span>Basic ML model implementation</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-file-alt"></i>
                                    <span>Document processing automation</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.disclaimer}>
                            <i className="fas fa-info-circle"></i>
                            <p>
                                This free trial is available for first-time clients only. Project scope must be approved
                                and meet our small project criteria. See our <Link to="/terms">Terms & Conditions</Link> for details.
                            </p>
                        </div>

                        <div className={styles.ctaButtons}>
                            <Link to="/get-started" className={styles.primaryBtn}>
                                <i className="fas fa-paper-plane"></i>
                                Claim Your Free Project
                            </Link>
                            <a href="#contact" className={styles.secondaryBtn}>
                                <i className="fas fa-comments"></i>
                                Discuss Your Idea
                            </a>
                        </div>
                    </div>

                    <div className={styles.testimonial}>
                        <div className={styles.quote}>
                            <i className="fas fa-quote-left"></i>
                            <p>
                                "The free trial project gave us complete confidence in Aidaddy's capabilities.
                                They delivered exactly what they promised, on time and with exceptional quality."
                            </p>
                            <div className={styles.author}>
                                <div className={styles.stars}>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                                <span>— Previous Trial Client</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FreeTrial;
