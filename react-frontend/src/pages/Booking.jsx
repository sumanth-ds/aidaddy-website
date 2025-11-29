import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import styles from './Booking.module.css';

const Booking = () => {
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [maxRetryAttempts, setMaxRetryAttempts] = useState(3);

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [view, setView] = useState('week'); // day, week, month
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        console.debug('Booking: mounted - initiating fetchSlots');
        let safetyTimer = setTimeout(() => {
            // If fetch hasn't resolved in 12s show friendly error and stop loader
            setLoading(false);
            setModal({ isOpen: true, type: 'error', title: 'Timeout', message: 'Fetching slots is taking too long. Please try again.' });
        }, 12000);
        fetchSlots().finally(() => clearTimeout(safetyTimer));

        return () => {
            clearTimeout(safetyTimer);
        };
    }, []);

    const fetchSlots = async (attempt = 1, maxAttempts = 3) => {
        setLoading(true);
        try {
            console.debug('Booking.fetchSlots: attempt', attempt);
            // Defensive logging: use Vite import.meta.env for build-time environment variables; avoid using `process` in browser runtime
            console.debug('fetchSlots: API_BASE_URL', import.meta.env?.VITE_API_BASE_URL, 'endpoint', API_ENDPOINTS?.AVAILABLE_SLOTS);

            const response = await apiService.getAvailableSlots();
            console.debug('Booking.fetchSlots: response received', response && { slots: response.slots && response.slots.length });
            const allSlots = response.slots || [];
            setSlots(allSlots);

            // If slots are returned but none fall in the current week that the user is viewing,
            // jump the calendar to the week that contains the first available slot so the user sees options immediately.
            if (allSlots.length > 0) {
                const firstSlotDate = new Date(allSlots[0].datetime);
                const weekStart = new Date(currentDate);
                const day = weekStart.getDay();
                const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
                weekStart.setDate(diff);
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                if (firstSlotDate < weekStart || firstSlotDate > weekEnd) {
                    setCurrentDate(firstSlotDate);
                    console.debug('Booking.fetchSlots: Jumping calendar to first available slot', firstSlotDate.toISOString());
                }
            }
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            console.error('Failed to fetch slots:', error, error.response || error.message);
            // Retry if possible
            if (attempt < maxAttempts) {
                const delay = 500 * attempt; // exponential backoff: 500ms, 1000ms, etc
                setTimeout(() => fetchSlots(attempt + 1, maxAttempts), delay);
            }
            const additional = error.toJSON ? JSON.stringify(error.toJSON()) : '';
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: (error.response?.data?.message || error.message || 'Failed to load available slots. Please try again.') + (additional ? `\nDetails: ${additional}` : ''),
            });
        } finally {
            console.debug('Booking.fetchSlots: finally - clearing loading');
            setLoading(false);
        }
    };

    const handleSlotClick = (slot) => {
        if (slot.available) {
            setSelectedSlot(slot);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSlot) {
            setModal({
                isOpen: true,
                type: 'warning',
                title: 'No Slot Selected',
                message: 'Please select a time slot before submitting.'
            });
            return;
        }

        setSubmitting(true);
        try {
            const response = await apiService.bookMeeting({
                name: formData.name,
                email: formData.email,
                datetime: selectedSlot.datetime
            });

            setModal({
                isOpen: true,
                type: 'success',
                title: 'Success!',
                message: response.message || 'Meeting request submitted successfully!'
            });

            // Reset form
            setFormData({ name: '', email: '' });
            setSelectedSlot(null);
            // Refresh slots
            fetchSlots();
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to book meeting. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const runDebugChecks = async () => {
        try {
            console.debug('Running debug checks: /debug/headers and /api/available-slots');
            const headersResp = await fetch('/debug/headers', { credentials: 'include' });
            const headersJson = await headersResp.json().catch(() => null);
            console.debug('/debug/headers response', headersResp.status, headersJson);
        } catch (err) {
            console.error('Error fetching /debug/headers', err);
        }

        try {
            const resp = await fetch('/api/available-slots', { credentials: 'include' });
            const json = await resp.json();
            console.debug('/api/available-slots response', resp.status, json && json.slots && json.slots.length);
        } catch (err) {
            console.error('Error fetching /api/available-slots (direct):', err);
        }
    };

    const getWeekSlots = () => {
        const weekStart = new Date(currentDate);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return slots.filter(slot => {
            const slotDate = new Date(slot.datetime);
            return slotDate >= weekStart && slotDate <= weekEnd;
        });
    };

    const groupSlotsByDay = (slotsToGroup) => {
        const grouped = {};
        slotsToGroup.forEach(slot => {
            const date = slot.date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(slot);
        });
        return grouped;
    };

    const renderCalendar = () => {
        const weekSlots = getWeekSlots();
        const groupedSlots = groupSlotsByDay(weekSlots);
        const days = Object.keys(groupedSlots).sort();

        console.debug('renderCalendar: weekSlots length', weekSlots.length, 'days length', days.length);

        return (
            <div className={styles.calendarView}>
                <div className={styles.calendarHeader}>
                    <div className={styles.calendarNav}>
                        <button className={styles.navBtn} onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setDate(newDate.getDate() - 7);
                            setCurrentDate(newDate);
                        }}>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <h3 className={styles.calendarTitle}>
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button className={styles.navBtn} onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setDate(newDate.getDate() + 7);
                            setCurrentDate(newDate);
                        }}>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <div className={styles.calendarGrid}>
                    {weekSlots.length === 0 && (
                        <div className={styles.noSlots} style={{ textAlign: 'center', padding: '2rem' }}>
                            <p>No available slots were found for the selected week.</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button className={styles.btn} onClick={() => { setLoading(true); fetchSlots(); }}>Retry</button>
                                <button className={styles.btnOutline} onClick={() => setView('month')}>View Calendar</button>
                                {import.meta.env.DEV && (
                                    <button className={styles.btnOutline} onClick={() => runDebugChecks()}>Debug</button>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={styles.weekDays}>
                        {days.map(date => {
                            const daySlots = groupedSlots[date];
                            const firstSlot = daySlots[0];
                            const slotDate = new Date(firstSlot.datetime);
                            const isToday = new Date().toDateString() === slotDate.toDateString();

                            return (
                                <div key={date} className={`${styles.weekDay} ${isToday ? styles.today : ''}`}>
                                    <div className={styles.dayName}>{firstSlot.day_short}</div>
                                    <div className={styles.dayDate}>{slotDate.getDate()}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.timeSlotsGrid}>
                        {days.map(date => (
                            <div key={date} className={styles.dayColumn}>
                                {groupedSlots[date].map((slot, idx) => (
                                    <button
                                        key={idx}
                                        className={`${styles.timeSlot} ${slot.available ? styles.available :
                                            slot.booked ? styles.booked : styles.unavailable
                                            } ${selectedSlot?.datetime === slot.datetime ? styles.selected : ''}`}
                                        onClick={() => handleSlotClick(slot)}
                                        disabled={!slot.available || slot.booked}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Always render the booking form; show a non-blocking overlay loader while slots are loading

    return (
        <div className={styles.bookingPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link to="/" className={styles.logo}>
                        <i className="fas fa-robot"></i> Aidaddy
                    </Link>
                    <Link to="/" className={styles.backLink}>
                        <i className="fas fa-arrow-left"></i> Back to Home
                    </Link>
                </div>

                <div className={styles.bookingCard}>
                    {loading && (
                        <div className={styles.loaderOverlay}>
                            <div className={styles.overlayInner}>
                                <Loader size="lg" message="Loading available slots..." />
                            </div>
                        </div>
                    )}
                    <div className={styles.bookingSidebar}>
                        <div className={styles.sidebarContent}>
                            <div className={styles.bookingIcon}>
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <h1>Book a Meeting</h1>
                            <p className={styles.bookingSubtitle}>Schedule a 30-minute consultation with our AI experts.</p>

                            <div className={styles.bookingFeatures}>
                                <div className={styles.featureItem}>
                                    <i className="fas fa-clock"></i>
                                    <span>30 Minutes</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <i className="fas fa-video"></i>
                                    <span>Video Call</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <i className="fas fa-globe"></i>
                                    <span>Global Access</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.bookingContent}>
                        <div className={styles.stepIndicator}>
                            <div className={`${styles.step} ${!selectedSlot ? styles.active : styles.completed}`}>
                                <div className={styles.stepNumber}>1</div>
                                <span>Select Time</span>
                            </div>
                            <div className={styles.stepLine}></div>
                            <div className={`${styles.step} ${selectedSlot ? styles.active : ''}`}>
                                <div className={styles.stepNumber}>2</div>
                                <span>Your Details</span>
                            </div>
                        </div>

                        <form className={styles.bookingForm} onSubmit={handleSubmit}>
                            <div className={styles.sectionTitle}>
                                <h3>Select a Date & Time</h3>
                                <div className={styles.timezoneInfo}>
                                    <i className="fas fa-globe-americas"></i> Times are in your local timezone
                                </div>
                            </div>

                            <div className={styles.calendarContainer}>
                                {renderCalendar()}
                            </div>

                            <div className={styles.calendarLegend}>
                                <div className={styles.legendItem}>
                                    <div className={styles.legendAvailable}></div>
                                    <span>Available</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <div className={styles.legendBooked}></div>
                                    <span>Booked</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <div className={styles.legendSelected}></div>
                                    <span>Selected</span>
                                </div>
                            </div>

                            {selectedSlot && (
                                <div className={styles.formSection}>
                                    <div className={styles.sectionTitle}>
                                        <h3>Enter Details</h3>
                                    </div>

                                    <div className={styles.selectedSlotInfo}>
                                        <i className="fas fa-check-circle"></i>
                                        <span>Selected: <strong>{selectedSlot.display}</strong></span>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <div className={styles.field}>
                                            <label htmlFor="name">Full Name</label>
                                            <div className={styles.inputWrapper}>
                                                <i className="fas fa-user"></i>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.field}>
                                            <label htmlFor="email">Email Address</label>
                                            <div className={styles.inputWrapper}>
                                                <i className="fas fa-envelope"></i>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    placeholder="john@example.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className={styles.bookingSubmitBtn}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Processing...
                                            </>
                                        ) : (
                                            <>
                                                Confirm Booking <i className="fas fa-arrow-right"></i>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                title={modal.title}
            >
                <p>{modal.message}</p>
                {modal.type === 'error' && modal.message && modal.message.includes('slots') && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className={styles.btnModal} onClick={() => { setModal({ ...modal, isOpen: false }); setLoading(true); fetchSlots(); }}>Retry</button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Booking;
