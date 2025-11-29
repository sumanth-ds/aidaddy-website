import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ fullPage = false, size = 'md', message = 'Loading...' }) => {
    const loaderClass = `${styles.loader} ${styles[`loader${size.charAt(0).toUpperCase() + size.slice(1)}`]}`;

    if (fullPage) {
        return (
            <div className={styles.fullPageLoader}>
                <div className={loaderClass}></div>
                {message && <p className={styles.message}>{message}</p>}
            </div>
        );
    }

    return (
        <div className={styles.inlineLoader}>
            <div className={loaderClass}></div>
            {message && <span className={styles.message}>{message}</span>}
        </div>
    );
};

export default Loader;
