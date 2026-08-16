import { useState, useEffect, type FC } from 'react';
import type {
  InstitutionSummary,
  InstitutionHierarchyTree,
  GovernanceSummary,
  InstitutionalDocument,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { GovernancePulse } from './GovernancePulse';
import { AcademicHierarchyTree } from './AcademicHierarchyTree';
import { KnowledgeBaseManager } from './KnowledgeBaseManager';
import { AddDivisionModal } from './AddDivisionModal';
import { AddDepartmentModal } from './AddDepartmentModal';
import { AddProgramModal } from './AddProgramModal';
import { SenateReportModal } from './SenateReportModal';

interface InstitutionDashboardProps {
  onBackToLanding: () => void;
}

export const InstitutionDashboard: FC<InstitutionDashboardProps> = ({ onBackToLanding }) => {
  const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pulse' | 'tree' | 'kb'>('pulse');

  // Hierarchy & Governance Data
  const [tree, setTree] = useState<InstitutionHierarchyTree | null>(null);
  const [summary, setSummary] = useState<GovernanceSummary | null>(null);
  const [documents, setDocuments] = useState<InstitutionalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedDivisionForDept, setSelectedDivisionForDept] = useState<string>('');
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedDeptForProg, setSelectedDeptForProg] = useState<string>('');
  const [showSenateModal, setShowSenateModal] = useState(false);

  // Initial fetch of institutions list
  useEffect(() => {
    institutionApi
      .getInstitutions()
      .then((data) => {
        setInstitutions(data);
        if (data.length > 0) {
          // Default to FUTMinna if present, or first
          const futm = data.find((i) => i.slug === 'futminna') || data[0];
          setSelectedInstId(futm.id);
        }
      })
      .catch((err) => console.error('Failed to load institutions:', err));
  }, []);

  // Fetch institution data when selected institution changes
  const loadInstitutionData = async (instId: string) => {
    if (!instId) return;
    setLoading(true);
    try {
      const [treeData, summaryData, docsData] = await Promise.all([
        institutionApi.getInstitutionTree(instId),
        institutionApi.getGovernanceSummary(instId),
        institutionApi.getDocuments(instId),
      ]);
      setTree(treeData);
      setSummary(summaryData);
      setDocuments(docsData);
    } catch (err) {
      console.error('Failed to fetch institution dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInstId) {
      loadInstitutionData(selectedInstId);
    }
  }, [selectedInstId]);

  // Add Division Handler
  const handleAddDivision = async (data: {
    institution: string;
    name: string;
    code: string;
    division_type: 'FACULTY' | 'SCHOOL' | 'COLLEGE';
    dean_name?: string;
    dean_email?: string;
  }) => {
    await institutionApi.createDivision(data);
    await loadInstitutionData(selectedInstId);
  };

  // Add Department Handler
  const handleAddDepartment = async (data: {
    institution: string;
    division: string;
    name: string;
    code: string;
    hod_name?: string;
    hod_email?: string;
    siwes_eligible: boolean;
  }) => {
    await institutionApi.createDepartment(data);
    await loadInstitutionData(selectedInstId);
  };

  // Add Program Handler
  const handleAddProgram = async (data: {
    institution: string;
    department: string;
    name: string;
    program_code: string;
    award_level: string;
    duration_years: number;
    siwes_duration_months: number;
  }) => {
    await institutionApi.createProgram(data);
    await loadInstitutionData(selectedInstId);
  };

  const selectedInst = institutions.find((i) => i.id === selectedInstId);

  return (
    <div className="institution-portal-layout">
      {/* Top Portal Navigation Bar */}
      <header className="portal-navbar">
        <div className="portal-nav-left">
          <button type="button" className="btn-back-link" onClick={onBackToLanding}>
            ← Back to Landing
          </button>
          <div className="portal-brand-block">
            <span className="brand-dot"></span>
            <span className="portal-brand-title">Edusal Institutional Governance</span>
          </div>
        </div>

        {/* Institution Switcher Dropdown */}
        <div className="portal-nav-right">
          <div className="inst-switcher-box">
            <span className="switcher-label">Active Institution:</span>
            <select
              className="inst-select"
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
            >
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.regulator})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="portal-main container-custom">
        {/* Breadcrumb & Archetype Strip */}
        {selectedInst && (
          <div className="portal-institution-strip">
            <div className="inst-meta-info">
              <div className="inst-badge-stack">
                <span className="inst-regulator-tag">{selectedInst.regulator} Regulated</span>
                <span className="inst-type-tag">{selectedInst.institution_type_display}</span>
                {selectedInst.is_founding_partner && (
                  <span className="inst-partner-tag">★ Founding Charter Member</span>
                )}
              </div>
              <h2 className="inst-heading">{selectedInst.name}</h2>
              <span className="inst-location">📍 {selectedInst.state} State, Nigeria</span>
            </div>

            {/* View Tabs */}
            <div className="portal-tabs">
              <button
                type="button"
                className={`portal-tab ${activeTab === 'pulse' ? 'active' : ''}`}
                onClick={() => setActiveTab('pulse')}
              >
                📊 Governance Pulse
              </button>
              <button
                type="button"
                className={`portal-tab ${activeTab === 'tree' ? 'active' : ''}`}
                onClick={() => setActiveTab('tree')}
              >
                🌳 4-Tier Hierarchy Explorer
              </button>
              <button
                type="button"
                className={`portal-tab ${activeTab === 'kb' ? 'active' : ''}`}
                onClick={() => setActiveTab('kb')}
              >
                📚 Document Knowledge Base & Tester
              </button>
            </div>
          </div>
        )}

        {/* Active Tab Views */}
        <div className="portal-tab-content">
          {activeTab === 'pulse' && (
            <GovernancePulse
              summary={summary}
              loading={loading}
              onGenerateReport={() => setShowSenateModal(true)}
            />
          )}

          {activeTab === 'tree' && (
            <AcademicHierarchyTree
              tree={tree}
              loading={loading}
              onAddDivision={() => setShowDivisionModal(true)}
              onAddDepartment={(divId) => {
                setSelectedDivisionForDept(divId);
                setShowDepartmentModal(true);
              }}
              onAddProgram={(deptId) => {
                setSelectedDeptForProg(deptId);
                setShowProgramModal(true);
              }}
            />
          )}

          {activeTab === 'kb' && selectedInst && (
            <KnowledgeBaseManager
              institutionId={selectedInst.id}
              institutionName={selectedInst.name}
              documents={documents}
              loading={loading}
              onRefresh={() => loadInstitutionData(selectedInst.id)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedInst && (
        <>
          <AddDivisionModal
            isOpen={showDivisionModal}
            onClose={() => setShowDivisionModal(false)}
            institutionId={selectedInst.id}
            tierTwoTerm={selectedInst.tier_two_term}
            onSubmit={handleAddDivision}
          />

          <AddDepartmentModal
            isOpen={showDepartmentModal}
            onClose={() => setShowDepartmentModal(false)}
            institutionId={selectedInst.id}
            divisionId={selectedDivisionForDept}
            onSubmit={handleAddDepartment}
          />

          <AddProgramModal
            isOpen={showProgramModal}
            onClose={() => setShowProgramModal(false)}
            institutionId={selectedInst.id}
            departmentId={selectedDeptForProg}
            onSubmit={handleAddProgram}
          />

          <SenateReportModal
            isOpen={showSenateModal}
            onClose={() => setShowSenateModal(false)}
            summary={summary}
          />
        </>
      )}
    </div>
  );
};
