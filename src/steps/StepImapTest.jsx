import React, { useState } from 'react';
import StepCard from '../components/StepCard.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Alert from '../components/Alert.jsx';
import styles from './StepImapTest.module.css';

export default function StepImapTest({ imap, imapTestPassed, setImapTestPassed, onNext, onBack }) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    setImapTestPassed(false);
    try {
      const resp = await fetch('/api/test-imap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: imap.host,
          port: imap.port,
          tls: imap.tls,
          username: imap.username,
          password: imap.password,
          folder: imap.mailbox_folder || 'INBOX',
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setImapTestPassed(true);
        setResult({ ok: true, message: data.message });
      } else {
        setResult({ ok: false, message: data.error });
      }
    } catch (err) {
      setResult({ ok: false, message: 'Network error — could not reach the onboarding server. Is the server running?' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <StepCard
      title="Step 3: IMAP Connection Test"
      subtitle="Before proceeding, we need to verify that DOM can connect to your mailbox with the credentials you provided. This test is required to continue."
    >
      <div className={styles.body}>
        <div className={styles.configSummary}>
          <h4>Connection details to test:</h4>
          <dl className={styles.dl}>
            <div>
              <dt>Host</dt>
              <dd>{imap.host || <em>Not set</em>}</dd>
            </div>
            <div>
              <dt>Port</dt>
              <dd>{imap.port || <em>Not set</em>}</dd>
            </div>
            <div>
              <dt>TLS</dt>
              <dd>{imap.tls ? 'Enabled' : 'Disabled'}</dd>
            </div>
            <div>
              <dt>Username</dt>
              <dd>{imap.username || <em>Not set</em>}</dd>
            </div>
            <div>
              <dt>Password</dt>
              <dd>{'•'.repeat(Math.min((imap.password || '').length, 12)) || <em>Not set</em>}</dd>
            </div>
            <div>
              <dt>Mailbox</dt>
              <dd>{imap.mailbox_folder || 'INBOX'}</dd>
            </div>
          </dl>
          <p className={styles.note}>
            To change these details, go back to Step 2.
          </p>
        </div>

        {!imapTestPassed && !testing && !result && (
          <Alert type="warning" title="Test required">
            You must run a successful connection test before continuing. Click the button below to begin.
          </Alert>
        )}

        {result && (
          <Alert type={result.ok ? 'success' : 'error'} title={result.ok ? 'Connection successful!' : 'Connection failed'}>
            {result.message}
            {!result.ok && (
              <p className={styles.retryHint}>
                Review your settings in Step 2 and try again. Common issues: wrong App Password, TLS mismatch, blocked port, or typo in the host.
              </p>
            )}
          </Alert>
        )}

        <button
          type="button"
          className={`${styles.testBtn} ${imapTestPassed ? styles.testBtnSuccess : ''}`}
          onClick={runTest}
          disabled={testing || !imap.host || !imap.username || !imap.password}
        >
          {testing && <span className={styles.spinner} />}
          {testing ? 'Testing connection…' : imapTestPassed ? '✓ Test Passed — Run Again' : 'Run Connection Test'}
        </button>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel="Continue to Classification →"
        nextDisabled={!imapTestPassed}
      />
    </StepCard>
  );
}
