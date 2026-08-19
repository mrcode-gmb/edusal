import { useState, useEffect, type FC, type FormEvent } from 'react';
import type { StudentDossier, ActionItem } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Psychology as BrainIcon,
  Explore as CompassIcon,
  Description as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutlined as AlertCircleIcon,
  OpenInNew as ExternalLinkIcon,
  Add as PlusIcon,
  School as SchoolIcon,
  AutoAwesome as SparklesIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Lock as LockIcon,
  Send as SendIcon,
  WorkspacePremium as AwardIcon,
} from '@mui/icons-material';

interface CounsellorDossierModalProps {
  studentId: string;
  authToken?: string;
  onClose: () => void;
}

export const CounsellorDossierModal: FC<CounsellorDossierModalProps> = ({
  studentId,
  authToken,
  onClose,
}) => {
  const [dossier, setDossier] = useState<StudentDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Case Note Form State
  const [newNoteSummary, setNewNoteSummary] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  useEffect(() => {
    const loadDossier = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await institutionApi.getStudentDossier(studentId, authToken);
        setDossier(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch student dossier');
      } finally {
        setLoading(false);
      }
    };
    loadDossier();
  }, [studentId, authToken]);

  const handleAddActionItem = () => {
    if (!newTaskText.trim()) return;
    setActionItems((prev) => [...prev, { task: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const handleRemoveActionItem = (idx: number) => {
    setActionItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveCaseNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteSummary.trim() || !dossier) return;

    setSavingNote(true);
    setError(null);
    try {
      const created = await institutionApi.createCaseNote(
        {
          student: dossier.profile.id,
          summary: newNoteSummary.trim(),
          action_items: actionItems,
          is_confidential: true,
        },
        authToken
      );
      setDossier((prev) => (prev ? { ...prev, case_notes: [created, ...prev.case_notes] } : prev));
      setNewNoteSummary('');
      setActionItems([]);
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save case note');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <BrainIcon />
          </span>
          <div>
            <h3 className="text-lg font-bold text-charcoal">
              360° Student Comprehensive Dossier
            </h3>
            <p className="text-xs text-charcoal-faint">
              Holistic academic standing, psychometric profile, AI coaching notes, and counsellor interventions.
            </p>
          </div>
        </div>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CircularProgress size={36} color="primary" />
            <p className="mt-4 text-sm font-semibold text-charcoal">
              Assembling unified 360° student dossier & psychometric history…
            </p>
          </div>
        ) : error || !dossier ? (
          <div className="rounded-[16px] bg-red-50 p-6 text-center border border-red-200">
            <AlertCircleIcon sx={{ fontSize: 36, color: '#dc2626', mb: 1 }} />
            <p className="text-sm font-bold text-red-800">
              {error || 'Could not retrieve student dossier data.'}
            </p>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{ mt: 2, borderRadius: '8px', textTransform: 'none' }}
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Student Identity Header Banner */}
            <div className="rounded-[18px] bg-gradient-to-r from-bgsoft to-white p-5 border border-line shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-xl font-extrabold shadow-sm">
                    {dossier.profile.user_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <Chip
                        size="small"
                        label={dossier.profile.matric_number}
                        sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700, fontSize: 11 }}
                      />
                      <Chip
                        size="small"
                        label={dossier.profile.level_display || `${dossier.profile.year_of_study * 100}L`}
                        sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: 11 }}
                      />
                      <Chip
                        size="small"
                        label={dossier.profile.entry_mode_display || dossier.profile.entry_mode || 'UTME'}
                        sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: 11 }}
                      />
                      {dossier.profile.siwes_clearance_status === 'CLEARED' && (
                        <Chip
                          size="small"
                          label="SIWES Cleared"
                          color="success"
                          sx={{ fontWeight: 700, fontSize: 11 }}
                        />
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-charcoal">
                      {dossier.profile.user_name}
                    </h2>
                    <p className="text-xs text-charcoal-faint mt-0.5">
                      {dossier.profile.program_name} · {dossier.profile.department_name} ({dossier.profile.division_name})
                    </p>
                    <p className="text-xs text-charcoal-faint">
                      Email: <span className="font-mono text-charcoal">{dossier.profile.user_email}</span>
                      {dossier.profile.phone_number && (
                        <> · Phone: <span className="text-charcoal">{dossier.profile.phone_number}</span></>
                      )}
                    </p>
                  </div>
                </div>

                {/* Score & Standing Pill */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-line">
                  <div className="text-left md:text-right">
                    <span className="text-xs font-semibold text-charcoal-faint block">
                      Accredited Employability
                    </span>
                    <span className="text-2xl font-black text-primary">
                      {Number(dossier.employability_summary.employability_score || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-charcoal">
                      CGPA: {dossier.profile.cgpa !== null && dossier.profile.cgpa !== undefined ? Number(dossier.profile.cgpa).toFixed(2) : '—'}
                    </span>
                    <span>•</span>
                    <span className="text-xs font-semibold text-primary">
                      {dossier.profile.academic_standing_display || 'In Good Standing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Psychometrics & Pathway Progress */}
              <div className="lg:col-span-7 space-y-6">
                {/* Psychometric Profile Card */}
                <div className="rounded-[16px] bg-white p-5 border border-line shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <BrainIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <h4 className="text-sm font-bold text-charcoal uppercase tracking-wider">
                      Psychometric & Diagnostic Profile
                    </h4>
                  </div>

                  {dossier.assessments.length === 0 ? (
                    <div className="rounded-[12px] bg-bgsoft p-4 text-center text-xs text-charcoal-faint">
                      No standardized psychometric diagnostics completed yet by this student.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dossier.assessments.map((a) => (
                        <div key={a.id} className="rounded-[12px] bg-bgsoft p-4 border border-line">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-charcoal">
                              {a.assessment_title}
                            </span>
                            {a.summary_code && (
                              <Chip
                                size="small"
                                label={`Holland Code: ${a.summary_code}`}
                                sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700, fontSize: 11 }}
                              />
                            )}
                          </div>

                          {a.dimension_scores && (
                            <div className="space-y-2 mt-3">
                              {Object.entries(a.dimension_scores).map(([k, v]) => {
                                const numVal = Number(v) || 0;
                                return (
                                  <div key={k} className="text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-semibold text-charcoal capitalize">
                                        {k.replace(/_/g, ' ')}
                                      </span>
                                      <span className="font-bold text-primary">{numVal}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-primary transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, numVal))}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Career Pathway & Milestones Card */}
                <div className="rounded-[16px] bg-white p-5 border border-line shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <CompassIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <h4 className="text-sm font-bold text-charcoal uppercase tracking-wider">
                      Active Career Pathway & Milestones
                    </h4>
                  </div>

                  {dossier.active_pathway ? (
                    <div>
                      <div className="rounded-[12px] bg-primary-soft/40 p-4 border border-primary/20 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-extrabold text-sm text-charcoal">
                              {dossier.active_pathway.title}
                            </p>
                            <p className="text-xs text-charcoal-faint">
                              Role: {dossier.active_pathway.career_role}
                            </p>
                          </div>
                          <Chip
                            size="small"
                            label={`${dossier.profile.milestones_completed_count || dossier.employability_summary?.milestones_completed || 0} Completed`}
                            color="primary"
                            sx={{ fontWeight: 700, fontSize: 11 }}
                          />
                        </div>
                      </div>

                      {/* Submissions list */}
                      {dossier.submissions.length === 0 ? (
                        <p className="text-xs text-charcoal-faint">
                          Student has not submitted artifacts for milestone verification yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {dossier.submissions.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between rounded-[10px] bg-bgsoft p-3 text-xs border border-line"
                            >
                              <div className="flex items-center gap-2">
                                <AssignmentIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                <div>
                                  <span className="font-bold text-charcoal block">
                                    {sub.milestone_title || 'Milestone Task'}
                                  </span>
                                  <span className="text-charcoal-faint">
                                    Status: {sub.status_display || sub.status}
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold text-primary">
                                +{sub.points_awarded || 0} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-[12px] bg-bgsoft p-4 text-center text-xs text-charcoal-faint">
                      No career pathway currently activated for this student.
                    </div>
                  )}
                </div>

                {/* AI Coach Summary Card */}
                {dossier.ai_coach_summary && (
                  <div className="rounded-[16px] bg-white p-5 border border-line shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <SparklesIcon sx={{ color: '#d97706', fontSize: 20 }} />
                      <h4 className="text-sm font-bold text-charcoal uppercase tracking-wider">
                        AI Coach Synthesis & Guidance
                      </h4>
                    </div>
                    <div className="rounded-[12px] bg-amber-50/60 p-4 text-xs text-charcoal border border-amber-200/60 leading-relaxed whitespace-pre-wrap">
                      {dossier.ai_coach_summary}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (5 cols): Counsellor Case Notes & Interventions */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-[16px] bg-white p-5 border border-line shadow-xs flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileTextIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <h4 className="text-sm font-bold text-charcoal uppercase tracking-wider">
                        Case Notes & Guidance
                      </h4>
                    </div>
                    <Tooltip title="Case notes are restricted to verified counsellors, evaluators, and HODs.">
                      <LockIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    </Tooltip>
                  </div>

                  {/* Add Case Note Form */}
                  <form onSubmit={handleSaveCaseNote} className="mb-4 rounded-[12px] bg-bgsoft p-3.5 border border-line space-y-3">
                    <p className="text-xs font-bold text-charcoal">
                      Record New Counselling Case Note
                    </p>

                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      size="small"
                      placeholder="Enter session summary, observations, or intervention plan..."
                      value={newNoteSummary}
                      onChange={(e) => setNewNoteSummary(e.target.value)}
                      disabled={savingNote}
                      sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                    />

                    {/* Action items */}
                    <div>
                      <p className="text-xs font-semibold text-charcoal-faint mb-1.5">
                        Follow-Up Action Items:
                      </p>
                      <div className="flex gap-2">
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="e.g. Schedule SIWES readiness interview"
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddActionItem();
                            }
                          }}
                          disabled={savingNote}
                          sx={{ bgcolor: '#fff' }}
                        />
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={handleAddActionItem}
                          disabled={savingNote || !newTaskText.trim()}
                          sx={{ minWidth: 40, borderRadius: '8px' }}
                        >
                          <PlusIcon fontSize="small" />
                        </Button>
                      </div>

                      {actionItems.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {actionItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded bg-white px-2 py-1 text-xs border border-line"
                            >
                              <span className="truncate">{item.task}</span>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveActionItem(idx)}
                              >
                                <CloseIcon sx={{ fontSize: 12 }} />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {noteSuccess ? (
                        <span className="text-xs font-bold text-green-700">
                          ✓ Note recorded successfully!
                        </span>
                      ) : <span />}
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="small"
                        disabled={savingNote || !newNoteSummary.trim()}
                        startIcon={savingNote ? <CircularProgress size={12} color="inherit" /> : <SendIcon sx={{ fontSize: 14 }} />}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                      >
                        {savingNote ? 'Saving…' : 'Save Case Note'}
                      </Button>
                    </div>
                  </form>

                  {/* Case Notes History */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {dossier.case_notes.length === 0 ? (
                      <p className="text-xs text-charcoal-faint text-center py-4">
                        No previous case notes recorded for this student.
                      </p>
                    ) : (
                      dossier.case_notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-[12px] bg-white p-3.5 border border-line shadow-xs space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-charcoal">
                              {note.author_name || 'Counsellor'}
                            </span>
                            <span className="text-charcoal-faint text-[11px]">
                              {note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="text-charcoal leading-relaxed whitespace-pre-wrap">
                            {note.summary}
                          </p>

                          {note.action_items && note.action_items.length > 0 && (
                            <div className="pt-2 border-t border-line/60 space-y-1">
                              <span className="font-semibold text-charcoal-faint text-[11px]">
                                Action Items:
                              </span>
                              {note.action_items.map((act: any, i: number) => (
                                <div key={i} className="flex items-center gap-1.5 text-charcoal">
                                  <CheckCircleIcon sx={{ fontSize: 13, color: act.done ? 'primary.main' : '#cbd5e1' }} />
                                  <span className={act.done ? 'line-through text-charcoal-faint' : ''}>
                                    {act.task || act}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
