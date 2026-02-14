import React, { useState } from 'react';
import styles from './Services.module.css';

const servicesData = [
    {
        icon: 'fa-lightbulb',
        title: 'AI Innovation Solutions',
        description: 'We design and develop innovative AI-driven technologies that transform business operations, improve decision-making, and create competitive advantages.',
        details: 'Our innovation solutions focus on cutting-edge AI technologies that help businesses stay ahead of the competition. We work closely with your team to identify opportunities for AI-driven transformation and deliver custom solutions that address your unique business challenges.',
        examples: [
            'AI-powered automation systems for workflow optimization',
            'Intelligent data analytics platforms for better insights',
            'Predictive modeling and forecasting tools',
            'Industry-specific AI applications'
        ]
    },
    {
        icon: 'fa-rocket',
        title: 'AI Software Solutions',
        description: 'We build scalable, secure, and high-performance AI software tailored to business needs.',
        details: 'From concept to deployment, we create robust AI-powered software solutions that scale with your business. Our team combines deep technical expertise with industry knowledge to deliver products that drive real business value.',
        examples: [
            'Machine Learning applications for business processes',
            'Natural Language Processing (NLP) systems',
            'Computer Vision solutions for visual analysis',
            'AI-powered SaaS platforms'
        ]
    },
    {
        icon: 'fa-cogs',
        title: 'AI Software Services',
        description: 'We provide end-to-end AI services to help organizations adopt and scale artificial intelligence.',
        details: 'Our comprehensive AI services cover the entire lifecycle of AI adoption - from initial strategy and consulting to deployment, integration, and ongoing optimization. We ensure your AI initiatives deliver measurable business outcomes.',
        examples: [
            'AI consulting and strategy development',
            'Data engineering and preparation',
            'AI model training and deployment',
            'Maintenance and optimization services'
        ]
    },
    {
        icon: 'fa-brain',
        title: 'Custom AI Model Development',
        description: 'We develop custom AI models tailored to your specific business requirements and data.',
        details: 'Every business is unique, and so should be your AI solutions. Our team builds custom machine learning models trained on your specific data to solve your most challenging problems.',
        examples: [
            'Custom model architecture design',
            'Domain-specific training data curation',
            'Model fine-tuning and optimization',
            'Continuous learning and improvement'
        ]
    },
    {
        icon: 'fa-comments',
        title: 'AI Chatbots & Virtual Assistants',
        description: 'Intelligent conversational AI that enhances customer experience and automates support.',
        details: 'Transform your customer service with AI-powered chatbots and virtual assistants that understand context, intent, and can handle complex conversations. Available 24/7 to support your customers.',
        examples: [
            'Customer support automation',
            'Lead qualification and nurturing',
            'Internal knowledge assistants',
            'Multi-language support'
        ]
    },
    {
        icon: 'fa-chart-line',
        title: 'Enterprise AI Integration',
        description: 'Seamless integration of AI capabilities into your existing enterprise systems.',
        details: 'We help you leverage AI across your entire organization by integrating intelligent capabilities into your existing systems, workflows, and processes. Connect AI with your CRM, ERP, and other enterprise tools.',
        examples: [
            'Legacy system modernization',
            'API-based AI services integration',
            'Cloud-based AI implementation',
            'AI performance monitoring'
        ]
    },
    {
        icon: 'fa-eye',
        title: 'Computer Vision Solutions',
        description: 'Advanced visual AI that enables machines to interpret and understand images and videos.',
        details: 'From object detection to facial recognition, our computer vision solutions help businesses automate visual tasks, improve safety, and extract valuable insights from images and video data.',
        examples: [
            'Object detection and classification',
            'Facial recognition systems',
            'Quality control in manufacturing',
            'Video analytics and monitoring'
        ]
    },
    {
        icon: 'fa-chart-pie',
        title: 'Predictive Analytics',
        description: 'Turn your historical data into accurate predictions and actionable business insights.',
        details: 'Our predictive analytics solutions help you forecast trends, anticipate customer behavior, and make data-driven decisions. Stay ahead of the curve with accurate predictions powered by advanced ML algorithms.',
        examples: [
            'Sales forecasting',
            'Customer churn prediction',
            'Demand planning and inventory optimization',
            'Risk assessment modeling'
        ]
    },
    {
        icon: 'fa-language',
        title: 'Natural Language Processing',
        description: 'Advanced NLP solutions that enable machines to understand, interpret, and generate human language.',
        details: 'Unlock the power of text data with our NLP solutions. From sentiment analysis to text generation, we help you extract insights and automate language-based processes.',
        examples: [
            'Sentiment analysis',
            'Text classification and categorization',
            'Document summarization',
            'Language translation services'
        ]
    }
];

const Services = () => {
    const [expandedService, setExpandedService] = useState(null);

    const toggleService = (index) => {
        setExpandedService(expandedService === index ? null : index);
    };

    return (
        <section className={styles.services} id="services">
            <div className={styles.container}>
                <div className={styles.sectionTitle}>
                    <h2>Our Services</h2>
                    <p>AI solutions that make sense for your business - no tech degree required</p>
                </div>
                <div className={styles.servicesGrid}>
                    {servicesData.map((service, index) => (
                        <div
                            key={index}
                            className={`${styles.serviceCard} ${expandedService === index ? styles.expanded : ''}`}
                        >
                            <div className={styles.serviceIcon}>
                                <i className={`fas ${service.icon}`}></i>
                            </div>
                            <h3>{service.title}</h3>
                            <p className={styles.shortDescription}>{service.description}</p>

                            <button
                                className={styles.learnMoreBtn}
                                onClick={() => toggleService(index)}
                            >
                                {expandedService === index ? 'Show Less' : 'Learn More'}
                            </button>

                            {expandedService === index && (
                                <div className={styles.expandedContent}>
                                    <p className={styles.detailsText}>{service.details}</p>
                                    <div className={styles.examplesSection}>
                                        <h4>Real-World Applications:</h4>
                                        <ul className={styles.examplesList}>
                                            {service.examples.map((example, idx) => (
                                                <li key={idx}>
                                                    <i className="fas fa-check-circle"></i>
                                                    {example}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
