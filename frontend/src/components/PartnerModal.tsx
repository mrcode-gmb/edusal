import { useState, type FC, type FormEvent } from 'react';
import type { InstitutionType } from '../types';
import { CheckCircleIcon, CheckIcon } from './icons';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerModal: FC<PartnerModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [instName, setInstName] = useState('');
  const [instType, setInstType] = useState<InstitutionType>('University (Federal/State)');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pilotFaculty, setPilotFaculty] = useState('Faculty of Engineering / School of Technology');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-text">
            <span className="modal-badge">Founding Partner Program</span>
            <h3>Join the Founding Partner Cohort</h3>
            <p>Shape pathway templates and lock in preferential charter terms for your institution.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {submitted ? (
            <div className="partner-success-view">
              <div className="success-icon-badge">
                <CheckCircleIcon size={32} color="#059669" />
              </div>
              <h3>Application Submitted</h3>
              <p>
                Thank you, <strong>{contactName}</strong>. We have received the Founding Partner application for <strong>{instName}</strong>. Our director of institutional partnerships will reach out via <strong>{email}</strong> to schedule an onboarding consultation.
              </p>
              <div className="partner-perks-box">
                <h4>Founding Partner Inclusions:</h4>
                <ul>
                  <li>
                    <CheckIcon size={14} color="#059669" /> Co-design customized pathway templates for your faculties
                  </li>
                  <li>
                    <CheckIcon size={14} color="#059669" /> Dedicated technical onboarding & handbook grounding ingest
                  </li>
                  <li>
                    <CheckIcon size={14} color="#059669" /> Preferred founding tier pricing locked for 3 academic sessions
                  </li>
                </ul>
              </div>
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="partner-form">
              <div className="form-group">
                <label htmlFor="pInstName">Institution Name *</label>
                <input
                  id="pInstName"
                  type="text"
                  required
                  placeholder="e.g. University of Lagos / Yaba College of Technology"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="pInstType">Institution Type *</label>
                  <select
                    id="pInstType"
                    value={instType}
                    onChange={(e) => setInstType(e.target.value as InstitutionType)}
                  >
                    <option value="University (Federal/State)">University (Federal/State)</option>
                    <option value="Private University">Private University</option>
                    <option value="Polytechnic (NBTE)">Polytechnic (NBTE)</option>
                    <option value="College of Education (NCCE)">College of Education (NCCE)</option>
                    <option value="Other Tertiary Institution">Other Tertiary Institution</option>
                  </select>
                </div>

                <div className="form-group half">
                  <label htmlFor="pPilotFaculty">Target Pilot Faculty *</label>
                  <input
                    id="pPilotFaculty"
                    type="text"
                    required
                    placeholder="e.g. School of ICT / Engineering"
                    value={pilotFaculty}
                    onChange={(e) => setPilotFaculty(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="pContactName">Contact Name & Title *</label>
                  <input
                    id="pContactName"
                    type="text"
                    required
                    placeholder="e.g. Prof. I. Adekunle, DVC Academics"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="form-group half">
                  <label htmlFor="pEmail">Official Email *</label>
                  <input
                    id="pEmail"
                    type="email"
                    required
                    placeholder="e.g. i.adekunle@unilag.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="pPhone">Phone / WhatsApp *</label>
                <input
                  id="pPhone"
                  type="tel"
                  required
                  placeholder="e.g. +234 802 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-submit w-full">
                Apply for Founding Partner Cohort →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
