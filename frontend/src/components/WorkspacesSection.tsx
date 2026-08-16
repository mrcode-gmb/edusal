import { useState, type FC } from 'react';

export const WorkspacesSection: FC = () => {
  const [activeRole, setActiveRole] = useState<'student' | 'counsellor' | 'admin' | 'employer'>('student');

  const roles = [
    {
      id: 'student' as const,
      role: 'Student',
      tagline: 'Your pathway, evidenced.',
      description:
        'See exactly what’s validated, what’s missing, and what to do next — with a score you can explain in an interview, not just quote.',
      accent: 'blue',
      metrics: [
        { label: 'Verified Milestones', value: '7 / 9', note: '2 pending evaluation' },
        { label: 'Employability Index', value: '87 / 100', note: 'Explainable breakdown' },
        { label: 'Matched Opportunities', value: '4 Placements', note: 'SIWES July cycle' },
      ],
      workspacePreview: {
        title: 'Chidinma Okafor — Software Engineering (300L)',
        subtitle: 'Pathway: Cloud Systems & Backend Engineering',
        items: [
          { title: 'Data Structures & Algorithms Diagnostic', state: 'Validated 94%', signed: 'By Dr. Adebayo (FUTMinna)' },
          { title: 'PostgreSQL Relational DB & Indexing', state: 'Validated 88%', signed: 'By Engr. K. Bello (Assessor)' },
          { title: 'Celery Distributed Queue Architecture', state: 'In Review', signed: 'Awaiting Dept Sign-off' },
        ],
        actionText: 'Request Faculty Sign-off',
      },
    },
    {
      id: 'counsellor' as const,
      role: 'Counsellor',
      tagline: 'A caseload sized to what you can actually do well.',
      description:
        'AI-prepped context on every case, risk flags before a student falls too far behind, and full notes history in one place.',
      accent: 'emerald',
      metrics: [
        { label: 'Active Caseload', value: '64 Students', note: 'School of ICT & Eng.' },
        { label: 'Triage Alerts', value: '3 Action Needed', note: 'Pre-flagged by AI triage' },
        { label: 'Average Resolution', value: '1.4 Days', note: 'From query to meeting' },
      ],
      workspacePreview: {
        title: 'Guidance Desk — Mr. T. Adeyemi (Lead Counsellor)',
        subtitle: 'Automated case briefings & intervention logs',
        items: [
          { title: 'Ibrahim S. (Mechanical Eng. 400L)', state: 'SIWES Deadline Alert', signed: 'Missing 1 core workshop credit' },
          { title: 'Chidinma O. (Software Eng. 300L)', state: 'Employer Prerequisite Query', signed: 'Context briefed & appointment ready' },
          { title: 'Emeka U. (Computer Science 200L)', state: 'Diagnostic Completed', signed: 'Holland: Investigative (Ready for template)' },
        ],
        actionText: 'Open Student Case File',
      },
    },
    {
      id: 'admin' as const,
      role: 'Institution Admin',
      tagline: 'Reports that hold up to a board or a regulator.',
      description:
        "Faculty-level rollups with the underlying evidence one click away — no more defending a number you can't trace.",
      accent: 'indigo',
      metrics: [
        { label: 'Accreditation Status', value: 'NUC / NBTE Ready', note: 'Full evidence ledger' },
        { label: 'Faculties Mapped', value: '8 Faculties', note: '34 Depts standardized' },
        { label: 'Verification Rate', value: '98.4%', note: 'Zero unbacked claims' },
      ],
      workspacePreview: {
        title: 'Institutional Directorate Dashboard — FUTMinna',
        subtitle: 'Cohort 2026 Regulatory & Senate Oversight Pack',
        items: [
          { title: 'Faculty of Engineering & Technology', state: '92% Pathway Compliance', signed: '840 Students Tracked' },
          { title: 'School of Information & Comm. Tech', state: '96% Placement Readiness', signed: '620 Students Tracked' },
          { title: 'Regulatory Export Format', state: 'NUC / NBTE / NCCE Spec', signed: 'One-click senate PDF & CSV export' },
        ],
        actionText: 'Export Senate Oversight Pack',
      },
    },
    {
      id: 'employer' as const,
      role: 'Employer',
      tagline: 'Talent you can actually evaluate.',
      description:
        'Every profile shows what was validated, by whom, and when — not a self-written summary.',
      accent: 'cyan',
      metrics: [
        { label: 'Candidate Shortlist', value: '18 Verified', note: 'Exact rubric matches' },
        { label: 'Proof Artifacts', value: '100% Inspected', note: 'Evaluator verified' },
        { label: 'Onboarding Time', value: '-60% Faster', note: 'Pre-screened skills' },
      ],
      workspacePreview: {
        title: 'Interswitch Talent Portal — SIWES 2026 Batch',
        subtitle: 'Direct pipeline from vetted Nigerian tertiary departments',
        items: [
          { title: 'Candidate #FUTM-3891 (Backend Focus)', state: '94% Role Fit', signed: 'Python & DB verified by faculty' },
          { title: 'Candidate #UNILAG-8120 (Systems Focus)', state: '91% Role Fit', signed: 'Linux & Networks verified' },
          { title: 'Placement Offer Dispatch', state: 'Pre-Approved Terms', signed: 'Standardized ₦120k stipend agreement' },
        ],
        actionText: 'Issue Direct Interview Invite',
      },
    },
  ];

  const current = roles.find((r) => r.id === activeRole) || roles[0];

  return (
    <section id="workspaces" className="workspaces-section">
      <div className="container-custom">
        <div className="section-header-centered">
          <span className="section-eyebrow">Universal Ecosystem Integration</span>
          <h2 className="section-title">
            The same verified record. A different view for every job.
          </h2>
          <p className="section-lead">
            Whether you are a student mapping your pathway, a counsellor triaging cases, an administrator reporting to senate, or an employer hiring with confidence.
          </p>
        </div>

        {/* Role Switcher Tab Buttons */}
        <div className="roles-selector-bar">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`role-tab-btn ${activeRole === r.id ? 'active' : ''}`}
              onClick={() => setActiveRole(r.id)}
            >
              <span className="role-btn-title">{r.role}</span>
            </button>
          ))}
        </div>

        {/* Role Card Container */}
        <div className="role-workspace-card">
          <div className="role-workspace-grid">
            {/* Left Col: Role Perspective & Key Metrics */}
            <div className="role-info-side">
              <div className="role-tag-pill">
                <span>{current.role} Workspace</span>
              </div>
              <h3 className="role-tagline">{current.tagline}</h3>
              <p className="role-desc">{current.description}</p>

              <div className="role-metrics-grid">
                {current.metrics.map((metric, idx) => (
                  <div key={idx} className="metric-box">
                    <span className="metric-box-val">{metric.value}</span>
                    <span className="metric-box-lbl">{metric.label}</span>
                    <span className="metric-box-note">{metric.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Interactive Live Workspace Simulation */}
            <div className="role-view-side">
              <div className="simulator-window">
                <div className="simulator-topbar">
                  <div className="sim-dots">
                    <span className="s-dot"></span>
                    <span className="s-dot"></span>
                    <span className="s-dot"></span>
                  </div>
                  <span className="sim-address">edusal.consult/{current.id}/workspace</span>
                  <span className="sim-live-badge">Verified Session</span>
                </div>

                <div className="simulator-inner">
                  <div className="sim-heading-row">
                    <div>
                      <h4 className="sim-title">{current.workspacePreview.title}</h4>
                      <p className="sim-sub">{current.workspacePreview.subtitle}</p>
                    </div>
                  </div>

                  <div className="sim-items-list">
                    {current.workspacePreview.items.map((item, i) => (
                      <div key={i} className="sim-item">
                        <div className="sim-item-header">
                          <span className="sim-item-title">{item.title}</span>
                          <span className="sim-item-state">{item.state}</span>
                        </div>
                        <span className="sim-item-signed">{item.signed}</span>
                      </div>
                    ))}
                  </div>

                  <div className="sim-bottom-bar">
                    <button type="button" className="sim-action-btn">
                      {current.workspacePreview.actionText} →
                    </button>
                    <span className="sim-security-note">🔒 Single Source of Truth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
