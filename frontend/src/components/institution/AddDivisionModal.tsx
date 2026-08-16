import { useState, type FC, type FormEvent } from 'react';
import type { TierTwoTerm } from '../../types/institution';

interface AddDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  tierTwoTerm: TierTwoTerm;
  onSubmit: (data: {
    institution: string;
    name: string;
    code: string;
    division_type: 'FACULTY' | 'SCHOOL' | 'COLLEGE';
    dean_name?: string;
    dean_email?: string;
  }) => Promise<void>;
}

export const AddDivisionModal: FC<AddDivisionModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  tierTwoTerm,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [deanName, setDeanName] = useState('');
  const [deanEmail, setDeanEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const defaultDivisionType =
    tierTwoTerm === 'SCHOOL' ? 'SCHOOL' : tierTwoTerm === 'COLLEGE' ? 'COLLEGE' : 'FACULTY';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        institution: institutionId,
        name,
        code,
        division_type: defaultDivisionType,
        dean_name: deanName,
        dean_email: deanEmail,
      });
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = tierTwoTerm === 'SCHOOL' ? 'School' : tierTwoTerm === 'COLLEGE' ? 'College' : 'Faculty';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Academic Division (Tier 2: {label})</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>{label} Name</label>
            <input
              type="text"
              required
              placeholder={`e.g. ${label} of Physical Sciences`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{label} Acronym / Code</label>
            <input
              type="text"
              placeholder="e.g. FPS / SICT / SEET"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Dean Full Name</label>
              <input
                type="text"
                placeholder="e.g. Prof. J. O. Adebayo"
                value={deanName}
                onChange={(e) => setDeanName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Dean Official Email</label>
              <input
                type="email"
                placeholder="e.g. dean.science@univ.edu.ng"
                value={deanEmail}
                onChange={(e) => setDeanEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : `Create ${label}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
