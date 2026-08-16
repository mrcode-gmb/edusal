import { useState, type FC, type FormEvent } from 'react';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  divisionId: string;
  onSubmit: (data: {
    institution: string;
    division: string;
    name: string;
    code: string;
    hod_name?: string;
    hod_email?: string;
    siwes_eligible: boolean;
  }) => Promise<void>;
}

export const AddDepartmentModal: FC<AddDepartmentModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  divisionId,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [siwesEligible, setSiwesEligible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        institution: institutionId,
        division: divisionId,
        name,
        code,
        hod_name: hodName,
        hod_email: hodEmail,
        siwes_eligible: siwesEligible,
      });
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Academic Department (Tier 3)</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Department Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Department of Cyber Security Science"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Department Code / Acronym</label>
            <input
              type="text"
              placeholder="e.g. CSS / SWE / MEE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Head of Department (HOD)</label>
              <input
                type="text"
                placeholder="e.g. Dr. Aminu Ibrahim"
                value={hodName}
                onChange={(e) => setHodName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>HOD Email</label>
              <input
                type="email"
                placeholder="e.g. hod.css@univ.edu.ng"
                value={hodEmail}
                onChange={(e) => setHodEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={siwesEligible}
                onChange={(e) => setSiwesEligible(e.target.checked)}
              />
              <span>Students in this department participate in SIWES / ITF Industrial Attachments</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
