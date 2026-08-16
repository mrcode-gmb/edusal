import type { FC } from 'react';
import { BuildingIcon, CheckIcon } from './icons';

export const InstitutionalOversight: FC = () => {
  const taxonomyItems = [
    {
      title: 'Unified Outcome Taxonomy',
      desc: 'Standardized operational definitions across placement, pathway completion, NYSC deployment, and postgraduate transition.',
      badge: 'Data Integrity',
      details: 'Ensures a "placement rate" in Engineering means the exact same verifiable outcome as one in Management Sciences.',
    },
    {
      title: 'Faculty & Cohort Benchmarking',
      desc: 'Compare departmental progress across faculties without misleading aggregates or unverified self-reports.',
      badge: 'Academic Senate',
      details: 'Live drill-down from university-wide summaries to individual signed milestones in one click.',
    },
    {
      title: 'Regulator-Ready Reporting',
      desc: 'Formally structured for National Universities Commission (NUC), NBTE for polytechnics, and NCCE for colleges of education.',
      badge: 'Accreditation',
      details: 'Pre-formatted export packs for accreditation visits, institutional audits, and annual council reports.',
    },
  ];

  return (
    <section id="oversight" className="oversight-section">
      <div className="container-custom">
        <div className="section-header-centered">
          <span className="section-eyebrow">Institutional Leadership & Governance</span>
          <h2 className="section-title">
            Intelligence your leadership can compare across faculties, honestly
          </h2>
          <p className="section-lead">
            The same outcome taxonomy across every department, so a placement rate means the same verifiable milestone everywhere it's reported.
          </p>
        </div>

        {/* 3 Governance Pillars Grid */}
        <div className="oversight-grid">
          {taxonomyItems.map((item, idx) => (
            <div key={idx} className="oversight-card">
              <div className="oversight-badge">{item.badge}</div>
              <h3 className="oversight-title">{item.title}</h3>
              <p className="oversight-desc">{item.desc}</p>
              <div className="oversight-detail-box">
                <CheckIcon size={14} color="#059669" />
                <span className="detail-text">{item.details}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Regulator Compliance Banner */}
        <div className="regulator-alignment-card">
          <div className="reg-badge-col">
            <span className="reg-seal">
              <BuildingIcon size={24} color="#0052cc" />
            </span>
            <div>
              <h4>Standardized for Nigerian Regulatory Compliance</h4>
              <p>Designed to support institutional self-study reports, accreditation audits, and senate oversight portfolios.</p>
            </div>
          </div>
          <div className="reg-bodies-tags">
            <span className="reg-tag">NUC (Universities)</span>
            <span className="reg-tag">NBTE (Polytechnics)</span>
            <span className="reg-tag">NCCE (Colleges of Ed.)</span>
            <span className="reg-tag">ITF / SIWES Directorate</span>
          </div>
        </div>
      </div>
    </section>
  );
};

