from dotenv import load_dotenv
from pymongo import MongoClient
from werkzeug.security import check_password_hash
import os
load_dotenv('backend/.env')
load_dotenv()
# print envs
print('ADMIN_PASSWORD root .env:', os.getenv('ADMIN_PASSWORD'))
print('ADMIN_PASSWORD backend .env:', os.getenv('ADMIN_PASSWORD'))
uri = os.getenv('MONGODB_URI')
print('MONGODB_URI present:', bool(uri))
client = MongoClient(uri)
db = client.get_default_database()
admin = db.admins.find_one({'username':'admin'})
print('hash:', admin.get('password_hash'))
print('securepassword123:', check_password_hash(admin.get('password_hash'), 'securepassword123'))
print('admin123:', check_password_hash(admin.get('password_hash'), 'admin123'))
