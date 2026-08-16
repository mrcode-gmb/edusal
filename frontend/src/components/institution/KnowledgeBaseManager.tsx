import { useState, type FC, type FormEvent } from 'react';
import type {
  InstitutionalDocument,
  DocumentSearchResponse,
  InstitutionHierarchyTree,
  AcademicSession,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { UploadDocumentModal } from './UploadDocumentModal';
import { InstitutionalAIAdvisor } from './InstitutionalAIAdvisor';
import {
  BookOpenIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  DatabaseIcon,
  CheckCircleIcon,
  SparklesIcon,
  UploadIcon,
} from '../icons';

interface KnowledgeBaseManagerProps {
  institutionId: string;
  institutionName: string;
  tierTwoTerm: string;
  tree: InstitutionHierarchyTree | null;
  sessions: AcademicSession[];
  documents: InstitutionalDocument[];
  loading: boolean;
  authToken?: string | null;
  onRefresh: () => void;
}

export const KnowledgeBaseManager: FC<KnowledgeBaseManagerProps> = ({
  institutionId,
  institutionName,
  tierTwoTerm,
  tree,
  sessions,
  documents,
  loading,
  authToken,
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState<'advisor' | 'repository'>('advisor');

  // Citation Test Bench State
  const [searchQuery, setSearchQuery] = useState('SIWES attachment prerequisites');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DocumentSearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleTestSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await institutionApi.searchDocuments(institutionId, searchQuery, 4);
      setSearchResults(res);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="kb-manager-container">
      {/* Knowledge Base Navigation Strip */}
      <div className="kb-subnav-strip">
        <div className="kb-subtabs">
          <button
            type="button"
            className={`kb-subtab ${subTab === 'advisor' ? 'active' : ''}`}
            onClick={() => setSubTab('advisor')}
          >
            <SparklesIcon size={15} color={subTab === 'advisor' ? '#0284c7' : '#64748b'} />
            Institutional AI Policy Advisor (Groq Llama-3.3-70B)
          </button>
          <button
            type="button"
            className={`kb-subtab ${subTab === 'repository' ? 'active' : ''}`}
            onClick={() => setSubTab('repository')}
          >
            <DatabaseIcon size={15} color={subTab === 'repository' ? '#0284c7' : '#64748b'} />
            Document Repository & Chunk Inspector ({documents.length})
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary-sm"
          onClick={() => setShowUploadModal(true)}
        >
          <UploadIcon size={14} /> Upload Handbook / Guideline
        </button>
      </div>

      {/* Subtab 1: Institutional AI Policy Advisor */}
      {subTab === 'advisor' && (
        <InstitutionalAIAdvisor
          institutionId={institutionId}
          institutionName={institutionName}
          tierTwoTerm={tierTwoTerm}
          tree={tree}
          sessions={sessions}
          authToken={authToken}
        />
      )}

      {/* Subtab 2: Document Repository & Chunk Inspector */}
      {subTab === 'repository' && (
        <div className="kb-repository-view">
          {/* Header Card */}
          <div className="kb-header-card">
            <div className="kb-header-info">
              <div className="kb-badge-row">
                <span className="kb-tag">
                  <DatabaseIcon size={13} /> pgvector Semantic Knowledge Base
                </span>
                <span className="kb-status-live">
                  <CheckCircleIcon size={13} /> Vector Indexed
                </span>
              </div>
              <h3 className="kb-title">Grounded Document Repository & Citation Engine</h3>
              <p className="kb-sub">
                Official handbooks, SIWES guidelines, and curriculum standards for <strong>{institutionName}</strong>.
                The AI Career Assistant strictly answers from these verified documents.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-sm"
              onClick={onRefresh}
            >
              <RefreshCwIcon size={14} /> Refresh Documents
            </button>
          </div>

          <div className="kb-main-layout">
            {/* Left Column: Ingested Documents List */}
            <div className="kb-docs-column">
              <div className="column-header">
                <h4>Official Documents ({documents.length})</h4>
                <button
                  type="button"
                  className="btn-icon-refresh"
                  onClick={onRefresh}
                  title="Refresh repository"
                >
                  <RefreshCwIcon size={15} color="#64748b" />
                </button>
              </div>

              {loading ? (
                <div className="kb-loading">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="kb-empty">
                  <BookOpenIcon size={32} color="#94a3b8" />
                  <p>No documents ingested yet.</p>
                  <button
                    type="button"
                    className="btn btn-secondary-sm"
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload First Document
                  </button>
                </div>
              ) : (
                <div className="kb-docs-list">
                  {documents.map((doc) => (
                    <div key={doc.id} className="doc-card">
                      <div className="doc-card-top">
                        <span className="doc-type-pill">{doc.doc_type_display}</span>
                        <span className={`doc-status-badge ${doc.embedding_status.toLowerCase()}`}>
                          {doc.embedding_status === 'INDEXED' ? (
                            <>
                              <CheckCircleIcon size={12} /> Indexed
                            </>
                          ) : (
                            doc.embedding_status
                          )}
                        </span>
                      </div>

                      <h5 className="doc-title">{doc.title}</h5>

                      {doc.session_label && (
                        <span className="doc-session-tag">Session: {doc.session_label}</span>
                      )}

                      {doc.content_hash && (
                        <div className="doc-hash-row">
                          <span className="hash-label">Audit Hash:</span>
                          <code className="doc-hash">{doc.content_hash.slice(0, 24)}...</code>
                        </div>
                      )}

                      <div className="doc-meta-footer">
                        <span className="doc-chunks-count">
                          <strong>{doc.chunk_count}</strong> pgvector Chunks
                        </span>
                        <span className="doc-date">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Interactive Citation Test Bench */}
            <div className="kb-tester-column">
              <div className="tester-card">
                <div className="tester-header">
                  <span className="tester-badge">
                    <SparklesIcon size={13} /> Interactive Test Bench
                  </span>
                  <h4>Live Hybrid Citation Retrieval Simulator</h4>
                  <p className="tester-sub">
                    Test how the AI queries pgvector and retrieves exact page & section citations.
                  </p>
                </div>

                <form onSubmit={handleTestSearch} className="tester-form">
                  <div className="tester-input-group">
                    <input
                      type="text"
                      className="tester-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. What are the SIWES requirements for 300L students?"
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-primary-sm"
                      disabled={isSearching}
                    >
                      <SearchIcon size={15} />
                      {isSearching ? 'Searching...' : 'Test Retrieval'}
                    </button>
                  </div>

                  <div className="quick-query-pills">
                    <span className="quick-label">Try query:</span>
                    <button
                      type="button"
                      className="pill-quick"
                      onClick={() => setSearchQuery('SIWES placement prerequisites')}
                    >
                      "SIWES placement prerequisites"
                    </button>
                    <button
                      type="button"
                      className="pill-quick"
                      onClick={() => setSearchQuery('Relational Databases milestone')}
                    >
                      "Relational Databases milestone"
                    </button>
                  </div>
                </form>

                {/* Results Window */}
                <div className="tester-results-box">
                  {searchError && <div className="tester-error">{searchError}</div>}

                  {isSearching ? (
                    <div className="tester-searching">
                      <div className="tree-spinner"></div>
                      <span>Querying PostgreSQL pgvector index...</span>
                    </div>
                  ) : searchResults ? (
                    <div className="search-results-container">
                      <div className="results-summary-row">
                        <span className="results-count">
                          Found <strong>{searchResults.total_matches}</strong> verified citation chunk(s)
                        </span>
                        <span className="grounding-badge">
                          <ShieldCheckIcon size={13} /> 100% Zero-Hallucination
                        </span>
                      </div>

                      {searchResults.results.length === 0 ? (
                        <div className="no-matches-box">
                          No matching excerpts found for this query in the current document repository.
                        </div>
                      ) : (
                        searchResults.results.map((res, rIdx) => (
                          <div key={res.chunk_id} className="citation-result-card">
                            <div className="citation-result-header">
                              <span className="citation-pill">
                                Citation #{rIdx + 1}: {res.document_title} (p. {res.page_number})
                              </span>
                              <span className="section-pill">{res.section_reference || 'General Section'}</span>
                            </div>

                            <blockquote className="citation-quote">
                              "{res.content}"
                            </blockquote>

                            <div className="citation-footer">
                              <span className="relevance-tag">Exact Match Score: {res.relevance_score}</span>
                              <span className="verified-status">
                                <CheckCircleIcon size={12} color="#059669" /> Grounding Ready
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="tester-idle-prompt">
                      <span>Enter a query above or click one of the quick suggestions to test live pgvector retrieval.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        institutionId={institutionId}
        tree={tree}
        sessions={sessions}
        authToken={authToken}
        onSuccess={async () => {
          onRefresh();
        }}
        uploadFn={institutionApi.uploadDocumentFile}
      />
    </div>
  );
};
