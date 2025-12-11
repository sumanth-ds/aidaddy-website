// In production (Netlify), use same origin for API calls (they'll be redirected via netlify.toml)
// In dev we use Vite proxy, so default to empty string to use same origin
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    BOOKING: '/get-started',
    ADMIN: '/admin',
};

export const API_ENDPOINTS = {
    CONTACT: '/contact',
    AVAILABLE_SLOTS: '/api/available-slots',
    BOOK_MEETING: '/book-meeting',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    ADMIN: '/admin',
    ADMIN_API: '/api/admin',
    DELETE_CONTACT: (id) => `/admin/contact/${id}/delete`,
    DELETE_MEETING: (id) => `/admin/meeting/${id}/delete`,
    PROVIDE_MEETING_LINK: (id) => `/admin/meeting/${id}/provide-link`,
    RESCHEDULE_MEETING: (id) => `/admin/meeting/${id}/reschedule`,
    COMPLETE_MEETING: (id) => `/admin/meeting/${id}/complete`,
    DOWNLOAD_CONTACTS: '/admin/download/contacts',
    DOWNLOAD_MEETINGS: '/admin/download/meetings',
};
