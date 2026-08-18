import { useState, type FC } from 'react';
import {
  LockIcon,
  ClockIcon,
  FileTextIcon,
  CheckIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  BuildingIcon,
} from './icons';

interface HeroProps {
  onOpenBooking: () => void;
  onOpenScoreModal: () => void;
  onOpenStudentPortal?: () => void;
  onOpenInstitutionPortal?: () => void;
}

export const Hero: FC<HeroProps> = ({ 
  onOpenBooking, 
  onOpenScoreModal,
  onOpenStudentPortal,
  onOpenInstitutionPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'citation' | 'pipeline'>('record');

  return (
    <section className="hero-section">
      <div className="container-hero">
        <div className="hero-grid">
          {/* Left Column: Copy & CTAs */}
          <div className="hero-content">
            <div className="hero-badge-row">
              <span className="eyebrow-pill">Nexus Edutech Consult Ltd</span>
              <span className="badge-sub">For Nigerian Universities, Polytechnics & Colleges</span>
            </div>

            <h1 className="hero-headline">
              Institutional Career Governance.{' '}
              <span className="text-gradient">Every Skill Claim Verified.</span>
            </h1>

            <p className="hero-subheadline">
              Nexus Edutech Consult Ltd gives Nigerian universities, polytechnics, and colleges of education a career services operating system where every employability claim is backed by evidence — not a resume line, not a guess.
            </p>

            <div className="hero-cta-group">
              {onOpenStudentPortal && (
                <button
                  type="button"
                  className="btn btn-primary-lg"
                  onClick={onOpenStudentPortal}
                >
                  <GraduationCapIcon size={18} />
                  Student Portal Login
                  <ArrowRightIcon size={16} />
                </button>
              )}

              {onOpenInstitutionPortal && (
                <button
                  type="button"
                  className="btn btn-secondary-lg"
                  onClick={onOpenInstitutionPortal}
                >
                  <BuildingIcon size={17} />
                  Faculty & Admin Portal
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline-sm-hero"
                onClick={onOpenBooking}
              >
                Book Walkthrough
              </button>

              <button
                type="button"
                className="btn btn-outline-sm-hero"
                onClick={onOpenScoreModal}
              >
                <SparklesIcon size={14} />
                Score Explainer
              </button>
            </div>

            <div className="hero-guarantee-strip">
              <div className="guarantee-item">
                <CheckCircleIcon size={15} color="#059669" />
                <span>Grounded on your handbooks & SIWES calendars</span>
              </div>
              <div className="guarantee-item">
                <CheckCircleIcon size={15} color="#059669" />
                <span>Named evaluator sign-offs, zero guesswork</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Interactive Verified Record Mockup */}
          <div className="hero-visual">
            <div className="record-mockup-card">
              {/* Card Header Bar */}
              <div className="mockup-header">
                <div className="mockup-window-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="mockup-id-badge">
                  <LockIcon size={12} />
                  <span>VERIFIED RECORD #FUTM-2024-3891</span>
                </div>
                <div className="mockup-nav-tabs">
                  <button
                    type="button"
                    className={`tab-pill ${activeTab === 'record' ? 'active' : ''}`}
                    onClick={() => setActiveTab('record')}
                  >
                    Evidence
                  </button>
                  <button
                    type="button"
                    className={`tab-pill ${activeTab === 'citation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('citation')}
                  >
                    Audit Chain
                  </button>
                  <button
                    type="button"
                    className={`tab-pill ${activeTab === 'pipeline' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pipeline')}
                  >
                    SIWES Fit
                  </button>
                </div>
              </div>

              {/* Student Identification Strip */}
              <div className="mockup-student-bar">
                <div className="student-avatar">CO</div>
                <div className="student-info">
                  <div className="student-name-row">
                    <h3>Chidinma Okafor</h3>
                    <span className="verified-tag">
                      <CheckIcon size={12} /> Verified Student
                    </span>
                  </div>
                  <p className="student-meta">
                    300L Software Engineering · School of Information & Comm. Tech (FUTMinna)
                  </p>
                </div>
                <div className="score-summary-pill">
                  <span className="score-num">87</span>
                  <span className="score-label">/ 100 Score</span>
                </div>
              </div>

              {/* Card Dynamic Body */}
              <div className="mockup-body">
                {activeTab === 'record' && (
                  <div className="tab-pane-record">
                    <div className="evidence-list-header">
                      <span className="list-title">Verified Pathway Milestones (Backend Track)</span>
                      <span className="list-status">2 of 3 Completed</span>
                    </div>

                    <div className="evidence-item completed">
                      <div className="item-status-icon">
                        <CheckIcon size={12} />
                      </div>
                      <div className="item-details">
                        <div className="item-title-row">
                          <span className="item-title">Core Python, Data Structures & REST APIs</span>
                          <span className="item-badge-signed">Signed Off</span>
                        </div>
                        <p className="item-meta">
                          Evaluated by: <strong>Dr. A. Adebayo</strong> (Faculty Supervisor, SE Dept)
                        </p>
                        <div className="evidence-proof-pill">
                          <span>Artifact: GitHub Capstone & Lab Assessment (Score: 92%)</span>
                        </div>
                      </div>
                    </div>

                    <div className="evidence-item completed">
                      <div className="item-status-icon">
                        <CheckIcon size={12} />
                      </div>
                      <div className="item-details">
                        <div className="item-title-row">
                          <span className="item-title">PostgreSQL Vector Search & Celery Workers</span>
                          <span className="item-badge-signed">Signed Off</span>
                        </div>
                        <p className="item-meta">
                          Evaluated by: <strong>Engr. K. Bello</strong> (Industry Assessor, Tech Guild)
                        </p>
                        <div className="evidence-proof-pill">
                          <span>Artifact: Verified Deployment on Local Test Bench</span>
                        </div>
                      </div>
                    </div>

                    <div className="evidence-item in-progress">
                      <div className="item-status-icon progress-icon">
                        <ClockIcon size={12} />
                      </div>
                      <div className="item-details">
                        <div className="item-title-row">
                          <span className="item-title">Enterprise Relational DB Performance Tuning</span>
                          <span className="item-badge-progress">80% Complete</span>
                        </div>
                        <p className="item-meta">
                          Pending submission to: <strong>Mr. Adeyemi</strong> (Career Counsellor)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'citation' && (
                  <div className="tab-pane-citation">
                    <div className="citation-header">
                      <span className="citation-icon">
                        <FileTextIcon size={16} />
                      </span>
                      <h4>Institutional Document Citation Trace</h4>
                    </div>
                    <div className="citation-box">
                      <div className="citation-source">
                        <span className="source-label">Source Document:</span>
                        <code>FUTM_SE_SIWES_2025_GUIDELINES.pdf#Section-4.2</code>
                      </div>
                      <p className="citation-text">
                        "Pre-placement requirement: 300-level candidates must have signed endorsements in Relational Databases and Modular System Design prior to institutional referral."
                      </p>
                      <div className="citation-footer">
                        <span>Tamper-evident verification hash: <code>sha256:4f8a...9c2e</code></span>
                      </div>
                    </div>
                    <div className="counsellor-note">
                      <strong>Counsellor Status:</strong> Thread flagged for Mr. Adeyemi to review Interswitch prerequisite waiver.
                    </div>
                  </div>
                )}

                {activeTab === 'pipeline' && (
                  <div className="tab-pane-pipeline">
                    <div className="pipeline-header">
                      <span className="pipeline-title">Pre-Matched SIWES Placement Opportunities</span>
                      <span className="pipeline-window">July 2026 Cycle</span>
                    </div>

                    <div className="match-card high-match">
                      <div className="match-card-header">
                        <div>
                          <h5>Interswitch Group</h5>
                          <span className="match-loc">Victoria Island, Lagos · Backend Engineering Intern</span>
                        </div>
                        <span className="match-score-badge">94% Fit</span>
                      </div>
                      <div className="match-details-grid">
                        <span><strong>Stipend:</strong> ₦120,000/mo</span>
                        <span><strong>Housing:</strong> Assistance provided</span>
                        <span><strong>Status:</strong> Awaiting Final DB Sign-off</span>
                      </div>
                    </div>

                    <div className="match-card high-match">
                      <div className="match-card-header">
                        <div>
                          <h5>Paystack (Stripe)</h5>
                          <span className="match-loc">Ikeja, Lagos · Software Systems Intern</span>
                        </div>
                        <span className="match-score-badge">91% Fit</span>
                      </div>
                      <div className="match-details-grid">
                        <span><strong>Stipend:</strong> ₦140,000/mo</span>
                        <span><strong>Prerequisite:</strong> Direct Match (No DB blocker)</span>
                        <span><strong>Status:</strong> Ready to apply</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Summary */}
              <div className="mockup-footer">
                <div className="footer-status-pill">
                  <span className="pulse-dot"></span>
                  <span>Explainable Audit Trail Active</span>
                </div>
                <button
                  type="button"
                  className="mockup-action-btn"
                  onClick={onOpenScoreModal}
                >
                  Inspect Score Breakdown →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
