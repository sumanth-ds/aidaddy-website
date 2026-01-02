import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import styles from './BlogPost.module.css';

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBlog();
    }, [slug]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const response = await apiService.getBlog(slug);
            if (response && response.success) {
                setBlog(response.blog);
            } else {
                setError('Blog not found');
            }
        } catch (error) {
            console.error('Failed to fetch blog:', error);
            setError('Failed to load blog post');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <Loader fullPage message="Loading blog..." />
            </Layout>
        );
    }

    if (error || !blog) {
        return (
            <Layout>
                <div className={styles.error}>
                    <h1>Blog Not Found</h1>
                    <p>{error || 'The blog post you are looking for does not exist.'}</p>
                    <button onClick={() => navigate('/blog')}>Back to Blogs</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.blogPost}>
                <div className={styles.container}>
                    <button className={styles.backBtn} onClick={() => navigate('/blog')}>
                        <i className="fas fa-arrow-left"></i> Back to Blogs
                    </button>

                    <article>
                        <header className={styles.header}>
                            <div className={styles.meta}>
                                {blog.topic_name && (
                                    <span className={styles.topic}>{blog.topic_name}</span>
                                )}
                                {blog.subtopic_name && (
                                    <span className={styles.subtopic}> / {blog.subtopic_name}</span>
                                )}
                            </div>
                            <h1>{blog.title}</h1>
                            <div className={styles.info}>
                                <span className={styles.author}>By {blog.author}</span>
                                <span className={styles.date}>
                                    {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className={styles.views}>
                                    <i className="fas fa-eye"></i> {blog.views} views
                                </span>
                            </div>
                        </header>

                        {blog.featured_image && (
                            <div className={styles.featuredImage}>
                                <img src={blog.featured_image} alt={blog.title} />
                            </div>
                        )}

                        <div
                            className={styles.content}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </article>

                    <div className={styles.shareSection}>
                        <h3>Share this article</h3>
                        <div className={styles.shareButtons}>
                            <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`, '_blank')}>
                                <i className="fab fa-twitter"></i> Twitter
                            </button>
                            <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}>
                                <i className="fab fa-facebook"></i> Facebook
                            </button>
                            <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}>
                                <i className="fab fa-linkedin"></i> LinkedIn
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BlogPost;
