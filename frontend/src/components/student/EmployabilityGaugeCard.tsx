import { type FC } from 'react';
import type { EmployabilitySummary, StudentProfile } from '../../types/institution';
import { Panel, PanelHead, Ring, Meter } from '../institution/Shared';
import { WorkspacePremium as SparklesIcon } from '@mui/icons-material';

interface EmployabilityGaugeCardProps {
  summary: EmployabilitySummary;
  profile: StudentProfile;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'High-Calibre Talent':
      return { bg: '#ecfdf5', text: '#059669' };
    case 'Industry Ready':
      return { bg: 'var(--color-primary-soft)', text: 'var(--color-primary-strong)' };
    case 'Developing':
      return { bg: '#fef3c7', text: '#b45309' };
    default:
      return { bg: '#f1f5f9', text: '#475569' };
  }
};

export const EmployabilityGaugeCard: FC<EmployabilityGaugeCardProps> = ({ summary, profile }) => {
  const score = Number(summary.employability_score || 0);
  const targetPoints = Number(summary.target_points || 1);
  const verifiedPoints = Number(summary.verified_points || 0);
  const pointsPercent = Math.min(Math.round((verifiedPoints / targetPoints) * 100), 100);
  const cgpaPercent = profile.cgpa
    ? Math.min(Math.round((Number(profile.cgpa) / 5.0) * 100), 100)
    : 0;
  const milestoneComponent = Number(summary.milestone_component || 0);
  const cgpaComponent = Number(summary.cgpa_component || 0);
  const milestonesCompleted = Number(summary.milestones_completed || 0);
  const tierColors = getTierColor(summary.tier);

  return (
    <Panel>
      <PanelHead
        title={
          <span className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
              <SparklesIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </span>
            Accredited Employability Quotient
          </span>
        }
        sub="Composite ranking evaluated from verified technical milestones (70%) and academic CGPA (30%)"
        action={
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{ backgroundColor: tierColors.bg, color: tierColors.text }}
          >
            {summary.tier}
          </span>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-[15px] bg-bgsoft p-6">
          <Ring value={Math.min(Math.round(score), 100)} label="Overall Index" size={150} />
          <p className="mt-3 text-center text-xs text-charcoal-faint">
            Composite employability index score
          </p>
        </div>

        <div className="rounded-[15px] bg-bgsoft p-5">
          <p className="text-sm font-semibold text-charcoal">Milestone Points (70% Weight)</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-charcoal">{verifiedPoints}</span>
            <span className="text-sm font-semibold text-charcoal-faint">/ {targetPoints} pts</span>
            <span className="ml-auto text-sm font-bold text-primary">
              +{milestoneComponent.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4">
            <Meter value={pointsPercent} label="Points Accumulated" />
          </div>
          <p className="mt-2 text-xs text-charcoal-faint">
            {milestonesCompleted} Milestone(s) Verified
          </p>
        </div>

        <div className="rounded-[15px] bg-bgsoft p-5">
          <p className="text-sm font-semibold text-charcoal">Academic CGPA (30% Weight)</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-charcoal">
              {profile.cgpa ? Number(profile.cgpa).toFixed(2) : 'N/A'}
            </span>
            <span className="text-sm font-semibold text-charcoal-faint">/ 5.00 CGPA</span>
            <span className="ml-auto text-sm font-bold text-primary">
              +{cgpaComponent.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4">
            <Meter value={cgpaPercent} label="CGPA Progress" />
          </div>
          <p className="mt-2 text-xs text-charcoal-faint">
            {profile.academic_standing_display || 'In Good Standing'}
          </p>
        </div>
      </div>
    </Panel>
  );
};