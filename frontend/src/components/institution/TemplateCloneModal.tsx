import { useState, type FC, type FormEvent } from 'react';
import type { Pathway, InstitutionHierarchyTree, PathwayClonePayload } from '../../types/institution';
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';
import { AutoAwesome as SparklesIcon, Close as CloseIcon } from '@mui/icons-material';

interface TemplateCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Pathway | null;
  tree: InstitutionHierarchyTree | null;
  onSuccess: (newPathway: Pathway) => Promise<void>;
  cloneFn: (pathwayId: string, payload: PathwayClonePayload, token?: string) => Promise<Pathway>;
  authToken?: string | null;
}

export const TemplateCloneModal: FC<TemplateCloneModalProps> = ({
  isOpen,
  onClose,
  template,
  tree,
  onSuccess,
  cloneFn,
  authToken,
}) => {
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [customTitle, setCustomTitle] = useState(
    template ? `${template.title} (Customized)` : ''
  );
  const [customDescription, setCustomDescription] = useState(
    template?.description || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !template) return null;

  const currentDivision = tree?.divisions.find((d) => d.id === selectedDivision);
  const availableDepts = currentDivision ? currentDivision.departments : [];
  const currentDept = availableDepts.find((d) => d.id === selectedDepartment);
  const availableProgs = currentDept ? currentDept.programs : [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) {
      alert('Please select a target degree programme for this cloned pathway.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: PathwayClonePayload = {
        target_program: selectedProgram,
        custom_title: customTitle.trim(),
        custom_description: customDescription.trim(),
      };

      const cloned = await cloneFn(template.id, payload, authToken || undefined);
      await onSuccess(cloned);
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Template cloning failed');
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
          <SparklesIcon sx={{ fontSize: 22, color: 'primary.main', mt: 0.5 }} />
          <div>
            <p className="text-base font-bold text-charcoal">
              Use Template Blueprint for My Department
            </p>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              Deep-clone <strong>{template.title}</strong> and all its milestones to your
              program
            </p>
          </div>
        </div>
        <IconButton size="medium" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1 }}>
        <div className="rounded-[15px] bg-primary-soft/40 p-5">
          <div className="flex flex-wrap gap-1.5">
            <Chip
              label="Master Blueprint"
              size="medium"
              sx={{ bgcolor: 'charcoal', color: '#fff', fontWeight: 700 }}
            />
            <Chip
              label={`${template.total_points} Total Points`}
              size="medium"
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700 }}
            />
            <Chip
              label={`${template.total_milestones_count} Sequenced Milestones`}
              size="medium"
              variant="outlined"
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong', fontWeight: 700 }}
            />
          </div>
          <h4 className="mt-3 text-base font-bold text-charcoal">{template.title}</h4>
          <p className="mt-1 text-sm text-charcoal-faint">
            Target Role: <strong className="text-charcoal">{template.career_role}</strong> ·
            Industry:{' '}
            <strong className="text-charcoal">
              {template.industry_sector || 'General Tech'}
            </strong>
          </p>
          <p className="mt-1.5 text-sm text-charcoal-faint">{template.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              fullWidth
              size="medium"
              select
              label="Target Division / Faculty"
              required
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDepartment('');
                setSelectedProgram('');
              }}
            >
              <MenuItem value="">Select Faculty/School</MenuItem>
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
              label="Target Department"
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
              label="Target Programme"
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
          <TextField
            fullWidth
            size="medium"
            label="Customized Pathway Title"
            required
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="e.g. Software Engineering Cloud & DevOps Track"
          />
          <TextField
            fullWidth
            size="medium"
            multiline
            rows={3}
            label="Customized Description"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="Adapt the blueprint description for your departmental requirements..."
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
              disabled={isSubmitting || !selectedProgram}
              startIcon={<SparklesIcon />}
            >
              {isSubmitting ? 'Cloning Blueprint...' : 'Clone Blueprint to My Department'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};