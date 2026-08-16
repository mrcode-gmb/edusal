import { useState, type FC, type FormEvent } from 'react';
import type { InstitutionHierarchyTree, PathwayCreatePayload } from '../../types/institution';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { Explore as CompassIcon, Close as CloseIcon, Add as PlusIcon } from '@mui/icons-material';

interface CreatePathwayModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  tree: InstitutionHierarchyTree | null;
  onSuccess: () => Promise<void>;
  createFn: (payload: PathwayCreatePayload, token?: string) => Promise<any>;
  authToken?: string | null;
}

export const CreatePathwayModal: FC<CreatePathwayModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  tree,
  onSuccess,
  createFn,
  authToken,
}) => {
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [title, setTitle] = useState('');
  const [careerRole, setCareerRole] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const [description, setDescription] = useState('');
  const [targetCgpa, setTargetCgpa] = useState('3.00');
  const [isTemplate, setIsTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentDivision = tree?.divisions.find((d) => d.id === selectedDivision);
  const availableDepts = currentDivision ? currentDivision.departments : [];
  const currentDept = availableDepts.find((d) => d.id === selectedDepartment);
  const availableProgs = currentDept ? currentDept.programs : [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProgram) return;

    setIsSubmitting(true);
    try {
      const payload: PathwayCreatePayload = {
        institution: institutionId,
        program: selectedProgram,
        title: title.trim(),
        career_role: careerRole.trim() || title.trim(),
        industry_sector: industrySector.trim(),
        description: description.trim(),
        target_cgpa_recommendation: targetCgpa ? Number(targetCgpa) : null,
        is_active: true,
        is_template: isTemplate,
        template_visibility: isTemplate ? 'INSTITUTION' : 'DEPARTMENT',
      };

      await createFn(payload, authToken || undefined);
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create pathway');
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
          <CompassIcon sx={{ fontSize: 22, color: 'primary.main', mt: 0.5 }} />
          <div>
            <p className="text-base font-bold text-charcoal">Create Custom Career Pathway</p>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              Design a structured career roadmap tailored to an academic degree program
            </p>
          </div>
        </div>
        <IconButton size="medium" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1 }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              fullWidth
              size="medium"
              select
              label="Academic Division"
              required
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDepartment('');
                setSelectedProgram('');
              }}
            >
              <MenuItem value="">Select Division</MenuItem>
              {tree?.divisions.map((div) => (
                <MenuItem key={div.id} value={div.id}>
                  {div.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="medium"
              select
              label="Department"
              required
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedProgram('');
              }}
              disabled={!selectedDivision}
            >
              <MenuItem value="">Select Department</MenuItem>
              {availableDepts.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="medium"
              select
              label="Degree Programme"
              required
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              disabled={!selectedDepartment}
            >
              <MenuItem value="">Select Programme</MenuItem>
              {availableProgs.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.duration_years} yrs)
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Pathway Title"
              required
              placeholder="e.g. Cloud & DevOps Engineering"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              fullWidth
              size="medium"
              label="Target Career Role"
              required
              placeholder="e.g. Cloud Solutions Architect / SRE"
              value={careerRole}
              onChange={(e) => setCareerRole(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Industry Sector"
              placeholder="e.g. Information Technology / Fintech / Telecom"
              value={industrySector}
              onChange={(e) => setIndustrySector(e.target.value)}
            />
            <TextField
              fullWidth
              size="medium"
              label="Target CGPA Recommendation"
              type="number"
              slotProps={{ htmlInput: { step: '0.01', min: 1.0, max: 5.0 } }}
              placeholder="3.00"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(e.target.value)}
            />
          </div>
          <TextField
            fullWidth
            size="medium"
            multiline
            rows={4}
            label="Pathway Description & Competency Scope"
            required
            placeholder="Outline the core technical learning outcomes, practical skills, and employability profile of this pathway..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isTemplate}
                onChange={(e) => setIsTemplate(e.target.checked)}
              />
            }
            label={
              <span className="text-sm text-charcoal">
                <strong>Publish as Master Template Blueprint</strong> (Allows other
                counsellors to clone and use this roadmap)
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={<PlusIcon />}
            >
              {isSubmitting ? 'Creating Pathway...' : 'Create Career Pathway'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};