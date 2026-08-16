import { useState, type FC, type FormEvent } from 'react';
import type { BookingFormData, InstitutionType } from '../types';
import {
  BuildingIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  LockIcon,
} from './icons';

export const WalkthroughBooking: FC = () => {
  const [formData, setFormData] = useState<BookingFormData>({
    institutionName: '',
    institutionType: 'University (Federal/State)',
    fullName: '',
    workEmail: '',
    phoneNumber: '',
    role: '',
    estimatedStudents: '5,000 – 15,000',
    primaryGoal: 'Establish explainable employability tracking & SIWES oversight',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const institutionTypes: InstitutionType[] = [
    'University (Federal/State)',
    'Private University',
    'Polytechnic (NBTE)',
    'College of Education (NCCE)',
    'Other Tertiary Institution',
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission / API payload dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <section id="booking-section" className="booking-section">
      <div className="container-custom">
        <div className="booking-grid">
          {/* Left Column: Scope & Value Proposition */}
          <div className="booking-info-col">
            <span className="booking-eyebrow">Institutional Onboarding</span>
            <h2 className="booking-title">Bring your institution onto Edusal Consult</h2>
            <p className="booking-lead">
              Book a scoped walkthrough. We will map your faculties, counsellor roster, and reporting needs before you sign anything.
            </p>

            <div className="walkthrough-steps">
              <div className="w-step">
                <span className="w-num">01</span>
                <div>
                  <h4>Faculty & Department Mapping</h4>
                  <p>We review your existing degree programs and calibrate customized milestone pathway templates.</p>
                </div>
              </div>

              <div className="w-step">
                <span className="w-num">02</span>
                <div>
                  <h4>Document Grounding Ingestion</h4>
                  <p>Your official student handbooks and SIWES guidelines are securely ingested into an isolated institutional instance.</p>
                </div>
              </div>

              <div className="w-step">
                <span className="w-num">03</span>
                <div>
                  <h4>Pilot Cohort Launch in 2–4 Weeks</h4>
                  <p>Deploy to a pilot department or full graduating class with dedicated technical support.</p>
                </div>
              </div>
            </div>

            {/* Trust Strip */}
            <div className="booking-trust-strip">
              <div className="trust-item">
                <span className="trust-flag">
                  <BuildingIcon size={20} color="#059669" />
                </span>
                <div>
                  <strong>Hosted In-Region</strong>
                  <p>Data residency roadmap tailored for Nigeria</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-shield">
                  <ShieldCheckIcon size={20} color="#0284c7" />
                </span>
                <div>
                  <strong>NDPR-Aligned Data Handling</strong>
                  <p>Comprehensive privacy and compliance program in progress</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-bolt">
                  <SparklesIcon size={20} color="#0052cc" />
                </span>
                <div>
                  <strong>2–4 Week Onboarding</strong>
                  <p>Expedited provisioning for founding partner institutions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Booking Form */}
          <div className="booking-form-col">
            <div className="booking-form-card">
              {isSubmitted ? (
                <div className="booking-success-state">
                  <div className="success-icon-badge">
                    <CheckCircleIcon size={32} color="#059669" />
                  </div>
                  <h3>Walkthrough Request Received</h3>
                  <p>
                    Thank you, <strong>{formData.fullName}</strong>. Our institutional implementation team will contact you at <strong>{formData.workEmail}</strong> within 24 hours to coordinate the session with <strong>{formData.institutionName}</strong> leadership.
                  </p>
                  <div className="success-meta-box">
                    <span>Target Session: Scoped 45-Minute Faculty & Architecture Overview</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        institutionName: '',
                        institutionType: 'University (Federal/State)',
                        fullName: '',
                        workEmail: '',
                        phoneNumber: '',
                        role: '',
                        estimatedStudents: '5,000 – 15,000',
                        primaryGoal: 'Establish explainable employability tracking & SIWES oversight',
                        notes: '',
                      });
                    }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="walkthrough-form">
                  <div className="form-header">
                    <h3>Request a Scoped Walkthrough</h3>
                    <p>No commitments. See how Edusal fits your institution's specific workflow.</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="instName">Institution Name *</label>
                    <input
                      id="instName"
                      type="text"
                      required
                      placeholder="e.g. Federal University of Technology, Minna"
                      value={formData.institutionName}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="instType">Institution Type *</label>
                      <select
                        id="instType"
                        value={formData.institutionType}
                        onChange={(e) => setFormData({ ...formData, institutionType: e.target.value as InstitutionType })}
                      >
                        {institutionTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group half">
                      <label htmlFor="estStudents">Student Population</label>
                      <select
                        id="estStudents"
                        value={formData.estimatedStudents}
                        onChange={(e) => setFormData({ ...formData, estimatedStudents: e.target.value })}
                      >
                        <option value="Under 5,000">Under 5,000 students</option>
                        <option value="5,000 – 15,000">5,000 – 15,000 students</option>
                        <option value="15,000 – 35,000">15,000 – 35,000 students</option>
                        <option value="35,000+">35,000+ students</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="fullName">Your Full Name *</label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        placeholder="e.g. Dr. Amina Bello"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="form-group half">
                      <label htmlFor="roleTitle">Your Role / Title *</label>
                      <input
                        id="roleTitle"
                        type="text"
                        required
                        placeholder="e.g. Dean of Student Affairs / Director"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="workEmail">Official Work Email *</label>
                      <input
                        id="workEmail"
                        type="email"
                        required
                        placeholder="e.g. a.bello@institution.edu.ng"
                        value={formData.workEmail}
                        onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                      />
                    </div>

                    <div className="form-group half">
                      <label htmlFor="phoneNumber">Phone / WhatsApp</label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        placeholder="e.g. +234 803 000 0000"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Key Departmental Focus or Specific Requirements</label>
                    <textarea
                      id="notes"
                      rows={2}
                      placeholder="e.g. We want to pilot with our Faculty of Engineering 300L SIWES cohort..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-submit w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Scheduling Walkthrough...' : 'Book a Scoped Walkthrough →'}
                  </button>

                  <p className="form-disclaimer">
                    <LockIcon size={13} /> Confidential. Information will only be used to tailor your walkthrough session.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
