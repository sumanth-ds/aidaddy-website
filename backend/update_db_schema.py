"""
Script to update existing database records with the new company_url field
"""
from app import app, mongo
from datetime import datetime

def update_meetings_schema():
    """Add company_url field to existing meeting records"""
    with app.app_context():
        try:
            # Update all meetings that don't have company_url field
            result = mongo.db.meetings.update_many(
                {"company_url": {"$exists": False}},
                {"$set": {"company_url": ""}}
            )
            
            print(f"✅ Updated {result.modified_count} meeting records with company_url field")
            
            # Get total count
            total = mongo.db.meetings.count_documents({})
            print(f"📊 Total meetings in database: {total}")
            
            # Show sample of updated records
            print("\n📋 Sample records:")
            for meeting in mongo.db.meetings.find().limit(3):
                print(f"  - {meeting.get('name')} ({meeting.get('email')})")
                print(f"    Company: {meeting.get('company', 'N/A')}")
                print(f"    Company URL: {meeting.get('company_url', 'N/A')}")
                print(f"    Meeting: {meeting.get('meeting_datetime')}")
                print()
            
            return True
            
        except Exception as e:
            print(f"❌ Error updating database: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    print("🔄 Starting database schema update...\n")
    success = update_meetings_schema()
    
    if success:
        print("\n✅ Database update completed successfully!")
    else:
        print("\n❌ Database update failed. Please check the error messages above.")
