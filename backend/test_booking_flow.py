"""
Test script to verify booking data flow
"""
import requests
import json
from datetime import datetime, timedelta

# Test booking endpoint
def test_booking():
    url = 'http://localhost:5000/book-meeting'
    
    # Create test booking data
    test_data = {
        'name': 'Test User',
        'email': 'test@example.com',
        'phone': '+1234567890',
        'company': 'Test Company',
        'companyUrl': 'https://testcompany.com',
        'projectType': 'ai-consulting',
        'budget': '10k-25k',
        'message': 'This is a test booking to verify all fields are working',
        'datetime': (datetime.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
    }
    
    print("🧪 Testing Booking Endpoint")
    print("=" * 60)
    print("\n📤 Sending data:")
    print(json.dumps(test_data, indent=2))
    print("\n" + "=" * 60)
    
    try:
        response = requests.post(url, json=test_data, headers={'Content-Type': 'application/json'})
        
        print(f"\n📥 Response Status: {response.status_code}")
        print(f"📥 Response Data: {response.json()}")
        
        if response.status_code == 200:
            print("\n✅ Booking successful!")
            
            # Now check the database
            print("\n🔍 Checking database...")
            from app import app, mongo
            with app.app_context():
                recent = mongo.db.meetings.find_one(
                    {"email": test_data['email']},
                    sort=[("timestamp", -1)]
                )
                
                if recent:
                    print("\n📋 Database Record:")
                    print(f"  Name: {recent.get('name')}")
                    print(f"  Email: {recent.get('email')}")
                    print(f"  Phone: {recent.get('phone', 'MISSING ❌')}")
                    print(f"  Company: {recent.get('company', 'MISSING ❌')}")
                    print(f"  Company URL: {recent.get('company_url', 'MISSING ❌')}")
                    print(f"  Project Type: {recent.get('project_type', 'MISSING ❌')}")
                    print(f"  Budget: {recent.get('budget', 'MISSING ❌')}")
                    print(f"  Message: {recent.get('message', 'MISSING ❌')}")
                    
                    # Verify all fields
                    all_fields_present = all([
                        recent.get('phone'),
                        recent.get('company'),
                        recent.get('company_url'),
                        recent.get('project_type'),
                        recent.get('budget'),
                        recent.get('message')
                    ])
                    
                    if all_fields_present:
                        print("\n✅ ALL FIELDS SAVED CORRECTLY!")
                    else:
                        print("\n❌ SOME FIELDS ARE MISSING!")
                else:
                    print("\n❌ No record found in database")
        else:
            print(f"\n❌ Booking failed: {response.json()}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error: Is the backend server running on http://localhost:5000?")
        print("   Start the backend with: python backend/app.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_booking()
