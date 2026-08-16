import { useState, type FC } from 'react';

export const CoreCapabilities: FC = () => {
  const [activePillar, setActivePillar] = useState<number>(0);

  const capabilities = [
    {
      id: 'pathways',
      tag: 'Curriculum & Pathway Engine',
      title: 'Pathways, mapped to what your graduates actually do',
      lead: 'Every student follows a pathway built from real outcomes for their department — not a generic career-readiness checklist.',
      points: [
        {
          heading: 'Holland, Big Five & Skills Diagnostics',
          desc: 'Objective baseline assessments that calibrate personality, vocational interests, and technical aptitudes.',
        },
        {
          heading: 'Department-Aligned Pathway Templates',
          desc: 'Co-designed directly with your faculties and departmental curriculum leaders.',
        },
        {
          heading: 'Named Evaluator Sign-Offs',
          desc: 'Every key milestone is authenticated by an assigned faculty supervisor, counsellor, or industry assessor.',
        },
      ],
      preview: {
        type: 'pathway',
        badge: 'Department of Electrical & Computer Engineering',
        track: 'Cloud & Embedded Systems Pathway (Level 300–500)',
        milestones: [
          { name: 'Diagnostic: Holland RIASEC & Technical Aptitude', status: 'Completed (Rank 1)', by: 'Automated Diagnostic Engine' },
          { name: 'Microcontroller Architecture & C++ Firmware', status: 'Approved & Signed', by: 'Prof. O. Balogun (Faculty Head)' },
          { name: 'IoT Edge Computing Gateway Project', status: 'Under Peer Review', by: 'Engr. N. Danjuma (Industry Mentor)' },
        ],
      },
    },
    {
      id: 'counselling',
      tag: 'Grounded Guidance System',
      title: 'Counselling that scales without losing the human',
      lead: 'An AI assistant answers routine questions from your institution\'s own documents — and knows exactly when to step aside.',
      points: [
        {
          heading: 'Grounded on Your Official Documents',
          desc: 'Trained strictly on your student handbooks, SIWES calendars, and employer briefs — never on open-web hallucinations.',
        },
        {
          heading: 'Explicit Document Citations',
          desc: 'Every AI response quotes its precise page and section source. Nothing is asserted without evidence.',
        },
        {
          heading: 'Automatic Human Counsellor Escalation',
          desc: 'The instant a student requires human judgment, mental health advice, or timing exceptions, it seamlessly hands off.',
        },
      ],
      preview: {
        type: 'counselling',
        badge: 'Institutional Career Guidance Queue',
        track: 'Real-time Case Triage & Document Retrieval',
        milestones: [
          { name: 'Student Query: "SIWES Allowance & Logbook submission"', status: 'Answered via Handbook', by: 'Citing FUTA_SIWES_2026.pdf § 3.1' },
          { name: 'Exception: Late Internship Registration Request', status: 'Escalated to Human', by: 'Assigned to Mrs. K. Adeleke (Senior Counsellor)' },
          { name: 'Status: Student session booked for Thursday 2:00 PM', status: 'Confirmed', by: 'Calendar Synced with Room 204' },
        ],
      },
    },
    {
      id: 'employer-pipeline',
      tag: 'Verified Employer Match',
      title: 'An employer pipeline built on proof, not PDFs',
      lead: 'Employers shortlist from skill profiles backed by evidence, with full visibility into what they\'re getting.',
      points: [
        {
          heading: 'End-to-End SIWES & NYSC Placement Tracking',
          desc: 'Complete transparency from initial matching and institutional recommendation to completion attestations.',
        },
        {
          heading: 'Explainable Match Scoring',
          desc: 'Match percentages show explicit reasoning — department alignment, completed milestones, and verified skill rubrics.',
        },
        {
          heading: 'Upfront Compensation & Logistics Details',
          desc: 'Stipends, location, transport, and housing subsidies are fully declared before students apply.',
        },
      ],
      preview: {
        type: 'employer',
        badge: 'Enterprise Talent Verification Portal',
        track: 'Verified Candidate Match Stream',
        milestones: [
          { name: 'Match Reasoning: 94% Dept Alignment + 2 Verified Artifacts', status: 'Shortlisted', by: 'Andela Talent Lead' },
          { name: 'Offer Terms: ₦150,000/mo + Hybrid Laptop Stipend', status: 'Disclosed Upfront', by: 'Standardized Internship Agreement' },
          { name: 'Placement Attestation: Direct Institutional Endorsement', status: 'Ready for Dispatch', by: 'Dean of Student Affairs' },
        ],
      },
    },
  ];

  return (
    <section id="capabilities" className="capabilities-section">
      <div className="container-custom">
        <div className="section-header-centered">
          <span className="section-eyebrow">Integrated Operating System</span>
          <h2 className="section-title">
            One student record. Three teams working from it.
          </h2>
          <p className="section-lead">
            Unifying students, faculty counsellors, and hiring employers on a single verifiable ledger.
          </p>
        </div>

        {/* Capability Tabs Navigation */}
        <div className="capabilities-tab-bar">
          {capabilities.map((cap, idx) => (
            <button
              key={cap.id}
              type="button"
              className={`cap-tab-btn ${activePillar === idx ? 'active' : ''}`}
              onClick={() => setActivePillar(idx)}
            >
              <span className="cap-tab-num">0{idx + 1}</span>
              <span className="cap-tab-title">{cap.tag}</span>
            </button>
          ))}
        </div>

        {/* Active Capability Display */}
        <div className="capability-showcase-grid">
          {/* Left Column: Details & Bullets */}
          <div className="cap-details-col">
            <span className="cap-badge">{capabilities[activePillar].tag}</span>
            <h3 className="cap-headline">{capabilities[activePillar].title}</h3>
            <p className="cap-lead">{capabilities[activePillar].lead}</p>

            <div className="cap-points-list">
              {capabilities[activePillar].points.map((point, i) => (
                <div key={i} className="cap-point-item">
                  <div className="point-icon-box">
                    <span className="point-num">{i + 1}</span>
                  </div>
                  <div className="point-body">
                    <h4 className="point-heading">{point.heading}</h4>
                    <p className="point-desc">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: High-Fidelity UI Simulator */}
          <div className="cap-preview-col">
            <div className="cap-preview-card">
              <div className="preview-card-header">
                <div className="preview-indicator">
                  <span className="dot dot-blue"></span>
                  <span className="preview-label">Live System Component</span>
                </div>
                <span className="preview-badge">{capabilities[activePillar].preview.badge}</span>
              </div>

              <div className="preview-card-body">
                <div className="preview-track-title">
                  <h5>{capabilities[activePillar].preview.track}</h5>
                </div>

                <div className="preview-milestones-list">
                  {capabilities[activePillar].preview.milestones.map((m, idx) => (
                    <div key={idx} className="preview-milestone-item">
                      <div className="m-status-col">
                        <span className="m-badge-pill">{m.status}</span>
                      </div>
                      <div className="m-content-col">
                        <h6>{m.name}</h6>
                        <span className="m-actor">{m.by}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="preview-card-footer">
                  <div className="footer-meta-item">
                    <span className="meta-icon">🔒</span>
                    <span>Audit Logged & Tamper-Evident</span>
                  </div>
                  <span className="meta-state">Real-time sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
