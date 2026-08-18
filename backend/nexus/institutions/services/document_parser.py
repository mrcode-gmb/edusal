import hashlib
import io
import re
from typing import Any, BinaryIO, Dict, List, Tuple

import pypdf
from docx import Document as DocxDocument


class DocumentParserService:
    """Service for parsing institutional PDF, DOCX, and TXT files into structured chunks."""

    CHUNK_SIZE_CHARS = 1200  # ~300-400 words / tokens
    CHUNK_OVERLAP_CHARS = 200

    @classmethod
    def compute_sha256(cls, file_content: bytes) -> str:
        """Computes a SHA-256 hash for document auditability."""
        return f"sha256:{hashlib.sha256(file_content).hexdigest()}"

    @classmethod
    def parse_pdf(cls, file_obj: BinaryIO) -> List[Dict[str, Any]]:
        """
        Parses a PDF file page by page, extracting text and identifying section titles.
        Returns a list of page dicts: [{'page_number': 1, 'text': '...', 'headers': [...]}]
        """
        reader = pypdf.PdfReader(file_obj)
        pages_data = []

        for page_idx, page in enumerate(reader.pages):
            page_num = page_idx + 1
            raw_page_text = page.extract_text() or ""
            cleaned_text = cls._clean_text(raw_page_text)
            if cleaned_text.strip():
                pages_data.append({
                    "page_number": page_num,
                    "text": cleaned_text,
                })

        return pages_data

    @classmethod
    def parse_docx(cls, file_obj: BinaryIO) -> List[Dict[str, Any]]:
        """
        Parses a Word (.docx) document, grouping paragraphs into structured pages/sections.
        """
        doc = DocxDocument(file_obj)
        paragraphs_text = []
        current_section = "General Overview"

        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue
            if p.style and p.style.name.startswith("Heading"):
                current_section = text
            paragraphs_text.append(f"[{current_section}] {text}")

        full_text = "\n\n".join(paragraphs_text)
        return [{"page_number": 1, "text": cls._clean_text(full_text)}]

    @classmethod
    def parse_txt(cls, file_obj: BinaryIO) -> List[Dict[str, Any]]:
        """Parses plaintext or markdown files."""
        content = file_obj.read()
        if isinstance(content, bytes):
            try:
                content = content.decode("utf-8")
            except UnicodeDecodeError:
                content = content.decode("latin-1", errors="ignore")
        return [{"page_number": 1, "text": cls._clean_text(content)}]

    @classmethod
    def chunk_parsed_document(cls, pages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Chunks the extracted document pages into citation-ready slices with page and section references.
        """
        chunks = []
        global_chunk_idx = 0

        for page in pages_data:
            page_num = page["page_number"]
            page_text = page["text"]

            # Split into paragraphs / sections
            paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]
            if not paragraphs:
                continue

            current_chunk_text = ""
            current_section_ref = f"Page {page_num}"

            for p in paragraphs:
                # Detect section headers like "Section 4.1", "Article II", "Chapter 3"
                header_match = re.search(
                    r"(?:Section|Chapter|Article|Part|Unit)\s+[\d\.\w]+[:\-\s]+[^\n]+",
                    p,
                    re.IGNORECASE,
                )

                if header_match:
                    # If we already have accumulated chunk text, flush it before starting a new section
                    if current_chunk_text.strip():
                        chunks.append({
                            "chunk_index": global_chunk_idx,
                            "page_number": page_num,
                            "section_reference": current_section_ref,
                            "content": current_chunk_text,
                            "is_header": False,
                        })
                        global_chunk_idx += 1
                        current_chunk_text = ""
                    current_section_ref = header_match.group(0).strip()[:180]

                if len(current_chunk_text) + len(p) <= cls.CHUNK_SIZE_CHARS:
                    current_chunk_text = f"{current_chunk_text}\n\n{p}".strip()
                else:
                    if current_chunk_text:
                        chunks.append({
                            "chunk_index": global_chunk_idx,
                            "page_number": page_num,
                            "section_reference": current_section_ref,
                            "content": current_chunk_text,
                            "is_header": bool(header_match and len(current_chunk_text) < 200),
                        })
                        global_chunk_idx += 1
                        # Retain overlap from end of current chunk
                        overlap = current_chunk_text[-cls.CHUNK_OVERLAP_CHARS :] if len(current_chunk_text) > cls.CHUNK_OVERLAP_CHARS else ""
                        current_chunk_text = f"{overlap}\n\n{p}".strip()
                    else:
                        current_chunk_text = p

            if current_chunk_text.strip():
                chunks.append({
                    "chunk_index": global_chunk_idx,
                    "page_number": page_num,
                    "section_reference": current_section_ref,
                    "content": current_chunk_text,
                    "is_header": False,
                })
                global_chunk_idx += 1

        return chunks

    @classmethod
    def parse_and_chunk(cls, file_content: bytes, file_name: str) -> Tuple[str, List[Dict[str, Any]], str]:
        """
        End-to-end parser: takes binary content and filename, extracts raw text,
        chunks with metadata, and returns (raw_text, chunks, content_hash).
        """
        content_hash = cls.compute_sha256(file_content)
        file_obj = io.BytesIO(file_content)
        lower_name = file_name.lower()

        if lower_name.endswith(".pdf"):
            pages_data = cls.parse_pdf(file_obj)
        elif lower_name.endswith(".docx"):
            pages_data = cls.parse_docx(file_obj)
        else:
            pages_data = cls.parse_txt(file_obj)

        raw_text = "\n\n".join([f"--- Page {p['page_number']} ---\n" + p["text"] for p in pages_data])
        chunks = cls.chunk_parsed_document(pages_data)

        return raw_text, chunks, content_hash

    @staticmethod
    def _clean_text(text: str) -> str:
        """Removes extraneous null bytes, excessive whitespace, and control characters."""
        text = text.replace("\x00", " ")
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
        return text.strip()
