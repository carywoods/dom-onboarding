const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const sanitizeFilename = require('sanitize-filename');

function pad(n) {
  return String(n).padStart(2, '0');
}

function getTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function sanitizeOrgName(name) {
  const safe = sanitizeFilename(name || 'unknown_org', { replacement: '_' });
  return safe.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 40) || 'unknown_org';
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSubmission(data) {
  const errors = [];

  if (!data.tenant || !data.tenant.organization_name) errors.push('Organization name is required.');
  if (!data.tenant || !data.tenant.primary_contact_name) errors.push('Primary contact name is required.');
  if (!data.tenant || !data.tenant.primary_contact_email || !validateEmail(data.tenant.primary_contact_email)) errors.push('Valid primary contact email is required.');

  if (!data.imap || !data.imap.host) errors.push('IMAP host is required.');
  if (!data.imap || !data.imap.port) errors.push('IMAP port is required.');
  if (!data.imap || !data.imap.username) errors.push('IMAP username is required.');
  if (!data.imap || !data.imap.password) errors.push('IMAP password is required.');
  if (!data.imap_test_passed) errors.push('IMAP connection test must be passed before submitting.');
  if (!data.imap_consent) errors.push('IMAP access consent is required.');

  if (!data.toast_types || !Array.isArray(data.toast_types) || data.toast_types.length !== 20) {
    errors.push('Exactly 20 toast type classifications are required.');
  } else {
    data.toast_types.forEach((t, i) => {
      if (!t.category_name) errors.push(`Toast type #${i + 1} is missing a category name.`);
      if (!t.desired_DOM_action) errors.push(`Toast type #${i + 1} is missing a desired action.`);
      if (!t.urgency_level || t.urgency_level < 1 || t.urgency_level > 5) errors.push(`Toast type #${i + 1} must have urgency level 1-5.`);
    });
  }

  if (!data.operational || !data.operational.processing_schedule) errors.push('Processing schedule is required.');
  if (!data.pilot_consent) errors.push('Pilot system acknowledgement is required.');

  return errors;
}

function buildTextFile(data) {
  const stars = '='.repeat(60);
  const dashes = '-'.repeat(60);
  const ts = new Date().toISOString();

  let lines = [];

  lines.push(stars);
  lines.push('  DOM (Digital Office Manager) — Onboarding Configuration');
  lines.push(stars);
  lines.push(`  Generated: ${ts}`);
  lines.push('');

  lines.push('SECTION 1: TENANT IDENTITY');
  lines.push(dashes);
  lines.push(`  Organization Name : ${data.tenant.organization_name}`);
  lines.push(`  Contact Name      : ${data.tenant.primary_contact_name}`);
  lines.push(`  Contact Email     : ${data.tenant.primary_contact_email}`);
  lines.push(`  Phone             : ${data.tenant.phone_optional || '(not provided)'}`);
  lines.push(`  Timezone          : ${data.tenant.timezone || 'America/Indiana/Indianapolis'}`);
  lines.push('');

  lines.push('SECTION 2: EMAIL / IMAP CONFIGURATION');
  lines.push(dashes);
  lines.push(`  Provider          : ${data.imap.provider || '(not specified)'}`);
  lines.push(`  IMAP Host         : ${data.imap.host}`);
  lines.push(`  IMAP Port         : ${data.imap.port}`);
  lines.push(`  TLS Enabled       : ${data.imap.tls ? 'Yes' : 'No'}`);
  lines.push(`  Username          : ${data.imap.username}`);
  lines.push(`  Password          : ******`);
  lines.push(`  Mailbox Folder    : ${data.imap.mailbox_folder || 'INBOX'}`);
  lines.push(`  IMAP Test Passed  : ${data.imap_test_passed ? 'Yes' : 'No'}`);
  lines.push(`  User IMAP Consent : ${data.imap_consent ? 'Yes — user acknowledged mailbox access' : 'No'}`);
  lines.push('');

  lines.push('SECTION 3: EMAIL CLASSIFICATION — TOAST TYPES');
  lines.push(dashes);
  (data.toast_types || []).forEach((t, i) => {
    lines.push(`  [${String(i + 1).padStart(2, '0')}] ${t.category_name}`);
    lines.push(`       Description    : ${t.category_description || '(none)'}`);
    lines.push(`       Action         : ${t.desired_DOM_action}`);
    lines.push(`       Urgency        : ${t.urgency_level} / 5`);
    if (t.examples) lines.push(`       Examples       : ${t.examples}`);
    if (t.allowed_senders) lines.push(`       Allowed Senders: ${t.allowed_senders}`);
    if (t.blocked_senders) lines.push(`       Blocked Senders: ${t.blocked_senders}`);
    lines.push('');
  });

  lines.push(`  Unknown Message Handling: ${data.unknown_message_action || '(not set)'}`);
  lines.push('');

  lines.push('SECTION 4: OPERATIONAL SETTINGS');
  lines.push(dashes);
  const op = data.operational || {};
  lines.push(`  Processing Schedule         : ${op.processing_schedule}`);
  lines.push(`  Max Emails Per Run          : ${op.max_emails_per_run || 50}`);
  lines.push(`  Lookback Days (initial run) : ${op.lookback_days_for_initial_run || 7}`);
  lines.push(`  Notification Email          : ${op.notification_email || data.tenant.primary_contact_email}`);
  lines.push(`  Notification Methods        : ${(op.notification_methods || []).join(', ') || '(none selected)'}`);
  lines.push(`  Pilot System Consent        : ${data.pilot_consent ? 'Yes — user acknowledged pilot status' : 'No'}`);
  lines.push('');

  lines.push(stars);
  lines.push('  END OF CONFIGURATION');
  lines.push(stars);

  return lines.join('\n');
}

router.post('/submit-onboarding', (req, res) => {
  const data = req.body;

  const errors = validateSubmission(data);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const outputDir = process.env.DOM_ONBOARDING_OUTPUT_DIR || path.join(process.cwd(), 'onboarding_output');

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create output directory:', err.message);
    return res.status(500).json({ success: false, error: 'Server error: could not create output directory.' });
  }

  const timestamp = getTimestamp();
  const orgSlug = sanitizeOrgName(data.tenant.organization_name);
  const shortId = nanoid(8);
  const baseName = `${timestamp}_${orgSlug}_${shortId}`;

  const txtPath = path.join(outputDir, `${baseName}.txt`);
  const jsonPath = path.join(outputDir, `${baseName}.json`);

  const safeData = JSON.parse(JSON.stringify(data));
  if (safeData.imap && safeData.imap.password) {
    safeData.imap.password = '*** REDACTED FROM LOG — stored only in output file ***';
  }

  const outputJson = {
    _meta: {
      generated_at: new Date().toISOString(),
      schema_version: '1.0',
      file_id: shortId,
    },
    tenant: data.tenant,
    imap: {
      ...data.imap,
      password: data.imap.password,
    },
    imap_test_passed: data.imap_test_passed,
    imap_consent: data.imap_consent,
    toast_types: data.toast_types,
    unknown_message_action: data.unknown_message_action,
    operational: data.operational,
    pilot_consent: data.pilot_consent,
  };

  const textContent = buildTextFile(data);

  try {
    fs.writeFileSync(txtPath, textContent, { encoding: 'utf8', mode: 0o600 });
    fs.writeFileSync(jsonPath, JSON.stringify(outputJson, null, 2), { encoding: 'utf8', mode: 0o600 });
  } catch (err) {
    console.error('Failed to write onboarding files:', err.message);
    return res.status(500).json({ success: false, error: 'Server error: could not write onboarding output files.' });
  }

  return res.json({
    success: true,
    message: 'Onboarding configuration saved successfully.',
    file_id: shortId,
    files: {
      text: path.basename(txtPath),
      json: path.basename(jsonPath),
    },
  });
});

module.exports = router;
