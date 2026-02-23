import React from 'react';
import styles from './SuccessScreen.module.css';

export default function SuccessScreen({ result, tenant }) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="#ebfbee"/>
            <path d="M16 28l8 8 16-16" stroke="#2f9e44" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className={styles.title}>Onboarding Complete!</h1>
        <p className={styles.subtitle}>
          DOM has been configured for <strong>{tenant.organization_name}</strong>. Your configuration files have been written to the server.
        </p>

        <div className={styles.files}>
          <h3 className={styles.filesTitle}>Files written to server</h3>
          <div className={styles.fileRow}>
            <span className={styles.fileType}>TXT</span>
            <code className={styles.fileName}>{result.files?.text}</code>
          </div>
          <div className={styles.fileRow}>
            <span className={styles.fileType}>JSON</span>
            <code className={styles.fileName}>{result.files?.json}</code>
          </div>
          <p className={styles.fileNote}>
            Files are located in the <code>DOM_ONBOARDING_OUTPUT_DIR</code> directory on the server (default: <code>./onboarding_output/</code>).
          </p>
        </div>

        <div className={styles.nextSteps}>
          <h3>What's next?</h3>
          <ol>
            <li>Review the generated configuration files in your output directory.</li>
            <li>Secure the output directory so only authorized users can read the credentials.</li>
            <li>Configure DOM's processing engine to load the JSON configuration file.</li>
            <li>Run a test processing job with <code>Manual only</code> schedule before enabling automated runs.</li>
          </ol>
        </div>

        <div className={styles.idRow}>
          Configuration ID: <code>{result.file_id}</code>
        </div>
      </div>
    </div>
  );
}
