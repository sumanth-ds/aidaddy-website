import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';
import { getToken } from '../utils/auth';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For session-based auth
    timeout: 10000,
});

// Create public axios instance without credentials
const publicApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for logging errors and diagnosing Network Error
publicApi.interceptors.response.use((r) => r, (error) => {
    try {
        console.error('publicApi response error:', error.toJSON ? error.toJSON() : error);
    } catch (e) {
        console.error('Failed to log API error properly', e, error);
    }
    return Promise.reject(error);
});

// Log outgoing requests from publicApi for debugging
publicApi.interceptors.request.use((config) => {
    try {
        console.debug('publicApi request:', { method: config.method, url: config.baseURL ? `${config.baseURL}${config.url}` : config.url, headers: config.headers });
    } catch (err) {
        console.debug('Failed to debug-log publicApi request', err);
    }
    return config;
}, (err) => Promise.reject(err));

// API Service Methods
export const apiService = {
    // Contact form submission
    submitContact: async (data) => {
        const response = await publicApi.post(API_ENDPOINTS.CONTACT, data);
        return response.data;
    },

    // Get available time slots
    getAvailableSlots: async () => {
        try {
            const response = await publicApi.get(API_ENDPOINTS.AVAILABLE_SLOTS);
            return response.data;
        } catch (err) {
            // Provide clearer error message helpful for UI
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Failed to fetch available slots.');
            }
            // If network error, try fallback to absolute URL if not configured
            try {
                if (typeof window !== 'undefined') {
                    // Use the explicitly-configured API base URL when available, otherwise fallback to the current origin
                    const fallbackBase = (API_BASE_URL && API_BASE_URL !== '') ? API_BASE_URL : window.location.origin;
                    const fallbackUrl = `${fallbackBase}${API_ENDPOINTS.AVAILABLE_SLOTS}`;
                    console.warn('getAvailableSlots: fallback attempt to', fallbackUrl, 'due to error', err.message || err);
                    const res = await fetch(fallbackUrl, { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' });
                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || `Fallback request failed with status ${res.status}`);
                    }
                    return await res.json();
                }
            } catch (fallbackError) {
                console.error('getAvailableSlots fallback error:', fallbackError);
            }
            throw err;
        }
    },

    // Book a meeting
    bookMeeting: async (data) => {
        const response = await publicApi.post(API_ENDPOINTS.BOOK_MEETING, data);
        return response.data;
    },

    // Admin login
    login: async (credentials) => {
        try {
            const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            }
            throw err;
        }
    },

    // Admin logout
    logout: async () => {
        const response = await api.post(API_ENDPOINTS.LOGOUT);
        return response.data;
    },

    // Get admin dashboard data
    getAdminData: async (page = 1, search = '', meetingsPage = 1) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (search) params.append('search', search);
        if (meetingsPage) params.append('meetings_page', meetingsPage);
        const response = await api.get(`${API_ENDPOINTS.ADMIN_API}?${params.toString()}`);
        return response.data;
    },

    // Delete contact
    deleteContact: async (id) => {
        const response = await api.post(API_ENDPOINTS.DELETE_CONTACT(id));
        return response.data;
    },

    // Delete meeting
    deleteMeeting: async (id) => {
        const response = await api.post(API_ENDPOINTS.DELETE_MEETING(id));
        return response.data;
    },

    // Provide meeting link
    provideMeetingLink: async (id, meetingLink) => {
        const response = await api.post(API_ENDPOINTS.PROVIDE_MEETING_LINK(id), {
            meeting_link: meetingLink,
        });
        return response.data;
    },

    // Reschedule meeting
    rescheduleMeeting: async (id, newDatetime) => {
        const response = await api.post(API_ENDPOINTS.RESCHEDULE_MEETING(id), {
            new_datetime: newDatetime,
        });
        return response.data;
    },

    // Complete meeting
    completeMeeting: async (id) => {
        const response = await api.post(API_ENDPOINTS.COMPLETE_MEETING(id));
        return response.data;
    },

    // Download contacts CSV
    downloadContacts: () => {
        window.open(`${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_CONTACTS}`, '_blank');
    },

    // Download meetings CSV
    downloadMeetings: () => {
        window.open(`${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_MEETINGS}`, '_blank');
    },

    // Blog APIs
    getBlogs: async (page = 1, status = 'published', topicId = null, search = '') => {
        const params = new URLSearchParams();
        params.append('page', page);
        if (status && status !== 'all') params.append('status', status);
        if (topicId) params.append('topic_id', topicId);
        if (search) params.append('search', search);
        const response = await publicApi.get(`/api/blogs?${params.toString()}`);
        return response.data;
    },

    getBlog: async (slug) => {
        const response = await publicApi.get(`/api/blogs/${slug}`);
        return response.data;
    },

    createBlog: async (blogData) => {
        const response = await api.post('/api/blogs', blogData);
        return response.data;
    },

    updateBlog: async (id, blogData) => {
        const response = await api.put(`/api/blogs/${id}`, blogData);
        return response.data;
    },

    deleteBlog: async (id) => {
        const response = await api.delete(`/api/blogs/${id}`);
        return response.data;
    },

    getTopics: async () => {
        const response = await publicApi.get('/api/topics');
        return response.data;
    },

    createTopic: async (topicData) => {
        const response = await api.post('/api/topics', topicData);
        return response.data;
    },

    createSubtopic: async (topicId, subtopicData) => {
        const response = await api.post(`/api/topics/${topicId}/subtopics`, subtopicData);
        return response.data;
    },
};

export default api;
