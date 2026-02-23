import React, { useState } from 'react';
import StepCard from '../components/StepCard.jsx';
import FormField from '../components/FormField.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Alert from '../components/Alert.jsx';
import styles from './StepImap.module.css';

const PROVIDERS = [
  { value: 'gmail', label: 'Gmail' },
  { value: 'microsoft365', label: 'Microsoft 365 / Outlook' },
  { value: 'yahoo', label: 'Yahoo Mail' },
  { value: 'icloud', label: 'iCloud Mail' },
  { value: 'custom', label: 'Other / Custom IMAP' },
];

const PROVIDER_DEFAULTS = {
  gmail: { host: 'imap.gmail.com', port: '993', tls: true },
  microsoft365: { host: 'outlook.office365.com', port: '993', tls: true },
  yahoo: { host: 'imap.mail.yahoo.com', port: '993', tls: true },
  icloud: { host: 'imap.mail.me.com', port: '993', tls: true },
  custom: { host: '', port: '143', tls: false },
};

const APP_PASSWORD_HELP = {
  gmail: 'Gmail requires an App Password if you have 2FA enabled. Visit your Google Account > Security > App Passwords to generate one.',
  microsoft365: 'Microsoft 365 may require an App Password or Modern Auth. Check your admin settings if standard login fails.',
  yahoo: 'Yahoo requires an App Password. Visit your Yahoo Account > Account Security > Generate app password.',
  icloud: 'iCloud requires an App Password. Visit appleid.apple.com > Sign-In and Security > App-Specific Passwords.',
  custom: 'Check with your email provider if App Passwords or IMAP-specific authentication is required.',
};

export default function StepImap({ imap, setImap, imapConsent, setImapConsent, setImapTestPassed, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setImap((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    if (['host', 'port', 'tls', 'username', 'password'].includes(field)) {
      setImapTestPassed(false);
    }
  };

  const handleProviderChange = (provider) => {
    const defaults = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.custom;
    setImap((prev) => ({ ...prev, provider, ...defaults }));
    setImapTestPassed(false);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!imap.host.trim()) e.host = 'IMAP host is required.';
    if (!imap.port || isNaN(parseInt(imap.port, 10))) e.port = 'A valid port number is required.';
    if (!imap.username.trim()) e.username = 'Username (email address) is required.';
    if (!imap.password) e.password = 'Password is required.';
    if (!imapConsent) e.consent = 'You must acknowledge IMAP access before continuing.';
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

  const currentProvider = imap.provider || 'custom';

  return (
    <StepCard
      title="Step 2: Email Provider & IMAP Settings"
      subtitle="Configure the mailbox that DOM will monitor. Credentials are stored only in your server-side configuration file and are never transmitted to any external service."
    >
      <div className={styles.form}>
        <FormField label="Email Provider" htmlFor="provider">
          <select
            id="provider"
            value={currentProvider}
            onChange={(e) => handleProviderChange(e.target.value)}
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </FormField>

        {currentProvider && currentProvider !== 'custom' && (
          <Alert type="info">
            <strong>App Passwords & 2FA:</strong> {APP_PASSWORD_HELP[currentProvider]}
          </Alert>
        )}

        <div className={styles.row}>
          <FormField label="IMAP Host" required htmlFor="imap_host" error={errors.host}
            helpText="The hostname of your provider's IMAP server.">
            <input
              id="imap_host"
              type="text"
              value={imap.host}
              onChange={(e) => update('host', e.target.value)}
              placeholder="imap.example.com"
              autoComplete="off"
              spellCheck="false"
            />
          </FormField>
          <FormField label="Port" required htmlFor="imap_port" error={errors.port}
            helpText="Usually 993 (TLS) or 143 (STARTTLS).">
            <input
              id="imap_port"
              type="number"
              value={imap.port}
              onChange={(e) => update('port', e.target.value)}
              placeholder="993"
              min="1"
              max="65535"
            />
          </FormField>
        </div>

        <FormField label="TLS / SSL" htmlFor="imap_tls" helpText="Enable for secure connections (port 993). Disable only for STARTTLS or unencrypted connections.">
          <div className={styles.toggleRow}>
            <label className={styles.toggle}>
              <input
                id="imap_tls"
                type="checkbox"
                checked={imap.tls}
                onChange={(e) => update('tls', e.target.checked)}
              />
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb} />
              </span>
            </label>
            <span className={styles.toggleLabel}>{imap.tls ? 'TLS Enabled (recommended)' : 'TLS Disabled'}</span>
          </div>
        </FormField>

        <FormField label="Username / Email Address" required htmlFor="imap_user" error={errors.username}
          helpText="Usually your full email address.">
          <input
            id="imap_user"
            type="email"
            value={imap.username}
            onChange={(e) => update('username', e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
          />
        </FormField>

        <FormField label="Password / App Password" required htmlFor="imap_pass" error={errors.password}
          helpText="Your IMAP password or provider-generated App Password. This is stored only in the server-side output file.">
          <input
            id="imap_pass"
            type="password"
            value={imap.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="••••••••••••"
            autoComplete="current-password"
          />
        </FormField>

        <FormField label="Mailbox Folder" htmlFor="imap_folder"
          helpText='The folder to monitor. Use "INBOX" for your main inbox. For Gmail labels use e.g. "[Gmail]/All Mail".'>
          <input
            id="imap_folder"
            type="text"
            value={imap.mailbox_folder}
            onChange={(e) => update('mailbox_folder', e.target.value)}
            placeholder="INBOX"
          />
        </FormField>

        <div className={`${styles.consentBox} ${errors.consent ? styles.consentError : ''}`}>
          <label className={styles.consentLabel}>
            <input
              type="checkbox"
              checked={imapConsent}
              onChange={(e) => {
                setImapConsent(e.target.checked);
                setErrors((prev) => ({ ...prev, consent: null }));
              }}
            />
            <span>
              I understand that DOM will connect to this mailbox via IMAP to read and process messages as part of its normal operation. I have authority to grant this access.
            </span>
          </label>
          {errors.consent && <p className={styles.consentErrorMsg}>{errors.consent}</p>}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} nextLabel="Continue to Connection Test →" />
    </StepCard>
  );
}
