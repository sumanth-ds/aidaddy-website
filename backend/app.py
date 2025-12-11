from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, Response
from jinja2.exceptions import TemplateNotFound
from flask_mail import Mail, Message
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_pymongo import PyMongo
from flask_cors import CORS
import csv
from io import StringIO
from mail import (
    send_contact_email,
    send_meeting_email,
    # Bring in both the user + admin meeting request helpers so we can send both
    send_meeting_request_confirmation_email,
    send_meeting_request_email,
    send_meeting_reschedule_email
)
from pymongo import ReturnDocument
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import traceback
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from bson import ObjectId

class Pagination:
    def __init__(self, page, per_page, total):
        self.page = page
        self.per_page = per_page
        self.total = total
        self.pages = (total + per_page - 1) // per_page
    
    @property
    def prev_num(self):
        return self.page - 1 if self.page > 1 else None
    
    @property
    def next_num(self):
        return self.page + 1 if self.page < self.pages else None
    
    @property
    def has_prev(self):
        return self.page > 1
    
    @property
    def has_next(self):
        return self.page < self.pages
    
    def iter_pages(self):
        left = max(1, self.page - 2)
        right = min(self.pages + 1, self.page + 3)
        return range(left, right)

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Serve React frontend files as templates/static. Prefer the built `dist` folder if available
frontend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'react-frontend'))
frontend_dist = os.path.join(frontend_root, 'dist')
template_dir = frontend_root
static_dir = None
static_url_path = None
if os.path.exists(os.path.join(frontend_dist, 'index.html')):
    template_dir = frontend_dist
    assets_path = os.path.join(frontend_dist, 'assets')
    if os.path.exists(assets_path):
        static_dir = assets_path
        static_url_path = '/assets'
    else:
        static_dir = frontend_dist
        static_url_path = '/'
elif not os.path.exists(os.path.join(template_dir, 'index.html')):
    print(f"Warning: Could not find index.html in {template_dir} or {frontend_dist}")

if static_dir:
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir, static_url_path=static_url_path)
else:
    app = Flask(__name__, template_folder=template_dir)
app.secret_key = os.getenv('SECRET_KEY')

# Mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER') or app.config['MAIL_USERNAME']

# Database configuration
app.config['MONGO_URI'] = os.getenv('MONGODB_URI')
mongo = PyMongo(app)

# CORS configuration for React frontend - allow dev servers
from urllib.parse import urlparse

allowed_frontend_origins = [u.strip() for u in os.getenv('FRONTEND_ORIGINS', 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5174,http://127.0.0.1:3000,http://localhost:5174/').split(',') if u.strip()]
# If front-end Vite base URL is provided, also add it to allowed origins
vite_api_base = os.getenv('VITE_API_BASE_URL')
if vite_api_base:
    try:
        parsed = urlparse(vite_api_base)
        if parsed.scheme and parsed.netloc:
            origin_from_vite = f"{parsed.scheme}://{parsed.netloc}"
            if origin_from_vite not in allowed_frontend_origins:
                allowed_frontend_origins.append(origin_from_vite)
    except Exception:
        pass

CORS(app, resources={
    r"/*": {
        "origins": [
            *allowed_frontend_origins,
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
mail = Mail(app)


# Initialize default admin in DB if not present
def create_default_admin():
    default_username = os.getenv('ADMIN_USERNAME', 'admin')
    default_password = os.getenv('ADMIN_PASSWORD', 'admin123')
    try:
        existing = mongo.db.admins.find_one({'username': default_username})
        if not existing:
            hashed = generate_password_hash(default_password)
            mongo.db.admins.insert_one({
                'username': default_username,
                'password_hash': hashed,
                'created_at': datetime.now(),
                'is_super': True
            })
            print(f"Default admin user created: {default_username}")
        else:
            # If env defaults differ from DB, do not alter DB user by default
            print(f"Admin user already present in DB: {existing.get('username')}")
    except Exception as e:
        print(f"Failed to ensure default admin in DB: {e}")

# Ensure default admin exists on startup
create_default_admin()

# Login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


# Customize unauthorized handler for API vs browser
@login_manager.unauthorized_handler
def unauthorized_callback():
    # If the client requested JSON (SPA), return a JSON 401 so the frontend can show a login modal
    if request.args.get('json') == '1' or request.headers.get('Accept', '').lower().startswith('application/json'):
        return jsonify({'message': 'Unauthorized', 'success': False}), 401
    # Default: redirect to the login route (serves our SPA index.html)
    return redirect(url_for('login'))

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

# @app.route('/')
# def home():
#     return render_template('index.html')

@app.route('/demo')
def demo():
    # Serve SPA's index.html for demo path as well; frontend handles routing
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    # Attempt to send email, note result, but save the contact regardless
    email_sent = False
    try:
        result = send_contact_email(mail, name, email, message)
        email_sent = bool(result.get('user') or result.get('admin'))
        # Log if admin notification failed
        if not result.get('admin'):
            print(f"Contact email: admin notification not sent or failed. Errors: {result.get('errors')}")
    except Exception as e:
        print(f"Email sending failed: {e}")

    # Save to database regardless
    try:
        # Save flags for both user and admin email delivery
        mongo.db.contacts.insert_one({
            "name": name,
            "email": email,
            "message": message,
            "timestamp": datetime.now(),
            "email_sent": email_sent,
            "email_sent_user": bool(result.get('user')) if isinstance(result, dict) else email_sent,
            "email_sent_admin": bool(result.get('admin')) if isinstance(result, dict) else False
        })
    except Exception as e:
        print(f"Failed to save contact: {e}")
    
    if email_sent:
        return jsonify({"message": "Thank you for contacting us! We will get back to you soon."})
    else:
        return jsonify({"message": "Your message has been saved. We will contact you soon."})

@app.route('/debug/db')
def debug_db():
    contacts = []
    for contact in mongo.db.contacts.find().limit(5):
        contact['_id'] = str(contact['_id'])
        contacts.append(contact)
    
    meetings = []
    for meeting in mongo.db.meetings.find().limit(5):
        meeting['_id'] = str(meeting['_id'])
        meetings.append(meeting)
    
    return jsonify({
        'contacts_count': mongo.db.contacts.count_documents({}),
        'meetings_count': mongo.db.meetings.count_documents({}),
        'contacts': contacts,
        'meetings': meetings
    })

@app.route('/api/available-slots')
def get_available_slots():
    # Generate all time slots for the next 90 days
    # Business hours: 9 AM - 5 PM, Monday-Friday
    slots = []
    today = datetime.now().date()

    # Fetch all booked meeting datetimes at once
    try:
        booked_slots = set()
        for meeting in mongo.db.meetings.find({}, {"meeting_datetime": 1}):
            if meeting.get('meeting_datetime'):
                booked_slots.add(meeting['meeting_datetime'])
        print(f"get_available_slots: found {len(booked_slots)} booked slots in DB")
        # Log request context for debugging network errors seen by frontend
        try:
            origin = request.headers.get('Origin')
            referer = request.headers.get('Referer')
            ua = request.headers.get('User-Agent')
            print(f"get_available_slots request: remote_addr={request.remote_addr}, origin={origin}, referer={referer}, user_agent={ua}")
        except Exception as e:
            print(f"get_available_slots: failed to log request context: {e}")
    except Exception as e:
        print(f"DB error in get_available_slots: {e}")
        import traceback; traceback.print_exc()
        booked_slots = set()

    for day_offset in range(90):
        current_date = today + timedelta(days=day_offset)

        # Skip weekends
        if current_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
            continue

        # Generate hourly slots from 9 AM to 4 PM (30-min meetings)
        for hour in range(9, 17):  # 9 AM to 4 PM
            slot_time = datetime.combine(current_date, datetime.min.time().replace(hour=hour))

            # Check if slot is already booked
            available = slot_time not in booked_slots

            slots.append({
                'datetime': slot_time.isoformat(),
                'display': slot_time.strftime('%A, %B %d at %I:%M %p'),
                'available': available,
                'booked': not available,
                'date': current_date.isoformat(),
                'time': slot_time.strftime('%I:%M %p'),
                'day': current_date.strftime('%A'),
                'day_short': current_date.strftime('%a')
            })

    return jsonify({'slots': slots})

@app.route('/book-meeting', methods=['POST'])
def book_meeting():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    datetime_str = data.get('datetime')
    print(f"Received booking request: name={name}, email={email}, datetime={datetime_str}")
    
    try:
        meeting_datetime = datetime.fromisoformat(datetime_str)
        
        # Check if slot is still available
        existing_meeting = mongo.db.meetings.find_one({"meeting_datetime": meeting_datetime})
        if existing_meeting:
            return jsonify({"message": "This time slot is no longer available. Please choose another time."}), 400
        
        # Save meeting request to database (without meeting link)
        result = mongo.db.meetings.insert_one({
            "name": name,
            "email": email,
            "meeting_datetime": meeting_datetime,
            "timestamp": datetime.now(),
            "meeting_link": "",  # Will be provided later by admin
            "status": "pending"  # Status indicates waiting for meeting link
        })
        print(f"Meeting inserted with ID: {result.inserted_id}")
        
        # Send meeting request confirmation to the user and notify company/admin
        email_result = { 'user': False, 'admin': False, 'errors': [] }
        try:
            try:
                send_meeting_request_confirmation_email(mail, name, email, meeting_datetime)
                email_result['user'] = True
            except Exception as e:
                print(f"Email sending to user failed: {e}")
                import traceback; traceback.print_exc()
                email_result['errors'].append(str(e))

            try:
                # Notify the company/admin
                send_meeting_request_email(mail, name, email, meeting_datetime)
                email_result['admin'] = True
            except Exception as e:
                print(f"Email sending to admin failed: {e}")
                import traceback; traceback.print_exc()
                email_result['errors'].append(str(e))
        except Exception as e:
            # Fallback generic log if something unexpected happens
            print(f"Unexpected error sending meeting emails: {e}")
        
        # Persist the email sent flags on the meeting record for debugging/tracking
        email_sent = bool(email_result.get('user') or email_result.get('admin'))
        try:
            mongo.db.meetings.update_one({'_id': result.inserted_id}, {
                '$set': {
                    'email_sent': email_sent,
                    'email_sent_user': bool(email_result.get('user')),
                    'email_sent_admin': bool(email_result.get('admin'))
                }
            })
            print(f"Updated meeting record {result.inserted_id} with email_sent_user={email_result.get('user')}, email_sent_admin={email_result.get('admin')}")
        except Exception as e:
            print(f"Failed to update meeting record with email flags: {e}")
        print(f"Booking email_result: {email_result}")

        return jsonify({
            "message": "Meeting request submitted successfully! We will contact you soon with the meeting link.",
        })
    
    except Exception as e:
        print(f"Meeting booking failed: {e}")
        return jsonify({"message": "Failed to submit meeting request. Please try again."}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Support both form-encoded and JSON login
        data = request.get_json(silent=True) or request.form
        username = data.get('username')
        password = data.get('password')
        admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        print(f'Login attempt received - username: {username}, password: {password}, ADMIN_USERNAME: {admin_username}')

        # Check DB first (if admin user exists in DB)
        try:
            db_admin = mongo.db.admins.find_one({'username': username})
        except Exception as e:
            print(f"Error fetching admin user from DB: {e}")
            db_admin = None

        if db_admin:
            pw_hash = db_admin.get('password_hash')
            if pw_hash and check_password_hash(pw_hash, password):
                user = User(1)
                login_user(user)
                if request.is_json or request.headers.get('Accept', '').lower().startswith('application/json'):
                    return jsonify({'message': 'Login successful', 'success': True})
                return redirect(url_for('admin'))
            # invalid password for DB user; fall back to env credentials if they match
            if username == admin_username and password == admin_password:
                user = User(1)
                login_user(user)
                if request.is_json or request.headers.get('Accept', '').lower().startswith('application/json'):
                    return jsonify({'message': 'Login successful (env fallback)', 'success': True})
                return redirect(url_for('admin'))
        # Fallback: check environment variables
        if username == admin_username and password == admin_password:
            user = User(1)
            login_user(user)
            # If JSON request, return JSON success
            if request.is_json or request.headers.get('Accept', '').lower().startswith('application/json'):
                return jsonify({'message': 'Login successful', 'success': True})
            return redirect(url_for('admin'))
        # If JSON, return JSON error; otherwise flash and return SPA
        if request.is_json or request.headers.get('Accept', '').lower().startswith('application/json'):
            return jsonify({'message': 'Invalid credentials', 'success': False}), 401
        flash('Invalid credentials')
    # For SPA, serve the React `index.html` and let the frontend handle the login UI
    return render_template('index.html')


@app.errorhandler(404)
def handle_404(e):
    # API routes should return JSON 404
    if request.path.startswith('/api'):
        return jsonify({'message': 'Not Found', 'success': False}), 404
    # Otherwise fallback to SPA index so frontend can handle routing
    try:
        return render_template('index.html')
    except TemplateNotFound:
        return jsonify({'message': 'Not Found', 'success': False}), 404

@app.route('/logout')
@login_required
def logout():
    logout_user()
    # For SPA and API requests, return JSON for API calls, else redirect home
    if request.is_json or request.headers.get('Accept', '').lower().startswith('application/json'):
        return jsonify({'message': 'Logged out', 'success': True})
    return redirect(url_for('home'))


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or request.form
    username = data.get('username')
    password = data.get('password')
    print(f"API login attempt: username={username}, origin={request.headers.get('Origin')}")
    admin_username = os.getenv('ADMIN_USERNAME', 'admin')
    admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
    # prefer DB admin user if present
    try:
        db_admin = mongo.db.admins.find_one({'username': username})
    except Exception as e:
        print(f"Error fetching admin user from DB: {e}")
        db_admin = None

    if db_admin:
        pw_hash = db_admin.get('password_hash')
        if pw_hash and check_password_hash(pw_hash, password):
            user = User(1)
            login_user(user)
            return jsonify({'message': 'Login successful', 'success': True})
        # if DB user fails, fallback to env creds if they match
        if username == admin_username and password == admin_password:
            user = User(1)
            login_user(user)
            return jsonify({'message': 'Login successful (env fallback)', 'success': True})
        print('API login failed: invalid credentials')
        return jsonify({'message': 'Invalid credentials', 'success': False}), 401

    if username == admin_username and password == admin_password:
        user = User(1)
        login_user(user)
        return jsonify({'message': 'Login successful', 'success': True})
    return jsonify({'message': 'Invalid credentials', 'success': False}), 401


@app.route('/api/logout', methods=['POST', 'GET'])
def api_logout():
    logout_user()
    return jsonify({'message': 'Logged out', 'success': True})

@app.route('/admin')
@login_required
def admin():
    # Serve the React app for the /admin path so the SPA can handle routing
    # If the request contains `?json=1` or `Accept: application/json`, we return JSON data instead
    if request.args.get('json') == '1' or request.headers.get('Accept', '').lower().startswith('application/json'):
        page = request.args.get('page', 1, type=int)
        per_page = 10
        search = request.args.get('search', '')
        query = {}
        if search:
            query = {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}},
                    {"message": {"$regex": search, "$options": "i"}}
                ]
            }

        contacts_cursor = mongo.db.contacts.find(query).skip((page-1)*per_page).limit(per_page)
        contacts = []
        for contact in contacts_cursor:
            contacts.append({
                'id': str(contact.get('_id')),
                'name': contact.get('name'),
                'email': contact.get('email'),
                'message': contact.get('message'),
                'timestamp': contact.get('timestamp').isoformat() if contact.get('timestamp') else None
            })
        total_contacts = mongo.db.contacts.count_documents(query)
        contacts_pagination = {
            'page': page,
            'per_page': per_page,
            'total': total_contacts
        }

        meetings_page = request.args.get('meetings_page', 1, type=int)
        meetings_cursor = mongo.db.meetings.find().sort("meeting_datetime", -1).skip((meetings_page-1)*per_page).limit(per_page)
        meetings = []
        for meeting in meetings_cursor:
            meetings.append({
                'id': str(meeting.get('_id')),
                'name': meeting.get('name'),
                'email': meeting.get('email'),
                'meeting_datetime': meeting.get('meeting_datetime').isoformat() if meeting.get('meeting_datetime') else None,
                'status': meeting.get('status', 'pending'),
                'meeting_link': meeting.get('meeting_link', '')
            })
        total_meetings = mongo.db.meetings.count_documents({})
        meetings_pagination = {
            'page': meetings_page,
            'per_page': per_page,
            'total': total_meetings
        }

        return jsonify({
            'contacts': contacts,
            'meetings': meetings,
            'contacts_pagination': contacts_pagination,
            'meetings_pagination': meetings_pagination
        })

    # Default behavior: serve React's index.html so that the SPA handles the admin page
    return render_template('index.html')


@app.route('/api/admin')
@login_required
def api_admin():
    """Return admin data as JSON for SPA consumption."""
    page = request.args.get('page', 1, type=int)
    per_page = 10
    search = request.args.get('search', '')
    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"message": {"$regex": search, "$options": "i"}}
            ]
        }

    contacts_cursor = mongo.db.contacts.find(query).skip((page-1)*per_page).limit(per_page)
    contacts = []
    for contact in contacts_cursor:
        contacts.append({
            'id': str(contact.get('_id')),
            'name': contact.get('name'),
            'email': contact.get('email'),
            'message': contact.get('message'),
            'timestamp': contact.get('timestamp').isoformat() if contact.get('timestamp') else None
        })
    total_contacts = mongo.db.contacts.count_documents(query)
    contacts_pagination = {
        'page': page,
        'per_page': per_page,
        'total': total_contacts
    }

    meetings_page = request.args.get('meetings_page', 1, type=int)
    meetings_cursor = mongo.db.meetings.find().sort("meeting_datetime", -1).skip((meetings_page-1)*per_page).limit(per_page)
    meetings = []
    for meeting in meetings_cursor:
        meetings.append({
            'id': str(meeting.get('_id')),
            'name': meeting.get('name'),
            'email': meeting.get('email'),
            'meeting_datetime': meeting.get('meeting_datetime').isoformat() if meeting.get('meeting_datetime') else None,
            'status': meeting.get('status', 'pending'),
            'meeting_link': meeting.get('meeting_link', '')
        })
    total_meetings = mongo.db.meetings.count_documents({})
    meetings_pagination = {
        'page': meetings_page,
        'per_page': per_page,
        'total': total_meetings
    }

    return jsonify({
        'contacts': contacts,
        'meetings': meetings,
        'contacts_pagination': contacts_pagination,
        'meetings_pagination': meetings_pagination
    })


@app.route('/admin/download/contacts')
@login_required
def download_contacts():
    # Get all contacts
    contacts = list(mongo.db.contacts.find())
    
    # Create CSV
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Name', 'Email', 'Message', 'Timestamp', 'Email Sent'])
    
    # Write data
    for contact in contacts:
        writer.writerow([
            contact.get('name', ''),
            contact.get('email', ''),
            contact.get('message', ''),
            contact.get('timestamp', '').strftime('%Y-%m-%d %H:%M:%S') if contact.get('timestamp') else '',
            'Yes' if contact.get('email_sent', False) else 'No'
        ])
    
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=contacts.csv'}
    )


@app.route('/admin/download/meetings')
@login_required
def download_meetings():
    # Get all meetings
    meetings = list(mongo.db.meetings.find())
    
    # Create CSV
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Name', 'Email', 'Meeting DateTime', 'Status', 'Meeting Link'])
    
    # Write data
    for meeting in meetings:
        writer.writerow([
            meeting.get('name', ''),
            meeting.get('email', ''),
            meeting.get('meeting_datetime', '').strftime('%Y-%m-%d %H:%M:%S') if meeting.get('meeting_datetime') else '',
            meeting.get('status', 'pending'),
            meeting.get('meeting_link', '')
        ])
    
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=meetings.csv'}
    )

@app.route('/admin/meeting/<meeting_id>/provide-link', methods=['POST'])
@login_required
def provide_meeting_link(meeting_id):
    data = request.json
    meeting_link = data.get('meeting_link')
    
    if not meeting_link:
        return jsonify({"message": "Meeting link is required."}), 400
    
    try:
        meeting = mongo.db.meetings.find_one({"_id": ObjectId(meeting_id)})
        if not meeting:
            return jsonify({"message": "Meeting not found."}), 404
        
        # Update meeting with link and change status
        mongo.db.meetings.update_one(
            {"_id": ObjectId(meeting_id)},
            {"$set": {"meeting_link": meeting_link, "status": "scheduled"}}
        )
        
        # Send confirmation email to client
        send_meeting_email(mail, meeting.get('name'), meeting.get('email'), meeting.get('meeting_datetime'), meeting_link)
        
        # Also send notification to admin that the link has been provided
        admin_msg = Message('Meeting Link Provided - Aidaddy',
                           recipients=[os.getenv('MAIL_USERNAME')])
        admin_msg.body = f"""Meeting link has been provided for the following meeting:

    Client: {meeting.get('name')} ({meeting.get('email')})
    Date & Time: {meeting.get('meeting_datetime').strftime('%A, %B %d, %Y at %I:%M %p') if meeting.get('meeting_datetime') else ''}
    Meeting Link: {meeting_link}

    The client has been notified via email."""
        
        admin_msg.html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }}
                .meeting-info {{ background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>✅ Meeting Link Provided</h2>
                </div>
                <div class="content">
                    <p>A meeting link has been provided and the client has been notified.</p>
                    
                    <div class="meeting-info">
                        <h3>📋 Meeting Details</h3>
                        <p><strong>Client:</strong> {meeting.get('name')} ({meeting.get('email')})</p>
                        <p><strong>Date & Time:</strong> {meeting.get('meeting_datetime').strftime('%A, %B %d, %Y at %I:%M %p') if meeting.get('meeting_datetime') else ''}</p>
                        <p><strong>Meeting Link:</strong> <a href="{meeting_link}" target="_blank">{meeting_link}</a></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        try:
            mail.send(admin_msg)
        except Exception as e:
            print(f"Failed to send admin notification: {e}")
        
        return jsonify({"message": "Meeting link provided successfully! Client has been notified."})
    
    except Exception as e:
        print(f"Failed to provide meeting link: {e}")
        return jsonify({"message": "Failed to provide meeting link. Please try again."}), 500

@app.route('/admin/meeting/<meeting_id>/reschedule', methods=['POST'])
@login_required
def reschedule_meeting(meeting_id):
    data = request.json
    new_datetime_str = data.get('new_datetime')
    
    if not new_datetime_str:
        return jsonify({"message": "New date and time are required."}), 400
    
    try:
        meeting = mongo.db.meetings.find_one({"_id": ObjectId(meeting_id)})
        if not meeting:
            return jsonify({"message": "Meeting not found."}), 404
        new_datetime = datetime.fromisoformat(new_datetime_str)
        
        # Check if the new slot is available
        existing_meeting = mongo.db.meetings.find_one({
            "meeting_datetime": new_datetime,
            "_id": {"$ne": ObjectId(meeting_id)}
        })
        
        if existing_meeting:
            return jsonify({"message": "This time slot is already booked. Please choose another time."}), 400
        
        old_datetime = meeting.get('meeting_datetime')
        updated_meeting = mongo.db.meetings.find_one_and_update(
            {"_id": ObjectId(meeting_id)},
            {"$set": {"meeting_datetime": new_datetime}},
            return_document=ReturnDocument.AFTER
        )

        if not updated_meeting:
            print("Reschedule: update did not return updated document")
            return jsonify({"message": "Failed to reschedule meeting. Meeting not updated."}), 500

        print(f"Reschedule: meeting {meeting_id} updated from {old_datetime} to {new_datetime}")
        
        # Attempt to send reschedule notification emails (user + admin)
        try:
            # Log email settings (not secrets) to aid debugging
            print('mail config - MAIL_USERNAME:', app.config.get('MAIL_USERNAME'), 'MAIL_DEFAULT_SENDER:', app.config.get('MAIL_DEFAULT_SENDER'))
            email_result = send_meeting_reschedule_email(mail, updated_meeting.get('name'), updated_meeting.get('email'), old_datetime, new_datetime, updated_meeting.get('meeting_link', ''))
            print(f"Reschedule: email_result: {email_result}")
        except Exception as e:
            print(f"Failed to send reschedule email notifications: {e}")
            traceback.print_exc()

        return jsonify({
            "message": f"Meeting rescheduled successfully from {old_datetime.strftime('%Y-%m-%d %H:%M') if old_datetime else 'N/A'} to {new_datetime.strftime('%Y-%m-%d %H:%M')}.", 
            "meeting": {"id": str(updated_meeting.get('_id')), "meeting_datetime": updated_meeting.get('meeting_datetime').isoformat() if updated_meeting.get('meeting_datetime') else None},
            "email_result": email_result if 'email_result' in locals() else None
        })
    
    except Exception as e:
        print(f"Failed to reschedule meeting: {e}")
        return jsonify({"message": "Failed to reschedule meeting. Please try again."}), 500

@app.route('/admin/meeting/<meeting_id>/complete', methods=['POST'])
@login_required
def complete_meeting(meeting_id):
    try:
        meeting = mongo.db.meetings.find_one({"_id": ObjectId(meeting_id)})
        if not meeting:
            return jsonify({"message": "Meeting not found."}), 404
        mongo.db.meetings.update_one(
            {"_id": ObjectId(meeting_id)},
            {"$set": {"status": "completed"}}
        )
        
        return jsonify({"message": "Meeting marked as completed successfully!"})
    
    except Exception as e:
        print(f"Failed to complete meeting: {e}")
        return jsonify({"message": "Failed to update meeting status. Please try again."}), 500

@app.route('/admin/meeting/<meeting_id>/delete', methods=['POST'])
@login_required
def delete_meeting(meeting_id):
    try:
        meeting = mongo.db.meetings.find_one({"_id": ObjectId(meeting_id)})
        if not meeting:
            return jsonify({"message": "Meeting not found."}), 404
        mongo.db.meetings.delete_one({"_id": ObjectId(meeting_id)})
        
        return jsonify({"message": "Meeting deleted successfully!"})
    
    except Exception as e:
        print(f"Failed to delete meeting: {e}")
        return jsonify({"message": "Failed to delete meeting. Please try again."}), 500

@app.route('/admin/contact/<contact_id>/delete', methods=['POST'])
@login_required
def delete_contact(contact_id):
    try:
        contact = mongo.db.contacts.find_one({"_id": ObjectId(contact_id)})
        if not contact:
            return jsonify({"message": "Contact not found."}), 404
        mongo.db.contacts.delete_one({"_id": ObjectId(contact_id)})
        
        return jsonify({"message": "Contact deleted successfully!"})
    
    except Exception as e:
        print(f"Failed to delete contact: {e}")
        return jsonify({"message": "Failed to delete contact. Please try again."}), 500


@app.route('/debug/email-test', methods=['POST'])
def debug_email_test():
    # Basic endpoint to test email delivery; requires JSON: { "to": "email@address" }
    data = request.json or {}
    to = data.get('to') or app.config.get('MAIL_USERNAME')
    if not to:
        return jsonify({"message": "No recipient specified and MAIL_USERNAME is not configured."}), 400
    try:
        print('Attempting email test to:', to)
        test_msg = Message('Aidaddy - Test Email', recipients=[to])
        test_msg.body = 'This is a test email from Aidaddy to verify SMTP connectivity.'
        mail.send(test_msg)
        print('Email test: sent successfully')
        return jsonify({"message": f"Test email sent to {to}"})
    except Exception as e:
        print('Email test: failed', e)
        traceback.print_exc()
        return jsonify({"message": "Failed to send test email.", "error": str(e)}), 500


@app.route('/debug/headers', methods=['GET', 'POST', 'OPTIONS'])
def debug_headers():
    # Return request headers and a few context values so devs can test CORS and preflight
    headers = {k: v for k, v in request.headers.items()}
    return jsonify({
        'origin': headers.get('Origin'),
        'referer': headers.get('Referer'),
        'user_agent': headers.get('User-Agent'),
        'all_headers': headers,
    })


@app.route('/debug/update-meeting-email-flags', methods=['POST'])
def debug_update_meeting_email_flags():
    # Debug-only: update the meeting record's email flags
    data = request.json or {}
    id = data.get('id')
    user_flag = bool(data.get('email_sent_user')) if 'email_sent_user' in data else None
    admin_flag = bool(data.get('email_sent_admin')) if 'email_sent_admin' in data else None
    if not id:
        return jsonify({ 'message': 'Missing id' }), 400
    try:
        from bson import ObjectId
        update = {}
        if user_flag is not None:
            update['email_sent_user'] = user_flag
        if admin_flag is not None:
            update['email_sent_admin'] = admin_flag
        if update:
            mongo.db.meetings.update_one({ '_id': ObjectId(id) }, { '$set': update })
            return jsonify({ 'message': 'Updated', 'id': id, 'updated': update })
        return jsonify({ 'message': 'No flags provided' }), 400
    except Exception as e:
        print('debug_update_meeting_email_flags failed:', e)
        traceback.print_exc()
        return jsonify({ 'message': 'Failed to update', 'error': str(e) }), 500


@app.route('/api/terms-and-conditions')
def api_terms_and_conditions():
    """Return terms and conditions as JSON for API consumption."""
    terms_file = os.path.join(os.path.dirname(__file__), '..', 'TERMS_AND_CONDITIONS.md')
    try:
        with open(terms_file, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({
            'success': True,
            'content': content,
            'last_updated': 'December 1, 2025'
        })
    except FileNotFoundError:
        return jsonify({
            'success': False,
            'message': 'Terms and Conditions file not found'
        }), 404
    except Exception as e:
        print(f"Error reading terms and conditions: {e}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving terms and conditions'
        }), 500


@app.route('/api/privacy-policy')
def api_privacy_policy():
    """Return privacy policy as JSON for API consumption."""
    privacy_file = os.path.join(os.path.dirname(__file__), '..', 'PRIVACY_POLICY.md')
    try:
        with open(privacy_file, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({
            'success': True,
            'content': content,
            'last_updated': 'December 1, 2025'
        })
    except FileNotFoundError:
        return jsonify({
            'success': False,
            'message': 'Privacy Policy file not found'
        }), 404
    except Exception as e:
        print(f"Error reading privacy policy: {e}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving privacy policy'
        }), 500

if __name__ == '__main__':
    # use_reloader=False is used to prevent [WinError 10038] on Windows
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
