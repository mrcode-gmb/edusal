import type { FC } from 'react';

interface SocialProofProps {
  onOpenPartnerModal: () => void;
}

export const SocialProof: FC<SocialProofProps> = ({ onOpenPartnerModal }) => {
  return (
    <section className="social-proof-section">
      <div className="container-custom">
        <div className="section-header-centered">
          <span className="section-eyebrow">Collaborative Co-Design</span>
          <h2 className="section-title">What early partners are telling us</h2>
          <p className="section-lead">
            We are building in open consultation with Nigerian deans of student affairs, directors of career centres, and SIWES coordinators.
          </p>
        </div>

        <div className="co-design-card">
          <div className="co-design-content">
            <div className="quote-mark">“</div>
            <h3 className="co-design-quote">
              The primary challenge facing career service centres in Nigeria isn't a shortage of students — it's the inability to verify what each student can actually do when an employer asks for evidence.
            </h3>
            <p className="co-design-attribution">
              — Founding Partner Advisory Roundtable Theme, Q2 2026 Working Session
            </p>

            <div className="co-design-stats-strip">
              <div className="stat-pill">
                <span className="stat-label">Advisory Scope:</span>
                <span className="stat-val">Engineering, Computing, Business & Vocational Disciplines</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Template Co-Design:</span>
                <span className="stat-val">Faculty-led pathway calibration underway</span>
              </div>
            </div>
          </div>

          <div className="co-design-cta-box">
            <h4>Join the Advisory Roundtable</h4>
            <p>Help calibrate the standard employability rubric for your institution's specific departments.</p>
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={onOpenPartnerModal}
            >
              Apply as Founding Partner →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
