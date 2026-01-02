from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    meeting_datetime = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, default=30)  # minutes
    meeting_link = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Topic(db.Model):
    __tablename__ = 'topic'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.String(500), nullable=True)
    icon = db.Column(db.String(50), nullable=True)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    subtopics = db.relationship('SubTopic', back_populates='topic', cascade='all, delete-orphan')

class SubTopic(db.Model):
    __tablename__ = 'sub_topic'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(120), nullable=False)
    topic_id = db.Column(db.String(36), db.ForeignKey('topic.id'), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    topic = db.relationship('Topic', back_populates='subtopics')
    
    __table_args__ = (db.UniqueConstraint('topic_id', 'slug', name='_topic_subtopic_uc'),)

class Blog(db.Model):
    __tablename__ = 'blog'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(250), unique=True, nullable=False)
    topic_id = db.Column(db.String(200), nullable=True)  # Changed to text field
    subtopic_id = db.Column(db.String(200), nullable=True)  # Changed to text field
    
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.String(500), nullable=True)
    featured_image = db.Column(db.String(500), nullable=True)
    
    author = db.Column(db.String(100), nullable=False, default='Admin')
    status = db.Column(db.String(20), default='draft')
    views = db.Column(db.Integer, default=0)
    
    meta_description = db.Column(db.String(160), nullable=True)
    meta_keywords = db.Column(db.String(255), nullable=True)
    
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, onupdate=db.func.current_timestamp())
    published_at = db.Column(db.DateTime, nullable=True)
    
    media = db.relationship('BlogMedia', back_populates='blog', cascade='all, delete-orphan')

class BlogMedia(db.Model):
    __tablename__ = 'blog_media'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_id = db.Column(db.String(36), db.ForeignKey('blog.id'), nullable=False)
    file_url = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(20), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    blog = db.relationship('Blog', back_populates='media')