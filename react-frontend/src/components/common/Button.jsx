import React from 'react';
import styles from './Button.module.css';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    type = 'button',
    className = ''
}) => {
    const buttonClass = `
    ${styles.btn} 
    ${styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} 
    ${styles[`btn${size.charAt(0).toUpperCase() + size.slice(1)}`]}
    ${disabled || loading ? styles.disabled : ''}
    ${className}
  `.trim();

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? (
                <span className={styles.loading}>
                    <i className="fas fa-spinner fa-spin"></i> Loading...
                </span>
            ) : (
                <>
                    {icon && <i className={`fas fa-${icon}`}></i>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
