import { useState, type FC, type ChangeEvent } from 'react';
import type { InstitutionHierarchyTree, AcademicSession } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
  CheckCircleOutlined as CheckCircleIcon,
  ErrorOutlined as ErrorIcon,
  AutoAwesome as AutoAwesomeIcon,
  Layers as LayersIcon,
  Verified as VerifiedIcon,
  LockReset as LockIcon,
} from '@mui/icons-material';

interface StudentBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string;
  institutionName: string;
  tree: InstitutionHierarchyTree | null;
  sessions: AcademicSession[];
  authToken?: string | null;
  onSuccess: () => void;
  initialProgramId?: string;
}

export const StudentBulkImportModal: FC<StudentBulkImportModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  institutionName,
  tree,
  sessions,
  authToken,
  onSuccess,
  initialProgramId,
}) => {
  // 1. Flatten all programs with division & department hierarchy
  const availablePrograms: Array<{
    id: string;
    name: string;
    code: string;
    departmentName: string;
    divisionName: string;
    durationYears: number;
    awardLevel: string;
    awardLevelDisplay: string;
    siwesMonths: number;
  }> = [];

  if (tree) {
    tree.divisions.forEach((div) => {
      div.departments.forEach((dept) => {
        dept.programs.forEach((prog) => {
          availablePrograms.push({
            id: prog.id,
            name: prog.name,
            code: prog.program_code || '',
            departmentName: dept.name,
            divisionName: div.name,
            durationYears: prog.duration_years || 4,
            awardLevel: prog.award_level || 'BSC',
            awardLevelDisplay: prog.award_level_display || prog.award_level || 'B.Sc.',
            siwesMonths: prog.siwes_duration_months || 0,
          });
        });
      });
    });
  }

  const [selectedProgramId, setSelectedProgramId] = useState<string>(() => {
    return initialProgramId || (availablePrograms[0]?.id || '');
  });

  const [file, setFile] = useState<File | null>(null);
  const [passwordScheme, setPasswordScheme] = useState<'matric' | 'pin'>('matric');
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    can_commit?: boolean;
    program?: { id: string; name: string; code?: string; duration_years?: number; department_name?: string; division_name?: string };
    stats?: { total_rows: number; valid_count: number; error_count: number };
    valid_rows?: any[];
    errors?: Array<{ row_number: number; matric_number: string; name: string; email: string; reasons: string[] }>;
  } | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<{
    message: string;
    stats: { created_users: number; created_profiles: number; updated_profiles: number; total_processed: number; program_name: string };
  } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProgram = availablePrograms.find((p) => p.id === selectedProgramId) || availablePrograms[0];

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationResult(null);
    setCommitSuccess(null);
    setGeneralError(null);
    setValidating(true);

    try {
      // Execute dry-run validation
      const res = await institutionApi.bulkImportStudents(
        institutionId,
        {
          file: selectedFile,
          program_id: selectedProgramId,
          dry_run: true,
          default_password_scheme: passwordScheme,
        },
        authToken || undefined
      );

      setValidationResult(res);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to validate student roster file.');
    } finally {
      setValidating(false);
    }
  };

  const handleCommitUpload = async () => {
    if (!file && !validationResult?.valid_rows?.length) return;
    setCommitting(true);
    setGeneralError(null);

    try {
      const res = await institutionApi.bulkImportStudents(
        institutionId,
        {
          file: file || undefined,
          rows: !file ? validationResult?.valid_rows : undefined,
          program_id: selectedProgramId,
          dry_run: false,
          default_password_scheme: passwordScheme,
        },
        authToken || undefined
      );

      if (res.success && res.stats) {
        setCommitSuccess({
          message: res.message || 'Students ingested successfully',
          stats: res.stats as any,
        });
        onSuccess();
      } else {
        setGeneralError(res.message || 'Bulk import could not be completed.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to commit student cohort upload.');
    } finally {
      setCommitting(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setValidationResult(null);
    setCommitSuccess(null);
    setGeneralError(null);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !committing && onClose()}
      maxWidth="md"
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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <SchoolIcon />
          </span>
          <div>
            <h3 className="text-lg font-bold text-charcoal">
              Bulk Student Cohort Onboarding
            </h3>
            <p className="text-xs text-charcoal-faint">
              Generate program-specific Excel templates, distribute to departments, and batch-ingest students.
            </p>
          </div>
        </div>
        <IconButton onClick={onClose} disabled={committing} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {commitSuccess ? (
          <div className="my-4 rounded-[16px] bg-primary-soft/40 p-6 text-center border border-primary/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-md">
              <CheckCircleIcon sx={{ fontSize: 32 }} />
            </div>
            <h4 className="mt-4 text-lg font-bold text-charcoal">
              Student Cohort Ingestion Successful!
            </h4>
            <p className="mt-1 text-sm text-charcoal-faint">
              {commitSuccess.message}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[12px] bg-white p-3 shadow-xs">
                <p className="text-xs font-semibold text-charcoal-faint">Total Processed</p>
                <p className="text-lg font-extrabold text-primary">{commitSuccess.stats.total_processed}</p>
              </div>
              <div className="rounded-[12px] bg-white p-3 shadow-xs">
                <p className="text-xs font-semibold text-charcoal-faint">New User Accounts</p>
                <p className="text-lg font-extrabold text-charcoal">{commitSuccess.stats.created_users}</p>
              </div>
              <div className="rounded-[12px] bg-white p-3 shadow-xs">
                <p className="text-xs font-semibold text-charcoal-faint">Student Profiles</p>
                <p className="text-lg font-extrabold text-charcoal">{commitSuccess.stats.created_profiles}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outlined"
                color="inherit"
                onClick={resetUpload}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Upload Another Cohort
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onClose}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                View Updated Student Roster
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Step 1: Select Target Academic Programme */}
            <div className="rounded-[15px] bg-bgsoft p-4 border border-line">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Step 1: Select Degree Programme
                </p>
                {currentProgram && (
                  <Chip
                    size="small"
                    label={`${currentProgram.durationYears} Years Duration`}
                    sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700, fontSize: 11 }}
                  />
                )}
              </div>

              <TextField
                select
                fullWidth
                size="small"
                label="Target Academic Programme"
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  setValidationResult(null);
                  setFile(null);
                }}
                disabled={validating || committing}
                sx={{ bgcolor: '#fff', borderRadius: '8px' }}
              >
                {availablePrograms.map((prog) => (
                  <MenuItem key={prog.id} value={prog.id}>
                    <div className="py-0.5">
                      <span className="font-bold text-charcoal text-sm">{prog.name}</span>
                      <span className="text-xs text-charcoal-faint block">
                        {prog.divisionName} → {prog.departmentName} ({prog.code || 'No Code'})
                      </span>
                    </div>
                  </MenuItem>
                ))}
              </TextField>

              {currentProgram && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-charcoal-faint">
                  <span className="font-semibold text-charcoal">
                    {currentProgram.awardLevelDisplay}
                  </span>
                  <span>•</span>
                  <span>{currentProgram.departmentName}</span>
                  <span>•</span>
                  <span>{currentProgram.siwesMonths > 0 ? `${currentProgram.siwesMonths} Mo SIWES` : 'Exempt'}</span>
                </div>
              )}
            </div>

            {/* Step 2: Download Program-Specific Template */}
            <div className="rounded-[15px] bg-bgsoft p-4 border border-line">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                Step 2: Download Program-Locked Template
              </p>
              <p className="text-xs text-charcoal-faint mb-3">
                Download the master spreadsheet for <strong>{currentProgram?.name}</strong>. Send it to the department officer to populate with students.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  component="a"
                  href={institutionApi.getDownloadStudentTemplateUrl(institutionId, selectedProgramId, 'excel')}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<DownloadIcon />}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  Download Master Excel (.xlsx)
                </Button>
                <Button
                  component="a"
                  href={institutionApi.getDownloadStudentTemplateUrl(institutionId, selectedProgramId, 'csv')}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<DownloadIcon />}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                >
                  Download CSV (.csv)
                </Button>
              </div>
            </div>

            {/* Step 3: Upload & Validate File */}
            <div className="rounded-[15px] bg-bgsoft p-4 border border-line">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                Step 3: Upload Completed Spreadsheet
              </p>

              <label className="flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-line bg-white p-6 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  disabled={validating || committing}
                  className="hidden"
                />
                <CloudUploadIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                <span className="text-sm font-bold text-charcoal">
                  {file ? file.name : 'Click to select or drag & drop completed Excel / CSV file'}
                </span>
                <span className="text-xs text-charcoal-faint mt-0.5">
                  Accepts .xlsx, .xls, or .csv spreadsheets
                </span>
              </label>

              {/* Password Scheme */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-charcoal">
                  Default Initial Password:
                </span>
                <TextField
                  select
                  size="small"
                  value={passwordScheme}
                  onChange={(e) => setPasswordScheme(e.target.value as any)}
                  sx={{ minWidth: 230, bgcolor: '#fff' }}
                >
                  <MenuItem value="matric">Student Matric Number (e.g. 2023/swe/001)</MenuItem>
                  <MenuItem value="pin">Uniform PIN (Nexus1234!@#)</MenuItem>
                </TextField>
              </div>
            </div>

            {/* Validation Feedback & Warnings */}
            {validating && (
              <div className="flex items-center justify-center gap-3 p-4">
                <CircularProgress size={20} color="primary" />
                <span className="text-sm font-semibold text-charcoal">
                  Validating student records and resolving program constraints…
                </span>
              </div>
            )}

            {generalError && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {generalError}
              </Alert>
            )}

            {validationResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-[12px] bg-white p-3 border border-line shadow-xs">
                  <div className="flex items-center gap-2">
                    {validationResult.can_commit ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-charcoal">
                        {validationResult.stats?.valid_count} Valid Student Records Found
                      </p>
                      <p className="text-xs text-charcoal-faint">
                        Programme: {validationResult.program?.name} ({validationResult.program?.code || 'N/A'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {validationResult.stats && validationResult.stats.error_count > 0 && (
                      <Chip
                        size="small"
                        label={`${validationResult.stats.error_count} Issues Detected`}
                        color="error"
                        sx={{ fontWeight: 700, fontSize: 11 }}
                      />
                    )}
                  </div>
                </div>

                {/* Error Rows Table if any */}
                {validationResult.errors && validationResult.errors.length > 0 && (
                  <div className="max-h-48 overflow-y-auto rounded-[12px] bg-red-50/50 p-3 border border-red-200">
                    <p className="text-xs font-bold text-error mb-2">
                      Validation Issues ({validationResult.errors.length} rows require correction):
                    </p>
                    <div className="space-y-1 text-xs text-charcoal">
                      {validationResult.errors.map((err, idx) => (
                        <div key={idx} className="rounded bg-white p-2 border border-red-100 flex items-start gap-2">
                          <span className="font-bold text-error">Row {err.row_number}:</span>
                          <span className="font-semibold text-charcoal">{err.matric_number} ({err.name})</span>
                          <span className="text-charcoal-faint">— {err.reasons.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>

      {!commitSuccess && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            disabled={committing}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCommitUpload}
            variant="contained"
            color="primary"
            disabled={
              !validationResult ||
              !validationResult.valid_rows ||
              validationResult.valid_rows.length === 0 ||
              committing ||
              validating
            }
            startIcon={committing ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
          >
            {committing
              ? 'Ingesting Cohort…'
              : `Commit Ingestion (${validationResult?.valid_rows?.length || 0} Students)`}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
