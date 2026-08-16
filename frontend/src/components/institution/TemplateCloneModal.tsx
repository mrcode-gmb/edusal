import { useState, type FC, type FormEvent } from 'react';
import type { Pathway, InstitutionHierarchyTree, PathwayClonePayload } from '../../types/institution';
import { SparklesIcon } from '../icons';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <SparklesIcon size={20} color="#0284c7" />
            <div>
              <h3>Use Template Blueprint for My Department</h3>
              <p>Deep-clone <strong>{template.title}</strong> and all its milestones to your program</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Template Blueprint Summary Preview */}
        <div className="template-preview-banner">
          <div className="blueprint-meta-row">
            <span className="blueprint-tag">Master Blueprint</span>
            <span className="blueprint-points">{template.total_points} Total Points</span>
            <span className="blueprint-count">{template.total_milestones_count} Sequenced Milestones</span>
          </div>
          <h4 className="blueprint-title">{template.title}</h4>
          <p className="blueprint-role">
            Target Role: <strong>{template.career_role}</strong> · Industry: <strong>{template.industry_sector || 'General Tech'}</strong>
          </p>
          <p className="blueprint-desc">{template.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row-3">
            <div className="form-group">
              <label>Target Division / Faculty *</label>
              <select
                required
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedDepartment('');
                  setSelectedProgram('');
                }}
              >
                <option value="">Select Faculty/School</option>
                {tree?.divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Target Department *</label>
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
              <label>Target Programme *</label>
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

          <div className="form-group">
            <label>Customized Pathway Title *</label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Software Engineering Cloud & DevOps Track"
            />
          </div>

          <div className="form-group">
            <label>Customized Description</label>
            <textarea
              rows={2}
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Adapt the blueprint description for your departmental requirements..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !selectedProgram}>
              {isSubmitting ? (
                'Cloning Blueprint...'
              ) : (
                <>
                  <SparklesIcon size={14} /> Clone Blueprint to My Department
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
