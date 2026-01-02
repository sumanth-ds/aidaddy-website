import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { logout as authLogout, login as authLogin } from '../utils/auth';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('contacts');
    const [contacts, setContacts] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [contactsPage, setContactsPage] = useState(1);
    const [meetingsPage, setMeetingsPage] = useState(1);
    const [blogsPage, setBlogsPage] = useState(1);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
    const [linkModal, setLinkModal] = useState({ isOpen: false, meetingId: null, link: '' });
    const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, meetingId: null, newDatetime: '', error: '' });
    const [authModal, setAuthModal] = useState({ isOpen: false, username: '', password: '', error: '' });
    const [blogModal, setBlogModal] = useState({ isOpen: false, blog: null, mode: 'create' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        if (activeTab === 'blogs') {
            fetchBlogs();
            fetchTopics();
        }
    }, [contactsPage, meetingsPage, blogsPage, search, activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAdminData(contactsPage, search, meetingsPage);
            console.log('fetchData admin data:', data && { contacts: data.contacts?.length, meetings: data.meetings?.length });
            if (data) {
                parseAdminDataFromJson(data);
            }
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            // If not authenticated, show login modal instead of redirecting
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                setAuthModal({ ...authModal, isOpen: true });
            } else {
                setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to fetch admin data.' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('meetings state updated', meetings.length);
    }, [meetings]);

    const fetchBlogs = async () => {
        try {
            const response = await apiService.getBlogs(blogsPage, 'all');
            if (response && response.success) {
                setBlogs(response.blogs || []);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        }
    };

    const fetchTopics = async () => {
        try {
            const response = await apiService.getTopics();
            if (response && response.success) {
                setTopics(response.topics || []);
            }
        } catch (error) {
            console.error('Failed to fetch topics:', error);
        }
    };

    const parseAdminDataFromJson = (data) => {
        try {
            const contactsFromServer = data.contacts || [];
            const meetingsFromServer = data.meetings || [];

            const parsedContacts = contactsFromServer.map((c) => ({
                ...c,
                timestamp: c.timestamp ? new Date(c.timestamp) : null,
                id: c.id || c._id || c.id,
            }));

            const parsedMeetings = meetingsFromServer.map((m) => ({
                ...m,
                meeting_datetime: m.meeting_datetime ? new Date(m.meeting_datetime) : null,
                id: m.id || m._id || m.id,
            }));

            // Sort meetings newest first
            parsedMeetings.sort((a, b) => {
                const aTime = a.meeting_datetime ? new Date(a.meeting_datetime).getTime() : 0;
                const bTime = b.meeting_datetime ? new Date(b.meeting_datetime).getTime() : 0;
                return bTime - aTime;
            });

            console.log('parsedMeetings:', parsedMeetings.length, parsedMeetings);

            setContacts(parsedContacts);
            setMeetings(parsedMeetings);
        } catch (err) {
            console.error('Failed to parse admin data JSON:', err);
        }
    };

    const handleLogout = async () => {
        try {
            await apiService.logout();
            authLogout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            authLogout();
            navigate('/login');
        }
    };

    const handleAuthSubmit = async () => {
        try {
            setAuthModal({ ...authModal, error: '' });
            const credentials = { username: authModal.username, password: authModal.password };
            const data = await apiService.login(credentials);
            if (data && data.success) {
                authLogin('session_active');
                setAuthModal({ isOpen: false, username: '', password: '', error: '' });
                fetchData();
            } else {
                setAuthModal({ ...authModal, error: data.message || 'Invalid credentials' });
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
            setAuthModal({ ...authModal, error: msg });
        }
    };

    const handleDeleteContact = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;

        try {
            await apiService.deleteContact(id);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Success',
                message: 'Contact deleted successfully!'
            });
            fetchData();
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to delete contact.'
            });
        }
    };

    const handleDeleteMeeting = async (id) => {
        if (!window.confirm('Are you sure you want to delete this meeting?')) return;

        try {
            await apiService.deleteMeeting(id);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Success',
                message: 'Meeting deleted successfully!'
            });
            fetchData();
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to delete meeting.'
            });
        }
    };

    const handleProvideMeetingLink = async () => {
        if (!linkModal.link) {
            alert('Please enter a meeting link');
            return;
        }

        try {
            await apiService.provideMeetingLink(linkModal.meetingId, linkModal.link);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Success',
                message: 'Meeting link provided successfully!'
            });
            setLinkModal({ isOpen: false, meetingId: null, link: '' });
            fetchData();
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to provide meeting link.'
            });
        }
    };

    const handleOpenRescheduleModal = (meetingId, currentDatetime) => {
        setRescheduleModal({ isOpen: true, meetingId, newDatetime: currentDatetime ? new Date(currentDatetime).toISOString().slice(0, 16) : '', error: '' });
    };

    const handleRescheduleSubmit = async () => {
        if (!rescheduleModal.newDatetime) {
            setRescheduleModal({ ...rescheduleModal, error: 'Please select new date and time' });
            return;
        }

        try {
            // send ISO 8601 string
            // Use the datetime-local value (YYYY-MM-DDTHH:MM) as it is parsable by python.fromisoformat
            const resp = await apiService.rescheduleMeeting(rescheduleModal.meetingId, rescheduleModal.newDatetime);
            setModal({ isOpen: true, type: 'success', title: 'Success', message: resp?.message || 'Meeting rescheduled successfully!' });
            setRescheduleModal({ isOpen: false, meetingId: null, newDatetime: '', error: '' });
            fetchData();
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to reschedule meeting.';
            setRescheduleModal({ ...rescheduleModal, error: message });
        }
    };

    const handleCompleteMeeting = async (id) => {
        try {
            await apiService.completeMeeting(id);
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Success',
                message: 'Meeting marked as completed!'
            });
            fetchData();
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to complete meeting.'
            });
        }
    };

    const handleCreateBlog = () => {
        setBlogModal({
            isOpen: true, blog: {
                title: '',
                content: '',
                excerpt: '',
                featured_image: '',
                topic_id: '',
                subtopic_id: '',
                status: 'draft',
                meta_description: '',
                meta_keywords: ''
            }, mode: 'create'
        });
    };

    const handleEditBlog = (blog) => {
        setBlogModal({ isOpen: true, blog, mode: 'edit' });
    };

    const handleSaveBlog = async () => {
        try {
            const blog = blogModal.blog;
            if (!blog.title || !blog.content) {
                setModal({ isOpen: true, type: 'error', title: 'Validation Error', message: 'Title and content are required fields.' });
                return;
            }

            if (blogModal.mode === 'create') {
                const response = await apiService.createBlog(blog);
                setModal({ isOpen: true, type: 'success', title: 'Success', message: 'Blog created successfully!' });
            } else {
                const response = await apiService.updateBlog(blog.id, blog);
                setModal({ isOpen: true, type: 'success', title: 'Success', message: 'Blog updated successfully!' });
            }

            setBlogModal({ isOpen: false, blog: null, mode: 'create' });
            fetchBlogs();
        } catch (error) {
            console.error('Error saving blog:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save blog. Please try again.';
            setModal({ isOpen: true, type: 'error', title: 'Error', message: errorMessage });
        }
    };

    const handleDeleteBlog = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;

        try {
            await apiService.deleteBlog(id);
            setModal({ isOpen: true, type: 'success', title: 'Success', message: 'Blog deleted successfully!' });
            fetchBlogs();
        } catch (error) {
            setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to delete blog.' });
        }
    };

    const handlePublishBlog = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'published' ? 'draft' : 'published';
            await apiService.updateBlog(id, { status: newStatus });
            setModal({ isOpen: true, type: 'success', title: 'Success', message: `Blog ${newStatus} successfully!` });
            fetchBlogs();
        } catch (error) {
            setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to update blog status.' });
        }
    };

    if (loading) {
        return <Loader fullPage message="Loading dashboard..." />;
    }

    return (
        <div className={styles.adminDashboard}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Admin Dashboard</h1>
                    <p>Manage contacts and meetings</p>
                </div>

                <div className={styles.navTabs}>
                    <div
                        className={`${styles.navTab} ${activeTab === 'contacts' ? styles.active : ''}`}
                        onClick={() => setActiveTab('contacts')}
                    >
                        <i className="fas fa-address-book"></i> Contacts
                    </div>
                    <div
                        className={`${styles.navTab} ${activeTab === 'meetings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('meetings')}
                    >
                        <i className="fas fa-calendar-alt"></i> Meetings
                    </div>
                    <div
                        className={`${styles.navTab} ${activeTab === 'blogs' ? styles.active : ''}`}
                        onClick={() => setActiveTab('blogs')}
                    >
                        <i className="fas fa-blog"></i> Blogs
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.stats}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div className={`${styles.statNumber} ${styles.animateFadeUp}`}>{contacts.length}</div>
                            <div className={styles.statLabel}>Total Contacts</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <div className={`${styles.statNumber} ${styles.animateFadeUp}`} style={{ animationDelay: '120ms' }}>{meetings.length}</div>
                            <div className={styles.statLabel}>Total Meetings</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className={`${styles.statNumber} ${styles.animateFadeUp}`} style={{ animationDelay: '200ms' }}>
                                {meetings.filter(m => m.status === 'pending').length}
                            </div>
                            <div className={styles.statLabel}>Pending</div>
                        </div>
                    </div>

                    {activeTab === 'contacts' && (
                        <div>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <i className="fas fa-address-book"></i> Contacts
                                </h2>
                                <div className={styles.sectionActions}>
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={() => apiService.downloadContacts()}
                                    >
                                        <i className="fas fa-download"></i> Export CSV
                                    </button>
                                </div>
                            </div>

                            <div className={styles.searchBar}>
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button onClick={fetchData}>
                                    <i className="fas fa-search"></i> Search
                                </button>
                            </div>

                            <div className={styles.tableContainer}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Message</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contacts.length === 0 ? (
                                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No contacts found</td></tr>
                                        ) : contacts.map((contact, index) => (
                                            <tr key={contact.id} className={styles.tableRow} style={{ animationDelay: `${index * 50}ms` }}>
                                                <td>{contact.name}</td>
                                                <td>{contact.email}</td>
                                                <td className={styles.messageCell}>{contact.message}</td>
                                                <td>{new Date(contact.timestamp).toLocaleDateString()}</td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                            onClick={() => handleDeleteContact(contact.id)}
                                                        >
                                                            <i className="fas fa-trash"></i> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'meetings' && (
                        <div>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <i className="fas fa-calendar-alt"></i> Meetings
                                </h2>
                                <div className={styles.sectionActions}>
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={() => apiService.downloadMeetings()}
                                    >
                                        <i className="fas fa-download"></i> Export CSV
                                    </button>
                                </div>
                            </div>

                            <div className={styles.tableContainer}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Date & Time</th>
                                            <th>Status</th>
                                            <th>Meeting Link</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {meetings.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No meetings found</td></tr>
                                        ) : meetings.map((meeting, index) => {
                                            const statusClass = `status${(meeting.status || '').charAt(0).toUpperCase() + (meeting.status || '').slice(1)}`;
                                            return (
                                                <tr key={meeting.id} className={styles.tableRow} style={{ animationDelay: `${index * 50}ms` }}>
                                                    <td>{meeting.name}</td>
                                                    <td>{meeting.email}</td>
                                                    <td>{meeting.meeting_datetime ? new Date(meeting.meeting_datetime).toLocaleString() : '-'}</td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
                                                            {meeting.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {meeting.meeting_link ? (
                                                            <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className={styles.meetingLink}>
                                                                <i className="fas fa-external-link-alt"></i> Join
                                                            </a>
                                                        ) : (
                                                            <span>-</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className={styles.actions}>
                                                            {meeting.status === 'pending' && (
                                                                <button
                                                                    className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                                                                    onClick={() => setLinkModal({ isOpen: true, meetingId: meeting.id, link: '' })}
                                                                >
                                                                    <i className="fas fa-link"></i> Provide Link
                                                                </button>
                                                            )}
                                                            {(meeting.status === 'pending' || meeting.status === 'scheduled') && (
                                                                <button
                                                                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                                                    onClick={() => handleOpenRescheduleModal(meeting.id, meeting.meeting_datetime)}
                                                                >
                                                                    <i className="fas fa-calendar-alt"></i> Reschedule
                                                                </button>
                                                            )}
                                                            {meeting.status === 'scheduled' && (
                                                                <button
                                                                    className={`${styles.btn} ${styles.btnWarning} ${styles.btnSm}`}
                                                                    onClick={() => handleCompleteMeeting(meeting.id)}
                                                                >
                                                                    <i className="fas fa-check"></i> Complete
                                                                </button>
                                                            )}
                                                            <button
                                                                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                                onClick={() => handleDeleteMeeting(meeting.id)}
                                                            >
                                                                <i className="fas fa-trash"></i> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'blogs' && (
                        <div>
                            <div className={styles.sectionHeader}>
                                <h2>Blog Management</h2>
                                <div>
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={handleCreateBlog}
                                    >
                                        <i className="fas fa-plus"></i> Create Blog
                                    </button>
                                </div>
                            </div>

                            <div className={styles.tableContainer}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Topic</th>
                                            <th>Status</th>
                                            <th>Views</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {blogs.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No blogs found</td></tr>
                                        ) : blogs.map((blog, index) => (
                                            <tr key={blog.id} className={styles.tableRow} style={{ animationDelay: `${index * 50}ms` }}>
                                                <td>{blog.title}</td>
                                                <td>{blog.topic_name || 'N/A'}</td>
                                                <td>
                                                    <span className={`${styles.badge} ${blog.status === 'published' ? styles.badgeSuccess : styles.badgeDraft}`}>
                                                        {blog.status}
                                                    </span>
                                                </td>
                                                <td>{blog.views || 0}</td>
                                                <td>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                                            onClick={() => handleEditBlog(blog)}
                                                        >
                                                            <i className="fas fa-edit"></i> Edit
                                                        </button>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                                                            onClick={() => handlePublishBlog(blog.id, blog.status)}
                                                        >
                                                            <i className="fas fa-{blog.status === 'published' ? 'eye-slash' : 'eye'}"></i>
                                                            {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                                                        </button>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                            onClick={() => handleDeleteBlog(blog.id)}
                                                        >
                                                            <i className="fas fa-trash"></i> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.logout}>
                    <a href="#" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                title={modal.title}
            >
                <p>{modal.message}</p>
            </Modal>

            <Modal
                isOpen={authModal.isOpen}
                onClose={() => setAuthModal({ isOpen: false, username: '', password: '', error: '' })}
                type={'info'}
                title={'Admin Login'}
                icon={false}
            >
                {authModal.error && <div className={styles.flash}>{authModal.error}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={authModal.username}
                        onChange={(e) => setAuthModal({ ...authModal, username: e.target.value })}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={authModal.password}
                        onChange={(e) => setAuthModal({ ...authModal, password: e.target.value })}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className={styles.btnModal} onClick={handleAuthSubmit}>Login</button>
                        <button className={`${styles.btnModal} ${styles.btnOutline}`} onClick={() => setAuthModal({ isOpen: false, username: '', password: '', error: '' })}>Cancel</button>
                    </div>
                </div>
            </Modal>

            {linkModal.isOpen && (
                <div className={styles.modal} onClick={() => setLinkModal({ isOpen: false, meetingId: null, link: '' })}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Provide Meeting Link</h3>
                        </div>
                        <div className={styles.modalBody}>
                            <label>Meeting Link</label>
                            <input
                                type="url"
                                placeholder="https://meet.google.com/..."
                                value={linkModal.link}
                                onChange={(e) => setLinkModal({ ...linkModal, link: e.target.value })}
                            />
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnModal} onClick={handleProvideMeetingLink}>
                                Submit
                            </button>
                            <button
                                className={`${styles.btnModal} ${styles.btnOutline}`}
                                onClick={() => setLinkModal({ isOpen: false, meetingId: null, link: '' })}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rescheduleModal.isOpen && (
                <div className={styles.modal} onClick={() => setRescheduleModal({ isOpen: false, meetingId: null, newDatetime: '', error: '' })}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Reschedule Meeting</h3>
                        </div>
                        <div className={styles.modalBody}>
                            {rescheduleModal.error && <div className={styles.flash}>{rescheduleModal.error}</div>}
                            <label>New Date & Time</label>
                            <input
                                type="datetime-local"
                                value={rescheduleModal.newDatetime}
                                onChange={(e) => setRescheduleModal({ ...rescheduleModal, newDatetime: e.target.value })}
                            />
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnModal} onClick={handleRescheduleSubmit}>Submit</button>
                            <button className={`${styles.btnModal} ${styles.btnOutline}`} onClick={() => setRescheduleModal({ isOpen: false, meetingId: null, newDatetime: '', error: '' })}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {blogModal.isOpen && (
                <div className={styles.modal} onClick={() => setBlogModal({ isOpen: false, blog: null, mode: 'create' })}>
                    <div className={styles.blogModalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.blogModalHeader}>
                            <div className={styles.blogModalTitle}>
                                <i className={`fas fa-${blogModal.mode === 'create' ? 'plus-circle' : 'edit'}`}></i>
                                <h3>{blogModal.mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}</h3>
                            </div>
                            <button
                                className={styles.closeModalBtn}
                                onClick={() => setBlogModal({ isOpen: false, blog: null, mode: 'create' })}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className={styles.blogModalBody}>
                            {/* Basic Info Section */}
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>
                                    <i className="fas fa-file-alt"></i>
                                    <h4>Basic Information</h4>
                                </div>

                                <div className={styles.formGroup}>
                                    <label><i className="fas fa-heading"></i> Title <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        value={blogModal.blog?.title || ''}
                                        onChange={(e) => setBlogModal({ ...blogModal, blog: { ...blogModal.blog, title: e.target.value } })}
                                        placeholder="Enter an engaging blog title..."
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label><i className="fas fa-align-left"></i> Excerpt</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={blogModal.blog?.excerpt || ''}
                                        onChange={(e) => setBlogModal({ ...blogModal, blog: { ...blogModal.blog, excerpt: e.target.value } })}
                                        placeholder="Write a brief summary that will appear in blog previews..."
                                        rows="3"
                                        maxLength="500"
                                    />
                                    <small className={styles.charCount}>
                                        {(blogModal.blog?.excerpt || '').length}/500 characters
                                    </small>
                                </div>

                                <div className={styles.formGroup}>
                                    <label><i className="fas fa-paragraph"></i> Content <span className={styles.required}>*</span></label>
                                    <textarea
                                        className={`${styles.formTextarea} ${styles.codeEditor}`}
                                        value={blogModal.blog?.content || ''}
                                        onChange={(e) => setBlogModal({ ...blogModal, blog: { ...blogModal.blog, content: e.target.value } })}
                                        placeholder="Write your blog content here. HTML is supported for rich formatting..."
                                        rows="12"
                                    />
                                    <small className={styles.hint}>
                                        <i className="fas fa-info-circle"></i> You can use HTML tags for formatting
                                    </small>
                                </div>

                                <div className={styles.formGroup}>
                                    <label><i className="fas fa-image"></i> Featured Image URL</label>
                                    <input
                                        type="url"
                                        className={styles.formInput}
                                        value={blogModal.blog?.featured_image || ''}
                                        onChange={(e) => setBlogModal({ ...blogModal, blog: { ...blogModal.blog, featured_image: e.target.value } })}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {blogModal.blog?.featured_image && (
                                        <div className={styles.imagePreview}>
                                            <img src={blogModal.blog.featured_image} alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Categories Section */}
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>
                                    <i className="fas fa-tags"></i>
                                    <h4>Categories & Publishing</h4>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label><i className="fas fa-folder"></i> Topic</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            value={blogModal.blog?.topic_id || ''}
                                            onChange={(e) => setBlogModal({ ...blogModal, blog: { ...blogModal.blog, topic_id: e.target.value } })}
                                            placeholder="e.g., Technology, Health, Business"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label><i className="fas fa-folder-open"></i> Subtopic</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            value={blogModal.blog?.subtopic_id || ''}
                                            onChange={(e) => setBlogModal({ ...blogModal, blog: { ...blogModal.blog, subtopic_id: e.target.value } })}
                                            placeholder="e.g., AI, Web Development, Marketing"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label><i className="fas fa-toggle-on"></i> Status</label>
                                        <select
                                            className={styles.formSelect}
                                            value={blogModal.blog?.status || 'draft'}
                                            onChange={(e) => setBlogModal({ ...blogModal, blog: { ...blogModal.blog, status: e.target.value } })}
                                        >
                                            <option value="draft">📝 Draft</option>
                                            <option value="published">✅ Published</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SEO Section */}
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>
                                    <i className="fas fa-search"></i>
                                    <h4>SEO Optimization</h4>
                                </div>

                                <div className={styles.formGroup}>
                                    <label><i className="fas fa-file-invoice"></i> Meta Description</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={blogModal.blog?.meta_description || ''}
                                        onChange={(e) => setBlogModal({ ...blogModal, blog: { ...blogModal.blog, meta_description: e.target.value } })}
                                        placeholder="Write a concise description for search engines (recommended: 150-160 chars)..."
                                        rows="2"
                                        maxLength="160"
                                    />
                                    <small className={styles.charCount}>
                                        {(blogModal.blog?.meta_description || '').length}/160 characters
                                    </small>
                                </div>

                                <div className={styles.formGroup}>
                                    <label><i className="fas fa-key"></i> Meta Keywords</label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        value={blogModal.blog?.meta_keywords || ''}
                                        onChange={(e) => setBlogModal({ ...blogModal, blog: { ...blogModal.blog, meta_keywords: e.target.value } })}
                                        placeholder="ai, machine learning, technology, tutorial"
                                    />
                                    <small className={styles.hint}>
                                        <i className="fas fa-info-circle"></i> Separate keywords with commas
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className={styles.blogModalFooter}>
                            <button className={styles.btnCancel} onClick={() => setBlogModal({ isOpen: false, blog: null, mode: 'create' })}>
                                <i className="fas fa-times"></i> Cancel
                            </button>
                            <button className={styles.btnSave} onClick={handleSaveBlog}>
                                <i className={`fas fa-${blogModal.mode === 'create' ? 'plus' : 'save'}`}></i>
                                {blogModal.mode === 'create' ? 'Create Blog Post' : 'Update Blog Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
