"""
Script to check the most recent booking details
"""
from app import app, mongo
from datetime import datetime

def check_recent_booking():
    """Check the most recent booking details"""
    with app.app_context():
        try:
            # Get the most recent meeting
            recent_meeting = mongo.db.meetings.find_one(
                sort=[("timestamp", -1)]
            )
            
            if recent_meeting:
                print("📋 Most Recent Booking Details:")
                print("=" * 60)
                print(f"Name: {recent_meeting.get('name')}")
                print(f"Email: {recent_meeting.get('email')}")
                print(f"Phone: {recent_meeting.get('phone', 'MISSING')}")
                print(f"Company: {recent_meeting.get('company', 'MISSING')}")
                print(f"Company URL: {recent_meeting.get('company_url', 'MISSING')}")
                print(f"Project Type: {recent_meeting.get('project_type', 'MISSING')}")
                print(f"Budget: {recent_meeting.get('budget', 'MISSING')}")
                print(f"Message: {recent_meeting.get('message', 'MISSING')}")
                print(f"Meeting DateTime: {recent_meeting.get('meeting_datetime')}")
                print(f"Timestamp: {recent_meeting.get('timestamp')}")
                print(f"Status: {recent_meeting.get('status')}")
                print("=" * 60)
                
                # Check which fields are None or empty
                empty_fields = []
                for field in ['phone', 'company', 'company_url', 'project_type', 'budget', 'message']:
                    value = recent_meeting.get(field)
                    if not value:
                        empty_fields.append(field)
                
                if empty_fields:
                    print(f"\n⚠️  Empty/Missing Fields: {', '.join(empty_fields)}")
                else:
                    print("\n✅ All fields are populated!")
            else:
                print("❌ No bookings found in database")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    check_recent_booking()
