import { useState, type FC } from 'react';
import type { Pathway, PathwayMilestone } from '../../types/institution';
import { AddMilestoneModal } from './AddMilestoneModal';
import { institutionApi } from '../../services/institutionApi';
import { Button, Chip, IconButton } from '@mui/material';
import {
  Add as AddIcon,
  Verified as VerifiedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Panel } from './Shared';

interface MilestoneTimelineProps {
  pathway: Pathway;
  authToken?: string | null;
  onRefresh: () => Promise<void>;
}

export const MilestoneTimeline: FC<MilestoneTimelineProps> = ({
  pathway,
  authToken,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<PathwayMilestone | null>(null);

  const durationYears = pathway.duration_years || 4;
  const milestones = pathway.milestones || [];

  // Group milestones by academic year (1..durationYears)
  const milestonesByYear: Record<number, PathwayMilestone[]> = {};
  for (let yr = 1; yr <= durationYears; yr++) {
    milestonesByYear[yr] = [];
  }

  milestones.forEach((m) => {
    const yr = m.year_of_study || 1;
    if (!milestonesByYear[yr]) milestonesByYear[yr] = [];
    milestonesByYear[yr].push(m);
  });

  const handleDeleteMilestone = async (milestoneId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete milestone "${title}"?`)) return;
    try {
      await institutionApi.deleteMilestone(milestoneId, authToken || undefined);
      await onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete milestone');
    }
  };

  const getLevelName = (year: number) => {
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
    <div>
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Chip
                label={pathway.program_name}
                size="small"
                sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
              />
              <Chip
                label={`${pathway.duration_years} Year Duration`}
                size="small"
                variant="outlined"
                sx={{ color: 'charcoal.soft', borderColor: 'border.strong', fontWeight: 700 }}
              />
              {pathway.is_template && (
                <Chip
                  label="Master Blueprint"
                  size="small"
                  sx={{ bgcolor: 'charcoal', color: '#fff', fontWeight: 700 }}
                />
              )}
            </div>
            <h3 className="mt-2 text-lg font-bold text-charcoal">{pathway.title}</h3>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              Target Role: <strong className="text-charcoal">{pathway.career_role}</strong> ·
              Industry:{' '}
              <strong className="text-charcoal">{pathway.industry_sector || 'General Tech'}</strong>
            </p>
            <p className="mt-1.5 max-w-2xl text-sm text-charcoal-faint">{pathway.description}</p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="rounded-[15px] bg-bgsoft px-5 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                Total Points
              </p>
              <p className="text-2xl font-extrabold text-primary">{pathway.total_points}</p>
              <p className="text-xs text-charcoal-faint">
                {milestones.length} Verifiable Milestones
              </p>
            </div>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingMilestone(null);
                setShowAddModal(true);
              }}
            >
              Add Verifiable Milestone
            </Button>
          </div>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: durationYears }, (_, i) => i + 1).map((year) => {
          const yearMilestones = milestonesByYear[year] || [];
          const yearPoints = yearMilestones.reduce((acc, m) => acc + m.points, 0);

          return (
            <Panel key={year}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
                  {year}
                </span>
                <div>
                  <h4 className="text-base font-bold text-charcoal">{getLevelName(year)}</h4>
                  <p className="text-xs text-charcoal-faint">
                    {yearMilestones.length} Milestone(s) · {yearPoints} Points
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {yearMilestones.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-[15px] bg-bgsoft px-4 py-6 text-center">
                    <p className="text-sm text-charcoal-faint">
                      No milestones assigned for {getLevelName(year)} yet.
                    </p>
                    <button
                      type="button"
                      className="text-sm font-bold text-primary hover:underline"
                      onClick={() => {
                        setEditingMilestone(null);
                        setShowAddModal(true);
                      }}
                    >
                      + Add Milestone for Year {year}
                    </button>
                  </div>
                ) : (
                  yearMilestones.map((m) => (
                    <div key={m.id} className="rounded-[15px] bg-bgsoft p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip
                            label={`Step #${m.order_index + 1}`}
                            size="small"
                            sx={{ bgcolor: 'primary', color: '#fff', fontWeight: 700 }}
                          />
                          <Chip
                            label={m.milestone_type_display || m.milestone_type}
                            size="small"
                            sx={{ bgcolor: 'white', color: 'charcoal.soft', fontWeight: 700 }}
                          />
                          <Chip
                            label={`Semester: ${m.target_semester}`}
                            size="small"
                            variant="outlined"
                            sx={{ color: 'charcoal.faint', borderColor: 'border.strong' }}
                          />
                        </div>
                        <span className="text-sm font-extrabold text-primary">+{m.points} pts</span>
                      </div>

                      <h5 className="mt-3 text-sm font-bold text-charcoal">{m.title}</h5>
                      <p className="mt-1 text-sm text-charcoal-faint">{m.description}</p>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs">
                        <span className="text-charcoal-faint">
                          <strong className="text-charcoal">Required Evidence:</strong>{' '}
                          {m.required_evidence_type_display || m.required_evidence_type}
                        </span>
                        <span className="text-charcoal-faint">
                          <strong className="text-charcoal">Verification:</strong>{' '}
                          {m.verification_method_display || m.verification_method}
                        </span>
                      </div>

                      {m.competency_tags && m.competency_tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.competency_tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-charcoal"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                          <VerifiedIcon sx={{ fontSize: 14 }} /> Ready for Evidence
                        </span>
                        <div className="flex gap-1">
                          <IconButton
                            size="small"
                            title="Edit milestone"
                            onClick={() => {
                              setEditingMilestone(m);
                              setShowAddModal(true);
                            }}
                          >
                            <EditIcon fontSize="small" sx={{ color: 'charcoal.soft' }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            title="Delete milestone"
                            onClick={() => handleDeleteMilestone(m.id, m.title)}
                          >
                            <DeleteIcon fontSize="small" sx={{ color: '#b91c1c' }} />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      {showAddModal && (
        <AddMilestoneModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingMilestone(null);
          }}
          pathwayId={pathway.id}
          durationYears={durationYears}
          existingMilestone={editingMilestone}
          authToken={authToken}
          onSuccess={onRefresh}
          saveFn={
            editingMilestone
              ? (payload, token) => institutionApi.updateMilestone(editingMilestone.id, payload, token)
              : (payload, token) => institutionApi.createMilestone(payload, token)
          }
        />
      )}
    </div>
  );
};