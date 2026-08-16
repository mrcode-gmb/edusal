import { useState, useEffect, type FC, type FormEvent } from 'react';
import type { LoginResponse } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  BuildingIcon,
  GraduationCapIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  SparklesIcon,
} from '../icons';

interface InstitutionLoginProps {
  initialRole?: 'student' | 'staff';
  onLoginSuccess: (authData: LoginResponse) => void;
  onBackToLanding: () => void;
}

export const InstitutionLogin: FC<InstitutionLoginProps> = ({
  initialRole = 'student',
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [activePortal, setActivePortal] = useState<'student' | 'staff'>(initialRole);
  const [email, setEmail] = useState(
    initialRole === 'student' ? 'student.swe@futminna.edu.ng' : 'csc@futminna.edu.ng'
  );
  const [password, setPassword] = useState('1234!@#$');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if initialRole prop changes
  useEffect(() => {
    setActivePortal(initialRole);
    setEmail(initialRole === 'student' ? 'student.swe@futminna.edu.ng' : 'csc@futminna.edu.ng');
    setPassword('1234!@#$');
    setError(null);
  }, [initialRole]);

  const studentDemoAccounts = [
    {
      institution: 'FUTMinna (Federal University)',
      email: 'student.swe@futminna.edu.ng',
      name: 'Amina Bello',
      level: '400L B.Tech Software Engineering',
      score: '50.8% Employability Score (3 Verified Milestones)',
      regulator: 'NUC',
    },
    {
      institution: 'YabaTech (Polytechnic)',
      email: 'student.nd@yabatech.edu.ng',
      name: 'Babatunde Adeleke',
      level: 'ND II Computer Science',
      score: 'Enrolled in Frontend & Cloud Pathway',
      regulator: 'NBTE',
    },
    {
      institution: 'FCE Zaria (College of Education)',
      email: 'student.nce@fcezaria.edu.ng',
      name: 'Fatima Garba',
      level: 'NCE III Mathematics & Computer Education',
      score: 'Enrolled in EdTech & Digital Pedagogy Pathway',
      regulator: 'NCCE',
    },
  ];

  const staffDemoAccounts = [
    {
      institution: 'FUTMinna (Federal University)',
      email: 'csc@futminna.edu.ng',
      name: 'Prof. Mohammed Bashir',
      role: 'Dean, School of ICT (Superadmin)',
      regulator: 'NUC',
    },
    {
      institution: 'Gombe State University (State Univ)',
      email: 'csc@gsu.edu.ng',
      name: 'Dr. Umar Faruk',
      role: 'HOD, Computer Science',
      regulator: 'NUC',
    },
    {
      institution: 'YabaTech (Polytechnic)',
      email: 'csc@yabatech.edu.ng',
      name: 'Mrs. O. A. Adeleke',
      role: 'HOD, Computer Technology',
      regulator: 'NBTE',
    },
    {
      institution: 'FCE Zaria (College of Education)',
      email: 'csc@fcezaria.edu.ng',
      name: 'Dr. Aisha Garba',
      role: 'HOD, Mathematics & Computer Education',
      regulator: 'NCCE',
    },
  ];

  const handlePortalSwitch = (portal: 'student' | 'staff') => {
    setActivePortal(portal);
    setError(null);
    if (portal === 'student') {
      setEmail('student.swe@futminna.edu.ng');
    } else {
      setEmail('csc@futminna.edu.ng');
    }
    setPassword('1234!@#$');
  };

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
      setError(err instanceof Error ? err.message : 'Invalid login credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = activePortal === 'student';

  return (
    <div className="login-page-container">
      {/* Top Header */}
      <header className="login-header">
        <button type="button" className="btn-back-link" onClick={onBackToLanding}>
          <ArrowLeftIcon size={16} /> Back to Landing Page
        </button>
        <div className="login-header-brand">
          {isStudent ? (
            <GraduationCapIcon size={22} color="#38bdf8" />
          ) : (
            <BuildingIcon size={22} color="#38bdf8" />
          )}
          <span className="brand-title">
            EduSal {isStudent ? 'Student Career Portal' : 'Institutional Governance'}
          </span>
        </div>
      </header>

      <div className="login-main-wrapper">
        {/* Role Portal Switcher Tabs */}
        <div className="login-role-switcher-container">
          <div className="login-role-tabs">
            <button
              type="button"
              className={`role-tab-btn ${isStudent ? 'active student' : ''}`}
              onClick={() => handlePortalSwitch('student')}
            >
              <GraduationCapIcon size={18} />
              <span>Student Portal Login</span>
            </button>
            <button
              type="button"
              className={`role-tab-btn ${!isStudent ? 'active staff' : ''}`}
              onClick={() => handlePortalSwitch('staff')}
            >
              <BuildingIcon size={18} />
              <span>Staff & Faculty Login</span>
            </button>
          </div>
        </div>

        <div className="login-card-container">
          {/* Left / Top Form Card */}
          <div className="login-form-card">
            <div className="login-card-header">
              <div className={`login-shield-badge ${isStudent ? 'student-badge' : ''}`}>
                {isStudent ? (
                  <>
                    <SparklesIcon size={15} color="#0284c7" />
                    <span>Accredited Milestone & Employability Record</span>
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon size={15} color="#0284c7" />
                    <span>Auditable Institutional Governance</span>
                  </>
                )}
              </div>

              <h2 className="login-title">
                {isStudent ? 'Sign in to Student Career Portal' : 'Sign in to Faculty & Admin Workspace'}
              </h2>
              <p className="login-sub">
                {isStudent
                  ? 'Access your accredited degree roadmap, submit technical project evidence, and build your verified Employability Quotient.'
                  : 'Authenticate with your university, polytechnic, or college administrative credentials to evaluate submissions and manage academic pathways.'}
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
                <label className="form-label" htmlFor="portal-email">
                  {isStudent ? 'Student Institutional Email' : 'Staff Institutional Email'}
                </label>
                <div className="input-with-icon">
                  <MailIcon size={18} className="input-icon" />
                  <input
                    id="portal-email"
                    type="email"
                    required
                    placeholder={isStudent ? 'student.swe@futminna.edu.ng' : 'csc@futminna.edu.ng'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="portal-password">
                    Password
                  </label>
                  <span className="test-pass-hint">Standard Seed: 1234!@#$</span>
                </div>
                <div className="input-with-icon">
                  <LockIcon size={18} className="input-icon" />
                  <input
                    id="portal-password"
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
                {loading ? (
                  'Authenticating...'
                ) : (
                  <>
                    {isStudent ? 'Sign In to Student Portal' : 'Sign In to Faculty Workspace'}
                    <ArrowRightIcon size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="login-security-footer">
              <div className="security-item">
                <CheckCircleIcon size={15} color="#059669" />
                <span>Single-tenant institutional boundary</span>
              </div>
              <div className="security-item">
                <CheckCircleIcon size={15} color="#059669" />
                <span>NDPR & statutory compliance</span>
              </div>
            </div>
          </div>

          {/* Right Demo Accounts Selector */}
          <div className="login-demo-panel">
            <div className="demo-panel-header">
              <span className="demo-tag">
                {isStudent ? 'Student Test Accounts' : 'Faculty & Admin Accounts'}
              </span>
              <h3 className="demo-panel-title">
                {isStudent ? '1-Click Student Profile Selection' : '1-Click Institutional Account'}
              </h3>
              <p className="demo-panel-sub">
                {isStudent
                  ? 'Select a seeded student profile from university, polytechnic, or college tracks with real calculated Employability Scores.'
                  : 'Select an institutional administrative account with scoped departmental governance.'}
              </p>
            </div>

            <div className="demo-accounts-list">
              {(isStudent ? studentDemoAccounts : staffDemoAccounts).map((acc) => {
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
                      <strong className="demo-name">{acc.name}</strong>
                      <span className="demo-role">
                        {'level' in acc ? acc.level : acc.role}
                      </span>
                      {'score' in acc && (
                        <span className="demo-score-highlight">
                          <SparklesIcon size={12} color="#059669" /> {acc.score}
                        </span>
                      )}
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
