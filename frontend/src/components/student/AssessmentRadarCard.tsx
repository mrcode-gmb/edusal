import type { FC } from 'react';
import type { StudentAssessmentSession } from '../../types/institution';
import {
  SparklesIcon,
  BrainIcon,
  CheckCircleIcon,
  CompassIcon,
  BarChartIcon,
} from '../icons';

interface AssessmentRadarCardProps {
  session: StudentAssessmentSession;
}

export const AssessmentRadarCard: FC<AssessmentRadarCardProps> = ({ session }) => {
  const isBigFive = session.assessment_type === 'BIG_FIVE';
  const isHolland = session.assessment_type === 'HOLLAND_RIASEC';
  const isNumerical = session.assessment_type === 'NUMERICAL_REASONING';

  return (
    <div className="assessment-radar-card">
      <div className="radar-card-header">
        <div className="radar-header-left">
          <div className="radar-icon-box">
            {isBigFive && <BrainIcon size={18} color="#0284c7" />}
            {isHolland && <CompassIcon size={18} color="#059669" />}
            {isNumerical && <BarChartIcon size={18} color="#7c3aed" />}
          </div>
          <div>
            <span className="radar-type-tag">{session.assessment_type_display}</span>
            <h4 className="radar-title">{session.assessment_title}</h4>
          </div>
        </div>

        <div className="radar-header-right">
          {session.summary_code && (
            <div className="radar-code-pill">
              {isHolland && <span>Holland Code: <strong>{session.summary_code}</strong></span>}
              {isBigFive && <span>Profile: <strong>{session.summary_code}</strong></span>}
              {isNumerical && <span>Accuracy: <strong>{session.summary_code}</strong></span>}
            </div>
          )}
          {session.percentile_rank !== null && (
            <span className="radar-percentile-badge">
              <SparklesIcon size={12} /> {session.percentile_rank}% Percentile
            </span>
          )}
        </div>
      </div>

      {/* Trait Bars / Dimension Breakdown */}
      <div className="radar-traits-container">
        {Object.entries(session.dimension_scores).map(([trait, score]) => {
          const numScore = typeof score === 'number' ? score : Number(score) || 0;
          return (
            <div key={trait} className="radar-trait-row">
              <div className="trait-meta">
                <span className="trait-name">{trait.replace(/_/g, ' ')}</span>
                <strong className="trait-score-val">{numScore}%</strong>
              </div>
              <div className="trait-bar-track">
                <div
                  className={`trait-bar-fill ${
                    isHolland ? 'holland-fill' : isNumerical ? 'num-fill' : 'ocean-fill'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, numScore))}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Narrative Summary & Career Recommendations */}
      {session.summary_report && (
        <div className="radar-report-box">
          <div className="radar-report-content">
            {session.summary_report.split('\n\n').map((para, idx) => (
              <p key={idx} className="radar-para">{para}</p>
            ))}
          </div>
        </div>
      )}

      {session.career_recommendations && session.career_recommendations.length > 0 && (
        <div className="radar-recs-strip">
          <span className="recs-label">Top Matched Pathways:</span>
          <div className="recs-pills-list">
            {session.career_recommendations.map((rec, idx) => (
              <span key={idx} className="rec-pill">
                <CheckCircleIcon size={12} color="#059669" />
                {rec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
