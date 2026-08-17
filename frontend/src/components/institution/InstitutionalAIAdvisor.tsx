import { useState, type FC, type FormEvent } from 'react';
import type {
  AIAdvisorResponse,
  AIAdvisorCitation,
  InstitutionHierarchyTree,
  AcademicSession,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Button,
  Chip,
  MenuItem,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Search as SearchIcon,
  VerifiedUser as VerifiedUserIcon,
  MenuBook as MenuBookIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { Panel, PanelHead } from './Shared';

interface InstitutionalAIAdvisorProps {
  institutionId: string;
  institutionName: string;
  tierTwoTerm: string;
  tree: InstitutionHierarchyTree | null;
  sessions: AcademicSession[];
  authToken?: string | null;
}

export const InstitutionalAIAdvisor: FC<InstitutionalAIAdvisorProps> = ({
  institutionId,
  institutionName,
  tierTwoTerm,
  tree,
  sessions,
  authToken,
}) => {
  const [query, setQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIAdvisorResponse | null>(null);
  const [activeCitation, setActiveCitation] = useState<AIAdvisorCitation | null>(null);

  // Suggested questions for rapid testing
  const sampleQuestions = [
    `What are the SIWES placement prerequisites and logbook requirements for ${institutionName}?`,
    `What is the minimum CGPA required for industrial attachment clearance?`,
    `Explain the final year capstone project defense rules and grading rubric.`,
    `What are the academic probation and spillover criteria in the student handbook?`,
  ];

  const availableDepts = selectedDivision && tree
    ? tree.divisions.find((d) => d.id === selectedDivision)?.departments || []
    : [];

  const handleAsk = async (questionText?: string) => {
    const q = questionText || query;
    if (!q.trim()) return;

    setLoading(true);
    setActiveCitation(null);
    try {
      const res = await institutionApi.askAdvisor(
        institutionId,
        {
          query: q.trim(),
          division: selectedDivision || undefined,
          department: selectedDepartment || undefined,
          session: selectedSession || undefined,
          doc_type: selectedDocType || undefined,
          top_k: 5,
        },
        authToken || undefined
      );
      setResponse(res);
      if (res.citations && res.citations.length > 0) {
        setActiveCitation(res.citations[0]);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Advisor inquiry failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    handleAsk();
  };

  return (
    <div>
      <Panel>
        <PanelHead
          title="Institutional AI Academic & Policy Advisor"
          sub={`Authoritative answers synthesized exclusively from verified ${institutionName} student handbooks, SIWES calendars, and Senate regulations.`}
          action={
            <div className="flex gap-2">
              <Chip
                icon={<VerifiedUserIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
                label="Zero-Hallucination Grounding"
                size="small"
                sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
              />
              <Chip
                label="Groq Llama-3.3-70B"
                size="small"
                variant="outlined"
                sx={{ color: 'charcoal.soft', borderColor: 'border.strong', fontWeight: 700 }}
              />
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            fullWidth
            size="small"
            select
            label={`Scope: ${tierTwoTerm}`}
            value={selectedDivision}
            onChange={(e) => {
              setSelectedDivision(e.target.value);
              setSelectedDepartment('');
            }}
          >
            <MenuItem value="">Institution-Wide (All {tierTwoTerm}s)</MenuItem>
            {tree?.divisions.map((div) => (
              <MenuItem key={div.id} value={div.id}>
                {div.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            size="small"
            select
            label="Scope: Department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            disabled={!selectedDivision}
          >
            <MenuItem value="">All Departments in {tierTwoTerm}</MenuItem>
            {availableDepts.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            size="small"
            select
            label="Academic Session"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <MenuItem value="">All Session Documents</MenuItem>
            {sessions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.session_label} {s.is_current ? '(Current)' : ''}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            size="small"
            select
            label="Document Category"
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
          >
            <MenuItem value="">All Document Categories</MenuItem>
            <MenuItem value="STUDENT_HANDBOOK">Student Handbook</MenuItem>
            <MenuItem value="SIWES_CALENDAR">SIWES / ITCC Calendar</MenuItem>
            <MenuItem value="INTERNSHIP_RUBRIC">Internship Rubric</MenuItem>
            <MenuItem value="FACULTY_POLICY">Faculty / Senate Policy</MenuItem>
          </TextField>
        </div>

        <form onSubmit={onSubmitForm} className="mt-4 flex items-center gap-2">
          <TextField
            fullWidth
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="Ask anything about SIWES guidelines, course prerequisites, graduation criteria, or Senate regulations..."
            slotProps={{
              input: {
                startAdornment: (
                  <SearchIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                ),
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !query.trim()}
            startIcon={loading ? <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <AutoAwesomeIcon />}
          >
            {loading ? 'Thinking...' : 'Ask Advisor'}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-charcoal-faint">Try asking:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:bg-primary-soft hover:text-primary"
              onClick={() => {
                setQuery(q);
                handleAsk(q);
              }}
              disabled={loading}
            >
              {q} <ArrowForwardIcon sx={{ fontSize: 11 }} />
            </button>
          ))}
        </div>
      </Panel>

      {loading && <LinearProgress sx={{ mt: 3, borderRadius: 99, height: 6 }} />}

      {response && !loading && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHead
              title={
                <span className="flex items-center gap-2">
                  <VerifiedUserIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  Grounded Institutional Advice
                </span>
              }
              sub={
                <span className="text-xs text-charcoal-faint">
                  {response.telemetry.model} · {response.telemetry.latency_ms}ms ·{' '}
                  {response.citations.length} Grounded Sources
                </span>
              }
            />
            <div className="space-y-3 text-sm leading-relaxed text-charcoal">
              {response.answer.split('\n\n').map((paragraph, pIdx) => {
                if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                  return (
                    <ul key={pIdx} className="list-inside list-disc space-y-1">
                      {paragraph.split('\n').map((item, iIdx) => (
                        <li key={iIdx}>{item.replace(/^[-*]\s+/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                if (paragraph.startsWith('### ') || paragraph.startsWith('## ')) {
                  return (
                    <h5 key={pIdx} className="text-sm font-bold text-charcoal">
                      {paragraph.replace(/^#{2,3}\s+/, '')}
                    </h5>
                  );
                }
                return <p key={pIdx}>{paragraph}</p>;
              })}
            </div>

            {response.citations.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-charcoal-faint">
                  Referenced Handbook Sources:
                </p>
                <div className="flex flex-wrap gap-2">
                  {response.citations.map((c) => (
                    <button
                      key={c.chunk_id}
                      type="button"
                      onClick={() => setActiveCitation(c)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                        activeCitation?.chunk_id === c.chunk_id
                          ? 'bg-primary text-white'
                          : 'bg-primary-soft text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      <strong>{c.citation_label}</strong> {c.document_title} (p.
                      {c.page_number})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHead
              title={
                <span className="flex items-center gap-2">
                  <MenuBookIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  Verified Citation Inspector
                </span>
              }
            />
            {activeCitation ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip
                    size="small"
                    label={`${activeCitation.citation_label} Official Grounding Source`}
                    sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
                  />
                  <Chip
                    size="small"
                    label={`${Math.round(activeCitation.relevance_score * 100)}% Match`}
                    sx={{ bgcolor: 'charcoal', color: '#fff', fontWeight: 700 }}
                  />
                </div>
                <p className="mt-3 text-sm font-bold text-charcoal">
                  {activeCitation.document_title}
                </p>
                <p className="mt-1 text-xs text-charcoal-faint">
                  {activeCitation.doc_type_display} · Page {activeCitation.page_number} ·{' '}
                  <strong>{activeCitation.section_reference || 'General Section'}</strong>
                </p>
                <div className="mt-3 rounded-[15px] border-l-4 border-primary bg-bgsoft px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                    Official Extracted Excerpt:
                  </p>
                  <p className="mt-1 text-sm italic text-charcoal">
                    "{activeCitation.content_snippet}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <DescriptionIcon sx={{ fontSize: 28, color: 'charcoal.faint' }} />
                <p className="text-sm text-charcoal-faint">
                  Click any citation tag to inspect the exact official handbook excerpt.
                </p>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
};