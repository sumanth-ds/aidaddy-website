
from app import app, db
from models import Meeting

with app.app_context():
    meetings = Meeting.query.all()
    print(f"Total meetings in database: {len(meetings)}")
    for meeting in meetings:
        print(f"ID: {meeting.id}, Name: {meeting.name}, Email: {meeting.email}")
        print(f"DateTime: {meeting.meeting_datetime}, Link: '{meeting.meeting_link}'")
        print(f"Status: {meeting.status}")
        print("---")