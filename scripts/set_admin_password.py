import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import os

if len(sys.argv) < 3:
    print('Usage: set_admin_password.py <username> <password>')
    sys.exit(1)

username = sys.argv[1]
password = sys.argv[2]

# Load env from backend/.env first, then root
load_dotenv('backend/.env')
load_dotenv()
uri = os.getenv('MONGODB_URI')
if not uri:
    print('MONGODB_URI not found in env')
    sys.exit(2)

client = MongoClient(uri)
db = client.get_default_database()
admin = db.admins.find_one({'username': username})
hashed = generate_password_hash(password)
if admin:
    db.admins.update_one({'username': username}, {'$set': {'password_hash': hashed}})
    print(f"Updated admin password for {username}")
else:
    db.admins.insert_one({'username': username, 'password_hash': hashed, 'created_at': None, 'is_super': True})
    print(f"Created admin user {username}")
