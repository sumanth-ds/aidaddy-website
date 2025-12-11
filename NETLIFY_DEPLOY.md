# Netlify Deployment Guide

## Configuration Summary

### Build Settings in Netlify Dashboard:
- **Base directory**: Leave empty
- **Build command**: `cd react-frontend && npm install && npm run build`
- **Publish directory**: `react-frontend/dist`
- **Functions directory**: `netlify/functions`

### Environment Variables (Add in Netlify Dashboard):
```
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key_here
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
NETLIFY=true
VITE_API_BASE_URL=
```

**Important**: `VITE_API_BASE_URL` must be empty (or not set) so the frontend uses the same domain for API calls.

### How It Works:
1. **Frontend**: React app is built and served from `react-frontend/dist`
2. **Backend**: Flask app runs as a Netlify serverless function at `/.netlify/functions/api`
3. **API Routing**: All `/api/*`, `/contact`, `/book-meeting`, and `/admin/*` requests are redirected to the serverless function
4. **CORS**: Configured to work with Netlify deployment

### Deployment Steps:
1. Push code to GitHub
2. Connect repository to Netlify
3. Configure build settings as above
4. Add environment variables
5. Deploy!

### API Endpoints (all work on same domain):
- Frontend: `https://your-site.netlify.app/`
- API: `https://your-site.netlify.app/api/*`
- Contact: `https://your-site.netlify.app/contact`
- Booking: `https://your-site.netlify.app/book-meeting`
- Admin: `https://your-site.netlify.app/admin/*`
