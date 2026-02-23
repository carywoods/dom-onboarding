import React from 'react';
import styles from './Alert.module.css';

export default function Alert({ type = 'info', title, children }) {
  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <div className={styles.icon}>{icons[type]}</div>
      <div className={styles.content}>
        {title && <strong className={styles.title}>{title}</strong>}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const icons = {
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 8v5M9 6v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L1 16h16L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 7v4M9 13v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 6l6 6M12 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};
