import React from 'react';
import styles from './Services.module.css';

const servicesData = [
    {
        icon: 'fa-brain',
        title: 'AI Consulting',
        description: 'Expert guidance on implementing AI solutions tailored to your business needs and goals.'
    },
    {
        icon: 'fa-chart-line',
        title: 'Machine Learning',
        description: 'Build intelligent systems that learn and improve from experience without being explicitly programmed.'
    },
    {
        icon: 'fa-database',
        title: 'Data Analytics',
        description: 'Transform raw data into actionable insights to make informed business decisions.'
    },
    {
        icon: 'fa-robot',
        title: 'Process Automation',
        description: 'Automate repetitive tasks and workflows to increase efficiency and reduce costs.'
    },
    {
        icon: 'fa-comments',
        title: 'NLP Solutions',
        description: 'Natural language processing to understand and generate human language for better customer interactions.'
    },
    {
        icon: 'fa-eye',
        title: 'Computer Vision',
        description: 'Enable machines to interpret and understand visual information from the world.'
    }
];

const Services = () => {
    return (
        <section className={styles.services} id="services">
            <div className={styles.container}>
                <div className={styles.sectionTitle}>
                    <h2>Our Services</h2>
                    <p>Comprehensive AI solutions to transform your business</p>
                </div>
                <div className={styles.servicesGrid}>
                    {servicesData.map((service, index) => (
                        <div key={index} className={styles.serviceCard}>
                            <div className={styles.serviceIcon}>
                                <i className={`fas ${service.icon}`}></i>
                            </div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
