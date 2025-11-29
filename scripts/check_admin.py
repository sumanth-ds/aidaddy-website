from dotenv import load_dotenv
from pymongo import MongoClient
import os
load_dotenv('backend/.env')
uri = os.getenv('MONGODB_URI')
print('MONGODB_URI present:', bool(uri))
client = MongoClient(uri)
db = client.get_default_database()
admins = list(db.admins.find())
print('Admins found:', len(admins))
for a in admins:
    print('username:', a.get('username'))
    print('password_hash:', a.get('password_hash'))
    print('created_at:', a.get('created_at'))
