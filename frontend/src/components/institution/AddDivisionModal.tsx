import { useState, type FC, type FormEvent } from 'react';
import type { TierTwoTerm } from '../../types/institution';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import { AccountTree as AccountTreeIcon, Close as CloseIcon } from '@mui/icons-material';

interface AddDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  tierTwoTerm: TierTwoTerm;
  onSubmit: (data: {
    institution: string;
    name: string;
    code: string;
    division_type: 'FACULTY' | 'SCHOOL' | 'COLLEGE';
    dean_name?: string;
    dean_email?: string;
  }) => Promise<void>;
}

export const AddDivisionModal: FC<AddDivisionModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  tierTwoTerm,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [deanName, setDeanName] = useState('');
  const [deanEmail, setDeanEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultDivisionType =
    tierTwoTerm === 'SCHOOL' ? 'SCHOOL' : tierTwoTerm === 'COLLEGE' ? 'COLLEGE' : 'FACULTY';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        institution: institutionId,
        name,
        code,
        division_type: defaultDivisionType,
        dean_name: deanName,
        dean_email: deanEmail,
      });
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = tierTwoTerm === 'SCHOOL' ? 'School' : tierTwoTerm === 'COLLEGE' ? 'College' : 'Faculty';

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
          Add Academic Division (Tier 2: {label})
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
            label={`${label} Name`}
            required
            placeholder={`e.g. ${label} of Physical Sciences`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            fullWidth
            size="medium"
            label={`${label} Acronym / Code`}
            placeholder="e.g. FPS / SICT / SEET"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Dean Full Name"
              placeholder="e.g. Prof. J. O. Adebayo"
              value={deanName}
              onChange={(e) => setDeanName(e.target.value)}
            />
            <TextField
              fullWidth
              size="medium"
              label="Dean Official Email"
              type="email"
              placeholder="e.g. dean.science@univ.edu.ng"
              value={deanEmail}
              onChange={(e) => setDeanEmail(e.target.value)}
            />
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
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : `Create ${label}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};