import type { FC } from 'react';

interface FoundingPartnerStripProps {
  onOpenPartnerModal: () => void;
}

export const FoundingPartnerStrip: FC<FoundingPartnerStripProps> = ({
  onOpenPartnerModal,
}) => {
  const institutionTypes = [
    { label: 'Federal Universities', regulator: 'NUC Regulated' },
    { label: 'State Universities', regulator: 'NUC Regulated' },
    { label: 'Polytechnics & Monotechnics', regulator: 'NBTE Regulated' },
    { label: 'Colleges of Education', regulator: 'NCCE Regulated' },
    { label: 'Private Tertiary Institutions', regulator: 'Accredited' },
  ];

  return (
    <section id="partners" className="partner-strip-section">
      <div className="container-custom">
        <div className="partner-strip-card">
          <div className="partner-content-left">
            <div className="partner-badge">
              <span className="badge-pulse"></span>
              <span>2026 Founding Partner Program</span>
            </div>
            <h2 className="partner-heading">
              Now onboarding founding partner institutions across Nigeria.
            </h2>
            <p className="partner-subtext">
              Early partner universities, polytechnics, and colleges shape the pathway templates for their faculties and receive preferred charter pricing.
            </p>
          </div>

          <div className="partner-action-right">
            <button
              type="button"
              className="btn btn-dark-cta"
              onClick={onOpenPartnerModal}
            >
              Founding Partner Program <span className="arrow-icon">→</span>
            </button>
            <span className="partner-spots-note">Limited cohort slots available for Q3/Q4 onboarding</span>
          </div>
        </div>

        {/* Institutional Regulatory Scope Badges */}
        <div className="institutions-scope-row">
          <span className="scope-intro">Designed specifically for the Nigerian tertiary ecosystem:</span>
          <div className="scope-pills-wrap">
            {institutionTypes.map((item, idx) => (
              <div key={idx} className="scope-pill">
                <span className="pill-title">{item.label}</span>
                <span className="pill-regulator">{item.regulator}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
