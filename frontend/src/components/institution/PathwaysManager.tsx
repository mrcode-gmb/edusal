import { useState, useEffect, type FC } from 'react';
import type { Pathway, InstitutionHierarchyTree } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { MilestoneTimeline } from './MilestoneTimeline';
import { CreatePathwayModal } from './CreatePathwayModal';
import { TemplateCloneModal } from './TemplateCloneModal';
import {
  Button,
  Chip,
  IconButton,
  MenuItem,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  Explore as CompassIcon,
  AutoAwesome as SparklesIcon,
  Add as PlusIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshCwIcon,
  Description as FileTextIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { PageHead, Panel } from './Shared';

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
    <div>
      <PageHead
        eyebrow="Career Architecture"
        title="Career Pathways & Milestones"
        sub="Progressive, verifiable milestone roadmaps mapped to degree programmes with exact evaluator sign-off."
        actions={
          <>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={() => setSubTab('templates')}
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
            >
              Browse Blueprint Catalog
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlusIcon />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Pathway from Scratch
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSubTab('active')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            subTab === 'active'
              ? 'bg-primary text-white'
              : 'bg-bgsoft text-charcoal-faint hover:bg-primary-soft'
          }`}
        >
          <CompassIcon sx={{ fontSize: 16 }} />
          Active Department Pathways ({pathways.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('templates')}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            subTab === 'templates'
              ? 'bg-primary text-white'
              : 'bg-bgsoft text-charcoal-faint hover:bg-primary-soft'
          }`}
        >
          <SparklesIcon sx={{ fontSize: 16 }} />
          Master Blueprint Catalog ({templates.length})
        </button>
      </div>

      {subTab === 'active' && (
        <div>
          <Panel>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <TextField
                size="small"
                select
                label={`Filter ${tierTwoTerm}`}
                value={filterDivision}
                onChange={(e) => {
                  setFilterDivision(e.target.value);
                  setFilterDept('');
                }}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">All {tierTwoTerm}s</MenuItem>
                {tree?.divisions.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                select
                label="Filter Department"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                disabled={!filterDivision}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">All Departments</MenuItem>
                {availableDepts.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pathway title, role..."
                className="lg:flex-1"
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon sx={{ fontSize: 18, mr: 1, color: 'charcoal.faint' }} />
                    ),
                  },
                }}
              />
            </div>
          </Panel>

          <div className="mt-4">
            {loading ? (
              <LinearProgress sx={{ borderRadius: 99, height: 6 }} />
            ) : pathways.length === 0 ? (
              <Panel>
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <CompassIcon sx={{ fontSize: 40, color: 'charcoal.faint' }} />
                  <h4 className="text-base font-bold text-charcoal">No Active Pathways Found</h4>
                  <p className="max-w-sm text-sm text-charcoal-faint">
                    Create a customized pathway for your degree program or clone a master
                    template blueprint.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<PlusIcon />}
                      onClick={() => setShowCreateModal(true)}
                    >
                      Create Pathway
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      startIcon={<SparklesIcon />}
                      onClick={() => setSubTab('templates')}
                      sx={{ color: 'primary.main', borderColor: 'primary.main' }}
                    >
                      Browse Master Templates
                    </Button>
                  </div>
                </div>
              </Panel>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <Panel>
                  <div className="mb-4 flex items-center justify-between">
                    <h5 className="text-sm font-bold text-charcoal">
                      Department Pathways ({pathways.length})
                    </h5>
                    <IconButton size="small" onClick={loadData} title="Refresh">
                      <RefreshCwIcon fontSize="small" sx={{ color: 'charcoal.soft' }} />
                    </IconButton>
                  </div>
                  <div className="space-y-2.5">
                    {pathways.map((pw) => {
                      const isSelected = selectedPathway?.id === pw.id;
                      return (
                        <button
                          key={pw.id}
                          type="button"
                          onClick={() => handleSelectPathway(pw)}
                          className={`w-full rounded-[15px] p-4 text-left transition-colors ${
                            isSelected
                              ? 'border border-primary bg-primary-soft'
                              : 'bg-bgsoft hover:bg-primary-soft'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Chip
                              label={pw.department_name}
                              size="small"
                              sx={{
                                bgcolor: 'white',
                                color: 'primary.main',
                                fontWeight: 700,
                              }}
                            />
                            <span className="text-xs font-extrabold text-primary">
                              {pw.total_points} pts
                            </span>
                          </div>
                          <p className="mt-2.5 text-sm font-bold text-charcoal">{pw.title}</p>
                          <p className="mt-0.5 text-xs text-charcoal-faint">
                            Target Role: <strong>{pw.career_role}</strong>
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-charcoal-faint">
                            <strong className="text-charcoal">{pw.total_milestones_count}</strong>{' '}
                            Milestones · {pw.duration_years} Years
                            {pw.is_template && (
                              <Chip
                                label="Master Blueprint"
                                size="small"
                                sx={{ bgcolor: 'charcoal', color: '#fff', fontWeight: 700 }}
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Panel>

                <div className="lg:col-span-2">
                  {selectedPathway ? (
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
                          label="Active Pathway"
                          size="small"
                          sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
                        />
                        {!selectedPathway.is_template && (
                          <button
                            type="button"
                            className="text-xs font-bold text-primary hover:underline"
                            onClick={() => handlePublishAsTemplate(selectedPathway.id)}
                          >
                            <SparklesIcon sx={{ fontSize: 13, verticalAlign: 'text-bottom', mr: 0.5 }} />
                            Publish as Blueprint Template
                          </button>
                        )}
                      </div>
                      <MilestoneTimeline
                        pathway={selectedPathway}
                        authToken={authToken}
                        onRefresh={loadData}
                      />
                    </div>
                  ) : (
                    <Panel>
                      <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <FileTextIcon sx={{ fontSize: 36, color: 'charcoal.faint' }} />
                        <p className="text-sm text-charcoal-faint">
                          Select a pathway from the left directory to view its progressive
                          milestone roadmap.
                        </p>
                      </div>
                    </Panel>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'templates' && (
        <div>
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Chip
                  icon={<SparklesIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
                  label="National & Institutional Blueprint Library"
                  size="small"
                  sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
                />
                <h3 className="mt-2 text-lg font-bold text-charcoal">
                  Master Career Pathway Blueprints
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-charcoal-faint">
                  Pre-configured, industry-accredited roadmap templates. 1-click clone to your
                  department and adapt milestones.
                </p>
              </div>
              <TextField
                size="small"
                select
                label="Award Level"
                value={templateAwardFilter}
                onChange={(e) => setTemplateAwardFilter(e.target.value)}
                sx={{ minWidth: 260 }}
              >
                <MenuItem value="">All Award Levels (Degree, ND, NCE)</MenuItem>
                <MenuItem value="BTECH">B.Tech / B.Eng (5-Year University)</MenuItem>
                <MenuItem value="BSC">B.Sc. (4-Year University)</MenuItem>
                <MenuItem value="ND">National Diploma (2-Year Polytechnic)</MenuItem>
                <MenuItem value="HND">Higher National Diploma (2-Year Polytechnic)</MenuItem>
                <MenuItem value="NCE">NCE (3-Year College of Education)</MenuItem>
              </TextField>
            </div>
          </Panel>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((tpl) => (
              <Panel key={tpl.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <Chip
                      label={tpl.award_level_display || tpl.award_level}
                      size="small"
                      sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
                    />
                    <Chip
                      label={`${tpl.duration_years} Years`}
                      size="small"
                      variant="outlined"
                      sx={{ color: 'charcoal.soft', borderColor: 'border.strong', fontWeight: 700 }}
                    />
                    <Chip
                      label={`${tpl.total_points} Total Pts`}
                      size="small"
                      variant="outlined"
                      sx={{ color: 'charcoal.faint', borderColor: 'border.strong', fontWeight: 700 }}
                    />
                  </div>
                  <Chip
                    label="Blueprint"
                    size="small"
                    sx={{ bgcolor: 'charcoal', color: '#fff', fontWeight: 700 }}
                  />
                </div>

                <h4 className="mt-3 text-base font-bold text-charcoal">{tpl.title}</h4>
                <p className="mt-1 text-sm text-charcoal-faint">
                  Target Career: <strong className="text-charcoal">{tpl.career_role}</strong>
                </p>
                <p className="mt-1.5 text-sm text-charcoal-faint">{tpl.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[15px] bg-bgsoft px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                      Milestones
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-charcoal">
                      {tpl.total_milestones_count} Sequenced Steps
                    </p>
                  </div>
                  <div className="rounded-[15px] bg-bgsoft px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                      Min CGPA
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-charcoal">
                      {tpl.target_cgpa_recommendation || '3.00'}
                    </p>
                  </div>
                </div>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="mt-4"
                  startIcon={<SparklesIcon />}
                  onClick={() => {
                    setTemplateToClone(tpl);
                    setShowCloneModal(true);
                  }}
                >
                  Use Template / Clone for My Department
                </Button>
              </Panel>
            ))}
          </div>
        </div>
      )}

      <CreatePathwayModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        institutionId={institutionId}
        tree={tree}
        authToken={authToken}
        onSuccess={loadData}
        createFn={institutionApi.createPathway}
      />

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