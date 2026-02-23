import React, { useState } from 'react';
import Layout from './components/Layout.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import StepTenant from './steps/StepTenant.jsx';
import StepImap from './steps/StepImap.jsx';
import StepImapTest from './steps/StepImapTest.jsx';
import StepToastTypes from './steps/StepToastTypes.jsx';
import StepOperational from './steps/StepOperational.jsx';
import StepReview from './steps/StepReview.jsx';
import SuccessScreen from './components/SuccessScreen.jsx';
import { defaultToastTypes } from './data/defaultToastTypes.js';

const STEPS = [
  'Tenant Identity',
  'Email / IMAP',
  'Connection Test',
  'Classification',
  'Settings',
  'Review & Submit',
];

const initialTenant = {
  organization_name: '',
  primary_contact_name: '',
  primary_contact_email: '',
  phone_optional: '',
  timezone: 'America/Indiana/Indianapolis',
};

const initialImap = {
  provider: '',
  host: '',
  port: '',
  tls: true,
  username: '',
  password: '',
  mailbox_folder: 'INBOX',
};

const initialOperational = {
  processing_schedule: 'Every 15 minutes',
  max_emails_per_run: 50,
  lookback_days_for_initial_run: 7,
  notification_email: '',
  notification_methods: ['Email'],
};

export default function App() {
  const [step, setStep] = useState(0);
  const [tenant, setTenant] = useState(initialTenant);
  const [imap, setImap] = useState(initialImap);
  const [imapTestPassed, setImapTestPassed] = useState(false);
  const [imapConsent, setImapConsent] = useState(false);
  const [toastTypes, setToastTypes] = useState(defaultToastTypes);
  const [unknownMessageAction, setUnknownMessageAction] = useState('Summarize and notify');
  const [operational, setOperational] = useState(initialOperational);
  const [pilotConsent, setPilotConsent] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSuccess = (result) => {
    setSubmitResult(result);
  };

  if (submitResult) {
    return <SuccessScreen result={submitResult} tenant={tenant} />;
  }

  return (
    <Layout>
      <ProgressBar steps={STEPS} current={step} />

      {step === 0 && (
        <StepTenant
          tenant={tenant}
          setTenant={setTenant}
          onNext={next}
        />
      )}
      {step === 1 && (
        <StepImap
          imap={imap}
          setImap={setImap}
          imapConsent={imapConsent}
          setImapConsent={setImapConsent}
          setImapTestPassed={setImapTestPassed}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 2 && (
        <StepImapTest
          imap={imap}
          imapTestPassed={imapTestPassed}
          setImapTestPassed={setImapTestPassed}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 3 && (
        <StepToastTypes
          toastTypes={toastTypes}
          setToastTypes={setToastTypes}
          unknownMessageAction={unknownMessageAction}
          setUnknownMessageAction={setUnknownMessageAction}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 4 && (
        <StepOperational
          operational={operational}
          setOperational={setOperational}
          defaultEmail={tenant.primary_contact_email}
          pilotConsent={pilotConsent}
          setPilotConsent={setPilotConsent}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 5 && (
        <StepReview
          tenant={tenant}
          imap={imap}
          imapConsent={imapConsent}
          imapTestPassed={imapTestPassed}
          toastTypes={toastTypes}
          unknownMessageAction={unknownMessageAction}
          operational={operational}
          pilotConsent={pilotConsent}
          onBack={back}
          onSuccess={handleSuccess}
        />
      )}
    </Layout>
  );
}
