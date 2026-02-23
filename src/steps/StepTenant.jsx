import React, { useState } from 'react';
import StepCard from '../components/StepCard.jsx';
import FormField from '../components/FormField.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Alert from '../components/Alert.jsx';
import styles from './StepTenant.module.css';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Indiana/Indianapolis',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'America/Phoenix',
  'America/Detroit',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function StepTenant({ tenant, setTenant, onNext }) {
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setTenant((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!tenant.organization_name.trim()) e.organization_name = 'Organization name is required.';
    if (!tenant.primary_contact_name.trim()) e.primary_contact_name = 'Contact name is required.';
    if (!tenant.primary_contact_email.trim()) {
      e.primary_contact_email = 'Contact email is required.';
    } else if (!validateEmail(tenant.primary_contact_email)) {
      e.primary_contact_email = 'Please enter a valid email address.';
    }
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
      title="Step 1: Tenant Identity"
      subtitle="Tell us about your organization. This information is used for labeling and support purposes only — it will be stored in your configuration files on your server."
    >
      <Alert type="info">
        Your details are stored locally on the server running DOM. They are never sent to any external service.
      </Alert>

      <div className={styles.form}>
        <FormField label="Organization Name" required htmlFor="org_name" error={errors.organization_name}>
          <input
            id="org_name"
            type="text"
            value={tenant.organization_name}
            onChange={(e) => update('organization_name', e.target.value)}
            placeholder="Acme Small Business LLC"
            autoComplete="organization"
          />
        </FormField>

        <FormField label="Primary Contact Name" required htmlFor="contact_name" error={errors.primary_contact_name}>
          <input
            id="contact_name"
            type="text"
            value={tenant.primary_contact_name}
            onChange={(e) => update('primary_contact_name', e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
          />
        </FormField>

        <FormField
          label="Primary Contact Email"
          required
          htmlFor="contact_email"
          error={errors.primary_contact_email}
          helpText="Used for notification defaults in Step 5. Not used to send email during onboarding."
        >
          <input
            id="contact_email"
            type="email"
            value={tenant.primary_contact_email}
            onChange={(e) => update('primary_contact_email', e.target.value)}
            placeholder="jane@example.com"
            autoComplete="email"
          />
        </FormField>

        <FormField label="Phone (Optional)" htmlFor="phone" helpText="For support contact. Leave blank if not applicable.">
          <input
            id="phone"
            type="tel"
            value={tenant.phone_optional}
            onChange={(e) => update('phone_optional', e.target.value)}
            placeholder="+1 (555) 555-5555"
            autoComplete="tel"
          />
        </FormField>

        <FormField label="Timezone" required htmlFor="timezone" helpText="Used for scheduling and log timestamps.">
          <select
            id="timezone"
            value={tenant.timezone}
            onChange={(e) => update('timezone', e.target.value)}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </FormField>
      </div>

      <NavButtons onNext={handleNext} nextLabel="Continue to Email Setup →" />
    </StepCard>
  );
}
