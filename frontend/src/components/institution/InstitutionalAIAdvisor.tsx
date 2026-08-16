import { useState, type FC, type FormEvent } from 'react';
import type {
  AIAdvisorResponse,
  AIAdvisorCitation,
  InstitutionHierarchyTree,
  AcademicSession,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  SparklesIcon,
  SearchIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  FileTextIcon,
  ArrowRightIcon,
  RefreshCwIcon,
} from '../icons';

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
    <div className="ai-advisor-container">
      {/* Advisor Header */}
      <div className="ai-advisor-header">
        <div className="ai-header-info">
          <div className="ai-badge-row">
            <span className="ai-tag">
              <SparklesIcon size={12} color="#0284c7" /> Zero-Hallucination Grounding
            </span>
            <span className="ai-model-pill">Groq Llama-3.3-70B</span>
          </div>
          <h3 className="ai-title">Institutional AI Academic & Policy Advisor</h3>
          <p className="ai-sub">
            Authoritative answers synthesized exclusively from verified <strong>{institutionName}</strong> student handbooks, SIWES calendars, and Senate regulations.
          </p>
        </div>
      </div>

      {/* Scoping Filter Bar */}
      <div className="ai-scoping-bar">
        <div className="scope-field">
          <label>Scope: {tierTwoTerm}</label>
          <select
            value={selectedDivision}
            onChange={(e) => {
              setSelectedDivision(e.target.value);
              setSelectedDepartment('');
            }}
          >
            <option value="">Institution-Wide (All {tierTwoTerm}s)</option>
            {tree?.divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.name}
              </option>
            ))}
          </select>
        </div>

        <div className="scope-field">
          <label>Scope: Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            disabled={!selectedDivision}
          >
            <option value="">All Departments in {tierTwoTerm}</option>
            {availableDepts.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="scope-field">
          <label>Academic Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">All Session Documents</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.session_label} {s.is_current ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="scope-field">
          <label>Document Category</label>
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
          >
            <option value="">All Document Categories</option>
            <option value="STUDENT_HANDBOOK">Student Handbook</option>
            <option value="SIWES_CALENDAR">SIWES / ITCC Calendar</option>
            <option value="INTERNSHIP_RUBRIC">Internship Rubric</option>
            <option value="FACULTY_POLICY">Faculty / Senate Policy</option>
          </select>
        </div>
      </div>

      {/* Query Search Form */}
      <form onSubmit={onSubmitForm} className="ai-query-form">
        <div className="ai-input-wrap">
          <SearchIcon size={18} color="#0284c7" />
          <input
            type="text"
            placeholder="Ask anything about SIWES guidelines, course prerequisites, graduation criteria, or Senate regulations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary btn-ask" disabled={loading || !query.trim()}>
            {loading ? (
              <>
                <RefreshCwIcon size={14} className="spin-icon" /> Thinking...
              </>
            ) : (
              <>
                <SparklesIcon size={14} /> Ask Advisor
              </>
            )}
          </button>
        </div>
      </form>

      {/* Pre-canned Quick Questions */}
      <div className="ai-suggestions-row">
        <span className="suggestions-label">Try asking:</span>
        <div className="suggestions-list">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="suggestion-chip"
              onClick={() => {
                setQuery(q);
                handleAsk(q);
              }}
              disabled={loading}
            >
              {q} <ArrowRightIcon size={11} />
            </button>
          ))}
        </div>
      </div>

      {/* Results & Citation Inspector Split View */}
      {response && (
        <div className="ai-results-grid">
          {/* Main Answer Card */}
          <div className="ai-answer-card">
            <div className="ai-answer-header">
              <div className="answer-title-block">
                <ShieldCheckIcon size={18} color="#059669" />
                <h4>Grounded Institutional Advice</h4>
              </div>
              <div className="ai-telemetry-badge">
                <span>{response.telemetry.model}</span> ·{' '}
                <span>{response.telemetry.latency_ms}ms</span> ·{' '}
                <span>{response.citations.length} Grounded Sources</span>
              </div>
            </div>

            <div className="ai-answer-body">
              <div className="ai-markdown-content">
                {response.answer.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                    return (
                      <ul key={pIdx} className="ai-bullet-list">
                        {paragraph.split('\n').map((item, iIdx) => (
                          <li key={iIdx}>{item.replace(/^[-*]\s+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith('### ') || paragraph.startsWith('## ')) {
                    return (
                      <h5 key={pIdx} className="ai-subheading">
                        {paragraph.replace(/^#{2,3}\s+/, '')}
                      </h5>
                    );
                  }
                  return (
                    <p key={pIdx} className="ai-paragraph">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Citations Footer Strip */}
            {response.citations.length > 0 && (
              <div className="ai-citations-strip">
                <span className="citations-label">Referenced Handbook Sources:</span>
                <div className="citations-chips">
                  {response.citations.map((c) => (
                    <button
                      key={c.chunk_id}
                      type="button"
                      className={`citation-chip ${activeCitation?.chunk_id === c.chunk_id ? 'active' : ''}`}
                      onClick={() => setActiveCitation(c)}
                    >
                      <strong>{c.citation_label}</strong> {c.document_title} (p.{c.page_number})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Citation Inspector Side Panel */}
          <div className="ai-citation-inspector">
            <div className="inspector-header">
              <BookOpenIcon size={16} color="#0284c7" />
              <h5>Verified Citation Inspector</h5>
            </div>

            {activeCitation ? (
              <div className="inspector-card">
                <div className="inspector-badge-row">
                  <span className="source-label">{activeCitation.citation_label} Official Grounding Source</span>
                  <span className="score-tag">
                    {Math.round(activeCitation.relevance_score * 100)}% Match
                  </span>
                </div>

                <h6 className="inspector-doc-title">{activeCitation.document_title}</h6>
                <div className="inspector-meta-row">
                  <span>{activeCitation.doc_type_display}</span> ·{' '}
                  <span>Page {activeCitation.page_number}</span> ·{' '}
                  <strong>{activeCitation.section_reference || 'General Section'}</strong>
                </div>

                <div className="inspector-excerpt-box">
                  <span className="excerpt-label">Official Extracted Excerpt:</span>
                  <p className="excerpt-text">"{activeCitation.content_snippet}"</p>
                </div>
              </div>
            ) : (
              <div className="inspector-empty">
                <FileTextIcon size={24} color="#94a3b8" />
                <p>Click any citation tag [1], [2] to inspect the exact official handbook excerpt.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
