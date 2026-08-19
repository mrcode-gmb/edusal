import { useState, useEffect, useCallback, type FC, type FormEvent, type ReactNode } from 'react';
import type {
  AuthUser,
  PlatformAdminOverview,
  AdminInstitutionRow,
  AdminInstitutionDetail,
  AdminUser,
  CompanyBankDetail,
  PricingPlan,
  InstitutionInvoice,
  StudentProfile,
  InstitutionStaff,
  AcademicDivision,
  AcademicProgram,
  Pathway,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { DashboardTheme, StatCard, PageHead, Panel, PanelHead, Badge } from '../institution/Shared';
import { InvoiceDetailDialog } from './InvoiceDetailDialog';
import {
  Drawer,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storefront as StorefrontIcon,
  ReceiptLong as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  School as GraduationCapIcon,
  Public as PublicIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
  HourglassTop as HourglassTopIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  Payments as PaymentsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  RemoveRedEye as ViewIcon,
  PictureAsPdf as PdfIcon,
  ArrowBack as ArrowBackIcon,
  AccountTree as AccountTreeIcon,
  MenuBook as MenuBookIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTooltip, Legend);

type AdminTab = 'overview' | 'institutions' | 'invoices' | 'bank' | 'plans' | 'users';

interface PlatformAdminDashboardProps {
  currentUser: AuthUser;
  token: string;
  onLogout: () => void;
  onBackToLanding: () => void;
}

const INSTITUTION_STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  ACTIVE: { color: '#166534', bg: '#dcfce7' },
  PENDING_PAYMENT: { color: '#92400e', bg: '#fef3c7' },
  PAYMENT_SUBMITTED: { color: '#1e40af', bg: '#dbeafe' },
  PROVISIONING: { color: '#6b21a8', bg: '#f3e8ff' },
  SUSPENDED: { color: '#991b1b', bg: '#fee2e2' },
  REJECTED: { color: '#991b1b', bg: '#fee2e2' },
};

const INVOICE_STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  PAID: { color: '#166534', bg: '#dcfce7' },
  UNPAID: { color: '#92400e', bg: '#fef3c7' },
  PAYMENT_SUBMITTED: { color: '#1e40af', bg: '#dbeafe' },
  VOID: { color: '#4b5563', bg: '#f3f4f6' },
  REJECTED: { color: '#991b1b', bg: '#fee2e2' },
};

const fmtMoney = (n: number) =>
  `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2 }).format(n)}`;

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString('en-GB') : '—';

function TablePanelHead({
  title,
  sub,
  action,
}: {
  title: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="px-6 pt-6">
      <PanelHead title={title} sub={sub} action={action} />
    </div>
  );
}

const NavSections: {
  label: string;
  items: { key: AdminTab; label: string; icon: typeof DashboardIcon }[];
}[] = [
  {
    label: 'Governance',
    items: [
      { key: 'overview', label: 'Platform Overview', icon: DashboardIcon },
      { key: 'institutions', label: 'Institution Tenants', icon: StorefrontIcon },
      { key: 'users', label: 'Platform Users', icon: GroupIcon },
    ],
  },
  {
    label: 'Billing',
    items: [
      { key: 'invoices', label: 'Institution Invoices', icon: ReceiptIcon },
      { key: 'bank', label: 'Company Bank Details', icon: AccountBalanceIcon },
      { key: 'plans', label: 'Pricing Plans & Fees', icon: PaymentsIcon },
    ],
  },
];

const emptyBankForm = {
  account_name: '',
  bank_name: '',
  account_number: '',
  sort_code_or_swift: '',
  currency: 'NGN',
  payment_instructions: '',
  support_email: '',
  support_phone: '',
  is_active: true,
};

const emptyPlanForm = {
  name: '',
  code: '',
  target_institution_type: '',
  description: '',
  base_fee: '',
  setup_onboarding_fee: '',
  per_student_fee: '',
  max_students: '',
  features: '',
  currency: 'NGN',
  billing_cycle: 'ANNUAL',
  is_active: true,
};

function BankFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
  saving,
}: {
  open: boolean;
  initial: CompanyBankDetail | null;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(emptyBankForm);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              account_name: initial.account_name,
              bank_name: initial.bank_name,
              account_number: initial.account_number,
              sort_code_or_swift: initial.sort_code_or_swift || '',
              currency: initial.currency,
              payment_instructions: initial.payment_instructions || '',
              support_email: initial.support_email,
              support_phone: initial.support_phone || '',
              is_active: initial.is_active,
            }
          : emptyBankForm
      );
    }
  }, [open, initial]);

  const set = (k: keyof typeof emptyBankForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="body">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {initial ? 'Edit Company Bank Details' : 'Add Company Bank Details'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Account Name *" required value={form.account_name} onChange={set('account_name')} />
          <TextField label="Bank Name *" required value={form.bank_name} onChange={set('bank_name')} />
          <TextField label="Account Number *" required value={form.account_number} onChange={set('account_number')} />
          <TextField
            label="Sort Code / SWIFT"
            value={form.sort_code_or_swift}
            onChange={set('sort_code_or_swift')}
          />
          <TextField label="Currency" value={form.currency} onChange={set('currency')} />
          <TextField
            label="Payment Instructions"
            multiline
            minRows={3}
            value={form.payment_instructions}
            onChange={set('payment_instructions')}
          />
          <TextField label="Support Email" value={form.support_email} onChange={set('support_email')} />
          <TextField label="Support Phone" value={form.support_phone} onChange={set('support_phone')} />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
            }
            label="Active (shown on invoices)"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Bank Details'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function PlanFormDialog({
  open,
  initial,
  onClose,
  onSubmit,
  saving,
}: {
  open: boolean;
  initial: PricingPlan | null;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(emptyPlanForm);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name,
              code: initial.code,
              target_institution_type: initial.target_institution_type || '',
              description: initial.description || '',
              base_fee: String(initial.base_fee),
              setup_onboarding_fee: String(initial.setup_onboarding_fee),
              per_student_fee: initial.per_student_fee ? String(initial.per_student_fee) : '',
              max_students: String(initial.max_students),
              features: (initial.features || []).join(', '),
              currency: initial.currency,
              billing_cycle: initial.billing_cycle,
              is_active: initial.is_active,
            }
          : emptyPlanForm
      );
    }
  }, [open, initial]);

  const set = (k: keyof typeof emptyPlanForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      code: form.code,
      target_institution_type: form.target_institution_type,
      description: form.description,
      base_fee: form.base_fee,
      setup_onboarding_fee: form.setup_onboarding_fee,
      per_student_fee: form.per_student_fee || null,
      max_students: form.max_students,
      features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      is_active: form.is_active,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="body">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {initial ? 'Edit Pricing Plan' : 'Add Pricing Plan'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Plan Name *" required value={form.name} onChange={set('name')} />
          <TextField label="Plan Code *" required value={form.code} onChange={set('code')} />
          <TextField
            label="Target Institution Type"
            value={form.target_institution_type}
            onChange={set('target_institution_type')}
          />
          <TextField
            label="Description"
            multiline
            minRows={2}
            value={form.description}
            onChange={set('description')}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Base Fee (₦) *"
              required
              type="number"
              value={form.base_fee}
              onChange={set('base_fee')}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₦</InputAdornment> } }}
            />
            <TextField
              label="Setup & Onboarding Fee (₦)"
              type="number"
              value={form.setup_onboarding_fee}
              onChange={set('setup_onboarding_fee')}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₦</InputAdornment> } }}
            />
            <TextField
              label="Per Student Fee (₦)"
              type="number"
              value={form.per_student_fee}
              onChange={set('per_student_fee')}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₦</InputAdornment> } }}
            />
            <TextField
              label="Max Students *"
              required
              type="number"
              value={form.max_students}
              onChange={set('max_students')}
            />
            <TextField label="Currency" value={form.currency} onChange={set('currency')} />
            <TextField label="Billing Cycle" value={form.billing_cycle} onChange={set('billing_cycle')} />
          </div>
          <TextField
            label="Features (comma separated)"
            multiline
            minRows={3}
            value={form.features}
            onChange={set('features')}
            helperText="e.g. Up to 8,000 student seats, Priority support"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
            }
            label="Active (available during onboarding)"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Plan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function InvoiceActionDialog({
  open,
  mode,
  invoice,
  onClose,
  onConfirm,
  onReject,
  busy,
}: {
  open: boolean;
  mode: 'confirm' | 'reject';
  invoice: InstitutionInvoice | null;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  onReject: (notes: string) => void;
  busy: boolean;
}) {
  const [notes, setNotes] = useState('');
  useEffect(() => {
    if (open) setNotes('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {mode === 'confirm' ? 'Confirm Payment Received' : 'Reject Payment Submission'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <p className="text-sm text-charcoal-faint">
          Invoice <strong className="text-charcoal">{invoice?.invoice_number}</strong> ·{' '}
          <strong className="text-charcoal">{invoice?.institution_name}</strong>
        </p>
        <TextField
          label="Admin Notes (visible to institution)"
          multiline
          minRows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color={mode === 'confirm' ? 'success' : 'error'}
          disabled={busy}
          onClick={() => (mode === 'confirm' ? onConfirm(notes) : onReject(notes))}
        >
          {busy ? 'Processing…' : mode === 'confirm' ? 'Confirm & Activate' : 'Reject Submission'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ReceiptChip({ invoice }: { invoice: InstitutionInvoice }) {
  if (!invoice.payment_receipt_url) return null;
  return (
    <Tooltip title="Open uploaded transfer receipt">
      <a
        href={invoice.payment_receipt_url}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary transition-colors hover:bg-primary/15"
      >
        <AttachFileIcon sx={{ fontSize: 12 }} />
        Receipt attached
      </a>
    </Tooltip>
  );
}

export const PlatformAdminDashboard: FC<PlatformAdminDashboardProps> = ({
  currentUser,
  token,
  onLogout,
  onBackToLanding,
}) => {
  const [overview, setOverview] = useState<PlatformAdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Console data
  const [bankDetails, setBankDetails] = useState<CompanyBankDetail[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [invoices, setInvoices] = useState<InstitutionInvoice[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [consoleLoading, setConsoleLoading] = useState(true);

  // Dialog state
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<CompanyBankDetail | null>(null);
  const [savingBank, setSavingBank] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [invoiceAction, setInvoiceAction] = useState<{ mode: 'confirm' | 'reject'; invoice: InstitutionInvoice | null }>({ mode: 'confirm', invoice: null });
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<InstitutionInvoice | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Institution drill-down state
  const [viewingInstitution, setViewingInstitution] = useState<AdminInstitutionRow | null>(null);
  const [institutionDetail, setInstitutionDetail] = useState<AdminInstitutionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'students' | 'staff' | 'divisions' | 'programs' | 'pathways' | 'invoices'>('students');
  const [statusBusy, setStatusBusy] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await institutionApi.getAdminOverview(token);
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platform overview.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadConsole = useCallback(async () => {
    setConsoleLoading(true);
    try {
      const [bank, plans, inv, usr] = await Promise.all([
        institutionApi.getAdminBankDetails(token),
        institutionApi.getAdminPricingPlans(token),
        institutionApi.getAdminInvoices(token),
        institutionApi.getAdminUsers(token),
      ]);
      setBankDetails(bank);
      setPricingPlans(plans);
      setInvoices(inv);
      setUsers(usr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing console.');
    } finally {
      setConsoleLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOverview();
    loadConsole();
  }, [loadOverview, loadConsole]);

  const refreshAll = async () => {
    await Promise.all([loadOverview(), loadConsole()]);
    setToast('Console refreshed');
  };

  const handleBankSubmit = async (data: Record<string, unknown>) => {
    setSavingBank(true);
    try {
      if (editingBank) {
        await institutionApi.updateAdminBankDetail(token, editingBank.id, data);
        setToast('Bank details updated');
      } else {
        await institutionApi.createAdminBankDetail(token, data);
        setToast('Bank details added');
      }
      setBankDialogOpen(false);
      await loadConsole();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to save bank details');
    } finally {
      setSavingBank(false);
    }
  };

  const handleBankDelete = async (b: CompanyBankDetail) => {
    if (!window.confirm(`Delete bank details for ${b.account_name}?`)) return;
    try {
      await institutionApi.deleteAdminBankDetail(token, b.id);
      setToast('Bank details deleted');
      await loadConsole();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to delete bank details');
    }
  };

  const handlePlanSubmit = async (data: Record<string, unknown>) => {
    setSavingPlan(true);
    try {
      if (editingPlan) {
        await institutionApi.updateAdminPricingPlan(token, editingPlan.id, data);
        setToast('Pricing plan updated');
      } else {
        await institutionApi.createAdminPricingPlan(token, data);
        setToast('Pricing plan added');
      }
      setPlanDialogOpen(false);
      await loadConsole();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to save pricing plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handlePlanDelete = async (p: PricingPlan) => {
    if (!window.confirm(`Delete pricing plan "${p.name}"?`)) return;
    try {
      await institutionApi.deleteAdminPricingPlan(token, p.id);
      setToast('Pricing plan deleted');
      await loadConsole();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to delete pricing plan');
    }
  };

  const handleInvoiceConfirm = async (notes: string) => {
    if (!invoiceAction.invoice) return;
    setInvoiceBusy(true);
    try {
      await institutionApi.confirmAdminInvoice(token, invoiceAction.invoice.id, notes);
      setToast(`Invoice ${invoiceAction.invoice.invoice_number} confirmed — institution activated`);
      setInvoiceAction({ mode: 'confirm', invoice: null });
      await Promise.all([loadOverview(), loadConsole()]);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to confirm invoice');
    } finally {
      setInvoiceBusy(false);
    }
  };

  const handleInvoiceReject = async (notes: string) => {
    if (!invoiceAction.invoice) return;
    setInvoiceBusy(true);
    try {
      await institutionApi.rejectAdminInvoice(token, invoiceAction.invoice.id, notes);
      setToast(`Invoice ${invoiceAction.invoice.invoice_number} rejected`);
      setInvoiceAction({ mode: 'reject', invoice: null });
      await Promise.all([loadOverview(), loadConsole()]);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to reject invoice');
    } finally {
      setInvoiceBusy(false);
    }
  };

  const handleDownloadInvoicePdf = async (inv: InstitutionInvoice) => {
    setDownloadingPdf(inv.id);
    try {
      const blob = await institutionApi.downloadAdminInvoicePdf(token, inv.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${inv.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setToast(`Invoice ${inv.invoice_number} PDF downloaded`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to generate invoice PDF');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const openInvoiceReview = (mode: 'confirm' | 'reject', inv: InstitutionInvoice) => {
    setViewingInvoice(null);
    setInvoiceAction({ mode, invoice: inv });
  };

  const loadUsers = async (search?: string) => {
    try {
      setUsers(await institutionApi.getAdminUsers(token, search));
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to load users');
    }
  };

  const openInstitutionDetail = async (inst: AdminInstitutionRow) => {
    setViewingInstitution(inst);
    setDetailTab('students');
    setDetailLoading(true);
    setInstitutionDetail(null);
    try {
      setInstitutionDetail(await institutionApi.getAdminInstitutionDetail(token, inst.id));
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to load institution detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeInstitutionDetail = () => {
    setViewingInstitution(null);
    setInstitutionDetail(null);
    setDetailTab('students');
  };

  const handleInstitutionStatusToggle = async () => {
    if (!viewingInstitution) return;
    const action = viewingInstitution.status === 'ACTIVE' ? 'deactivate' : 'reactivate';
    const verb = action === 'deactivate' ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${verb} "${viewingInstitution.name}"?`)) return;
    setStatusBusy(true);
    try {
      const res = await institutionApi.setAdminInstitutionStatus(token, viewingInstitution.id, action);
      setToast(res.detail);
      await Promise.all([loadOverview(), loadConsole()]);
      setViewingInstitution((v) =>
        v ? { ...v, status: res.status, status_display: res.status_display } : v
      );
      if (institutionDetail) {
        setInstitutionDetail((d) =>
          d ? { ...d, status: res.status, status_display: res.status_display } : d
        );
      }
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to update institution status');
    } finally {
      setStatusBusy(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (activeTab === 'users') loadUsers(userSearch);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch, activeTab]);

  const displayName = currentUser.name || currentUser.email;
  const revenue = overview?.revenue;
  const totals = overview?.totals;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
  };

  const institutionBarData = {
    labels: (overview?.institutions || []).map((i) => i.short_name),
    datasets: [
      {
        label: 'Students',
        data: (overview?.institutions || []).map((i) => i.students_count),
        backgroundColor: '#146B4A',
        borderRadius: 6,
      },
      {
        label: 'Staff',
        data: (overview?.institutions || []).map((i) => i.staff_count),
        backgroundColor: '#0EA5E9',
        borderRadius: 6,
      },
    ],
  };

  const statusDoughnutData = {
    labels: Object.entries(overview?.institutions_by_status || {})
      .filter(([, v]) => v > 0)
      .map(([k]) => k.replace(/_/g, ' ')),
    datasets: [
      {
        data: Object.entries(overview?.institutions_by_status || {})
          .filter(([, v]) => v > 0)
          .map(([, v]) => v),
        backgroundColor: Object.entries(overview?.institutions_by_status || {})
          .filter(([, v]) => v > 0)
          .map(([k]) => (INSTITUTION_STATUS_COLORS[k] || { color: '#64748B' }).color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const invoiceDoughnutData = {
    labels: Object.entries(overview?.invoices_by_status || {})
      .filter(([, v]) => v > 0)
      .map(([k]) => k.replace(/_/g, ' ')),
    datasets: [
      {
        data: Object.entries(overview?.invoices_by_status || {})
          .filter(([, v]) => v > 0)
          .map(([, v]) => v),
        backgroundColor: Object.entries(overview?.invoices_by_status || {})
          .filter(([, v]) => v > 0)
          .map(([k]) => (INVOICE_STATUS_COLORS[k] || { color: '#64748B' }).color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const revenueBarData = {
    labels: ['Total Billed', 'Collected', 'Outstanding'],
    datasets: [
      {
        label: 'NGN',
        data: revenue ? [revenue.total_billed, revenue.total_paid, revenue.outstanding] : [0, 0, 0],
        backgroundColor: ['#94A3B8', '#146B4A', '#F59E0B'],
        borderRadius: 6,
      },
    ],
  };

  const SidebarContent = (
    <div className="flex h-full flex-col bg-charcoal">
      <div className="flex h-16 items-center px-6">
        <img src="/logo-white.png" alt="Nexus Edutech Consult Ltd" className="h-9 w-auto" />
      </div>

      <div className="mx-4 mt-2 rounded-[15px] bg-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
            {displayName.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{displayName}</p>
            <p className="truncate text-xs text-white/60">Platform Super Admin</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Chip
            size="small"
            icon={<VerifiedIcon sx={{ fontSize: 13, color: '#7FB69A' }} />}
            label="System Administration & Billing"
            sx={{
              bgcolor: 'rgba(255,255,255,0.08)',
              color: '#E6F2EC',
              '& .MuiChip-label': { fontSize: 10, fontWeight: 700 },
            }}
          />
        </div>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-4 pb-6">
        {NavSections.map((s) => (
          <div key={s.label} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              {s.label}
            </p>
            <div className="space-y-1">
              {s.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-[15px] px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                      activeTab === item.key
                        ? 'bg-primary text-white'
                        : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <Icon sx={{ fontSize: 18 }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <button
          type="button"
          onClick={onBackToLanding}
          className="flex w-full items-center justify-between rounded-[15px] px-3 py-2.5 text-[13px] font-semibold text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <span className="flex items-center gap-3">
            <PublicIcon sx={{ fontSize: 18 }} />
            Back to Landing
          </span>
          <ArrowForwardIcon sx={{ fontSize: 15 }} />
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-[15px] px-3 py-2.5 text-[13px] font-semibold text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <LogoutIcon sx={{ fontSize: 18 }} />
          Sign out
        </button>
      </div>
    </div>
  );

  const renderStatusBadge = (status: string, display: string) => {
    const c = INSTITUTION_STATUS_COLORS[status] || { color: '#4b5563', bg: '#f3f4f6' };
    return <Badge color={c.color} bg={c.bg}>{display}</Badge>;
  };

  const renderInvoiceBadge = (status: string, display: string) => {
    const c = INVOICE_STATUS_COLORS[status] || { color: '#4b5563', bg: '#f3f4f6' };
    return <Badge color={c.color} bg={c.bg}>{display}</Badge>;
  };

  const renderCharts = () => {
    const hasStatus = (statusDoughnutData.datasets[0].data as number[]).some((v) => v > 0);
    const hasInvoices = (invoiceDoughnutData.datasets[0].data as number[]).some((v) => v > 0);
    return (
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHead title="Students & Staff by Institution" sub="Headcount per tenant" />
          <div style={{ height: 260 }}>
            <Bar data={institutionBarData} options={chartOptions} />
          </div>
        </Panel>
        <Panel>
          <PanelHead title="Revenue Position (NGN)" sub="Billed vs collected vs outstanding" />
          <div style={{ height: 260 }}>
            <Bar data={revenueBarData} options={chartOptions} />
          </div>
        </Panel>
        <Panel>
          <PanelHead title="Institution Lifecycle" sub="Tenant status distribution" />
          {hasStatus ? (
            <div style={{ height: 240 }}>
              <Doughnut data={statusDoughnutData} options={chartOptions} />
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-charcoal-faint">No institution status data yet.</p>
          )}
        </Panel>
        <Panel>
          <PanelHead title="Invoice Status Mix" sub="Subscription invoice lifecycle" />
          {hasInvoices ? (
            <div style={{ height: 240 }}>
              <Doughnut data={invoiceDoughnutData} options={chartOptions} />
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-charcoal-faint">No invoices issued yet.</p>
          )}
        </Panel>
      </div>
    );
  };

  const renderOverview = () => {
    const totalInstitutions = totals?.institutions || 0;
    const activeInst = overview?.institutions_by_status?.ACTIVE || 0;
    const pending = (overview?.institutions_by_status?.PENDING_PAYMENT || 0) + (overview?.institutions_by_status?.PAYMENT_SUBMITTED || 0);
    const suspended = (overview?.institutions_by_status?.SUSPENDED || 0) + (overview?.institutions_by_status?.REJECTED || 0);

    return (
      <>
        <PageHead
          eyebrow="System Administration, Governance & Billing Console"
          title="Platform Overview"
          sub="Live health of every institutional tenant, subscription and payment on the Nexus Edutech Consult platform."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={StorefrontIcon} value={totalInstitutions} label="Institution Tenants" sub="Total registered institutions" />
          <StatCard icon={CheckCircleIcon} value={activeInst} label="Active Accounts" sub={`${pending} awaiting payment · ${suspended} suspended/blocked`} />
          <StatCard icon={GraduationCapIcon} value={totals?.students || 0} label="Students" sub={`${totals?.staff || 0} staff · ${totals?.users || 0} platform users`} />
          <StatCard icon={AccountBalanceIcon} value={revenue ? fmtMoney(revenue.total_paid) : '—'} label="Revenue Collected" sub={`${revenue ? fmtMoney(revenue.outstanding) : '—'} outstanding`} />
        </div>

        {renderCharts()}

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHead
              title="Tenant Health"
              sub="Institution lifecycle status across the platform"
              action={
                <div className="flex flex-wrap gap-2">
                  <Badge color="#166534" bg="#dcfce7">Active</Badge>
                  <Badge color="#92400e" bg="#fef3c7">Pending</Badge>
                  <Badge color="#991b1b" bg="#fee2e2">Blocked</Badge>
                </div>
              }
            />
            {overview ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Object.entries(overview.institutions_by_status).map(([status, count]) => {
                  const c = INSTITUTION_STATUS_COLORS[status] || { color: '#4b5563', bg: '#f3f4f6' };
                  return (
                    <div key={status} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-sm font-medium text-charcoal-soft">{status.replace(/_/g, ' ')}</span>
                      <span className="ml-auto text-base font-extrabold text-charcoal">{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-charcoal-faint">No data</p>
            )}
          </Panel>

          <Panel>
            <PanelHead title="Revenue Summary" sub="Invoice totals in NGN" />
            {revenue ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-bgsoft px-4 py-3">
                  <span className="text-sm font-semibold text-charcoal-soft">Total Billed</span>
                  <span className="text-base font-extrabold text-charcoal">{fmtMoney(revenue.total_billed)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-green-900">
                    <CheckCircleIcon sx={{ fontSize: 17 }} /> Collected
                  </span>
                  <span className="text-base font-extrabold text-green-900">{fmtMoney(revenue.total_paid)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                    <HourglassTopIcon sx={{ fontSize: 17 }} /> Outstanding
                  </span>
                  <span className="text-base font-extrabold text-amber-900">{fmtMoney(revenue.outstanding)}</span>
                </div>
                {overview?.plans && (
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-charcoal-faint">Plans In Use</p>
                    {Object.entries(overview.plans).map(([plan, count]) => (
                      <div key={plan} className="flex items-center justify-between py-1 text-sm">
                        <span className="text-charcoal-soft">{plan}</span>
                        <span className="font-bold text-charcoal">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-charcoal-faint">No data</p>
            )}
          </Panel>
        </div>

        <div className="mt-4">
          <Panel className="!p-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-charcoal">Recent Invoices</h3>
                <p className="mt-0.5 text-sm text-charcoal-faint">Latest subscription activity across tenants</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className="flex items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                View all invoices <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </button>
            </div>
            {renderInvoicesTable((overview?.recent_invoices || []) as unknown as InstitutionInvoice[])}
          </Panel>
        </div>
      </>
    );
  };

  const renderInstitutionsTable = (rows: AdminInstitutionRow[]) => {
    if (rows.length === 0) {
      return <p className="px-6 py-10 text-center text-sm text-charcoal-faint">No institution tenants yet.</p>;
    }
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Institution</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Students</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Staff</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Latest Invoice</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((inst) => (
              <TableRow key={inst.id} hover>
                <TableCell>
                  <p className="font-bold text-charcoal">{inst.name}</p>
                  <p className="text-xs text-charcoal-faint">{inst.short_name} · {inst.regulator_display}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-charcoal-soft">{inst.institution_type_display}</p>
                  <p className="text-xs text-charcoal-faint">{inst.ownership_display}</p>
                </TableCell>
                <TableCell>{renderStatusBadge(inst.status, inst.status_display)}</TableCell>
                <TableCell align="right">
                  <span className="font-extrabold text-charcoal">{inst.students_count}</span>
                </TableCell>
                <TableCell align="right">
                  <span className="font-extrabold text-charcoal">{inst.staff_count}</span>
                </TableCell>
                <TableCell align="right">
                  {inst.latest_invoice ? (
                    <div className="text-right">
                      <p className="text-sm font-bold text-charcoal">{fmtMoney(inst.latest_invoice.total_amount)}</p>
                      <p className="text-xs text-charcoal-faint">{inst.latest_invoice.invoice_number}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-charcoal-faint">—</span>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View institution">
                    <IconButton size="small" onClick={() => openInstitutionDetail(inst)}>
                      <ViewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderDetailStudents = (rows: StudentProfile[]) => {
    return (
      <Panel className="!p-0 overflow-hidden">
        <TablePanelHead title="Student Roster" sub={`${rows.length} enrolled learners across the tenant`} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Matric No.</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Program</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Active Pathway</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Employability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <p className="font-bold text-charcoal">{s.user_name}</p>
                    <p className="text-xs text-charcoal-faint">{s.user_email}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-charcoal-soft">{s.matric_number}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-charcoal-soft">{s.program_name}</p>
                    <p className="text-xs text-charcoal-faint">{s.program_code} · {s.award_level_display}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-charcoal">{s.level_display}</p>
                    <p className="text-xs text-charcoal-faint">{s.entry_mode_display}</p>
                  </TableCell>
                  <TableCell>
                    {s.active_pathway_title ? (
                      <p className="text-sm text-charcoal-soft">{s.active_pathway_title}</p>
                    ) : (
                      <span className="text-xs text-charcoal-faint">—</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <span className="font-extrabold text-charcoal">{s.employability_score}%</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Panel>
    );
  };

  const renderDetailStaff = (rows: InstitutionStaff[]) => {
    return (
      <Panel className="!p-0 overflow-hidden">
        <TablePanelHead title="Staff & Evaluators" sub={`${rows.length} faculty, deans & administrators`} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Staff</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Division</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((st) => (
                <TableRow key={st.id} hover>
                  <TableCell>
                    <p className="font-bold text-charcoal">{st.user_name}</p>
                    <p className="text-xs text-charcoal-faint">{st.user_email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-charcoal">{st.role_display}</p>
                    {st.title && <p className="text-xs text-charcoal-faint">{st.title}</p>}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-charcoal-soft">{st.division_name || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-charcoal-soft">{st.department_name || '—'}</span>
                  </TableCell>
                  <TableCell>
                    {st.is_active ? (
                      <Badge color="#166534" bg="#dcfce7">Active</Badge>
                    ) : (
                      <Badge color="#64748B" bg="#f1f5f9">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Panel>
    );
  };

  const renderDetailDivisions = (rows: AcademicDivision[]) => {
    if (rows.length === 0) {
      return <p className="text-center text-sm text-charcoal-faint">No academic divisions set up yet.</p>;
    }
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((div) => (
          <Panel key={div.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {div.code || div.division_type_display || 'Division'}
                </p>
                <h3 className="mt-1 text-base font-extrabold text-charcoal">{div.name}</h3>
                <p className="text-xs text-charcoal-faint">{div.division_type_display}</p>
              </div>
              <Badge color="primary.main" bg="primary.soft">{div.departments?.length || 0} depts</Badge>
            </div>
            {div.dean_name && (
              <p className="mt-2 text-sm text-charcoal-soft">Dean: {div.dean_name}</p>
            )}
            <div className="mt-3 space-y-2">
              {(div.departments || []).map((dept) => (
                <div key={dept.id} className="rounded-xl bg-bgsoft p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-charcoal">{dept.name}</p>
                    <span className="text-xs text-charcoal-faint">{dept.programs?.length || 0} programs</span>
                  </div>
                  {dept.hod_name && <p className="mt-0.5 text-xs text-charcoal-faint">HOD: {dept.hod_name}</p>}
                  {dept.programs && dept.programs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {dept.programs.map((p) => (
                        <Chip
                          key={p.id}
                          label={`${p.name} (${p.program_code})`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 11 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    );
  };

  const renderDetailPrograms = (rows: AcademicProgram[]) => {
    return (
      <Panel className="!p-0 overflow-hidden">
        <TablePanelHead title="Academic Programs" sub={`${rows.length} degree & diploma options`} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Program</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Award</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Duration</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <p className="font-bold text-charcoal">{p.name}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-charcoal-soft">{p.program_code}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-charcoal-soft">{p.department_name || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-charcoal-soft">{p.award_level_display || p.award_level}</span>
                  </TableCell>
                  <TableCell align="right">
                    <span className="font-semibold text-charcoal">{p.duration_years} yr(s)</span>
                  </TableCell>
                  <TableCell>
                    {p.is_active ? (
                      <Badge color="#166534" bg="#dcfce7">Active</Badge>
                    ) : (
                      <Badge color="#64748B" bg="#f1f5f9">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Panel>
    );
  };

  const renderDetailPathways = (rows: Pathway[]) => {
    if (rows.length === 0) {
      return <p className="text-center text-sm text-charcoal-faint">No career pathways set up yet.</p>;
    }
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((p) => (
          <Panel key={p.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {p.program_code} · {p.award_level_display}
                </p>
                <h3 className="mt-1 text-base font-extrabold text-charcoal">{p.title}</h3>
                <p className="text-sm text-charcoal-soft">{p.career_role}</p>
              </div>
              {p.is_active ? (
                <Badge color="#166534" bg="#dcfce7">Active</Badge>
              ) : (
                <Badge color="#64748B" bg="#f1f5f9">Inactive</Badge>
              )}
            </div>
            {p.industry_sector && (
              <p className="mt-2 text-xs text-charcoal-faint">Sector: {p.industry_sector}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge color="primary.main" bg="primary.soft">{p.total_milestones_count} milestones</Badge>
              <Badge color="#0EA5E9" bg="#E0F2FE">{p.total_points} pts</Badge>
              {p.target_cgpa_recommendation != null && (
                <Badge color="#F59E0B" bg="#FEF3C7">CGPA ≥ {p.target_cgpa_recommendation}</Badge>
              )}
            </div>
          </Panel>
        ))}
      </div>
    );
  };

  const renderDetailInvoices = (rows: InstitutionInvoice[]) => {
    return (
      <Panel className="!p-0 overflow-hidden">
        <TablePanelHead title="Subscription Invoices" sub={`${rows.length} invoices issued to this tenant`} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Invoice</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Issued</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell>
                    <p className="font-bold text-charcoal">{inv.invoice_number}</p>
                    {inv.payment_reference && (
                      <p className="text-xs text-charcoal-faint">Ref: {inv.payment_reference}</p>
                    )}
                    <ReceiptChip invoice={inv} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-charcoal-soft">{inv.plan_name || '—'}</span>
                  </TableCell>
                  <TableCell align="right">
                    <span className="font-extrabold text-charcoal">{fmtMoney(Number(inv.total_amount))}</span>
                  </TableCell>
                  <TableCell>{renderInvoiceBadge(inv.status, inv.status_display)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-charcoal-soft">{fmtDate(inv.created_at)}</span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip title="View full invoice & payment evidence">
                        <IconButton
                          size="small"
                          onClick={() => setViewingInvoice(inv)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <ViewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download invoice as PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadInvoicePdf(inv)}
                          sx={{ color: 'text.secondary' }}
                        >
                          {downloadingPdf === inv.id ? (
                            <CircularProgress size={15} />
                          ) : (
                            <PdfIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                      {inv.status === 'PAYMENT_SUBMITTED' && (
                        <>
                          <Tooltip title="Confirm & activate">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => openInvoiceReview('confirm', inv)}
                            >
                              <VerifiedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject submission">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openInvoiceReview('reject', inv)}
                            >
                              <BlockIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Panel>
    );
  };

  const renderInstitutionDetail = () => {
    if (detailLoading && !institutionDetail) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <CircularProgress size={40} color="primary" />
          <p className="mt-4 text-sm font-semibold text-charcoal-faint">Loading institution detail…</p>
        </div>
      );
    }
    const detail = institutionDetail;
    if (!detail) return null;
    const t = detail.totals;

    const detailTabs = [
      { key: 'students', label: `Students (${t.students})`, icon: GraduationCapIcon },
      { key: 'staff', label: `Staff (${t.staff})`, icon: GroupIcon },
      { key: 'divisions', label: `Divisions (${t.divisions})`, icon: AccountTreeIcon },
      { key: 'programs', label: `Programs (${t.programs})`, icon: MenuBookIcon },
      { key: 'pathways', label: `Pathways (${t.pathways})`, icon: VerifiedIcon },
      { key: 'invoices', label: `Invoices (${t.invoices})`, icon: ReceiptIcon },
    ] as const;

    const isActive = detail.status === 'ACTIVE';

    return (
      <>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={closeInstitutionDetail}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Back to all tenants
        </Button>
        <PageHead
          eyebrow="Institution Tenant"
          title={detail.name}
          sub={`${detail.short_name} · ${detail.institution_type_display} · ${detail.ownership_display} · ${detail.regulator_display}${detail.state ? ` · ${detail.state}` : ''}`}
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              {renderStatusBadge(detail.status, detail.status_display)}
              <Button
                variant="contained"
                color={isActive ? 'error' : 'success'}
                startIcon={isActive ? <BlockIcon /> : <VerifiedIcon />}
                disabled={statusBusy}
                onClick={handleInstitutionStatusToggle}
              >
                {statusBusy ? 'Updating…' : isActive ? 'Deactivate Account' : 'Reactivate Account'}
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={GraduationCapIcon} value={t.students} label="Students" sub="Enrolled learners" />
          <StatCard icon={GroupIcon} value={t.staff} label="Staff" sub="Faculty & administrators" />
          <StatCard icon={AccountTreeIcon} value={`${t.divisions} / ${t.departments}`} label="Divisions / Departments" sub="Academic hierarchy" />
          <StatCard icon={MenuBookIcon} value={t.programs} label="Programs" sub="Degree & diploma options" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={VerifiedIcon} value={t.pathways} label="Career Pathways" sub="Active roadmaps" />
          <StatCard icon={ReceiptIcon} value={t.invoices} label="Invoices" sub="Subscription billing" />
          <StatCard icon={PublicIcon} value={detail.is_founding_partner ? 'Yes' : 'No'} label="Founding Partner" sub="Early-adopter status" />
        </div>

        <Panel className="mt-4">
          <PanelHead title="Tenant Profile" sub="Registration details, contact & email domain whitelist" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal-faint">Address</p>
              <p className="mt-1 text-sm text-charcoal-soft">{detail.address || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal-faint">State</p>
              <p className="mt-1 text-sm text-charcoal-soft">{detail.state || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal-faint">Registered</p>
              <p className="mt-1 text-sm text-charcoal-soft">{fmtDate(detail.created_at)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal-faint">Allowed Email Domains</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {detail.domain_whitelist && detail.domain_whitelist.length > 0 ? (
                  detail.domain_whitelist.map((d) => (
                    <Chip key={d} label={d} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                  ))
                ) : (
                  <span className="text-sm text-charcoal-faint">—</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal-faint">Tier-2 Term</p>
              <p className="mt-1 text-sm text-charcoal-soft">{detail.tier_two_term}</p>
            </div>
          </div>
        </Panel>

        <div className="mt-6 flex flex-wrap gap-2">
          {detailTabs.map((tab) => {
            const Icon = tab.icon;
            const isSel = detailTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setDetailTab(tab.key)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                  isSel ? 'bg-primary text-white' : 'bg-bgsoft text-charcoal-soft hover:bg-primary-soft hover:text-primary'
                }`}
              >
                <Icon sx={{ fontSize: 16 }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {detailTab === 'students' && renderDetailStudents(detail.students)}
          {detailTab === 'staff' && renderDetailStaff(detail.staff)}
          {detailTab === 'divisions' && renderDetailDivisions(detail.divisions)}
          {detailTab === 'programs' && renderDetailPrograms(detail.programs)}
          {detailTab === 'pathways' && renderDetailPathways(detail.pathways)}
          {detailTab === 'invoices' && renderDetailInvoices(detail.invoices)}
        </div>
      </>
    );
  };

  const renderInvoicesTable = (rows: InstitutionInvoice[]) => {
    if (rows.length === 0) {
      return <p className="px-6 py-10 text-center text-sm text-charcoal-faint">No invoices issued yet.</p>;
    }
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Invoice</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Institution</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Plan</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Amount</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Issued</TableCell>
              {activeTab === 'invoices' && <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell>
                  <p className="font-bold text-charcoal">{inv.invoice_number}</p>
                  <p className="text-xs text-charcoal-faint">
                    {inv.payment_reference ? `Ref: ${inv.payment_reference}` : 'No payment ref'}
                  </p>
                  <ReceiptChip invoice={inv} />
                </TableCell>
                <TableCell>
                  <p className="text-sm font-semibold text-charcoal">{inv.institution_name}</p>
                  <p className="text-xs text-charcoal-faint">{inv.institution_short_name}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-charcoal-soft">{inv.plan_name}</p>
                </TableCell>
                <TableCell align="right">
                  <span className="font-extrabold text-charcoal">{fmtMoney(Number(inv.total_amount))}</span>
                </TableCell>
                <TableCell>{renderInvoiceBadge(inv.status, inv.status_display)}</TableCell>
                <TableCell>
                  <span className="text-sm text-charcoal-faint">{fmtDate(inv.created_at)}</span>
                </TableCell>
                {activeTab === 'invoices' && (
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip title="View full invoice & payment evidence">
                        <IconButton
                          size="small"
                          onClick={() => setViewingInvoice(inv)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <ViewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download invoice as PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadInvoicePdf(inv)}
                          sx={{ color: 'text.secondary' }}
                        >
                          {downloadingPdf === inv.id ? (
                            <CircularProgress size={15} />
                          ) : (
                            <PdfIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                      {inv.status === 'PAYMENT_SUBMITTED' && (
                        <>
                          <Tooltip title="Confirm payment & activate institution">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => openInvoiceReview('confirm', inv)}
                            >
                              <VerifiedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject payment submission">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openInvoiceReview('reject', inv)}
                            >
                              <BlockIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderBankDetails = () => {
    return (
      <>
        <PageHead
          eyebrow="Billing Configuration"
          title="Company Bank Details"
          sub="The company account shown on every institutional onboarding invoice."
          actions={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingBank(null);
                setBankDialogOpen(true);
              }}
            >
              Add Bank Details
            </Button>
          }
        />
        <Panel className="!p-0 overflow-hidden">
          <TablePanelHead
            title="Bank Accounts"
            sub="Active account is displayed on invoices and the payment gateway"
            action={<Badge color="primary.main" bg="primary.soft">{bankDetails.length} account(s)</Badge>}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Account Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Bank</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Account No.</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Currency</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bankDetails.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <p className="font-bold text-charcoal">{b.account_name}</p>
                      <p className="text-xs text-charcoal-faint">{b.support_email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-charcoal-soft">{b.bank_name}</p>
                      {b.sort_code_or_swift && (
                        <p className="text-xs text-charcoal-faint">{b.sort_code_or_swift}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-charcoal">{b.account_number}</span>
                    </TableCell>
                    <TableCell>{b.currency}</TableCell>
                    <TableCell>
                      {b.is_active ? (
                        <Badge color="#166534" bg="#dcfce7">Active</Badge>
                      ) : (
                        <Badge color="#64748B" bg="#f1f5f9">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingBank(b);
                              setBankDialogOpen(true);
                            }}
                          >
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleBankDelete(b)}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Panel>
      </>
    );
  };

  const renderPricingPlans = () => {
    return (
      <>
        <PageHead
          eyebrow="Fee Structures"
          title="Pricing Plans & Fee Structures"
          sub="Subscription tiers offered during institutional onboarding."
          actions={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingPlan(null);
                setPlanDialogOpen(true);
              }}
            >
              Add Pricing Plan
            </Button>
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((p) => (
            <Panel key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{p.code}</p>
                  <h3 className="mt-1 text-lg font-extrabold text-charcoal">{p.name}</h3>
                </div>
                {p.is_active ? (
                  <Badge color="#166534" bg="#dcfce7">Active</Badge>
                ) : (
                  <Badge color="#64748B" bg="#f1f5f9">Inactive</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-extrabold text-charcoal">{fmtMoney(Number(p.base_fee))}</p>
              <p className="text-xs text-charcoal-faint">base · + {fmtMoney(Number(p.setup_onboarding_fee))} setup</p>
              <p className="mt-3 min-h-[40px] text-sm text-charcoal-soft">{p.description}</p>
              <div className="mt-3 rounded-xl bg-bgsoft px-3.5 py-2.5 text-xs text-charcoal-faint">
                Up to <strong className="text-charcoal">{p.max_students.toLocaleString()}</strong> students ·{' '}
                {p.billing_cycle}
              </div>
              {p.features && p.features.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-charcoal-soft">
                      <CheckCircleIcon sx={{ fontSize: 14, color: 'primary.main' }} /> {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditingPlan(p);
                    setPlanDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handlePlanDelete(p)}
                >
                  Delete
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </>
    );
  };

  const renderUsers = () => {
    return (
      <>
        <PageHead
          eyebrow="User Registry"
          title="Platform Users"
          sub="Every account on the platform with its institution role."
          actions={
            <TextField
              size="small"
              placeholder="Search by name or email"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          }
        />
        <Panel className="!p-0 overflow-hidden">
          <TablePanelHead
            title="All Users"
            sub="Newest first"
            action={<Badge color="primary.main" bg="primary.soft">{users.length} users</Badge>}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Account Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Institution</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-extrabold text-primary">
                          {(u.name || u.email).slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-charcoal">{u.name || '—'}</p>
                          <p className="text-xs text-charcoal-faint">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.is_superuser ? (
                        <Badge color="#6b21a8" bg="#f3e8ff">Platform Admin</Badge>
                      ) : u.staff_profile ? (
                        <Badge color="#146B4A" bg="#dcfce7">{u.staff_profile.role_display || 'Staff'}</Badge>
                      ) : u.student_profile ? (
                        <Badge color="#1e40af" bg="#dbeafe">Student</Badge>
                      ) : (
                        <Badge color="#64748B" bg="#f1f5f9">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-charcoal-soft">
                        {u.staff_profile?.institution_name ||
                          u.student_profile?.institution_name ||
                          '—'}
                      </p>
                      {u.student_profile?.matric_number && (
                        <p className="text-xs text-charcoal-faint">{u.student_profile.matric_number}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.is_active ? (
                        <Badge color="#166534" bg="#dcfce7">Active</Badge>
                      ) : (
                        <Badge color="#991b1b" bg="#fee2e2">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-charcoal-faint">{fmtDate(u.date_joined)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Panel>
      </>
    );
  };

  return (
    <DashboardTheme>
      <div className="min-h-screen bg-bgsoft">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
          {SidebarContent}
        </aside>

        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          slotProps={{ paper: { sx: { width: 288 } } }}
        >
          {SidebarContent}
        </Drawer>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <IconButton className="lg:hidden" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
                <MenuIcon />
              </IconButton>
              <div className="hidden items-center gap-1.5 text-sm text-charcoal-faint sm:flex">
                <span className="font-semibold text-charcoal">Nexus Edutech Consult Ltd</span>
                <span>/</span>
                <span className="font-semibold text-primary">System Administration, Governance & Billing</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Tooltip title="Nigeria · Hosted In-Region">
                <span className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary md:inline-flex">
                  <PublicIcon sx={{ fontSize: 13 }} />
                  NDPR-Aligned
                </span>
              </Tooltip>
              <Tooltip title="Refresh console">
                <IconButton aria-label="Refresh console" onClick={refreshAll} disabled={loading || consoleLoading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pr-3 pl-1.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
                  {displayName.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-bold text-charcoal">{displayName}</span>
                  <span className="block text-[11px] text-charcoal-faint">Platform Super Admin</span>
                </span>
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {error}
                <button type="button" onClick={refreshAll} className="ml-3 font-bold underline">
                  Retry
                </button>
              </Alert>
            )}

            {loading && !overview ? (
              <div className="flex flex-col items-center justify-center py-24">
                <CircularProgress size={40} color="primary" />
                <p className="mt-4 text-sm font-semibold text-charcoal-faint">Loading platform console…</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && renderOverview()}

                {activeTab === 'institutions' && (
                  viewingInstitution ? (
                    renderInstitutionDetail()
                  ) : (
                  <>
                    <PageHead
                      eyebrow="Tenant Registry"
                      title="Institution Tenants"
                      sub={`${overview?.institutions.length || 0} institutions operating on the platform.`}
                    />
                    <Panel className="!p-0 overflow-hidden">
                      <TablePanelHead
                        title="All Institution Tenants"
                        sub="Student & staff volumes, lifecycle status and latest invoice"
                        action={<Badge color="primary.main" bg="primary.soft">{overview?.institutions.length || 0} tenants</Badge>}
                      />
                      {renderInstitutionsTable(overview?.institutions || [])}
                    </Panel>
                  </>
                  )
                )}

                {activeTab === 'invoices' && (
                  <>
                    <PageHead
                      eyebrow="Billing Console"
                      title="Institution Invoices"
                      sub="Confirm wire-transfer payments to activate institutions, or reject submissions."
                    />
                    {consoleLoading ? (
                      <div className="flex justify-center py-20">
                        <CircularProgress color="primary" />
                      </div>
                    ) : (
                      <Panel className="!p-0 overflow-hidden">
                        <TablePanelHead
                          title="All Invoices"
                          sub="Newest first · actions on payment submissions awaiting verification"
                          action={<Badge color="primary.main" bg="primary.soft">{invoices.length} invoices</Badge>}
                        />
                        {renderInvoicesTable(invoices)}
                      </Panel>
                    )}
                  </>
                )}

                {activeTab === 'bank' && (consoleLoading ? (
                  <div className="flex justify-center py-20">
                    <CircularProgress color="primary" />
                  </div>
                ) : (
                  renderBankDetails()
                ))}

                {activeTab === 'plans' && (consoleLoading ? (
                  <div className="flex justify-center py-20">
                    <CircularProgress color="primary" />
                  </div>
                ) : (
                  renderPricingPlans()
                ))}

                {activeTab === 'users' && (consoleLoading ? (
                  <div className="flex justify-center py-20">
                    <CircularProgress color="primary" />
                  </div>
                ) : (
                  renderUsers()
                ))}
              </>
            )}
          </main>
        </div>
      </div>

      <BankFormDialog
        open={bankDialogOpen}
        initial={editingBank}
        onClose={() => setBankDialogOpen(false)}
        onSubmit={handleBankSubmit}
        saving={savingBank}
      />

      <PlanFormDialog
        open={planDialogOpen}
        initial={editingPlan}
        onClose={() => setPlanDialogOpen(false)}
        onSubmit={handlePlanSubmit}
        saving={savingPlan}
      />

      <InvoiceActionDialog
        open={invoiceAction.invoice !== null}
        mode={invoiceAction.mode}
        invoice={invoiceAction.invoice}
        onClose={() => setInvoiceAction({ mode: 'confirm', invoice: null })}
        onConfirm={handleInvoiceConfirm}
        onReject={handleInvoiceReject}
        busy={invoiceBusy}
      />

      <InvoiceDetailDialog
        open={viewingInvoice !== null}
        invoice={viewingInvoice}
        token={token}
        onClose={() => setViewingInvoice(null)}
        onConfirm={() => viewingInvoice && openInvoiceReview('confirm', viewingInvoice)}
        onReject={() => viewingInvoice && openInvoiceReview('reject', viewingInvoice)}
      />

      <Snackbar
        open={toast !== null}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        message={toast || ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </DashboardTheme>
  );
};