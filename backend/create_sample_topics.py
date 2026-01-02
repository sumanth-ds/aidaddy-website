import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app, db, Topic, SubTopic
from datetime import datetime

def create_sample_topics():
    """Create sample blog topics and subtopics"""
    with app.app_context():
        # Check if topics already exist
        existing = Topic.query.first()
        if existing:
            print("Topics already exist. Skipping creation.")
            return
        
        # AI & Machine Learning Topic
        ai_topic = Topic(
            name="AI & Machine Learning",
            slug="ai-machine-learning",
            description="Explore the latest in artificial intelligence and machine learning",
            icon="🤖",
            display_order=1
        )
        db.session.add(ai_topic)
        db.session.flush()
        
        ai_subtopics = [
            SubTopic(name="Neural Networks", slug="neural-networks", topic_id=ai_topic.id, display_order=1),
            SubTopic(name="Natural Language Processing", slug="nlp", topic_id=ai_topic.id, display_order=2),
            SubTopic(name="Computer Vision", slug="computer-vision", topic_id=ai_topic.id, display_order=3),
        ]
        db.session.add_all(ai_subtopics)
        
        # Web Development Topic
        web_topic = Topic(
            name="Web Development",
            slug="web-development",
            description="Modern web development tutorials and best practices",
            icon="💻",
            display_order=2
        )
        db.session.add(web_topic)
        db.session.flush()
        
        web_subtopics = [
            SubTopic(name="Frontend", slug="frontend", topic_id=web_topic.id, display_order=1),
            SubTopic(name="Backend", slug="backend", topic_id=web_topic.id, display_order=2),
            SubTopic(name="Full Stack", slug="full-stack", topic_id=web_topic.id, display_order=3),
        ]
        db.session.add_all(web_subtopics)
        
        # Business & Strategy Topic
        business_topic = Topic(
            name="Business & Strategy",
            slug="business-strategy",
            description="Business insights, strategies, and growth tips",
            icon="📊",
            display_order=3
        )
        db.session.add(business_topic)
        db.session.flush()
        
        business_subtopics = [
            SubTopic(name="Digital Marketing", slug="digital-marketing", topic_id=business_topic.id, display_order=1),
            SubTopic(name="Entrepreneurship", slug="entrepreneurship", topic_id=business_topic.id, display_order=2),
            SubTopic(name="Growth Hacking", slug="growth-hacking", topic_id=business_topic.id, display_order=3),
        ]
        db.session.add_all(business_subtopics)
        
        # Tutorials Topic
        tutorials_topic = Topic(
            name="Tutorials",
            slug="tutorials",
            description="Step-by-step guides and how-to articles",
            icon="📚",
            display_order=4
        )
        db.session.add(tutorials_topic)
        
        db.session.commit()
        print("✅ Sample topics and subtopics created successfully!")
        print("\nTopics created:")
        print("1. AI & Machine Learning (with 3 subtopics)")
        print("2. Web Development (with 3 subtopics)")
        print("3. Business & Strategy (with 3 subtopics)")
        print("4. Tutorials")

if __name__ == "__main__":
    create_sample_topics()
