# Aidaddy React Frontend

Modern React frontend for the Aidaddy AI Services platform, built with Vite, React Router, and Axios.

## Features

✅ **Landing Page** - Hero section, services, features, and CTA
✅ **Contact Form** - Integrated with backend API
✅ **Booking System** - Interactive calendar with time slot selection
✅ **Admin Dashboard** - Full CRUD operations for contacts and meetings
✅ **Responsive Design** - Mobile-first approach
✅ **Premium UI** - Gradients, animations, and modern design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **CSS Modules** - Scoped styling

## Project Structure

```
react-frontend/
├── public/
│   └── ai_daddy_logo.jpg
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer, Layout
│   │   ├── home/            # Hero, Services, Features, CTA
│   │   ├── booking/         # Calendar components (future)
│   │   ├── admin/           # Admin dashboard components (future)
│   │   └── common/          # Modal, Button, Loader
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Booking.jsx
│   │   └── AdminDashboard.jsx
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── utils/
│   │   ├── auth.js          # Authentication utilities
│   │   └── constants.js     # API endpoints and constants
│   ├── styles/
│   │   ├── global.css       # Global styles and animations
│   │   └── variables.css    # CSS custom properties
│   ├── App.jsx
│   └── main.jsx
├── .env                     # Environment variables
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Flask backend running on `http://localhost:5000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy .env.example to .env (already done)
   # Default: VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## API Integration

The frontend communicates with the Flask backend via the API service layer (`src/services/api.js`).

### Backend Requirements

The Flask backend must:
- Run on `http://localhost:5000` (or update `VITE_API_BASE_URL`)
- Have CORS enabled for `http://localhost:5173`
- Support session-based authentication with cookies

### API Endpoints Used

- `POST /contact` - Submit contact form
- `GET /api/available-slots` - Get available meeting slots
- `POST /book-meeting` - Book a meeting
- `POST /login` - Admin login
- `GET /logout` - Admin logout
- `GET /admin` - Get admin dashboard data
- `POST /admin/contact/<id>/delete` - Delete contact
- `POST /admin/meeting/<id>/delete` - Delete meeting
- `POST /admin/meeting/<id>/provide-link` - Provide meeting link
- `POST /admin/meeting/<id>/complete` - Mark meeting as completed
- `GET /admin/download/contacts` - Download contacts CSV
- `GET /admin/download/meetings` - Download meetings CSV

## Features Overview

### Landing Page (`/`)
- Responsive navigation with hamburger menu
- Hero section with CTA buttons
- Services grid with 6 AI services
- Features section with 4 key benefits
- Call-to-action section
- Contact form in footer

### Booking Page (`/get-started` or `/booking`)
- Interactive calendar view (week/month)
- Real-time slot availability
- Time slot selection
- Booking form with validation
- Success/error modals

### Admin Login (`/login`)
- Simple login form
- Session-based authentication
- Redirects to dashboard on success

### Admin Dashboard (`/admin`)
- Protected route (requires authentication)
- Tabs for Contacts and Meetings
- Stats overview cards
- Search functionality
- Pagination
- CRUD operations:
  - Delete contacts
  - Delete meetings
  - Provide meeting links
  - Mark meetings as completed
- CSV export for contacts and meetings

## Styling

- **CSS Variables** - Centralized design tokens in `src/styles/variables.css`
- **CSS Modules** - Component-scoped styles
- **Responsive Design** - Mobile-first breakpoints
- **Animations** - Smooth transitions and keyframe animations

### Color Scheme

```css
--primary: #2563eb
--secondary: #7c3aed
--accent: #06d6a0
--success: #10b981
--warning: #f59e0b
--danger: #ef4444
```

## Authentication

The app uses session-based authentication:
1. User logs in via `/login`
2. Backend sets session cookie
3. Frontend stores a token flag in localStorage
4. Protected routes check for the token
5. API requests include credentials for session cookies

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to React components will reflect immediately without full page reload.

### Proxy Configuration

The Vite dev server proxies API requests to the Flask backend. See `vite.config.js` for proxy settings.

### Debugging

- Open browser DevTools (F12)
- Check Console for errors
- Check Network tab for API requests
- React DevTools extension recommended

## Troubleshooting

### Backend Connection Issues

**Problem:** "Failed to fetch" or CORS errors

**Solution:**
1. Ensure Flask backend is running on `http://localhost:5000`
2. Verify CORS is enabled in Flask (see backend setup)
3. Check `VITE_API_BASE_URL` in `.env`

### Authentication Issues

**Problem:** Redirected to login after successful login

**Solution:**
1. Check browser cookies are enabled
2. Verify backend sets session cookie correctly
3. Check `credentials: 'include'` in API requests

### Build Issues

**Problem:** Build fails or missing dependencies

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2025-2026 Aidaddy.in. All rights reserved.

## Testing ⚙️

This project uses Vitest and React Testing Library for unit and integration tests.

### Install test dependencies (after installing other dependencies):
```bash
npm install
```

### Run tests:
```bash
npm run test
```

### Watch tests (continuous):
```bash
npm run test:watch
```

### Test Coverage:
```bash
npm run test:coverage
```

Tests added:
- `src/components/home/Contact.test.jsx` => forms an automated test that validates successful and failed contact form submissions by mocking `apiService.submitContact`.

Manual test steps to verify the contact form manually:
1. Start the app: `npm run dev` (ensure backend is running and `VITE_API_BASE_URL` points to your backend).
2. Open the browser to `http://localhost:5173`.
3. Fill out the contact form with valid values and click 'Send Message'.
4. Check the Network tab in DevTools to confirm a `POST /contact` request with expected payload; confirm the backend returned 200 OK.
5. Confirm success message is shown and the fields are reset.
6. Try an invalid payload or simulate a backend error to confirm the error message is displayed.
