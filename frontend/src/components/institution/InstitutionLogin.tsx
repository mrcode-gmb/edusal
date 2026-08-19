import { useState, useEffect, useRef, type FC, type FormEvent, type KeyboardEvent } from 'react';
import type { LoginResponse, OtpChallenge } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Button,
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
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
  LockClock as LockClockIcon,
  MailOutlined as MailOutlineIcon,
  Refresh as RefreshIcon,
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

const OTP_LENGTH = 6;

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

  // OTP verification state
  const [otpStage, setOtpStage] = useState(false);
  const [otpChallenge, setOtpChallenge] = useState<OtpChallenge | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setActivePortal(initialRole);
    setEmail('');
    setPassword('');
    setError(null);
    resetOtp();
  }, [initialRole]);

  const resetOtp = () => {
    setOtpStage(false);
    setOtpChallenge(null);
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setOtpError(null);
    setOtpVerifying(false);
    setResendIn(0);
    setExpiresIn(0);
  };

  // Resend + expiry countdowns
  useEffect(() => {
    if (!otpStage || !otpChallenge) return;
    const timer = setInterval(() => {
      setResendIn((v) => (v > 0 ? v - 1 : 0));
      setExpiresIn((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpStage, otpChallenge]);

  // Auto-submit once all digits are filled
  const otpValue = otpDigits.join('');
  useEffect(() => {
    if (otpValue.length === OTP_LENGTH && !otpVerifying && otpChallenge) {
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue]);

  const handlePortalSwitch = (portal: 'student' | 'staff') => {
    setActivePortal(portal);
    setError(null);
    setEmail('');
    setPassword('');
    resetOtp();
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
      if (response.requires_otp && response.email) {
        const challenge: OtpChallenge = {
          requires_otp: true,
          email: response.email,
          resend_after: response.resend_after ?? 30,
          expires_in: response.expires_in ?? 300,
        };
        setOtpChallenge(challenge);
        setResendIn(challenge.resend_after);
        setExpiresIn(challenge.expires_in);
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        setOtpError(null);
        setOtpStage(true);
        setTimeout(() => digitRefs.current[0]?.focus(), 60);
      } else {
        onLoginSuccess(response);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const next = [...otpDigits];
    if (cleaned.length > 1) {
      // Paste support: fill from this index onward
      const digits = cleaned.split('').slice(0, OTP_LENGTH - index);
      digits.forEach((d, i) => {
        next[index + i] = d;
      });
    } else if (cleaned.length === 1) {
      next[index] = cleaned;
    } else {
      next[index] = '';
    }
    setOtpDigits(next);
    setOtpError(null);
    const focusIndex = cleaned.length > 1 ? index + cleaned.slice(0, OTP_LENGTH - index).length : Math.min(index + 1, OTP_LENGTH - 1);
    if (focusIndex < OTP_LENGTH && cleaned) {
      digitRefs.current[focusIndex]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpChallenge || otpValue.length !== OTP_LENGTH) return;
    setOtpVerifying(true);
    setOtpError(null);
    try {
      const response = await institutionApi.verifyOtp(email.trim(), otpValue);
      onLoginSuccess({ token: response.token, user: response.user });
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : 'We couldn\'t verify that code. Please try again.');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => digitRefs.current[0]?.focus(), 60);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || resendIn > 0) return;
    setOtpVerifying(true);
    setOtpError(null);
    try {
      const challenge = await institutionApi.resendOtp(email.trim());
      setOtpChallenge(challenge);
      setResendIn(challenge.resend_after);
      setExpiresIn(challenge.expires_in);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setOtpError(null);
      setTimeout(() => digitRefs.current[0]?.focus(), 60);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : 'We couldn\'t send a new code. Please try again.');
    } finally {
      setOtpVerifying(false);
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

          {otpStage ? (
            <div className="rounded-2xl bg-white p-6 shadow-card md:p-8">
              <div className="mb-6 flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft">
                  <LockClockIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                </span>
                <div>
                  <h2 className="text-lg leading-tight font-bold text-charcoal">Check your email</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-charcoal-faint">
                    <MailOutlineIcon sx={{ fontSize: 14 }} />
                    We sent a 6-digit code to <strong className="text-charcoal">{otpChallenge?.email}</strong>
                  </p>
                </div>
              </div>

              <div className="mb-1 flex justify-between gap-2" role="group" aria-label="Enter 6-digit code">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      digitRefs.current[i] = el;
                    }}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label={`Digit ${i + 1}`}
                    className="h-14 w-full rounded-xl border border-line bg-white text-center text-2xl font-extrabold text-charcoal outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                ))}
              </div>

              <div className="mt-2 mb-4 flex min-h-5 items-center justify-between text-xs">
                {expiresIn > 0 ? (
                  <span className="text-charcoal-faint">
                    Code expires in{' '}
                    <span className="font-bold text-primary">
                      {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}
                    </span>
                  </span>
                ) : (
                  <span className="font-semibold text-amber-600">This code has expired — request a new one.</span>
                )}
                {resendIn > 0 ? (
                  <span className="text-charcoal-faint">
                    Resend available in <span className="font-bold text-charcoal">{resendIn}s</span>
                  </span>
                ) : (
                  <span />
                )}
              </div>

              {otpError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{otpError}</Alert>}

              <Button
                type="button"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={otpValue.length !== OTP_LENGTH || otpVerifying}
                onClick={handleVerifyOtp}
                endIcon={otpVerifying ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
                sx={{ mt: 1, borderRadius: '10px' }}
              >
                {otpVerifying ? 'Verifying…' : 'Verify & Sign In'}
              </Button>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => resetOtp()}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-charcoal-faint transition-colors hover:bg-bgsoft hover:text-charcoal"
                >
                  <ArrowBackIcon sx={{ fontSize: 16 }} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendIn > 0 || otpVerifying}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:text-charcoal-faint/50"
                >
                  <RefreshIcon sx={{ fontSize: 16 }} />
                  Resend code
                </button>
              </div>

              <div className="mt-5 rounded-xl bg-primary-soft/60 px-4 py-3 text-xs leading-relaxed text-primary/90">
                For your safety, never share this code with anyone — our team will never ask for it.
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

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