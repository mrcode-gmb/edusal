import { useState, type FC, type FormEvent } from 'react';
import type { StudentProfile, StudentCredentialResult } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Key as KeyIcon,
  Verified as CheckCircleIcon,
  AutoAwesome as SparklesIcon,
  OpenInNew as ExternalLinkIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '15px' } } }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <div className="flex items-start gap-2">
          <KeyIcon sx={{ fontSize: 22, color: 'primary.main', mt: 0.5 }} />
          <div>
            <p className="text-base font-bold text-charcoal">
              Generate Student Login Credentials
            </p>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              Issue password and dispatch welcome email via Mailpit SMTP
            </p>
          </div>
        </div>
        <IconButton size="medium" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1 }}>
        {result ? (
          <div>
            <div className="flex items-center gap-3 rounded-[15px] bg-primary-soft/40 p-4">
              <CheckCircleIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <div>
                <p className="text-base font-bold text-charcoal">
                  Credentials Generated & Email Sent!
                </p>
                <p className="text-sm text-charcoal-faint">
                  Welcome email dispatched via SMTP to <strong>{result.recipient}</strong>
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[15px] bg-bgsoft p-5">
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-faint">Student Name</span>
                  <strong className="text-charcoal">{student.user_name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-faint">Matric Number</span>
                  <strong className="text-charcoal">{student.matric_number}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-faint">Login Email</span>
                  <strong className="text-charcoal">{result.email}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-faint">Generated Password</span>
                  <code className="rounded bg-primary-soft px-2 py-0.5 font-mono text-primary">
                    {result.plain_password}
                  </code>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[15px] bg-bgsoft p-4">
              <p className="text-sm text-charcoal-faint">
                You can inspect this email immediately in the local Mailpit web console:
              </p>
              <Button
                variant="outlined"
                color="inherit"
                className="mt-2"
                component="a"
                href="http://localhost:8025"
                target="_blank"
                rel="noreferrer"
                startIcon={<ExternalLinkIcon />}
                sx={{ color: 'primary.main', borderColor: 'primary.main' }}
              >
                Open Mailpit Inbox (Port 8025)
              </Button>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="contained" color="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="rounded-[15px] bg-bgsoft p-4">
              <div className="space-y-2 text-sm">
                <p className="flex items-center justify-between text-charcoal-faint">
                  <span>Student</span>
                  <strong className="text-charcoal">
                    {student.user_name} ({student.matric_number})
                  </strong>
                </p>
                <p className="flex items-center justify-between text-charcoal-faint">
                  <span>Degree Programme</span>
                  <strong className="text-charcoal">{student.program_name}</strong>
                </p>
                <p className="flex items-center justify-between text-charcoal-faint">
                  <span>Level</span>
                  <strong className="text-charcoal">{student.level_display}</strong>
                </p>
                <p className="flex items-center justify-between text-charcoal-faint">
                  <span>Target Email</span>
                  <strong className="text-charcoal">{student.user_email}</strong>
                </p>
              </div>
            </div>

            <TextField
              fullWidth
              size="medium"
              label="Custom Temporary Password (Optional)"
              placeholder="Leave blank to auto-generate secure password (e.g. EduSal-2026!7xK)"
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
            />
            <p className="-mt-2 text-xs text-charcoal-faint">
              If left blank, a cryptographically secure random password will be created
              automatically.
            </p>

            <div className="flex items-start gap-2 rounded-[15px] bg-primary-soft/40 p-4">
              <SparklesIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.5 }} />
              <p className="text-sm text-charcoal">
                The system will set the student password and send a formatted HTML welcome
                email with login instructions to <strong>{student.user_email}</strong> via
                Mailpit.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outlined"
                color="inherit"
                onClick={onClose}
                sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={<KeyIcon />}
              >
                {isSubmitting
                  ? 'Generating & Sending Email...'
                  : 'Generate & Send Credentials Email'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};