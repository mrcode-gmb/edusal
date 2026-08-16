import { useState, type FC, type FormEvent } from 'react';
import type { InstitutionHierarchyTree, PathwayCreatePayload } from '../../types/institution';
import { CompassIcon, PlusIcon } from '../icons';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <CompassIcon size={20} color="#0284c7" />
            <div>
              <h3>Create Custom Career Pathway</h3>
              <p>Design a structured career roadmap tailored to an academic degree program</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row-3">
            <div className="form-group">
              <label>Academic Division *</label>
              <select
                required
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedDepartment('');
                  setSelectedProgram('');
                }}
              >
                <option value="">Select Division</option>
                {tree?.divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Department *</label>
              <select
                required
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedProgram('');
                }}
                disabled={!selectedDivision}
              >
                <option value="">Select Department</option>
                {availableDepts.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Degree Programme *</label>
              <select
                required
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                disabled={!selectedDepartment}
              >
                <option value="">Select Programme</option>
                {availableProgs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.duration_years} yrs)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Pathway Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud & DevOps Engineering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Target Career Role *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud Solutions Architect / SRE"
                value={careerRole}
                onChange={(e) => setCareerRole(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Industry Sector</label>
              <input
                type="text"
                placeholder="e.g. Information Technology / Fintech / Telecom"
                value={industrySector}
                onChange={(e) => setIndustrySector(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Target CGPA Recommendation</label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max="5.0"
                placeholder="3.00"
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Pathway Description & Competency Scope *</label>
            <textarea
              rows={3}
              required
              placeholder="Outline the core technical learning outcomes, practical skills, and employability profile of this pathway..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isTemplate}
                onChange={(e) => setIsTemplate(e.target.checked)}
              />
              <span>
                <strong>Publish as Master Template Blueprint</strong> (Allows other counsellors to clone and use this roadmap)
              </span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                'Creating Pathway...'
              ) : (
                <>
                  <PlusIcon size={14} /> Create Career Pathway
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
