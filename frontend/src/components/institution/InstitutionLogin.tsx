import { useState, type FC, type FormEvent } from 'react';
import type { LoginResponse } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  BuildingIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
} from '../icons';

interface InstitutionLoginProps {
  onLoginSuccess: (authData: LoginResponse) => void;
  onBackToLanding: () => void;
}

export const InstitutionLogin: FC<InstitutionLoginProps> = ({
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState('csc@futminna.edu.ng');
  const [password, setPassword] = useState('1234!@#$');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      institution: 'FUTMinna (Federal University)',
      email: 'csc@futminna.edu.ng',
      role: 'Dean, School of ICT (Superadmin Staff)',
      regulator: 'NUC',
      type: 'staff',
    },
    {
      institution: 'FUTMinna (Software Engineering Student)',
      email: 'student.swe@futminna.edu.ng',
      role: 'Amina Bello · 400L B.Tech SWE (Score: 50.8%)',
      regulator: 'NUC',
      type: 'student',
    },
    {
      institution: 'YabaTech (Polytechnic ND Student)',
      email: 'student.nd@yabatech.edu.ng',
      role: 'Babatunde Adeleke · ND II Computer Science',
      regulator: 'NBTE',
      type: 'student',
    },
    {
      institution: 'FCE Zaria (College of Education Student)',
      email: 'student.nce@fcezaria.edu.ng',
      role: 'Fatima Garba · NCE III Math & Computer Ed',
      regulator: 'NCCE',
      type: 'student',
    },
    {
      institution: 'Gombe State University (State Univ)',
      email: 'csc@gsu.edu.ng',
      role: 'HOD, Computer Science (Staff)',
      regulator: 'NUC',
      type: 'staff',
    },
    {
      institution: 'YabaTech (Polytechnic)',
      email: 'csc@yabatech.edu.ng',
      role: 'HOD, Computer Technology (Staff)',
      regulator: 'NBTE',
      type: 'staff',
    },
  ];

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('1234!@#$');
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await institutionApi.login(email.trim(), password);
      onLoginSuccess(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Top Header */}
      <header className="login-header">
        <button type="button" className="btn-back-link" onClick={onBackToLanding}>
          <ArrowLeftIcon size={16} /> Back to Landing Page
        </button>
        <div className="login-header-brand">
          <BuildingIcon size={22} color="#38bdf8" />
          <span className="brand-title">Edusal Institutional Governance</span>
        </div>
      </header>

      <div className="login-main-wrapper">
        <div className="login-card-container">
          {/* Left / Top Form Card */}
          <div className="login-form-card">
            <div className="login-card-header">
              <div className="login-shield-badge">
                <ShieldCheckIcon size={16} color="#0284c7" />
                <span>Auditable Institutional Access</span>
              </div>
              <h2 className="login-title">Sign in to Institution Workspace</h2>
              <p className="login-sub">
                Authenticate with your university, polytechnic, or college staff account.
              </p>
            </div>

            {error && (
              <div className="login-alert-error">
                <AlertCircleIcon size={18} color="#dc2626" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="inst-email">
                  Institutional Email Address
                </label>
                <div className="input-with-icon">
                  <MailIcon size={18} className="input-icon" />
                  <input
                    id="inst-email"
                    type="email"
                    required
                    placeholder="e.g. csc@futminna.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="inst-password">
                    Password
                  </label>
                  <span className="test-pass-hint">Default: 1234!@#$</span>
                </div>
                <div className="input-with-icon">
                  <LockIcon size={18} className="input-icon" />
                  <input
                    id="inst-password"
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary login-submit-btn"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                {!loading && <ArrowRightIcon size={16} />}
              </button>
            </form>

            <div className="login-security-footer">
              <div className="security-item">
                <CheckCircleIcon size={15} color="#059669" />
                <span>Multi-tenant isolation & data sovereignty</span>
              </div>
              <div className="security-item">
                <CheckCircleIcon size={15} color="#059669" />
                <span>NDPR & statutory regulatory compliance</span>
              </div>
            </div>
          </div>

          {/* Right Demo Accounts Selector */}
          <div className="login-demo-panel">
            <div className="demo-panel-header">
              <span className="demo-tag">Seeded Test Accounts</span>
              <h3 className="demo-panel-title">Click to Select Pre-Configured Account</h3>
              <p className="demo-panel-sub">
                Pre-loaded with 4-tier hierarchy data, student handbooks, and pgvector embeddings.
              </p>
            </div>

            <div className="demo-accounts-list">
              {demoAccounts.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <div
                    key={acc.email}
                    className={`demo-account-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectDemo(acc.email)}
                  >
                    <div className="demo-card-top">
                      <span className="demo-inst-title">{acc.institution}</span>
                      <span className="demo-regulator-pill">{acc.regulator} Regulated</span>
                    </div>

                    <div className="demo-card-meta">
                      <code className="demo-email">{acc.email}</code>
                      <span className="demo-role">{acc.role}</span>
                    </div>

                    <div className="demo-card-footer">
                      <span className="pass-pill">Password: 1234!@#$</span>
                      <span className="select-action">
                        {isSelected ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckIcon size={13} color="#38bdf8" /> Selected
                          </span>
                        ) : (
                          'Use Account →'
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
