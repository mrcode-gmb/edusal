# RAG Document Ingestion, Vector DB Filtering & Groq LLM Integration Plan

## Executive Overview
This document outlines the comprehensive engineering plan for upgrading the **Nexus Institutional Knowledge Base & RAG (Retrieval-Augmented Generation) System**. 

The upgraded system will provide an enterprise-grade, zero-hallucination regulatory grounding engine for Nigerian tertiary institutions (Universities, Polytechnics, and Colleges of Education). It will ingest official handbooks, SIWES calendars, departmental rubrics, and NUC/NBTE/NCCE guidelines, index them in **PostgreSQL `pgvector`** with fine-grained hierarchical scoping, and generate authoritative institutional advice powered by **Groq Cloud API** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`).

---

## 1. Architectural Architecture & Data Flow

```
                                  [ INSTITUTIONAL DOCUMENT ]
                           (PDF, DOCX, TXT Student Handbooks, SIWES Calendars)
                                             │
                                             ▼
                             [ Ingestion & Parsing Pipeline ]
                    (PyPDF/pdfplumber, python-docx, Structure Splitter)
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             [ Metadata Extraction ]                     [ Chunking & Hashing ]
         (Inst, Division, Dept, Session)           (500-1000 Tokens, 150 Token Overlap,
                                                    Page/Section Reference Extraction,
                                                    SHA-256 Document Fingerprint)
                                                                   │
                                                                   ▼
                                                       [ Embedding Engine ]
                                               (FastEmbed / BAAI/bge-small-en-v1.5
                                                or all-MiniLM-L6-v2: 384 dimensions)
                                                                   │
                                                                   ▼
                                                       [ PostgreSQL pgvector ]
                                                (HNSW Cosine Index + tsvector FTS)
                                                                   │
    ───────────────────────────────────────────────────────────────┼───────────────────────────────────────────
                                                                   │
                            [ USER QUERY / ADVISOR PROMPT ]        │
                   ("What are the 400L SWE SIWES requirements?")   │
                                             │                     │
                                             ▼                     │
                                  [ Scoped Hybrid Search ] ────────┘
                         (Filter: inst_id, dept_id, session_id, doc_type
                          Cosine Similarity + Trigram Keyword RRF)
                                             │
                                             ▼
                                  [ Top-K Context Chunks ]
                             (Section 4.2 p.15, Section 5.1 p.22)
                                             │
                                             ▼
                              [ Groq Cloud LLM Generator ]
                        (Model: llama-3.3-70b-versatile / llama-3.1-8b)
                        (Strict Institutional Grounding System Prompt)
                                             │
                                             ▼
                          [ Verified Answer + Grounded Citations ]
                       ("According to FUTMinna SIWES Guide p.15...")
```

---

## 2. Core Upgrades & Specifications

### A. Document Upload & Multi-Format Ingestion
1. **Multi-Format Document Parsing**:
   - **PDF (`.pdf`)**: Page-by-page text extraction with page number preservation, header/footer stripping, and section title detection (`pypdf` / `pdfplumber`).
   - **Microsoft Word (`.docx`)**: Heading-aware extraction extracting paragraph hierarchies (`python-docx`).
   - **Plaintext & Markdown (`.txt`, `.md`)**: Direct markdown section splitting.
2. **Deterministic Chunking & Auditing**:
   - Chunk size: ~500–800 tokens with 100–150 token sliding overlap.
   - Section tagging: Extracts contextual headings (e.g., *"Section 3.4: Practical Repository Clearance"*).
   - Document hashing: SHA-256 fingerprint on raw upload to prevent duplicates and maintain regulatory audit trails.
3. **Storage & Delivery**:
   - Uploaded files stored in Django `MEDIA_ROOT/institutional_documents/<institution_slug>/<session>/`.

### B. Vector Database (`pgvector`) Population & Hierarchical Filtering
1. **Local High-Performance Embedding Pipeline**:
   - Embedding Model: **`FastEmbed` (`BAAI/bge-small-en-v1.5` or `all-MiniLM-L6-v2`)** — running natively on CPU inside Django without heavy GPU/PyTorch requirements (<15ms per chunk, 384 dimensions, benchmark leader for RAG retrieval).
   - Vector dimensionality updated to **384** in `InstitutionalDocumentChunk.embedding` (or configured via settings).
   - Indexing: `HNSW` (Hierarchical Navigable Small World) index with `vector_cosine_ops` in PostgreSQL for sub-millisecond retrieval at scale.
2. **Multi-Tier Hierarchical Metadata Filtering**:
   - Every chunk is filtered strictly before vector search:
     - `institution_id` (Mandatory multi-tenant data barrier — zero cross-institution leakage).
     - `division_id` / `faculty_id` (Optional faculty scope).
     - `department_id` (Optional department scope).
     - `session_id` (Academic session scope for yearly guidelines).
     - `doc_type` (`STUDENT_HANDBOOK`, `SIWES_CALENDAR`, `INTERNSHIP_RUBRIC`, `FACULTY_POLICY`, etc.).
3. **Hybrid Search (Vector Cosine + Full-Text Keyword RRF)**:
   - Cosine Distance (`embedding <=> query_vector`) combined with PostgreSQL Full-Text Search / Trigram matching for 100% precision on Nigerian course codes (e.g., `"SWE 401"`, `"ITCC Form 08"`, `"NUC BMAS 2026"`).

### C. Groq Cloud AI LLM Connection
1. **Groq API Client Integration**:
   - Provider: **Groq Cloud API** (`https://api.groq.com/openai/v1`).
   - SDK: Official `groq` Python SDK (or `openai` SDK configured with Groq base URL).
   - Environment Variable: `GROQ_API_KEY` configured in `.env` and `config/settings/base.py`.
   - Default Model: **`llama-3.3-70b-versatile`** (128k context window, ~300 tokens/sec inference, generous free tier token allowance on Groq console) with fallback to **`llama-3.1-8b-instant`**.
2. **Zero-Hallucination Prompt Architecture**:
   - The LLM is supplied with:
     - Grounding Context: Top-K retrieved chunks with explicit document metadata and page numbers.
     - Scope Context: Institution name, regulatory agency (NUC/NBTE/NCCE), department, student level.
     - Guardrails: If the answer cannot be directly derived from the supplied institutional documents, the LLM is strictly instructed to return: *"This policy is not specified in the official institutional documents currently uploaded for [Institution Name]."*
3. **Citation & Telemetry Payload**:
   - Returns structured response with:
     - `answer_markdown`: Formatted response with inline citation tags `[1]`, `[2]`.
     - `citations`: List of referenced chunks with document title, page number, section header, relevance score, and source excerpt.
     - `telemetry`: Latency (ms), tokens generated, model name.

### D. Frontend Interactive UI (Knowledge Base & AI Advisor)
1. **Upgraded Document Upload Modal (`UploadDocumentModal.tsx`)**:
   - Drag-and-drop file upload for PDF, DOCX, TXT.
   - Metadata form: Document Title, Type, Academic Division, Department, Academic Session.
   - Real-time ingestion progress and chunk count display.
2. **AI Institutional Advisor Playground (`InstitutionalAIAdvisor.tsx`)**:
   - Clean, professional chat interface integrated into Tab 3 ("Knowledge Base & AI Advisor").
   - Filter dropdowns (Department, Faculty, Document Type, Session).
   - Streaming markdown response from Groq.
   - Interactive Citation Inspector: Clicking citation chips pops up the exact handbook page and highlighted snippet.
3. **Raw Chunk / Citation Tester**:
   - Fast semantic search debugger displaying raw cosine distance scores and chunk contents for institutional admins.

---

## 3. Step-by-Step Phased Implementation Plan

### Phase 1: Environment, Dependencies & Database Migration
- [ ] Add backend dependencies to `backend/pyproject.toml`:
  - `groq>=0.18.0` (Groq API client)
  - `pypdf>=5.1.0` (PDF text and page extraction)
  - `python-docx>=1.1.2` (Word document parsing)
  - `fastembed>=0.5.0` (Lightweight CPU embeddings with ONNX runtime)
- [ ] Update `backend/nexus/institutions/models.py`:
  - Update `InstitutionalDocument.file_path` to `models.FileField(upload_to="institutional_documents/%Y/%m/")`.
  - Add `session` Foreign Key on `InstitutionalDocument` for academic year tagging.
  - Update `InstitutionalDocumentChunk.embedding` dimensions to `384` (matching `BAAI/bge-small-en-v1.5` / `all-MiniLM-L6-v2`).
- [ ] Create and apply Django migration `0005_rag_groq_upgrade.py`.
- [ ] Add `GROQ_API_KEY` to `.env` and `config/settings/base.py`.

### Phase 2: Document Ingestion, Parsing & Chunking Engine
- [ ] Create `backend/nexus/institutions/services/document_parser.py`:
  - `parse_pdf(file_obj)`: Extract text with page index and section headers.
  - `parse_docx(file_obj)`: Extract text from Word documents.
  - `parse_txt(file_obj)`: Direct text reader.
  - `chunk_document_text(raw_text, pages_data=None)`: Recursive token-aware chunker producing 500–800 token slices with 150 token overlap and section headers.
- [ ] Create `backend/nexus/institutions/services/embedding_service.py`:
  - Singleton `EmbeddingService` wrapping `FastEmbed` / `TextEmbedding(model_name="BAAI/bge-small-en-v1.5")`.
  - Method `generate_embeddings(text_list: list[str]) -> list[list[float]]`.
  - Method `generate_query_embedding(query: str) -> list[float]`.

### Phase 3: Vector Search & Hybrid Hierarchical Filtering
- [ ] Create `backend/nexus/institutions/services/vector_search_service.py`:
  - `hybrid_search_chunks(query, institution_id, division_id=None, department_id=None, session_id=None, doc_type=None, top_k=5)`:
    - Compute query embedding.
    - Query `InstitutionalDocumentChunk` using PostgreSQL `pgvector` Cosine Distance (`<->` / `<=>`).
    - Combine with full-text keyword matching using Reciprocal Rank Fusion (RRF).
    - Return sorted chunk records with cosine similarity score and formatted citation metadata.

### Phase 4: Groq LLM Client & Strict Citation Service
- [ ] Create `backend/nexus/institutions/services/groq_advisor_service.py`:
  - Initialize Groq client with `settings.GROQ_API_KEY`.
  - Assemble institutional context prompt (system prompt with regulatory guardrails, verified chunks, institution profile, user question).
  - Call `groq.chat.completions.create(model="llama-3.3-70b-versatile", messages=..., temperature=0.2)`.
  - Parse response, extract citations, compute latency and tokens consumed.

### Phase 5: REST API Endpoints & Serializers
- [ ] Update `backend/nexus/institutions/api/serializers.py`:
  - Add `DocumentUploadSerializer` (handles `multipart/form-data` file uploads).
  - Add `AIAdvisorQuerySerializer` (`query`, `department`, `division`, `session`, `doc_type`, `top_k`).
  - Add `AIAdvisorResponseSerializer` (`answer`, `citations`, `telemetry`, `scope`).
- [ ] Update `backend/nexus/institutions/api/views.py`:
  - Add `POST /api/documents/upload/` (handles file upload, parses, chunks, generates embeddings, and saves in pgvector).
  - Add `POST /api/institutions/{id}/ask-advisor/` (executes scoped RAG + Groq LLM response).
  - Update `POST /api/institutions/{id}/search-documents/` (uses upgraded vector search service).

### Phase 6: Frontend Knowledge Base & AI Advisor UI
- [ ] Update `frontend/src/types/institution.ts`:
  - Add types for `AIAdvisorQuery`, `AIAdvisorResponse`, `CitationItem`, `DocumentUploadPayload`.
- [ ] Update `frontend/src/services/institutionApi.ts`:
  - Add `uploadDocumentFile(formData: FormData)`
  - Add `askInstitutionalAdvisor(institutionId: string, queryData: ...)`
- [ ] Build `frontend/src/components/institution/UploadDocumentModal.tsx`:
  - Drag-and-drop file upload with solid white background, high-contrast labels, and ingestion progress indicator.
- [ ] Build `frontend/src/components/institution/InstitutionalAIAdvisor.tsx`:
  - Interactive chat console with department/session scoping filters.
  - Streaming LLM markdown rendering.
  - Interactive citation sidebar with source text highlighting.
- [ ] Update `frontend/src/components/institution/KnowledgeBaseManager.tsx`:
  - Dual tabs: "Institutional AI Advisor" and "Document Repository & Chunk Inspector".
  - Wire upload modal and instant index refresh.

### Phase 7: Pytest Test Suite & Validation
- [ ] Write `backend/nexus/institutions/tests/test_rag_pipeline.py`:
  - Test multi-format parsing (PDF, DOCX, TXT).
  - Test chunking overlap and section extraction.
  - Test vector embedding generation and cosine distance search in pgvector.
  - Test tenant isolation (FUTMinna query cannot access GSU documents).
  - Test Groq LLM mock response with citations.
  - Test API endpoints (`/api/documents/upload/`, `/api/institutions/{id}/ask-advisor/`).
- [ ] Run `docker compose -f docker-compose.local.yml exec django pytest` to verify 100% test pass rate.
- [ ] Run `npm run build` to verify frontend compilation.

---

## 4. Groq Model Evaluation & Configuration

| Model Identifier | Context Window | Speed | Daily Free Token Allowance | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`llama-3.3-70b-versatile`** *(Recommended Primary)* | 128,000 tokens | ~300 T/s | High (100k+ tokens/day free tier) | Complex academic policy synthesis, multi-section regulation compliance, SIWES prerequisites |
| **`llama-3.1-8b-instant`** *(Fast Fallback)* | 128,000 tokens | ~800 T/s | Very High (500k+ tokens/day free tier) | Rapid Q&A, simple course lookup, fast definition retrieval |
| **`mixtral-8x7b-32768`** | 32,768 tokens | ~500 T/s | High | General educational guidance |

---

## 5. Next Steps & Execution Hand-off
Once this plan is approved:
1. Provide the **`GROQ_API_KEY`** from the Groq console (`https://console.groq.com/keys`).
2. Proceed to implement Phase 1 through Phase 7 systematically with automated testing at each stage.
