import { useState, type FC } from 'react';

export const OutcomesFraming: FC = () => {
  const [selectedColumn, setSelectedColumn] = useState<number>(0);

  const pillars = [
    {
      title: 'Every placement',
      mechanism: 'Traced to a specific SIWES cycle or graduate role, not a self-reported check-box.',
      badge: 'Placement Verifiability',
      icon: '🏢',
      proofDetails: {
        title: 'Verifiable Placement Audit',
        exampleTitle: 'SIWES 2026 Batch #04 Verification',
        items: [
          { label: 'Cycle Registry', value: 'National SIWES / ITF Calendar 2026' },
          { label: 'Employer Attestation', value: 'Direct verification by partner HR manager' },
          { label: 'Work Log Sign-Off', value: 'Bi-weekly supervisor check-ins with geolocation' },
          { label: 'No Self-Reported Checkboxes', value: '100% verified through institutional workflow' },
        ],
      },
    },
    {
      title: 'Every skill',
      mechanism: 'Validated against a milestone with a named evaluator, not a resume claim.',
      badge: 'Skills Authenticity',
      icon: '🎯',
      proofDetails: {
        title: 'Evaluator-Backed Skill Ledger',
        exampleTitle: 'Milestone Signature Certificate',
        items: [
          { label: 'Named Evaluator', value: 'Faculty Supervisor or Industry Assessor' },
          { label: 'Assessment Artifact', value: 'Lab code repo, design portfolio, or capstone report' },
          { label: 'Rubric Criteria', value: 'Pre-mapped to departmental competencies' },
          { label: 'Immutable Audit Trail', value: 'Timestamped signature stored on student ledger' },
        ],
      },
    },
    {
      title: 'Every AI answer',
      mechanism: 'Cited to a specific institutional document, not generated from open-web guesswork.',
      badge: 'Institution Grounded AI',
      icon: '🛡️',
      proofDetails: {
        title: 'Document-Grounded RAG Engine',
        exampleTitle: 'Zero Hallucination Retrieval',
        items: [
          { label: 'Corpus Boundary', value: 'Student handbooks, faculty briefs & approved calendars' },
          { label: 'Citation Requirement', value: 'Every statement references an exact page & paragraph' },
          { label: 'Safety Cutoff', value: 'Automatic escalation to human counsellor on judgment calls' },
          { label: 'Isolated Workspace', value: 'Strict data segregation per institution' },
        ],
      },
    },
  ];

  return (
    <section className="outcomes-section">
      <div className="container-custom">
        <div className="section-header-centered">
          <span className="section-eyebrow">Institutional Governance & Integrity</span>
          <h2 className="section-title">
            Built to report outcomes your board can actually verify
          </h2>
          <p className="section-lead">
            No synthetic metrics or unprovable percentages. Every data point on Edusal is backed by an auditable chain of evidence.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="outcomes-grid">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`outcome-card ${selectedColumn === idx ? 'active' : ''}`}
              onClick={() => setSelectedColumn(idx)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedColumn(idx); }}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${pillar.title}`}
            >
              <div className="outcome-icon-wrapper">{pillar.icon}</div>
              <div className="outcome-badge">{pillar.badge}</div>
              <h3 className="outcome-card-title">{pillar.title}</h3>
              <p className="outcome-card-mechanism">{pillar.mechanism}</p>

              <div className="outcome-inspect-hint">
                <span>{selectedColumn === idx ? 'Currently Viewing Evidence Model' : 'Click to inspect proof mechanism →'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Proof Mechanism Preview */}
        <div className="proof-mechanism-detail-card">
          <div className="detail-header">
            <div className="detail-title-group">
              <span className="detail-tag">Proof Architecture</span>
              <h4>{pillars[selectedColumn].proofDetails.title}</h4>
            </div>
            <div className="detail-meta-pill">
              <span>{pillars[selectedColumn].proofDetails.exampleTitle}</span>
            </div>
          </div>

          <div className="detail-grid">
            {pillars[selectedColumn].proofDetails.items.map((item, i) => (
              <div key={i} className="detail-item">
                <span className="detail-item-label">{item.label}</span>
                <span className="detail-item-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
