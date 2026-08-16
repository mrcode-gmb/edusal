import { type FC } from 'react';
import type { EmployabilitySummary, StudentProfile } from '../../types/institution';
import { ShieldCheckIcon, SparklesIcon } from '../icons';

interface EmployabilityGaugeCardProps {
  summary: EmployabilitySummary;
  profile: StudentProfile;
}

export const EmployabilityGaugeCard: FC<EmployabilityGaugeCardProps> = ({ summary, profile }) => {
  const score = summary.employability_score || 0;
  const targetPoints = summary.target_points || 1;
  const verifiedPoints = summary.verified_points || 0;
  const pointsPercent = Math.min(Math.round((verifiedPoints / targetPoints) * 100), 100);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'High-Calibre Talent':
        return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'Industry Ready':
        return { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' };
      case 'Developing':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  const tierColors = getTierColor(summary.tier);

  return (
    <div className="employability-gauge-card">
      <div className="gauge-header-row">
        <div className="gauge-title-group">
          <span className="gauge-icon-badge">
            <SparklesIcon size={16} color="#0284c7" />
          </span>
          <div>
            <h4>Accredited Employability Quotient</h4>
            <p>Composite ranking evaluated from verified technical milestones (70%) and academic CGPA (30%)</p>
          </div>
        </div>

        <div
          className="tier-badge-pill"
          style={{
            backgroundColor: tierColors.bg,
            color: tierColors.text,
            borderColor: tierColors.border,
          }}
        >
          <ShieldCheckIcon size={14} color={tierColors.text} />
          {summary.tier}
        </div>
      </div>

      <div className="gauge-metrics-grid">
        {/* Big Score Gauge */}
        <div className="big-score-box">
          <span className="score-label">Overall Index</span>
          <div className="score-number-row">
            <span className="score-big">{score.toFixed(1)}</span>
            <span className="score-unit">%</span>
          </div>
          <div className="score-meter-bar">
            <div
              className="score-meter-fill"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
        </div>

        {/* Milestone Weighting Breakdown */}
        <div className="metric-box">
          <div className="metric-top">
            <span className="metric-label">Milestone Points (70% Weight)</span>
            <span className="metric-sub-val">+{summary.milestone_component.toFixed(1)}%</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-val">{verifiedPoints}</span>
            <span className="metric-denom">/ {targetPoints} pts</span>
          </div>
          <div className="progress-bar-sm">
            <div className="progress-fill-sm" style={{ width: `${pointsPercent}%` }} />
          </div>
          <span className="metric-hint">{summary.milestones_completed} Milestone(s) Verified</span>
        </div>

        {/* CGPA Weighting Breakdown */}
        <div className="metric-box">
          <div className="metric-top">
            <span className="metric-label">Academic CGPA (30% Weight)</span>
            <span className="metric-sub-val">+{summary.cgpa_component.toFixed(1)}%</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-val">{profile.cgpa ? Number(profile.cgpa).toFixed(2) : 'N/A'}</span>
            <span className="metric-denom">/ 5.00 CGPA</span>
          </div>
          <div className="progress-bar-sm">
            <div
              className="progress-fill-sm cgpa-fill"
              style={{ width: `${profile.cgpa ? (Number(profile.cgpa) / 5.0) * 100 : 0}%` }}
            />
          </div>
          <span className="metric-hint">{profile.academic_standing_display || 'In Good Standing'}</span>
        </div>
      </div>
    </div>
  );
};
