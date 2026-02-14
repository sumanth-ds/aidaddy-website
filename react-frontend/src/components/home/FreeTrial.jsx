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
                        Get a FREE small project to experience the quality of our AI solutions firsthand. No commitment, no credit card required.
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
                                    <strong>Dedicated Support:</strong>
                                    <span>Personal account manager & expert team</span>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <strong>No Credit Card Required:</strong>
                                    <span>Zero risk, just results</span>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <strong>Full Ownership:</strong>
                                    <span>You own all deliverables & source code</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.projectTypes}>
                            <h4>What qualifies as a small project?</h4>
                            <div className={styles.examples}>
                                <div className={styles.example}>
                                    <i className="fas fa-robot"></i>
                                    <span>AI Chatbot Development</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-database"></i>
                                    <span>Data Analysis Dashboard</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-brain"></i>
                                    <span>Machine Learning Model</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-file-alt"></i>
                                    <span>Document Automation</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-comments"></i>
                                    <span>NLP Integration</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-chart-line"></i>
                                    <span>Predictive Analytics</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-image"></i>
                                    <span>Computer Vision Solution</span>
                                </div>
                                <div className={styles.example}>
                                    <i className="fas fa-cogs"></i>
                                    <span>Process Automation</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.benefits}>
                            <h4>Why Claim Your Free Trial?</h4>
                            <div className={styles.benefitGrid}>
                                <div className={styles.benefitItem}>
                                    <i className="fas fa-trophy"></i>
                                    <span>Proven Expertise</span>
                                </div>
                                <div className={styles.benefitItem}>
                                    <i className="fas fa-clock"></i>
                                    <span>Quick Turnaround</span>
                                </div>
                                <div className={styles.benefitItem}>
                                    <i className="fas fa-hand-holding-dollar"></i>
                                    <span>100% Free</span>
                                </div>
                                <div className={styles.benefitItem}>
                                    <i className="fas fa-award"></i>
                                    <span>Premium Quality</span>
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
                                "The free trial project gave us complete confidence in Kyvanta Innovations' capabilities.
                                They delivered exactly what they promised, on time and with exceptional quality. We've since
                                partnered with them for multiple AI initiatives."
                            </p>
                            <div className={styles.author}>
                                <div className={styles.stars}>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                                <span>— CTO, Leading Tech Company</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FreeTrial;
