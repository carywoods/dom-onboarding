import React, { useState, useEffect } from 'react';
import StepCard from '../components/StepCard.jsx';
import FormField from '../components/FormField.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Alert from '../components/Alert.jsx';
import styles from './StepOperational.module.css';

const SCHEDULES = [
  'Every 5 minutes',
  'Every 15 minutes',
  'Hourly',
  'Manual only',
];

const NOTIFICATION_METHODS = ['Email', 'Slack (placeholder)', 'SMS (placeholder)'];

export default function StepOperational({ operational, setOperational, defaultEmail, pilotConsent, setPilotConsent, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!operational.notification_email && defaultEmail) {
      setOperational((prev) => ({ ...prev, notification_email: defaultEmail }));
    }
  }, [defaultEmail]);

  const update = (field, value) => {
    setOperational((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const toggleMethod = (method) => {
    setOperational((prev) => {
      const methods = prev.notification_methods || [];
      const next = methods.includes(method) ? methods.filter((m) => m !== method) : [...methods, method];
      return { ...prev, notification_methods: next };
    });
  };

  const validate = () => {
    const e = {};
    if (!operational.processing_schedule) e.processing_schedule = 'Select a processing schedule.';
    const max = parseInt(operational.max_emails_per_run, 10);
    if (isNaN(max) || max < 1 || max > 1000) e.max_emails_per_run = 'Enter a number between 1 and 1000.';
    const days = parseInt(operational.lookback_days_for_initial_run, 10);
    if (isNaN(days) || days < 0 || days > 365) e.lookback_days_for_initial_run = 'Enter a number between 0 and 365.';
    if (!pilotConsent) e.pilot_consent = 'You must acknowledge the pilot system notice before continuing.';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onNext();
  };

  return (
    <StepCard
      title="Step 5: Operational Settings"
      subtitle="Configure how frequently DOM processes your mailbox, limits for each run, and how you want to be notified about activity."
    >
      <div className={styles.form}>
        <FormField label="Processing Schedule" required htmlFor="schedule" error={errors.processing_schedule}
          helpText="How often DOM will check the mailbox for new messages.">
          <select
            id="schedule"
            value={operational.processing_schedule}
            onChange={(e) => update('processing_schedule', e.target.value)}
          >
            {SCHEDULES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>

        <div className={styles.row}>
          <FormField label="Max Emails Per Run" required htmlFor="max_emails" error={errors.max_emails_per_run}
            helpText="Maximum messages to process each time DOM runs.">
            <input
              id="max_emails"
              type="number"
              min="1"
              max="1000"
              value={operational.max_emails_per_run}
              onChange={(e) => update('max_emails_per_run', e.target.value)}
            />
          </FormField>

          <FormField label="Lookback Days (Initial Run)" required htmlFor="lookback_days" error={errors.lookback_days_for_initial_run}
            helpText="How many days back to scan on the very first run.">
            <input
              id="lookback_days"
              type="number"
              min="0"
              max="365"
              value={operational.lookback_days_for_initial_run}
              onChange={(e) => update('lookback_days_for_initial_run', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Notification Email" htmlFor="notif_email"
          helpText="Where DOM will send processing reports and alerts.">
          <input
            id="notif_email"
            type="email"
            value={operational.notification_email}
            onChange={(e) => update('notification_email', e.target.value)}
            placeholder={defaultEmail || 'you@example.com'}
          />
        </FormField>

        <div>
          <p className={styles.checkboxGroupLabel}>Notification Methods</p>
          <div className={styles.checkboxGroup}>
            {NOTIFICATION_METHODS.map((method) => (
              <label key={method} className={`${styles.checkboxLabel} ${method.includes('placeholder') ? styles.checkboxPlaceholder : ''}`}>
                <input
                  type="checkbox"
                  checked={(operational.notification_methods || []).includes(method)}
                  onChange={() => toggleMethod(method)}
                  disabled={method.includes('placeholder')}
                />
                <span>{method}</span>
                {method.includes('placeholder') && <span className={styles.comingSoon}>Coming soon</span>}
              </label>
            ))}
          </div>
        </div>

        <div className={`${styles.consentBox} ${errors.pilot_consent ? styles.consentError : ''}`}>
          <label className={styles.consentLabel}>
            <input
              type="checkbox"
              checked={pilotConsent}
              onChange={(e) => {
                setPilotConsent(e.target.checked);
                setErrors((prev) => ({ ...prev, pilot_consent: null }));
              }}
            />
            <span>
              I understand this is a pilot system. DOM's automated actions and summaries should be reviewed regularly. I accept that output accuracy may vary and DOM is not a substitute for human review of critical communications.
            </span>
          </label>
          {errors.pilot_consent && <p className={styles.consentErrorMsg}>{errors.pilot_consent}</p>}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} nextLabel="Continue to Review →" />
    </StepCard>
  );
}
