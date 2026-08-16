import { useState } from 'react'
import {
  Button,
  Chip,
  TextField,
  InputAdornment,
  LinearProgress,
  Divider,
} from '@mui/material'
import {
  MenuBook as MenuBookIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  Memory as MemoryIcon,
  Search as SearchIcon,
  FactCheck as FactCheckIcon,
  Verified as VerifiedIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material'
import { Panel, PanelHead, PageHead, StatCard } from './Shared'

const Documents = [
  {
    name: 'Senate Academic Handbook',
    kind: 'Senate Directive',
    chunks: 1,
    sources: '3',
    status: 'Grounded',
    snippet: 'Degree requirements, grading conventions, and examination regulations.',
  },
  {
    name: 'SIWES Placement Policy',
    kind: 'Policy',
    chunks: 1,
    sources: '2',
    status: 'Grounded',
    snippet: 'Eligibility rules, supervisor ratios, and ITF cycle sign-off workflow.',
  },
  {
    name: 'Course Rubrics Compendium',
    kind: 'Curriculum',
    chunks: 1,
    sources: '4',
    status: 'Grounded',
    snippet: 'Outcome statements and assessment rubrics mapped per programme.',
  },
  {
    name: 'Institutional Directives & Circulars',
    kind: 'Directive',
    chunks: 1,
    sources: '3',
    status: 'Pending Review',
    snippet: 'Standing orders, board resolutions, and accreditation circulars.',
  },
]

const mockClaims = [
  'SIWES eligibility requires a CGPA of 2.50 or higher at the point of posting.',
  'Final-year students must complete a minimum of six months of approved industrial training.',
]

const GroundedChunk = {
  text: 'Student shall be eligible for the Students Industrial Work Experience Scheme (SIWES) where they have attained a CGPA of at least 2.50 and completed 200-level coursework. Placement is coordinated by the departmental SIWES Coordinator and logged to the ITF cycle by the Career Services Office.',
  source: 'SIWES Placement Policy',
  section: 'Section 4.2 — Eligibility',
  confidence: 98,
  page: 'p. 12',
}

export default function KnowledgeBase() {
  const [query, setQuery] = useState('')
  const [claim, setClaim] = useState('')
  const [result, setResult] = useState(null)
  const [searching, setSearching] = useState(false)

  const test = (text) => {
    const value = text ?? claim
    if (!value.trim()) return
    setSearching(true)
    setTimeout(() => {
      setResult(value)
      setSearching(false)
    }, 700)
  }

  return (
    <div>
      <PageHead
        eyebrow="Document Grounding"
        title="Knowledge Base & Citation Tester"
        sub="Institution handbooks and policies chunked into pgvector with exact, citable grounding."
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AutoAwesomeIcon />}
          >
            Re-Index Documents
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={MenuBookIcon}
          value="4"
          label="Documents Indexed"
          sub="Senate, SIWES, rubrics, directives"
        />
        <StatCard
          icon={MemoryIcon}
          value="2"
          label="Grounded Vector Chunks"
          sub="Active in pgvector"
          chip="Live"
        />
        <StatCard
          icon={LinkIcon}
          value="12"
          label="Citations Resolved"
          sub="Exact source references"
        />
        <StatCard
          icon={FactCheckIcon}
          value="100%"
          label="Grounded Answer Coverage"
          sub="Zero unbacked claims policy"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHead
            title="Institution Documents"
            sub="Search or filter the grounded knowledge corpus"
          />
          <TextField
            size="medium"
            fullWidth
            placeholder="Search documents, policies, or citations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': { borderRadius: '15px' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'charcoal.faint' }} />
                </InputAdornment>
              ),
            }}
          />
          <div className="space-y-3">
            {Documents.map((d) => {
              const grounded = d.status === 'Grounded'
              return (
                <div
                  key={d.name}
                  className="flex flex-col gap-3 rounded-[15px] border border-line p-4 sm:flex-row sm:items-center"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
                    <DescriptionIcon sx={{ color: 'primary.main' }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-charcoal">{d.name}</p>
                      <Chip
                        label={d.kind}
                        size="small"
                        variant="outlined"
                        sx={{ color: 'charcoal.faint', borderColor: 'border.strong', fontSize: 11, fontWeight: 600 }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-charcoal-faint">{d.snippet}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-charcoal-faint">
                      <span>{d.chunks} chunk{d.chunks > 1 ? 's' : ''}</span>
                      <span>{d.sources} sources</span>
                      <Chip
                        icon={grounded ? <VerifiedIcon sx={{ fontSize: 12, color: 'primary.main' }} /> : undefined}
                        label={d.status}
                        size="small"
                        sx={{
                          bgcolor: grounded ? 'primary.soft' : 'action.hover',
                          color: grounded ? 'primary.main' : 'text.secondary',
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={() => test(`Please verify: ${d.name.split(' ')[0]} ${d.name.split(' ')[1]} requirements for final-year students.`)}
                    sx={{ color: 'primary.main', borderColor: 'primary.main', whiteSpace: 'nowrap' }}
                  >
                    Test Citation
                  </Button>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel>
          <PanelHead
            title="Citation Tester"
            sub="Paste a claim to verify its grounding against institution sources"
          />
          <TextField
            size="medium"
            fullWidth
            multiline
            minRows={4}
            placeholder="Paste a student-facing claim or AI-generated answer here…"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {mockClaims.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setClaim(c)
                  test(c)
                }}
                className="rounded-[15px] border border-line bg-bgsoft px-2.5 py-1.5 text-left text-[11px] font-semibold text-charcoal-soft hover:border-primary/40 hover:text-primary"
              >
                {c.length > 58 ? `${c.slice(0, 58)}…` : c}
              </button>
            ))}
          </div>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={searching}
            onClick={() => test()}
          >
            {searching ? 'Verifying grounding…' : 'Test Grounding'}
          </Button>

          {searching && (
            <LinearProgress sx={{ mt: 3, borderRadius: 99, height: 6, bgcolor: 'primary.soft' }} />
          )}

          {result && !searching && (
            <>
              <Divider sx={{ my: 4 }} />
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                Grounding Result
              </p>
              <div className="mt-3 rounded-[15px] border border-line bg-bgsoft p-4">
                <div className="flex items-center gap-2">
                  <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <p className="text-sm font-bold text-charcoal">
                    Claim verified against institution sources
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-charcoal-soft">
                  “{result.slice(0, 160)}
                  {result.length > 160 ? '…' : ''}”
                </p>
              </div>
              <div className="mt-4 rounded-[15px] border border-line p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                  Grounded chunk
                </p>
                <p className="mt-2 text-xs leading-relaxed text-charcoal-soft">
                  {GroundedChunk.text}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip
                    label={GroundedChunk.source}
                    size="small"
                    sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
                  />
                  <Chip
                    label={GroundedChunk.section}
                    size="small"
                    variant="outlined"
                    sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
                  />
                  <Chip
                    label={GroundedChunk.page}
                    size="small"
                    variant="outlined"
                    sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal-faint">
                    Similarity confidence
                  </span>
                  <span className="text-sm font-extrabold text-primary">
                    {GroundedChunk.confidence}%
                  </span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={GroundedChunk.confidence}
                  sx={{ mt: 1, height: 8, borderRadius: 99, bgcolor: 'primary.soft' }}
                />
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  )
}
