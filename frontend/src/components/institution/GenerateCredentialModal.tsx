import { useState, type FC, type FormEvent } from 'react';
import type { StudentProfile, StudentCredentialResult } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  TextField,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Key as KeyIcon,
  Verified as CheckCircleIcon,
  AutoAwesome as SparklesIcon,
  OpenInNew as ExternalLinkIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Email as EmailIcon,
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
  const [copied, setCopied] = useState(false);
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

  const handleCopyPassword = () => {
    if (!result?.plain_password) return;
    navigator.clipboard.writeText(result.plain_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isSubmitting && onClose()}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            p: 0.5,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <KeyIcon />
          </span>
          <div>
            <h3 className="text-base font-bold text-charcoal">
              Set Student Password & Dispatch Credentials
            </h3>
            <p className="text-xs text-charcoal-faint">
              Issue temporary login password and send welcome email to student.
            </p>
          </div>
        </div>
        <IconButton size="small" onClick={onClose} disabled={isSubmitting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 2 }}>
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-[16px] bg-primary-soft/50 p-4 border border-primary/20">
              <CheckCircleIcon sx={{ fontSize: 26, color: 'primary.main' }} />
              <div>
                <p className="text-sm font-bold text-charcoal">
                  Credentials Generated & Email Sent!
                </p>
                <p className="text-xs text-charcoal-faint">
                  Welcome email dispatched via SMTP to <strong className="break-all">{result.recipient}</strong>
                </p>
              </div>
            </div>

            <div className="rounded-[16px] bg-bgsoft p-4 border border-line space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-charcoal-faint font-semibold">Student Name:</span>
                <strong className="text-charcoal text-right">{student.user_name}</strong>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-charcoal-faint font-semibold">Matric Number:</span>
                <strong className="text-charcoal font-mono text-right">{student.matric_number}</strong>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-charcoal-faint font-semibold">Login Email:</span>
                <strong className="text-charcoal break-all text-right font-mono">{result.email}</strong>
              </div>
              <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                <span className="text-charcoal-faint font-semibold">Generated Password:</span>
                <div className="flex items-center gap-1.5">
                  <code className="rounded-lg bg-primary-soft px-2.5 py-1 font-mono text-xs font-bold text-primary">
                    {result.plain_password}
                  </code>
                  <Tooltip title={copied ? 'Copied!' : 'Copy Password'}>
                    <IconButton size="small" onClick={handleCopyPassword} color="primary">
                      {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="rounded-[14px] bg-amber-50/60 p-3.5 border border-amber-200/60 text-xs text-charcoal space-y-2">
              <p className="font-semibold text-amber-900 flex items-center gap-1.5">
                <EmailIcon sx={{ fontSize: 16 }} />
                Inspect in Local Mailpit Console:
              </p>
              <p className="text-charcoal-faint">
                You can test and view the formatted student onboarding email in Mailpit:
              </p>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                component="a"
                href="http://localhost:8025"
                target="_blank"
                rel="noreferrer"
                startIcon={<ExternalLinkIcon fontSize="small" />}
                sx={{ borderRadius: '8px', textTransform: 'none', color: 'primary.main', borderColor: 'primary.main', fontWeight: 600 }}
              >
                Open Mailpit Inbox (Port 8025)
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Student Metadata Card */}
            <div className="rounded-[16px] bg-bgsoft p-3.5 border border-line space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-charcoal-faint font-semibold">Student:</span>
                <div className="text-right">
                  <span className="font-bold text-charcoal block">{student.user_name}</span>
                  <span className="text-charcoal-faint font-mono text-[11px]">{student.matric_number}</span>
                </div>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-charcoal-faint font-semibold">Programme:</span>
                <span className="font-bold text-charcoal text-right">{student.program_name}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-charcoal-faint font-semibold">Level / Standing:</span>
                <div className="flex items-center gap-1.5 justify-end">
                  <Chip
                    size="small"
                    label={student.level_display || `${student.year_of_study * 100}L`}
                    sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                  />
                  <span className="text-charcoal font-semibold text-[11px]">
                    {student.academic_standing_display || 'In Good Standing'}
                  </span>
                </div>
              </div>
              <div className="flex items-start justify-between gap-2 pt-1 border-t border-line/60">
                <span className="text-charcoal-faint font-semibold">Recipient Email:</span>
                <span className="font-mono text-charcoal break-all text-right font-semibold">
                  {student.user_email}
                </span>
              </div>
            </div>

            {/* Custom Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal block">
                Custom Password (Optional)
              </label>
              <TextField
                fullWidth
                size="small"
                placeholder="Leave blank to auto-generate secure password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                sx={{ bgcolor: '#fff', borderRadius: '8px' }}
              />
              <p className="text-[11px] text-charcoal-faint">
                Leave blank to let the system generate a secure password (e.g. <code>Nexus-2026!7xK</code>).
              </p>
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-2 rounded-[14px] bg-primary-soft/40 p-3 border border-primary/10">
              <SparklesIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.25, shrink: 0 }} />
              <p className="text-xs text-charcoal leading-relaxed">
                The student account will be updated with the password and an HTML welcome email will be dispatched to <strong>{student.user_email}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={onClose}
                disabled={isSubmitting}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <KeyIcon fontSize="small" />}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                {isSubmitting ? 'Issuing & Sending…' : 'Issue Password & Email'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>

      {result && (
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={onClose}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
          >
            Done
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
