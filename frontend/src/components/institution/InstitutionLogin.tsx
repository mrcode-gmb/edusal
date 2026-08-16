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
  const [email, setEmail] = useState(
    initialRole === 'student' ? 'student.swe@futminna.edu.ng' : 'csc@futminna.edu.ng'
  );
  const [password, setPassword] = useState('1234!@#$');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActivePortal(initialRole);
    setEmail(initialRole === 'student' ? 'student.swe@futminna.edu.ng' : 'csc@futminna.edu.ng');
    setPassword('1234!@#$');
    setError(null);
  }, [initialRole]);

  const studentDemoAccounts = [
    { institution: 'FUTMinna (Federal University)', email: 'student.swe@futminna.edu.ng', name: 'Amina Bello', detail: '400L B.Tech Software Engineering', regulator: 'NUC' },
    { institution: 'YabaTech (Polytechnic)', email: 'student.nd@yabatech.edu.ng', name: 'Babatunde Adeleke', detail: 'ND II Computer Science', regulator: 'NBTE' },
    { institution: 'FCE Zaria (College of Education)', email: 'student.nce@fcezaria.edu.ng', name: 'Fatima Garba', detail: 'NCE III Mathematics & Computer Education', regulator: 'NCCE' },
  ];

  const staffDemoAccounts = [
    { institution: 'FUTMinna (Federal University)', email: 'csc@futminna.edu.ng', name: 'Prof. Mohammed Bashir', detail: 'Dean, School of ICT (Superadmin)', regulator: 'NUC' },
    { institution: 'Gombe State University', email: 'csc@gsu.edu.ng', name: 'Dr. Umar Faruk', detail: 'HOD, Computer Science', regulator: 'NUC' },
    { institution: 'YabaTech (Polytechnic)', email: 'csc@yabatech.edu.ng', name: 'Mrs. O. A. Adeleke', detail: 'HOD, Computer Technology', regulator: 'NBTE' },
    { institution: 'FCE Zaria (College of Education)', email: 'csc@fcezaria.edu.ng', name: 'Dr. Aisha Garba', detail: 'HOD, Mathematics & Computer Education', regulator: 'NCCE' },
  ];

  const handlePortalSwitch = (portal: 'student' | 'staff') => {
    setActivePortal(portal);
    setError(null);
    setEmail(portal === 'student' ? 'student.swe@futminna.edu.ng' : 'csc@futminna.edu.ng');
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
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = activePortal === 'student';
  const demoAccounts = isStudent ? studentDemoAccounts : staffDemoAccounts;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Brand Panel */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-primary p-12 lg:flex">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

        <div className="relative">
          <img src="/logo-white.png" alt="Edusal Consult" className="h-9 w-auto" />
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
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">Verified Student Record</p>
            <p className="mt-3 text-lg font-bold text-white">Amina Bello</p>
            <p className="text-sm text-white/70">400L Software Engineering · FUTMinna</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-white/60">Employability Score</p>
                <p className="text-4xl font-extrabold leading-none text-white">87<span className="text-lg text-white/60"> / 100</span></p>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">Industry Ready</span>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-white/60">© 2026 Edusal Consult. Career Service Centre Management Platform.</p>
      </aside>

      {/* Right Form Panel */}
      <main className="flex flex-1 flex-col items-center justify-center bg-bgsoft px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[480px]">

          <div className="mb-8 lg:hidden">
            <img src="/logo.png" alt="Edusal Consult" className="h-9 w-auto" />
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
            <p className="mt-1.5 text-charcoal-soft">
              {isStudent ? 'Access your accredited degree roadmap and employability record.' : "Sign in to access your institution's governance workspace."}
            </p>
          </div>

          {/* Login form */}
          <div className="rounded-2xl bg-white p-6 shadow-card md:p-8">
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                id="portal-email"
                label={isStudent ? 'Student Institutional Email' : 'Staff Institutional Email'}
                type="email"
                size="medium"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <div className="mt-3">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary">
                  Seed password: 1234!@#$
                </span>
              </div>
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

          {/* Demo accounts */}
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-charcoal-faint">
              {isStudent ? 'Seeded Student Test Accounts' : 'Seeded Staff Test Accounts'}
            </p>
            <p className="mt-1 text-sm text-charcoal-soft">
              Click any card to pre-fill — password is always{' '}
              <code className="rounded bg-bgsoft px-1.5 py-0.5 text-xs font-bold text-charcoal">1234!@#$</code>
            </p>
            <div className="mt-4 space-y-2.5">
              {demoAccounts.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemo(acc.email)}
                    className={`w-full rounded-xl p-4 text-left transition-all ${isSelected ? 'border border-primary bg-primary-faint ring-1 ring-primary/30' : 'bg-white hover:bg-primary-faint/50'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-bold text-charcoal">{acc.institution}</span>
                          <Chip
                            label={`${acc.regulator} Regulated`}
                            size="small"
                            sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'rgba(20,107,74,0.1)', color: '#146b4a', '& .MuiChip-label': { px: 1 } }}
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-charcoal-soft">{acc.name} · {acc.detail}</p>
                        <code className="mt-1 block text-[11px] text-charcoal-faint">{acc.email}</code>
                      </div>
                      <span className={`mt-1 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-bgsoft text-charcoal-faint'}`}>
                        {isSelected ? '✓ Selected' : 'Use →'}
                      </span>
                    </div>
                  </button>
                );
              })}
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
