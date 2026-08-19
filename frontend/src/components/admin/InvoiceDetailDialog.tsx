import { useState, type FC, type ReactNode } from 'react';
import type { InstitutionInvoice } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Verified as VerifiedIcon,
  Block as BlockIcon,
  Download as DownloadIcon,
  ReceiptLong as ReceiptIcon,
  AccountBalance as BankIcon,
  FactCheck as EvidenceIcon,
} from '@mui/icons-material';

interface InvoiceDetailDialogProps {
  open: boolean;
  invoice: InstitutionInvoice | null;
  token: string;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  onReject: (notes: string) => void;
  busy?: boolean;
}

const STATUS_COLORS: Record<string, { color: string; bg: string; dot: string }> = {
  PAID: { color: '#166534', bg: '#dcfce7', dot: '#16a34a' },
  UNPAID: { color: '#92400e', bg: '#fef3c7', dot: '#d97706' },
  PAYMENT_SUBMITTED: { color: '#1e40af', bg: '#dbeafe', dot: '#2563eb' },
  VOID: { color: '#4b5563', bg: '#f3f4f6', dot: '#6b7280' },
  REJECTED: { color: '#991b1b', bg: '#fee2e2', dot: '#dc2626' },
};

const fmtMoney = (n: string | number) =>
  `NGN ${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0)}`;

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (s?: string | null) =>
  s
    ? new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

function StatusBadge({ status, display }: { status: string; display: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.VOID;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
      style={{ color: c.color, backgroundColor: c.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {display}
    </span>
  );
}

function SectionTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">{children}</h3>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

const MetaCell = ({ label, value, bold }: { label: string; value: ReactNode; bold?: boolean }) => (
  <div className="rounded-[10px] border border-line bg-bgsoft px-3.5 py-2.5">
    <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-faint">{label}</p>
    <p className={`mt-0.5 text-sm ${bold ? 'font-extrabold text-charcoal' : 'font-semibold text-charcoal'}`}>{value}</p>
  </div>
);

export const InvoiceDetailDialog: FC<InvoiceDetailDialogProps> = ({
  open,
  invoice,
  token,
  onClose,
  onConfirm,
  onReject,
  busy,
}) => {
  const [pdfBusy, setPdfBusy] = useState(false);
  const [receiptBusy, setReceiptBusy] = useState(false);

  if (!invoice) return null;

  const downloadPdf = async () => {
    if (!invoice) return;
    setPdfBusy(true);
    try {
      const blob = await institutionApi.downloadAdminInvoicePdf(token, invoice.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download invoice PDF:', e);
      window.alert('Failed to generate the invoice PDF. Please try again.');
    } finally {
      setPdfBusy(false);
    }
  };

  const downloadUrl = async (url: string, filename: string) => {
    setReceiptBusy(true);
    try {
      const res = await fetch(url, { headers: { Authorization: `Token ${token}` } });
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch (e) {
      console.error('Failed to download receipt:', e);
    } finally {
      setReceiptBusy(false);
    }
  };

  const bank = invoice.bank_details_snapshot ?? ({} as NonNullable<InstitutionInvoice['bank_details_snapshot']>);
  const items = invoice.items_breakdown || [];
  const hasEvidence =
    invoice.payment_reference || invoice.payer_bank_name || invoice.payer_account_name || invoice.payment_receipt_url;
  const isReview = invoice.status === 'PAYMENT_SUBMITTED';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <div className="rounded-t-[inherit] border-b border-line bg-primary px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                <ReceiptIcon sx={{ fontSize: 22 }} />
              </span>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-white">{invoice.invoice_number}</p>
                <p className="text-xs font-medium text-white/80">{invoice.institution_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={invoice.status} display={invoice.status_display} />
              <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.85)' }} aria-label="Close">
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <div className="space-y-6 p-6">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetaCell label="Issued To" value={invoice.issued_to_name} bold />
            <MetaCell label="Issue Date" value={fmtDate(invoice.created_at)} />
            <MetaCell label="Due Date" value={fmtDate(invoice.due_date)} />
            <MetaCell label="Plan" value={invoice.plan_name || '—'} bold />
          </div>

          {/* Line items */}
          <div>
            <SectionTitle icon={<ReceiptIcon sx={{ fontSize: 16, color: '#146B4A' }} />}>Invoice Line Items</SectionTitle>
            <div className="overflow-hidden rounded-[12px] border border-line">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-primary text-[11px] font-bold uppercase tracking-wider text-white">
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Unit Price</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(items.length ? items : [{ description: 'Subscription License', quantity: 1, amount: invoice.subtotal_amount }]).map(
                    (it, i) => (
                      <tr key={i} className={i % 2 ? 'bg-bgsoft' : 'bg-white'}>
                        <td className="px-4 py-3 font-semibold text-charcoal">{it.description || 'Service'}</td>
                        <td className="px-4 py-3 text-center text-charcoal-soft">{it.quantity ?? 1}</td>
                        <td className="px-4 py-3 text-right text-charcoal-soft">{fmtMoney(it.unit_price ?? it.amount)}</td>
                        <td className="px-4 py-3 text-right font-bold text-charcoal">{fmtMoney(it.amount)}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount summary + total */}
          <div className="flex flex-col items-end gap-2">
            <div className="w-full max-w-sm space-y-1.5 text-sm sm:w-80">
              <div className="flex justify-between text-charcoal-soft">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal">{fmtMoney(invoice.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between text-charcoal-soft">
                <span>Onboarding &amp; Setup Fee</span>
                <span className="font-semibold text-charcoal">{fmtMoney(invoice.setup_fee)}</span>
              </div>
              <div className="flex justify-between text-charcoal-soft">
                <span>Discount</span>
                <span className="font-semibold text-charcoal">−{fmtMoney(invoice.discount_amount)}</span>
              </div>
              <div className="flex justify-between text-charcoal-soft">
                <span>VAT ({Number(invoice.vat_rate)}%)</span>
                <span className="font-semibold text-charcoal">{fmtMoney(invoice.vat_amount)}</span>
              </div>
              <Divider />
              <div className="flex items-center justify-between rounded-[12px] bg-primary px-4 py-3">
                <span className="text-sm font-bold text-white">Total Amount Due</span>
                <span className="text-base font-extrabold text-white">{fmtMoney(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Bank details */}
          {bank.bank_name && (
            <div>
              <SectionTitle icon={<BankIcon sx={{ fontSize: 16, color: '#146B4A' }} />}>
                Payment Method — Official Company Account
              </SectionTitle>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <MetaCell label="Account Name" value={bank.account_name || '—'} bold />
                <MetaCell label="Bank" value={bank.bank_name || '—'} />
                <MetaCell label="Account Number" value={bank.account_number || '—'} bold />
                <MetaCell label="Sort Code / Swift" value={bank.sort_code_or_swift || '—'} />
              </div>
              {bank.payment_instructions && (
                <p className="mt-2.5 rounded-[10px] border border-line bg-bgsoft px-3.5 py-2.5 text-xs leading-relaxed text-charcoal-soft">
                  <span className="font-bold text-charcoal">Instructions:</span> {bank.payment_instructions}
                </p>
              )}
            </div>
          )}

          {/* Payment evidence */}
          {hasEvidence && (
            <div>
              <SectionTitle icon={<EvidenceIcon sx={{ fontSize: 16, color: '#146B4A' }} />}>
                Payment Evidence — Submitted by Institution
              </SectionTitle>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <MetaCell label="Payment Reference" value={invoice.payment_reference || '—'} bold />
                <MetaCell label="Payer Bank" value={invoice.payer_bank_name || '—'} />
                <MetaCell label="Payer Account Name" value={invoice.payer_account_name || '—'} />
                <MetaCell label="Payment Date" value={fmtDate(invoice.payment_date)} />
              </div>
              {invoice.payment_submitted_at && (
                <p className="mt-2.5 text-xs text-charcoal-faint">
                  Submitted on {fmtDateTime(invoice.payment_submitted_at)}
                </p>
              )}
              {invoice.payment_notes && (
                <p className="mt-2.5 rounded-[10px] border border-line bg-bgsoft px-3.5 py-2.5 text-xs leading-relaxed text-charcoal-soft">
                  <span className="font-bold text-charcoal">Payer Notes:</span> {invoice.payment_notes}
                </p>
              )}
              {invoice.payment_receipt_url && (
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-faint">
                      Uploaded Receipt Proof
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="small"
                        variant="text"
                        component="a"
                        href={invoice.payment_receipt_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={receiptBusy ? <CircularProgress size={14} /> : <DownloadIcon sx={{ fontSize: 16 }} />}
                        disabled={receiptBusy}
                        onClick={() =>
                          downloadUrl(
                            invoice.payment_receipt_url as string,
                            `${invoice.invoice_number}-receipt${invoice.payment_receipt_url.split('.').pop() ? '.' + invoice.payment_receipt_url.split('.').pop()!.split(/[?#]/)[0] : ''}`,
                          )
                        }
                      >
                        {receiptBusy ? 'Downloading…' : 'Download Receipt'}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-center rounded-[12px] border border-line bg-bgsoft p-3">
                    <img
                      src={invoice.payment_receipt_url}
                      alt="Payment receipt proof"
                      className="max-h-72 max-w-full rounded-[8px] object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification block */}
          {invoice.confirmed_at && (
            <div className="flex items-start gap-3 rounded-[12px] border border-green-300 bg-green-50 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                <VerifiedIcon sx={{ fontSize: 18 }} />
              </span>
              <div>
                <p className="text-sm font-bold text-green-950">Payment Verified &amp; Institution Activated</p>
                <p className="mt-0.5 text-xs text-green-900">
                  {invoice.status === 'PAID' ? 'Invoice marked PAID. ' : ''}
                  {invoice.confirmed_by_name && `Verified by ${invoice.confirmed_by_name}`}
                  {invoice.confirmed_by_name && invoice.confirmed_at && ' on '}
                  {invoice.confirmed_at && fmtDateTime(invoice.confirmed_at)}.
                  {invoice.confirmed_by_email && ` (${invoice.confirmed_by_email})`}
                </p>
              </div>
            </div>
          )}

          {invoice.status === 'REJECTED' && (
            <div className="flex items-start gap-3 rounded-[12px] border border-red-300 bg-red-50 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                <BlockIcon sx={{ fontSize: 18 }} />
              </span>
              <div>
                <p className="text-sm font-bold text-red-950">Payment Submission Rejected</p>
                {invoice.confirmed_at && (
                  <p className="mt-0.5 text-xs text-red-900">
                    Rejected on {fmtDateTime(invoice.confirmed_at)}
                    {invoice.confirmed_by_name && ` by ${invoice.confirmed_by_name}`}.
                  </p>
                )}
                <p className="mt-1 text-xs text-red-900">
                  The institution can resubmit corrected payment evidence for a new review.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tooltip title="Download official invoice PDF with full payment evidence">
              <span>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={pdfBusy ? <CircularProgress size={16} /> : <PdfIcon sx={{ fontSize: 18 }} />}
                  disabled={pdfBusy}
                  onClick={downloadPdf}
                >
                  {pdfBusy ? 'Generating…' : 'Download Invoice PDF'}
                </Button>
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            {isReview && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<BlockIcon />}
                  disabled={busy}
                  onClick={() => onReject('')}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<VerifiedIcon />}
                  disabled={busy}
                  onClick={() => onConfirm('')}
                >
                  Confirm &amp; Activate
                </Button>
              </>
            )}
            <Button onClick={onClose} color="inherit">
              Close
            </Button>
          </div>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDetailDialog;