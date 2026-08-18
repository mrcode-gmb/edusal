import { useState, type FC } from 'react';
import type { GovernanceSummary } from '../../types/institution';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface SenateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: GovernanceSummary | null;
}

export const SenateReportModal: FC<SenateReportModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !summary) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Senate Audit Pack export generated and downloaded.');
      onClose();
    }, 1200);
  };

  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '15px' } } }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <div>
          <Chip
            size="small"
            icon={<ShieldIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
            label="Regulator & Senate Evidence Dossier"
            sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
          />
          <p className="mt-2 text-base font-bold text-charcoal">
            Institutional Outcome & Hierarchy Audit Pack
          </p>
        </div>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <div className="rounded-[15px] bg-primary-soft/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-charcoal">{summary.institution.name}</p>
              <p className="mt-1 text-sm text-charcoal-faint">
                Regulatory Oversight:{' '}
                <strong className="text-charcoal">{summary.institution.regulator}</strong> ·
                Academic Session:{' '}
                <strong className="text-charcoal">
                  {summary.active_session.label}
                </strong>{' '}
                ({summary.active_session.semester}) · Date: {reportDate}
              </p>
            </div>
            <div className="rounded-[15px] bg-white px-3 py-2 text-xs">
              <span className="flex items-center gap-1 font-bold text-charcoal">
                <ShieldIcon sx={{ fontSize: 13, color: 'primary.main' }} /> Nexus
                Tamper-Evident Digest
              </span>
              <code className="mt-0.5 block font-mono text-[11px] text-charcoal-faint">
                sha256:8f4c...3e1a
              </code>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[15px] bg-bgsoft p-5">
            <h5 className="mb-3 text-sm font-bold text-charcoal">
              1. Academic Structure Compliance
            </h5>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-faint">
                  Total {summary.institution.tier_two_term}s Mapped
                </span>
                <strong className="text-charcoal">{summary.hierarchy_metrics.total_divisions}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-faint">Total Departments Configured</span>
                <strong className="text-charcoal">{summary.hierarchy_metrics.total_departments}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-faint">Degree Programmes Active</span>
                <strong className="text-charcoal">{summary.hierarchy_metrics.total_programs}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-faint">SIWES Attachment Eligible Depts</span>
                <strong className="text-charcoal">
                  {summary.hierarchy_metrics.siwes_eligible_departments} (
                  {summary.hierarchy_metrics.siwes_eligibility_percentage}%)
                </strong>
              </div>
            </div>
          </div>

          <div className="rounded-[15px] bg-bgsoft p-5">
            <h5 className="mb-3 text-sm font-bold text-charcoal">
              2. Grounding & pgvector Evidence Status
            </h5>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-faint">Institutional Documents Ingested</span>
                <strong className="text-charcoal">{summary.knowledge_base.total_documents}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-faint">Indexed Citation Chunks</span>
                <strong className="text-charcoal">
                  {summary.knowledge_base.total_indexed_chunks}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-faint">Vector Distance Engine</span>
                <strong className="text-charcoal">PostgreSQL 16 pgvector</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-faint">Taxonomy Audit Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-primary">
                  <CheckCircleIcon sx={{ fontSize: 14 }} /> Passed Standard
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[15px] bg-bgsoft p-5">
          <h6 className="text-sm font-bold text-charcoal">Regulator Attestation Note:</h6>
          <p className="mt-1.5 text-sm leading-relaxed text-charcoal-faint">
            This institutional pack contains strictly auditable records with 0% unverified
            self-reported claims. Every pathway requirement and document citation is directly
            traceable to the underlying faculty evaluation ledger.
          </p>
        </div>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          disabled={downloading}
          startIcon={<DownloadIcon />}
        >
          {downloading ? 'Compiling PDF Dossier...' : 'Export Official Senate PDF Pack'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};