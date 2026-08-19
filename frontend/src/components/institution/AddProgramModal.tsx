import { useState, type FC, type FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon, Close as CloseIcon } from '@mui/icons-material';
import type { SiwesPattern, SiwesAcademicImpact } from '../../types/institution';

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
    siwes_pattern?: string;
    siwes_academic_impact?: string;
  }) => Promise<void>;
}

const awardLevels = [
  { value: 'BSC', label: 'B.Sc. (Bachelor of Science)' },
  { value: 'BTECH', label: 'B.Tech. (Bachelor of Technology)' },
  { value: 'BENG', label: 'B.Eng. (Bachelor of Engineering)' },
  { value: 'BA', label: 'B.A. (Bachelor of Arts)' },
  { value: 'BED', label: 'B.Ed. (Bachelor of Education)' },
  { value: 'LLB', label: 'LL.B. (Bachelor of Laws)' },
  { value: 'MBBS', label: 'MBBS (Medicine & Surgery)' },
  { value: 'ND', label: 'National Diploma (ND)' },
  { value: 'HND', label: 'Higher National Diploma (HND)' },
  { value: 'NCE', label: 'NCE (Nigeria Certificate in Education)' },
  { value: 'PGD', label: 'Postgraduate Diploma (PGD)' },
  { value: 'MSC', label: 'M.Sc. (Master of Science)' },
];

const siwesPatterns: { value: SiwesPattern; label: string; defaultMonths: number; impact: SiwesAcademicImpact }[] = [
  {
    value: 'SEM2_300L',
    label: '300 Level Second Semester (6 Months Continuous — Standard B.Sc.)',
    defaultMonths: 6,
    impact: 'SECOND_SEMESTER_SUBSTITUTE',
  },
  {
    value: 'YEAR4_400L_EXTENDED',
    label: '400 Level Extended (6 to 9 Months — Engineering / B.Tech / Agri)',
    defaultMonths: 6,
    impact: 'SECOND_SEMESTER_SUBSTITUTE',
  },
  {
    value: 'SPLIT_200L_300L',
    label: 'Split Vacations (3 Mo @ 200L End + 3 Mo @ 300L End — 0 Semester Disruption)',
    defaultMonths: 6,
    impact: 'VACATION_ONLY',
  },
  {
    value: 'ND_VACATION',
    label: 'ND Industrial Attachment (3 to 4 Months Vacation — Polytechnic)',
    defaultMonths: 4,
    impact: 'VACATION_ONLY',
  },
  {
    value: 'POST_ND_MANDATORY',
    label: 'Post-ND Mandatory Industrial Training (12 Months Gap Year)',
    defaultMonths: 12,
    impact: 'FULL_SESSION_ATTACHMENT',
  },
  {
    value: 'TEACHING_PRACTICE',
    label: 'Teaching Practice / Practicum (3 to 6 Months — Education / NCE)',
    defaultMonths: 3,
    impact: 'SECOND_SEMESTER_SUBSTITUTE',
  },
  {
    value: 'EXEMPT',
    label: 'Exempt / Non-Participating (0 Months — Law / Arts / Accounting)',
    defaultMonths: 0,
    impact: 'EXEMPT',
  },
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
  const [siwesPattern, setSiwesPattern] = useState<SiwesPattern>('SEM2_300L');
  const [siwesDuration, setSiwesDuration] = useState(6);
  const [siwesAcademicImpact, setSiwesAcademicImpact] = useState<SiwesAcademicImpact>('SECOND_SEMESTER_SUBSTITUTE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePatternChange = (pat: SiwesPattern) => {
    setSiwesPattern(pat);
    const found = siwesPatterns.find((p) => p.value === pat);
    if (found) {
      setSiwesDuration(found.defaultMonths);
      setSiwesAcademicImpact(found.impact);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        institution: institutionId,
        department: departmentId,
        name: name.trim(),
        program_code: programCode.trim(),
        award_level: awardLevel,
        duration_years: Number(durationYears),
        siwes_duration_months: Number(siwesDuration),
        siwes_pattern: siwesPattern,
        siwes_academic_impact: siwesAcademicImpact,
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
      slotProps={{ paper: { sx: { borderRadius: '20px', maxWidth: 620 } } }}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            size="small"
            label="Programme / Degree Option Name"
            required
            placeholder="e.g. B.Tech Cyber Security Science / B.Eng Mechanical Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              fullWidth
              size="small"
              label="Programme Code"
              placeholder="e.g. CSS-BTECH / BENG-MEE"
              value={programCode}
              onChange={(e) => setProgramCode(e.target.value.toUpperCase())}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              fullWidth
              size="small"
              select
              label="Award Level"
              value={awardLevel}
              onChange={(e) => setAwardLevel(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            >
              {awardLevels.map((a) => (
                <MenuItem key={a.value} value={a.value}>
                  {a.label}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              fullWidth
              size="small"
              label="Programme Duration (Years)"
              type="number"
              slotProps={{ htmlInput: { min: 1, max: 7 } }}
              value={durationYears}
              onChange={(e) => setDurationYears(Number(e.target.value))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              fullWidth
              size="small"
              label="Total SIWES Duration (Months)"
              type="number"
              slotProps={{ htmlInput: { min: 0, max: 24 } }}
              value={siwesDuration}
              onChange={(e) => setSiwesDuration(Number(e.target.value))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </div>

          {/* SIWES Operational Pattern */}
          <div className="rounded-xl border border-primary/20 bg-primary-faint/20 p-3.5 space-y-2">
            <label className="text-xs font-bold text-primary uppercase tracking-wider block">
              SIWES Operational Placement Pattern
            </label>
            <FormControl fullWidth size="small">
              <InputLabel>Attachment Schedule</InputLabel>
              <Select
                value={siwesPattern}
                label="Attachment Schedule"
                onChange={(e) => handlePatternChange(e.target.value as SiwesPattern)}
                sx={{ borderRadius: '8px', bgcolor: 'white' }}
              >
                {siwesPatterns.map((pat) => (
                  <MenuItem key={pat.value} value={pat.value}>
                    <div className="py-0.5">
                      <span className="font-semibold text-xs text-charcoal block">{pat.label}</span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
            >
              {isSubmitting ? 'Creating...' : 'Create Degree Option'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};