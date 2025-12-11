import { useEffect } from 'react'
import Layout from '../components/layout/Layout'
import styles from './PrivacyPolicy.module.css'

function PrivacyPolicy() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <Layout>
            <div className={styles.privacyContainer}>
                <div className={styles.privacyContent}>
                    <h1>Privacy Policy</h1>
                    <p className={styles.lastUpdated}>Last Updated: December 1, 2025</p>

                    <div className={styles.intro}>
                        <p>
                            At Aidaddy, we are committed to protecting your privacy and ensuring the security of your personal information.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our
                            website and use our services.
                        </p>
                    </div>

                    <section className={styles.section}>
                        <h2>1. Information We Collect</h2>

                        <h3>1.1 Personal Information You Provide</h3>
                        <p>We collect information that you voluntarily provide to us when you:</p>
                        <ul>
                            <li>Fill out contact forms</li>
                            <li>Schedule meetings or consultations</li>
                            <li>Create an account</li>
                            <li>Subscribe to our newsletter</li>
                            <li>Communicate with us via email or other channels</li>
                        </ul>
                        <p>This information may include:</p>
                        <ul>
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Company name</li>
                            <li>Job title</li>
                            <li>Message content</li>
                            <li>Any other information you choose to provide</li>
                        </ul>

                        <h3>1.2 Automatically Collected Information</h3>
                        <p>When you visit our website, we may automatically collect certain information about your device and usage patterns, including:</p>
                        <ul>
                            <li>IP address</li>
                            <li>Browser type and version</li>
                            <li>Device type and operating system</li>
                            <li>Pages visited and time spent on pages</li>
                            <li>Referring website</li>
                            <li>Clickstream data</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>2. How We Use Your Information</h2>

                        <h3>2.1 Service Delivery</h3>
                        <ul>
                            <li>To provide, operate, and maintain our services</li>
                            <li>To schedule and conduct meetings and consultations</li>
                            <li>To respond to your inquiries and provide customer support</li>
                            <li>To send you confirmations, updates, and service-related communications</li>
                        </ul>

                        <h3>2.2 Business Operations</h3>
                        <ul>
                            <li>To improve and optimize our website and services</li>
                            <li>To understand how users interact with our platform</li>
                            <li>To develop new features and services</li>
                            <li>To conduct research and analysis</li>
                        </ul>

                        <h3>2.3 Communication</h3>
                        <ul>
                            <li>To send you newsletters, marketing materials, and promotional content (with your consent)</li>
                            <li>To notify you about changes to our services or policies</li>
                            <li>To provide updates about scheduled meetings or consultations</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. How We Share Your Information</h2>
                        <p className={styles.highlight}>We do not sell your personal information to third parties.</p>

                        <p>We may share your information in the following circumstances:</p>

                        <h3>3.1 Service Providers</h3>
                        <p>We may share your information with third-party service providers who assist us in:</p>
                        <ul>
                            <li>Hosting and maintaining our website</li>
                            <li>Email delivery services</li>
                            <li>Analytics and data analysis</li>
                            <li>Payment processing</li>
                            <li>Customer relationship management</li>
                        </ul>

                        <h3>3.2 Legal Requirements</h3>
                        <p>We may disclose your information if required to do so by law or in response to:</p>
                        <ul>
                            <li>Court orders or legal processes</li>
                            <li>Government requests or investigations</li>
                            <li>Protection of our legal rights or property</li>
                            <li>Prevention of fraud or illegal activities</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Data Retention</h2>
                        <p>
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy,
                            unless a longer retention period is required or permitted by law.
                        </p>
                        <p>Specific retention periods:</p>
                        <ul>
                            <li><strong>Contact Form Submissions</strong>: Retained for up to 3 years</li>
                            <li><strong>Meeting Records</strong>: Retained for up to 2 years after the meeting date</li>
                            <li><strong>Account Information</strong>: Retained until you request deletion or until the account is inactive for 3 years</li>
                            <li><strong>Analytics Data</strong>: Aggregated data may be retained indefinitely</li>
                        </ul>
                    </section>

                    {/* <section className={styles.section}>
                        <h2>5. Your Rights and Choices</h2>
                        <p>Depending on your location, you may have the following rights regarding your personal information:</p>

                        <div className={styles.rightsGrid}>
                            <div className={styles.rightCard}>
                                <h4>🔍 Access and Portability</h4>
                                <p>Right to access and receive a copy of your personal information</p>
                            </div>
                            <div className={styles.rightCard}>
                                <h4>✏️ Correction and Update</h4>
                                <p>Right to request correction of inaccurate information</p>
                            </div>
                            <div className={styles.rightCard}>
                                <h4>🗑️ Deletion</h4>
                                <p>Right to request deletion of your personal information</p>
                            </div>
                            <div className={styles.rightCard}>
                                <h4>🚫 Restriction</h4>
                                <p>Right to restrict or object to certain processing activities</p>
                            </div>
                            <div className={styles.rightCard}>
                                <h4>📧 Opt-Out</h4>
                                <p>Right to opt out of marketing communications</p>
                            </div>
                            <div className={styles.rightCard}>
                                <h4>⚖️ Lodge a Complaint</h4>
                                <p>Right to lodge a complaint with a supervisory authority</p>
                            </div>
                        </div>
                    </section> */}

                    <section className={styles.section}>
                        <h2>6. Cookies and Tracking Technologies</h2>
                        <p>We use cookies and similar tracking technologies to enhance your experience on our website.</p>

                        <h3>Types of Cookies We Use:</h3>
                        <ul>
                            <li><strong>Essential Cookies</strong>: Necessary for the website to function properly</li>
                            <li><strong>Analytics Cookies</strong>: Help us understand how visitors use our website</li>
                            <li><strong>Functional Cookies</strong>: Enable enhanced functionality and personalization</li>
                            <li><strong>Marketing Cookies</strong>: Used to deliver relevant advertisements (with your consent)</li>
                        </ul>

                        <p>You can control and manage cookies through your browser settings.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational security measures to protect your personal information.
                            Security measures include:
                        </p>
                        <ul>
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security assessments and audits</li>
                            <li>Access controls and authentication</li>
                            <li>Employee training on data protection</li>
                            <li>Secure backup and disaster recovery procedures</li>
                        </ul>
                        <p className={styles.disclaimer}>
                            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive
                            to protect your information, we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Children's Privacy</h2>
                        <p>
                            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal
                            information from children. If we become aware that we have collected information from a child without
                            parental consent, we will take steps to delete that information promptly.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. International Data Transfers</h2>
                        <p>
                            Your information may be transferred to and processed in countries other than your country of residence.
                            When we transfer your information internationally, we take appropriate safeguards to ensure your data
                            remains protected.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                            legal requirements, or other factors. We will notify you of any material changes by posting the updated
                            Privacy Policy on our website and updating the "Last Updated" date.
                        </p>
                        <p>
                            Your continued use of our services after changes become effective constitutes acceptance of the updated
                            Privacy Policy.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>11. Contact Information</h2>
                        <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
                        <div className={styles.contactInfo}>
                            <p><strong>Email</strong>: privacy@aidaddy.com or support@aidaddy.com</p>
                            <p><strong>Website</strong>: https://aidaddy.com</p>
                        </div>
                        <p className={styles.note}>
                            For privacy-related inquiries, please include "Privacy Request" in the subject line to ensure prompt handling.
                        </p>
                    </section>

                    <div className={styles.acknowledgment}>
                        <p>
                            <strong>
                                By using Aidaddy's services, you acknowledge that you have read and understood this Privacy Policy
                                and agree to the collection, use, and disclosure of your information as described herein.
                            </strong>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PrivacyPolicy
