import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { login as authLogin } from '../utils/auth';
import styles from './Login.module.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Call our JSON API endpoint
            const data = await apiService.login(credentials);
            console.log('login response:', data);
            if (data && data.success) {
                authLogin('session_active');
                navigate('/admin');
            } else {
                setError(data && data.message ? data.message : 'Invalid credentials');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <h2>Admin Login</h2>
                {error && <div className={styles.flash}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
