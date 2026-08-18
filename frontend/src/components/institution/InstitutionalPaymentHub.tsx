import { useState, useEffect, type FC, type FormEvent, type ChangeEvent } from 'react';
import type { InstitutionInvoice, User } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Button,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Print as PrintIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  HourglassTop as HourglassTopIcon,
  AccountBalance as AccountBalanceIcon,
  ReceiptLong as ReceiptLongIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface InstitutionalPaymentHubProps {
  currentUser: User;
  token?: string;
  onLogout: () => void;
  onActivated?: () => void;
}

export const InstitutionalPaymentHub: FC<InstitutionalPaymentHubProps> = ({
  currentUser,
  token,
  onLogout,
  onActivated,
}) => {
  const [invoice, setInvoice] = useState<InstitutionInvoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Form State
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [payerBankName, setPayerBankName] = useState<string>('');
  const [payerAccountName, setPayerAccountName] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const fetchLatestInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const instId = currentUser.staff_profile?.institution;
      const invoices = await institutionApi.getInvoices(instId, token);
      if (invoices && invoices.length > 0) {
        const inv = invoices[0];
        setInvoice(inv);
        if (inv.institution_status === 'ACTIVE' || inv.status === 'PAID') {
          if (onActivated) onActivated();
        }
      } else {
        // Fetch active bank details if no invoice
        setError('No invoice found for this institution. Please contact administrative support.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestInvoice();
    // Poll every 8 seconds if waiting for approval
    const interval = setInterval(() => {
      fetchLatestInvoice();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyAccount = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmitProof = async (e: FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    if (!paymentReference.trim()) {
      setError('Please provide the bank transfer transaction reference number.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('payment_reference', paymentReference.trim());
      if (payerBankName.trim()) formData.append('payer_bank_name', payerBankName.trim());
      if (payerAccountName.trim()) formData.append('payer_account_name', payerAccountName.trim());
      if (paymentDate) formData.append('payment_date', paymentDate);
      if (paymentNotes.trim()) formData.append('payment_notes', paymentNotes.trim());
      if (receiptFile) formData.append('payment_receipt_file', receiptFile);

      const updated = await institutionApi.submitInvoicePayment(invoice.id, formData, token);
      setInvoice(updated);
      setSubmitSuccess(true);
      if (updated.status === 'PAID' || updated.institution_status === 'ACTIVE') {
        if (onActivated) onActivated();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit payment receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const bankSnapshot = invoice?.bank_details_snapshot || {
    account_name: 'Nexus Edutech Consult Ltd',
    bank_name: 'Zenith Bank Plc',
    account_number: '1228490211',
    sort_code_or_swift: '057150013',
    currency: 'NGN',
    payment_instructions: 'Please include your Institution Name and Invoice Reference in the transfer narration.',
    support_email: 'billing@nexus.ng',
  };

  const isPaid = invoice?.status === 'PAID' || invoice?.institution_status === 'ACTIVE';
  const isSubmitted = invoice?.status === 'PAYMENT_SUBMITTED' || invoice?.institution_status === 'PAYMENT_SUBMITTED';

  return (
    <div className="min-h-screen bg-bgsoft text-charcoal pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Nexus Edutech Consult Ltd" className="h-8 w-auto" />
            <div className="hidden sm:block border-l border-line pl-3">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Onboarding & Billing Gateway
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={fetchLatestInvoice}
              disabled={loading}
              startIcon={<RefreshIcon />}
              sx={{ borderColor: 'border.strong', textTransform: 'none', borderRadius: '8px' }}
            >
              Check Status
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={onLogout}
              startIcon={<LogoutIcon />}
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-8">
        {/* Status Notice Banner */}
        <div className="mb-8 print:hidden">
          {isPaid ? (
            <div className="rounded-2xl border border-green-300 bg-green-50 p-5 shadow-sm">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
                  <CheckCircleIcon sx={{ fontSize: 22 }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-green-950">Payment Confirmed & Account Activated!</h2>
                    <span className="rounded-full bg-green-200 px-2.5 py-0.5 text-xs font-bold text-green-900 uppercase">
                      Active Account
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-green-900 leading-relaxed">
                    Payment has been verified by System Administration. Your institutional tenant for{' '}
                    <strong>{invoice?.institution_name || currentUser.staff_profile?.institution_name}</strong> is fully active.
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        if (onActivated) onActivated();
                        else window.location.reload();
                      }}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                    >
                      Enter Institutional Governance Workspace →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : isSubmitted ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5 shadow-sm">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <HourglassTopIcon sx={{ fontSize: 22 }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-blue-950">Payment Receipt Under Review</h2>
                    <span className="rounded-full bg-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-900 uppercase">
                      Pending System Admin Approval
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-blue-900/90 leading-relaxed">
                    Thank you! Your wire transfer receipt has been submitted for{' '}
                    <strong>{invoice?.institution_name || currentUser.staff_profile?.institution_name}</strong>.
                    Our administrative team is verifying the bank confirmation. Your institutional governance workspace will be activated automatically upon confirmation.
                  </p>
                  {invoice?.payment_reference && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-semibold text-blue-900">
                      <span>Ref: <strong>{invoice.payment_reference}</strong></span>
                      {invoice.payment_date && <span>Date: <strong>{invoice.payment_date}</strong></span>}
                      {invoice.payment_receipt_url && (
                        <a
                          href={invoice.payment_receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold underline hover:text-blue-950"
                        >
                          <DownloadIcon sx={{ fontSize: 14 }} />
                          View Uploaded Receipt ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 shadow-sm">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white">
                  <ReceiptLongIcon sx={{ fontSize: 22 }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-amber-950">Awaiting Invoice Transfer</h2>
                    <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-900 uppercase">
                      Pending Wire Transfer
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-amber-900/90 leading-relaxed">
                    Your institutional tenant for{' '}
                    <strong>{invoice?.institution_name || currentUser.staff_profile?.institution_name}</strong> has been provisioned. To activate all modules and calibrate your degree faculties, please transfer the invoice amount to the company account below and upload your receipt.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} className="print:hidden">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <CircularProgress size={40} color="primary" />
            <p className="mt-4 text-sm font-semibold text-charcoal-faint">Loading official invoice and account details…</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            {/* Left Column: Official Printable Invoice */}
            <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-card" id="printable-invoice">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
                <div>
                  <img src="/logo.png" alt="Nexus Edutech Consult Ltd" className="h-10 w-auto" />
                  <p className="mt-2 text-xs font-semibold text-charcoal-soft">
                    Nexus Edutech Consult Ltd
                  </p>
                  <p className="text-xs text-charcoal-faint">
                    Higher Education Career Services Operating System
                  </p>
                  <p className="text-xs text-charcoal-faint">
                    Email: billing@nexus.ng · Support: +234 (0) 800 000 NEXUS
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block rounded-lg bg-primary-faint px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
                    Official Pro-Forma Invoice
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-charcoal">
                    {invoice?.invoice_number || 'INV-NEXUS-2026-PENDING'}
                  </h3>
                  <p className="text-xs text-charcoal-faint">
                    Issued: {invoice?.created_at ? new Date(invoice.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-xs font-semibold text-amber-700">
                    Due Date: {invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB') : 'Within 30 Days'}
                  </p>
                </div>
              </div>

              {/* Billed To / Recipient */}
              <div className="grid gap-4 sm:grid-cols-2 py-6 border-b border-line text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-charcoal-faint">
                    Billed To (Institution):
                  </p>
                  <p className="mt-1 font-bold text-charcoal">
                    {invoice?.institution_name || currentUser.staff_profile?.institution_name}
                  </p>
                  <p className="text-xs text-charcoal-soft">
                    Attention: {invoice?.issued_to_name || currentUser.name} ({currentUser.staff_profile?.title || 'Administrator'})
                  </p>
                  <p className="text-xs text-charcoal-soft">
                    Email: {invoice?.issued_to_email || currentUser.email}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-charcoal-faint">
                    Plan / Subscription Tier:
                  </p>
                  <p className="mt-1 font-bold text-primary">
                    {invoice?.plan_name || 'Standard Tier Subscription'}
                  </p>
                  <p className="text-xs text-charcoal-soft">
                    Status:{' '}
                    <strong className={isSubmitted ? 'text-blue-700' : 'text-amber-700'}>
                      {invoice?.status_display || 'Unpaid / Pending Wire Transfer'}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="py-6 border-b border-line">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs font-bold uppercase tracking-wider text-charcoal-faint">
                      <th className="pb-3">Description</th>
                      <th className="pb-3 text-right">Amount ({invoice?.currency || 'NGN'})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {invoice?.items_breakdown && invoice.items_breakdown.length > 0 ? (
                      invoice.items_breakdown.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 text-charcoal-soft font-medium">{item.description}</td>
                          <td className="py-3 text-right font-bold text-charcoal">
                            ₦{Number(item.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="py-3 text-charcoal-soft font-medium">
                            {invoice?.plan_name || 'Standard Tier'} License Subscription (Annual)
                          </td>
                          <td className="py-3 text-right font-bold text-charcoal">
                            ₦{Number(invoice?.subtotal_amount || 1500000).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-charcoal-soft font-medium">
                            Technical Tenant Provisioning & Faculty Calibration
                          </td>
                          <td className="py-3 text-right font-bold text-charcoal">
                            ₦{Number(invoice?.setup_fee || 150000).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-charcoal-soft font-medium">
                            Value Added Tax (VAT @ 7.5% Exclusive)
                          </td>
                          <td className="py-3 text-right font-bold text-charcoal">
                            ₦{Number(invoice?.vat_amount || 123750).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Breakdown */}
              <div className="pt-4 pb-2 flex flex-col items-end">
                <div className="w-full sm:w-72 space-y-2 text-sm">
                  <div className="flex justify-between text-charcoal-soft">
                    <span>Subtotal (License):</span>
                    <span>₦{Number(invoice?.subtotal_amount || 1500000).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-soft">
                    <span>Setup & Onboarding:</span>
                    <span>₦{Number(invoice?.setup_fee || 150000).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-soft">
                    <span>VAT (7.5% Exclusive):</span>
                    <span className="font-semibold text-charcoal">
                      ₦{Number(invoice?.vat_amount || ((Number(invoice?.subtotal_amount || 1500000) + Number(invoice?.setup_fee || 150000)) * 0.075)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-line pt-2 flex justify-between text-base font-extrabold text-charcoal">
                    <span>Total Due:</span>
                    <span className="text-primary">
                      ₦{Number(invoice?.total_amount || 1773750).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Print Action Bar */}
              <div className="mt-6 flex justify-end print:hidden">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handlePrint}
                  startIcon={<PrintIcon />}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                >
                  Print / Save Official Invoice (PDF)
                </Button>
              </div>
            </div>

            {/* Right Column: Bank Wire Details & Receipt Upload */}
            <div className="space-y-6 print:hidden">
              {/* Company Bank Wire Details Card */}
              <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
                <div className="flex items-center gap-2.5 text-primary border-b border-line pb-4">
                  <AccountBalanceIcon />
                  <h3 className="font-bold text-charcoal text-base">Company Bank Account Details</h3>
                </div>

                <div className="mt-4 space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-charcoal-faint">Bank Name</span>
                    <p className="font-bold text-charcoal text-base">{bankSnapshot.bank_name}</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-charcoal-faint">Account Name</span>
                    <p className="font-bold text-charcoal">{bankSnapshot.account_name}</p>
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary-faint/60 p-3.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Account Number</span>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono text-xl font-extrabold tracking-wider text-primary">
                        {bankSnapshot.account_number}
                      </span>
                      <Tooltip title="Copy Account Number">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyAccount(bankSnapshot.account_number)}
                          sx={{ color: 'primary.main', bgcolor: 'white', '&:hover': { bgcolor: 'white' } }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>

                  {bankSnapshot.sort_code_or_swift && (
                    <div>
                      <span className="text-xs font-semibold text-charcoal-faint">Sort Code / SWIFT</span>
                      <p className="font-mono text-xs font-bold text-charcoal">{bankSnapshot.sort_code_or_swift}</p>
                    </div>
                  )}

                  <div className="rounded-xl bg-bgsoft p-3 text-xs leading-relaxed text-charcoal-soft">
                    <p className="font-bold text-charcoal mb-1">Transfer Narration Note:</p>
                    {bankSnapshot.payment_instructions || 'Please include your Institution Name and Invoice Reference in the transfer narration.'}
                  </div>
                </div>
              </div>

              {/* Payment Proof Upload Form */}
              <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
                <div className="flex items-center gap-2.5 text-primary border-b border-line pb-4">
                  <CloudUploadIcon />
                  <h3 className="font-bold text-charcoal text-base">
                    {isSubmitted ? 'Update Payment Receipt Proof' : 'Upload Payment Receipt Proof'}
                  </h3>
                </div>

                <form onSubmit={handleSubmitProof} className="mt-5 space-y-4">
                  <TextField
                    label="Transaction Reference Number *"
                    fullWidth
                    size="small"
                    required
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. ZEN-TXN-90281048 or Session ID"
                    helperText="Enter the transfer reference from your bank receipt"
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Sending Bank Name"
                      fullWidth
                      size="small"
                      value={payerBankName}
                      onChange={(e) => setPayerBankName(e.target.value)}
                      placeholder="e.g. Zenith Bank, Access Bank"
                    />
                    <TextField
                      label="Payment Date"
                      type="date"
                      fullWidth
                      size="small"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </div>

                  <TextField
                    label="Payer Account Name"
                    fullWidth
                    size="small"
                    value={payerAccountName}
                    onChange={(e) => setPayerAccountName(e.target.value)}
                    placeholder="e.g. Federal University Minna Bursary"
                  />

                  {/* File Upload input */}
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1.5">
                      Upload Transfer Receipt (PNG, JPG, or PDF)
                    </label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,application/pdf"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-charcoal-soft file:mr-4 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-xs file:font-bold file:text-primary hover:file:bg-primary hover:file:text-white transition-colors"
                    />
                    {receiptFile && (
                      <p className="mt-1.5 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircleIcon sx={{ fontSize: 14 }} /> Selected: {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  <TextField
                    label="Payer Notes / Remarks"
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Additional details for the billing team"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={submitting}
                    endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, mt: 2 }}
                  >
                    {submitting ? 'Submitting Receipt…' : isSubmitted ? 'Re-Submit Updated Receipt' : 'Submit Payment Proof'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Bank account number copied to clipboard!"
      />

      <Snackbar
        open={submitSuccess}
        autoHideDuration={4000}
        onClose={() => setSubmitSuccess(false)}
        message="Payment proof uploaded successfully! Awaiting System Admin confirmation."
      />
    </div>
  );
};
