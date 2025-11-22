from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from flask_mail import Mail, Message
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_pymongo import PyMongo
from mail import send_contact_email, send_meeting_email, send_meeting_request_email
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
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

template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'templates'))
app = Flask(__name__, template_folder=template_dir)
app.secret_key = os.getenv('SECRET_KEY')

# Database configuration
app.config['MONGO_URI'] = os.getenv('MONGODB_URI')
mongo = PyMongo(app)
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
    return render_template('demo.html')

@app.route('/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

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
        return jsonify({"message": "Thank you for contacting us! We will get back to you soon."})
    else:
        return jsonify({"message": "Your message has been saved. We will contact you soon."})

@app.route('/get-started')
def get_started():
    return render_template('booking.html')

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
        
        # Check if slot is still available
        existing_meeting = mongo.db.meetings.find_one({"meeting_datetime": meeting_datetime})
        if existing_meeting:
            return jsonify({"message": "This time slot is no longer available. Please choose another time."}), 400
        
        # Save meeting request to database (without meeting link)
        mongo.db.meetings.insert_one({
            "name": name,
            "email": email,
            "meeting_datetime": meeting_datetime,
            "meeting_link": "",  # Will be provided later by admin
            "status": "pending"  # Status indicates waiting for meeting link
        })
        
        # Send meeting request email to company only
        send_meeting_request_email(mail, name, email, meeting_datetime)
        
        return jsonify({
            "message": "Meeting request submitted successfully! We will contact you soon with the meeting link.",
        })
    
    except Exception as e:
        print(f"Meeting booking failed: {e}")
        return jsonify({"message": "Failed to submit meeting request. Please try again."}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        if username == admin_username and password == admin_password:
            user = User(1)
            login_user(user)
            return redirect(url_for('admin'))
        flash('Invalid credentials')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/admin')
@login_required
def admin():
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
    total_contacts = mongo.db.contacts.count_documents(query)
    contacts_pagination = Pagination(page, per_page, total_contacts)
    
    # Get meetings data
    meetings_page = request.args.get('meetings_page', 1, type=int)
    meetings_cursor = mongo.db.meetings.find().sort("meeting_datetime", -1).skip((meetings_page-1)*per_page).limit(per_page)
    meetings = []
    for meeting in meetings_cursor:
        meeting['id'] = str(meeting['_id'])
        meetings.append(meeting)
    total_meetings = mongo.db.meetings.count_documents({})
    meetings_pagination = Pagination(meetings_page, per_page, total_meetings)
    
    return render_template('admin.html', 
                         contacts=contacts, 
                         meetings=meetings,
                         search=search,
                         contacts_pagination=contacts_pagination,
                         meetings_pagination=meetings_pagination)

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