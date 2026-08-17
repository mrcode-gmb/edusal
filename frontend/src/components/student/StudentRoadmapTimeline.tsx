import { useState, type FC } from 'react';
import type { Pathway, PathwayMilestone, StudentMilestoneSubmission } from '../../types/institution';
import { SubmitEvidenceModal } from './SubmitEvidenceModal';
import { Panel, PanelHead, Meter } from '../institution/Shared';
import {
  RocketLaunch as RocketLaunchIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ClockIcon,
  WarningAmber as AlertCircleIcon,
  OpenInNew as ExternalLinkIcon,
  Add as PlusIcon,
  TaskAlt as TaskAltIcon,
  EmojiEvents as EmojiEventsIcon,
  Flag as FlagIcon,
  School as SchoolIcon,
  AutoGraph as AutoGraphIcon,
} from '@mui/icons-material';

interface StudentRoadmapTimelineProps {
  pathway: Pathway;
  submissions: StudentMilestoneSubmission[];
  studentYearOfStudy: number;
  authToken?: string | null;
  onRefresh: () => Promise<void>;
}

const statusBadge = {
  verified: 'bg-[#ecfdf5] text-[#059669]',
  pending: 'bg-amber-50 text-amber-700',
  changes: 'bg-rose-50 text-rose-700',
  notStarted: 'bg-bgsoft text-charcoal-faint',
};

export const StudentRoadmapTimeline: FC<StudentRoadmapTimelineProps> = ({
  pathway,
  submissions,
  studentYearOfStudy,
  authToken,
  onRefresh,
}) => {
  const [selectedMilestoneForSubmit, setSelectedMilestoneForSubmit] = useState<PathwayMilestone | null>(null);

  const durationYears = pathway.duration_years || 4;
  const milestones = pathway.milestones || [];
  const totalPoints = Number(pathway.total_points || 0) || milestones.reduce((acc, m) => acc + Number(m.points), 0);
  const totalMilestones = Number(pathway.total_milestones_count || 0) || milestones.length;

  const verifiedSubs = submissions.filter((s) => s.status === 'VERIFIED');
  const accreditedPoints = verifiedSubs.reduce((acc, s) => acc + Number(s.points_awarded || 0), 0);
  const progressPct = totalPoints ? Math.min(Math.round((accreditedPoints / totalPoints) * 100), 100) : 0;

  const submissionMap: Record<string, StudentMilestoneSubmission> = {};
  submissions.forEach((s) => {
    submissionMap[s.milestone] = s;
  });

  const milestonesByYear: Record<number, PathwayMilestone[]> = {};
  for (let yr = 1; yr <= durationYears; yr++) {
    milestonesByYear[yr] = [];
  }
  milestones.forEach((m) => {
    const yr = m.year_of_study || 1;
    if (!milestonesByYear[yr]) milestonesByYear[yr] = [];
    milestonesByYear[yr].push(m);
  });

  const getLevelLabel = (year: number) => {
    if (pathway.award_level === 'ND') {
      return year === 1 ? 'ND I' : 'ND II (Final Year)';
    }
    if (pathway.award_level === 'HND') {
      return year === 1 ? 'HND I' : 'HND II (Final Year)';
    }
    if (pathway.award_level === 'NCE') {
      const roman = ['I', 'II', 'III'][year - 1] || `${year}`;
      return `NCE ${roman} ${year === 3 ? '(Final Year)' : ''}`;
    }
    const isFinal = year === durationYears;
    return `${year * 100} Level ${isFinal ? '(Final Year)' : ''}`;
  };

  return (
    <div className="space-y-5">
      {/* Pathway overview */}
      <Panel>
        <PanelHead
          title={
            <span className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
                <RocketLaunchIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              </span>
              {pathway.title}
            </span>
          }
          sub={
            pathway.career_role
              ? `Career role: ${pathway.career_role}${pathway.industry_sector ? ` · Industry: ${pathway.industry_sector}` : ''}`
              : `Industry: ${pathway.industry_sector || 'General'}`
          }
        />
        {pathway.description && (
          <p className="mt-1 text-sm text-charcoal-soft">{pathway.description}</p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-4 rounded-[15px] bg-bgsoft p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
              <TaskAltIcon sx={{ fontSize: 22, color: 'primary.main' }} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl leading-none font-extrabold text-charcoal">{totalMilestones}</p>
              <p className="mt-1.5 text-sm font-semibold text-charcoal">Milestones</p>
              <p className="mt-0.5 text-xs text-charcoal-faint">Deliverables in the roadmap</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-[15px] bg-bgsoft p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
              <FlagIcon sx={{ fontSize: 22, color: 'primary.main' }} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl leading-none font-extrabold text-charcoal">{totalPoints}</p>
              <p className="mt-1.5 text-sm font-semibold text-charcoal">Total Points</p>
              <p className="mt-0.5 text-xs text-charcoal-faint">Required across all years</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-[15px] bg-bgsoft p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
              <CheckCircleIcon sx={{ fontSize: 22, color: 'primary.main' }} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl leading-none font-extrabold text-charcoal">{verifiedSubs.length}</p>
              <p className="mt-1.5 text-sm font-semibold text-charcoal">Verified</p>
              <p className="mt-0.5 text-xs text-charcoal-faint">Milestones accredited</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-[15px] bg-bgsoft p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
              <EmojiEventsIcon sx={{ fontSize: 22, color: 'primary.main' }} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl leading-none font-extrabold text-charcoal">{accreditedPoints}</p>
              <p className="mt-1.5 text-sm font-semibold text-charcoal">Points Earned</p>
              <p className="mt-0.5 text-xs text-charcoal-faint">Accredited to date</p>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Meter
            value={progressPct}
            label="Roadmap Progress"
            hint={`${accreditedPoints} of ${totalPoints} required points accredited across the roadmap`}
          />
        </div>
        {pathway.target_cgpa_recommendation != null && (
          <div className="mt-4 flex items-center gap-2 rounded-[15px] bg-primary-soft/40 px-4 py-3">
            <SchoolIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <p className="text-sm text-charcoal-soft">
              <strong className="text-charcoal">Recommended CGPA target:</strong>{' '}
              {Number(pathway.target_cgpa_recommendation).toFixed(2)} / 5.00
            </p>
          </div>
        )}
      </Panel>

      {/* Timeline */}
      <Panel>
        <PanelHead
          title={
            <span className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
                <AutoGraphIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              </span>
              Milestone Roadmap Timeline
            </span>
          }
          sub="Deliverables sequenced by academic year — submit evidence as you complete each step"
        />

        <div>
          {Array.from({ length: durationYears }, (_, i) => i + 1).map((year) => {
            const yearMilestones = milestonesByYear[year] || [];
            const yearPoints = yearMilestones.reduce((acc, m) => acc + Number(m.points), 0);
            const isCurrentYear = year === studentYearOfStudy;

            return (
              <div key={year} className="relative pb-10 pl-16 last:pb-0">
                {year < durationYears && (
                  <div className="absolute top-10 bottom-0 left-[20px] w-px bg-line" />
                )}
                <div
                  className={`absolute top-1 left-0 flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-md ${
                    isCurrentYear ? 'bg-primary ring-4 ring-primary-soft' : 'bg-charcoal'
                  }`}
                >
                  {year}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <h5 className="text-sm font-bold text-charcoal">{getLevelLabel(year)}</h5>
                  {isCurrentYear && (
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      Current Year
                    </span>
                  )}
                  <span className="text-xs text-charcoal-faint">
                    {yearMilestones.length} Deliverables · {yearPoints} Total Points
                  </span>
                </div>

                {yearMilestones.length === 0 ? (
                  <div className="rounded-[15px] bg-bgsoft px-4 py-6 text-center text-sm text-charcoal-faint">
                    No milestones defined for this year.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {yearMilestones.map((m) => {
                      const sub = submissionMap[m.id];
                      const isVerified = sub?.status === 'VERIFIED';
                      const isPending = sub?.status === 'PENDING_REVIEW';
                      const isChanges = sub?.status === 'CHANGES_REQUESTED';

                      return (
                        <Panel key={m.id} sx={{ p: '1.25rem' }}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                                Step #{m.order_index + 1}
                              </span>
                              <span className="rounded-full bg-charcoal-soft/10 px-2.5 py-1 text-[11px] font-bold text-charcoal-soft">
                                {m.milestone_type_display || m.milestone_type}
                              </span>
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                Sem: {m.target_semester}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isVerified && (
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge.verified}`}>
                                  <CheckCircleIcon sx={{ fontSize: 12, verticalAlign: '-2px', mr: 0.5 }} />
                                  Verified (+{sub?.points_awarded} pts)
                                </span>
                              )}
                              {isPending && (
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge.pending}`}>
                                  <ClockIcon sx={{ fontSize: 12, verticalAlign: '-2px', mr: 0.5 }} />
                                  In Review
                                </span>
                              )}
                              {isChanges && (
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge.changes}`}>
                                  <AlertCircleIcon sx={{ fontSize: 12, verticalAlign: '-2px', mr: 0.5 }} />
                                  Changes Requested
                                </span>
                              )}
                              {!sub && (
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge.notStarted}`}>
                                  Not Started (+{m.points} pts)
                                </span>
                              )}
                            </div>
                          </div>

                          <h5 className="mt-3 text-[15px] font-bold text-charcoal">{m.title}</h5>
                          <p className="mt-1 text-sm text-charcoal-soft">{m.description}</p>

                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-charcoal-faint">
                            <span>
                              <strong className="text-charcoal">Evidence Needed:</strong>{' '}
                              {m.required_evidence_type_display || m.required_evidence_type}
                            </span>
                            <span>
                              <strong className="text-charcoal">Evaluation Method:</strong>{' '}
                              {m.verification_method_display || m.verification_method}
                            </span>
                          </div>

                          {sub && (
                            <div className="mt-3 rounded-[15px] bg-bgsoft p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-bold text-charcoal">Your Submission:</span>
                                <span className="text-xs text-charcoal-faint">
                                  {new Date(sub.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {sub.evidence_url && (
                                <div className="mt-1.5 flex items-center gap-2 text-xs">
                                  <span className="text-charcoal-faint">Evidence URL:</span>
                                  <a
                                    href={sub.evidence_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 break-all font-semibold text-primary hover:underline"
                                  >
                                    {sub.evidence_url} <ExternalLinkIcon sx={{ fontSize: 12 }} />
                                  </a>
                                </div>
                              )}
                              {sub.submission_notes && (
                                <p className="mt-1.5 text-xs text-charcoal-soft">"{sub.submission_notes}"</p>
                              )}
                              {sub.review_feedback && (
                                <div className="mt-2 rounded-[15px] bg-white p-3">
                                  <strong className="text-xs text-charcoal">
                                    Counsellor Remarks ({sub.reviewed_by_name || 'HOD'}):
                                  </strong>
                                  <p className="mt-0.5 text-xs text-charcoal-soft">{sub.review_feedback}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-4">
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1.5 rounded-[15px] bg-[#ecfdf5] px-3.5 py-2 text-xs font-bold text-[#059669]">
                                <CheckCircleIcon sx={{ fontSize: 14 }} /> Points Accredited
                              </span>
                            ) : (
                              <button
                                type="button"
                                className={`inline-flex items-center gap-2 rounded-[15px] px-4 py-2.5 text-xs font-bold transition-opacity hover:opacity-90 ${
                                  sub ? 'bg-charcoal-soft/10 text-charcoal' : 'bg-primary text-white'
                                }`}
                                onClick={() => setSelectedMilestoneForSubmit(m)}
                              >
                                {sub ? (
                                  'Update Evidence'
                                ) : (
                                  <>
                                    <PlusIcon sx={{ fontSize: 14 }} /> Submit Technical Evidence
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </Panel>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      {selectedMilestoneForSubmit && (
        <SubmitEvidenceModal
          isOpen={!!selectedMilestoneForSubmit}
          onClose={() => setSelectedMilestoneForSubmit(null)}
          milestone={selectedMilestoneForSubmit}
          existingSubmission={submissionMap[selectedMilestoneForSubmit.id] || null}
          authToken={authToken}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};