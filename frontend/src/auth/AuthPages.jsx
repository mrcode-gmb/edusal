import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material'
import { institutionApi } from '../services/institutionApi'
import {
  Verified as VerifiedIcon,
  LockOutlined as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  SupportAgent as SupportAgentIcon,
  ManageAccounts as ManageAccountsIcon,
  Work as WorkIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px' },
  '& .MuiInputLabel-root': { fontSize: 14.5 },
}

function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center">
      <img
        src={light ? '/logo-white.png' : '/logo.png'}
        alt="Nexus Edutech Consult Ltd"
        className="h-9 w-auto"
      />
    </Link>
  )
}

const TrustPoints = [
  'Grounded on your handbooks & SIWES calendars',
  'Named evaluator sign-offs on every milestone',
  'Auditable evidence behind every score',
]

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-primary p-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-black/10 blur-3xl"
        />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
            Institutional Portal
          </p>
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
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
              Verified Student Record
            </p>
            <p className="mt-3 text-lg font-bold text-white">Chidinma Okafor</p>
            <p className="text-sm text-white/70">
              300L Software Engineering · FUTMinna
            </p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-white/60">Employability Score</p>
                <p className="text-4xl font-extrabold leading-none text-white">
                  87<span className="text-lg text-white/60"> / 100</span>
                </p>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                On track
              </span>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-white/60">
          © 2026 Nexus Edutech Consult Ltd. Career Service Centre Management Platform for
          Nigerian tertiary institutions.
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center bg-bgsoft px-6 py-12">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

function PageHeading({ eyebrow, title, subtitle }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl leading-tight text-charcoal">{title}</h1>
      {subtitle && <p className="mt-2 text-charcoal-soft">{subtitle}</p>}
    </div>
  )
}

/* --------------------------------------------------------------------------
   Login
-------------------------------------------------------------------------- */

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError(true)
      return
    }
    setError(false)
    setSuccess(true)
    setTimeout(() => navigate('/portal/institution/governance-pulse'), 900)
  }

  return (
    <AuthLayout>
      <PageHeading
        eyebrow="Institutional Portal"
        title="Welcome back"
        subtitle="Sign in to access your institution's workspace."
      />

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card md:p-8">
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Signed in successfully — redirecting to your dashboard…
          </Alert>
        )}
        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Please enter your email and password.
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Institutional Email"
            type="email"
            size="medium"
            fullWidth
            value={form.email}
            onChange={update('email')}
            sx={inputSx}
          />
          <TextField
            label="Password"
            type={show ? 'text' : 'password'}
            size="medium"
            fullWidth
            value={form.password}
            onChange={update('password')}
            sx={{ ...inputSx, mt: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={() => setShow((s) => !s)}
                    edge="end"
                  >
                    {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <div className="mt-4 flex items-center justify-between">
            <FormControlLabel
              control={<Checkbox size="small" sx={{ color: 'primary.main' }} />}
              label="Remember me"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: 14 } }}
            />
            <Link
              to="/portal/forgot-password"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 3 }}
          >
            Sign In
          </Button>
        </form>

        <Divider sx={{ my: 4, color: 'charcoal.faint', fontSize: 13 }}>
          New to Nexus Edutech Consult Ltd?
        </Divider>

        <Button
          variant="outlined"
          color="inherit"
          size="large"
          fullWidth
          component={Link}
          to="/portal/register"
          sx={{ color: 'text.primary', borderColor: 'border.strong' }}
        >
          Create an account
        </Button>
      </div>

      <Link
        to="/"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-charcoal-faint hover:text-primary"
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to home
      </Link>
    </AuthLayout>
  )
}

/* --------------------------------------------------------------------------
   Register
-------------------------------------------------------------------------- */

const Roles = [
  { key: 'student', label: 'Student', icon: PersonIcon },
  { key: 'counsellor', label: 'Counsellor', icon: SupportAgentIcon },
  { key: 'institution', label: 'Institution', icon: ManageAccountsIcon },
  { key: 'employer', label: 'Employer', icon: WorkIcon },
]

function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [show, setShow] = useState(false)
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirm || !terms) {
      setError(true)
      return
    }
    if (form.password !== form.confirm) {
      setError(true)
      return
    }
    setError(false)
    setSuccess(true)
    setTimeout(() => navigate('/portal/login'), 1100)
  }

  return (
    <AuthLayout>
      <PageHeading
        eyebrow="Institutional Portal"
        title="Create your account"
        subtitle="Join the Nexus ecosystem with a role-specific workspace."
      />

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card md:p-8">
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Account created — redirecting you to sign in…
          </Alert>
        )}
        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Please complete all fields, match your passwords, and accept the
            terms.
          </Alert>
        )}

        <p className="mb-2.5 text-sm font-semibold text-charcoal-soft">
          I am a…
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Roles.map((r) => {
            const RoleIcon = r.icon
            const selected = role === r.key
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  selected
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line bg-white text-charcoal-soft hover:border-primary/40'
                }`}
              >
                <RoleIcon sx={{ fontSize: 18 }} />
                {r.label}
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-center text-xs text-charcoal-faint">
          Representing a campus?{' '}
          <Link
            to="/portal/register/institution"
            className="font-bold text-primary hover:underline"
          >
            Register your institution
          </Link>
        </p>

        {role === 'institution' ? (
          <div className="mt-4 rounded-2xl border border-primary/30 bg-primary-faint px-6 py-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <VerifiedIcon sx={{ fontSize: 30, color: '#fff' }} />
            </span>
            <h3 className="mt-4 text-lg text-charcoal">
              You're onboarding an institution
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-charcoal-soft">
              Institution registration happens in a dedicated 5-step wizard —
              campus profile, contacts, deployment scope, plan, and NDPR
              compliance.
            </p>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/portal/register/institution"
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 5 }}
            >
              Onboard Your Institution
            </Button>
            <p className="mt-3 text-xs text-charcoal-faint">
              Takes about 3 minutes · No per-institution charge during
              sponsored onboarding
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Full Name"
            size="medium"
            fullWidth
            value={form.name}
            onChange={update('name')}
            sx={{ ...inputSx, mt: 3 }}
          />
          <TextField
            label="Institutional / Work Email"
            type="email"
            size="medium"
            fullWidth
            value={form.email}
            onChange={update('email')}
            sx={{ ...inputSx, mt: 2 }}
          />
          <TextField
            label="Password"
            type={show ? 'text' : 'password'}
            size="medium"
            fullWidth
            value={form.password}
            onChange={update('password')}
            sx={{ ...inputSx, mt: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={() => setShow((s) => !s)}
                    edge="end"
                  >
                    {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm Password"
            type={show ? 'text' : 'password'}
            size="medium"
            fullWidth
            value={form.confirm}
            onChange={update('confirm')}
            sx={{ ...inputSx, mt: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                sx={{ color: 'primary.main' }}
              />
            }
            label="I agree to the Terms of Service and Privacy Policy"
            sx={{ mt: 2.5, '& .MuiFormControlLabel-label': { fontSize: 14 } }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 3 }}
          >
            Create Account
          </Button>
        </form>
        )}

        <p className="mt-5 text-center text-sm text-charcoal-faint">
          Already have an account?{' '}
          <Link
            to="/portal/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

/* --------------------------------------------------------------------------
   Forgot password
-------------------------------------------------------------------------- */

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState('email') // 'email' | 'otp'
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const handleRequest = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your institutional email.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await institutionApi.forgotPassword(email.trim())
      setStage('otp')
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send the reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!code.trim() || !password || !confirm) {
      setError('Code and new password are all required.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await institutionApi.resetPassword(email.trim(), code.trim(), password)
      setDone(true)
      setTimeout(() => navigate('/portal/login'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not verify the code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <PageHeading
        eyebrow="Institutional Portal"
        title={stage === 'otp' ? 'Enter your reset code' : 'Reset your password'}
        subtitle={
          stage === 'otp'
            ? `We emailed a 6-digit code to ${email}. Enter it below with your new password.`
            : "Enter the institutional email associated with your account and we'll email you a secure one-time code."
        }
      />

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card md:p-8">
        {done ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
              <CheckCircleIcon sx={{ fontSize: 30, color: 'primary.main' }} />
            </span>
            <h3 className="mt-5 text-xl text-charcoal">Password updated</h3>
            <p className="mx-auto mt-2 max-w-sm text-charcoal-soft">
              Your password has been changed. Redirecting you to sign in…
            </p>
          </div>
        ) : stage === 'otp' ? (
          <form onSubmit={handleReset} noValidate>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            <TextField
              label="6-digit code"
              size="medium"
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter the code from your email"
              sx={inputSx}
            />
            <TextField
              label="New Password"
              type={show ? 'text' : 'password'}
              size="medium"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ ...inputSx, mt: 2 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="Toggle password visibility" onClick={() => setShow((s) => !s)} edge="end">
                        {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirm New Password"
              type={show ? 'text' : 'password'}
              size="medium"
              fullWidth
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              sx={{ ...inputSx, mt: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
              sx={{ mt: 3 }}
            >
              {loading ? 'Updating…' : 'Update Password'}
            </Button>
            <button
              type="button"
              onClick={() => setStage('email')}
              className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-charcoal-faint hover:text-primary transition-colors"
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to email
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequest} noValidate>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            <TextField
              label="Institutional Email"
              type="email"
              size="medium"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={inputSx}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
              sx={{ mt: 3 }}
            >
              {loading ? 'Sending…' : 'Send Reset Code'}
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-charcoal-faint">
          Remembered it?{' '}
          <Link
            to="/portal/login"
            className="font-semibold text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

/* --------------------------------------------------------------------------
   Reset password
-------------------------------------------------------------------------- */

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !code.trim() || !password || !confirm) {
      setError('Email, code and new password are all required.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await institutionApi.resetPassword(email.trim(), code.trim(), password)
      setDone(true)
      setTimeout(() => navigate('/portal/login'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not verify the code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <PageHeading
        eyebrow="Institutional Portal"
        title="Set a new password"
        subtitle="Enter your email, the 6-digit code we sent you, and your new password."
      />

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card md:p-8">
        {done ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
              <CheckCircleIcon sx={{ fontSize: 30, color: 'primary.main' }} />
            </span>
            <h3 className="mt-5 text-xl text-charcoal">Password updated</h3>
            <p className="mx-auto mt-2 max-w-sm text-charcoal-soft">
              Your password has been changed. Redirecting you to sign in…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            <TextField
              label="Institutional Email"
              type="email"
              size="medium"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={inputSx}
            />
            <TextField
              label="6-digit code"
              size="medium"
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter the code from your email"
              sx={{ ...inputSx, mt: 2 }}
            />
            <TextField
              label="New Password"
              type={show ? 'text' : 'password'}
              size="medium"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ ...inputSx, mt: 2 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="Toggle password visibility" onClick={() => setShow((s) => !s)} edge="end">
                        {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirm New Password"
              type={show ? 'text' : 'password'}
              size="medium"
              fullWidth
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              sx={{ ...inputSx, mt: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
              sx={{ mt: 3 }}
            >
              {loading ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-charcoal-faint">
          Remembered it?{' '}
          <Link
            to="/portal/login"
            className="font-semibold text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage }