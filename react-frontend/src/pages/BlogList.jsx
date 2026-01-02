import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import styles from './BlogList.module.css';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBlogs();
        fetchTopics();
    }, [currentPage, selectedTopic]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await apiService.getBlogs(currentPage, 'published', selectedTopic);
            if (response && response.success) {
                setBlogs(response.blogs || []);
                setTotalPages(response.pages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopics = async () => {
        try {
            const response = await apiService.getTopics();
            if (response && response.success) {
                setTopics(response.topics || []);
            }
        } catch (error) {
            console.error('Failed to fetch topics:', error);
        }
    };

    const handleTopicFilter = (topicId) => {
        setSelectedTopic(topicId === selectedTopic ? null : topicId);
        setCurrentPage(1);
    };

    if (loading && blogs.length === 0) {
        return (
            <Layout>
                <Loader fullPage message="Loading blogs..." />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.blogListPage}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>Our Blog</h1>
                        <p>Insights, tutorials, and updates from our team</p>
                    </div>

                    {topics.length > 0 && (
                        <div className={styles.topicFilter}>
                            <button
                                className={`${styles.topicBtn} ${!selectedTopic ? styles.active : ''}`}
                                onClick={() => handleTopicFilter(null)}
                            >
                                All Topics
                            </button>
                            {topics.map(topic => (
                                <button
                                    key={topic.id}
                                    className={`${styles.topicBtn} ${selectedTopic === topic.id ? styles.active : ''}`}
                                    onClick={() => handleTopicFilter(topic.id)}
                                >
                                    {topic.icon && <span>{topic.icon}</span>} {topic.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {blogs.length === 0 ? (
                        <div className={styles.noBlog}>
                            <p>No blogs found. Check back soon!</p>
                        </div>
                    ) : (
                        <div className={styles.blogGrid}>
                            {blogs.map(blog => (
                                <Link to={`/blog/${blog.slug}`} key={blog.id} className={styles.blogCard}>
                                    {blog.featured_image && (
                                        <div className={styles.blogImage}>
                                            <img src={blog.featured_image} alt={blog.title} />
                                        </div>
                                    )}
                                    <div className={styles.blogContent}>
                                        <div className={styles.blogMeta}>
                                            {blog.topic_name && (
                                                <span className={styles.topic}>{blog.topic_name}</span>
                                            )}
                                            <span className={styles.date}>
                                                {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <h2>{blog.title}</h2>
                                        <p className={styles.excerpt}>{blog.excerpt || 'Read more...'}</p>
                                        <div className={styles.blogFooter}>
                                            <span className={styles.author}>By {blog.author}</span>
                                            <span className={styles.views}>
                                                <i className="fas fa-eye"></i> {blog.views || 0} views
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BlogList;
