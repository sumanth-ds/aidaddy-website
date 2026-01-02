import React, { useState } from 'react';
import styles from './Services.module.css';

const servicesData = [
    {
        icon: 'fa-lightbulb',
        title: 'AI Solutions Development',
        description: 'Smart systems that work for you 24/7, automating tasks and making intelligent decisions for your business.',
        details: 'Imagine having a digital assistant that never sleeps - one that handles repetitive work, makes smart recommendations, and helps your team focus on what matters. We build custom systems that understand your business processes and work seamlessly with your existing tools.',
        examples: [
            'Auto-respond to customer emails based on context',
            'Smart document processing that extracts and organizes information',
            'Automated report generation from your business data',
            'Intelligent routing of customer requests to the right team'
        ]
    },
    {
        icon: 'fa-chart-line',
        title: 'Machine Learning Engineering',
        description: 'Systems that learn from your data to predict trends, spot patterns, and make recommendations - like having a crystal ball for your business.',
        details: 'Think of it as teaching computers to recognize patterns the way humans do - but faster and more consistently. These systems analyze your historical data to predict future outcomes, helping you make proactive decisions instead of reactive ones.',
        examples: [
            'Predict which customers are likely to buy next month',
            'Forecast inventory needs before you run out',
            'Recommend products customers will love',
            'Detect unusual patterns that might indicate problems'
        ]
    },
    {
        icon: 'fa-comments',
        title: 'Natural Language Processing',
        description: 'Systems that understand and respond to human language - making your business accessible through conversation.',
        details: 'Enable your business to communicate naturally with customers through chat, email, or voice. These systems understand context, sentiment, and intent - just like a well-trained customer service representative would.',
        examples: [
            'Chatbots that answer customer questions instantly',
            'Analyze customer reviews to understand satisfaction',
            'Extract key information from contracts and invoices',
            'Automatically categorize support tickets'
        ]
    },
    {
        icon: 'fa-magic',
        title: 'Generative AI Solutions',
        description: 'AI that creates content for you - from writing product descriptions to summarizing lengthy reports.',
        details: 'Like having a creative assistant that can write, summarize, and translate at scale. Perfect for businesses that need to produce consistent, high-quality content quickly or process large volumes of text.',
        examples: [
            'Generate product descriptions for your catalog',
            'Summarize long documents into key points',
            'Create personalized email campaigns',
            'Build knowledge bases from existing documents'
        ]
    },
    {
        icon: 'fa-chart-bar',
        title: 'AI for Business Analytics',
        description: 'Turn your data into clear insights and predictions - see what\'s happening now and what\'s coming next.',
        details: 'Stop drowning in spreadsheets. Get clear, visual dashboards that show you what matters most. Our systems monitor your key metrics, alert you to issues, and help you understand the "why" behind the numbers.',
        examples: [
            'Real-time dashboards showing business health',
            'Predict sales trends for better planning',
            'Identify which marketing campaigns work best',
            'Spot opportunities for cost savings'
        ]
    },
    {
        icon: 'fa-eye',
        title: 'Deep Learning Projects',
        description: 'Advanced visual recognition and complex problem-solving - teaching computers to see and understand like humans do.',
        details: 'Perfect for businesses that work with images, videos, or complex visual data. These systems can identify, classify, and analyze visual content at scale - doing in seconds what would take humans hours.',
        examples: [
            'Automatically sort and categorize product images',
            'Detect defects in manufacturing',
            'Recognize faces for security or attendance',
            'Extract text from photos and scanned documents'
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
