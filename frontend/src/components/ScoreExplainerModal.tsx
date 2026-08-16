import { useState, type FC } from 'react';

interface ScoreExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const ScoreExplainerModal: FC<ScoreExplainerModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
}) => {
  const [milestonesCompleted, setMilestonesCompleted] = useState<number>(3);
  const [hasDiagnostic, setHasDiagnostic] = useState<boolean>(true);
  const [hasCapstoneProof, setHasCapstoneProof] = useState<boolean>(true);
  const [counsellorEndorsed, setCounsellorEndorsed] = useState<boolean>(true);

  if (!isOpen) return null;

  // Calculate dynamic explainable score
  const diagnosticScore = hasDiagnostic ? 20 : 0;
  const milestoneScore = Math.round((milestonesCompleted / 4) * 45);
  const capstoneScore = hasCapstoneProof ? 20 : 0;
  const counsellorScore = counsellorEndorsed ? 15 : 0;
  const totalScore = diagnosticScore + milestoneScore + capstoneScore + counsellorScore;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-text">
            <span className="modal-badge">Evidence & Scoring Architecture</span>
            <h3>How the Employability Score Works</h3>
            <p>Every point is calculated from auditable evidence — never self-reported claims.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Interactive Calculator Section */}
          <div className="calc-showcase-grid">
            <div className="calc-controls-col">
              <h4 className="calc-heading">Interactive Evidence Simulator</h4>

              {/* Control 1 */}
              <div className="calc-control-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={hasDiagnostic}
                    onChange={(e) => setHasDiagnostic(e.target.checked)}
                  />
                  <span>
                    <strong>Vocational & Skills Diagnostic</strong> (20 pts)
                    <small>Holland RIASEC & Aptitude calibration</small>
                  </span>
                </label>
              </div>

              {/* Control 2 */}
              <div className="calc-control-group">
                <div className="slider-label-row">
                  <span>
                    <strong>Faculty-Signed Milestones</strong> (Up to 45 pts)
                    <small>Signed by named department evaluators</small>
                  </span>
                  <span className="slider-val">{milestonesCompleted} / 4 Signed</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={milestonesCompleted}
                  onChange={(e) => setMilestonesCompleted(parseInt(e.target.value, 10))}
                  className="calc-range"
                />
              </div>

              {/* Control 3 */}
              <div className="calc-control-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={hasCapstoneProof}
                    onChange={(e) => setHasCapstoneProof(e.target.checked)}
                  />
                  <span>
                    <strong>Practical Capstone & Lab Artifact</strong> (20 pts)
                    <small>Code repo, technical design, or lab portfolio</small>
                  </span>
                </label>
              </div>

              {/* Control 4 */}
              <div className="calc-control-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={counsellorEndorsed}
                    onChange={(e) => setCounsellorEndorsed(e.target.checked)}
                  />
                  <span>
                    <strong>Counsellor Readiness Endorsement</strong> (15 pts)
                    <small>Professional communication & interview audit</small>
                  </span>
                </label>
              </div>
            </div>

            {/* Score Output & Explainability Breakdown */}
            <div className="calc-result-col">
              <div className="score-meter-card">
                <span className="meter-eyebrow">Calculated Index</span>
                <div className="meter-number-row">
                  <span className="meter-val">{totalScore}</span>
                  <span className="meter-max">/ 100</span>
                </div>

                <div className="meter-breakdown-list">
                  <div className="breakdown-row">
                    <span>Diagnostic Baseline</span>
                    <strong>+{diagnosticScore} pts</strong>
                  </div>
                  <div className="breakdown-row">
                    <span>Faculty Milestone Sign-offs</span>
                    <strong>+{milestoneScore} pts</strong>
                  </div>
                  <div className="breakdown-row">
                    <span>Practical Artifact Proof</span>
                    <strong>+{capstoneScore} pts</strong>
                  </div>
                  <div className="breakdown-row">
                    <span>Counsellor Endorsement</span>
                    <strong>+{counsellorScore} pts</strong>
                  </div>
                </div>

                <div className="meter-verdict-box">
                  <span className="verdict-label">Employer Verifiability:</span>
                  <p className="verdict-text">
                    {totalScore >= 80
                      ? '✓ Fully Auditable — Shortlist Ready for Tier-1 Employers & SIWES Direct Dispatch'
                      : totalScore >= 50
                      ? '⏳ Pathway In Progress — 2 Core Technical Milestones Outstanding'
                      : '⚠️ Baseline Stage — Diagnostic calibration required'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
          >
            Book a Walkthrough for Your Institution →
          </button>
        </div>
      </div>
    </div>
  );
};
