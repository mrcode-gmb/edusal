import type { FC } from 'react';
import type { HealthResponse } from '../types';

interface FooterProps {
  health: HealthResponse | null;
  onOpenScoreModal: () => void;
  onOpenPartnerModal: () => void;
}

export const Footer: FC<FooterProps> = ({
  health,
  onOpenScoreModal,
  onOpenPartnerModal,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container-custom">
        <div className="footer-main-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <div className="logo-icon-wrapper-sm">
                <svg viewBox="0 0 100 100" className="logo-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 28C20 23.5817 23.5817 20 28 20H48V32H32V42H46V54H32V68C32 72.4183 35.5817 76 40 76H52C56.4183 76 60 72.4183 60 68V60H48"
                    stroke="#0052cc"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M48 32C48 25.3726 53.3726 20 60 20C66.6274 20 72 25.3726 72 32C72 38.6274 66.6274 44 60 44H46C46 54 54 58 64 58C70.6274 58 76 63.3726 76 70C76 76.6274 70.6274 82 64 82H50"
                    stroke="#0066f5"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="brand-text">
                <span className="brand-name">EDUSAL</span>
                <span className="brand-sub">CONSULT</span>
              </div>
            </div>

            <p className="footer-mission">
              Career Service Centre Management Platform for Nigerian tertiary institutions. Built for NUC universities, NBTE polytechnics, NCCE colleges of education, and private institutions.
            </p>

            <div className="footer-engine-badge">
              <span className="engine-dot"></span>
              <span>Backend Engine: Django 6.0 + pgvector ({health?.pgvector || 'Ready'})</span>
            </div>
          </div>

          {/* Links Column 1: Platform */}
          <div className="footer-links-col">
            <h4 className="footer-links-title">Platform</h4>
            <ul className="footer-links-list">
              <li><button type="button" onClick={() => scrollTo('capabilities')}>Overview</button></li>
              <li><button type="button" onClick={() => scrollTo('ai-demo')}>Grounded AI Assistant</button></li>
              <li><button type="button" onClick={onOpenScoreModal}>Employability Score</button></li>
              <li><button type="button" onClick={() => scrollTo('workspaces')}>Assessment Engine</button></li>
              <li><button type="button" onClick={() => scrollTo('capabilities')}>Employer Pipeline</button></li>
            </ul>
          </div>

          {/* Links Column 2: Audiences */}
          <div className="footer-links-col">
            <h4 className="footer-links-title">Audiences</h4>
            <ul className="footer-links-list">
              <li><button type="button" onClick={() => scrollTo('oversight')}>Universities & Polytechnics</button></li>
              <li><button type="button" onClick={() => scrollTo('workspaces')}>Students & Graduates</button></li>
              <li><button type="button" onClick={() => scrollTo('workspaces')}>Career Counsellors</button></li>
              <li><button type="button" onClick={() => scrollTo('workspaces')}>Hiring Employers</button></li>
              <li><button type="button" onClick={onOpenPartnerModal}>Founding Partners</button></li>
            </ul>
          </div>

          {/* Links Column 3: Compliance & Company */}
          <div className="footer-links-col">
            <h4 className="footer-links-title">Ecosystem</h4>
            <ul className="footer-links-list">
              <li><button type="button" onClick={() => scrollTo('oversight')}>NUC / NBTE Alignment</button></li>
              <li><button type="button" onClick={() => scrollTo('booking-section')}>Book a Walkthrough</button></li>
              <li><a href="http://localhost:8001/api/docs/" target="_blank" rel="noreferrer">OpenAPI Documentation ↗</a></li>
              <li><a href="http://localhost:8001/admin/" target="_blank" rel="noreferrer">Institutional Portal ↗</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {new Date().getFullYear()} Edusal Consult. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <span>NDPR Data Privacy</span>
            <span>·</span>
            <span>Security Architecture</span>
            <span>·</span>
            <span>Institutional Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
