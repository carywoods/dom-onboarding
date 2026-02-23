import React from 'react';
import styles from './NavButtons.module.css';

export default function NavButtons({ onBack, onNext, nextLabel = 'Continue', backLabel = 'Back', nextDisabled = false, loading = false }) {
  return (
    <div className={styles.nav}>
      {onBack && (
        <button type="button" className={styles.backBtn} onClick={onBack} disabled={loading}>
          ← {backLabel}
        </button>
      )}
      <button
        type="button"
        className={styles.nextBtn}
        onClick={onNext}
        disabled={nextDisabled || loading}
      >
        {loading ? <span className={styles.spinner} /> : null}
        {loading ? 'Please wait…' : nextLabel}
      </button>
    </div>
  );
}
