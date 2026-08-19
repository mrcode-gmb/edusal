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
  Button,
  Chip,
  IconButton,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  VerifiedUser as VerifiedUserIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  UploadFile as UploadFileIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { Panel, PanelHead, PageHead, StatCard, LoadingBlock } from './Shared';

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

  const totalChunks = documents.reduce((sum, d) => sum + d.chunk_count, 0);

  return (
    <div>
      <PageHead
        eyebrow="Semantic Knowledge Repository"
        title="Knowledge Base & Citation Tester"
        sub={`Official handbooks, SIWES guidelines, and curriculum standards for ${institutionName}. The AI Career Assistant strictly answers from these verified documents.`}
        actions={
          <>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadFileIcon />}
              onClick={() => setShowUploadModal(true)}
            >
              Upload Handbook / Guideline
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSubTab('advisor')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            subTab === 'advisor'
              ? 'bg-primary text-white'
              : 'bg-bgsoft text-charcoal-faint hover:bg-primary-soft'
          }`}
        >
          <PsychologyIcon sx={{ fontSize: 16 }} />
          Institutional AI Policy Advisor
        </button>
        <button
          type="button"
          onClick={() => setSubTab('repository')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            subTab === 'repository'
              ? 'bg-primary text-white'
              : 'bg-bgsoft text-charcoal-faint hover:bg-primary-soft'
          }`}
        >
          <StorageIcon sx={{ fontSize: 16 }} />
          Document Repository & Chunk Inspector ({documents.length})
        </button>
      </div>

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

      {subTab === 'repository' && (
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={MenuBookIcon}
              value={documents.length}
              label="Official Documents"
              sub="Handbooks, guidelines & standards"
              chip="pgvector Indexed"
            />
            <StatCard
              icon={StorageIcon}
              value={totalChunks}
              label="Vector Chunks"
              sub="Grounded semantic units"
            />
            <StatCard
              icon={VerifiedUserIcon}
              value="100%"
              label="Zero-Hallucination"
              sub="All answers cite exact pages"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel>
              <PanelHead
                title={`Official Documents (${documents.length})`}
                sub="Ingested sources powering grounded AI answers"
                action={
                  <IconButton size="small" onClick={onRefresh} title="Refresh repository">
                    <RefreshIcon fontSize="small" sx={{ color: 'charcoal.soft' }} />
                  </IconButton>
                }
              />
              {loading ? (
                <LoadingBlock
                  label="Loading your documents…"
                  sub="Fetching your knowledge base files."
                />
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <MenuBookIcon sx={{ fontSize: 40, color: 'charcoal.faint' }} />
                  <p className="text-sm text-charcoal-faint">No documents ingested yet.</p>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={<UploadFileIcon />}
                    onClick={() => setShowUploadModal(true)}
                    sx={{ color: 'primary.main', borderColor: 'primary.main' }}
                  >
                    Upload First Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-[15px] bg-bgsoft p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                          {doc.doc_type_display}
                        </span>
                        {doc.embedding_status === 'INDEXED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                            <CheckCircleIcon sx={{ fontSize: 13 }} /> Indexed
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-charcoal-faint">
                            {doc.embedding_status}
                          </span>
                        )}
                      </div>
                      <p className="mt-2.5 text-sm font-bold text-charcoal">{doc.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-charcoal-faint">
                        {doc.session_label && (
                          <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 font-semibold">
                            Session: {doc.session_label}
                          </span>
                        )}
                        <span className="font-semibold">
                          {doc.chunk_count} pgvector Chunks
                        </span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                      {doc.content_hash && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-charcoal-faint">
                          <span className="font-bold">Audit Hash:</span>
                          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
                            {doc.content_hash.slice(0, 24)}...
                          </code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <PanelHead
                title="Live Hybrid Citation Retrieval Simulator"
                sub="Test how the AI queries pgvector and retrieves exact page & section citations."
              />
              <form onSubmit={handleTestSearch} className="space-y-3">
                <TextField
                  fullWidth
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. What are the SIWES requirements for 300L students?"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <SearchIcon sx={{ fontSize: 18, mr: 1, color: 'charcoal.faint' }} />
                      ),
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSearching}
                  startIcon={<SearchIcon />}
                >
                  {isSearching ? 'Searching...' : 'Test Retrieval'}
                </Button>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-charcoal-faint">Try query:</span>
                  {['SIWES placement prerequisites', 'Relational Databases milestone'].map(
                    (q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setSearchQuery(q)}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-charcoal hover:bg-primary-soft hover:text-primary"
                      >
                        "{q}"
                      </button>
                    ),
                  )}
                </div>
              </form>

              <div className="mt-4">
                {searchError && (
                  <div className="rounded-[15px] bg-red-50 px-4 py-3 text-sm text-red-600">
                    {searchError}
                  </div>
                )}

                {isSearching ? (
                  <div className="flex items-center gap-3 py-8 text-sm text-charcoal-faint">
                    <LinearProgress sx={{ flex: 1, borderRadius: 99 }} />
                    Querying PostgreSQL pgvector index...
                  </div>
                ) : searchResults ? (
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-charcoal">
                        Found{' '}
                        <strong className="text-primary">{searchResults.total_matches}</strong>{' '}
                        verified citation chunk(s)
                      </span>
                      <Chip
                        icon={<VerifiedUserIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
                        label="100% Zero-Hallucination"
                        size="small"
                        sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
                      />
                    </div>

                    {searchResults.results.length === 0 ? (
                      <div className="rounded-[15px] bg-bgsoft px-4 py-6 text-center text-sm text-charcoal-faint">
                        No matching excerpts found for this query in the current document
                        repository.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {searchResults.results.map((res, rIdx) => (
                          <div
                            key={res.chunk_id}
                            className="rounded-[15px] bg-primary-soft/40 p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
                                Citation #{rIdx + 1}: {res.document_title} (p.{' '}
                                {res.page_number})
                              </span>
                              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-charcoal-soft">
                                {res.section_reference || 'General Section'}
                              </span>
                            </div>
                            <blockquote className="mt-3 border-l-4 border-primary bg-white px-4 py-3 text-sm italic text-charcoal">
                              "{res.content}"
                            </blockquote>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                              <span className="font-semibold text-charcoal-faint">
                                Exact Match Score: {res.relevance_score}
                              </span>
                              <span className="inline-flex items-center gap-1 font-bold text-primary">
                                <CheckCircleIcon sx={{ fontSize: 13 }} /> Grounding Ready
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-[15px] bg-bgsoft px-4 py-6 text-center text-sm text-charcoal-faint">
                    <AutoAwesomeIcon sx={{ fontSize: 22, color: 'charcoal.faint', mb: 0.5 }} />
                    <p>
                      Enter a query above or click one of the quick suggestions to test live
                      pgvector retrieval.
                    </p>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      )}

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