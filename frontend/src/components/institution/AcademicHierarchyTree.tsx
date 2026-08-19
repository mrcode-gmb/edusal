import { useState, type FC } from 'react';
import type { InstitutionHierarchyTree } from '../../types/institution';
import {
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  AccountTree as AccountTreeIcon,
  School as SchoolIcon,
  Domain as DomainIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Verified as VerifiedIcon,
  Add as AddIcon,
  PlaylistAdd as PlaylistAddIcon,
  LibraryAdd as LibraryAddIcon,
  DeleteOutlined as DeleteOutlineIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { Panel, PageHead, StatCard, LoadingBlock } from './Shared';

interface AcademicHierarchyTreeProps {
  tree: InstitutionHierarchyTree | null;
  loading: boolean;
  onAddDivision: () => void;
  onAddDepartment: (divisionId: string) => void;
  onAddProgram: (departmentId: string) => void;
  onOpenBulkImport?: () => void;
  onDeleteDivision?: (divisionId: string, divisionName: string) => Promise<void>;
  onDeleteDepartment?: (departmentId: string, departmentName: string) => Promise<void>;
  onDeleteProgram?: (programId: string, programName: string) => Promise<void>;
}

type TreeNode = {
  id: string;
  name: string;
  tier: string;
  meta: Record<string, string | number | boolean | undefined>;
  children?: TreeNode[];
};

const tierMeta = [
  { tier: 'Tier 1', label: 'Institution', icon: SchoolIcon, note: 'Native scope root' },
  { tier: 'Tier 2', label: 'School / Faculty', icon: DomainIcon, note: 'Native Tier-2 scope' },
  { tier: 'Tier 3', label: 'Department', icon: AccountTreeIcon, note: 'SIWES-eligible unit' },
  { tier: 'Tier 4', label: 'Degree Option', icon: AutoAwesomeIcon, note: 'Rubric-mapped' },
];

function buildTree(tree: InstitutionHierarchyTree): TreeNode {
  const t2Label = tree.tier_two_term === 'SCHOOL' ? 'School' : tree.tier_two_term === 'COLLEGE' ? 'College' : 'Faculty';
  return {
    id: tree.id,
    name: tree.name,
    tier: 'Tier 1 · Institution',
    meta: { reg: `${tree.regulator} Regulated`, type: tree.institution_type },
    children: tree.divisions.map((div) => ({
      id: div.id,
      name: div.name,
      tier: `Tier 2 · ${t2Label}`,
      meta: { code: div.code, depts: div.departments.length, dean: div.dean_name || 'Not assigned' },
      children: div.departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        tier: 'Tier 3 · Department',
        meta: {
          code: dept.code,
          programmes: dept.programs.length,
          siwes: dept.siwes_eligible,
          hod: dept.hod_name || 'Unassigned',
        },
        children: dept.programs.map((prog) => ({
          id: prog.id,
          name: prog.name,
          tier: 'Tier 4 · Degree Option',
          meta: {
            code: prog.program_code,
            rubric: prog.award_level_display,
            duration: `${prog.duration_years} Years`,
            siwes: prog.siwes_duration_months > 0,
            siwes_months: prog.siwes_duration_months > 0 ? `${prog.siwes_duration_months} Months` : 'Exempt',
            siwes_pattern: prog.siwes_pattern_display || (prog.siwes_duration_months > 0 ? `${prog.siwes_duration_months} Mo SIWES` : 'Non-SIWES'),
          },
        })),
      })),
    })),
  };
}

function TierNode({
  node,
  depth = 0,
  selected,
  onSelect,
  expanded,
  onToggle,
  onAddDepartment,
  onAddProgram,
  onRequestDelete,
}: {
  node: TreeNode;
  depth?: number;
  selected: TreeNode;
  onSelect: (n: TreeNode) => void;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAddDepartment: (divisionId: string) => void;
  onAddProgram: (departmentId: string) => void;
  onRequestDelete: (id: string, name: string, type: 'division' | 'department' | 'program') => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = expanded[node.id];
  const isSel = selected.id === node.id;
  const isTier2 = node.tier.includes('Tier 2');
  const isTier3 = node.tier.includes('Tier 3');
  const isTier4 = node.tier.includes('Tier 4');

  return (
    <div>
      <div
        className={`group flex w-full items-center gap-2 rounded-[15px] border px-3 py-2.5 text-left transition-colors ${
          isSel
            ? 'border-primary bg-primary-soft'
            : 'border-transparent hover:border-line hover:bg-bgsoft'
        }`}
        style={{ marginLeft: depth * 18 }}
      >
        <IconButton
          size="small"
          onClick={() => {
            if (hasChildren) onToggle(node.id);
          }}
          aria-label="Expand"
        >
          {isOpen ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => onSelect(node)}
        >
          <span className="truncate text-sm font-semibold text-charcoal">{node.name}</span>
        </button>

        {isTier2 && (
          <>
            <Tooltip title="Add Department">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddDepartment(node.id);
                }}
              >
                <PlaylistAddIcon fontSize="small" sx={{ color: 'primary.main' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Faculty / School">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete(node.id, node.name, 'division');
                }}
                sx={{ color: 'charcoal.faint', '&:hover': { color: 'error.main' } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}

        {isTier3 && (
          <>
            <Tooltip title="Add Program">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddProgram(node.id);
                }}
              >
                <LibraryAddIcon fontSize="small" sx={{ color: 'primary.main' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Department">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete(node.id, node.name, 'department');
                }}
                sx={{ color: 'charcoal.faint', '&:hover': { color: 'error.main' } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}

        {isTier4 && (
          <Tooltip title="Delete Program">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(node.id, node.name, 'program');
              }}
              sx={{ color: 'charcoal.faint', '&:hover': { color: 'error.main' } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      {isOpen &&
        node.children?.map((c) => (
          <TierNode
            key={c.id}
            node={c}
            depth={depth + 1}
            selected={selected}
            onSelect={onSelect}
            expanded={expanded}
            onToggle={onToggle}
            onAddDepartment={onAddDepartment}
            onAddProgram={onAddProgram}
            onRequestDelete={onRequestDelete}
          />
        ))}
    </div>
  );
}

function DetailPanel({
  node,
  onAddDepartment,
  onAddProgram,
  onRequestDelete,
}: {
  node: TreeNode;
  onAddDepartment: (divisionId: string) => void;
  onAddProgram: (departmentId: string) => void;
  onRequestDelete: (id: string, name: string, type: 'division' | 'department' | 'program') => void;
}) {
  const icon = node.tier.includes('Tier 1')
    ? SchoolIcon
    : node.tier.includes('Tier 2')
      ? DomainIcon
      : node.tier.includes('Tier 3')
        ? AccountTreeIcon
        : AutoAwesomeIcon;
  const Icon = icon;
  const m = node.meta;
  const siwes = Boolean(m.siwes);
  const isTier2 = node.tier.includes('Tier 2');
  const isTier3 = node.tier.includes('Tier 3');
  const isTier4 = node.tier.includes('Tier 4');

  return (
    <Panel>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        Node Detail
      </p>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-[15px] bg-primary-soft">
          <Icon sx={{ fontSize: 28, color: 'primary.main' }} />
        </span>
        <div>
          <h3 className="text-lg font-bold text-charcoal">{node.name}</h3>
          <p className="text-sm text-charcoal-faint">{node.tier}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {'siwes' in m && (
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
            label={siwes ? 'SIWES Eligible' : 'Not Eligible'}
            size="small"
            sx={{
              bgcolor: siwes ? 'primary.soft' : 'action.hover',
              color: siwes ? 'primary.main' : 'text.secondary',
              fontWeight: 700,
            }}
          />
        )}
        {m.code && (
          <Chip
            label={String(m.code)}
            size="small"
            variant="outlined"
            sx={{ color: 'charcoal.soft', borderColor: 'border.strong', fontWeight: 700 }}
          />
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          { k: 'Registry', v: m.reg || '—' },
          { k: 'Type', v: m.type || '—' },
          { k: 'Dean', v: m.dean || '—' },
          { k: 'HOD', v: m.hod || '—' },
          { k: 'Departments', v: m.depts ?? '—' },
          { k: 'Programmes', v: m.programmes ?? '—' },
          { k: 'Rubric', v: m.rubric || '—' },
          { k: 'Duration', v: m.duration || '—' },
          { k: 'SIWES Schedule', v: m.siwes_pattern || '—' },
        ].filter((r) => r.v !== '—').map((r) => (
          <div key={r.k} className="rounded-[15px] bg-bgsoft px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
              {r.k}
            </p>
            <p className="mt-0.5 text-sm font-bold text-charcoal">{r.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {isTier2 && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PlaylistAddIcon />}
              onClick={() => onAddDepartment(node.id)}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
            >
              Add Department
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => onRequestDelete(node.id, node.name, 'division')}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Delete Faculty
            </Button>
          </div>
        )}

        {isTier3 && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<LibraryAddIcon />}
              onClick={() => onAddProgram(node.id)}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
            >
              Add Program
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => onRequestDelete(node.id, node.name, 'department')}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Delete Department
            </Button>
          </div>
        )}

        {isTier4 && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => onRequestDelete(node.id, node.name, 'program')}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, width: '100%' }}
          >
            Delete Degree Programme
          </Button>
        )}
      </div>
    </Panel>
  );
}

export const AcademicHierarchyTree: FC<AcademicHierarchyTreeProps> = ({
  tree,
  loading,
  onAddDivision,
  onAddDepartment,
  onAddProgram,
  onOpenBulkImport,
  onDeleteDivision,
  onDeleteDepartment,
  onDeleteProgram,
}) => {
  const [selected, setSelected] = useState<TreeNode | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: 'division' | 'department' | 'program';
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRequestDelete = (id: string, name: string, type: 'division' | 'department' | 'program') => {
    setDeleteTarget({ id, name, type });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'division' && onDeleteDivision) {
        await onDeleteDivision(deleteTarget.id, deleteTarget.name);
      } else if (deleteTarget.type === 'department' && onDeleteDepartment) {
        await onDeleteDepartment(deleteTarget.id, deleteTarget.name);
      } else if (deleteTarget.type === 'program' && onDeleteProgram) {
        await onDeleteProgram(deleteTarget.id, deleteTarget.name);
      }
      if (selected?.id === deleteTarget.id) {
        setSelected(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <LoadingBlock
        label="Loading your institution structure…"
        sub="Mapping out your schools, departments and programmes."
      />
    );
  }

  if (!tree) {
    return (
      <Panel>
        <p className="text-sm text-charcoal-faint">No institutional hierarchy data available.</p>
      </Panel>
    );
  }

  const root = buildTree(tree);
  const active = selected || root;
  const t2Label = tree.tier_two_term === 'SCHOOL' ? 'School' : tree.tier_two_term === 'COLLEGE' ? 'College' : 'Faculty';

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const totalDepartments = tree.divisions.reduce(
    (sum, d) => sum + d.departments.length,
    0,
  );
  const totalPrograms = tree.divisions.reduce(
    (sum, d) =>
      sum +
      d.departments.reduce((s2, dept) => s2 + dept.programs.length, 0),
    0,
  );
  const siwesEligible = tree.divisions.reduce(
    (sum, d) => sum + d.departments.filter((dept) => dept.siwes_eligible).length,
    0,
  );

  return (
    <div>
      <PageHead
        eyebrow="Institutional Structure"
        title="4-Tier Hierarchy Explorer"
        sub="Every faculty, department, and degree option mapped as a strictly relational governance tree."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {onOpenBulkImport && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutoAwesomeIcon />}
                onClick={onOpenBulkImport}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                Bulk Setup Wizard (Excel / Blueprint)
              </Button>
            )}
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AddIcon />}
              onClick={onAddDivision}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Add Academic Division
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tierMeta.map((t) => {
          const Icon = t.icon;
          return (
            <Panel key={t.tier} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[15px] bg-primary-soft">
                  <Icon sx={{ fontSize: 20, color: 'primary.main' }} />
                </span>
                <div>
                  <p className="text-sm font-bold text-charcoal">{t.label}</p>
                  <p className="text-xs font-semibold text-primary">{t.tier}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-charcoal-faint">{t.note}</p>
            </Panel>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <p className="mb-4 text-sm font-bold text-charcoal">
            Hierarchy Tree — click to inspect or manage any node
          </p>
          <TierNode
            node={root}
            depth={0}
            selected={active}
            onSelect={setSelected}
            expanded={expanded}
            onToggle={toggle}
            onAddDepartment={onAddDepartment}
            onAddProgram={onAddProgram}
            onRequestDelete={handleRequestDelete}
          />
        </Panel>
        <DetailPanel
          node={active}
          onAddDepartment={onAddDepartment}
          onAddProgram={onAddProgram}
          onRequestDelete={handleRequestDelete}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={SchoolIcon}
          value="1"
          label="Institution (Tier 1)"
          sub={`${tree.name} — ${tree.regulator} regulated`}
        />
        <StatCard
          icon={DomainIcon}
          value={tree.divisions_count}
          label={`${t2Label}s (Tier 2)`}
          sub={`${tree.divisions.length} mapped ${t2Label.toLowerCase()}s`}
        />
        <StatCard
          icon={AccountTreeIcon}
          value={totalDepartments}
          label="Departments (Tier 3)"
          sub={`${siwesEligible} SIWES eligible · ${totalPrograms} programmes`}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-error-light/20 text-error">
            <WarningAmberIcon color="error" />
          </span>
          <span className="font-bold text-charcoal text-base">
            Delete {deleteTarget?.type === 'division' ? 'School / Faculty' : deleteTarget?.type === 'department' ? 'Department' : 'Degree Programme'}
          </span>
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <p className="text-sm text-charcoal">
            Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>?
          </p>
          {deleteTarget?.type === 'division' && (
            <p className="mt-2 text-xs text-error font-medium bg-error-light/10 p-2.5 rounded-lg border border-error/20">
              ⚠️ Warning: Deleting this faculty will cascade and permanently delete all departments, programmes, and course links under it.
            </p>
          )}
          {deleteTarget?.type === 'department' && (
            <p className="mt-2 text-xs text-error font-medium bg-error-light/10 p-2.5 rounded-lg border border-error/20">
              ⚠️ Warning: Deleting this department will cascade and remove all degree programmes and SIWES mappings under it.
            </p>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            variant="outlined"
            color="inherit"
            disabled={deleting}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
          >
            {deleting ? 'Deleting…' : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
