import type { FC } from 'react';
import type {
  GovernanceSummary,
  InstitutionHierarchyTree,
  InstitutionalDocument,
} from '../../types/institution';
import {
  Button,
  Chip,
  Box,
} from '@mui/material';
import {
  AccountTree as AccountTreeIcon,
  Domain as DomainIcon,
  School as SchoolIcon,
  Memory as MemoryIcon,
  FactCheck as FactCheckIcon,
  Download as DownloadIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { Bar, Doughnut } from './charts';
import { chartColors } from './charts';
import { Panel, PanelHead, StatCard, PageHead, Ring, LoadingBlock } from './Shared';

interface GovernancePulseProps {
  summary: GovernanceSummary | null;
  tree: InstitutionHierarchyTree | null;
  documents: InstitutionalDocument[];
  loading: boolean;
  onGenerateReport: () => void;
}

export const GovernancePulse: FC<GovernancePulseProps> = ({
  summary,
  tree,
  documents,
  loading,
  onGenerateReport,
}) => {
  if (loading) {
    return (
      <LoadingBlock
        label="Loading your governance overview…"
        sub="Crunching your institution's latest health and progress numbers."
      />
    );
  }

  if (!summary) {
    return (
      <Panel>
        <p className="text-sm text-charcoal-faint">No governance data available.</p>
      </Panel>
    );
  }

  const { hierarchy_metrics, knowledge_base, active_session, accreditation_readiness } = summary;

  // Doughnut: grounding by document type (real data)
  const typeCounts = new Map<string, number>();
  documents.forEach((d) => {
    const key = d.doc_type_display || d.doc_type;
    typeCounts.set(key, (typeCounts.get(key) || 0) + d.chunk_count);
  });
  const docLabels = Array.from(typeCounts.keys());
  const docValues = Array.from(typeCounts.values());
  const doughnutData = {
    labels: docLabels.length > 0 ? docLabels : ['No Grounded Sources'],
    datasets: [
      {
        data: docValues.length > 0 ? docValues : [0],
        backgroundColor: [
          chartColors.primary,
          chartColors.green1,
          chartColors.green2,
          chartColors.green3,
        ],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  // Bar: SIWES eligibility by department, grouped by division (real data)
  const barLabels: string[] = [];
  const barEligible: number[] = [];
  const barTotal: number[] = [];
  tree?.divisions.forEach((div) => {
    if (div.departments.length === 0) return;
    const eligible = div.departments.filter((d) => d.siwes_eligible).length;
    barLabels.push(div.name.length > 22 ? `${div.name.slice(0, 22)}…` : div.name);
    barEligible.push(eligible);
    barTotal.push(div.departments.length);
  });
  const barData = {
    labels: barLabels.length > 0 ? barLabels : ['No Departments'],
    datasets: [
      {
        label: 'Departments',
        data: barTotal.length > 0 ? barTotal : [0],
        backgroundColor: chartColors.primary,
        borderRadius: 6,
        barThickness: 34,
      },
      {
        label: 'SIWES Eligible',
        data: barEligible.length > 0 ? barEligible : [0],
        backgroundColor: chartColors.green2,
        borderRadius: 6,
        barThickness: 34,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: chartColors.gray } },
      y: {
        beginAtZero: true,
        grid: { color: chartColors.line },
        ticks: { color: chartColors.gray },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, boxWidth: 8, padding: 16, color: '#4B5563' },
      },
    },
  };

  // Audit readiness computed from real accreditation checks
  const auditReady = Math.round(
    ([
      accreditation_readiness.taxonomy_aligned,
      accreditation_readiness.curriculum_mapped,
      accreditation_readiness.handbook_ingested,
    ].filter(Boolean).length /
      3) *
      100,
  );

  const complianceChecks = [
    {
      title: 'Unified Outcome Taxonomy',
      copy: 'Operational definitions standardized across all faculties',
      ok: accreditation_readiness.taxonomy_aligned,
    },
    {
      title: 'Curriculum Rubric Mapping',
      copy: 'Degree programmes mapped to outcome rubrics',
      ok: accreditation_readiness.curriculum_mapped,
    },
    {
      title: 'Handbook Ingestion in pgvector',
      copy: 'Handbooks and SIWES policies chunked with exact citations',
      ok: accreditation_readiness.handbook_ingested,
    },
    {
      title: 'Zero Unbacked Claims Policy',
      copy: 'Student milestone sign-offs locked to named faculty evaluators',
      ok: true,
    },
  ];

  return (
    <div>
      <PageHead
        eyebrow="Active Institutional Governance"
        title="Senate & Accreditation Health Pulse"
        sub={
          <>
            {summary.institution.name} · Governance Pulse for the active academic
            session.
          </>
        }
        actions={
          <>
            <Chip
              label={`${active_session.label} · ${active_session.semester}`}
              size="medium"
              sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
            />
            <Chip
              label={`Regulatory Scope: ${summary.institution.regulator}`}
              size="medium"
              variant="outlined"
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong', fontWeight: 700 }}
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<DownloadIcon />}
              onClick={onGenerateReport}
            >
              Generate Senate Audit Pack
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={AccountTreeIcon}
          value={hierarchy_metrics.total_divisions}
          label="Academic Divisions"
          sub={`${summary.institution.tier_two_term} Mapped`}
          chip="Mapped"
        />
        <StatCard
          icon={DomainIcon}
          value={hierarchy_metrics.total_departments}
          label="Active Departments"
          sub={`${hierarchy_metrics.siwes_eligible_departments} SIWES Eligible (${hierarchy_metrics.siwes_eligibility_percentage}%)`}
          chip="SIWES Eligible"
        />
        <StatCard
          icon={SchoolIcon}
          value={hierarchy_metrics.total_programs}
          label="Degree Programmes"
          sub="Curriculum Rubrics Configured"
          chip="Rubrics Live"
        />
        <StatCard
          icon={MemoryIcon}
          value={knowledge_base.total_indexed_chunks}
          label="Grounded Vector Chunks"
          sub={knowledge_base.grounding_status}
          chip="Indexed"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHead
            title="SIWES Eligibility by Department"
            sub="All active departments grouped per academic division"
          />
          <Box sx={{ height: 260 }}>
            <Bar data={barData} options={barOptions} />
          </Box>
        </Panel>

        <Panel>
          <PanelHead
            title="Regulatory Compliance Baseline"
            sub={`Standardized against ${accreditation_readiness.regulator} Institutional Guidelines`}
          />
          <div className="flex flex-col items-center gap-4">
            <Ring value={auditReady} label="Audit Ready" />
            <div className="grid w-full grid-cols-2 gap-3">
              {[
                { label: 'Outcome Taxonomy', v: accreditation_readiness.taxonomy_aligned ? 100 : 0 },
                { label: 'Curriculum Mapped', v: accreditation_readiness.curriculum_mapped ? 100 : 0 },
                { label: 'Handbook Ingested', v: accreditation_readiness.handbook_ingested ? 100 : 0 },
                { label: 'Unbacked Claims', v: 0, inv: true },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-[15px] bg-bgsoft px-3 py-3 text-center"
                >
                  <p className="text-lg font-extrabold text-charcoal">
                    {m.inv ? '0' : `${m.v}%`}
                  </p>
                  <p className="text-[11px] font-semibold text-charcoal-faint">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHead
            title="Evidence Grounding by Source"
            sub="Share of grounded vector chunks per document category"
          />
          <Box sx={{ height: 280 }}>
            <Doughnut data={doughnutData} />
          </Box>
        </Panel>

        <Panel>
          <PanelHead
            title="Session & Repository Health"
            sub="Active session scope and grounding status"
          />
          <div className="space-y-4">
            <div className="rounded-[15px] bg-bgsoft px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                Active Session
              </p>
              <p className="mt-0.5 text-sm font-bold text-charcoal">
                {active_session.label} · {active_session.semester}
              </p>
            </div>
            <div className="rounded-[15px] bg-bgsoft px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                Documents Ingested
              </p>
              <p className="mt-0.5 text-sm font-bold text-charcoal">
                {knowledge_base.total_documents}
              </p>
            </div>
            <div className="rounded-[15px] bg-bgsoft px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                Grounding Status
              </p>
              <p className="mt-0.5 text-sm font-bold text-charcoal">
                {knowledge_base.grounding_status}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4">
        <PanelHead
          title="Regulatory Compliance & Verification Baseline"
          sub={`Standardized against ${accreditation_readiness.regulator} Institutional Guidelines`}
          action={
            <Chip
              icon={<FactCheckIcon sx={{ fontSize: 15 }} />}
              label={`${auditReady}% Audit Ready`}
              sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
            />
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {complianceChecks.map((c) => (
            <div
              key={c.title}
              className="rounded-[15px] bg-bgsoft p-5"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-[15px] ${
                  c.ok ? 'bg-primary' : 'bg-charcoal/20'
                }`}
              >
                <VerifiedIcon sx={{ fontSize: 18, color: c.ok ? '#fff' : '#6b7280' }} />
              </span>
              <p className="mt-3 text-sm font-bold text-charcoal">{c.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-charcoal-faint">{c.copy}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};