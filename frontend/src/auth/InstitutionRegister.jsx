import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { institutionApi } from '../services/institutionApi'
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  Domain as DomainIcon,
  ContactMail as ContactMailIcon,
  VerifiedUser as VerifiedUserIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon,
  Info as InfoIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material'

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px' },
  '& .MuiInputLabel-root': { fontSize: 14.5 },
}

const fieldSx = (extra = {}) => ({ ...inputSx, ...extra })

const Steps = [
  {
    label: 'Institution',
    sub: 'Campus profile & location',
    icon: DomainIcon,
  },
  {
    label: 'Administrator',
    sub: 'Primary contact & login credentials',
    icon: ContactMailIcon,
  },
  {
    label: 'Compliance',
    sub: 'NDPR & statutory sign-off',
    icon: VerifiedUserIcon,
  },
]

const NigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

const InstitutionTypes = [
  'Federal University',
  'State University',
  'Private University',
  'Polytechnic',
  'Monotechnic',
  'College of Education',
  'Other Tertiary Institution',
]

const initialForm = {
  legalName: '',
  shortName: '',
  type: '',
  state: '',
  city: '',
  website: '',
  yearFounded: '',
  population: '',
  publiclyFunded: false,
  contactName: '',
  role: '',
  contactEmail: '',
  mobile: '',
  password: '',
  dpoName: '',
  dpoEmail: '',
  acceptMsa: false,
  acceptNdpr: false,
}

const validate = (step, form) => {
  const e = {}
  if (step === 0) {
    if (!form.legalName) e.legalName = true
    if (!form.shortName) e.shortName = true
    if (!form.type) e.type = true
    if (!form.state) e.state = true
    if (!form.city) e.city = true
  }
  if (step === 1) {
    if (!form.contactName) e.contactName = true
    if (!form.role) e.role = true
    if (!form.contactEmail) e.contactEmail = true
    else if (!/^\S+@\S+\.\S+$/.test(form.contactEmail)) e.contactEmail = true
    if (!form.mobile) e.mobile = true
    if (!form.password) e.password = true
    else if (form.password.length < 6) e.password = true
  }
  if (step === 2) {
    if (!form.dpoName) e.dpoName = true
    if (!form.dpoEmail) e.dpoEmail = true
    else if (!/^\S+@\S+\.\S+$/.test(form.dpoEmail)) e.dpoEmail = true
    if (!form.acceptMsa) e.acceptMsa = true
    if (!form.acceptNdpr) e.acceptNdpr = true
  }
  return e
}

function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <img src="/logo.png" alt="Nexus Edutech Consult Ltd" className="h-9 w-auto" />
    </Link>
  )
}

function FieldError({ error, message }) {
  if (!error) return null
  return <p className="mt-1 text-xs font-semibold text-red-600">{message}</p>
}

function StepIndicator({ current }) {
  return (
    <div className="mb-7">
      <div className="hidden items-start md:flex">
        {Steps.map((s, i) => {
          const done = i < current
          const active = i === current
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-1 items-start">
              <div className="flex w-24 flex-col items-center text-center">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : done
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-line-strong bg-white text-charcoal-faint'
                  }`}
                >
                  {done ? (
                    <CheckIcon sx={{ fontSize: 18 }} />
                  ) : active ? (
                    <Icon sx={{ fontSize: 18 }} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`mt-2 text-xs font-bold ${
                    active || done ? 'text-primary' : 'text-charcoal-faint'
                  }`}
                >
                  {s.label}
                </span>
                <span className="text-[11px] leading-tight text-charcoal-faint">
                  {s.sub}
                </span>
              </div>
              {i < Steps.length - 1 && (
                <div
                  className={`mt-5 h-0.5 flex-1 rounded ${
                    i < current ? 'bg-primary' : 'bg-line-strong'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="md:hidden">
        <span className="text-sm font-bold text-charcoal">
          Step {current + 1} of {Steps.length} · {Steps[current].label}
        </span>
        <span className="ml-2 text-sm text-charcoal-faint">
          {Math.round(((current + 1) / Steps.length) * 100)}% complete
        </span>
      </div>
    </div>
  )
}

function ProgressCard({ current }) {
  const pct = Math.round(((current + 1) / Steps.length) * 100)
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-6 py-4 shadow-card">
      <div>
        <p className="text-sm font-bold text-charcoal">
          Step {current + 1} of {Steps.length} — {Steps[current].label}
        </p>
        <p className="text-xs text-charcoal-faint">{Steps[current].sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-primary">{pct}% complete</span>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            width: 120,
            height: 8,
            borderRadius: 99,
            bgcolor: 'primary.soft',
            '& .MuiLinearProgress-bar': {
              borderRadius: 99,
              bgcolor: 'primary.main',
            },
          }}
        />
      </div>
    </div>
  )
}

function InstitutionRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [registrationData, setRegistrationData] = useState(null)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const next = () => {
    const e = validate(step, form)
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setStep((s) => Math.min(s + 1, Steps.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async () => {
    const e = validate(2, form)
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const typeStr = form.type || 'Federal University'
      let instType = 'UNIVERSITY'
      let regulator = 'NUC'
      if (typeStr.includes('Polytechnic')) {
        instType = 'POLYTECHNIC'
        regulator = 'NBTE'
      } else if (typeStr.includes('College of Education')) {
        instType = 'COLLEGE_OF_EDUCATION'
        regulator = 'NCCE'
      } else if (typeStr.includes('Monotechnic')) {
        instType = 'MONOTECHNIC'
        regulator = 'NBTE'
      }

      const payload = {
        legal_name: form.legalName.trim(),
        short_name: form.shortName.trim(),
        institution_type: instType,
        ownership: form.publiclyFunded ? 'FEDERAL' : typeStr.includes('State') ? 'STATE' : 'PRIVATE',
        regulator: regulator,
        state: form.state || 'Niger',
        city: form.city || '',
        address: form.city ? `${form.city}, ${form.state}` : '',
        website: form.website || '',
        contact_name: form.contactName.trim(),
        contact_email: form.contactEmail.trim().toLowerCase(),
        contact_phone: form.mobile.trim(),
        designation: form.role.trim() || 'Director of Career Services',
        password: form.password,
        dpo_name: form.dpoName || '',
        dpo_email: form.dpoEmail || '',
      }

      const response = await institutionApi.registerInstitution(payload)
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('institution_user', JSON.stringify(response.user))
      setRegistrationData(response)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please verify your details.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bgsoft">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link
            to="/portal/login"
            className="text-sm font-semibold text-charcoal-faint hover:text-primary"
          >
            Sign in instead
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 md:py-14">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Institutional Onboarding
          </p>
          <h1 className="mt-3 text-3xl leading-tight text-charcoal md:text-4xl">
            Bring your institution onto Nexus Edutech Consult Ltd
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-charcoal-soft">
            Register your campus tenant to provision your institution and generate your official pro-forma invoice.
          </p>
        </div>

        {submitError && (
          <div className="mx-auto mt-6 max-w-2xl">
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {submitError}
            </Alert>
          </div>
        )}

        {submitted ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-line bg-white p-8 sm:p-10 text-center shadow-card-md">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <CheckCircleIcon sx={{ fontSize: 40 }} />
            </span>
            <h2 className="mt-6 text-2xl text-charcoal font-bold">
              Campus Tenant Provisioned & Invoice Generated!
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-charcoal-soft leading-relaxed">
              <strong>{registrationData?.institution?.name || form.legalName}</strong> has been successfully registered. An official pro-forma invoice with 7.5% VAT has been generated for your account.
            </p>

            {registrationData?.invoice && (
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary-faint/60 p-4 text-left">
                <div className="flex items-center justify-between border-b border-primary/10 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Invoice Reference
                  </span>
                  <span className="font-mono text-sm font-extrabold text-charcoal">
                    {registrationData.invoice.invoice_number}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs text-charcoal-soft">
                  <span>Subtotal + Setup (Taxable):</span>
                  <span className="font-semibold text-charcoal">
                    ₦{(Number(registrationData.invoice.subtotal_amount) + Number(registrationData.invoice.setup_fee)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-charcoal-soft">
                  <span>VAT (7.5% Exclusive):</span>
                  <span className="font-semibold text-charcoal">
                    ₦{Number(registrationData.invoice.vat_amount || 123750).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-2.5 border-t border-primary/10 pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Total Amount Due:
                  </span>
                  <span className="font-bold text-base text-primary">
                    ₦{Number(registrationData.invoice.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[form.legalName, form.state].filter(Boolean).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/portal/institution"
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 4 }}
              >
                Proceed to Invoice & Bank Transfer Payment →
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={Link}
                to="/"
                sx={{ color: 'text.primary', borderColor: 'border.strong', borderRadius: '10px' }}
              >
                Back to Home
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-10">
              <StepIndicator current={step} />
              <ProgressCard current={step} />
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-card md:p-8">
              {step === 0 && (
                <>
                  <h2 className="text-xl text-charcoal">Institution profile</h2>
                  <p className="mt-1 text-sm text-charcoal-faint">
                    Provide the official legal name and location of your campus.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <TextField
                        label="Institution legal name *"
                        size="medium"
                        fullWidth
                        value={form.legalName}
                        onChange={update('legalName')}
                        placeholder="Federal University of Technology, Minna"
                        sx={fieldSx()}
                        error={!!errors.legalName}
                      />
                      <FieldError
                        error={errors.legalName}
                        message="Legal name is required"
                      />
                    </div>
                    <div>
                      <TextField
                        label="Short name / Acronym *"
                        size="medium"
                        fullWidth
                        value={form.shortName}
                        onChange={update('shortName')}
                        placeholder="FUTMinna"
                        sx={fieldSx()}
                        error={!!errors.shortName}
                      />
                      <FieldError
                        error={errors.shortName}
                        message="Short name is required"
                      />
                    </div>
                    <div>
                      <FormControl fullWidth size="medium" sx={fieldSx()} error={!!errors.type}>
                        <InputLabel>Institution type *</InputLabel>
                        <Select
                          value={form.type}
                          label="Institution type *"
                          onChange={update('type')}
                          sx={{ borderRadius: '10px' }}
                        >
                          {InstitutionTypes.map((t) => (
                            <MenuItem key={t} value={t}>
                              {t}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FieldError
                        error={errors.type}
                        message="Institution type is required"
                      />
                    </div>
                    <div>
                      <FormControl fullWidth size="medium" sx={fieldSx()} error={!!errors.state}>
                        <InputLabel>State (Location) *</InputLabel>
                        <Select
                          value={form.state}
                          label="State (Location) *"
                          onChange={update('state')}
                          sx={{ borderRadius: '10px' }}
                        >
                          {NigerianStates.map((o) => (
                            <MenuItem key={o} value={o}>
                              {o}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FieldError
                        error={errors.state}
                        message="State is required"
                      />
                    </div>
                    <div>
                      <TextField
                        label="City / Town *"
                        size="medium"
                        fullWidth
                        value={form.city}
                        onChange={update('city')}
                        placeholder="Minna"
                        sx={fieldSx()}
                        error={!!errors.city}
                      />
                      <FieldError
                        error={errors.city}
                        message="City is required"
                      />
                    </div>
                    <div>
                      <TextField
                        label="Institution website"
                        size="medium"
                        fullWidth
                        type="url"
                        value={form.website}
                        onChange={update('website')}
                        placeholder="https://futminna.edu.ng"
                        sx={fieldSx()}
                      />
                    </div>
                    <div>
                      <TextField
                        label="Year founded (optional)"
                        size="medium"
                        fullWidth
                        value={form.yearFounded}
                        onChange={update('yearFounded')}
                        placeholder="1983"
                        sx={fieldSx()}
                      />
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-bgsoft px-5 py-4">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.publiclyFunded}
                          onChange={(e) =>
                            setForm({ ...form, publiclyFunded: e.target.checked })
                          }
                          sx={{ color: 'primary.main' }}
                        />
                      }
                      label={
                        <span className="text-sm">
                          <strong className="text-charcoal">
                            This institution is publicly funded
                          </strong>{' '}
                          <span className="text-charcoal-faint">
                            (Government / Federal / State funded)
                          </span>
                        </span>
                      }
                    />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="text-xl text-charcoal">
                    Institutional Administrator & Contacts
                  </h2>
                  <p className="mt-1 text-sm text-charcoal-faint">
                    Set up your primary administrator credentials for accessing the governance workspace.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <TextField
                        label="Primary contact / Admin name *"
                        size="medium"
                        fullWidth
                        value={form.contactName}
                        onChange={update('contactName')}
                        placeholder="Prof. Mohammed Bashir"
                        sx={fieldSx()}
                        error={!!errors.contactName}
                      />
                      <FieldError
                        error={errors.contactName}
                        message="Contact name is required"
                      />
                    </div>
                    <div>
                      <TextField
                        label="Designation / Official Title *"
                        size="medium"
                        fullWidth
                        value={form.role}
                        onChange={update('role')}
                        placeholder="Vice Chancellor / Director Career Services"
                        sx={fieldSx()}
                        error={!!errors.role}
                      />
                      <FieldError
                        error={errors.role}
                        message="Title is required"
                      />
                    </div>
                    <div>
                      <TextField
                        label="Official Work Email *"
                        size="medium"
                        fullWidth
                        type="email"
                        value={form.contactEmail}
                        onChange={update('contactEmail')}
                        placeholder="admin@futminna.edu.ng"
                        sx={fieldSx()}
                        error={!!errors.contactEmail}
                      />
                      <FieldError
                        error={errors.contactEmail}
                        message="Valid work email is required"
                      />
                    </div>
                    <div>
                      <TextField
                        label="Mobile number *"
                        size="medium"
                        fullWidth
                        value={form.mobile}
                        onChange={update('mobile')}
                        placeholder="+234 803 123 4567"
                        sx={fieldSx()}
                        error={!!errors.mobile}
                        helperText="Nigerian format, e.g. +234 803 123 4567"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <TextField
                        label="Admin Account Password *"
                        type="password"
                        size="medium"
                        fullWidth
                        value={form.password}
                        onChange={update('password')}
                        placeholder="Create a secure password (min. 6 characters)"
                        sx={fieldSx()}
                        error={!!errors.password}
                        helperText={errors.password ? "Password must be at least 6 characters" : "This password will be used to log into your institutional governance portal"}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-xl text-charcoal">
                    Compliance & Statutory Sign-off
                  </h2>
                  <p className="mt-1 text-sm text-charcoal-faint">
                    Confirm your Data Protection Officer and accept the policies governing institutional tenant data.
                  </p>

                  <div className="mt-5 rounded-2xl border border-line bg-bgsoft p-5">
                    <p className="flex items-center gap-2 text-sm font-bold text-charcoal">
                      <InfoIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      How Nexus Edutech Consult Ltd handles institution data
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
                      We operate as a processor under the Nigeria Data Protection
                      Regulation (NDPR) and the Data Protection Act 2023. Student
                      and staff records are stored in Nigerian-region
                      infrastructure with AES-256 at rest and TLS 1.3 in transit.
                      Access is role-based and every read/write is logged to an
                      immutable audit trail.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <TextField
                        label="Data Protection Officer name *"
                        size="medium"
                        fullWidth
                        value={form.dpoName}
                        onChange={update('dpoName')}
                        placeholder="Mrs. Chioma Eze"
                        sx={fieldSx()}
                        error={!!errors.dpoName}
                        helperText="Enter the DPO's full name"
                      />
                    </div>
                    <div>
                      <TextField
                        label="DPO email *"
                        size="medium"
                        fullWidth
                        type="email"
                        value={form.dpoEmail}
                        onChange={update('dpoEmail')}
                        placeholder="dpo@futminna.edu.ng"
                        sx={fieldSx()}
                        error={!!errors.dpoEmail}
                        helperText="Enter a valid DPO email"
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div
                      className={`rounded-2xl border px-5 py-4 ${
                        errors.acceptMsa
                          ? 'border-red-300 bg-red-50'
                          : 'border-line bg-white'
                      }`}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.acceptMsa}
                            onChange={(e) =>
                              setForm({ ...form, acceptMsa: e.target.checked })
                            }
                            sx={{ color: 'primary.main' }}
                          />
                        }
                        label={
                          <span className="text-sm text-charcoal-soft">
                            I accept the{' '}
                            <strong className="text-charcoal">
                              Master Services Agreement
                            </strong>{' '}
                            and the{' '}
                            <strong className="text-charcoal">
                              Nexus Edutech Consult Ltd institutional terms
                            </strong>
                            .
                          </span>
                        }
                      />
                    </div>
                    <div
                      className={`rounded-2xl border px-5 py-4 ${
                        errors.acceptNdpr
                          ? 'border-red-300 bg-red-50'
                          : 'border-line bg-white'
                      }`}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.acceptNdpr}
                            onChange={(e) =>
                              setForm({ ...form, acceptNdpr: e.target.checked })
                            }
                            sx={{ color: 'primary.main' }}
                          />
                        }
                        label={
                          <span className="text-sm text-charcoal-soft">
                            I accept the{' '}
                            <strong className="text-charcoal">
                              NDPR Data Processing Addendum
                            </strong>{' '}
                            and confirm the DPO above is authorised to represent
                            the institution.
                          </span>
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (errors.acceptMsa || errors.acceptNdpr) && (
                <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                  Please accept both agreements to continue.
                </Alert>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                variant="outlined"
                color="inherit"
                onClick={back}
                disabled={step === 0}
                startIcon={<ArrowBackIcon />}
                sx={{ color: 'text.primary', borderColor: 'border.strong' }}
              >
                Back
              </Button>
              {step < Steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={next}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3.5 }}
                >
                  Next: {Steps[step + 1].label}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={submit}
                  disabled={submitting}
                  endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <VerifiedIcon />}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3.5 }}
                >
                  {submitting ? 'Provisioning Tenant…' : 'Submit Registration & Generate Invoice'}
                </Button>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-line bg-white py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-5 text-sm text-charcoal-faint sm:flex-row sm:px-8">
          <p>© 2026 Nexus Edutech Consult Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <LockIcon sx={{ fontSize: 14, color: 'primary.main' }} />
            NDPR-aligned · Nigerian-region data handling
          </p>
        </div>
      </footer>
    </div>
  )
}

export default InstitutionRegister
