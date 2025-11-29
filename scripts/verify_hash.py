from dotenv import load_dotenv
from pymongo import MongoClient
from werkzeug.security import check_password_hash
import os
load_dotenv('backend/.env')
uri = os.getenv('MONGODB_URI')
client = MongoClient(uri)
db = client.get_default_database()
admin = db.admins.find_one({'username': 'admin'})
print('Admin found:', bool(admin))
if admin:
    print('hash:', admin.get('password_hash'))
    print('check admin123:', check_password_hash(admin.get('password_hash'), 'admin123'))
    print('check wrongpass:', check_password_hash(admin.get('password_hash'), 'wrongpass'))
