import { useState, type FC, type FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
} from '@mui/material';
import { AccountTree as AccountTreeIcon, Close as CloseIcon } from '@mui/icons-material';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  divisionId: string;
  onSubmit: (data: {
    institution: string;
    division: string;
    name: string;
    code: string;
    hod_name?: string;
    hod_email?: string;
    siwes_eligible: boolean;
  }) => Promise<void>;
}

export const AddDepartmentModal: FC<AddDepartmentModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  divisionId,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [siwesEligible, setSiwesEligible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        institution: institutionId,
        division: divisionId,
        name,
        code,
        hod_name: hodName,
        hod_email: hodEmail,
        siwes_eligible: siwesEligible,
      });
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: '15px', maxWidth: 560 } } }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <span className="flex items-center gap-2 text-base font-bold text-charcoal">
          <AccountTreeIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          Add Academic Department (Tier 3)
        </span>
        <IconButton size="medium" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1 }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            fullWidth
            size="medium"
            label="Department Name"
            required
            placeholder="e.g. Department of Cyber Security Science"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            fullWidth
            size="medium"
            label="Department Code / Acronym"
            placeholder="e.g. CSS / SWE / MEE"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Head of Department (HOD)"
              placeholder="e.g. Dr. Aminu Ibrahim"
              value={hodName}
              onChange={(e) => setHodName(e.target.value)}
            />
            <TextField
              fullWidth
              size="medium"
              label="HOD Email"
              type="email"
              placeholder="e.g. hod.css@univ.edu.ng"
              value={hodEmail}
              onChange={(e) => setHodEmail(e.target.value)}
            />
          </div>
          <FormControlLabel
            control={
              <Switch
                checked={siwesEligible}
                onChange={(e) => setSiwesEligible(e.target.checked)}
              />
            }
            label={
              <span className="text-sm text-charcoal">
                Students in this department participate in SIWES / ITF Industrial
                Attachments
              </span>
            }
            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' } }}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};