import { useState, type FC, type FormEvent } from 'react';
import type { StudentProfile, StudentCredentialResult } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { KeyIcon, CheckCircleIcon, SparklesIcon, ExternalLinkIcon } from '../icons';

interface GenerateCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  authToken?: string | null;
  onSuccess?: () => void;
}

export const GenerateCredentialModal: FC<GenerateCredentialModalProps> = ({
  isOpen,
  onClose,
  student,
  authToken,
  onSuccess,
}) => {
  const [customPassword, setCustomPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<StudentCredentialResult | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await institutionApi.generateStudentCredentials(
        student.id,
        {
          custom_password: customPassword.trim() || undefined,
          login_url: window.location.origin,
        },
        authToken || undefined
      );
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Credential generation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <KeyIcon size={20} color="#0284c7" />
            <div>
              <h3>Generate Student Login Credentials</h3>
              <p>Issue password and dispatch welcome email via Mailpit SMTP</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {result ? (
          <div className="credential-success-state">
            <div className="success-banner">
              <CheckCircleIcon size={24} color="#059669" />
              <div>
                <h4>Credentials Generated & Email Sent!</h4>
                <p>Welcome email dispatched via SMTP to <strong>{result.recipient}</strong></p>
              </div>
            </div>

            <div className="credential-details-box">
              <div className="cred-item">
                <span className="cred-label">Student Name:</span>
                <span className="cred-val">{student.user_name}</span>
              </div>
              <div className="cred-item">
                <span className="cred-label">Matric Number:</span>
                <span className="cred-val">{student.matric_number}</span>
              </div>
              <div className="cred-item">
                <span className="cred-label">Login Email:</span>
                <span className="cred-val">{result.email}</span>
              </div>
              <div className="cred-item">
                <span className="cred-label">Generated Password:</span>
                <span className="cred-val-highlight">{result.plain_password}</span>
              </div>
            </div>

            <div className="mailpit-test-action">
              <p>You can inspect this email immediately in the local Mailpit web console:</p>
              <a
                href="http://localhost:8025"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-sm mailpit-link"
              >
                <ExternalLinkIcon size={14} /> Open Mailpit Inbox (Port 8025)
              </a>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="modal-form">
            <div className="student-target-summary">
              <div className="summary-row">
                <span>Student:</span> <strong>{student.user_name} ({student.matric_number})</strong>
              </div>
              <div className="summary-row">
                <span>Degree Programme:</span> <strong>{student.program_name}</strong>
              </div>
              <div className="summary-row">
                <span>Level:</span> <strong>{student.level_display}</strong>
              </div>
              <div className="summary-row">
                <span>Target Email:</span> <strong>{student.user_email}</strong>
              </div>
            </div>

            <div className="form-group">
              <label>Custom Temporary Password (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank to auto-generate secure password (e.g. EduSal-2026!7xK)"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
              />
              <span className="field-hint">
                If left blank, a cryptographically secure random password will be created automatically.
              </span>
            </div>

            <div className="email-dispatch-notice">
              <SparklesIcon size={16} color="#0284c7" />
              <p>
                The system will set the student password and send a formatted HTML welcome email with login instructions to <strong>{student.user_email}</strong> via Mailpit.
              </p>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Generating & Sending Email...'
                ) : (
                  <>
                    <KeyIcon size={14} /> Generate & Send Credentials Email
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
