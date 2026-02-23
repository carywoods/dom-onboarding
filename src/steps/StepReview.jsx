import React, { useState } from 'react';
import StepCard from '../components/StepCard.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Alert from '../components/Alert.jsx';
import styles from './StepReview.module.css';

export default function StepReview({ tenant, imap, imapConsent, imapTestPassed, toastTypes, unknownMessageAction, operational, pilotConsent, onBack, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        tenant,
        imap,
        imap_test_passed: imapTestPassed,
        imap_consent: imapConsent,
        toast_types: toastTypes,
        unknown_message_action: unknownMessageAction,
        operational,
        pilot_consent: pilotConsent,
      };
      const resp = await fetch('/api/submit-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data.success) {
        onSuccess(data);
      } else {
        const errMsg = data.errors ? data.errors.join('\n') : (data.error || 'Submission failed. Please try again.');
        setSubmitError(errMsg);
      }
    } catch (err) {
      setSubmitError('Network error — could not reach the server. Is the server running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepCard
      title="Step 6: Review & Submit"
      subtitle="Please review your configuration before submitting. Your password is masked for display. Once submitted, files will be written to the server."
    >
      <div className={styles.sections}>
        <Section title="Tenant Identity">
          <Row label="Organization" value={tenant.organization_name} />
          <Row label="Contact Name" value={tenant.primary_contact_name} />
          <Row label="Contact Email" value={tenant.primary_contact_email} />
          <Row label="Phone" value={tenant.phone_optional || '—'} />
          <Row label="Timezone" value={tenant.timezone} />
        </Section>

        <Section title="IMAP Configuration">
          <Row label="Provider" value={imap.provider || '—'} />
          <Row label="Host" value={imap.host} />
          <Row label="Port" value={imap.port} />
          <Row label="TLS" value={imap.tls ? 'Enabled' : 'Disabled'} />
          <Row label="Username" value={imap.username} />
          <Row label="Password" value="••••••••••••" secret />
          <Row label="Mailbox Folder" value={imap.mailbox_folder || 'INBOX'} />
          <Row label="IMAP Test" value={imapTestPassed ? '✓ Passed' : '✗ Not passed'} highlight={imapTestPassed ? 'success' : 'error'} />
          <Row label="Mailbox Consent" value={imapConsent ? '✓ Acknowledged' : '✗ Not acknowledged'} highlight={imapConsent ? 'success' : 'error'} />
        </Section>

        <Section title="Email Classifications (20 Toast Types)">
          <div className={styles.toastSummary}>
            {toastTypes.map((t, i) => (
              <div key={i} className={styles.toastRow}>
                <span className={styles.toastNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.toastName}>{t.category_name}</span>
                <span className={styles.toastAction}>{t.desired_DOM_action}</span>
                <span className={styles.toastUrgency}>U{t.urgency_level}</span>
              </div>
            ))}
          </div>
          <Row label="Unknown Message Action" value={unknownMessageAction} />
        </Section>

        <Section title="Operational Settings">
          <Row label="Processing Schedule" value={operational.processing_schedule} />
          <Row label="Max Emails Per Run" value={String(operational.max_emails_per_run)} />
          <Row label="Lookback Days" value={String(operational.lookback_days_for_initial_run)} />
          <Row label="Notification Email" value={operational.notification_email || tenant.primary_contact_email} />
          <Row label="Notification Methods" value={(operational.notification_methods || []).join(', ') || '—'} />
          <Row label="Pilot Consent" value={pilotConsent ? '✓ Acknowledged' : '✗ Not acknowledged'} highlight={pilotConsent ? 'success' : 'error'} />
        </Section>
      </div>

      <Alert type="warning" title="Final check">
        Once you submit, your configuration — including IMAP credentials — will be written to files on the server in the designated output directory. Ensure that directory is properly secured.
      </Alert>

      {submitError && (
        <div className={styles.errorBox}>
          <Alert type="error" title="Submission failed">
            <pre className={styles.errorPre}>{submitError}</pre>
          </Alert>
        </div>
      )}

      <div className={styles.navRow}>
        <button type="button" className={styles.backBtn} onClick={onBack} disabled={submitting}>
          ← Back
        </button>
        <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting && <span className={styles.spinner} />}
          {submitting ? 'Submitting…' : 'Submit Onboarding Configuration'}
        </button>
      </div>
    </StepCard>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>{title}</h4>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Row({ label, value, secret, highlight }) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={`${styles.reviewValue} ${highlight === 'success' ? styles.valueSuccess : ''} ${highlight === 'error' ? styles.valueError : ''} ${secret ? styles.valueSecret : ''}`}>
        {value}
      </span>
    </div>
  );
}
