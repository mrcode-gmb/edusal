import { useState } from 'react'
import {
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import {
  AccountTree as AccountTreeIcon,
  Domain as DomainIcon,
  School as SchoolIcon,
  Memory as MemoryIcon,
  FactCheck as FactCheckIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Key as KeyIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material'
import { Line, Bar, Doughnut } from './charts'
import { chartColors } from './charts'
import { Panel, PanelHead, StatCard, PageHead, Ring } from './Shared'

const lineData = {
  labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'First Semester (Omega / Rain)',
      data: [18, 26, 35, 29, 42, 50, 58, 64, 71, 80, 86, 92],
      borderColor: chartColors.primary,
      backgroundColor: 'rgba(20,107,74,0.12)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: chartColors.primary,
      pointRadius: 3,
    },
    {
      label: 'Second Semester (Rain / Omega)',
      data: [12, 21, 28, 37, 45, 53, 61, 69, 78, 84, 91, 97],
      borderColor: chartColors.green2,
      backgroundColor: 'rgba(127,182,154,0.10)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: chartColors.green2,
      pointRadius: 3,
    },
  ],
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: chartColors.gray },
    },
    y: {
      beginAtZero: true,
      max: 100,
      grid: { color: chartColors.line },
      ticks: { color: chartColors.gray },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, boxWidth: 8, padding: 16, color: '#4B5563' },
    },
  },
}

const doughnutData = {
  labels: ['Senate Handbook', 'SIWES Policy', 'Course Rubrics', 'Institutional Directives'],
  datasets: [
    {
      data: [42, 28, 19, 11],
      backgroundColor: [
        chartColors.primary,
        chartColors.green1,
        chartColors.green2,
        chartColors.green3,
      ],
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}

const barData = {
  labels: ['Mechanical Eng.', 'Computer Eng.', 'Elec. & Elect. Eng.'],
  datasets: [
    {
      label: 'Enrolled',
      data: [42, 38, 35],
      backgroundColor: chartColors.primary,
      borderRadius: 6,
      barThickness: 34,
    },
    {
      label: 'SIWES Eligible',
      data: [42, 38, 35],
      backgroundColor: chartColors.green2,
      borderRadius: 6,
      barThickness: 34,
    },
  ],
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { grid: { display: false }, ticks: { color: chartColors.gray } },
    y: {
      beginAtZero: true,
      grid: { color: chartColors.line },
      ticks: { color: chartColors.gray },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, boxWidth: 8, padding: 16, color: '#4B5563' },
    },
  },
}

const ComplianceChecks = [
  {
    title: 'Unified Outcome Taxonomy',
    copy: 'Operational definitions standardized across all faculties',
  },
  {
    title: '4-Tier Hierarchy Integrity',
    copy: 'Faculties, Departments, and Degree options strictly relational',
  },
  {
    title: 'Document Grounding in pgvector',
    copy: 'Handbooks and SIWES policies chunked with exact citations',
  },
  {
    title: 'Zero Unbacked Claims Policy',
    copy: 'Student milestone sign-offs locked to named faculty evaluators',
  },
]

export default function GovernancePulse() {
  const [auditOpen, setAuditOpen] = useState(false)

  return (
    <div>
      <PageHead
        eyebrow="Active Institutional Governance"
        title="Senate & Accreditation Health Pulse"
        sub={
          <>
            Federal University of Technology, Minna · Governance Pulse for the
            active academic session.
          </>
        }
        actions={
          <>
            <Chip
              label="2025/2026 · Second Semester (Rain / Omega)"
              size="medium"
              sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
            />
            <Chip
              label="Regulatory Scope: NUC"
              size="medium"
              variant="outlined"
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong', fontWeight: 700 }}
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<DownloadIcon />}
              onClick={() => setAuditOpen(true)}
            >
              Generate Senate Audit Pack
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={AccountTreeIcon}
          value="2"
          label="Academic Divisions"
          sub="Schools / Faculties Mapped"
          chip="Mapped"
        />
        <StatCard
          icon={DomainIcon}
          value="3"
          label="Active Departments"
          sub="3 SIWES Eligible (100%)"
          chip="SIWES Eligible"
        />
        <StatCard
          icon={SchoolIcon}
          value="3"
          label="Degree Programmes"
          sub="Curriculum Rubrics Configured"
          chip="Rubrics Live"
        />
        <StatCard
          icon={MemoryIcon}
          value="2"
          label="Grounded Vector Chunks"
          sub="Active (pgvector)"
          chip="Indexed"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHead
            title="Milestone Sign-off Progression"
            sub="Student milestones signed off by named faculty evaluators, 2025/2026 session"
          />
          <Box sx={{ height: 280 }}>
            <Line data={lineData} options={lineOptions} />
          </Box>
        </Panel>

        <Panel>
          <PanelHead
            title="Evidence Grounding by Source"
            sub="Share of grounded vector chunks per policy source"
          />
          <Box sx={{ height: 280 }}>
            <Doughnut data={doughnutData} />
          </Box>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHead
            title="SIWES Eligibility by Department"
            sub="All active departments fully SIWES-eligible for the session"
          />
          <Box sx={{ height: 260 }}>
            <Bar data={barData} options={barOptions} />
          </Box>
        </Panel>

        <Panel>
          <PanelHead
            title="Regulatory Compliance Baseline"
            sub="Standardized against NUC Institutional Guidelines"
          />
          <div className="flex flex-col items-center gap-4">
            <Ring value={100} label="Audit Ready" />
            <div className="grid w-full grid-cols-2 gap-3">
              {[
                { label: 'Outcome Taxonomy', v: 100 },
                { label: 'Hierarchy Integrity', v: 100 },
                { label: 'pgvector Grounding', v: 100 },
                { label: 'Unbacked Claims', v: 0, inv: true },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-[15px] bg-bgsoft px-3 py-3 text-center"
                >
                  <p className="text-lg font-extrabold text-charcoal">
                    {m.inv ? '0' : `${m.v}%`}
                  </p>
                  <p className="text-[11px] font-semibold text-charcoal-faint">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4" id="audit">
        <PanelHead
          title="Regulatory Compliance & Verification Baseline"
          sub="Standardized against National Universities Commission (NUC) Institutional Guidelines"
          action={
            <Chip
              icon={<FactCheckIcon sx={{ fontSize: 15 }} />}
              label="100% Audit Ready"
              sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
            />
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ComplianceChecks.map((c) => (
            <div
              key={c.title}
              className="rounded-[15px] border border-line bg-bgsoft p-5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[15px] bg-primary">
                <CheckCircleIcon sx={{ fontSize: 18, color: '#fff' }} />
              </span>
              <p className="mt-3 text-sm font-bold text-charcoal">{c.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-charcoal-faint">
                {c.copy}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <AuditPackModal open={auditOpen} onClose={() => setAuditOpen(false)} />
    </div>
  )
}

function AuditSectionTable({ rows }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableBody>
          {rows.map((r) => (
            <TableRow
              key={r.label}
              sx={{ '& td': { borderColor: 'border.main', py: 1.3 } }}
            >
              <TableCell sx={{ color: 'charcoal.soft', fontWeight: 600 }}>
                {r.label}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: 'charcoal' }}>
                {r.chip ? (
                  <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                    {r.value}
                  </span>
                ) : (
                  r.value
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function AuditPackModal({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      PaperProps={{ sx: { borderRadius: '15px', overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, md: 4 },
          pt: 4,
          pb: 2.5,
          position: 'relative',
          bgcolor: 'bgsoft',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: 'absolute', right: 14, top: 14, color: 'charcoal.faint' }}
        >
          <CloseIcon />
        </IconButton>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Regulator & Senate Evidence Dossier
        </p>
        <h2 className="mt-2 text-2xl text-charcoal">
          Institutional Outcome & Hierarchy Audit Pack
        </h2>
        <p className="mt-2 text-sm text-charcoal-soft">
          Federal University of Technology, Minna · Regulatory Oversight: NUC ·
          Academic Session: 2025/2026 (Second Semester (Rain / Omega)) · Date:
          16 August 2026
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[15px] border border-line bg-white px-4 py-2.5">
          <KeyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <span className="text-xs font-bold text-charcoal-soft">
            Edusal Tamper-Evident Digest
          </span>
          <span className="font-mono text-xs text-primary">sha256:8f4c...3e1a</span>
        </div>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 3, md: 4 }, py: 3.5 }}>
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
            1
          </span>
          <h3 className="text-base font-bold text-charcoal">
            Academic Structure Compliance
          </h3>
        </div>
        <AuditSectionTable
          rows={[
            { label: 'Total SCHOOLs Mapped', value: '2' },
            { label: 'Total Departments Configured', value: '3' },
            { label: 'Degree Programmes Active', value: '3' },
            { label: 'SIWES Attachment Eligible Depts', value: '3 (100%)' },
          ]}
        />

        <div className="mt-7 mb-3 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
            2
          </span>
          <h3 className="text-base font-bold text-charcoal">
            Grounding & pgvector Evidence Status
          </h3>
        </div>
        <AuditSectionTable
          rows={[
            { label: 'Institutional Documents Ingested', value: '1' },
            { label: 'Indexed Citation Chunks', value: '2' },
            {
              label: 'Vector Distance Engine',
              value: 'PostgreSQL 16 pgvector',
            },
            {
              label: 'Taxonomy Audit Status',
              value: 'Passed Standard',
              chip: true,
            },
          ]}
        />

        <div className="mt-7 rounded-[15px] border border-line bg-bgsoft p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-charcoal">
            <GavelIcon sx={{ fontSize: 17, color: 'primary.main' }} />
            Regulator Attestation Note
          </p>
          <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
            This institutional pack contains strictly auditable records with 0%
            unverified self-reported claims. Every pathway requirement and
            document citation is directly traceable to the underlying faculty
            evaluation ledger.
          </p>
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 3, md: 4 },
          py: 2.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ color: 'text.primary', borderColor: 'border.strong' }}
        >
          Close
        </Button>
        <Button variant="contained" color="primary" startIcon={<DownloadIcon />}>
          Export Pack
        </Button>
      </DialogActions>
    </Dialog>
  )
}
