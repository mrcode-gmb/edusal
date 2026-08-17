import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import {
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './auth/AuthPages'
import InstitutionRegister from './auth/InstitutionRegister'
import { InstitutionDashboard } from './components/institution/InstitutionDashboard'
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  ShieldOutlined as ShieldIcon,
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowForwardOutlined as ArrowForwardOutlinedIcon,
  AccountBalance as AccountBalanceIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Insights as InsightsIcon,
  FactCheck as FactCheckIcon,
  Gavel as GavelIcon,
  Groups as GroupsIcon,
  Badge as BadgeIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  LockOutlined as LockIcon,
  AccessTime as AccessTimeIcon,
  Route as RouteIcon,
  Leaderboard as LeaderboardIcon,
  SupportAgent as SupportAgentIcon,
  BusinessCenter as BusinessCenterIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  Send as SendIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  GridView as GridViewIcon,
  Domain as DomainIcon,
  Public as PublicIcon,
  HowToReg as HowToRegIcon,
  ListAlt as ListAltIcon,
  PlayCircleOutlineOutlined as PlayCircleOutlineIcon,
  TrendingUp as TrendingUpIcon,
  ManageAccounts as ManageAccountsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

/* --------------------------------------------------------------------------
   Theme
-------------------------------------------------------------------------- */

const theme = createTheme({
  palette: {
    primary: {
      main: '#146B4A',
      dark: '#0F563B',
      light: '#2B7F5D',
      contrastText: '#FFFFFF',
      soft: '#e6f2ec',
      faint: '#f0f7f3',
    },
    secondary: { main: '#1F2933' },
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
    text: { primary: '#1F2933', secondary: '#4B5563' },
    divider: '#E6EBE8',
    success: { main: '#0D8A5F' },
    charcoal: { main: '#1F2933', soft: '#4B5563', faint: '#6B7280' },
    border: { main: '#e6ebe8', strong: '#d3dcd7' },
  },
  typography: {
    fontFamily:
      "'Plus Jakarta Sans', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { paddingInline: 22, paddingBlock: 10, borderRadius: 10 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})

/* --------------------------------------------------------------------------
   Small shared pieces
-------------------------------------------------------------------------- */

function Eyebrow({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
      {children}
    </p>
  )
}

function SectionHead({
  eyebrow,
  title,
  subhead,
  copy,
  align = 'left',
  dark = false,
  wide = false,
}) {
  return (
    <div
      className={`mb-12 md:mb-16 ${align === 'center' ? 'mx-auto text-center' : ''} ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        className={`mt-3 text-3xl leading-tight md:text-[2.6rem] ${dark ? 'text-white' : 'text-charcoal'}`}
      >
        {title}
      </h2>
      {subhead && (
        <p
          className={`mt-3 text-lg font-bold ${dark ? 'text-white/80' : 'text-charcoal-soft'}`}
        >
          {subhead}
        </p>
      )}
      {copy && (
        <p
          className={`mt-4 text-lg leading-relaxed ${dark ? 'text-white/70' : 'text-charcoal-soft'}`}
        >
          {copy}
        </p>
      )}
    </div>
  )
}

function Card({ children, className = '', ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-paper p-6 shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

function GreenCheck() {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft">
      <CheckIcon sx={{ fontSize: 15, color: 'primary.main' }} />
    </span>
  )
}

const NavLinks = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Workspaces', href: '#workspaces' },
  { label: 'AI Assistant', href: '#assistant' },
  { label: 'Governance', href: '#governance' },
  { label: 'Founding Partners', href: '#partners' },
]

/* --------------------------------------------------------------------------
   Navigation
-------------------------------------------------------------------------- */

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all ${
        scrolled
          ? 'border-line bg-white/85 shadow-card backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-5 sm:px-8 md:h-[72px] lg:px-10">
        <Link to="/" className="flex shrink-0 items-center">
          <img src="/logo.png" alt="Edusal Consult" className="h-9 w-auto" />
        </Link>

        <nav className="mx-auto hidden items-center gap-9 xl:flex">
          {NavLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13.5px] font-semibold whitespace-nowrap text-charcoal-soft transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 xl:flex">
          <Button
            variant="text"
            color="inherit"
            component={Link}
            to="/portal/login"
            sx={{ color: 'text.primary', whiteSpace: 'nowrap', px: 1.5 }}
          >
            Institutional Portal
          </Button>
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            href="#walkthrough"
            sx={{ whiteSpace: 'nowrap' }}
          >
            Book Walkthrough
          </Button>
        </div>

        <IconButton
          className="ml-auto xl:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      </div>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <div className="mb-2 flex items-center justify-between">
            <img src="/logo.png" alt="Edusal Consult" className="h-8 w-auto" />
            <IconButton aria-label="Close menu" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <List>
            {NavLinks.map((l) => (
              <ListItemButton
                key={l.label}
                component="a"
                href={l.href}
                onClick={() => setOpen(false)}
              >
                <ListItemText
                  primary={l.label}
                  slotProps={{
                    primary: { fontWeight: 600, color: 'text.primary' },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
          <Stack direction="column" spacing={1.5} sx={{ mt: 2, px: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              component={Link}
              to="/portal/login"
              onClick={() => setOpen(false)}
              sx={{ color: 'text.primary', borderColor: 'divider' }}
            >
              Institutional Portal
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              component={Link}
              to="/portal/register/institution"
              onClick={() => setOpen(false)}
              sx={{ color: 'primary.main', borderColor: 'primary.main' }}
            >
              Register Your Institution
            </Button>
            <Button
              variant="contained"
              color="primary"
              href="#walkthrough"
              onClick={() => setOpen(false)}
            >
              Book Walkthrough
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </header>
  )
}

/* --------------------------------------------------------------------------
   Hero
-------------------------------------------------------------------------- */

function VerifiedStudentRecord() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-primary-soft/60 blur-2xl" />
      <Card className="relative z-10 !p-0 overflow-hidden shadow-card-md">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-charcoal-soft">
            <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            Verified Student Record
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Audit active
          </span>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-4">
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: 'primary.main',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              CO
            </Avatar>
            <div className="min-w-0">
              <p className="text-lg font-bold text-charcoal">Chidinma Okafor</p>
              <p className="text-sm text-charcoal-faint">
                300L Software Engineering · FUTMinna
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between rounded-xl bg-bgsoft px-5 py-4">
            <div>
              <p className="text-sm text-charcoal-faint">Employability Score</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold leading-none text-primary">
                  87
                </span>
                <span className="mb-1 text-lg font-semibold text-charcoal-faint">
                  / 100
                </span>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
              <TrendingUpIcon sx={{ fontSize: 15 }} /> On track
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-charcoal">
                  Pathway progress
                </span>
                <span className="font-bold text-primary">2 of 3</span>
              </div>
              <LinearProgress
                variant="determinate"
                value={66}
                sx={{
                  mt: 1,
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

            <div className="flex flex-wrap items-center gap-2">
              <Chip
                icon={<CheckIcon />}
                label="Core Python"
                size="small"
                sx={{
                  bgcolor: 'primary.soft',
                  color: 'primary.main',
                  '& .MuiChip-icon': { color: 'primary.main' },
                }}
              />
              <Chip
                icon={<CheckIcon />}
                label="REST APIs"
                size="small"
                sx={{
                  bgcolor: 'primary.soft',
                  color: 'primary.main',
                  '& .MuiChip-icon': { color: 'primary.main' },
                }}
              />
              <Chip
                icon={<VerifiedIcon />}
                label="2 sign-offs"
                size="small"
                variant="outlined"
                sx={{ color: 'primary.main', borderColor: 'primary.main' }}
              />
            </div>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-line pt-5">
            {[
              { t: 'GitHub Capstone · Faculty Supervisor', ok: true },
              { t: 'Deployment verified · Industry Assessor', ok: true },
              { t: 'DB Performance module · 80% complete', ok: false },
            ].map((row) => (
              <div key={row.t} className="flex items-center gap-2.5 text-sm">
                <GreenCheck />
                <span className="text-charcoal-soft">{row.t}</span>
                {!row.ok && (
                  <span className="ml-auto text-xs font-bold text-charcoal-faint">
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function Hero({ onShowScore }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-bgsoft">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary-soft/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-40 h-[420px] w-[420px] rounded-full bg-primary-faint blur-3xl"
      />
      <div className="relative mx-auto grid w-full max-w-[1360px] items-center gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 lg:px-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-4 py-1.5 shadow-card">
            <SchoolIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <span className="text-[13px] font-bold text-charcoal">
              Edusal Consult
            </span>
            <span className="text-[13px] font-medium text-charcoal-faint">
              · For Nigerian Universities, Polytechnics &amp; Colleges
            </span>
          </div>

          <h1 className="mt-7 text-4xl leading-[1.08] md:text-[3.4rem]">
            Every graduate should be able to explain why they're job-ready.
          </h1>
          <p className="mt-2 text-2xl font-bold text-primary md:text-[2.1rem]">
            Not just claim it.
          </p>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal-soft">
            Edusal Consult gives Nigerian universities, polytechnics, and
            colleges of education a career services operating system where
            employability is built, measured, and backed by evidence — not a
            resume line, not a guess.
          </p>

          <div className="mt-10 flex flex-col gap-3.5 md:flex-row md:items-center md:gap-4">
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              href="#walkthrough"
              sx={{
                py: 1.4,
                px: 3,
                fontSize: 15.5,
                boxShadow: '0 10px 24px rgba(20,107,74,0.28)',
                whiteSpace: 'nowrap',
                '@media (max-width: 767px)': { whiteSpace: 'normal' },
              }}
            >
              Book a Scoped Walkthrough
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<InsightsIcon />}
              onClick={onShowScore}
              sx={{
                color: 'text.primary',
                borderColor: 'border.strong',
                bgcolor: 'background.paper',
                py: 1.4,
                px: 3,
                fontSize: 15.5,
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'primary.faint',
                },
                whiteSpace: 'nowrap',
                '@media (max-width: 767px)': { whiteSpace: 'normal' },
              }}
            >
              See How the Employability Score Works
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              'Grounded on your handbooks & SIWES calendars',
              'Named evaluator sign-offs',
            ].map((s) => (
              <span
                key={s}
                className="flex items-center gap-2 text-sm font-medium text-charcoal-soft"
              >
                <VerifiedIcon sx={{ fontSize: 17, color: 'primary.main' }} />
                {s}
              </span>
            ))}
          </div>
        </div>

        <VerifiedStudentRecord />
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Evidence preview
-------------------------------------------------------------------------- */

function Evidence({ onShowScore }) {
  const skills = [
    {
      name: 'Core Python, Data Structures & REST APIs',
      status: 'Signed Off',
      evaluator: 'Faculty Supervisor',
      evidence: 'GitHub Capstone & Lab Assessment',
    },
    {
      name: 'PostgreSQL Vector Search & Celery Workers',
      status: 'Signed Off',
      evaluator: 'Industry Assessor',
      evidence: 'Verified deployment',
    },
    {
      name: 'Enterprise Relational DB Performance Tuning',
      status: '80% Complete',
      evaluator: 'Career Counsellor',
      evidence: 'Pending submission',
      pending: true,
    },
  ]

  return (
    <section id="evidence" className="bg-white py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Verified Evidence"
          title="Evidence, not claims."
          copy="Every employability signal on Edusal is traceable to a milestone, a named evaluator and an evidence artifact — so an institution can explain any score to a board, regulator or employer."
          align="center"
          wide
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-6 py-4">
              <div className="flex items-center gap-2">
                <Avatar
                  sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                >
                  CO
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-charcoal">
                    Chidinma Okafor
                  </p>
                  <p className="text-xs text-charcoal-faint">
                    Verified pathway milestones · 2 of 3 completed
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                <VerifiedIcon sx={{ fontSize: 15 }} /> Verified
              </span>
            </div>

            <div className="divide-y divide-line">
              {skills.map((s) => (
                <div key={s.name} className="px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-charcoal">{s.name}</p>
                    {s.pending ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-bgsoft px-3 py-1 text-xs font-bold text-charcoal-faint">
                        <AccessTimeIcon sx={{ fontSize: 14 }} /> Pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                        <CheckCircleIcon sx={{ fontSize: 14 }} /> Signed Off
                      </span>
                    )}
                  </div>

                  {s.pending && (
                    <LinearProgress
                      variant="determinate"
                      value={80}
                      sx={{
                        mt: 2,
                        height: 6,
                        borderRadius: 99,
                        bgcolor: 'primary.soft',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 99,
                          bgcolor: 'primary.main',
                        },
                      }}
                    />
                  )}

                  <div className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                    <p className="text-charcoal-faint">
                      Evaluator:{' '}
                      <span className="font-medium text-charcoal-soft">
                        {s.evaluator}
                      </span>
                    </p>
                    <p className="text-charcoal-faint">
                      Evidence:{' '}
                      <span className="font-medium text-charcoal-soft">
                        {s.evidence}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-col justify-between gap-6">
            <Card className="bg-bgsoft">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                  <FactCheckIcon sx={{ color: 'primary.main' }} />
                </span>
                <div>
                  <p className="font-bold text-charcoal">
                    Explainable Audit Trail Active
                  </p>
                  <p className="mt-1 text-sm text-charcoal-soft">
                    Each score is backed by a machine-readable trail linking the
                    graduate to the evidence an institution can open, review and
                    forward to an employer.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="flex-1">
              <p className="text-sm font-bold text-charcoal">
                Why this is trustworthy
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  'No self-reported claims',
                  'Sign-offs from named evaluators',
                  'Linked to official SIWES calendars',
                  'Auditable for boards and regulators',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm">
                    <GreenCheck />
                    <span className="text-charcoal-soft">{t}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardOutlinedIcon />}
                sx={{ mt: 5 }}
                onClick={onShowScore}
              >
                Inspect Score Breakdown
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Founding Partner Program
-------------------------------------------------------------------------- */

function FoundingPartners({ onOpen }) {
  return (
    <section id="partners" className="bg-primary py-20 md:py-24">
      <div className="container-edusal">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
            2026 Founding Partner Program
          </p>
          <h2 className="mt-3 text-3xl leading-tight text-white md:text-[2.6rem]">
            Now onboarding founding partner institutions across Nigeria.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
            Early partner universities, polytechnics, and colleges help shape
            pathway templates for their faculties and receive preferred
            onboarding support.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Button
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                ':hover': { bgcolor: '#f0f7f3' },
              }}
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={onOpen}
            >
              Founding Partner Program
            </Button>
            <p className="text-sm text-white/70">
              Limited cohort slots available for Q3/Q4 onboarding
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Nigerian tertiary ecosystem
-------------------------------------------------------------------------- */

const Institutions = [
  { icon: SchoolIcon, title: 'Federal Universities', reg: 'NUC Regulated' },
  { icon: AccountBalanceIcon, title: 'State Universities', reg: 'NUC Regulated' },
  { icon: DomainIcon, title: 'Polytechnics & Monotechnics', reg: 'NBTE Regulated' },
  { icon: SchoolOutlinedIcon, title: 'Colleges of Education', reg: 'NCCE Regulated' },
  { icon: BadgeIcon, title: 'Private Tertiary Institutions', reg: 'Accredited institutions' },
]

function Ecosystem() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Built for the Ecosystem"
          title="Designed specifically for the Nigerian tertiary ecosystem"
          copy="One platform, calibrated to the regulatory reality of every institution type in the country."
          align="center"
          wide
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Institutions.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.title}
                className="transition-shadow hover:shadow-card-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
                  <Icon sx={{ color: 'primary.main' }} />
                </span>
                <p className="mt-4 font-bold text-charcoal">{item.title}</p>
                <Chip
                  label={item.reg}
                  size="small"
                  variant="outlined"
                  sx={{
                    mt: 2,
                    color: 'charcoal.soft',
                    borderColor: 'border.strong',
                  }}
                />
              </Card>
            )
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl bg-primary-faint px-6 py-8 text-center md:flex-row md:px-10 md:text-left">
          <div>
            <h3 className="text-xl text-charcoal md:text-2xl">
              Bring your institution onto Edusal Consult
            </h3>
            <p className="mt-2 max-w-xl text-charcoal-soft">
              Provision a tenant for your campus — pick your plan, scope
              faculties and seats, and sign off on NDPR. We schedule your
              kickoff call within one business day.
            </p>
          </div>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            to="/portal/register/institution"
            endIcon={<ArrowForwardIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Register Your Institution
          </Button>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Governance & Integrity
-------------------------------------------------------------------------- */

const Governance = [
  {
    icon: GavelIcon,
    title: 'Every Placement',
    label: 'Placement Verifiability',
    copy: 'Trace each placement to a specific SIWES cycle or graduate role.',
  },
  {
    icon: VerifiedIcon,
    title: 'Every Skill',
    label: 'Skills Authenticity',
    copy: 'Validate each skill against a milestone and named evaluator.',
  },
  {
    icon: PsychologyIcon,
    title: 'Every AI Answer',
    label: 'Institution-Grounded AI',
    copy: 'Cite each answer to a specific institutional source.',
  },
]

function GovernanceSection() {
  return (
    <section id="governance" className="bg-bgsoft py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Institutional Governance & Integrity"
          title="Built to report outcomes your board can actually verify"
          copy="No synthetic metrics or unprovable percentages. Every data point on Edusal is backed by an auditable chain of evidence."
          align="center"
          wide
        />
        <div className="grid gap-6 md:grid-cols-3">
          {Governance.map((g) => {
            const Icon = g.icon
            return (
              <Card key={g.title} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                  <Icon sx={{ fontSize: 28, color: 'primary.main' }} />
                </span>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-charcoal-faint">
                  {g.title}
                </p>
                <h3 className="mt-1.5 text-xl text-charcoal">{g.label}</h3>
                <p className="mt-2 text-charcoal-soft">{g.copy}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Proof Architecture
-------------------------------------------------------------------------- */

const AuditChain = [
  'Opportunity',
  'Placement',
  'Supervisor',
  'Evidence',
  'Verification',
  'Outcome',
]

const ProofRows = [
  { label: 'Cycle Registry', value: 'SIWES 2026 · Batch #04', ok: true },
  { label: 'National SIWES / ITF Calendar', value: 'Verified window', ok: true },
  { label: 'Employer Attestation', value: 'Signed', ok: true },
  { label: 'Work Log Sign-Off', value: 'Supervisor approved', ok: true },
  { label: 'Institutional Workflow', value: 'Counsellor completed', ok: true },
]

function ProofArchitecture() {
  return (
    <section id="capabilities" className="bg-white py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Proof Architecture"
          title="A placement your board can open and audit"
          subhead="Verifiable Placement Audit"
          copy="Every outcome links back to the same verifiable chain — from the SIWES opportunity to the final institutional verification."
          align="center"
          wide
        />

        <Card className="mx-auto max-w-4xl !p-0 overflow-hidden shadow-card-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-bgsoft px-6 py-4">
            <span className="flex items-center gap-2 text-sm font-bold text-charcoal">
              <ShieldIcon sx={{ color: 'primary.main' }} />
              SIWES 2026 Batch #04 Verification
            </span>
            <Chip
              icon={<VerifiedIcon />}
              label="Fully verified"
              size="small"
              sx={{ bgcolor: 'primary.soft', color: 'primary.main' }}
            />
          </div>

          <div className="divide-y divide-line">
            {ProofRows.map((r) => (
              <div
                key={r.label}
                className="flex items-center gap-3 px-6 py-3.5 text-sm"
              >
                <GreenCheck />
                <span className="font-medium text-charcoal">{r.label}</span>
                <span className="ml-auto text-charcoal-faint">{r.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          {AuditChain.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-lg border border-line-strong bg-bgsoft px-3.5 py-2 text-sm font-semibold text-charcoal-soft">
                {step}
              </span>
              {i < AuditChain.length - 1 && (
                <ArrowForwardOutlinedIcon
                  sx={{ fontSize: 16, color: 'primary.main' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Three core product engines
-------------------------------------------------------------------------- */

const Engines = [
  {
    n: '01',
    icon: RouteIcon,
    title: 'Curriculum & Pathway Engine',
    copy: 'Department-aligned pathway templates built from real graduate outcomes — mapped, sequenced and kept in sync with faculty curriculum.',
  },
  {
    n: '02',
    icon: PsychologyIcon,
    title: 'Grounded Guidance System',
    copy: 'An assistant trained on your handbooks, SIWES calendars and policies. Every answer is cited, and complex judgement goes to a human counsellor.',
  },
  {
    n: '03',
    icon: BusinessCenterIcon,
    title: 'Verified Employer Match',
    copy: 'Employers see validated skills and evidence, not resume claims. Matches are grounded in verified pathway progress and employer briefs.',
  },
]

function EnginesSection() {
  return (
    <section className="bg-bgsoft py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Integrated Operating System"
          title="One student record. Three teams working from it."
          copy="Unifying students, faculty counsellors, institutions and employers on a single verifiable career record."
          align="center"
          wide
        />
        <div className="grid gap-6 md:grid-cols-3">
          {Engines.map((e) => {
            const Icon = e.icon
            return (
              <Card
                key={e.n}
                className="relative overflow-hidden transition-shadow hover:shadow-card-md"
              >
                <span className="absolute right-5 top-4 text-5xl font-extrabold text-bgsoft">
                  {e.n}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
                  <Icon sx={{ color: 'primary.main' }} />
                </span>
                <h3 className="mt-5 text-lg text-charcoal">{e.title}</h3>
                <p className="mt-2 text-[15px] text-charcoal-soft">{e.copy}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Pathways
-------------------------------------------------------------------------- */

const PathwayFeatures = [
  {
    icon: InsightsIcon,
    title: 'Holland, Big Five & Skills Diagnostics',
    copy: 'Objective assessments that help establish interests, personality and technical readiness.',
  },
  {
    icon: SchoolOutlinedIcon,
    title: 'Department-Aligned Pathway Templates',
    copy: 'Pathways are co-designed with faculties and departmental curriculum leaders.',
  },
  {
    icon: HowToRegIcon,
    title: 'Named Evaluator Sign-Offs',
    copy: 'Key milestones are authenticated by faculty supervisors, counsellors or industry assessors.',
  },
]

const PathwayMilestones = [
  { label: 'Diagnostic', done: true },
  { label: 'Completed milestone', done: true },
  { label: 'Peer review', done: true },
  { label: 'Industry mentor', done: true },
  { label: 'Audit logged', done: true },
  { label: 'Real-time sync', done: true },
]

function Pathways() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Pathways"
          title="Pathways, mapped to what your graduates actually do"
          copy="Every student follows a pathway built from real outcomes for their department — not a generic career-readiness checklist."
          align="center"
          wide
        />

        <div className="grid gap-6 md:grid-cols-3">
          {PathwayFeatures.map((f) => {
            const Icon = f.icon
            return (
              <Card key={f.title} className="transition-shadow hover:shadow-card-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
                  <Icon sx={{ color: 'primary.main' }} />
                </span>
                <h3 className="mt-4 text-lg text-charcoal">{f.title}</h3>
                <p className="mt-2 text-[15px] text-charcoal-soft">{f.copy}</p>
              </Card>
            )
          })}
        </div>

        <Card className="mt-12 !p-0 overflow-hidden shadow-card-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-bgsoft px-6 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-charcoal-faint">
                Live Pathway Interface
              </p>
              <p className="mt-0.5 text-sm font-bold text-charcoal">
                Department of Electrical &amp; Computer Engineering
              </p>
            </div>
            <Chip
              label="Cloud & Embedded Systems Pathway"
              sx={{ bgcolor: 'primary.soft', color: 'primary.main' }}
            />
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {PathwayMilestones.map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-3 text-sm"
              >
                <CheckCircleIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <span className="font-medium text-charcoal-soft">
                  {m.label}
                </span>
                <span className="ml-auto rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
                  Done
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Workspaces
-------------------------------------------------------------------------- */

function WorkspacePanel({ tabData }) {
  const Icon = tabData.icon
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
          <Icon sx={{ fontSize: 28, color: 'primary.main' }} />
        </span>
        <h3 className="mt-6 text-2xl leading-tight text-charcoal md:text-3xl">
          {tabData.heading}
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-charcoal-soft">
          {tabData.copy}
        </p>
        <p className="mt-6 flex items-center gap-2 text-sm font-medium text-charcoal-faint">
          <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          Same verified record · Role-based view
        </p>
      </div>

      <Card className="!p-0 overflow-hidden shadow-card-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-bgsoft px-6 py-4">
          <span className="flex items-center gap-2.5 text-sm font-bold text-charcoal">
            <Icon sx={{ fontSize: 18, color: 'primary.main' }} />
            {tabData.label} Workspace
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Live view
          </span>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {tabData.items.map((t) => (
            <div
              key={t}
              className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm"
            >
              <GreenCheck />
              <span className="font-medium text-charcoal-soft">{t}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

const WorkspaceTabs = [
  {
    key: 'student',
    label: 'Student',
    icon: PersonIcon,
    heading: 'Your pathway, evidenced.',
    copy: 'Every student sees where they are, what is verified and what comes next — all on one record that travels with them.',
    items: [
      'Verified milestones',
      'Employability score',
      'Matched opportunities',
      'Pathway progress',
      'Evidence',
      'Pending sign-offs',
    ],
  },
  {
    key: 'counsellor',
    label: 'Counsellor',
    icon: SupportAgentIcon,
    heading: 'A caseload built around context, not guesswork.',
    copy: 'Counsellors triage students with AI-prepared summaries and the full evidence trail behind every flag.',
    items: [
      'Student cases',
      'AI-prepared summaries',
      'Risk flags',
      'Pending counselling requests',
      'Milestone issues',
      'Conversation history',
    ],
  },
  {
    key: 'admin',
    label: 'Institution Admin',
    icon: ManageAccountsIcon,
    heading: 'Reports that hold up to a board or regulator.',
    copy: 'Institutional leadership sees employability across faculties using one consistent outcome taxonomy.',
    items: [
      'Institutional employability overview',
      'Faculty comparisons',
      'SIWES readiness',
      'Pathway completion',
      'Evidence verification',
      'Accreditation reporting',
    ],
  },
  {
    key: 'employer',
    label: 'Employer',
    icon: WorkIcon,
    heading: 'Talent you can actually evaluate.',
    copy: 'Employers hire with confidence from verified skills and evidence — not curated resumes.',
    items: [
      'Candidate match score',
      'Verified skills',
      'Pathway progress',
      'Student preferences',
      'Experience',
      'Evidence',
      'Application status',
    ],
  },
]

function Workspaces() {
  const [tab, setTab] = useState(0)
  const active = WorkspaceTabs[tab]

  return (
    <section id="workspaces" className="bg-bgsoft py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Universal Ecosystem Integration"
          title="The same verified record. A different view for every job."
          copy="Whether you are a student mapping your pathway, a counsellor triaging cases, an institution reporting to senate, or an employer hiring with confidence."
          align="center"
          wide
        />

        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-card">
          {WorkspaceTabs.map((w, i) => {
            const TabIcon = w.icon
            const selected = i === tab
            return (
              <button
                key={w.key}
                type="button"
                onClick={() => setTab(i)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  selected
                    ? 'bg-primary text-white shadow-card'
                    : 'bg-transparent text-charcoal-soft hover:bg-primary-soft hover:text-primary'
                }`}
              >
                <TabIcon sx={{ fontSize: 18 }} />
                {w.label}
              </button>
            )
          })}
        </div>

        <div key={tab} className="fade-up mt-10 md:mt-14">
          <WorkspacePanel tabData={active} />
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   AI Assistant
-------------------------------------------------------------------------- */

function Assistant() {
  return (
    <section id="assistant" className="bg-white py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Zero-Hallucination Career Intelligence"
          title="An assistant that shows its work"
          copy="Trained strictly on your institution's official handbooks, SIWES calendars, policies and verified employer briefs. Every claim includes its source, and complex judgement is immediately handed off to human counsellors."
          align="center"
          wide
        />

        <div className="mx-auto max-w-3xl">
          <Card className="!p-0 overflow-hidden shadow-card-lg">
            <div className="flex items-center gap-3 border-b border-line px-6 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 20 }} />
              </span>
              <div>
                <p className="text-sm font-bold text-charcoal">
                  Edusal Assistant
                </p>
                <p className="text-xs text-charcoal-faint">
                  Chidinma Okafor · 300L Software Engineering · FUTMinna
                </p>
              </div>
              <Chip
                label="Institution-grounded"
                size="small"
                icon={<VerifiedIcon />}
                sx={{
                  ml: 'auto',
                  bgcolor: 'primary.soft',
                  color: 'primary.main',
                }}
              />
            </div>

            <div className="space-y-4 px-6 py-6">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-white">
                  Yes — and can I still apply if I haven't finished the
                  database module yet?
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-line bg-bgsoft px-4 py-3 text-sm text-charcoal">
                  <p>
                    You've completed 2 of 3 milestones for the Backend Developer
                    pathway. Your SIWES window opens in July. Based on your
                    validated skills, two employers are a strong match. Want a
                    shortlist with placement details?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Pathway Template', 'Skills Validation Record', 'SIWES Calendar'].map(
                      (c) => (
                        <span
                          key={c}
                          className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-primary"
                        >
                          <LinkIcon sx={{ fontSize: 13 }} /> {c}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-line bg-bgsoft px-4 py-3 text-sm text-charcoal">
                  <p>
                    Interswitch's listing requires the database module as a
                    prerequisite; Paystack's does not. You're currently 80%
                    through the module. I'm flagging this thread for your
                    counsellor in case you'd like to discuss timing.
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary-faint px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft">
                  <SupportAgentIcon sx={{ fontSize: 17, color: 'primary.main' }} />
                </span>
                <div>
                  <p className="text-sm font-bold text-primary">
                    Next Step: Handed Off to Your Counsellor
                  </p>
                  <p className="text-xs text-charcoal-soft">
                    Ticket #CS-2041 Queued
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-2">
            {['AI', 'Evidence', 'Citation', 'Human Handoff'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className="rounded-lg border border-line bg-bgsoft px-3 py-1.5 text-sm font-semibold text-charcoal-soft">
                  {s}
                </span>
                {i < 3 && (
                  <ArrowForwardOutlinedIcon
                    sx={{ fontSize: 15, color: 'primary.main' }}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-charcoal-faint">
            The AI does not replace counsellors.
          </p>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Leadership & Governance
-------------------------------------------------------------------------- */

const Leadership = [
  {
    icon: ListAltIcon,
    title: 'Unified Outcome Taxonomy',
    copy: 'Standardized definitions for placement, pathway completion, NYSC deployment and postgraduate transition.',
  },
  {
    icon: LeaderboardIcon,
    title: 'Faculty & Cohort Benchmarking',
    copy: 'Compare departmental progress across faculties without misleading aggregates.',
  },
  {
    icon: AccountBalanceIcon,
    title: 'Regulator-Ready Reporting',
    copy: 'Structured reporting support for NUC, NBTE and NCCE oversight cycles.',
  },
]

function LeadershipSection() {
  return (
    <section className="bg-bgsoft py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Institutional Leadership & Governance"
          title="Intelligence your leadership can compare across faculties, honestly"
          copy="The same outcome taxonomy across every department means a placement rate represents the same verifiable outcome wherever it is reported."
          align="center"
          wide
        />
        <div className="grid gap-6 md:grid-cols-3">
          {Leadership.map((l) => {
            const Icon = l.icon
            return (
              <Card key={l.title} className="transition-shadow hover:shadow-card-md">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
                  <Icon sx={{ color: 'primary.main' }} />
                </span>
                <h3 className="mt-5 text-lg text-charcoal">{l.title}</h3>
                <p className="mt-2 text-[15px] text-charcoal-soft">{l.copy}</p>
              </Card>
            )
          })}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-[15px] text-charcoal-faint">
          Designed to support institutional self-study reports, accreditation
          audits and senate oversight portfolios.
        </p>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Regulatory alignment
-------------------------------------------------------------------------- */

const Regulators = [
  { name: 'NUC', desc: 'Universities' },
  { name: 'NBTE', desc: 'Polytechnics' },
  { name: 'NCCE', desc: 'Colleges of Education' },
  { name: 'ITF / SIWES', desc: 'Industrial Training' },
]

function Regulatory() {
  return (
    <section className="border-y border-line bg-white py-14">
      <div className="container-edusal">
        <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.14em] text-charcoal-faint">
          Aligned to the Nigerian regulatory landscape
        </p>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {Regulators.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-line bg-bgsoft px-6 py-6 text-center"
            >
              <p className="text-xl font-extrabold tracking-tight text-charcoal">
                {r.name}
              </p>
              <p className="mt-1 text-sm text-charcoal-faint">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Founding Partner Advisory
-------------------------------------------------------------------------- */

function Advisory({ onJoin }) {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Collaborative Co-Design"
          title="What early partners are telling us"
          copy="We are building in consultation with Nigerian deans of student affairs, directors of career centres and SIWES coordinators."
          align="center"
          wide
        />
        <Card className="mx-auto max-w-3xl bg-bgsoft !py-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
            <GroupsIcon sx={{ color: 'primary.main' }} />
          </span>
          <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.14em] text-charcoal-faint">
            Founding Partner Advisory Roundtable
          </p>
          <blockquote className="mx-auto mt-4 max-w-2xl text-center text-xl font-semibold leading-relaxed text-charcoal">
            "The central challenge facing career service centres is not simply
            the number of students, but the ability to verify what students can
            actually demonstrate when employers request evidence."
          </blockquote>
          <p className="mt-5 text-center text-sm text-charcoal-faint">
            Research &amp; advisory insight — shared by career centre directors
            and SIWES coordinators in partner consultation.
          </p>
          <div className="mt-8 text-center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={onJoin}
            >
              Join the Advisory Roundtable
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Professional ecosystem alignment
-------------------------------------------------------------------------- */

const Ecosystems = [
  {
    icon: GridViewIcon,
    title: 'Computing & IT',
    copy: 'Software engineering, cybersecurity, data systems and cloud architecture.',
  },
  {
    icon: SettingsIcon,
    title: 'Engineering & Built Environment',
    copy: 'Mechanical, electrical, civil and agricultural engineering.',
  },
  {
    icon: TrendingUpIcon,
    title: 'Accounting & Financial Sciences',
    copy: 'Audit, financial management, taxation and enterprise systems.',
  },
  {
    icon: SupportAgentIcon,
    title: 'Management & Administrative Sciences',
    copy: 'Business administration, HR analytics, marketing and project delivery.',
  },
]

function EcosystemAlignment() {
  return (
    <section className="bg-bgsoft py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Professional Ecosystem Alignment"
          title="Standards you can trust"
          copy="Edusal Consult's pathway and skill-validation framework is being developed in consultation with Nigerian professional and chartered bodies. Formal partnership charters will be published as agreements are finalized."
          align="center"
          wide
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Ecosystems.map((e) => {
            const Icon = e.icon
            return (
              <Card key={e.title} className="transition-shadow hover:shadow-card-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
                  <Icon sx={{ color: 'primary.main' }} />
                </span>
                <h3 className="mt-4 text-base text-charcoal">{e.title}</h3>
                <p className="mt-2 text-sm text-charcoal-soft">{e.copy}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Onboarding
-------------------------------------------------------------------------- */

const OnboardingSteps = [
  {
    n: '01',
    icon: GridViewIcon,
    title: 'Faculty & Department Mapping',
    copy: 'Review degree programmes and calibrate pathway templates.',
  },
  {
    n: '02',
    icon: DescriptionIcon,
    title: 'Document Grounding Ingestion',
    copy: 'Official handbooks and SIWES guidelines are securely ingested into the institution\u2019s knowledge base.',
  },
  {
    n: '03',
    icon: PlayCircleOutlineIcon,
    title: 'Pilot Cohort Launch',
    copy: 'Launch with a pilot department or graduating class with dedicated support.',
  },
]

function Onboarding() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-edusal">
        <SectionHead
          eyebrow="Institutional Onboarding"
          title="Bring your institution onto Edusal Consult"
          copy="Book a scoped walkthrough. We will map your faculties, counsellor roster and reporting needs before you sign anything."
          align="center"
          wide
        />

        <Stepper
          activeStep={-1}
          alternativeLabel
          sx={{ maxWidth: 900, mx: 'auto', mb: 6 }}
        >
          {OnboardingSteps.map((s) => (
            <Step key={s.n}>
              <StepLabel>{s.title}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="grid gap-6 md:grid-cols-3">
          {OnboardingSteps.map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.n} className="relative overflow-hidden text-center">
                <span className="absolute left-5 top-4 text-4xl font-extrabold text-bgsoft">
                  {s.n}
                </span>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
                  <Icon sx={{ color: 'primary.main' }} />
                </span>
                <h3 className="mt-4 text-lg text-charcoal">{s.title}</h3>
                <p className="mt-2 text-sm text-charcoal-soft">{s.copy}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Trust strip
-------------------------------------------------------------------------- */

const Trust = [
  {
    icon: PublicIcon,
    title: 'Hosted In-Region',
    copy: 'Data residency roadmap tailored for Nigeria',
  },
  {
    icon: LockIcon,
    title: 'NDPR-Aligned Data Handling',
    copy: 'Privacy and compliance program in progress',
  },
  {
    icon: AccessTimeIcon,
    title: '2–4 Week Onboarding',
    copy: 'Expedited provisioning for founding partner institutions',
  },
]

function TrustStrip() {
  return (
    <section className="border-y border-line bg-white py-14">
      <div className="container-edusal grid gap-8 md:grid-cols-3">
        {Trust.map((t) => {
          const Icon = t.icon
          return (
            <div key={t.title} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                <Icon sx={{ color: 'primary.main' }} />
              </span>
              <div>
                <p className="font-bold text-charcoal">{t.title}</p>
                <p className="mt-1 text-sm text-charcoal-faint">{t.copy}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Scoped Walkthrough form
-------------------------------------------------------------------------- */

const initialForm = {
  institution: '',
  type: '',
  population: '',
  name: '',
  role: '',
  email: '',
  phone: '',
  notes: '',
}

function Walkthrough() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (
      !form.institution ||
      !form.type ||
      !form.name ||
      !form.role ||
      !form.email
    ) {
      setError(true)
      return
    }
    setError(false)
    setSubmitted(true)
  }

  const fieldProps = (k) => ({
    value: form[k],
    onChange: update(k),
    fullWidth: true,
    sx: {
      '& .MuiOutlinedInput-root': { borderRadius: '10px' },
      '& .MuiInputLabel-root': { fontSize: 14.5 },
    },
  })

  return (
    <section id="walkthrough" className="bg-bgsoft py-20 md:py-28">
      <div className="container-edusal grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Eyebrow>Scoped Walkthrough</Eyebrow>
          <h2 className="mt-3 text-3xl leading-tight md:text-[2.4rem]">
            Request a Scoped Walkthrough
          </h2>
          <p className="mt-4 text-lg text-charcoal-soft">
            No commitments. See how Edusal fits your institution's specific
            workflow.
          </p>

          <div className="mt-8 space-y-4">
            {[
              'Map your faculties and departments',
              'Calibrate pathway templates',
              'Review reporting for your senate or board',
            ].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-sm">
                <GreenCheck />
                <span className="text-charcoal-soft">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="!p-0 overflow-hidden shadow-card-md">
          {submitted ? (
            <div className="px-8 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                <CheckCircleIcon sx={{ fontSize: 30, color: 'primary.main' }} />
              </span>
              <h3 className="mt-5 text-xl text-charcoal">
                Walkthrough request received
              </h3>
              <p className="mx-auto mt-2 max-w-md text-charcoal-soft">
                Thank you, {form.name.split(' ')[0] || 'there'}. Your request
                has been queued and our team will reach out to schedule a
                scoped session for {form.institution}.
              </p>
              <Button
                variant="outlined"
                color="inherit"
                sx={{ mt: 5, color: 'text.primary', borderColor: 'divider' }}
                onClick={() => {
                  setForm(initialForm)
                  setSubmitted(false)
                }}
              >
                Submit another request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-8 md:px-8">
              {error && (
                <Alert
                  severity="warning"
                  sx={{ mb: 3, borderRadius: 2 }}
                >
                  Please complete all required fields.
                </Alert>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Institution Name *"
                  {...fieldProps('institution')}
                  required
                />
                <FormControl size="small" fullWidth>
                  <InputLabel id="type-label">Institution Type *</InputLabel>
                  <Select
                    labelId="type-label"
                    label="Institution Type *"
                    value={form.type}
                    onChange={update('type')}
                    required
                    sx={{
                      borderRadius: '10px',
                      '& .MuiSelect-select': { py: 1.3 },
                    }}
                  >
                    {[
                      'University — Federal',
                      'University — State',
                      'Private University',
                      'Polytechnic',
                      'College of Education',
                      'Other Tertiary Institution',
                    ].map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel id="population-label">
                    Student Population
                  </InputLabel>
                  <Select
                    labelId="population-label"
                    label="Student Population"
                    value={form.population}
                    onChange={update('population')}
                    sx={{
                      borderRadius: '10px',
                      '& .MuiSelect-select': { py: 1.3 },
                    }}
                  >
                    {[
                      'Under 5,000',
                      '5,000–15,000',
                      '15,000–35,000',
                      '35,000+',
                    ].map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Full Name *" {...fieldProps('name')} required />

                <TextField label="Role / Title *" {...fieldProps('role')} required />
                <TextField
                  label="Official Work Email *"
                  type="email"
                  {...fieldProps('email')}
                  required
                />

                <TextField
                  label="Phone / WhatsApp"
                  {...fieldProps('phone')}
                />
              </div>

              <TextField
                label="Key Departmental Focus or Specific Requirements"
                multiline
                minRows={4}
                fullWidth
                {...fieldProps('notes')}
                sx={{
                  mt: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                endIcon={<SendIcon />}
                sx={{ mt: 4 }}
              >
                Book a Scoped Walkthrough
              </Button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-charcoal-faint">
                <LockIcon sx={{ fontSize: 14 }} />
                Confidential. Information will only be used to tailor your
                walkthrough session.
              </p>
            </form>
          )}
        </Card>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Footer
-------------------------------------------------------------------------- */

const FooterCols = [
  {
    title: 'Platform',
    links: [
      'Overview',
      'Grounded AI Assistant',
      'Employability Score',
      'Assessment Engine',
      'Pathways',
      'Employer Pipeline',
    ],
  },
  {
    title: 'Audiences',
    links: [
      'Universities & Polytechnics',
      'Students & Graduates',
      'Career Counsellors',
      'Hiring Employers',
      'Founding Partners',
    ],
  },
  {
    title: 'Company',
    links: ['About', 'Research', 'Contact', 'Careers'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Security', 'Compliance'],
  },
]

function Footer() {
  return (
    <footer className="bg-charcoal pt-16 pb-10 text-white">
      <div className="container-edusal">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center">
              <img src="/logo-white.png" alt="Edusal Consult" className="h-10 w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Career Service Centre Management Platform for Nigerian tertiary
              institutions.
            </p>
          </div>

          {FooterCols.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/50">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/50">
            © 2026 Edusal Consult. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-white/50">
            <VerifiedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
            Institution-grounded career intelligence
          </p>
        </div>
      </div>
    </footer>
  )
}

/* --------------------------------------------------------------------------
   Evidence & Scoring Architecture modal
-------------------------------------------------------------------------- */

const ScoreParts = [
  {
    name: 'Vocational & Skills Diagnostic',
    pts: '20 pts',
    sub: 'Holland RIASEC & Aptitude calibration',
    badge: null,
  },
  {
    name: 'Faculty-Signed Milestones',
    pts: 'Up to 45 pts',
    sub: 'Signed by named department evaluators',
    badge: '3 / 4 Signed',
  },
  {
    name: 'Practical Capstone & Lab Artifact',
    pts: '20 pts',
    sub: 'Code repo, technical design, or lab portfolio',
    badge: null,
  },
  {
    name: 'Counsellor Readiness Endorsement',
    pts: '15 pts',
    sub: 'Professional communication & interview audit',
    badge: null,
  },
]

const ScoreBreakdown = [
  { label: 'Diagnostic Baseline', pts: '+20 pts' },
  { label: 'Faculty Milestone Sign-offs', pts: '+34 pts' },
  { label: 'Practical Artifact Proof', pts: '+20 pts' },
  { label: 'Counsellor Endorsement', pts: '+15 pts' },
]

function ScoreModal({ open, onClose }) {
  const handleBook = () => {
    onClose()
    setTimeout(() => {
      document.getElementById('walkthrough')?.scrollIntoView({
        behavior: 'smooth',
      })
    }, 150)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, md: 4.5 },
          pt: 4,
          pb: 2,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: 'absolute', right: 14, top: 14, color: 'charcoal.faint' }}
        >
          <CloseIcon />
        </IconButton>
        <Eyebrow>Evidence &amp; Scoring Architecture</Eyebrow>
        <h2 className="mt-2 text-2xl leading-tight text-charcoal md:text-3xl">
          How the Employability Score Works
        </h2>
        <p className="mt-2 text-charcoal-soft">
          Every point is calculated from auditable evidence — never
          self-reported claims.
        </p>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 3, md: 4.5 }, pb: 2 }}>
        <div className="grid gap-6 md:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-charcoal-faint">
              Interactive Evidence Simulator
            </p>
            <div className="mt-4 space-y-3">
              {ScoreParts.map((p) => (
                <div
                  key={p.name}
                  className="rounded-2xl border border-line bg-bgsoft px-4 py-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-charcoal">{p.name}</p>
                      <p className="mt-0.5 text-sm text-charcoal-faint">
                        {p.sub}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="whitespace-nowrap rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                        {p.pts}
                      </span>
                      {p.badge && (
                        <span className="whitespace-nowrap rounded-md border border-primary/30 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-line p-5">
              <p className="text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-faint">
                Calculated Index
              </p>
              <div className="mt-3 flex items-center justify-center gap-5">
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={89}
                    size={124}
                    thickness={4.5}
                    sx={{ color: 'primary.main' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div className="text-center">
                      <p className="text-4xl font-extrabold leading-none text-charcoal">
                        89
                      </p>
                      <p className="mt-1 text-xs font-semibold text-charcoal-faint">
                        / 100
                      </p>
                    </div>
                  </Box>
                </Box>
                <div className="space-y-2">
                  {ScoreBreakdown.map((b) => (
                    <div key={b.label} className="flex items-center gap-2 text-sm">
                      <GreenCheck />
                      <span className="text-charcoal-soft">{b.label}</span>
                      <span className="ml-auto font-bold text-primary">
                        {b.pts}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary-faint px-4 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                <VerifiedIcon sx={{ fontSize: 17, color: 'primary.main' }} />
              </span>
              <div>
                <p className="text-sm font-bold text-primary">
                  Employer Verifiability: Verified
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-charcoal-soft">
                  Fully Auditable — Shortlist Ready for Tier-1 Employers &amp;
                  SIWES Direct Dispatch
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 3, md: 4.5 },
          pb: 4,
          pt: 2,
          flexWrap: 'wrap',
          gap: 1.5,
          justifyContent: { xs: 'stretch', md: 'space-between' },
        }}
      >
        <Button onClick={onClose} color="inherit" sx={{ color: 'text.primary' }}>
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleBook}
        >
          Book a Walkthrough for Your Institution
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* --------------------------------------------------------------------------
   Founding Partner Program modal
-------------------------------------------------------------------------- */

const PartnerFormInitial = {
  institution: '',
  type: '',
  faculty: '',
  contact: '',
  email: '',
  phone: '',
}

function PartnerModal({ open, onClose }) {
  const [form, setForm] = useState(PartnerFormInitial)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (
      !form.institution ||
      !form.type ||
      !form.faculty ||
      !form.contact ||
      !form.email ||
      !form.phone
    ) {
      setError(true)
      return
    }
    setError(false)
    setSubmitted(true)
  }

  const handleClose = () => {
    setSubmitted(false)
    setError(false)
    setForm(PartnerFormInitial)
    onClose()
  }

  const fieldProps = (k, placeholder) => ({
    value: form[k],
    onChange: update(k),
    fullWidth: true,
    placeholder,
    sx: {
      '& .MuiOutlinedInput-root': { borderRadius: '10px' },
      '& .MuiInputLabel-root': { fontSize: 14.5 },
    },
  })

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, md: 4 },
          pt: 4,
          pb: 2,
          position: 'relative',
          bgcolor: 'bgsoft',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton
          onClick={handleClose}
          aria-label="Close"
          sx={{ position: 'absolute', right: 14, top: 14, color: 'charcoal.faint' }}
        >
          <CloseIcon />
        </IconButton>
        <Eyebrow>2026 Founding Partner Program</Eyebrow>
        <h2 className="mt-2 text-2xl leading-tight text-charcoal md:text-3xl">
          Join the Founding Partner Cohort
        </h2>
        <p className="mt-2 text-charcoal-soft">
          Shape pathway templates and lock in preferential charter terms for
          your institution.
        </p>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 3, md: 4 }, py: 3.5 }}>
        {submitted ? (
          <div className="px-2 py-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
              <CheckCircleIcon sx={{ fontSize: 30, color: 'primary.main' }} />
            </span>
            <h3 className="mt-5 text-xl text-charcoal">
              Application received
            </h3>
            <p className="mx-auto mt-2 max-w-md text-charcoal-soft">
              Thank you, {form.institution}. Your founding partner application
              has been queued. Our team will contact {form.contact} to begin
              the charter discussion.
            </p>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 6 }}
              endIcon={<ArrowForwardIcon />}
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                Please complete all required fields.
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  label="Institution Name *"
                  {...fieldProps(
                    'institution',
                    'e.g. University of Lagos / Yaba College of Technology',
                  )}
                  required
                />
              </div>

              <FormControl size="small" fullWidth>
                <InputLabel id="partner-type-label">
                  Institution Type *
                </InputLabel>
                <Select
                  labelId="partner-type-label"
                  label="Institution Type *"
                  value={form.type}
                  onChange={update('type')}
                  required
                  sx={{
                    borderRadius: '10px',
                    '& .MuiSelect-select': { py: 1.3 },
                  }}
                >
                  {[
                    'University (Federal/State)',
                    'Private University',
                    'Polytechnic',
                    'College of Education',
                    'Other Tertiary Institution',
                  ].map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Target Pilot Faculty *"
                {...fieldProps(
                  'faculty',
                  'Faculty of Engineering / School of Technology',
                )}
                required
              />

              <TextField
                label="Contact Name & Title *"
                {...fieldProps(
                  'contact',
                  'e.g. Prof. I. Adekunle, DVC Academics',
                )}
                required
              />

              <TextField
                label="Official Email *"
                type="email"
                {...fieldProps('email', 'e.g. i.adekunle@unilag.edu.ng')}
                required
              />

              <div className="sm:col-span-2">
                <TextField
                  label="Phone / WhatsApp *"
                  {...fieldProps('phone', 'e.g. +234 802 000 0000')}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 4 }}
            >
              Apply for Founding Partner Cohort
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------------------------------------------------------
   App
-------------------------------------------------------------------------- */

function Landing() {
  const [scoreOpen, setScoreOpen] = useState(false)
  const [partnerOpen, setPartnerOpen] = useState(false)

  return (
    <div id="top">
      <Navbar />
      <main>
        <Hero onShowScore={() => setScoreOpen(true)} />
        <Evidence onShowScore={() => setScoreOpen(true)} />
        <FoundingPartners onOpen={() => setPartnerOpen(true)} />
        <Ecosystem />
        <GovernanceSection />
        <ProofArchitecture />
        <EnginesSection />
        <Pathways />
        <Workspaces />
        <Assistant />
        <LeadershipSection />
        <Regulatory />
        <Advisory onJoin={() => setPartnerOpen(true)} />
        <EcosystemAlignment />
        <Onboarding />
        <TrustStrip />
        <Walkthrough />
      </main>
      <Footer />
      <ScoreModal open={scoreOpen} onClose={() => setScoreOpen(false)} />
      <PartnerModal open={partnerOpen} onClose={() => setPartnerOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* /portal/login redirects into the institution portal which shows its own login screen */}
        <Route path="/portal/login" element={<Navigate to="/portal/institution" replace />} />
        <Route path="/portal/register" element={<RegisterPage />} />
        <Route
          path="/portal/register/institution"
          element={<InstitutionRegister />}
        />
        {/* All /portal/institution/* routes are handled by the real InstitutionDashboard
            which has full backend API connections, auth, tab routing, and student portal */}
        <Route
          path="/portal/institution/*"
          element={
            <InstitutionDashboard
              initialRole="staff"
              onBackToLanding={() => window.location.replace('/')}
            />
          }
        />
        <Route path="/portal/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/portal/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App