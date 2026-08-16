import { type FC } from 'react';
import type { EmployabilitySummary, StudentProfile } from '../../types/institution';
import { Panel, PanelHead, Ring, Meter, Badge } from '../institution/Shared';
import {
  WorkspacePremium as SparklesIcon,
  Verified as VerifiedIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  RocketLaunch as RocketLaunchIcon,
  AutoGraph as AutoGraphIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';

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

const TierScale = [
  { label: 'Foundation', range: '0 – 34', color: '#cbd5e1', desc: 'Early stage of the employability journey' },
  { label: 'Developing', range: '35 – 54', color: '#fbbf24', desc: 'Building the verified technical record' },
  { label: 'Industry Ready', range: '55 – 74', color: '#34d399', desc: 'Solid technical record, ready for industry' },
  { label: 'High-Calibre Talent', range: '75 – 100', color: '#10b981', desc: 'Top index — strong verified record & academics' },
];

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
  const clamped = Math.min(Math.max(Math.round(score), 0), 100);

  return (
    <div className="space-y-5">
      {/* Hero score panel */}
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
              <VerifiedIcon sx={{ fontSize: 14 }} />
              {summary.tier}
            </span>
          }
        />

        <div className="grid gap-5 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-[15px] bg-bgsoft p-6">
            <Ring value={clamped} label="Overall Index" size={160} />
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

      {/* Breakdown stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-4 rounded-[15px] bg-white p-5 shadow-card">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
            <TaskAltIcon sx={{ fontSize: 22, color: 'primary.main' }} />
          </span>
          <div className="min-w-0">
            <p className="text-2xl leading-none font-extrabold text-charcoal">
              {milestonesCompleted}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-charcoal">Milestones Verified</p>
            <p className="mt-0.5 text-xs text-charcoal-faint">Technical deliverables accredited</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-[15px] bg-white p-5 shadow-card">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
            <EmojiEventsIcon sx={{ fontSize: 22, color: 'primary.main' }} />
          </span>
          <div className="min-w-0">
            <p className="text-2xl leading-none font-extrabold text-charcoal">
              {Number(profile.verified_points_total || verifiedPoints)}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-charcoal">Accredited Points</p>
            <p className="mt-0.5 text-xs text-charcoal-faint">Milestone points earned</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-[15px] bg-white p-5 shadow-card">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
            <RocketLaunchIcon sx={{ fontSize: 22, color: 'primary.main' }} />
          </span>
          <div className="min-w-0">
            <p className="text-2xl leading-none font-extrabold text-charcoal">{targetPoints}</p>
            <p className="mt-1.5 text-sm font-semibold text-charcoal">Target Points</p>
            <p className="mt-0.5 text-xs text-charcoal-faint">Required across the roadmap</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-[15px] bg-white p-5 shadow-card">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
            <SchoolIcon sx={{ fontSize: 22, color: 'primary.main' }} />
          </span>
          <div className="min-w-0">
            <p className="text-2xl leading-none font-extrabold text-charcoal">
              {profile.cgpa ? Number(profile.cgpa).toFixed(2) : 'N/A'}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-charcoal">Cumulative GPA</p>
            <p className="mt-0.5 text-xs text-charcoal-faint">
              {profile.academic_standing_display || 'In Good Standing'}
            </p>
          </div>
        </div>
      </div>

      {/* Tier scale */}
      <Panel>
        <PanelHead
          title={
            <span className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
                <AutoGraphIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              </span>
              Employability Tier Scale
            </span>
          }
          sub="Where your current index sits on the national accreditation scale"
          action={<Badge color={tierColors.text} bg={tierColors.bg}>{summary.tier}</Badge>}
        />

        <div className="relative">
          <div className="flex h-3 overflow-hidden rounded-full">
            {TierScale.map((t) => (
              <div key={t.label} className="flex-1" style={{ backgroundColor: t.color }} />
            ))}
          </div>
          <div
            className="absolute -top-1.5 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-charcoal text-white shadow-md"
            style={{ left: `calc(${clamped}% - ${clamped * 0.5}%)` }}
          >
            <span className="h-2 w-2 rounded-full bg-white" />
          </div>
          <div className="mt-2 flex">
            {TierScale.map((t, i) => (
              <div
                key={t.label}
                className={`${i === 0 ? '' : 'text-center'} flex-1 pr-1 ${i === TierScale.length - 1 ? 'text-right' : ''}`}
              >
                <p className="text-xs font-bold text-charcoal">{t.label}</p>
                <p className="text-[11px] text-charcoal-faint">{t.range}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[15px] bg-bgsoft p-4">
          <p className="text-sm font-semibold text-charcoal">What this means for you</p>
          <p className="mt-1 text-sm text-charcoal-soft">
            {(TierScale.find((t) => clamped >= Number(t.range.split('–')[0])) || TierScale[0]).desc}
          </p>
        </div>
      </Panel>
    </div>
  );
};