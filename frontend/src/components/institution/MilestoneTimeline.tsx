import { useState, type FC } from 'react';
import type { Pathway, PathwayMilestone } from '../../types/institution';
import { AddMilestoneModal } from './AddMilestoneModal';
import { institutionApi } from '../../services/institutionApi';
import {
  PlusIcon,
  CheckCircleIcon,
} from '../icons';

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
    <div className="milestone-timeline-container">
      {/* Header Bar */}
      <div className="timeline-header-card">
        <div className="timeline-title-meta">
          <div className="pathway-badge-row">
            <span className="prog-pill">{pathway.program_name}</span>
            <span className="duration-pill">{pathway.duration_years} Year Duration</span>
            {pathway.is_template && <span className="template-pill">Master Blueprint</span>}
          </div>
          <h3>{pathway.title}</h3>
          <p className="pathway-role-desc">
            Target Role: <strong>{pathway.career_role}</strong> · Industry: <strong>{pathway.industry_sector || 'General Tech'}</strong>
          </p>
          <p className="pathway-full-desc">{pathway.description}</p>
        </div>

        <div className="timeline-actions-side">
          <div className="points-summary-card">
            <span className="pts-label">Total Points</span>
            <span className="pts-val">{pathway.total_points}</span>
            <span className="pts-sub">{milestones.length} Verifiable Milestones</span>
          </div>

          <button
            type="button"
            className="btn btn-primary-sm"
            onClick={() => {
              setEditingMilestone(null);
              setShowAddModal(true);
            }}
          >
            <PlusIcon size={14} /> Add Verifiable Milestone
          </button>
        </div>
      </div>

      {/* Progressive Level-by-Level Visual Roadmap */}
      <div className="timeline-levels-grid">
        {Array.from({ length: durationYears }, (_, i) => i + 1).map((year) => {
          const yearMilestones = milestonesByYear[year] || [];
          const yearPoints = yearMilestones.reduce((acc, m) => acc + m.points, 0);

          return (
            <div key={year} className="timeline-level-section">
              <div className="level-section-header">
                <div className="level-title-group">
                  <span className="level-number-badge">{year}</span>
                  <div>
                    <h4>{getLevelName(year)}</h4>
                    <span className="level-sub">
                      {yearMilestones.length} Milestone(s) · {yearPoints} Points
                    </span>
                  </div>
                </div>
              </div>

              <div className="level-milestones-list">
                {yearMilestones.length === 0 ? (
                  <div className="level-empty-card">
                    <p>No milestones assigned for {getLevelName(year)} yet.</p>
                    <button
                      type="button"
                      className="btn-link-sm"
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
                    <div key={m.id} className="milestone-card">
                      <div className="milestone-card-top">
                        <div className="step-and-type">
                          <span className="step-chip">Step #{m.order_index + 1}</span>
                          <span className="type-chip">{m.milestone_type_display || m.milestone_type}</span>
                          <span className="semester-tag">Semester: {m.target_semester}</span>
                        </div>
                        <span className="milestone-points-badge">+{m.points} pts</span>
                      </div>

                      <h5 className="milestone-title">{m.title}</h5>
                      <p className="milestone-desc">{m.description}</p>

                      {/* Evidence & Verification Rules */}
                      <div className="milestone-rules-row">
                        <div className="rule-item">
                          <span className="rule-label">Required Evidence:</span>
                          <span className="rule-val">{m.required_evidence_type_display || m.required_evidence_type}</span>
                        </div>
                        <div className="rule-item">
                          <span className="rule-label">Verification:</span>
                          <span className="rule-val">{m.verification_method_display || m.verification_method}</span>
                        </div>
                      </div>

                      {/* Competency Tags */}
                      {m.competency_tags && m.competency_tags.length > 0 && (
                        <div className="competencies-chips">
                          {m.competency_tags.map((tag, tIdx) => (
                            <span key={tIdx} className="comp-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Controls */}
                      <div className="milestone-card-footer">
                        <div className="verified-status-tag">
                          <CheckCircleIcon size={12} color="#059669" /> Ready for Evidence
                        </div>
                        <div className="card-btn-group">
                          <button
                            type="button"
                            className="btn-action-edit"
                            onClick={() => {
                              setEditingMilestone(m);
                              setShowAddModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => handleDeleteMilestone(m.id, m.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Milestone Modal */}
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
