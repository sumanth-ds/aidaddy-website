# Booking Form Troubleshooting Guide

## Issue: Admin emails not showing all booking details

### Problem Description
Admin notification emails only show basic information (name, email, meeting time) but missing:
- Phone number
- Company name
- Company website URL
- Project type
- Budget
- Project details/message

### Root Cause Analysis

The database check shows that the recent booking only has name and email populated, meaning the additional fields were not submitted from the frontend form.

**Possible causes:**
1. **Browser Cache**: User is viewing an old cached version of the booking page
2. **Form Validation**: Required fields not enforced on old version
3. **JavaScript Not Loaded**: React app not fully loaded/initialized

### Solution Steps

#### 1. Clear Browser Cache and Hard Refresh

**For Users:**
- **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: Press `Cmd + Shift + R`
- **Alternative**: Open DevTools (F12) → Right-click refresh button → Select "Empty Cache and Hard Reload"

#### 2. Verify Form Fields Are Required

The following fields should be marked as required:
- ✅ Full Name
- ✅ Email Address
- ✅ Phone Number
- ✅ Project Type
- ✅ Project Budget
- ✅ Project Details
- ⚠️ Company Name (optional)
- ⚠️ Company Website (optional)

#### 3. Test the Form

1. Open the booking page: `http://localhost:5173/get-started` (development)
2. Open browser console (F12)
3. Fill out ALL required fields
4. Before submitting, check console for: `Submitting booking with data:`
5. Verify all fields are in the logged data

#### 4. Test Form Standalone

Open the test page to verify form data collection:
```
http://localhost:5173/test-booking-form.html
```

Fill out the form and check if all fields are captured correctly.

#### 5. Backend Verification

Check backend logs when a booking is submitted. You should see:
```
Received booking request: name=..., email=..., phone=..., company=..., company_url=..., project_type=..., budget=..., datetime=...
```

If any field shows as `None`, it means it wasn't sent from the frontend.

### Database Check

Run this script to check the most recent booking:
```bash
python backend/check_recent_booking.py
```

### Expected Email Format

**Admin notification should include:**

```
📅 New Meeting Request

👤 Client Information
Name: John Doe
Email: john@example.com
Phone: +1 (555) 123-4567
Company: Acme Corp
Website: https://acme.com

💼 Project Information
Project Type: AI Consulting
Budget: $10,000 - $25,000
Message: We need help with implementing AI...

📋 Requested Meeting Time
Date & Time: Friday, January 02, 2026 at 01:00 PM
Duration: 30 minutes
```

### Common Issues

#### Issue 1: Old Cached Version
**Symptom**: Form only has name and email fields
**Solution**: Hard refresh browser (Ctrl+Shift+R)

#### Issue 2: JavaScript Error
**Symptom**: Form submits but data is missing
**Solution**: Check browser console for errors

#### Issue 3: API Version Mismatch
**Symptom**: Frontend sends data but backend doesn't receive it
**Solution**: Restart both frontend and backend servers

### Development Checklist

- [x] Frontend form has all fields
- [x] Fields are marked as required
- [x] FormData state includes all fields
- [x] API call sends all fields
- [x] Backend accepts all fields
- [x] Database stores all fields
- [x] Email templates include all fields

### Files Modified

1. `react-frontend/src/pages/Booking.jsx` - Added all booking fields
2. `backend/app.py` - Updated to accept and store all fields
3. `backend/mail.py` - Updated email templates
4. `backend/update_db_schema.py` - Database migration script

### Next Steps

1. **Clear browser cache** and reload the booking page
2. **Make a new test booking** with all fields filled
3. **Check admin email** to verify all information is included
4. **Verify database** using `check_recent_booking.py`

### Support

If the issue persists after following these steps:
1. Check browser console (F12) for JavaScript errors
2. Check backend terminal for Python errors
3. Verify API endpoint is correctly configured
4. Test with the standalone form (`test-booking-form.html`)
