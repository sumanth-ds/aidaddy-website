import requests
from datetime import datetime, timedelta

import os
from dotenv import load_dotenv
load_dotenv('backend/.env')
load_dotenv('.env')

BASE_URL = os.getenv('BACKEND_URL') or os.getenv('VITE_API_BASE_URL')
if not BASE_URL:
    raise RuntimeError('BACKEND_URL or VITE_API_BASE_URL environment variable must be set to run this script')

session = requests.Session()

# Login as admin (defaults to admin/admin123 unless changed)
print('Logging in as admin...')
login_resp = session.post(f"{BASE_URL}/api/login", json={"username": "admin", "password": "admin123"})
print('Login response:', login_resp.status_code, login_resp.text)
login_resp.raise_for_status()

# Get a meeting ID from debug endpoint
print('Fetching debug db...')
db = session.get(f"{BASE_URL}/debug/db")
print('DB fetch:', db.status_code)
db.raise_for_status()
json_db = db.json()
meetings = json_db.get('meetings', [])
if not meetings:
    print('No meetings found in DB to reschedule; create one via /book-meeting first')
    exit(1)

meeting = meetings[0]
meeting_id = meeting.get('_id')
old_datetime = meeting.get('meeting_datetime')
print('Found meeting:', meeting_id, old_datetime)

# Reschedule to 1 day later from now (avoid parsing DB date formats)
new_dt = (datetime.now() + timedelta(days=1, hours=1)).replace(second=0, microsecond=0)
new_datetime_str = new_dt.isoformat()[:16]  # YYYY-MM-DDTHH:MM

print('Rescheduling to:', new_datetime_str)
res = session.post(f"{BASE_URL}/admin/meeting/{meeting_id}/reschedule", json={"new_datetime": new_datetime_str})
print('Reschedule response:', res.status_code, res.text)
try:
    print('Reschedule JSON:', res.json())
except Exception:
    pass

# Fetch db again
print('Fetching DB after reschedule...')
db2 = session.get(f"{BASE_URL}/debug/db")
print('Post-reschedule DB fetch:', db2.status_code)
db2.raise_for_status()
json_db2 = db2.json()
meetings2 = json_db2.get('meetings', [])
for m in meetings2:
    if m.get('_id') == meeting_id:
        print('Updated meeting datetime in DB:', m.get('meeting_datetime'))
        break
else:
    print('Meeting not found after reschedule')
