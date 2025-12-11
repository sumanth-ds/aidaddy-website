from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, Response
from jinja2.exceptions import TemplateNotFound
from flask_mail import Mail, Message
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_pymongo import PyMongo
from mail import send_contact_email, send_meeting_email, send_meeting_request_email, send_meeting_request_confirmation_email
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import uuid
from bson import ObjectId
import csv
from io import StringIO

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
    # The production bundle exposes assets under /assets
    assets_path = os.path.join(frontend_dist, 'assets')
    if os.path.exists(assets_path):
        static_dir = assets_path
        static_url_path = '/assets'
    else:
        # Fallback to dist as static dir
        static_dir = frontend_dist
        static_url_path = '/'
elif not os.path.exists(os.path.join(template_dir, 'index.html')):
    # If neither dist/index.html nor src/index.html are present, log for debugging
    print(f"Warning: Could not find index.html in {template_dir} or {frontend_dist}")

if static_dir:
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir, static_url_path=static_url_path)
else:
    app = Flask(__name__, template_folder=template_dir)
app.secret_key = os.getenv('SECRET_KEY')

# Database configuration
app.config['MONGO_URI'] = os.getenv('MONGODB_URI')
mongo = PyMongo(app)

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
mail = Mail(app)

# Login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/demo')
def demo():
    # Serve SPA for demo route
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    # Check for duplicate submissions (same email and message within last 5 minutes)
    five_minutes_ago = datetime.now() - timedelta(minutes=5)
    existing_contact = mongo.db.contacts.find_one({
        "email": email,
        "message": message,
        "timestamp": {"$gte": five_minutes_ago}
    })
    
    if existing_contact:
        return jsonify({"message": "This message has already been submitted recently. Please wait a few minutes before submitting again."}), 429

    # Send email first
    email_sent = False
    try:
        send_contact_email(mail, name, email, message)
        email_sent = True
    except Exception as e:
        print(f"Email sending failed: {e}")
    
    # Save to database regardless
    mongo.db.contacts.insert_one({
        "name": name,
        "email": email,
        "message": message,
        "timestamp": datetime.now(),
        "email_sent": email_sent
    })
    
    if email_sent:
        return jsonify({"message": "Thank you for contacting us! We will get back to you soon.", "email_sent": True})
    else:
        return jsonify({"message": "Your message has been saved. We will contact you soon.", "email_sent": False})

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
    booked_slots = set()
    for meeting in mongo.db.meetings.find({}, {"meeting_datetime": 1}):
        if meeting.get('meeting_datetime'):
            booked_slots.add(meeting['meeting_datetime'])

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
    
    try:
        meeting_datetime = datetime.fromisoformat(datetime_str)
        
        # Check for duplicate meeting requests (same email within last 10 minutes)
        ten_minutes_ago = datetime.now() - timedelta(minutes=10)
        existing_request = mongo.db.meetings.find_one({
            "email": email,
            "timestamp": {"$gte": ten_minutes_ago}
        })
        
        if existing_request:
            return jsonify({"message": "You have already submitted a meeting request recently. Please wait before submitting another request."}), 429
        
        # Check if slot is still available
        existing_meeting = mongo.db.meetings.find_one({"meeting_datetime": meeting_datetime})
        if existing_meeting:
            return jsonify({"message": "This time slot is no longer available. Please choose another time."}), 400
        
        # Save meeting request to database (without meeting link)
        result = mongo.db.meetings.insert_one({
            "name": name,
            "email": email,
            "meeting_datetime": meeting_datetime,
            "meeting_link": "",  # Will be provided later by admin
            "status": "pending",  # Status indicates waiting for meeting link
            "timestamp": datetime.now()  # Add timestamp for duplicate prevention
        })
        print(f"Meeting inserted with ID: {result.inserted_id}")
        
        # Send meeting request email to company and confirmation to user
        email_sent = False
        try:
            send_meeting_request_email(mail, name, email, meeting_datetime)
            send_meeting_request_confirmation_email(mail, name, email, meeting_datetime)
            email_sent = True
        except Exception as e:
            print(f"Email sending failed: {e}")
        
        return jsonify({
            "message": "Meeting request submitted successfully! We will contact you soon with the meeting link.",
            "email_sent": email_sent
        })
    
    except Exception as e:
        print(f"Meeting booking failed: {e}")
        return jsonify({"message": "Failed to submit meeting request. Please try again."}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        username = data.get('username')
        password = data.get('password')
        admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        if username == admin_username and password == admin_password:
            user = User(1)
            login_user(user)
            if request.is_json or request.headers.get('Accept', '').lower().startswith('application/json'):
                return jsonify({'message': 'Login successful', 'success': True})
            return redirect(url_for('admin'))
        if request.is_json or request.headers.get('Accept', '').lower().startswith('application/json'):
            return jsonify({'message': 'Invalid credentials', 'success': False}), 401
        flash('Invalid credentials')
    # Serve SPA index for login page
    return render_template('index.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    if request.is_json or request.headers.get('Accept', '').lower().startswith('application/json'):
        return jsonify({'message': 'Logged out', 'success': True})
    return redirect(url_for('home'))


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or request.form
    username = data.get('username')
    password = data.get('password')
    admin_username = os.getenv('ADMIN_USERNAME', 'admin')
    admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
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
    print("Admin route called")
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
        contact['id'] = str(contact['_id'])
        contacts.append(contact)
    print(f"Fetched {len(contacts)} contacts for admin")
    total_contacts = mongo.db.contacts.count_documents(query)
    print(f"Total contacts in DB: {total_contacts}")
    contacts_pagination = Pagination(page, per_page, total_contacts)
    
    # Get meetings data
    meetings_page = request.args.get('meetings_page', 1, type=int)
    meetings_cursor = mongo.db.meetings.find().sort("meeting_datetime", -1).skip((meetings_page-1)*per_page).limit(per_page)
    meetings = []
    for meeting in meetings_cursor:
        meeting['id'] = str(meeting['_id'])
        meetings.append(meeting)
    print(f"Fetched {len(meetings)} meetings for admin")
    total_meetings = mongo.db.meetings.count_documents({})
    print(f"Total meetings in DB: {total_meetings}")
    meetings_pagination = Pagination(meetings_page, per_page, total_meetings)
    
    try:
        return render_template('admin.html', 
                         contacts=contacts, 
                         meetings=meetings,
                         search=search,
                         contacts_pagination=contacts_pagination,
                         meetings_pagination=meetings_pagination)
    except TemplateNotFound:
        # Fall back to the SPA index so the frontend can handle admin UI
        return render_template('index.html')


@app.errorhandler(404)
def handle_404(e):
    # If API route missing, return JSON 404
    if request.path.startswith('/api'):
        return jsonify({'message': 'Not Found', 'success': False}), 404
    # Otherwise fall back to SPA index (if present)
    try:
        return render_template('index.html')
    except TemplateNotFound:
        return jsonify({'message': 'Not Found', 'success': False}), 404

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
        send_meeting_email(mail, meeting.name, meeting.email, meeting.meeting_datetime, meeting_link)
        
        # Also send notification to admin that the link has been provided
        admin_msg = Message('Meeting Link Provided - Aidaddy',
                           recipients=[os.getenv('MAIL_USERNAME')])
        admin_msg.body = f"""Meeting link has been provided for the following meeting:

Client: {meeting.name} ({meeting.email})
Date & Time: {meeting.meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}
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
                        <p><strong>Client:</strong> {meeting.name} ({meeting.email})</p>
                        <p><strong>Date & Time:</strong> {meeting.meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
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
        
        old_datetime = meeting['meeting_datetime']
        mongo.db.meetings.update_one(
            {"_id": ObjectId(meeting_id)},
            {"$set": {"meeting_datetime": new_datetime}}
        )
        
        return jsonify({"message": f"Meeting rescheduled successfully from {old_datetime.strftime('%Y-%m-%d %H:%M')} to {new_datetime.strftime('%Y-%m-%d %H:%M')}."})
    
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)