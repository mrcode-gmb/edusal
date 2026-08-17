import { useState, type FC, type FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon, Close as CloseIcon } from '@mui/icons-material';

interface AddProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  departmentId: string;
  onSubmit: (data: {
    institution: string;
    department: string;
    name: string;
    program_code: string;
    award_level: string;
    duration_years: number;
    siwes_duration_months: number;
  }) => Promise<void>;
}

const awardLevels = [
  { value: 'BSC', label: 'B.Sc. (Bachelor of Science)' },
  { value: 'BTECH', label: 'B.Tech. (Bachelor of Technology)' },
  { value: 'BENG', label: 'B.Eng. (Bachelor of Engineering)' },
  { value: 'BA', label: 'B.A. (Bachelor of Arts)' },
  { value: 'LLB', label: 'LL.B. (Bachelor of Laws)' },
  { value: 'ND', label: 'National Diploma (ND)' },
  { value: 'HND', label: 'Higher National Diploma (HND)' },
  { value: 'NCE', label: 'NCE (Nigeria Certificate in Education)' },
  { value: 'PGD', label: 'Postgraduate Diploma (PGD)' },
  { value: 'MSC', label: 'M.Sc. (Master of Science)' },
];

export const AddProgramModal: FC<AddProgramModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  departmentId,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [programCode, setProgramCode] = useState('');
  const [awardLevel, setAwardLevel] = useState('BSC');
  const [durationYears, setDurationYears] = useState(4);
  const [siwesDuration, setSiwesDuration] = useState(6);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        institution: institutionId,
        department: departmentId,
        name,
        program_code: programCode,
        award_level: awardLevel,
        duration_years: Number(durationYears),
        siwes_duration_months: Number(siwesDuration),
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
          <AutoAwesomeIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          Add Academic Degree Programme (Tier 4)
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
            label="Programme / Degree Option Name"
            required
            placeholder="e.g. B.Tech Cyber Security Science / ND Statistics"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Programme Code"
              placeholder="e.g. CSS-BTECH / ND-CS"
              value={programCode}
              onChange={(e) => setProgramCode(e.target.value.toUpperCase())}
            />
            <TextField
              fullWidth
              size="medium"
              select
              label="Award Level"
              value={awardLevel}
              onChange={(e) => setAwardLevel(e.target.value)}
            >
              {awardLevels.map((a) => (
                <MenuItem key={a.value} value={a.value}>
                  {a.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Programme Duration (Years)"
              type="number"
              slotProps={{ htmlInput: { min: 1, max: 7 } }}
              value={durationYears}
              onChange={(e) => setDurationYears(Number(e.target.value))}
            />
            <TextField
              fullWidth
              size="medium"
              label="SIWES Period (Months)"
              type="number"
              slotProps={{ htmlInput: { min: 0, max: 24 } }}
              value={siwesDuration}
              onChange={(e) => setSiwesDuration(Number(e.target.value))}
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
              {isSubmitting ? 'Creating...' : 'Create Programme Option'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};