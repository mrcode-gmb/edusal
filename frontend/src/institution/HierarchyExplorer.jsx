import { useState } from 'react'
import {
  Chip,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  AccountTree as AccountTreeIcon,
  School as SchoolIcon,
  Domain as DomainIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { Panel, PageHead, StatCard } from './Shared'

const TierMeta = [
  {
    tier: 'Tier 1',
    label: 'Institution',
    icon: SchoolIcon,
    note: 'Native scope root',
  },
  {
    tier: 'Tier 2',
    label: 'School / Faculty',
    icon: DomainIcon,
    note: 'Native Tier-2: SCHOOL',
  },
  {
    tier: 'Tier 3',
    label: 'Department',
    icon: AccountTreeIcon,
    note: 'SIWES-eligible unit',
  },
  {
    tier: 'Tier 4',
    label: 'Degree Option',
    icon: AutoAwesomeIcon,
    note: 'Rubric-mapped',
  },
]

const Hierarchy = {
  id: 'institution',
  name: 'Federal University of Technology, Minna',
  tier: 'Tier 1 · Institution',
  meta: { reg: 'NUC Regulated', type: 'Federal University', siwes: true, chunks: 2 },
  children: [
    {
      id: 's1',
      name: 'School of Engineering & Technology',
      tier: 'Tier 2 · School',
      meta: { code: 'SET', depts: 3, siwes: true, chunks: 1 },
      children: [
        {
          id: 'd1',
          name: 'Department of Mechanical Engineering',
          tier: 'Tier 3 · Department',
          meta: { code: 'MEE', programmes: 2, siwes: true, chunks: 1 },
          children: [
            {
              id: 'p1',
              name: 'B.Eng. Mechanical Engineering',
              tier: 'Tier 4 · Degree Option',
              meta: { code: 'MEB', rubric: 'Configured', siwes: true },
            },
            {
              id: 'p2',
              name: 'B.Eng. Mechatronics Engineering',
              tier: 'Tier 4 · Degree Option',
              meta: { code: 'MTR', rubric: 'Configured', siwes: true },
            },
          ],
        },
        {
          id: 'd2',
          name: 'Department of Computer Engineering',
          tier: 'Tier 3 · Department',
          meta: { code: 'CPE', programmes: 1, siwes: true, chunks: 1 },
          children: [
            {
              id: 'p3',
              name: 'B.Eng. Computer Engineering',
              tier: 'Tier 4 · Degree Option',
              meta: { code: 'CPB', rubric: 'Configured', siwes: true },
            },
          ],
        },
        {
          id: 'd3',
          name: 'Department of Electrical & Electronics Engineering',
          tier: 'Tier 3 · Department',
          meta: { code: 'EEE', programmes: 1, siwes: true, chunks: 1 },
          children: [
            {
              id: 'p4',
              name: 'B.Eng. Electrical Engineering',
              tier: 'Tier 4 · Degree Option',
              meta: { code: 'ELB', rubric: 'Configured', siwes: true },
            },
          ],
        },
      ],
    },
  ],
}

function TierNode({ node, depth = 0, selected, onSelect, expanded, onToggle }) {
  const hasChildren = node.children && node.children.length > 0
  const isOpen = expanded[node.id]
  const isSel = selected.id === node.id

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelect(node)
          if (hasChildren) onToggle(node.id)
        }}
        className={`flex w-full items-center gap-2 rounded-[15px] border px-3 py-2.5 text-left transition-colors ${
          isSel
            ? 'border-primary bg-primary-soft'
            : 'border-transparent hover:border-line hover:bg-bgsoft'
        }`}
        style={{ marginLeft: depth * 18 }}
      >
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            aria-label="Expand"
          >
            {isOpen ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        ) : (
          <span className="w-7" />
        )}
        <span className="text-sm font-semibold text-charcoal">{node.name}</span>
      </button>
      {isOpen &&
        node.children?.map((c) => (
          <TierNode
            key={c.id}
            node={c}
            depth={depth + 1}
            selected={selected}
            onSelect={onSelect}
            expanded={expanded}
            onToggle={onToggle}
          />
        ))}
    </div>
  )
}

function DetailPanel({ node }) {
  const icon =
    node.tier?.includes('Tier 1')
      ? SchoolIcon
      : node.tier?.includes('Tier 2')
        ? DomainIcon
        : node.tier?.includes('Tier 3')
          ? AccountTreeIcon
          : AutoAwesomeIcon
  const Icon = icon
  return (
    <Panel>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        Node Detail
      </p>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-[15px] bg-primary-soft">
          <Icon sx={{ fontSize: 28, color: 'primary.main' }} />
        </span>
        <div>
          <h3 className="text-lg font-bold text-charcoal">{node.name}</h3>
          <p className="text-sm text-charcoal-faint">{node.tier}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Chip
          icon={<VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
          label={node.meta.siwes ? 'SIWES Eligible' : 'Not Eligible'}
          size="small"
          sx={{
            bgcolor: node.meta.siwes ? 'primary.soft' : 'action.hover',
            color: node.meta.siwes ? 'primary.main' : 'text.secondary',
            fontWeight: 700,
          }}
        />
        {node.meta.chunks && (
          <Chip
            label={`${node.meta.chunks} grounded chunk${node.meta.chunks > 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            sx={{ color: 'charcoal.soft', borderColor: 'border.strong', fontWeight: 700 }}
          />
        )}
        {node.meta.code && (
          <Chip
            label={node.meta.code}
            size="small"
            variant="outlined"
            sx={{ color: 'charcoal.soft', borderColor: 'border.strong', fontWeight: 700 }}
          />
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          { k: 'Registry', v: node.meta.reg || '—' },
          { k: 'Type', v: node.meta.type || '—' },
          { k: 'Departments', v: node.meta.depts ?? '—' },
          { k: 'Programmes', v: node.meta.programmes ?? '—' },
          { k: 'Rubric', v: node.meta.rubric || '—' },
        ].map((r) => (
          <div key={r.k} className="rounded-[15px] bg-bgsoft px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
              {r.k}
            </p>
            <p className="mt-0.5 text-sm font-bold text-charcoal">{r.v}</p>
          </div>
        ))}
      </div>

      <Button
        variant="outlined"
        color="inherit"
        size="small"
        fullWidth
        sx={{ mt: 4, color: 'primary.main', borderColor: 'primary.main' }}
      >
        Inspect in Knowledge Base
      </Button>
    </Panel>
  )
}

export default function HierarchyExplorer() {
  const [selected, setSelected] = useState(Hierarchy)
  const [divisionOpen, setDivisionOpen] = useState(false)
  const [expanded, setExpanded] = useState({
    institution: true,
    s1: true,
    d1: false,
    d2: false,
    d3: false,
  })

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))

  return (
    <div>
      <PageHead
        eyebrow="Institutional Structure"
        title="4-Tier Hierarchy Explorer"
        sub="Every faculty, department, and degree option mapped as a strictly relational governance tree."
        actions={
          <>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setDivisionOpen(true)}
              sx={{ color: 'primary.main', borderColor: 'primary.main' }}
            >
              Add Academic Division
            </Button>
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
            >
              Export Hierarchy
            </Button>
          </>
        }
      />

      <AddDivisionModal
        open={divisionOpen}
        onClose={() => setDivisionOpen(false)}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TierMeta.map((t) => {
          const Icon = t.icon
          return (
            <Panel key={t.tier} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[15px] bg-primary-soft">
                  <Icon sx={{ fontSize: 20, color: 'primary.main' }} />
                </span>
                <div>
                  <p className="text-sm font-bold text-charcoal">{t.label}</p>
                  <p className="text-xs font-semibold text-primary">{t.tier}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-charcoal-faint">{t.note}</p>
            </Panel>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <p className="mb-4 text-sm font-bold text-charcoal">
            Hierarchy Tree — click to inspect any node
          </p>
          <TierNode
            node={Hierarchy}
            depth={0}
            selected={selected}
            onSelect={setSelected}
            expanded={expanded}
            onToggle={toggle}
          />
        </Panel>
        <DetailPanel node={selected} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={SchoolIcon}
          value="1"
          label="Institution (Tier 1)"
          sub="FUT Minna — NUC regulated"
        />
        <StatCard
          icon={DomainIcon}
          value="1"
          label="School / Faculty (Tier 2)"
          sub="School of Engineering & Technology"
        />
        <StatCard
          icon={AccountTreeIcon}
          value="3"
          label="Departments (Tier 3)"
          sub="3 SIWES eligible (100%)"
        />
      </div>
    </div>
  )
}

const DivisionInitial = {
  name: '',
  code: '',
  dean: '',
  email: '',
}

function AddDivisionModal({ open, onClose }) {
  const [form, setForm] = useState(DivisionInitial)
  const [error, setError] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const fieldProps = (k, label, placeholder) => ({
    label,
    placeholder,
    size: 'medium',
    fullWidth: true,
    value: form[k],
    onChange: update(k),
    error: error && !form[k],
    sx: { '& .MuiOutlinedInput-root': { borderRadius: '15px' } },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.code || !form.dean || !form.email) {
      setError(true)
      return
    }
    setError(false)
    setSubmitted(true)
  }

  const handleClose = () => {
    setSubmitted(false)
    setError(false)
    setForm(DivisionInitial)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
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
          onClick={handleClose}
          aria-label="Close"
          sx={{ position: 'absolute', right: 14, top: 14, color: 'charcoal.faint' }}
        >
          <CloseIcon />
        </IconButton>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Academic Structure
        </p>
        <h2 className="mt-2 text-xl text-charcoal">
          Add Academic Division (Tier 2: School)
        </h2>
        <p className="mt-1 text-sm text-charcoal-faint">
          Map a new school/faculty into the institutional hierarchy.
        </p>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 3, md: 4 }, py: 3.5 }}>
        {submitted ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[15px] bg-primary-soft">
              <CheckCircleIcon sx={{ fontSize: 30, color: 'primary.main' }} />
            </span>
            <h3 className="mt-4 text-lg text-charcoal">School created</h3>
            <p className="mt-1 text-sm text-charcoal-faint">
              <strong>{form.name}</strong> is now mapped as a Tier 2 division.
            </p>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClose}
              sx={{ mt: 4 }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            <TextField
              {...fieldProps('name', 'School Name *', 'e.g. School of Physical Sciences')}
            />
            <TextField
              {...fieldProps('code', 'School Acronym / Code *', 'e.g. FPS / SICT / SEET')}
            />
            <TextField
              {...fieldProps('dean', 'Dean Full Name *', 'e.g. Prof. J. O. Adebayo')}
            />
            <TextField
              {...fieldProps('email', 'Dean Official Email *', 'e.g. dean.science@univ.edu.ng')}
              type="email"
            />
          </form>
        )}
      </DialogContent>

      {!submitted && (
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
            onClick={handleClose}
            sx={{ color: 'text.primary', borderColor: 'border.strong' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Create School
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
