import React from 'react';
import styles from './StepCard.module.css';

export default function StepCard({ title, subtitle, children }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.body}>
        {children}
      </div>
    </div>
  );
}
