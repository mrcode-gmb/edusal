import { useState, type FC, type FormEvent } from 'react';
import type { InstitutionHierarchyTree, AcademicSession } from '../../types/institution';
import { FileTextIcon, UploadIcon, DatabaseIcon } from '../icons';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <DatabaseIcon size={20} color="#0284c7" />
            <div>
              <h3>Ingest Institutional Document into pgvector</h3>
              <p>Upload official handbook, SIWES calendar, or curriculum rubric for zero-hallucination AI advisory</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="upload-mode-selector">
          <button
            type="button"
            className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
            onClick={() => setUploadMode('file')}
          >
            <UploadIcon size={14} /> Upload File (PDF / DOCX / TXT)
          </button>
          <button
            type="button"
            className={`mode-btn ${uploadMode === 'text' ? 'active' : ''}`}
            onClick={() => setUploadMode('text')}
          >
            <FileTextIcon size={14} /> Paste Handbook Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {uploadMode === 'file' ? (
            <div
              className={`file-drop-zone ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'file-selected' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="doc-file-input"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="doc-file-input" className="drop-zone-label">
                <UploadIcon size={28} color={selectedFile ? '#059669' : '#0284c7'} />
                {selectedFile ? (
                  <div className="selected-file-info">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">
                      ({(selectedFile.size / 1024).toFixed(1)} KB) · Click or drag to change
                    </span>
                  </div>
                ) : (
                  <div className="drop-zone-text">
                    <span className="primary-text">Click to browse or drag and drop official document</span>
                    <span className="secondary-text">PDF, Word (.docx), or Plain Text (.txt) up to 25MB</span>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div className="form-group">
              <label>Official Document Text Content *</label>
              <textarea
                required
                rows={6}
                placeholder="Paste the full guidelines, SIWES prerequisites, or handbook sections here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label>Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. FUTMinna 2025/2026 SIWES Operational Manual"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Document Type *</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="STUDENT_HANDBOOK">Student Academic Handbook</option>
                <option value="SIWES_CALENDAR">SIWES / ITCC Operational Calendar</option>
                <option value="INTERNSHIP_RUBRIC">Internship & Milestone Rubric</option>
                <option value="FACULTY_POLICY">Faculty / Senate Guidelines</option>
                <option value="CURRICULUM_GUIDE">Curriculum & Course Outline</option>
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Scope: Faculty / School</label>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedDepartment('');
                }}
              >
                <option value="">Institution-Wide (All Units)</option>
                {tree?.divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Scope: Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                disabled={!selectedDivision}
              >
                <option value="">All Departments in Unit</option>
                {availableDepts.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Academic Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.session_label} {s.is_current ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Parsing & Embedding in pgvector...</>
              ) : (
                <>
                  <UploadIcon size={14} /> Ingest & Index Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
