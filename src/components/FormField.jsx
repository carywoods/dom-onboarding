import React from 'react';
import styles from './FormField.module.css';

export default function FormField({ label, required, helpText, error, children, htmlFor }) {
  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''}`}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}
      {children}
      {helpText && !error && <p className={styles.help}>{helpText}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
