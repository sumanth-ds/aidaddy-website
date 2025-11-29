# Backend CORS Setup Instructions

## Quick Setup

To enable the React frontend to communicate with the Flask backend, you need to add CORS support.

### Step 1: Install Flask-CORS

```bash
cd backend
..\.venv\Scripts\activate  # Activate virtual environment (Windows)
pip install flask-cors
```

### Step 2: Update backend/app.py

Add the following changes to `backend/app.py`:

**1. Add import at the top (after line 4):**
```python
from flask_cors import CORS
```

**2. Add CORS configuration (after line 46, after `app.secret_key = os.getenv('SECRET_KEY')`):**
```python
# CORS configuration for React frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
```

### Step 3: Start the Backend

```bash
python app.py
```

The backend will run on `http://localhost:5000` and accept requests from the React frontend on `http://localhost:5173`.

## Alternative: Add to requirements.txt

Add this line to `backend/requirements.txt`:
```
Flask-Cors==4.0.0
```

Then reinstall dependencies:
```bash
pip install -r requirements.txt
```

## Verification

1. Start the Flask backend: `python app.py`
2. Start the React frontend: `cd react-frontend && npm run dev`
3. Open `http://localhost:5173` in your browser
4. Test the contact form or booking system
5. Check browser console for any CORS errors (there should be none)

## Production

For production deployment, update the CORS origins to include your production domain:
```python
CORS(app, resources={
    r"/*": {
        "origins": ["https://your-production-domain.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
```
