# Blog Management System - Architecture Diagram

This document provides visual representations of the blog management system architecture, data flow, and component relationships.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BLOG MANAGEMENT SYSTEM                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────┐        ┌─────────────────────────────────┐   │
│  │   ADMIN INTERFACE       │        │   PUBLIC INTERFACE              │   │
│  │  ┌──────────────────┐   │        │   ┌────────────────────────┐   │   │
│  │  │ BlogManagement   │   │        │   │ Home (BlogSection)     │   │   │
│  │  ├──────────────────┤   │        │   ├────────────────────────┤   │   │
│  │  │ BlogEditor       │   │        │   │ BlogPost (Individual)  │   │   │
│  │  ├──────────────────┤   │        │   ├────────────────────────┤   │   │
│  │  │ BlogList         │   │        │   │ BlogCard               │   │   │
│  │  ├──────────────────┤   │        │   ├────────────────────────┤   │   │
│  │  │ TopicManager     │   │        │   │ TopicFilter            │   │   │
│  │  └──────────────────┘   │        │   └────────────────────────┘   │   │
│  └─────────────────────────┘        └─────────────────────────────────┘   │
│                │                                    │                       │
│                └────────────────┬───────────────────┘                       │
│                                 │                                           │
│                        ┌────────▼──────────┐                               │
│                        │   API Service     │                               │
│                        │    (api.js)       │                               │
│                        └────────┬──────────┘                               │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │
                        ┌─────────▼──────────┐
                        │   HTTP/HTTPS       │
                        │   (Axios)          │
                        └─────────┬──────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                            BACKEND (Flask)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         API ENDPOINTS                                │   │
│  │                                                                       │   │
│  │  ┌───────────────────┐              ┌──────────────────────────┐    │   │
│  │  │  PUBLIC ROUTES    │              │   ADMIN ROUTES           │    │   │
│  │  │                   │              │   (Auth Required)        │    │   │
│  │  │ GET /api/blogs    │              │ GET /api/admin/blogs     │    │   │
│  │  │ GET /api/blogs/:s │              │ GET /api/admin/blogs/:id │    │   │
│  │  │ GET /api/topics   │              │ POST /api/admin/blogs    │    │   │
│  │  │                   │              │ PUT /api/admin/blogs/:id │    │   │
│  │  │                   │              │ DELETE /api/admin/blogs  │    │   │
│  │  │                   │              │ POST /api/admin/upload   │    │   │
│  │  │                   │              │ POST /api/admin/topics   │    │   │
│  │  └───────────────────┘              └──────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                  │                                          │
│  ┌──────────────────────────────▼──────────────────────────────────────┐   │
│  │                      HELPER FUNCTIONS                                │   │
│  │                     (blog_helpers.py)                                │   │
│  │                                                                       │   │
│  │  • sanitize_html()  • generate_slug()  • save_upload_file()         │   │
│  │  • allowed_file()   • optimize_image()                              │   │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│  ┌──────────────────────────────▼──────────────────────────────────────┐   │
│  │                        ORM LAYER                                     │   │
│  │                     (SQLAlchemy)                                     │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                           DATABASE                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐   ┌────────────────┐   ┌───────────────┐               │
│  │    Blog      │   │     Topic      │   │   SubTopic    │               │
│  │              │   │                │   │               │               │
│  │ • id         │   │ • id           │   │ • id          │               │
│  │ • title      │───│ • name         │───│ • name        │               │
│  │ • slug       │   │ • slug         │   │ • slug        │               │
│  │ • content    │   │ • description  │   │ • topic_id    │               │
│  │ • topic_id   │   │ • icon         │   │ • description │               │
│  │ • subtopic_id│   │ • display_order│   │ • display_ord │               │
│  │ • status     │   └────────────────┘   └───────────────┘               │
│  │ • views      │                                                         │
│  │ • created_at │   ┌────────────────┐                                   │
│  │ • featured_  │   │   BlogMedia    │                                   │
│  │   image      │───│                │                                   │
│  │ • excerpt    │   │ • id           │                                   │
│  │ • meta_desc  │   │ • blog_id      │                                   │
│  └──────────────┘   │ • file_url     │                                   │
│                     │ • file_type    │                                   │
│                     │ • file_name    │                                   │
│                     └────────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           FILE STORAGE                                      │
│                                                                             │
│  Option A: Local Storage      Option B: Cloud Storage                      │
│  • /static/uploads/           • AWS S3                                     │
│  • /static/uploads/blogs/     • Cloudinary                                 │
│                               • Azure Blob Storage                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Diagrams

### 2.1 Create Blog Post Flow (Admin)

```
┌──────────┐
│  Admin   │
│  User    │
└────┬─────┘
     │
     │ 1. Opens Blog Editor
     ▼
┌────────────────────┐
│  BlogEditor.jsx    │
│                    │
│ • Title input      │
│ • Topic select     │
│ • Rich text editor │
│ • Image upload     │
└────┬───────────────┘
     │
     │ 2. Uploads Image
     ▼
┌────────────────────┐
│ apiService.        │──── 3. POST /api/admin/upload ────┐
│ uploadImage()      │                                    │
└────┬───────────────┘                                    ▼
     │                                         ┌──────────────────────┐
     │ 4. Returns image URL                    │  Backend (Flask)     │
     ▼                                         │                      │
┌────────────────────┐                         │ • Validate file      │
│  BlogEditor        │                         │ • Save to disk       │
│  (Updates state)   │                         │ • Optimize image     │
└────┬───────────────┘                         │ • Return URL         │
     │                                         └──────────────────────┘
     │ 5. Inserts image in editor
     │ 6. Completes blog content
     │ 7. Clicks "Publish"
     ▼
┌────────────────────┐
│ apiService.        │──── 8. POST /api/admin/blogs ─────┐
│ createBlog()       │                                    │
└────┬───────────────┘                                    ▼
     │                                         ┌──────────────────────┐
     │ 10. Success response                    │  Backend (Flask)     │
     ▼                                         │                      │
┌────────────────────┐                         │ • Sanitize HTML      │
│  Show success      │                         │ • Generate slug      │
│  message           │                         │ • Validate data      │
│                    │                         │ • Save to DB         │
└────┬───────────────┘                         └──────┬───────────────┘
     │                                                │
     │ 11. Navigate to blog list                     │
     ▼                                                ▼
┌────────────────────┐                         ┌──────────────────────┐
│  BlogList.jsx      │◀──── 12. Fetches ───────│    Database          │
│  (Shows new blog)  │          updated         │    (Blog saved)      │
└────────────────────┘          list           └──────────────────────┘
```

### 2.2 View Blog Post Flow (Public)

```
┌──────────┐
│  Public  │
│  User    │
└────┬─────┘
     │
     │ 1. Visits landing page
     ▼
┌────────────────────┐
│  Home.jsx          │
│  (Loads BlogSec)   │
└────┬───────────────┘
     │
     │ 2. Fetch blogs
     ▼
┌────────────────────┐
│ apiService.        │──── 3. GET /api/blogs?page=1 ─────┐
│ getBlogs()         │                                    │
└────┬───────────────┘                                    ▼
     │                                         ┌──────────────────────┐
     │ 5. Returns blog list                    │  Backend (Flask)     │
     ▼                                         │                      │
┌────────────────────┐                         │ • Query published    │
│  BlogSection.jsx   │                         │   blogs              │
│                    │                         │ • Filter by topic    │
│ • Displays cards   │                         │ • Paginate results   │
│ • Shows topics     │                         │ • Return JSON        │
└────┬───────────────┘                         └──────┬───────────────┘
     │                                                │
     │ 6. User clicks blog                           │
     ▼                                                ▼
┌────────────────────┐                         ┌──────────────────────┐
│  Navigate to       │                         │    Database          │
│  /blog/:slug       │                         │    (Query blogs)     │
└────┬───────────────┘                         └──────────────────────┘
     │
     │ 7. Fetch single blog
     ▼
┌────────────────────┐
│ apiService.        │──── 8. GET /api/blogs/:slug ──────┐
│ getBlog(slug)      │                                    │
└────┬───────────────┘                                    ▼
     │                                         ┌──────────────────────┐
     │ 10. Returns full blog                   │  Backend (Flask)     │
     ▼                                         │                      │
┌────────────────────┐                         │ • Find by slug       │
│  BlogPost.jsx      │                         │ • Increment views    │
│                    │                         │ • Return blog data   │
│ • Displays title   │                         └──────┬───────────────┘
│ • Renders content  │                                │
│ • Shows related    │                                ▼
│   posts            │                         ┌──────────────────────┐
└────────────────────┘                         │    Database          │
                                               │    (Blog + views++)  │
                                               └──────────────────────┘
```

---

## 3. Component Hierarchy

### 3.1 Admin Dashboard - Blog Components

```
AdminDashboard.jsx
│
├─ [Tabs: Contacts | Meetings | Blogs]
│
└─ BlogManagement.jsx  ← Active when Blogs tab selected
   │
   ├─ State: { activeView, blogs, filters, selectedBlog }
   │
   ├─ [Create New Blog] button
   │   └─ onClick → BlogEditor (mode: create)
   │
   ├─ [Manage Topics] button
   │   └─ onClick → TopicManager
   │
   ├─ Search & Filter Controls
   │   ├─ Search input
   │   ├─ Topic dropdown
   │   └─ Status dropdown
   │
   └─ BlogList.jsx
      │
      ├─ Blog Stats Header
      │
      ├─ Blog Table/Grid
      │   │
      │   └─ For each blog:
      │       ├─ Title, Topic, Status
      │       ├─ Views, Date
      │       └─ Actions:
      │           ├─ [Edit] → BlogEditor (mode: edit, blogId)
      │           ├─ [Delete] → Confirm & delete
      │           └─ [Publish/Unpublish] → Update status
      │
      └─ Pagination Controls

BlogEditor.jsx (Standalone component)
│
├─ State: { blog, isLoading, errors }
│
├─ Title Input
├─ Slug Display (auto-generated)
├─ Topic & SubTopic Selects
├─ Featured Image Upload
│   └─ ImageUploader component
├─ Rich Text Editor (React-Quill)
│   ├─ Toolbar
│   │   ├─ Formatting buttons
│   │   ├─ Image upload handler
│   │   └─ Video embed handler
│   └─ Content area
├─ Excerpt Textarea
├─ SEO Settings (collapsible)
│   ├─ Meta description
│   └─ Keywords
├─ Publication Settings
│   ├─ Status radio (Draft/Published)
│   └─ Author dropdown
└─ Action Buttons
    ├─ [Cancel]
    ├─ [Save Draft]
    └─ [Publish]

TopicManager.jsx (Modal)
│
├─ [Create New Topic] button
│   └─ Opens CreateTopicModal
│
└─ Topic List (Accordion)
    │
    └─ For each topic:
        ├─ Topic Header
        │   ├─ Icon + Name
        │   ├─ Blog count
        │   └─ [Edit] [Delete]
        │
        └─ SubTopics (when expanded)
            ├─ [Add SubTopic] button
            │
            └─ For each subtopic:
                ├─ Name + Blog count
                └─ [Edit] [Delete]
```

### 3.2 Public Blog Components

```
App.jsx
│
├─ Route: "/" → Home.jsx
│   │
│   └─ Layout.jsx
│       ├─ Header
│       ├─ Hero
│       ├─ Services
│       ├─ Features
│       ├─ BlogSection.jsx  ← NEW
│       │   │
│       │   ├─ State: { blogs, topics, activeFilter }
│       │   │
│       │   ├─ Section Header
│       │   │
│       │   ├─ TopicFilter.jsx
│       │   │   │
│       │   │   └─ Topic Pills
│       │   │       └─ onClick → Filter blogs
│       │   │
│       │   ├─ Blog Grid
│       │   │   │
│       │   │   └─ BlogCard.jsx (for each blog)
│       │   │       │
│       │   │       ├─ Featured Image
│       │   │       ├─ Topic Badge
│       │   │       ├─ Title
│       │   │       ├─ Excerpt
│       │   │       ├─ Meta (date, views)
│       │   │       └─ [Read More] → Navigate to /blog/:slug
│       │   │
│       │   └─ [View All Blogs]
│       │
│       ├─ Contact
│       └─ Footer
│
└─ Route: "/blog/:slug" → BlogPost.jsx
    │
    └─ Layout.jsx
        │
        ├─ Breadcrumb Navigation
        │
        ├─ Blog Content Container
        │   │
        │   ├─ Featured Image (full width)
        │   │
        │   ├─ Blog Header
        │   │   ├─ Title
        │   │   ├─ Metadata (author, date, read time, views)
        │   │   └─ Topic/Subtopic Badges
        │   │
        │   ├─ Share Buttons
        │   │   ├─ Facebook
        │   │   ├─ Twitter
        │   │   ├─ LinkedIn
        │   │   └─ Email
        │   │
        │   ├─ Table of Contents (if long article)
        │   │
        │   ├─ Blog Content (rendered HTML)
        │   │   └─ dangerouslySetInnerHTML (sanitized)
        │   │
        │   └─ Related Posts Section
        │       │
        │       └─ BlogCard.jsx (3 related posts)
        │
        └─ Footer
```

---

## 4. Database Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ENTITY RELATIONSHIPS                            │
└─────────────────────────────────────────────────────────────────────┘

        ┌──────────────────┐
        │      Topic       │
        ├──────────────────┤
        │ PK: id           │
        │    name          │
        │    slug          │◀────────────────────┐
        │    description   │                     │
        │    icon          │                     │ One-to-Many
        │    display_order │                     │
        │    created_at    │                     │
        └────────┬─────────┘                     │
                 │                               │
                 │ One-to-Many               ┌───┴────────────┐
                 │                           │   SubTopic     │
                 ▼                           ├────────────────┤
        ┌─────────────────┐                  │ PK: id         │
        │    SubTopic     │                  │    name        │
        ├─────────────────┤                  │    slug        │
        │ PK: id          │                  │ FK: topic_id   │◀───┐
        │    name         │                  │    description │    │
        │    slug         │                  │    display_ord │    │
        │ FK: topic_id    │──────┐           │    created_at  │    │
        │    description  │      │           └────────┬───────┘    │
        │    display_order│      │                    │            │
        │    created_at   │      │                    │            │
        └─────────┬───────┘      │                    │            │
                  │              │                    │            │
                  │              │   One-to-Many      │            │
                  │              │                    │            │
                  │              └────────────────────┤            │
                  │                                   │            │
                  │ One-to-Many                       │            │
                  │                                   │            │
                  ▼                                   ▼            │
        ┌─────────────────────────────────────────────────────┐   │
        │                    Blog                              │   │
        ├──────────────────────────────────────────────────────┤   │
        │ PK: id                                               │   │
        │    title                                             │   │
        │    slug (unique)                                     │   │
        │ FK: topic_id      ───────────────────────────────────┘   │
        │ FK: subtopic_id   ───────────────────────────────────────┘
        │    content                                           │
        │    excerpt                                           │
        │    featured_image                                    │
        │    author                                            │
        │    status (draft/published/archived)                 │
        │    views                                             │
        │    meta_description                                  │
        │    meta_keywords                                     │
        │    created_at                                        │
        │    updated_at                                        │
        │    published_at                                      │
        └──────────┬───────────────────────────────────────────┘
                   │
                   │ One-to-Many
                   │
                   ▼
        ┌─────────────────────┐
        │     BlogMedia       │
        ├─────────────────────┤
        │ PK: id              │
        │ FK: blog_id         │
        │    file_url         │
        │    file_type        │
        │    file_name        │
        │    file_size        │
        │    created_at       │
        └─────────────────────┘

Legend:
  PK = Primary Key
  FK = Foreign Key
  ──▶ = Relationship direction
```

---

## 5. State Management Flow

### Admin Blog Editor State

```
┌──────────────────────────────────────────────────────────────┐
│              BlogEditor Component State                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  const [blog, setBlog] = useState({                          │
│    title: '',                                                │
│    slug: '',                                                 │
│    topic_id: '',                                             │
│    subtopic_id: '',                                          │
│    content: '',                                              │
│    excerpt: '',                                              │
│    featured_image: '',                                       │
│    meta_description: '',                                     │
│    meta_keywords: '',                                        │
│    status: 'draft',                                          │
│    author: 'Admin'                                           │
│  });                                                         │
│                                                              │
│  const [topics, setTopics] = useState([]);                   │
│  const [subtopics, setSubtopics] = useState([]);            │
│  const [isLoading, setIsLoading] = useState(false);         │
│  const [errors, setErrors] = useState({});                  │
│  const [autoSaveStatus, setAutoSaveStatus] = useState('');  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                     State Updates                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  onTitleChange(newTitle)                                     │
│    ├─ setBlog({ ...blog, title: newTitle })                 │
│    └─ Auto-generate slug                                    │
│                                                              │
│  onTopicChange(topicId)                                      │
│    ├─ setBlog({ ...blog, topic_id: topicId })               │
│    └─ Fetch and update subtopics                            │
│                                                              │
│  onContentChange(newContent)                                 │
│    ├─ setBlog({ ...blog, content: newContent })             │
│    └─ Trigger auto-save timer                               │
│                                                              │
│  onImageUpload(file)                                         │
│    ├─ Upload file to server                                 │
│    ├─ Get URL back                                          │
│    └─ setBlog({ ...blog, featured_image: url })             │
│                                                              │
│  onSaveDraft()                                               │
│    ├─ setIsLoading(true)                                    │
│    ├─ apiService.createBlog({ ...blog, status: 'draft' })   │
│    ├─ setIsLoading(false)                                   │
│    └─ Show success message                                  │
│                                                              │
│  onPublish()                                                 │
│    ├─ Validate all required fields                          │
│    ├─ setIsLoading(true)                                    │
│    ├─ apiService.createBlog({ ...blog, status: 'published'})│
│    ├─ setIsLoading(false)                                   │
│    └─ Navigate to blog list                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Public Blog Display State

```
┌──────────────────────────────────────────────────────────────┐
│              BlogSection Component State                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  const [blogs, setBlogs] = useState([]);                     │
│  const [topics, setTopics] = useState([]);                   │
│  const [activeFilter, setActiveFilter] = useState('all');    │
│  const [isLoading, setIsLoading] = useState(true);           │
│  const [page, setPage] = useState(1);                        │
│  const [hasMore, setHasMore] = useState(true);               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                     Effects & Actions                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  useEffect(() => {                                           │
│    fetchBlogs();                                             │
│    fetchTopics();                                            │
│  }, []);                                                     │
│                                                              │
│  useEffect(() => {                                           │
│    fetchBlogs();                                             │
│  }, [activeFilter, page]);                                   │
│                                                              │
│  fetchBlogs()                                                │
│    ├─ setIsLoading(true)                                    │
│    ├─ const filters = { topic: activeFilter }               │
│    ├─ apiService.getBlogs(page, 12, filters)                │
│    ├─ setBlogs(response.blogs)                              │
│    ├─ setHasMore(response.pagination.hasMore)               │
│    └─ setIsLoading(false)                                   │
│                                                              │
│  onFilterChange(topicSlug)                                   │
│    ├─ setActiveFilter(topicSlug)                            │
│    ├─ setPage(1)                                            │
│    └─ Trigger fetchBlogs via useEffect                      │
│                                                              │
│  onLoadMore()                                                │
│    ├─ setPage(page + 1)                                     │
│    └─ Trigger fetchBlogs via useEffect                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. API Request/Response Flow

### Create Blog Request

```
REQUEST
────────
POST /api/admin/blogs
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "title": "AI in Healthcare",
  "topic_id": "uuid-123",
  "subtopic_id": "uuid-456",
  "content": "<p>Rich HTML content...</p>",
  "excerpt": "Short summary...",
  "featured_image": "/static/uploads/blogs/image.jpg",
  "meta_description": "SEO description",
  "meta_keywords": "ai, healthcare, technology",
  "status": "published",
  "author": "Admin"
}

BACKEND PROCESSING
──────────────────
1. Authenticate user
2. Validate input data
3. Sanitize HTML content
4. Generate unique slug
5. Create Blog object
6. Set published_at if status = published
7. Save to database
8. Return response

RESPONSE (Success)
──────────────────
Status: 201 Created

{
  "message": "Blog created successfully",
  "id": "uuid-789",
  "slug": "ai-in-healthcare"
}

RESPONSE (Error)
────────────────
Status: 400 Bad Request

{
  "error": "Title is required",
  "field": "title"
}
```

### Get Blogs Request

```
REQUEST
────────
GET /api/blogs?page=1&per_page=12&topic=technology

BACKEND PROCESSING
──────────────────
1. Parse query parameters
2. Build database query
   - Filter by status = 'published'
   - Filter by topic if provided
   - Order by published_at DESC
3. Apply pagination
4. Execute query
5. Format response

RESPONSE
────────
Status: 200 OK

{
  "blogs": [
    {
      "id": "uuid-789",
      "title": "AI in Healthcare",
      "slug": "ai-in-healthcare",
      "excerpt": "Short summary...",
      "featured_image": "/static/uploads/blogs/image.jpg",
      "author": "Admin",
      "views": 345,
      "published_at": "2025-12-05T10:30:00Z",
      "topic": {
        "name": "Technology",
        "slug": "technology"
      },
      "subtopic": {
        "name": "Artificial Intelligence",
        "slug": "artificial-intelligence"
      }
    },
    // ... more blogs
  ],
  "pagination": {
    "page": 1,
    "per_page": 12,
    "total": 45,
    "pages": 4,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 7. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       SECURITY LAYERS                               │
└─────────────────────────────────────────────────────────────────────┘

                             USER REQUEST
                                  │
                                  ▼
                        ┌─────────────────┐
                        │  HTTPS/TLS      │ ← Transport Security
                        └────────┬────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │  CORS Policy    │ ← Origin Validation
                        └────────┬────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │  Rate Limiting  │ ← DDoS Protection
                        └────────┬────────┘
                                  │
                   ┌──────────────┴──────────────┐
                   │                             │
        PUBLIC ENDPOINT               ADMIN ENDPOINT
                   │                             │
                   ▼                             ▼
         ┌─────────────────┐          ┌─────────────────┐
         │  No Auth Req.   │          │  Authentication │ ← JWT/Session
         └────────┬────────┘          └────────┬────────┘
                  │                            │
                  │                            ▼
                  │                   ┌─────────────────┐
                  │                   │  Authorization  │ ← Admin Check
                  │                   └────────┬────────┘
                  │                            │
                  └────────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  Input Validation│ ← Type & Format Check
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  HTML Sanitize   │ ← XSS Prevention
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  File Validation │ ← Type/Size Check
                    │  (if upload)     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Database Query  │ ← Parameterized Queries
                    │  (ORM)           │   (SQL Injection Prevention)
                    └────────┬─────────┘
                             │
                             ▼
                         RESPONSE
```

---

## 8. Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION DEPLOYMENT                           │
└─────────────────────────────────────────────────────────────────────────┘

                                USERS
                                  │
                                  ▼
                        ┌─────────────────┐
                        │   CDN/Cloudflare│ ← Static Assets
                        │   DNS, Cache    │   (Images, CSS, JS)
                        └────────┬────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │  Load Balancer  │ ← Distribute Traffic
                        │   (Nginx/AWS)   │
                        └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
         ┌──────────────────┐        ┌──────────────────┐
         │  Frontend        │        │  Backend         │
         │  (React App)     │        │  (Flask API)     │
         │                  │        │                  │
         │  • Vercel/Netlify│        │  • Heroku/AWS    │
         │  • S3 + CloudFront│       │  • Docker        │
         │  • Static Build  │        │  • Gunicorn      │
         └──────────────────┘        └────────┬─────────┘
                                               │
                                               ▼
                                     ┌──────────────────┐
                                     │   Database       │
                                     │   PostgreSQL     │
                                     │   (AWS RDS)      │
                                     └────────┬─────────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │  File Storage    │
                                     │  S3/Cloudinary   │
                                     │  (Images/Media)  │
                                     └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         MONITORING & LOGGING                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │
│  │  Application   │  │   Performance  │  │   Error Track  │          │
│  │  Logs          │  │   Monitoring   │  │   (Sentry)     │          │
│  │  (CloudWatch)  │  │   (New Relic)  │  │                │          │
│  └────────────────┘  └────────────────┘  └────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

This architecture provides:

✅ **Scalable structure** - Can handle growth in content and users
✅ **Clear separation** - Frontend, backend, and database layers
✅ **Security-first** - Multiple security layers
✅ **Maintainable** - Well-organized component hierarchy
✅ **Performant** - CDN, caching, optimization
✅ **Observable** - Logging and monitoring built-in
✅ **Flexible** - Easy to extend with new features

The architecture follows modern best practices for web applications with separate concerns, RESTful API design, and scalable deployment options.
