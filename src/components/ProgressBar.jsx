import React from 'react';
import styles from './ProgressBar.module.css';

export default function ProgressBar({ steps, current }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        {steps.map((label, i) => {
          const isDone = i < current;
          const isActive = i === current;
          return (
            <React.Fragment key={i}>
              <div className={`${styles.step} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''}`}>
                <div className={styles.circle}>
                  {isDone ? <CheckIcon /> : <span>{i + 1}</span>}
                </div>
                <span className={styles.label}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className={styles.mobileLabel}>
        Step {current + 1} of {steps.length}: <strong>{steps[current]}</strong>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
