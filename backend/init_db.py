from app import app, db
from models import Contact, Meeting

# Create all tables within app context
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")