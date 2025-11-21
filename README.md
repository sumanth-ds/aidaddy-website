# Aidaddy Frontend

Static frontend for Aidaddy AI Services platform built with vanilla HTML, CSS, and JavaScript.

## Project Structure

```
frontend/
├── templates/
│   ├── index.html      # Main landing page
│   ├── admin.html
│   ├── booking.html
│   ├── demo.html
│   └── login.html
scripts/
├── inject-backend.js   # Build script to inject BACKEND_URL
└── server.js          # Local development server
vercel.json           # Vercel deployment config
package.json          # Project dependencies & scripts
```

## Development

### Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start local server:**
   ```bash
   npm run start
   ```
   Server runs at `http://localhost:3000`

3. **Build (inject backend URL):**
   ```bash
   npm run build
   ```

### Environment Variables

- `BACKEND_URL` – Backend API endpoint (defaults to `https://aidaddy-backend.onrender.com`)

## Deployment

### Vercel

1. **Connect your GitHub repo to Vercel Dashboard**

2. **Add Environment Variables** in Vercel Project Settings:
   ```
   BACKEND_URL = https://aidaddy-backend.onrender.com
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

The deployment will:
- Run `npm run build` (injects `BACKEND_URL` into HTML)
- Serve static files from `frontend/templates/`
- Proxy `/api/*` and `/contact` to the backend

### Backend Integration

The contact form sends POST requests to `${BACKEND_URL}/contact`. 

**Backend Requirements:**
- Must accept `POST /contact` with `Content-Type: application/json`
- Request body: `{ name: string, email: string, message: string }`
- Response: `{ message: string }`
- CORS headers must include frontend origin

**Common Issues:**
- **"Connection Error"**: Backend is offline or CORS not configured
- **"Timeout"**: Backend endpoint unreachable or slow (30s timeout)
- **Form silent failure**: Check browser console for CORS or network errors

### Testing Contact Form

```bash
curl -X POST https://aidaddy-backend.onrender.com/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello"}'
```

## Build Configuration

**vercel.json:**
- Serves `frontend/templates/` as static root
- Rewrites `/api/*` → backend
- Rewrites `/contact` → backend
- Fallback to `index.html` for SPA routes

**scripts/inject-backend.js:**
- Replaces `__BACKEND_URL__` placeholder in HTML with env var value
- Runs automatically during Vercel builds

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run start` | Start local dev server (port 3000) |
| `npm run build` | Inject BACKEND_URL into HTML |

## Debugging

Enable browser console (F12) to see:
- Network errors during form submission
- CORS issues
- Timeout errors (30s limit)
- Backend response details

Check Vercel & backend logs:
- Vercel: `vercel logs`
- Backend (Render): Dashboard → Logs

## Troubleshooting

**Contact form not sending?**
1. Verify backend is running: `curl https://aidaddy-backend.onrender.com`
2. Check browser console for CORS/network errors
3. Ensure `BACKEND_URL` env var is set correctly in Vercel
4. Backend must have CORS headers configured

**Render backend spins down?**
- Render free tier spins down after 15 min inactivity
- Script pings backend every 14 minutes to keep it warm
- Consider upgrading to paid tier for 24/7 availability

## License

© 2025-2026 Aidaddy.in. All rights reserved.
