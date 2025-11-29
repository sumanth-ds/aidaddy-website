import React from 'react';
import styles from './Features.module.css';

const featuresData = [
    {
        icon: 'fa-bolt',
        title: 'Fast Implementation',
        description: 'Quick deployment of AI solutions with minimal disruption to your operations.'
    },
    {
        icon: 'fa-shield-halved',
        title: 'Secure & Reliable',
        description: 'Enterprise-grade security and reliability for your peace of mind.'
    },
    {
        icon: 'fa-users',
        title: 'Expert Support',
        description: '24/7 support from our team of AI specialists and engineers.'
    },
    {
        icon: 'fa-chart-simple',
        title: 'Scalable Solutions',
        description: 'Solutions that grow with your business needs and requirements.'
    }
];

const Features = () => {
    return (
        <section className={styles.features} id="features">
            <div className={styles.container}>
                <div className={styles.sectionTitle}>
                    <h2>Why Choose Aidaddy?</h2>
                    <p>Experience the benefits of working with AI experts</p>
                </div>
                <div className={styles.featureList}>
                    {featuresData.map((feature, index) => (
                        <div key={index} className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                                <i className={`fas ${feature.icon}`}></i>
                            </div>
                            <div className={styles.featureText}>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
