import { useState, type FC } from 'react';
import type { HealthResponse } from '../types';

interface NavbarProps {
  health: HealthResponse | null;
  loading: boolean;
  onOpenBooking: () => void;
  onOpenScoreModal: () => void;
}

export const Navbar: FC<NavbarProps> = ({
  health,
  loading,
  onOpenBooking,
  onOpenScoreModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isConnected = health && health.status === 'ok';

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner container-fluid">
        {/* Brand Logo & Name */}
        <a href="#" className="brand-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="logo-icon-wrapper">
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
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <button type="button" className="nav-item" onClick={() => scrollTo('capabilities')}>
            Capabilities
          </button>
          <button type="button" className="nav-item" onClick={() => scrollTo('workspaces')}>
            Workspaces
          </button>
          <button type="button" className="nav-item" onClick={() => scrollTo('ai-demo')}>
            AI Assistant
          </button>
          <button type="button" className="nav-item" onClick={() => scrollTo('oversight')}>
            Governance
          </button>
          <button type="button" className="nav-item" onClick={() => scrollTo('partners')}>
            Founding Partners
          </button>
          <button type="button" className="nav-item nav-score-link" onClick={onOpenScoreModal}>
            Employability Score
          </button>
        </nav>

        {/* Header Action Items */}
        <div className="header-actions">
          {/* Live API Health Status */}
          <div
            className={`api-status-pill ${loading ? 'loading' : isConnected ? 'online' : 'offline'}`}
            title={
              isConnected
                ? `Django 6.0 API + PostgreSQL pgvector (${health?.pgvector}) connected on port 8001`
                : 'Connecting to local Django API...'
            }
          >
            <span className="status-dot"></span>
            <span className="status-text">
              {loading ? 'Connecting' : isConnected ? 'API Live' : 'Backend Offline'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary-sm d-none-mobile"
            onClick={onOpenScoreModal}
          >
            How It Works
          </button>

          <button
            type="button"
            className="btn btn-primary-sm"
            onClick={onOpenBooking}
          >
            Book Walkthrough
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className={`mobile-toggle-btn ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <nav className="mobile-nav">
            <button type="button" className="mobile-nav-item" onClick={() => scrollTo('capabilities')}>
              Core Capabilities
            </button>
            <button type="button" className="mobile-nav-item" onClick={() => scrollTo('workspaces')}>
              Four Role Workspaces
            </button>
            <button type="button" className="mobile-nav-item" onClick={() => scrollTo('ai-demo')}>
              Grounded AI Assistant
            </button>
            <button type="button" className="mobile-nav-item" onClick={() => scrollTo('oversight')}>
              Institutional Governance
            </button>
            <button type="button" className="mobile-nav-item" onClick={() => scrollTo('partners')}>
              Founding Partner Program
            </button>
            <button
              type="button"
              className="mobile-nav-item highlight"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenScoreModal();
              }}
            >
              How Employability Score Works
            </button>
            <div className="mobile-menu-cta">
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
              >
                Book a Scoped Walkthrough
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
