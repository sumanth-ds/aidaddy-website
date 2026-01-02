import React from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import FreeTrial from '../components/home/FreeTrial';
import Features from '../components/home/Features';
import Contact from '../components/home/Contact';
import CTA from '../components/home/CTA';

const Home = () => {
    return (
        <Layout>
            <Hero />
            <Services />
            <FreeTrial />
            <Features />
            <Contact />
            <CTA />
        </Layout>
    );
};

export default Home;
