import { useState, useEffect, type FC } from 'react';
import type { Pathway, InstitutionHierarchyTree } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { MilestoneTimeline } from './MilestoneTimeline';
import { CreatePathwayModal } from './CreatePathwayModal';
import { TemplateCloneModal } from './TemplateCloneModal';
import {
  CompassIcon,
  SparklesIcon,
  PlusIcon,
  SearchIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  FileTextIcon,
} from '../icons';

interface PathwaysManagerProps {
  institutionId: string;
  institutionName?: string;
  tierTwoTerm: string;
  tree: InstitutionHierarchyTree | null;
  authToken?: string | null;
}

export const PathwaysManager: FC<PathwaysManagerProps> = ({
  institutionId,
  tierTwoTerm,
  tree,
  authToken,
}) => {
  const [subTab, setSubTab] = useState<'active' | 'templates'>('active');
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [templates, setTemplates] = useState<Pathway[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPathway, setSelectedPathway] = useState<Pathway | null>(null);

  // Filters
  const [filterDivision, setFilterDivision] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [templateAwardFilter, setTemplateAwardFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [templateToClone, setTemplateToClone] = useState<Pathway | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pathwaysData, templatesData] = await Promise.all([
        institutionApi.getPathways(
          {
            institution: institutionId,
            division: filterDivision || undefined,
            department: filterDept || undefined,
            search: searchQuery || undefined,
          },
          authToken || undefined
        ),
        institutionApi.getTemplateBlueprints(
          templateAwardFilter || undefined,
          authToken || undefined
        ),
      ]);
      setPathways(pathwaysData);
      setTemplates(templatesData);

      // If viewing a selected pathway, refresh its full detail
      if (selectedPathway) {
        const freshDetail = await institutionApi.getPathwayDetail(
          selectedPathway.id,
          authToken || undefined
        );
        setSelectedPathway(freshDetail);
      } else if (pathwaysData.length > 0 && !selectedPathway) {
        const firstDetail = await institutionApi.getPathwayDetail(
          pathwaysData[0].id,
          authToken || undefined
        );
        setSelectedPathway(firstDetail);
      }
    } catch (err: unknown) {
      console.error('Failed to load pathways:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institutionId, filterDivision, filterDept, searchQuery, templateAwardFilter]);

  const handleSelectPathway = async (pw: Pathway) => {
    try {
      const detail = await institutionApi.getPathwayDetail(pw.id, authToken || undefined);
      setSelectedPathway(detail);
    } catch (err) {
      setSelectedPathway(pw);
    }
  };

  const handlePublishAsTemplate = async (pathwayId: string) => {
    if (!confirm('Publish this career pathway as a reusable master blueprint for other counsellors?')) return;
    try {
      await institutionApi.publishPathwayTemplate(pathwayId, 'NATIONAL_CATALOG', authToken || undefined);
      alert('Pathway published as master template blueprint!');
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Publish failed');
    }
  };

  const availableDepts = filterDivision && tree
    ? tree.divisions.find((d) => d.id === filterDivision)?.departments || []
    : [];

  return (
    <div className="pathways-manager-container">
      {/* Navigation Subtabs Strip */}
      <div className="pathways-subnav-strip">
        <div className="pathways-subtabs">
          <button
            type="button"
            className={`pathways-subtab ${subTab === 'active' ? 'active' : ''}`}
            onClick={() => setSubTab('active')}
          >
            <CompassIcon size={15} color={subTab === 'active' ? '#0284c7' : '#64748b'} />
            Active Department Pathways ({pathways.length})
          </button>
          <button
            type="button"
            className={`pathways-subtab ${subTab === 'templates' ? 'active' : ''}`}
            onClick={() => setSubTab('templates')}
          >
            <SparklesIcon size={15} color={subTab === 'templates' ? '#0284c7' : '#64748b'} />
            Master Blueprint Catalog ({templates.length})
          </button>
        </div>

        <div className="pathways-nav-actions">
          <button
            type="button"
            className="btn btn-outline-sm"
            onClick={() => setSubTab('templates')}
          >
            <SparklesIcon size={14} /> Browse Blueprint Catalog
          </button>
          <button
            type="button"
            className="btn btn-primary-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon size={14} /> Create Pathway from Scratch
          </button>
        </div>
      </div>

      {/* Subtab 1: Active Department Pathways Directory */}
      {subTab === 'active' && (
        <div className="pathways-active-view">
          {/* Filtering Bar */}
          <div className="pathways-filter-bar">
            <div className="filter-group">
              <label>Filter {tierTwoTerm}:</label>
              <select
                value={filterDivision}
                onChange={(e) => {
                  setFilterDivision(e.target.value);
                  setFilterDept('');
                }}
              >
                <option value="">All {tierTwoTerm}s</option>
                {tree?.divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Filter Department:</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                disabled={!filterDivision}
              >
                <option value="">All Departments</option>
                {availableDepts.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-input-group">
              <SearchIcon size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search pathway title, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="pathways-loading">Loading career pathways...</div>
          ) : pathways.length === 0 ? (
            <div className="pathways-empty-card">
              <CompassIcon size={36} color="#94a3b8" />
              <h4>No Active Pathways Found</h4>
              <p>Create a customized pathway for your degree program or clone a master template blueprint.</p>
              <div className="empty-btn-row">
                <button
                  type="button"
                  className="btn btn-primary-sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  <PlusIcon size={14} /> Create Pathway
                </button>
                <button
                  type="button"
                  className="btn btn-secondary-sm"
                  onClick={() => setSubTab('templates')}
                >
                  <SparklesIcon size={14} /> Browse Master Templates
                </button>
              </div>
            </div>
          ) : (
            <div className="pathways-split-layout">
              {/* Left Column: Pathway Selector Cards */}
              <div className="pathways-list-column">
                <div className="column-head">
                  <h5>Department Pathways ({pathways.length})</h5>
                  <button type="button" className="btn-icon-refresh" onClick={loadData} title="Refresh">
                    <RefreshCwIcon size={14} color="#64748b" />
                  </button>
                </div>

                <div className="pathway-cards-stack">
                  {pathways.map((pw) => {
                    const isSelected = selectedPathway?.id === pw.id;
                    return (
                      <div
                        key={pw.id}
                        className={`pathway-item-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectPathway(pw)}
                      >
                        <div className="pw-card-top">
                          <span className="pw-dept-tag">{pw.department_name}</span>
                          <span className="pw-points-tag">{pw.total_points} pts</span>
                        </div>

                        <h5 className="pw-title">{pw.title}</h5>
                        <p className="pw-role">Target Role: <strong>{pw.career_role}</strong></p>

                        <div className="pw-card-footer">
                          <span className="pw-milestones-count">
                            <strong>{pw.total_milestones_count}</strong> Milestones
                          </span>
                          <span className="pw-duration-tag">{pw.duration_years} Years</span>
                        </div>

                        {pw.is_template && (
                          <div className="pw-template-badge">Master Blueprint</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Progressive Milestone Timeline Canvas */}
              <div className="pathway-timeline-column">
                {selectedPathway ? (
                  <div className="selected-pathway-wrapper">
                    <div className="timeline-toolbar">
                      <div className="active-pathway-info">
                        <span className="pathway-status-active">
                          <CheckCircleIcon size={12} /> Active Pathway
                        </span>
                        {!selectedPathway.is_template && (
                          <button
                            type="button"
                            className="btn-link-publish"
                            onClick={() => handlePublishAsTemplate(selectedPathway.id)}
                          >
                            <SparklesIcon size={13} /> Publish as Blueprint Template
                          </button>
                        )}
                      </div>
                    </div>

                    <MilestoneTimeline
                      pathway={selectedPathway}
                      authToken={authToken}
                      onRefresh={loadData}
                    />
                  </div>
                ) : (
                  <div className="no-pathway-selected">
                    <FileTextIcon size={32} color="#94a3b8" />
                    <p>Select a pathway from the left directory to view its progressive milestone roadmap.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Master Blueprint Catalog */}
      {subTab === 'templates' && (
        <div className="pathways-templates-view">
          <div className="template-catalog-header">
            <div>
              <div className="template-badge-row">
                <span className="catalog-tag">
                  <SparklesIcon size={12} color="#0284c7" /> National & Institutional Blueprint Library
                </span>
              </div>
              <h3>Master Career Pathway Blueprints</h3>
              <p>
                Pre-configured, industry-accredited roadmap templates. 1-click clone to your department and adapt milestones.
              </p>
            </div>

            <div className="catalog-filters">
              <select
                value={templateAwardFilter}
                onChange={(e) => setTemplateAwardFilter(e.target.value)}
              >
                <option value="">All Award Levels (Degree, ND, NCE)</option>
                <option value="BTECH">B.Tech / B.Eng (5-Year University)</option>
                <option value="BSC">B.Sc. (4-Year University)</option>
                <option value="ND">National Diploma (2-Year Polytechnic)</option>
                <option value="HND">Higher National Diploma (2-Year Polytechnic)</option>
                <option value="NCE">NCE (3-Year College of Education)</option>
              </select>
            </div>
          </div>

          <div className="template-blueprints-grid">
            {templates.map((tpl) => (
              <div key={tpl.id} className="template-blueprint-card">
                <div className="blueprint-card-header">
                  <div className="blueprint-pills">
                    <span className="award-pill">{tpl.award_level_display || tpl.award_level}</span>
                    <span className="duration-pill">{tpl.duration_years} Years</span>
                    <span className="points-pill">{tpl.total_points} Total Pts</span>
                  </div>
                  <span className="blueprint-badge">Blueprint</span>
                </div>

                <h4 className="blueprint-card-title">{tpl.title}</h4>
                <p className="blueprint-card-role">
                  Target Career: <strong>{tpl.career_role}</strong>
                </p>
                <p className="blueprint-card-desc">{tpl.description}</p>

                <div className="blueprint-meta-details">
                  <div className="meta-stat">
                    <span className="stat-label">Milestones:</span>
                    <span className="stat-val">{tpl.total_milestones_count} Sequenced Steps</span>
                  </div>
                  <div className="meta-stat">
                    <span className="stat-label">Min CGPA:</span>
                    <span className="stat-val">{tpl.target_cgpa_recommendation || '3.00'}</span>
                  </div>
                </div>

                <div className="blueprint-card-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setTemplateToClone(tpl);
                      setShowCloneModal(true);
                    }}
                  >
                    <SparklesIcon size={14} /> Use Template / Clone for My Department
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Pathway Modal */}
      <CreatePathwayModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        institutionId={institutionId}
        tree={tree}
        authToken={authToken}
        onSuccess={loadData}
        createFn={institutionApi.createPathway}
      />

      {/* Template Clone Modal */}
      {showCloneModal && templateToClone && (
        <TemplateCloneModal
          isOpen={showCloneModal}
          onClose={() => {
            setShowCloneModal(false);
            setTemplateToClone(null);
          }}
          template={templateToClone}
          tree={tree}
          authToken={authToken}
          cloneFn={institutionApi.clonePathway}
          onSuccess={async (newPw) => {
            await loadData();
            setSubTab('active');
            setSelectedPathway(newPw);
          }}
        />
      )}
    </div>
  );
};
