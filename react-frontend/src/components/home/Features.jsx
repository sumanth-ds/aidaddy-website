import React from 'react';
import styles from './Features.module.css';

const featuresData = [
    {
        icon: 'fa-rocket',
        title: 'Fast Implementation',
        description: 'Quick deployment of AI solutions with minimal disruption to your operations. We deliver results in weeks, not months.'
    },
    {
        icon: 'fa-shield-halved',
        title: 'Secure & Reliable',
        description: 'Enterprise-grade security and reliability for your peace of mind. GDPR compliant and data encryption included.'
    },
    {
        icon: 'fa-brain',
        title: 'AI Expertise',
        description: 'Our team consists of PhD-level AI researchers and experienced engineers with proven track records.'
    },
    {
        icon: 'fa-hand-holding-dollar',
        title: 'Cost-Effective',
        description: 'Get maximum ROI with our optimized AI solutions. Flexible pricing models for businesses of all sizes.'
    },
    {
        icon: 'fa-arrows-rotate',
        title: 'Continuous Innovation',
        description: 'We stay ahead of the curve with cutting-edge AI research and emerging technologies.'
    },
    {
        icon: 'fa-check-circle',
        title: 'Proven Results',
        description: 'Track record of successful AI implementations across various industries with measurable outcomes.'
    },
    {
        icon: 'fa-clock',
        title: '24/7 Support',
        description: 'Round-the-clock assistance from our dedicated support team. We are always here to help.'
    },
    {
        icon: 'fa-chart-line',
        title: 'Scalable Solutions',
        description: 'Solutions that grow with your business. From startup to enterprise, we scale with your needs.'
    }
];

const Features = () => {
    return (
        <section className={styles.features} id="features">
            <div className={styles.container}>
                <div className={styles.sectionTitle}>
                    <h2>Why Choose Kyvanta Innovations?</h2>
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
