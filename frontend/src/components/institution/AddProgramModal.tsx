import { useState, type FC, type FormEvent } from 'react';

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
  }) => Promise<void>;
}

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
  const [siwesDuration, setSiwesDuration] = useState(6);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        institution: institutionId,
        department: departmentId,
        name,
        program_code: programCode,
        award_level: awardLevel,
        duration_years: Number(durationYears),
        siwes_duration_months: Number(siwesDuration),
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
          <h3>Add Academic Degree Programme (Tier 4)</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Programme / Degree Option Name</label>
            <input
              type="text"
              required
              placeholder="e.g. B.Tech Cyber Security Science / ND Statistics"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Programme Code</label>
              <input
                type="text"
                placeholder="e.g. CSS-BTECH / ND-CS"
                value={programCode}
                onChange={(e) => setProgramCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-group">
              <label>Award Level</label>
              <select
                value={awardLevel}
                onChange={(e) => setAwardLevel(e.target.value)}
              >
                <option value="BSC">B.Sc. (Bachelor of Science)</option>
                <option value="BTECH">B.Tech. (Bachelor of Technology)</option>
                <option value="BENG">B.Eng. (Bachelor of Engineering)</option>
                <option value="BA">B.A. (Bachelor of Arts)</option>
                <option value="LLB">LL.B. (Bachelor of Laws)</option>
                <option value="ND">National Diploma (ND)</option>
                <option value="HND">Higher National Diploma (HND)</option>
                <option value="NCE">NCE (Nigeria Certificate in Education)</option>
                <option value="PGD">Postgraduate Diploma (PGD)</option>
                <option value="MSC">M.Sc. (Master of Science)</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Programme Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="7"
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>SIWES Period (Months)</label>
              <input
                type="number"
                min="0"
                max="24"
                value={siwesDuration}
                onChange={(e) => setSiwesDuration(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Programme Option'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
