import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  InputAdornment,
} from '@mui/material'
import {
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  Domain as DomainIcon,
  ContactMail as ContactMailIcon,
  Tune as TuneIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  VerifiedUser as VerifiedUserIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon,
  Info as InfoIcon,
  CheckCircleOutlineOutlined as CheckCircleOutlineIcon,
} from '@mui/icons-material'

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px' },
  '& .MuiInputLabel-root': { fontSize: 14.5 },
}

const fieldSx = (extra = {}) => ({ ...inputSx, ...extra })

const Steps = [
  {
    label: 'Institution',
    sub: 'Profile & regional defaults',
    icon: DomainIcon,
  },
  { label: 'Contacts', sub: 'Primary contacts', icon: ContactMailIcon },
  { label: 'Scope', sub: 'Faculties, seats, modules', icon: TuneIcon },
  { label: 'Plan', sub: 'Tier & add-ons', icon: WorkspacePremiumIcon },
  { label: 'Compliance', sub: 'DPO & policies', icon: VerifiedUserIcon },
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

const Faculties = [
  'Agricultural Sciences',
  'Arts & Humanities',
  'Basic Medical Sciences',
  'Clinical Sciences',
  'Computing & IT',
  'Education',
  'Engineering',
  'Environmental Sciences',
  'Law',
  'Management Sciences',
  'Pharmaceutical Sciences',
  'Physical & Life Sciences',
  'Social Sciences',
  'Veterinary Medicine',
  'Allied Health Sciences',
  'Communication & Media',
]

const Modules = [
  'Pathways & Curriculum Engine',
  'Assessments & Skills Diagnostics',
  'Counselling & Case Management',
  'SIWES / ITF Placement Tracking',
  'Employer Pipeline & Match',
  'Analytics & Institutional Reporting',
  'Institution-Grounded AI Assistant',
]

const Tiers = [
  {
    key: 'foundation',
    name: 'Foundation',
    desc: 'Colleges of education & specialist institutions',
    features: [
      'Sponsored onboarding',
      'Up to 2,500 student seats',
      'Core assessments & pathways',
      'Standard support SLA',
    ],
  },
  {
    key: 'standard',
    name: 'Standard',
    badge: 'Most common',
    desc: 'State universities, polytechnics & private institutions',
    features: [
      'Sponsored onboarding',
      'Up to 8,000 student seats',
      'All modules + analytics',
      'Priority support & training',
    ],
  },
  {
    key: 'flagship',
    name: 'Flagship',
    desc: 'Federal universities & flagship institutions',
    features: [
      'Sponsored onboarding',
      'Unlimited seats',
      'SSO/SAML, custom SLA',
      'Dedicated success manager',
    ],
  },
]

const Addons = [
  'SSO / SAML Single Sign-On',
  'API & Data Export Access',
  'Advanced Analytics Studio',
  'Branded Student Portal',
  'Bulk Data Migration',
  'Dedicated Training Workshops',
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
  faculties: [],
  counsellorSeats: '',
  studentSeats: '',
  modules: Modules,
  tier: 'standard',
  addons: [],
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
    if (!form.website) e.website = true
    else if (!/^https?:\/\/.+/.test(form.website)) e.website = true
    if (!form.yearFounded) e.yearFounded = true
    if (!form.population) e.population = true
  }
  if (step === 1) {
    if (!form.contactName) e.contactName = true
    if (!form.role) e.role = true
    if (!form.contactEmail) e.contactEmail = true
    else if (!/^\S+@\S+\.\S+$/.test(form.contactEmail)) e.contactEmail = true
    if (!form.mobile) e.mobile = true
  }
  if (step === 2) {
    if (!form.counsellorSeats) e.counsellorSeats = true
    if (!form.studentSeats) e.studentSeats = true
  }
  if (step === 4) {
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
      <img src="/logo.png" alt="Edusal Consult" className="h-9 w-auto" />
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
              <div className="flex w-20 flex-col items-center text-center">
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

function ChipSelect({ label, items, selected, onToggle, required }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-charcoal">
        {label} {required && <span className="text-primary">*</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const on = selected.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                on
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line bg-white text-charcoal-soft hover:border-primary/40'
              }`}
            >
              {on && <CheckIcon sx={{ fontSize: 15 }} />}
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function InstitutionRegister() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggleItem = (k) => (item) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(item)
        ? f[k].filter((x) => x !== item)
        : [...f[k], item],
    }))

  const next = () => {
    const e = validate(step, form)
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setStep((s) => Math.min(s + 1, Steps.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = () => {
    const e = validate(4, form)
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setSubmitted(true)
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
            Bring your institution onto Edusal Consult
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-charcoal-soft">
            Tell us about your campus, pick your plan, and sign off on NDPR —
            we'll provision a tenant and schedule the kickoff call within one
            business day.
          </p>
        </div>

        {submitted ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-line bg-white p-10 text-center shadow-card-md">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
              <CheckCircleIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            </span>
            <h2 className="mt-6 text-2xl text-charcoal">
              Onboarding request received
            </h2>
            <p className="mx-auto mt-3 max-w-md text-charcoal-soft">
              Thank you. <strong>{form.legalName}</strong> is queued on the{' '}
              <strong>{form.tier}</strong> tier. Our onboarding team will
              contact {form.contactName} at {form.contactEmail} within one
              business day to schedule your kickoff call.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[form.legalName, form.tier, form.state].filter(Boolean).map((t) => (
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
                component={Link}
                to="/portal/login"
                endIcon={<ArrowForwardIcon />}
              >
                Go to Sign In
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={Link}
                to="/"
                sx={{ color: 'text.primary', borderColor: 'border.strong' }}
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
                  <p className="text-sm text-charcoal-faint">
                    We use this to provision your tenant and configure regional
                    defaults. We support NUC universities (federal, state,
                    private), NBTE polytechnics, NCCE colleges of education, and
                    other tertiary institutions.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <TextField
                        label="Legal name *"
                        size="medium"
                        fullWidth
                        value={form.legalName}
                        onChange={update('legalName')}
                        placeholder="e.g. University of Ilorin"
                        sx={fieldSx({ mt: 0 })}
                        error={!!errors.legalName}
                      />
                      <FieldError
                        error={errors.legalName}
                        message="Enter the institution's legal name"
                      />
                    </div>
                    <TextField
                      label="Short name *"
                      size="medium"
                      fullWidth
                      value={form.shortName}
                      onChange={update('shortName')}
                      placeholder="UNILORIN"
                      sx={fieldSx()}
                      error={!!errors.shortName}
                    />
                    <FormControl fullWidth>
                      <InputLabel id="itype">Institution type *</InputLabel>
                      <Select
                        labelId="itype"
                        label="Institution type *"
                        size="medium"
                        value={form.type}
                        onChange={update('type')}
                        sx={{
                          borderRadius: '10px',
                          '& .MuiSelect-select': { py: 1.45 },
                        }}
                      >
                        {InstitutionTypes.map((o) => (
                          <MenuItem key={o} value={o}>
                            {o}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel id="istate">State *</InputLabel>
                      <Select
                        labelId="istate"
                        label="State *"
                        size="medium"
                        value={form.state}
                        onChange={update('state')}
                        sx={{
                          borderRadius: '10px',
                          '& .MuiSelect-select': { py: 1.45 },
                        }}
                      >
                        {NigerianStates.map((o) => (
                          <MenuItem key={o} value={o}>
                            {o}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <div>
                      <TextField
                        label="City / Town *"
                        size="medium"
                        fullWidth
                        value={form.city}
                        onChange={update('city')}
                        placeholder="Ilorin"
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
                        label="Institution website *"
                        size="medium"
                        fullWidth
                        type="url"
                        value={form.website}
                        onChange={update('website')}
                        placeholder="https://unilorin.edu.ng"
                        sx={fieldSx()}
                        error={!!errors.website}
                      />
                      <FieldError
                        error={errors.website}
                        message="Enter a valid URL (e.g. https://unilorin.edu.ng)"
                      />
                    </div>
                    <div>
                      <TextField
                        label="Year founded *"
                        size="medium"
                        fullWidth
                        value={form.yearFounded}
                        onChange={update('yearFounded')}
                        placeholder="1975"
                        sx={fieldSx()}
                        error={!!errors.yearFounded}
                      />
                      <FieldError
                        error={errors.yearFounded}
                        message="Year is required"
                      />
                    </div>
                    <div>
                      <TextField
                        label="Current student population *"
                        size="medium"
                        fullWidth
                        type="number"
                        value={form.population}
                        onChange={update('population')}
                        placeholder="5000"
                        sx={fieldSx()}
                        error={!!errors.population}
                        helperText="Total enrolled across all levels"
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
                            (optional) — only applicable to government-owned
                            institutions. It unlocks regulator-aligned reporting
                            templates but is not required.
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
                    Primary contacts
                  </h2>
                  <p className="mt-1 text-sm text-charcoal-faint">
                    Who should our onboarding team coordinate with during
                    kickoff and rollout?
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <TextField
                        label="Primary contact name *"
                        size="medium"
                        fullWidth
                        value={form.contactName}
                        onChange={update('contactName')}
                        placeholder="Prof. Tunde Akande"
                        sx={fieldSx()}
                        error={!!errors.contactName}
                      />
                    </div>
                    <div>
                      <TextField
                        label="Role / Title *"
                        size="medium"
                        fullWidth
                        value={form.role}
                        onChange={update('role')}
                        placeholder="Director, Career Services"
                        sx={fieldSx()}
                        error={!!errors.role}
                      />
                    </div>
                    <div>
                      <TextField
                        label="Work email *"
                        size="medium"
                        fullWidth
                        type="email"
                        value={form.contactEmail}
                        onChange={update('contactEmail')}
                        placeholder="careers@unilorin.edu.ng"
                        sx={fieldSx()}
                        error={!!errors.contactEmail}
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
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-xl text-charcoal">Deployment scope</h2>
                  <p className="mt-1 text-sm text-charcoal-faint">
                    Shape the rollout — faculties in scope, seat counts, and
                    which modules go live on day one.
                  </p>

                  <div className="mt-6">
                    <ChipSelect
                      label="Faculties in scope"
                      items={Faculties}
                      selected={form.faculties}
                      onToggle={toggleItem('faculties')}
                    />
                    <p className="mt-1.5 text-xs text-charcoal-faint">
                      Pick every faculty that will use Edusal Consult at launch.
                      You can add more after go-live.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <TextField
                        label="Counsellor seats *"
                        size="medium"
                        fullWidth
                        type="number"
                        value={form.counsellorSeats}
                        onChange={update('counsellorSeats')}
                        placeholder="10"
                        sx={fieldSx()}
                        error={!!errors.counsellorSeats}
                        helperText="1 – 200 seats"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ContactMailIcon
                                sx={{ fontSize: 18, color: 'charcoal.faint' }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                    <div>
                      <TextField
                        label="Student seats *"
                        size="medium"
                        fullWidth
                        type="number"
                        value={form.studentSeats}
                        onChange={update('studentSeats')}
                        placeholder="5000"
                        sx={fieldSx()}
                        error={!!errors.studentSeats}
                        helperText="100 – 100,000 seats"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SchoolIcon
                                sx={{ fontSize: 18, color: 'charcoal.faint' }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <ChipSelect
                      label="Enabled modules"
                      items={Modules}
                      selected={form.modules}
                      onToggle={toggleItem('modules')}
                    />
                    <p className="mt-1.5 text-xs text-charcoal-faint">
                      All modules are recommended for first-year rollouts.
                      Disable any you want to stage for phase two.
                    </p>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-xl text-charcoal">Choose a tier</h2>
                  <p className="mt-1 text-sm text-charcoal-faint">
                    Pick the tier that best reflects your institution size —
                    we'll tailor modules and counsellor seats during kickoff.
                  </p>

                  <div className="mt-4 rounded-2xl bg-primary-faint px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-primary">
                      <VerifiedIcon sx={{ fontSize: 18 }} />
                      Sponsored onboarding
                    </p>
                    <p className="mt-1 text-sm text-charcoal-soft">
                      Onboarding is sponsored for eligible institutions — there
                      is no per-institution charge to your institution.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {Tiers.map((t) => {
                      const on = form.tier === t.key
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setForm({ ...form, tier: t.key })}
                          className={`relative flex flex-col rounded-2xl border-2 p-5 text-left transition-colors ${
                            on
                              ? 'border-primary bg-primary-faint'
                              : 'border-line bg-white hover:border-primary/40'
                          }`}
                        >
                          {t.badge && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold text-white">
                              {t.badge}
                            </span>
                          )}
                          <span className="flex items-center gap-2">
                            <span
                              className={`h-4 w-4 rounded-full border-2 ${
                                on
                                  ? 'border-primary bg-primary'
                                  : 'border-line-strong'
                              }`}
                            />
                            <span className="text-lg font-bold text-charcoal">
                              {t.name}
                            </span>
                          </span>
                          <span className="mt-1.5 text-sm text-charcoal-faint">
                            {t.desc}
                          </span>
                          <ul className="mt-4 space-y-2">
                            {t.features.map((f) => (
                              <li
                                key={f}
                                className="flex items-center gap-2 text-sm text-charcoal-soft"
                              >
                                <CheckCircleOutlineIcon
                                  sx={{ fontSize: 16, color: 'primary.main' }}
                                />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-7">
                    <ChipSelect
                      label="Add-ons (optional)"
                      items={Addons}
                      selected={form.addons}
                      onToggle={toggleItem('addons')}
                    />
                    <p className="mt-1.5 text-xs text-charcoal-faint">
                      Optional modules that can be enabled now or during the
                      pilot review.
                    </p>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="text-xl text-charcoal">
                    Compliance & data protection
                  </h2>
                  <p className="mt-1 text-sm text-charcoal-faint">
                    Confirm your Data Protection Officer and accept the policies
                    that govern tenant data.
                  </p>

                  <div className="mt-5 rounded-2xl border border-line bg-bgsoft p-5">
                    <p className="flex items-center gap-2 text-sm font-bold text-charcoal">
                      <InfoIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      How Edusal Consult handles institution data
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
                      We operate as a processor under the Nigeria Data Protection
                      Regulation (NDPR) and the Data Protection Act 2023. Student
                      and staff records are stored in Nigerian-region
                      infrastructure with AES-256 at rest and TLS 1.3 in transit.
                      Access is role-based and every read/write is logged to an
                      immutable audit trail.
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
                      Your institution retains ownership of all data. On request,
                      we return a structured export and perform a certified wipe
                      within 30 days. Our DPIA, SOC 2 attestation, and
                      sub-processor list are shared during onboarding review.
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
                        placeholder="dpo@unilorin.edu.ng"
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
                              Edusal Consult institutional terms
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

              {step === 4 && (errors.acceptMsa || errors.acceptNdpr) && (
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
                >
                  Next: {Steps[step + 1].label}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={submit}
                  endIcon={<VerifiedIcon />}
                >
                  Submit Onboarding Request
                </Button>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-line bg-white py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-5 text-sm text-charcoal-faint sm:flex-row sm:px-8">
          <p>© 2026 Edusal Consult. All rights reserved.</p>
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