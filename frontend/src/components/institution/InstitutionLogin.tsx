import { useState, useEffect, type FC, type FormEvent } from 'react';
import type { LoginResponse } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Button,
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Verified as VerifiedIcon,
  School as SchoolIcon,
  ManageAccounts as ManageAccountsIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px' },
  '& .MuiInputLabel-root': { fontSize: 14.5 },
};

const TrustPoints = [
  'Grounded on your handbooks & SIWES calendars',
  'Named evaluator sign-offs on every milestone',
  'Auditable evidence behind every score',
];

interface InstitutionLoginProps {
  initialRole?: 'student' | 'staff';
  onLoginSuccess: (authData: LoginResponse) => void;
  onBackToLanding: () => void;
}

export const InstitutionLogin: FC<InstitutionLoginProps> = ({
  initialRole = 'staff',
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [activePortal, setActivePortal] = useState<'student' | 'staff'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActivePortal(initialRole);
    setEmail('');
    setPassword('');
    setError(null);
  }, [initialRole]);

  const handlePortalSwitch = (portal: 'student' | 'staff') => {
    setActivePortal(portal);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await institutionApi.login(email.trim(), password);
      onLoginSuccess(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = activePortal === 'student';

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Brand Panel */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-primary p-12 lg:flex">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

        <div className="relative">
          <img src="/logo-white.png" alt="Nexus Edutech Consult Ltd" className="h-9 w-auto" />
        </div>

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Institutional Portal</p>
          <h2 className="mt-3 max-w-md text-3xl leading-tight text-white md:text-4xl">
            Employability, built and verified on evidence.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {TrustPoints.map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <VerifiedIcon sx={{ fontSize: 14, color: '#fff' }} />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-10 max-w-sm rounded-2xl bg-white/[0.08] p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">Institutional Governance</p>
            <p className="mt-2 text-sm text-white/85">
              Secure, multi-tenant career services and milestone verification platform aligned with NUC, NBTE, and NCCE statutory requirements.
            </p>
          </div>
        </div>

        <p className="relative text-sm text-white/60">© 2026 Nexus Edutech Consult Ltd. Career Service Centre Management Platform.</p>
      </aside>

      {/* Right Form Panel */}
      <main className="flex flex-1 flex-col items-center justify-center bg-bgsoft px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[480px]">

          <div className="mb-8 lg:hidden">
            <img src="/logo.png" alt="Nexus Edutech Consult Ltd" className="h-9 w-auto" />
          </div>

          {/* Portal switcher tabs */}
          <div className="mb-6 flex gap-2 rounded-xl bg-white p-1.5 shadow-card">
            <button
              type="button"
              onClick={() => handlePortalSwitch('staff')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors ${!isStudent ? 'bg-primary text-white shadow-sm' : 'text-charcoal-soft hover:bg-bgsoft'}`}
            >
              <ManageAccountsIcon sx={{ fontSize: 17 }} />
              Staff / Faculty
            </button>
            <button
              type="button"
              onClick={() => handlePortalSwitch('student')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors ${isStudent ? 'bg-primary text-white shadow-sm' : 'text-charcoal-soft hover:bg-bgsoft'}`}
            >
              <SchoolIcon sx={{ fontSize: 17 }} />
              Student Portal
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Institutional Portal</p>
            <h1 className="mt-2 text-3xl leading-tight text-charcoal">{isStudent ? 'Student Sign In' : 'Welcome back'}</h1>
          
          </div>

          {/* Login form */}
          <div className="rounded-2xl bg-white p-6 shadow-card md:p-8">
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                id="portal-email"
                label={isStudent ? 'Student Institutional Email' : 'Staff / Institutional Email'}
                type="email"
                size="medium"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isStudent ? 'matric_no@institution.edu.ng' : 'admin@institution.edu.ng'}
                sx={inputSx}
              />
              <TextField
                id="portal-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                size="medium"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                sx={{ ...inputSx, mt: 2 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="Toggle password visibility" onClick={() => setShowPassword((s) => !s)} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
                sx={{ mt: 3, borderRadius: '10px' }}
              >
                {loading ? 'Authenticating…' : isStudent ? 'Sign In to Student Portal' : 'Sign In to Workspace'}
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-charcoal-faint">
                <CheckCircleIcon sx={{ fontSize: 14, color: '#059669' }} />
                Single-tenant institutional boundary
              </div>
              <div className="flex items-center gap-1.5 text-xs text-charcoal-faint">
                <CheckCircleIcon sx={{ fontSize: 14, color: '#059669' }} />
                NDPR & statutory compliance
              </div>
            </div>
          </div>

          {/* Registration & Support Link Card */}
          <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-charcoal">
                  {isStudent ? 'First time signing in as a student?' : 'Registering a new institution?'}
                </p>
                <p className="mt-0.5 text-xs text-charcoal-soft">
                  {isStudent
                    ? 'Use the matric credentials dispatched by your departmental career counsellor.'
                    : 'Provision a campus tenant, select your plan, and generate your invoice.'}
                </p>
              </div>
              {!isStudent && (
                <a
                  href="/portal/register"
                  className="shrink-0 rounded-xl bg-primary-soft px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Register Campus →
                </a>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToLanding}
            className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-charcoal-faint hover:text-primary transition-colors"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Back to home
          </button>
        </div>
      </main>
    </div>
  );
};
