import { useState, type FC, type FormEvent } from 'react';
import type { InstitutionHierarchyTree, AcademicSession } from '../../types/institution';
import { GraduationCapIcon } from '../icons';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <GraduationCapIcon size={20} color="#0284c7" />
            <div>
              <h3>Register Student into Program</h3>
              <p>Anchored hierarchically to degree programme, department, and faculty</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amina Bello"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Official Institutional Email *</label>
              <input
                type="email"
                required
                placeholder="e.g. a.bello@student.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Matriculation Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 2021/1/74892SWE"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>JAMB Registration No.</label>
              <input
                type="text"
                placeholder="e.g. 202140192849EF"
                value={jambRegNumber}
                onChange={(e) => setJambRegNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Academic Programme (Tier 4) *</label>
            <select
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
                <option key={prog.id} value={prog.id}>
                  {prog.name} — {prog.departmentName} ({prog.durationYears} Years Duration)
                </option>
              ))}
            </select>
            <span className="form-hint">
              Program duration ({maxYears} years) automatically dictates student level progression & SIWES windows.
            </span>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Entry Session *</label>
              <select
                value={selectedSessionId || (sessions[0]?.id ?? '')}
                onChange={(e) => setSelectedSessionId(e.target.value)}
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.session_label} {s.is_current ? '(Current Session)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Entry Mode</label>
              <select
                value={entryMode}
                onChange={(e) => {
                  setEntryMode(e.target.value);
                  if (e.target.value === 'DIRECT_ENTRY' && yearOfStudy === 1) {
                    setYearOfStudy(2);
                  }
                }}
              >
                <option value="UTME">UTME (Standard Entry — Year 1)</option>
                <option value="DIRECT_ENTRY">Direct Entry (DE — Year 2)</option>
                <option value="TRANSFER">Inter-Faculty / University Transfer</option>
                <option value="CONVERSION">HND to B.Sc. Conversion</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Current Year of Study ({yearOfStudy} of {maxYears})</label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
              >
                {Array.from({ length: maxYears }, (_, i) => i + 1).map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr} — {yr * 100} Level {yr === maxYears ? '(Final Year)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Current CGPA (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0.00"
                max="5.00"
                placeholder="e.g. 4.35"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone / WhatsApp Number</label>
            <input
              type="tel"
              placeholder="e.g. +234 803 000 0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registering Student...' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
