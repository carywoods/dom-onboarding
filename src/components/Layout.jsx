import React from 'react';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>DOM</span>
            <span className={styles.logoText}>Digital Office Manager</span>
          </div>
          <span className={styles.badge}>Onboarding Setup</span>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
      <footer className={styles.footer}>
        <p>DOM Onboarding — Configuration data is stored locally on your server only.</p>
      </footer>
    </div>
  );
}
