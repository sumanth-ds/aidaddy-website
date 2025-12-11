# Blog Management - Quick Implementation Guide

This guide provides step-by-step instructions to implement the blog management feature.

## Phase 1: Database & Backend Setup

### Step 1: Update Models (backend/models.py)

Add these models after the existing models:

```python
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
    blogs = db.relationship('Blog', back_populates='topic')

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
    blogs = db.relationship('Blog', back_populates='subtopic')
    
    __table_args__ = (db.UniqueConstraint('topic_id', 'slug', name='_topic_subtopic_uc'),)

class Blog(db.Model):
    __tablename__ = 'blog'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(250), unique=True, nullable=False)
    topic_id = db.Column(db.String(36), db.ForeignKey('topic.id'), nullable=False)
    subtopic_id = db.Column(db.String(36), db.ForeignKey('sub_topic.id'), nullable=True)
    
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
    
    topic = db.relationship('Topic', back_populates='blogs')
    subtopic = db.relationship('SubTopic', back_populates='blogs')
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
```

### Step 2: Install Dependencies

Backend:
```bash
cd backend
pip install pillow python-slugify bleach
pip freeze > requirements.txt
```

Frontend:
```bash
cd react-frontend
npm install react-quill dompurify react-markdown
```

### Step 3: Create Migration
```bash
cd backend
flask db migrate -m "Add blog management models"
flask db upgrade
```

### Step 4: Add Helper Functions (backend/blog_helpers.py)

Create a new file:

```python
from slugify import slugify
import bleach
from werkzeug.utils import secure_filename
import os
import uuid
from PIL import Image

ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    'img', 'iframe', 'div', 'span'
]

ALLOWED_ATTRIBUTES = {
    '*': ['class', 'style'],
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen']
}

def sanitize_html(content):
    """Sanitize HTML content to prevent XSS attacks"""
    return bleach.clean(
        content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )

def generate_slug(title, model, max_length=250):
    """Generate unique slug from title"""
    base_slug = slugify(title)[:max_length]
    slug = base_slug
    counter = 1
    
    while model.query.filter_by(slug=slug).first():
        suffix = f"-{counter}"
        slug = f"{base_slug[:max_length-len(suffix)]}{suffix}"
        counter += 1
    
    return slug

def allowed_file(filename):
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_upload_file(file, folder='uploads/blogs'):
    """Save uploaded file and return URL"""
    if not file or not allowed_file(file.filename):
        return None
    
    # Generate unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    
    # Create folder if not exists
    upload_path = os.path.join('static', folder)
    os.makedirs(upload_path, exist_ok=True)
    
    # Save file
    filepath = os.path.join(upload_path, filename)
    file.save(filepath)
    
    # Optimize image
    optimize_image(filepath)
    
    return f"/static/{folder}/{filename}"

def optimize_image(filepath, max_width=1200, quality=85):
    """Optimize and resize image"""
    try:
        with Image.open(filepath) as img:
            # Convert RGBA to RGB if needed
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Resize if too large
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.LANCZOS)
            
            # Save optimized
            img.save(filepath, optimize=True, quality=quality)
    except Exception as e:
        print(f"Error optimizing image: {e}")
```

---

## Phase 2: Backend API Endpoints

### Step 5: Add Blog Routes (backend/app.py)

Add these routes:

```python
from blog_helpers import sanitize_html, generate_slug, save_upload_file
from models import Blog, Topic, SubTopic, BlogMedia

# ============ BLOG PUBLIC ENDPOINTS ============

@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    """Get published blogs with pagination and filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    topic_slug = request.args.get('topic')
    subtopic_slug = request.args.get('subtopic')
    
    query = Blog.query.filter_by(status='published')
    
    if topic_slug:
        topic = Topic.query.filter_by(slug=topic_slug).first()
        if topic:
            query = query.filter_by(topic_id=topic.id)
    
    if subtopic_slug:
        subtopic = SubTopic.query.filter_by(slug=subtopic_slug).first()
        if subtopic:
            query = query.filter_by(subtopic_id=subtopic.id)
    
    query = query.order_by(Blog.published_at.desc())
    
    total = query.count()
    blogs = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return jsonify({
        'blogs': [{
            'id': b.id,
            'title': b.title,
            'slug': b.slug,
            'excerpt': b.excerpt,
            'featured_image': b.featured_image,
            'author': b.author,
            'views': b.views,
            'published_at': b.published_at.isoformat() if b.published_at else None,
            'topic': {'name': b.topic.name, 'slug': b.topic.slug} if b.topic else None,
            'subtopic': {'name': b.subtopic.name, 'slug': b.subtopic.slug} if b.subtopic else None
        } for b in blogs],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page
        }
    })

@app.route('/api/blogs/<slug>', methods=['GET'])
def get_blog(slug):
    """Get single published blog by slug"""
    blog = Blog.query.filter_by(slug=slug, status='published').first()
    if not blog:
        return jsonify({'error': 'Blog not found'}), 404
    
    # Increment view count
    blog.views += 1
    db.session.commit()
    
    return jsonify({
        'id': blog.id,
        'title': blog.title,
        'slug': blog.slug,
        'content': blog.content,
        'excerpt': blog.excerpt,
        'featured_image': blog.featured_image,
        'author': blog.author,
        'views': blog.views,
        'meta_description': blog.meta_description,
        'meta_keywords': blog.meta_keywords,
        'published_at': blog.published_at.isoformat() if blog.published_at else None,
        'topic': {'name': blog.topic.name, 'slug': blog.topic.slug} if blog.topic else None,
        'subtopic': {'name': blog.subtopic.name, 'slug': blog.subtopic.slug} if blog.subtopic else None
    })

@app.route('/api/blogs/topics', methods=['GET'])
def get_blog_topics():
    """Get all topics with blog counts"""
    topics = Topic.query.order_by(Topic.display_order).all()
    
    result = []
    for topic in topics:
        blog_count = Blog.query.filter_by(topic_id=topic.id, status='published').count()
        subtopics = []
        
        for subtopic in topic.subtopics:
            sub_count = Blog.query.filter_by(subtopic_id=subtopic.id, status='published').count()
            subtopics.append({
                'id': subtopic.id,
                'name': subtopic.name,
                'slug': subtopic.slug,
                'blog_count': sub_count
            })
        
        result.append({
            'id': topic.id,
            'name': topic.name,
            'slug': topic.slug,
            'icon': topic.icon,
            'blog_count': blog_count,
            'subtopics': subtopics
        })
    
    return jsonify(result)

# ============ ADMIN BLOG ENDPOINTS ============

@app.route('/api/admin/blogs', methods=['GET'])
@login_required
def admin_get_blogs():
    """Get all blogs for admin (with filters)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    topic_id = request.args.get('topic_id')
    search = request.args.get('search', '')
    
    query = Blog.query
    
    if status:
        query = query.filter_by(status=status)
    if topic_id:
        query = query.filter_by(topic_id=topic_id)
    if search:
        query = query.filter(Blog.title.ilike(f'%{search}%'))
    
    query = query.order_by(Blog.created_at.desc())
    
    total = query.count()
    blogs = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return jsonify({
        'blogs': [{
            'id': b.id,
            'title': b.title,
            'slug': b.slug,
            'status': b.status,
            'views': b.views,
            'created_at': b.created_at.isoformat(),
            'published_at': b.published_at.isoformat() if b.published_at else None,
            'topic': {'id': b.topic.id, 'name': b.topic.name} if b.topic else None,
            'subtopic': {'id': b.subtopic.id, 'name': b.subtopic.name} if b.subtopic else None
        } for b in blogs],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page
        }
    })

@app.route('/api/admin/blogs/<blog_id>', methods=['GET'])
@login_required
def admin_get_blog(blog_id):
    """Get single blog for editing"""
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({'error': 'Blog not found'}), 404
    
    return jsonify({
        'id': blog.id,
        'title': blog.title,
        'slug': blog.slug,
        'content': blog.content,
        'excerpt': blog.excerpt,
        'featured_image': blog.featured_image,
        'topic_id': blog.topic_id,
        'subtopic_id': blog.subtopic_id,
        'author': blog.author,
        'status': blog.status,
        'views': blog.views,
        'meta_description': blog.meta_description,
        'meta_keywords': blog.meta_keywords,
        'created_at': blog.created_at.isoformat(),
        'updated_at': blog.updated_at.isoformat() if blog.updated_at else None,
        'published_at': blog.published_at.isoformat() if blog.published_at else None
    })

@app.route('/api/admin/blogs', methods=['POST'])
@login_required
def admin_create_blog():
    """Create new blog"""
    data = request.json
    
    try:
        # Sanitize content
        content = sanitize_html(data.get('content', ''))
        
        # Generate slug
        slug = generate_slug(data['title'], Blog)
        
        blog = Blog(
            title=data['title'],
            slug=slug,
            content=content,
            excerpt=data.get('excerpt'),
            featured_image=data.get('featured_image'),
            topic_id=data['topic_id'],
            subtopic_id=data.get('subtopic_id'),
            author=data.get('author', 'Admin'),
            status=data.get('status', 'draft'),
            meta_description=data.get('meta_description'),
            meta_keywords=data.get('meta_keywords')
        )
        
        if blog.status == 'published' and not blog.published_at:
            blog.published_at = datetime.utcnow()
        
        db.session.add(blog)
        db.session.commit()
        
        return jsonify({'message': 'Blog created', 'id': blog.id}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/blogs/<blog_id>', methods=['PUT'])
@login_required
def admin_update_blog(blog_id):
    """Update existing blog"""
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({'error': 'Blog not found'}), 404
    
    data = request.json
    
    try:
        # Update fields
        if 'title' in data:
            blog.title = data['title']
            # Regenerate slug if title changed
            blog.slug = generate_slug(data['title'], Blog)
        
        if 'content' in data:
            blog.content = sanitize_html(data['content'])
        
        if 'excerpt' in data:
            blog.excerpt = data['excerpt']
        
        if 'featured_image' in data:
            blog.featured_image = data['featured_image']
        
        if 'topic_id' in data:
            blog.topic_id = data['topic_id']
        
        if 'subtopic_id' in data:
            blog.subtopic_id = data['subtopic_id']
        
        if 'status' in data:
            old_status = blog.status
            blog.status = data['status']
            # Set published_at when first published
            if blog.status == 'published' and old_status != 'published':
                blog.published_at = datetime.utcnow()
        
        if 'meta_description' in data:
            blog.meta_description = data['meta_description']
        
        if 'meta_keywords' in data:
            blog.meta_keywords = data['meta_keywords']
        
        db.session.commit()
        
        return jsonify({'message': 'Blog updated'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/blogs/<blog_id>', methods=['DELETE'])
@login_required
def admin_delete_blog(blog_id):
    """Delete blog"""
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({'error': 'Blog not found'}), 404
    
    try:
        db.session.delete(blog)
        db.session.commit()
        return jsonify({'message': 'Blog deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ============ FILE UPLOAD ENDPOINT ============

@app.route('/api/admin/upload', methods=['POST'])
@login_required
def upload_file():
    """Upload image file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    file_url = save_upload_file(file)
    if not file_url:
        return jsonify({'error': 'Invalid file type'}), 400
    
    return jsonify({
        'url': file_url,
        'file_name': file.filename
    })

# ============ TOPIC MANAGEMENT ENDPOINTS ============

@app.route('/api/topics', methods=['GET'])
def get_topics():
    """Get all topics with subtopics"""
    topics = Topic.query.order_by(Topic.display_order).all()
    
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'slug': t.slug,
        'icon': t.icon,
        'subtopics': [{
            'id': st.id,
            'name': st.name,
            'slug': st.slug
        } for st in t.subtopics]
    } for t in topics])

@app.route('/api/admin/topics', methods=['POST'])
@login_required
def create_topic():
    """Create new topic"""
    data = request.json
    
    try:
        slug = generate_slug(data['name'], Topic)
        topic = Topic(
            name=data['name'],
            slug=slug,
            description=data.get('description'),
            icon=data.get('icon'),
            display_order=data.get('display_order', 0)
        )
        db.session.add(topic)
        db.session.commit()
        
        return jsonify({'message': 'Topic created', 'id': topic.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/topics/<topic_id>/subtopics', methods=['POST'])
@login_required
def create_subtopic(topic_id):
    """Create new subtopic"""
    topic = Topic.query.get(topic_id)
    if not topic:
        return jsonify({'error': 'Topic not found'}), 404
    
    data = request.json
    
    try:
        slug = generate_slug(data['name'], SubTopic)
        subtopic = SubTopic(
            name=data['name'],
            slug=slug,
            topic_id=topic_id,
            description=data.get('description'),
            display_order=data.get('display_order', 0)
        )
        db.session.add(subtopic)
        db.session.commit()
        
        return jsonify({'message': 'Subtopic created', 'id': subtopic.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
```

---

## Phase 3: Frontend Components

### Step 6: Update API Service (react-frontend/src/services/api.js)

Add these methods to the apiService object:

```javascript
// Blog public endpoints
getBlog: async (slug) => {
    const response = await publicApi.get(`/api/blogs/${slug}`);
    return response.data;
},

getBlogs: async (page = 1, perPage = 12, filters = {}) => {
    const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...filters
    });
    const response = await publicApi.get(`/api/blogs?${params}`);
    return response.data;
},

getBlogTopics: async () => {
    const response = await publicApi.get('/api/blogs/topics');
    return response.data;
},

// Admin blog endpoints
getAdminBlogs: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, ...filters });
    const response = await api.get(`/api/admin/blogs?${params}`);
    return response.data;
},

getAdminBlog: async (blogId) => {
    const response = await api.get(`/api/admin/blogs/${blogId}`);
    return response.data;
},

createBlog: async (blogData) => {
    const response = await api.post('/api/admin/blogs', blogData);
    return response.data;
},

updateBlog: async (blogId, blogData) => {
    const response = await api.put(`/api/admin/blogs/${blogId}`, blogData);
    return response.data;
},

deleteBlog: async (blogId) => {
    const response = await api.delete(`/api/admin/blogs/${blogId}`);
    return response.data;
},

uploadImage: async (formData) => {
    const response = await api.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
},

// Topic management
getTopics: async () => {
    const response = await publicApi.get('/api/topics');
    return response.data;
},

createTopic: async (topicData) => {
    const response = await api.post('/api/admin/topics', topicData);
    return response.data;
},

createSubTopic: async (topicId, subtopicData) => {
    const response = await api.post(`/api/admin/topics/${topicId}/subtopics`, subtopicData);
    return response.data;
}
```

### Step 7: Update constants

Add to `react-frontend/src/utils/constants.js`:

```javascript
export const BLOG_CONSTANTS = {
    ITEMS_PER_PAGE: 12,
    MAX_EXCERPT_LENGTH: 500,
    MAX_TITLE_LENGTH: 200,
    IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
};
```

---

## Next Steps

1. **Create Blog Components** (detailed in BLOG_MANAGEMENT_DESIGN.md)
   - BlogManagement.jsx
   - BlogEditor.jsx
   - BlogList.jsx
   - BlogSection.jsx (for Home page)
   - BlogPost.jsx (individual blog page)

2. **Add Styling** (CSS Modules for each component)

3. **Update AdminDashboard** (add Blogs tab)

4. **Update Home Page** (add BlogSection)

5. **Add Routes** (in App.jsx)

6. **Test & Deploy**

---

## Testing Checklist

- [ ] Create new blog post
- [ ] Edit existing blog post
- [ ] Delete blog post
- [ ] Publish/unpublish blog
- [ ] Upload images
- [ ] Embed videos
- [ ] Add links and formatting
- [ ] Create topics and subtopics
- [ ] Filter blogs by topic
- [ ] View blog on public page
- [ ] Responsive design on mobile
- [ ] SEO meta tags working
- [ ] Image optimization working

---

## Deployment Notes

1. Set up upload directory permissions
2. Configure CORS for file uploads
3. Add environment variables for upload settings
4. Set up CDN for production images (optional)
5. Run database migrations on production
6. Seed initial topics if needed

---

Refer to BLOG_MANAGEMENT_DESIGN.md for complete architectural details and component specifications.
