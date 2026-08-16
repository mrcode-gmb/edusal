import { useState, useEffect, type FC } from 'react';
import type {
  InstitutionSummary,
  InstitutionHierarchyTree,
  GovernanceSummary,
  InstitutionalDocument,
  AcademicSession,
  LoginResponse,
  AuthUser,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { InstitutionLogin } from './InstitutionLogin';
import { GovernancePulse } from './GovernancePulse';
import { AcademicHierarchyTree } from './AcademicHierarchyTree';
import { KnowledgeBaseManager } from './KnowledgeBaseManager';
import { StaffDirectory } from './StaffDirectory';
import { StudentRoster } from './StudentRoster';
import { AddDivisionModal } from './AddDivisionModal';
import { AddDepartmentModal } from './AddDepartmentModal';
import { AddProgramModal } from './AddProgramModal';
import { SenateReportModal } from './SenateReportModal';
import {
  BuildingIcon,
  BarChartIcon,
  FolderTreeIcon,
  DatabaseIcon,
  UsersIcon,
  LogOutIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  FileTextIcon,
  GraduationCapIcon,
} from '../icons';

interface InstitutionDashboardProps {
  onBackToLanding: () => void;
}

export const InstitutionDashboard: FC<InstitutionDashboardProps> = ({ onBackToLanding }) => {
  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('edusal_auth_token') || null;
  });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('edusal_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Institution State locked to the logged-in staff member's institution
  const [institution, setInstitution] = useState<InstitutionSummary | null>(null);
  const selectedInstId = currentUser?.staff_profile?.institution || '';
  const [activeTab, setActiveTab] = useState<'pulse' | 'tree' | 'kb' | 'staff' | 'students'>('pulse');

  // Hierarchy & Governance Data
  const [tree, setTree] = useState<InstitutionHierarchyTree | null>(null);
  const [summary, setSummary] = useState<GovernanceSummary | null>(null);
  const [documents, setDocuments] = useState<InstitutionalDocument[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedDivisionForDept, setSelectedDivisionForDept] = useState<string>('');
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedDeptForProg, setSelectedDeptForProg] = useState<string>('');
  const [showSenateModal, setShowSenateModal] = useState(false);

  // Handle Login Success
  const handleLoginSuccess = (authData: LoginResponse) => {
    setAuthToken(authData.token);
    setCurrentUser(authData.user);
    localStorage.setItem('edusal_auth_token', authData.token);
    localStorage.setItem('edusal_auth_user', JSON.stringify(authData.user));
  };

  // Handle Logout
  const handleLogout = async () => {
    if (authToken) {
      await institutionApi.logout(authToken).catch(() => {});
    }
    setAuthToken(null);
    setCurrentUser(null);
    setInstitution(null);
    setTree(null);
    setSummary(null);
    setDocuments([]);
    setSessions([]);
    localStorage.removeItem('edusal_auth_token');
    localStorage.removeItem('edusal_auth_user');
  };

  // Load single institution data strictly matching current logged-in user
  const loadInstitutionData = async (instId: string) => {
    if (!instId) return;
    setLoading(true);
    try {
      const [treeData, summaryData, docsData, instList, sessionsData] = await Promise.all([
        institutionApi.getInstitutionTree(instId),
        institutionApi.getGovernanceSummary(instId),
        institutionApi.getDocuments(instId),
        institutionApi.getInstitutions({ id: instId }),
        institutionApi.getSessions(instId),
      ]);
      setTree(treeData);
      setSummary(summaryData);
      setDocuments(docsData);
      setSessions(sessionsData);
      if (instList && instList.length > 0) {
        setInstitution(instList.find((i) => i.id === instId) || instList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch institution dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInstId && authToken) {
      loadInstitutionData(selectedInstId);
    }
  }, [selectedInstId, authToken]);

  // If not logged in, render the login view
  if (!authToken || !currentUser) {
    return (
      <InstitutionLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={onBackToLanding}
      />
    );
  }

  // Handlers for adding division/department/program
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

  const selectedInst = institution || (tree ? {
    id: tree.id,
    name: tree.name,
    short_name: tree.short_name,
    slug: tree.short_name.toLowerCase(),
    institution_type: tree.institution_type,
    institution_type_display: tree.institution_type,
    ownership: 'FEDERAL',
    regulator: tree.regulator,
    regulator_display: `${tree.regulator} Regulated`,
    tier_two_term: tree.tier_two_term,
    state: 'Nigeria',
    is_founding_partner: true,
    status: 'ACTIVE',
    divisions_count: tree.divisions_count,
    departments_count: 0,
    programs_count: 0,
    documents_count: 0,
    created_at: '',
  } : null);

  return (
    <div className="institution-portal-layout">
      {/* Top Portal Navigation Bar */}
      <header className="portal-navbar">
        <div className="portal-nav-left">
          <button type="button" className="btn-back-link" onClick={onBackToLanding}>
            <ArrowLeftIcon size={14} /> Back to Landing
          </button>
          <div className="portal-brand-block">
            <BuildingIcon size={20} color="#38bdf8" />
            <span className="portal-brand-title">Edusal Institutional Governance</span>
          </div>
        </div>

        {/* User profile & Locked Institutional Badge */}
        <div className="portal-nav-right">
          {/* Locked Active Institution Pill */}
          <div className="inst-locked-pill" title="Workspace scoped strictly to your authenticated institution">
            <BuildingIcon size={15} color="#38bdf8" />
            <span className="inst-locked-name">
              {currentUser.staff_profile?.institution_name || selectedInst?.name || 'Assigned Institution'}
            </span>
          </div>

          {/* Authenticated User Capsule */}
          <div className="auth-user-capsule">
            <div className="user-avatar-sm">
              {(currentUser.name || currentUser.email).slice(0, 2).toUpperCase()}
            </div>
            <div className="user-info-sm">
              <span className="user-name-sm">{currentUser.name || currentUser.email}</span>
              <span className="user-role-sm">
                {currentUser.staff_profile?.role_display || 'Institutional Staff'}
              </span>
            </div>
            <button
              type="button"
              className="btn-logout"
              onClick={handleLogout}
              title="Sign out of workspace"
            >
              <LogOutIcon size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="portal-main container-custom">
        {/* Institutional Scope Strip */}
        {selectedInst && (
          <div className="portal-institution-strip">
            <div className="inst-strip-top">
              <div className="inst-meta-info">
                <div className="inst-badge-stack">
                  <span className="inst-regulator-tag">
                    <ShieldCheckIcon size={12} /> {selectedInst.regulator} Regulated
                  </span>
                  <span className="inst-type-tag">{selectedInst.institution_type_display}</span>
                  {selectedInst.is_founding_partner && (
                    <span className="inst-partner-tag">Founding Charter Member</span>
                  )}
                </div>
                <h2 className="inst-heading">{selectedInst.name}</h2>
                <span className="inst-location">
                  {selectedInst.state} State, Nigeria · Native Tier-2: <strong>{selectedInst.tier_two_term}</strong>
                </span>
              </div>

              <div className="inst-strip-actions">
                <button
                  type="button"
                  className="btn btn-secondary-sm"
                  onClick={() => setShowSenateModal(true)}
                >
                  <FileTextIcon size={14} /> Senate Audit Pack
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="portal-tabs">
              <button
                type="button"
                className={`portal-tab ${activeTab === 'pulse' ? 'active' : ''}`}
                onClick={() => setActiveTab('pulse')}
              >
                <BarChartIcon size={16} /> Governance Pulse
              </button>
              <button
                type="button"
                className={`portal-tab ${activeTab === 'tree' ? 'active' : ''}`}
                onClick={() => setActiveTab('tree')}
              >
                <FolderTreeIcon size={16} /> 4-Tier Hierarchy Explorer
              </button>
              <button
                type="button"
                className={`portal-tab ${activeTab === 'kb' ? 'active' : ''}`}
                onClick={() => setActiveTab('kb')}
              >
                <DatabaseIcon size={16} /> Knowledge Base & Citation Tester
              </button>
              <button
                type="button"
                className={`portal-tab ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => setActiveTab('staff')}
              >
                <UsersIcon size={16} /> Staff & Evaluators
              </button>
              <button
                type="button"
                className={`portal-tab ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                <GraduationCapIcon size={16} /> Student Roster & Cohorts
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
              tierTwoTerm={selectedInst.tier_two_term === 'SCHOOL' ? 'School' : 'Faculty'}
              tree={tree}
              sessions={sessions}
              documents={documents}
              loading={loading}
              authToken={authToken}
              onRefresh={() => loadInstitutionData(selectedInst.id)}
            />
          )}

          {activeTab === 'staff' && selectedInst && (
            <StaffDirectory
              institutionId={selectedInst.id}
              institutionName={selectedInst.name}
              tierTwoTerm={selectedInst.tier_two_term === 'SCHOOL' ? 'School' : 'Faculty'}
            />
          )}

          {activeTab === 'students' && selectedInst && (
            <StudentRoster
              institutionId={selectedInst.id}
              institutionName={selectedInst.name}
              tree={tree}
              sessions={sessions}
              authToken={authToken}
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
