import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children, type = 'info', icon }) => {
    if (!isOpen) return null;

    const getIconClass = () => {
        switch (type) {
            case 'success':
                return 'fa-circle-check';
            case 'error':
                return 'fa-circle-xmark';
            case 'warning':
                return 'fa-triangle-exclamation';
            default:
                return 'fa-circle-info';
        }
    };

    return (
        <div className={styles.modal} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                </div>
                <div className={styles.modalBody}>
                    {icon !== false && (
                        <i className={`fas ${icon || getIconClass()} ${styles.icon} ${styles[`icon${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}></i>
                    )}
                    {children}
                </div>
                <div className={styles.modalFooter}>
                    <button
                        className={`${styles.btnModal} ${styles[`btn${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
