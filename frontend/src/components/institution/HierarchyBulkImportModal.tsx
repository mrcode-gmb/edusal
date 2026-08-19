import { useState, useEffect, type FC, type ChangeEvent } from 'react';
import type { BlueprintFaculty } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
  Domain as DomainIcon,
  AccountTree as AccountTreeIcon,
  Description as DescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Layers as LayersIcon,
  TableChart as TableChartIcon,
  HelpOutlined as HelpOutlineIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from '@mui/icons-material';

interface HierarchyBulkImportModalProps {
  open: boolean;
  onClose: () => void;
  institutionId: string;
  institutionName: string;
  token?: string;
  onSuccess: () => Promise<void>;
}

const siwesGuideList = [
  {
    code: 'SPLIT_200L_300L',
    title: 'Split Vacations (3 Mo @ 200L + 3 Mo @ 300L)',
    impact: 'Vacation Only (0 Semester Disruption)',
    desc: 'Runs purely during long vacations after 200L and 300L. No academic classes missed.',
  },
  {
    code: 'SEM2_300L',
    title: '300 Level Second Semester (6 Months Continuous)',
    impact: 'Replaces 300L Sem 2',
    desc: 'Standard for 4-year B.Sc. (Computer Science, Natural Sciences).',
  },
  {
    code: 'YEAR4_400L_EXTENDED',
    title: '400 Level Extended (6 to 9 Months)',
    impact: 'Extended Industrial Year',
    desc: 'Standard for 5-year B.Eng / B.Tech / Agriculture before 500L final year.',
  },
  {
    code: 'ND_VACATION',
    title: 'ND Industrial Attachment (3 to 4 Months)',
    impact: 'Vacation Only',
    desc: 'Polytechnic ND students during vacation between ND I and ND II.',
  },
  {
    code: 'POST_ND_MANDATORY',
    title: 'Post-ND Mandatory Training (12 Months)',
    impact: 'Mandatory Gap Year',
    desc: '1-Year mandatory industrial training required before HND admission.',
  },
  {
    code: 'TEACHING_PRACTICE',
    title: 'Teaching Practice / Practicum (3 to 6 Months)',
    impact: 'In-Session Practicum',
    desc: 'Faculty of Education (B.Ed) and Colleges of Education (NCE).',
  },
  {
    code: 'EXEMPT',
    title: 'Exempt / Non-Participating (0 Months)',
    impact: 'No SIWES Requirement',
    desc: 'Law (LL.B), Arts & Humanities, Accounting, Business Administration.',
  },
];

export const HierarchyBulkImportModal: FC<HierarchyBulkImportModalProps> = ({
  open,
  onClose,
  institutionId,
  institutionName,
  token,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  // Tab 1: File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [parsing, setParsing] = useState(false);
  const [showSiwesHelp, setShowSiwesHelp] = useState(false);

  // Tab 2: Blueprint Master Catalog State
  const [archetype, setArchetype] = useState<string>('UNIVERSITY_COMPREHENSIVE');
  const [blueprints, setBlueprints] = useState<BlueprintFaculty[]>([]);
  const [selectedBlueprintKeys, setSelectedBlueprintKeys] = useState<Record<string, boolean>>({});
  const [loadingBlueprints, setLoadingBlueprints] = useState(false);
  const [expandedFacultyKey, setExpandedFacultyKey] = useState<string | null>(null);

  // Submission & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadBlueprints(archetype);
    }
  }, [open, archetype]);

  const loadBlueprints = async (arch: string) => {
    setLoadingBlueprints(true);
    try {
      const data = await institutionApi.getHierarchyBlueprints(arch);
      setBlueprints(data.blueprints || []);
      const initialSelected: Record<string, boolean> = {};
      (data.blueprints || []).forEach((b) => {
        initialSelected[b.key] = true;
      });
      setSelectedBlueprintKeys(initialSelected);
    } catch (err: unknown) {
      console.error('Failed to load blueprints:', err);
    } finally {
      setLoadingBlueprints(false);
    }
  };

  const handleSelectAllBlueprints = (select: boolean) => {
    const updated: Record<string, boolean> = {};
    blueprints.forEach((b) => {
      updated[b.key] = select;
    });
    setSelectedBlueprintKeys(updated);
  };

  const toggleBlueprintKey = (key: string) => {
    setSelectedBlueprintKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    setSuccessMessage(null);

    // If it's a CSV file, parse in browser for live table preview
    if (file.name.toLowerCase().endsWith('.csv')) {
      setParsing(true);
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const rows = parseCSVText(text);
          setParsedRows(rows);
        } catch {
          setError('Failed to parse CSV file.');
        } finally {
          setParsing(false);
        }
      };
      reader.onerror = () => {
        setError('Error reading file.');
        setParsing(false);
      };
      reader.readAsText(file);
    } else {
      // Excel (.xlsx) file will be parsed directly by backend openpyxl
      setParsedRows([]);
    }
  };

  const parseCSVText = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const results: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i];
      const values = currentline.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || currentline.split(',');
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        let val = values[index] ? values[index].trim() : '';
        val = val.replace(/^["']|["']$/g, '');
        obj[header] = val;
      });
      if (obj.division_name || obj.department_name) {
        results.push(obj);
      }
    }
    return results;
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile && parsedRows.length === 0) {
      setError('Please select an Excel (.xlsx) or CSV spreadsheet to import.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await institutionApi.bulkImportHierarchy(
        institutionId,
        { file: selectedFile || undefined, rows: parsedRows.length > 0 ? parsedRows : undefined },
        token
      );
      setSuccessMessage(
        `Successfully imported hierarchy: ${result.stats.created_divisions} Divisions, ${result.stats.created_departments} Departments, and ${result.stats.created_programs} Degree Programmes created.`
      );
      await onSuccess();
      setSelectedFile(null);
      setParsedRows([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to import hierarchy records.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlueprintSubmit = async () => {
    const selectedKeys = Object.keys(selectedBlueprintKeys).filter((k) => selectedBlueprintKeys[k]);
    if (selectedKeys.length === 0) {
      setError('Please select at least one faculty / school to import.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await institutionApi.importHierarchyBlueprint(institutionId, selectedKeys, token);
      const s = result.stats;
      setSuccessMessage(
        `Successfully deployed Master Blueprint: ${s.divisions_created} Faculties, ${s.departments_created} Departments, and ${s.programs_created} Degree Programmes added to ${institutionName}.`
      );
      await onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to deploy blueprint hierarchy.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = Object.keys(selectedBlueprintKeys).filter((k) => selectedBlueprintKeys[k]).length;
  const totalSelectedDepts = blueprints
    .filter((b) => selectedBlueprintKeys[b.key])
    .reduce((sum, b) => sum + b.departments_count, 0);
  const totalSelectedProgs = blueprints
    .filter((b) => selectedBlueprintKeys[b.key])
    .reduce((sum, b) => sum + b.programs_count, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <LayersIcon sx={{ fontSize: 24 }} />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-charcoal">
              4-Tier Academic Hierarchy & SIWES Setup Wizard
            </h2>
            <p className="text-xs text-charcoal-faint">
              {institutionName} · Nexus Edutech Master Catalog & Multi-Sheet Excel Importer
            </p>
          </div>
        </div>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'charcoal.faint', '&:hover': { color: 'charcoal' } }}
        >
          <CloseIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-line bg-bgsoft/50 px-6">
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setError(null);
            setSuccessMessage(null);
          }}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '13px',
              minHeight: 48,
            },
          }}
        >
          <Tab
            icon={<TableChartIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Strategy 1: Multi-Sheet Excel / CSV Importer"
          />
          <Tab
            icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Strategy 2: NUC / National Master Blueprint Library"
          />
        </Tabs>
      </div>

      <DialogContent sx={{ p: { xs: 3, sm: 4 }, bgcolor: 'background.default' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* TAB 1: EXCEL / CSV BULK IMPORTER */}
        {activeTab === 0 && (
          <div className="space-y-5">
            {/* Download Templates Banner */}
            <div className="rounded-2xl border border-primary/20 bg-primary-faint/30 p-5">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <TableChartIcon sx={{ fontSize: 18 }} />
                    Step 1: Download Official Excel Workbook (.xlsx)
                  </h4>
                  <p className="text-xs text-charcoal-soft mt-1 leading-relaxed max-w-2xl">
                    Our professionally styled Excel template includes our company branding, an in-depth <strong>SIWES Placement Manual</strong>, <strong>Data Dictionary</strong>, and pre-populated standard disciplines. Open in Excel, enter Dean/HOD details or delete unoffered rows, and upload below.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    href={institutionApi.getDownloadHierarchyTemplateUrl(true, undefined, 'excel')}
                    startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 2 }}
                  >
                    Master Excel (.xlsx)
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    href={institutionApi.getDownloadHierarchyTemplateUrl(false, undefined, 'excel')}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontSize: 11 }}
                  >
                    Blank Excel (.xlsx)
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    size="small"
                    href={institutionApi.getDownloadHierarchyTemplateUrl(true, undefined, 'csv')}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontSize: 11, color: 'charcoal.faint' }}
                  >
                    Plain CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* SIWES Operational Patterns Quick Guide Accordion */}
            <div className="rounded-2xl border border-line bg-white p-4">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setShowSiwesHelp(!showSiwesHelp)}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <HelpOutlineIcon sx={{ fontSize: 16 }} />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-charcoal">
                      SIWES Operational Patterns Reference Guide
                    </h5>
                    <p className="text-[11px] text-charcoal-faint">
                      Click to view all 7 supported industrial training schedules across Nigerian institutions
                    </p>
                  </div>
                </div>
                <IconButton size="small" sx={{ color: 'charcoal.faint' }}>
                  {showSiwesHelp ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </div>

              <Collapse in={showSiwesHelp} timeout="auto" unmountOnExit>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 border-t border-line/60 pt-3">
                  {siwesGuideList.map((item) => (
                    <div key={item.code} className="rounded-xl border border-line/80 bg-bgsoft/50 p-3 text-xs">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-mono text-[11px] font-bold text-primary bg-white px-1.5 py-0.5 rounded border border-line">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-bold text-charcoal-faint uppercase tracking-wider">
                          {item.impact}
                        </span>
                      </div>
                      <p className="mt-1 font-bold text-charcoal text-[11px]">{item.title}</p>
                      <p className="text-[11px] text-charcoal-faint mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>

            {/* Upload Dropzone */}
            <div className="rounded-2xl border-2 border-dashed border-line-strong bg-white p-6 text-center transition-colors hover:border-primary/60">
              <input
                type="file"
                id="hierarchy-excel-csv-input"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="hierarchy-excel-csv-input" className="cursor-pointer block">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-2">
                  <CloudUploadIcon sx={{ fontSize: 28 }} />
                </span>
                <h5 className="text-sm font-bold text-charcoal">
                  {selectedFile ? selectedFile.name : 'Click or Drag & Drop your edited Excel (.xlsx) or CSV file here'}
                </h5>
                <p className="text-xs text-charcoal-faint mt-0.5">
                  Supports .xlsx workbooks and .csv files with standard columns
                </p>
                {selectedFile && (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary-faint px-3 py-1 rounded-full">
                    <AssignmentTurnedInIcon sx={{ fontSize: 15 }} />
                    File Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </label>
            </div>

            {/* Live Parsing Preview (CSV) */}
            {parsing && (
              <div className="p-6 text-center">
                <CircularProgress size={24} color="primary" />
                <p className="text-xs text-charcoal-faint mt-2 font-semibold">Parsing spreadsheet rows…</p>
              </div>
            )}

            {parsedRows.length > 0 && !parsing && (
              <div className="rounded-2xl border border-line bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      Parsed Preview ({parsedRows.length} Rows Discovered)
                    </span>
                    <Chip
                      label="Valid Structure"
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                    />
                  </div>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      setSelectedFile(null);
                      setParsedRows([]);
                    }}
                    sx={{ fontSize: 11, textTransform: 'none' }}
                  >
                    Clear File
                  </Button>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-line">
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'background.paper' }}>Faculty / Division</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'background.paper' }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'background.paper' }}>Degree Programme</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'background.paper' }}>SIWES Pattern</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'background.paper' }}>Years</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parsedRows.slice(0, 50).map((r, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{r.division_name}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{r.department_name}</TableCell>
                          <TableCell sx={{ fontSize: 12, color: 'primary.main', fontWeight: 600 }}>
                            {r.program_name || '—'}
                          </TableCell>
                          <TableCell sx={{ fontSize: 11 }}>
                            {r.siwes_pattern || (r.siwes_eligible?.toUpperCase() === 'TRUE' ? `${r.siwes_duration_months || 6} Mo` : 'Exempt')}
                          </TableCell>
                          <TableCell sx={{ fontSize: 11 }}>{r.duration_years || 4} Yrs</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NUC MASTER BLUEPRINT SELECTOR */}
        {activeTab === 1 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
              <div className="w-full sm:w-80">
                <FormControl fullWidth size="small">
                  <InputLabel>Institutional Profile / Archetype</InputLabel>
                  <Select
                    value={archetype}
                    label="Institutional Profile / Archetype"
                    onChange={(e) => setArchetype(e.target.value)}
                    sx={{ borderRadius: '10px' }}
                  >
                    <MenuItem value="UNIVERSITY_COMPREHENSIVE">Comprehensive University (All Disciplines)</MenuItem>
                    <MenuItem value="UNIVERSITY_TECHNOLOGY">University of Technology / Engineering</MenuItem>
                    <MenuItem value="POLYTECHNIC_STANDARD">Polytechnic / Monotechnic Archetype</MenuItem>
                    <MenuItem value="COLLEGE_OF_EDUCATION">College of Education Archetype</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleSelectAllBlueprints(true)}
                  sx={{ borderRadius: '6px', textTransform: 'none', fontSize: 11 }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleSelectAllBlueprints(false)}
                  sx={{ borderRadius: '6px', textTransform: 'none', fontSize: 11 }}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            {loadingBlueprints ? (
              <div className="p-8 text-center">
                <CircularProgress size={28} color="primary" />
                <p className="text-xs text-charcoal-faint mt-2 font-semibold">Loading master NUC catalog…</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {blueprints.map((faculty) => {
                  const isChecked = !!selectedBlueprintKeys[faculty.key];
                  const isExpanded = expandedFacultyKey === faculty.key;

                  return (
                    <div
                      key={faculty.key}
                      className={`rounded-2xl border transition-all ${
                        isChecked
                          ? 'border-primary/40 bg-white shadow-card ring-1 ring-primary/20'
                          : 'border-line bg-white/70 opacity-75'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={() => toggleBlueprintKey(faculty.key)}
                                sx={{ color: 'primary.main' }}
                              />
                            }
                            label={
                              <div>
                                <span className="font-extrabold text-sm text-charcoal block leading-tight">
                                  {faculty.name}
                                </span>
                                <span className="text-[11px] font-bold text-primary">
                                  Code: {faculty.code} · {faculty.departments_count} Departments · {faculty.programs_count} Programmes
                                </span>
                              </div>
                            }
                            sx={{ m: 0, alignItems: 'flex-start' }}
                          />

                          <IconButton
                            size="small"
                            onClick={() => setExpandedFacultyKey(isExpanded ? null : faculty.key)}
                            sx={{ color: 'charcoal.faint' }}
                          >
                            {isExpanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </div>

                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <div className="mt-3 border-t border-line/60 pt-3 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-faint">
                              Included Departments & Degrees:
                            </p>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {faculty.departments.map((d) => (
                                <div key={d.code} className="rounded-lg bg-bgsoft/60 p-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-charcoal">{d.name} ({d.code})</span>
                                    <span className="text-[10px] text-charcoal-faint font-semibold">
                                      {d.siwes_eligible ? 'SIWES Eligible' : 'Exempt'}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {d.programs.map((p) => (
                                      <span
                                        key={p.code}
                                        className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-line"
                                      >
                                        {p.name} ({p.duration_years} yrs)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Collapse>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 4, py: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-charcoal-faint font-semibold">
            {activeTab === 0 ? (
              selectedFile ? `File ready: ${selectedFile.name}` : parsedRows.length > 0 ? `${parsedRows.length} rows ready for import` : 'Upload an Excel or CSV file to begin'
            ) : (
              `${selectedCount} Faculties selected (${totalSelectedDepts} Departments, ${totalSelectedProgs} Programmes)`
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onClose}
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>

            {activeTab === 0 ? (
              <Button
                variant="contained"
                color="primary"
                disabled={submitting || (!selectedFile && parsedRows.length === 0)}
                onClick={handleUploadSubmit}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                {submitting ? 'Importing…' : 'Import Spreadsheet'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                disabled={submitting || selectedCount === 0}
                onClick={handleBlueprintSubmit}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                {submitting ? 'Deploying…' : `Deploy Selected (${selectedCount} Faculties)`}
              </Button>
            )}
          </div>
        </div>
      </DialogActions>
    </Dialog>
  );
};
