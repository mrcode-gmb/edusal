import type { FC } from 'react';
import type { StudentAssessmentSession } from '../../types/institution';
import { Panel, Meter, Badge } from '../institution/Shared';
import {
  Psychology as BrainIcon,
  Explore as CompassIcon,
  AutoGraph as BarChartIcon,
  WorkspacePremium as SparklesIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface AssessmentRadarCardProps {
  session: StudentAssessmentSession;
}

export const AssessmentRadarCard: FC<AssessmentRadarCardProps> = ({ session }) => {
  const isBigFive = session.assessment_type === 'BIG_FIVE';
  const isHolland = session.assessment_type === 'HOLLAND_RIASEC';

  const TypeIcon = isBigFive ? BrainIcon : isHolland ? CompassIcon : BarChartIcon;
  const codePrefix = isHolland ? 'Holland Code' : isBigFive ? 'Profile' : 'Accuracy';

  return (
    <Panel className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
            <TypeIcon sx={{ fontSize: 22, color: 'primary.main' }} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              {session.assessment_type_display}
            </p>
            <h4 className="text-base font-bold text-charcoal">{session.assessment_title}</h4>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {session.summary_code && <Badge>{codePrefix}: {session.summary_code}</Badge>}
          {session.percentile_rank !== null && (
            <Badge color="#fff" bg="var(--color-primary)">
              <SparklesIcon sx={{ fontSize: 12, mr: 0.5 }} /> {session.percentile_rank}% Percentile
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(session.dimension_scores).map(([trait, score]) => {
          const numScore = typeof score === 'number' ? score : Number(score) || 0;
          return (
            <Meter
              key={trait}
              value={Math.min(100, Math.max(0, numScore))}
              label={trait.replace(/_/g, ' ')}
            />
          );
        })}
      </div>

      {session.summary_report && (
        <div className="rounded-[15px] bg-bgsoft p-4">
          {session.summary_report.split('\n\n').map((para, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-charcoal-soft">
              {para}
            </p>
          ))}
        </div>
      )}

      {session.career_recommendations && session.career_recommendations.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-charcoal">Top Matched Pathways</p>
          <div className="flex flex-wrap gap-1.5">
            {session.career_recommendations.map((rec, idx) => (
              <Badge key={idx} color="var(--color-primary)" bg="var(--color-primary-soft)">
                <CheckCircleIcon sx={{ fontSize: 12, mr: 0.5 }} /> {rec}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
};