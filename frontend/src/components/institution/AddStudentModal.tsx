import { useState, type FC, type FormEvent } from 'react';
import type { InstitutionHierarchyTree, AcademicSession } from '../../types/institution';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';
import { School as GraduationCapIcon, Close as CloseIcon } from '@mui/icons-material';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  tree: InstitutionHierarchyTree | null;
  sessions: AcademicSession[];
  authToken?: string | null;
  onSubmit: (data: {
    email: string;
    name: string;
    institution: string;
    program: string;
    matric_number: string;
    jamb_reg_number?: string;
    entry_session: string;
    entry_mode?: string;
    year_of_study?: number;
    cgpa?: number | null;
    phone_number?: string;
  }) => Promise<void>;
}

export const AddStudentModal: FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  tree,
  sessions,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [jambRegNumber, setJambRegNumber] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(
    sessions.find((s) => s.is_current)?.id || sessions[0]?.id || ''
  );
  const [entryMode, setEntryMode] = useState('UTME');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [cgpa, setCgpa] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Flatten all programs across divisions & departments
  const availablePrograms: Array<{
    id: string;
    name: string;
    departmentName: string;
    divisionName: string;
    durationYears: number;
    awardLevel: string;
  }> = [];

  if (tree) {
    tree.divisions.forEach((div) => {
      div.departments.forEach((dept) => {
        dept.programs.forEach((prog) => {
          availablePrograms.push({
            id: prog.id,
            name: prog.name,
            departmentName: dept.name,
            divisionName: div.name,
            durationYears: prog.duration_years || 4,
            awardLevel: prog.award_level || 'BSC',
          });
        });
      });
    });
  }

  const selectedProg = availablePrograms.find((p) => p.id === selectedProgramId) || availablePrograms[0];
  const maxYears = selectedProg?.durationYears || 4;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !matricNumber.trim()) return;
    if (!selectedProgramId && availablePrograms.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        institution: institutionId,
        program: selectedProgramId || availablePrograms[0].id,
        matric_number: matricNumber.trim().toUpperCase(),
        jamb_reg_number: jambRegNumber.trim().toUpperCase(),
        entry_session: selectedSessionId || sessions[0]?.id,
        entry_mode: entryMode,
        year_of_study: Number(yearOfStudy),
        cgpa: cgpa ? parseFloat(cgpa) : null,
        phone_number: phoneNumber.trim(),
      });
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Student registration failed');
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
          <GraduationCapIcon sx={{ fontSize: 22, color: 'primary.main', mt: 0.5 }} />
          <div>
            <p className="text-base font-bold text-charcoal">Register Student into Program</p>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              Anchored hierarchically to degree programme, department, and faculty
            </p>
          </div>
        </div>
        <IconButton size="medium" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1 }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 space-y-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Student Full Name"
              required
              placeholder="e.g. Amina Bello"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              size="medium"
              label="Official Institutional Email"
              required
              type="email"
              placeholder="e.g. a.bello@student.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Matriculation Number"
              required
              placeholder="e.g. 2021/1/74892SWE"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
            />
            <TextField
              fullWidth
              size="medium"
              label="JAMB Registration No."
              placeholder="e.g. 202140192849EF"
              value={jambRegNumber}
              onChange={(e) => setJambRegNumber(e.target.value)}
            />
          </div>
          <TextField
            fullWidth
            size="medium"
            select
            label="Academic Programme (Tier 4)"
            required
            value={selectedProgramId || (availablePrograms[0]?.id ?? '')}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              const p = availablePrograms.find((item) => item.id === e.target.value);
              if (p && yearOfStudy > p.durationYears) {
                setYearOfStudy(p.durationYears);
              }
            }}
          >
            {availablePrograms.map((prog) => (
              <MenuItem key={prog.id} value={prog.id}>
                {prog.name} — {prog.departmentName} ({prog.durationYears} Years Duration)
              </MenuItem>
            ))}
          </TextField>
          <br /> <br />
          <p className="-mt-3 text-xs text-charcoal-faint">
            Program duration ({maxYears} years) automatically dictates student level
            progression & SIWES windows.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              select
              label="Entry Session"
              required
              value={selectedSessionId || (sessions[0]?.id ?? '')}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_label} {s.is_current ? '(Current Session)' : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="medium"
              select
              label="Entry Mode"
              value={entryMode}
              onChange={(e) => {
                setEntryMode(e.target.value);
                if (e.target.value === 'DIRECT_ENTRY' && yearOfStudy === 1) {
                  setYearOfStudy(2);
                }
              }}
            >
              <MenuItem value="UTME">UTME (Standard Entry — Year 1)</MenuItem>
              <MenuItem value="DIRECT_ENTRY">Direct Entry (DE — Year 2)</MenuItem>
              <MenuItem value="TRANSFER">Inter-Faculty / University Transfer</MenuItem>
              <MenuItem value="CONVERSION">HND to B.Sc. Conversion</MenuItem>
            </TextField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              select
              label={`Current Year of Study (${yearOfStudy} of ${maxYears})`}
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(Number(e.target.value))}
            >
              {Array.from({ length: maxYears }, (_, i) => i + 1).map((yr) => (
                <MenuItem key={yr} value={yr}>
                  Year {yr} — {yr * 100} Level {yr === maxYears ? '(Final Year)' : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="medium"
              label="Current CGPA (Optional)"
              type="number"
              slotProps={{ htmlInput: { step: '0.01', min: '0.00', max: '5.00' } }}
              placeholder="e.g. 4.35"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
            />
          </div>
          <TextField
            fullWidth
            size="medium"
            label="Phone / WhatsApp Number"
            type="tel"
            placeholder="e.g. +234 803 000 0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
              {isSubmitting ? 'Registering Student...' : 'Register Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};