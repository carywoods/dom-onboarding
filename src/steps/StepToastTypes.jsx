import React, { useState } from 'react';
import StepCard from '../components/StepCard.jsx';
import NavButtons from '../components/NavButtons.jsx';
import Alert from '../components/Alert.jsx';
import { defaultToastTypes } from '../data/defaultToastTypes.js';
import styles from './StepToastTypes.module.css';

const DOM_ACTIONS = [
  'Auto-reply (templated)',
  'Summarize and notify',
  'Route to folder/label',
  'Flag urgent',
  'Do nothing',
];

const UNKNOWN_ACTIONS = [
  'Ask for clarification',
  'Summarize and notify',
  'Do nothing',
];

export default function StepToastTypes({ toastTypes, setToastTypes, unknownMessageAction, setUnknownMessageAction, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(0);

  const update = (index, field, value) => {
    setToastTypes((prev) => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${index}_${field}`];
      return next;
    });
  };

  const resetToDefaults = () => {
    setToastTypes(defaultToastTypes);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    toastTypes.forEach((t, i) => {
      if (!t.desired_DOM_action) e[`${i}_action`] = 'Action required.';
      if (!t.urgency_level || t.urgency_level < 1 || t.urgency_level > 5) e[`${i}_urgency`] = 'Urgency 1-5 required.';
    });
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      const firstErrIdx = parseInt(Object.keys(e)[0].split('_')[0], 10);
      setExpandedIndex(firstErrIdx);
      return;
    }
    onNext();
  };

  return (
    <StepCard
      title="Step 4: Email Classification — Toast Types"
      subtitle="Define how DOM should handle each type of incoming email. All 20 categories require an action and urgency level. Expand each row to customize."
    >
      <div className={styles.top}>
        <Alert type="info">
          These classifications tell DOM how to respond to different kinds of messages. You can edit the names, descriptions, and behavior for each category.
        </Alert>
        <button type="button" className={styles.defaultsBtn} onClick={resetToDefaults}>
          Use Recommended Defaults
        </button>
      </div>

      <div className={styles.list}>
        {toastTypes.map((toast, i) => {
          const isOpen = expandedIndex === i;
          const hasError = errors[`${i}_action`] || errors[`${i}_urgency`];
          return (
            <div key={i} className={`${styles.row} ${isOpen ? styles.rowOpen : ''} ${hasError ? styles.rowError : ''}`}>
              <button
                type="button"
                className={styles.rowHeader}
                onClick={() => setExpandedIndex(isOpen ? null : i)}
              >
                <span className={styles.rowNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.rowName}>{toast.category_name || <em>Unnamed</em>}</span>
                <span className={styles.rowMeta}>
                  <span className={`${styles.actionBadge} ${styles['action_' + slugAction(toast.desired_DOM_action)]}`}>
                    {toast.desired_DOM_action || 'No action'}
                  </span>
                  <span className={styles.urgencyDots}>
                    {[1,2,3,4,5].map((n) => (
                      <span key={n} className={`${styles.dot} ${n <= toast.urgency_level ? styles.dotFilled : ''}`} />
                    ))}
                  </span>
                </span>
                <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className={styles.rowBody}>
                  <div className={styles.fieldGrid}>
                    <div className={styles.fieldFull}>
                      <label className={styles.fieldLabel}>Category Name</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={toast.category_name}
                        onChange={(e) => update(i, 'category_name', e.target.value)}
                      />
                    </div>
                    <div className={styles.fieldFull}>
                      <label className={styles.fieldLabel}>Description</label>
                      <textarea
                        className={styles.textarea}
                        value={toast.category_description}
                        onChange={(e) => update(i, 'category_description', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className={styles.fieldFull}>
                      <label className={styles.fieldLabel}>Examples <span className={styles.opt}>(optional)</span></label>
                      <textarea
                        className={styles.textarea}
                        value={toast.examples}
                        onChange={(e) => update(i, 'examples', e.target.value)}
                        rows={2}
                        placeholder="e.g. Invoice from Acme, Bill from utility provider"
                      />
                    </div>
                    <div>
                      <label className={styles.fieldLabel}>
                        Desired DOM Action <span className={styles.req}>*</span>
                      </label>
                      <select
                        className={`${styles.select} ${errors[`${i}_action`] ? styles.inputError : ''}`}
                        value={toast.desired_DOM_action}
                        onChange={(e) => update(i, 'desired_DOM_action', e.target.value)}
                      >
                        <option value="">— Select action —</option>
                        {DOM_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      {errors[`${i}_action`] && <p className={styles.errorMsg}>{errors[`${i}_action`]}</p>}
                    </div>
                    <div>
                      <label className={styles.fieldLabel}>
                        Urgency Level (1–5) <span className={styles.req}>*</span>
                      </label>
                      <div className={styles.urgencyPicker}>
                        {[1,2,3,4,5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`${styles.urgencyBtn} ${toast.urgency_level === n ? styles.urgencyBtnActive : ''}`}
                            onClick={() => update(i, 'urgency_level', n)}
                            title={urgencyLabel(n)}
                          >
                            {n}
                          </button>
                        ))}
                        <span className={styles.urgencyText}>{urgencyLabel(toast.urgency_level)}</span>
                      </div>
                      {errors[`${i}_urgency`] && <p className={styles.errorMsg}>{errors[`${i}_urgency`]}</p>}
                    </div>
                    <div>
                      <label className={styles.fieldLabel}>Allowed Senders <span className={styles.opt}>(optional)</span></label>
                      <input
                        type="text"
                        className={styles.input}
                        value={toast.allowed_senders}
                        onChange={(e) => update(i, 'allowed_senders', e.target.value)}
                        placeholder="vendor@example.com, @trusted-domain.com"
                      />
                    </div>
                    <div>
                      <label className={styles.fieldLabel}>Blocked Senders <span className={styles.opt}>(optional)</span></label>
                      <input
                        type="text"
                        className={styles.input}
                        value={toast.blocked_senders}
                        onChange={(e) => update(i, 'blocked_senders', e.target.value)}
                        placeholder="spam@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.unknownSection}>
        <h4 className={styles.unknownTitle}>Handling Unknown / Unclassified Messages</h4>
        <p className={styles.unknownDesc}>If an incoming email does not match any of the 20 categories above, DOM should:</p>
        <select
          className={styles.select}
          value={unknownMessageAction}
          onChange={(e) => setUnknownMessageAction(e.target.value)}
        >
          {UNKNOWN_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} nextLabel="Continue to Settings →" />
    </StepCard>
  );
}

function slugAction(action) {
  if (!action) return 'none';
  return action.toLowerCase().replace(/[^a-z]/g, '_').replace(/__+/g, '_');
}

function urgencyLabel(n) {
  const labels = { 1: 'Low', 2: 'Low-Medium', 3: 'Medium', 4: 'High', 5: 'Critical' };
  return labels[n] || '';
}
