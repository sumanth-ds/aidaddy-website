import { useEffect } from 'react'
import Layout from '../components/layout/Layout'
import styles from './TermsAndConditions.module.css'

function TermsAndConditions() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <Layout>
            <div className={styles.termsContainer}>
                <div className={styles.termsContent}>
                    <h1>Terms and Conditions</h1>
                    <p className={styles.lastUpdated}>Last Updated: December 1, 2025</p>

                    <div className={styles.intro}>
                        <p>
                            Welcome to Aidaddy! These Terms and Conditions ("Terms") govern your access to and use of the Aidaddy website,
                            services, and AI-powered solutions (collectively, the "Services"). By accessing or using our Services, you agree
                            to be bound by these Terms.
                        </p>
                    </div>

                    <section className={styles.section}>
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing, browsing, or using the Aidaddy platform, you acknowledge that you have read, understood, and agree
                            to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our Services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Description of Services</h2>
                        <p>
                            Aidaddy provides AI-powered business solutions, consulting services, and technology implementation support.
                            Our Services include but are not limited to:
                        </p>
                        <ul>
                            <li>AI consulting and strategy development</li>
                            <li>Custom AI solution implementation</li>
                            <li>Business process automation</li>
                            <li>Meeting scheduling and consultation services</li>
                            <li>Educational resources and demonstrations</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. User Eligibility</h2>
                        <p>
                            You must be at least 18 years of age to use our Services. By using our Services, you represent and warrant
                            that you meet this age requirement and have the legal capacity to enter into these Terms.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>4. User Accounts and Registration</h2>

                        <h3>4.1 Account Creation</h3>
                        <p>Some features of our Services may require you to create an account or provide personal information. You agree to:</p>
                        <ul>
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and update your information to keep it accurate</li>
                            <li>Maintain the security and confidentiality of your account credentials</li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                        </ul>

                        <h3>4.2 Account Responsibility</h3>
                        <p>
                            You are responsible for all activities that occur under your account. We are not liable for any loss or damage
                            arising from your failure to maintain account security.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Use of Services</h2>

                        <h3>5.1 Permitted Use</h3>
                        <p>You agree to use our Services only for lawful purposes and in accordance with these Terms. You may not:</p>
                        <ul>
                            <li>Use the Services in any way that violates applicable laws or regulations</li>
                            <li>Impersonate or attempt to impersonate Aidaddy or any other person or entity</li>
                            <li>Engage in any conduct that restricts or inhibits anyone's use of the Services</li>
                            <li>Introduce viruses, trojans, worms, or other malicious code</li>
                            <li>Attempt to gain unauthorized access to any portion of the Services</li>
                            <li>Use automated systems or software to extract data from the Services without our permission</li>
                        </ul>

                        <h3>5.2 Intellectual Property</h3>
                        <p>
                            All content, features, and functionality of the Services, including but not limited to text, graphics, logos,
                            images, software, and AI models, are owned by Aidaddy or its licensors and are protected by copyright, trademark,
                            and other intellectual property laws.
                        </p>
                    </section>
                    {/* 
                    <section className={styles.section}>
                        <h2>6. Meeting Scheduling and Consultations</h2>

                        <h3>6.1 Booking Process</h3>
                        <p>When you schedule a meeting through our platform:</p>
                        <ul>
                            <li>You agree to provide accurate contact information</li>
                            <li>Meeting slots are subject to availability and confirmation</li>
                            <li>We will send you confirmation and meeting link details via email</li>
                            <li>You are responsible for attending scheduled meetings at the agreed time</li>
                        </ul>

                        <h3>6.2 Cancellation and Rescheduling</h3>
                        <ul>
                            <li>Cancellation or rescheduling requests should be made at least 24 hours in advance</li>
                            <li>We reserve the right to reschedule meetings due to unforeseen circumstances</li>
                            <li>Repeated no-shows may result in restrictions on future booking privileges</li>
                        </ul>
                    </section> */}

                    <section className={styles.section}>
                        <h2>7. AI Services and Solutions</h2>

                        <h3>7.1 AI Accuracy</h3>
                        <p>
                            While we strive to provide accurate and reliable AI solutions, we do not guarantee that AI-generated outputs
                            will be error-free, complete, or suitable for your specific purposes. You acknowledge that AI technologies
                            have limitations and may produce unexpected results.
                        </p>

                        <h3>7.2 User Responsibility</h3>
                        <p>You are solely responsible for:</p>
                        <ul>
                            <li>Evaluating the suitability of AI solutions for your business needs</li>
                            <li>Verifying and validating AI-generated outputs before implementation</li>
                            <li>Compliance with applicable laws when using our AI services</li>
                            <li>Any decisions made based on AI recommendations or outputs</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Payment and Fees</h2>

                        <h3>8.1 Pricing</h3>
                        <p>
                            Pricing for our Services will be communicated to you during the consultation process.
                            All fees are in USD unless otherwise specified.
                        </p>

                        <h3>8.2 Payment Terms</h3>
                        <ul>
                            <li>Payment terms will be agreed upon before service delivery</li>
                            <li>All payments are non-refundable unless otherwise specified in writing</li>
                            <li>We reserve the right to modify our pricing with reasonable notice</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Privacy and Data Protection</h2>

                        <h3>9.1 Data Collection</h3>
                        <p>
                            We collect and process personal information as described in our Privacy Policy. By using our Services,
                            you consent to such collection and processing.
                        </p>

                        <h3>9.2 Data Security</h3>
                        <p>
                            We implement reasonable security measures to protect your data. However, no method of transmission over
                            the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>

                        <h3>9.3 Data Usage</h3>
                        <p>
                            We may use aggregated, anonymized data for analytics, service improvement, and AI model training purposes.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Third-Party Services</h2>
                        <p>
                            Our Services may contain links to third-party websites or integrate with third-party services. We are not
                            responsible for the content, privacy practices, or terms of service of any third-party sites or services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>11. Disclaimers and Limitations of Liability</h2>

                        <h3>11.1 Service Availability</h3>
                        <p>
                            We strive to maintain continuous availability of our Services but do not guarantee uninterrupted access.
                            Services may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
                        </p>

                        <h3>11.2 "AS IS" Basis</h3>
                        <p className={styles.important}>
                            OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                            INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                        </p>

                        <h3>11.3 Limitation of Liability</h3>
                        <p className={styles.important}>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, AIDADDY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                            CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED
                            TO YOUR USE OF THE SERVICES.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>12. Indemnification</h2>
                        <p>
                            You agree to indemnify, defend, and hold harmless Aidaddy, its officers, directors, employees, and agents
                            from any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising
                            out of or related to:
                        </p>
                        <ul>
                            <li>Your use of the Services</li>
                            <li>Your violation of these Terms</li>
                            <li>Your violation of any rights of another party</li>
                            <li>Your violation of applicable laws or regulations</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>13. Termination</h2>

                        <h3>13.1 Termination by You</h3>
                        <p>
                            You may stop using our Services at any time. If you have an account, you may request account deletion
                            by contacting us.
                        </p>

                        <h3>13.2 Termination by Us</h3>
                        <p>
                            We reserve the right to suspend or terminate your access to the Services at any time, with or without notice,
                            for any reason, including but not limited to:
                        </p>
                        <ul>
                            <li>Violation of these Terms</li>
                            <li>Fraudulent or illegal activities</li>
                            <li>Behavior that harms or could harm other users or our business</li>
                        </ul>

                        <h3>13.3 Effect of Termination</h3>
                        <p>
                            Upon termination, your right to use the Services will immediately cease. Provisions that by their nature
                            should survive termination shall survive, including but not limited to ownership provisions, warranty
                            disclaimers, and limitations of liability.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>14. Modifications to Terms</h2>
                        <p>We reserve the right to modify these Terms at any time. We will notify users of material changes by:</p>
                        <ul>
                            <li>Posting the updated Terms on our website</li>
                            <li>Updating the "Last Updated" date</li>
                            <li>Sending email notifications for significant changes (when applicable)</li>
                        </ul>
                        <p>
                            Your continued use of the Services after changes become effective constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>15. Governing Law and Dispute Resolution</h2>

                        <h3>15.1 Governing Law</h3>
                        <p>
                            These Terms shall be governed by and construed in accordance with applicable laws, without regard to
                            conflict of law provisions.
                        </p>

                        <h3>15.2 Dispute Resolution</h3>
                        <p>Any disputes arising out of or relating to these Terms or the Services shall be resolved through:</p>
                        <ol>
                            <li><strong>Informal Negotiation</strong>: First, we encourage you to contact us to resolve any issues informally</li>
                            <li><strong>Mediation</strong>: If informal resolution fails, disputes may be submitted to mediation</li>
                            <li><strong>Arbitration or Litigation</strong>: As a last resort, disputes may be resolved through binding arbitration or litigation in accordance with applicable laws</li>
                        </ol>
                    </section>

                    <section className={styles.section}>
                        <h2>16. Contact Information</h2>
                        <p>If you have any questions about these Terms and Conditions, please contact us:</p>
                        <div className={styles.contactInfo}>
                            <p><strong>Email</strong>: support@aidaddy.com</p>
                            <p><strong>Website</strong>: https://aidaddy.com</p>
                        </div>
                    </section>

                    <div className={styles.acknowledgment}>
                        <p>
                            <strong>
                                By using Aidaddy's Services, you acknowledge that you have read, understood, and agree to be bound
                                by these Terms and Conditions.
                            </strong>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default TermsAndConditions
