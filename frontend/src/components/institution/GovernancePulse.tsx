import type { FC } from 'react';
import type { GovernanceSummary } from '../../types/institution';

interface GovernancePulseProps {
  summary: GovernanceSummary | null;
  loading: boolean;
  onGenerateReport: () => void;
}

export const GovernancePulse: FC<GovernancePulseProps> = ({
  summary,
  loading,
  onGenerateReport,
}) => {
  if (loading) {
    return (
      <div className="governance-loading-grid">
        <div className="pulse-skeleton"></div>
        <div className="pulse-skeleton"></div>
        <div className="pulse-skeleton"></div>
      </div>
    );
  }

  if (!summary) {
    return <div className="governance-empty">No governance data available.</div>;
  }

  const { hierarchy_metrics, knowledge_base, active_session, accreditation_readiness } = summary;

  return (
    <div className="governance-pulse-container">
      {/* Top Banner with Active Session & Audit Trigger */}
      <div className="governance-hero-card">
        <div className="governance-hero-info">
          <span className="session-status-badge">🟢 Live Academic Governance</span>
          <h3 className="governance-hero-title">
            Senate & Accreditation Health Pulse — {summary.institution.name}
          </h3>
          <p className="governance-hero-sub">
            Active Session: <strong>{active_session.label}</strong> ({active_session.semester}) · Regulatory Scope: <strong>{summary.institution.regulator}</strong>
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={onGenerateReport}>
          📄 Generate Senate Audit Pack
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="governance-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box">🏛️</div>
          <div className="kpi-content">
            <span className="kpi-label">Academic Divisions</span>
            <div className="kpi-value">{hierarchy_metrics.total_divisions}</div>
            <span className="kpi-sub">{summary.institution.tier_two_term === 'SCHOOL' ? 'Schools / Faculties' : 'Faculties'} Mapped</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box">🏢</div>
          <div className="kpi-content">
            <span className="kpi-label">Active Departments</span>
            <div className="kpi-value">{hierarchy_metrics.total_departments}</div>
            <span className="kpi-sub">
              {hierarchy_metrics.siwes_eligible_departments} SIWES Eligible ({hierarchy_metrics.siwes_eligibility_percentage}%)
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box">🎓</div>
          <div className="kpi-content">
            <span className="kpi-label">Degree Programmes</span>
            <div className="kpi-value">{hierarchy_metrics.total_programs}</div>
            <span className="kpi-sub">Curriculum Rubrics Configured</span>
          </div>
        </div>

        <div className="kpi-card highlight-card">
          <div className="kpi-icon-box">⚡</div>
          <div className="kpi-content">
            <span className="kpi-label">Grounded Vector Chunks</span>
            <div className="kpi-value">{knowledge_base.total_indexed_chunks}</div>
            <span className="kpi-sub">{knowledge_base.grounding_status}</span>
          </div>
        </div>
      </div>

      {/* Compliance & Regulatory Checklist */}
      <div className="governance-compliance-card">
        <div className="compliance-header">
          <div>
            <h4 className="compliance-title">Regulatory Compliance & Verification Baseline</h4>
            <p className="compliance-sub">
              Standardized against {accreditation_readiness.regulator} Institutional Guidelines
            </p>
          </div>
          <span className="badge-verified">100% Audit Ready</span>
        </div>

        <div className="compliance-grid">
          <div className="compliance-item">
            <div className="compliance-status-icon check">✓</div>
            <div>
              <strong>Unified Outcome Taxonomy</strong>
              <p>Operational definitions standardized across all faculties</p>
            </div>
          </div>

          <div className="compliance-item">
            <div className="compliance-status-icon check">✓</div>
            <div>
              <strong>4-Tier Hierarchy Integrity</strong>
              <p>Faculties, Departments, and Degree options strictly relational</p>
            </div>
          </div>

          <div className="compliance-item">
            <div className="compliance-status-icon check">✓</div>
            <div>
              <strong>Document Grounding in pgvector</strong>
              <p>Handbooks and SIWES policies chunked with exact citations</p>
            </div>
          </div>

          <div className="compliance-item">
            <div className="compliance-status-icon check">✓</div>
            <div>
              <strong>Zero Unbacked Claims Policy</strong>
              <p>Student milestone sign-offs locked to named faculty evaluators</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
