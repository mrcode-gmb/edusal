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
import {
  Storage as StorageIcon,
  UploadFile as UploadFileIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  tree: InstitutionHierarchyTree | null;
  sessions: AcademicSession[];
  authToken?: string | null;
  onSuccess: () => Promise<void>;
  uploadFn: (formData: FormData, token?: string) => Promise<any>;
}

const docTypes = [
  { value: 'STUDENT_HANDBOOK', label: 'Student Academic Handbook' },
  { value: 'SIWES_CALENDAR', label: 'SIWES / ITCC Operational Calendar' },
  { value: 'INTERNSHIP_RUBRIC', label: 'Internship & Milestone Rubric' },
  { value: 'FACULTY_POLICY', label: 'Faculty / Senate Guidelines' },
  { value: 'CURRICULUM_GUIDE', label: 'Curriculum & Course Outline' },
];

export const UploadDocumentModal: FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  tree,
  sessions,
  authToken,
  onSuccess,
  uploadFn,
}) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('STUDENT_HANDBOOK');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSession, setSelectedSession] = useState(
    sessions.find((s) => s.is_current)?.id || sessions[0]?.id || ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  // Filter departments by selected division
  const availableDepts = selectedDivision && tree
    ? tree.divisions.find((d) => d.id === selectedDivision)?.departments || []
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Auto-fill title from filename without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (uploadMode === 'file' && !selectedFile) {
      alert('Please select a PDF, DOCX, or TXT document to upload.');
      return;
    }
    if (uploadMode === 'text' && !rawText.trim()) {
      alert('Please enter or paste the document text to ingest.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('institution', institutionId);
      formData.append('title', title.trim());
      formData.append('doc_type', docType);
      if (selectedDivision) formData.append('division', selectedDivision);
      if (selectedDepartment) formData.append('department', selectedDepartment);
      if (selectedSession) formData.append('session', selectedSession);

      if (uploadMode === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('raw_text', rawText.trim());
      }

      await uploadFn(formData, authToken || undefined);
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Document ingestion failed');
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
          <StorageIcon sx={{ fontSize: 22, color: 'primary.main', mt: 0.5 }} />
          <div>
            <p className="text-base font-bold text-charcoal">
              Ingest Institutional Document into pgvector
            </p>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              Upload official handbook, SIWES calendar, or curriculum rubric for
              zero-hallucination AI advisory
            </p>
          </div>
        </div>
        <IconButton size="medium" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1 }}>
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`flex items-center gap-2 rounded-[15px] px-4 py-2 text-sm font-bold transition-colors ${
              uploadMode === 'file'
                ? 'bg-primary text-white'
                : 'bg-bgsoft text-charcoal-faint hover:bg-primary-soft'
            }`}
          >
            <UploadFileIcon sx={{ fontSize: 16 }} /> Upload File (PDF / DOCX / TXT)
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('text')}
            className={`flex items-center gap-2 rounded-[15px] px-4 py-2 text-sm font-bold transition-colors ${
              uploadMode === 'text'
                ? 'bg-primary text-white'
                : 'bg-bgsoft text-charcoal-faint hover:bg-primary-soft'
            }`}
          >
            <DescriptionIcon sx={{ fontSize: 16 }} /> Paste Handbook Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {uploadMode === 'file' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-[15px] border-2 border-dashed px-6 py-8 text-center transition-colors ${
                dragOver ? 'border-primary bg-primary-soft' : 'border-border-strong bg-bgsoft'
              }`}
            >
              <input
                type="file"
                id="doc-file-input"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="doc-file-input" className="flex cursor-pointer flex-col items-center gap-2">
                <UploadFileIcon sx={{ fontSize: 32, color: selectedFile ? 'primary.main' : 'charcoal.faint' }} />
                {selectedFile ? (
                  <>
                    <span className="text-sm font-bold text-charcoal">{selectedFile.name}</span>
                    <span className="text-xs text-charcoal-faint">
                      ({(selectedFile.size / 1024).toFixed(1)} KB) · Click or drag to change
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-charcoal">
                      Click to browse or drag and drop official document
                    </span>
                    <span className="text-xs text-charcoal-faint">
                      PDF, Word (.docx), or Plain Text (.txt) up to 25MB
                    </span>
                  </>
                )}
              </label>
            </div>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Official Document Text Content"
              required
              placeholder="Paste the full guidelines, SIWES prerequisites, or handbook sections here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Document Title"
              required
              placeholder="e.g. FUTMinna 2025/2026 SIWES Operational Manual"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              fullWidth
              size="medium"
              select
              label="Document Type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              {docTypes.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              fullWidth
              size="medium"
              select
              label="Scope: Faculty / School"
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDepartment('');
              }}
            >
              <MenuItem value="">Institution-Wide (All Units)</MenuItem>
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
              label="Scope: Department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={!selectedDivision}
            >
              <MenuItem value="">All Departments in Unit</MenuItem>
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
              label="Academic Session"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_label} {s.is_current ? '(Current)' : ''}
                </MenuItem>
              ))}
            </TextField>
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
              startIcon={<UploadFileIcon />}
            >
              {isSubmitting ? 'Parsing & Embedding in pgvector...' : 'Ingest & Index Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};