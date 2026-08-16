import { useState, useEffect, type FC } from 'react';
import type { AuthUser, StudentDashboardData } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { EmployabilityGaugeCard } from './EmployabilityGaugeCard';
import { StudentRoadmapTimeline } from './StudentRoadmapTimeline';
import { AssessmentCatalog } from './AssessmentCatalog';
import { AICareerCoachChat } from './AICareerCoachChat';
import { CounsellingSessionsTab } from './CounsellingSessionsTab';
import {
  GraduationCapIcon,
  LogOutIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  BrainIcon,
  SparklesIcon,
  UserCheckIcon,
  CompassIcon,
} from '../icons';

interface StudentDashboardProps {
  currentUser: AuthUser;
  authToken: string;
  onLogout: () => void;
}

export const StudentDashboard: FC<StudentDashboardProps> = ({
  currentUser: _currentUser,
  authToken,
  onLogout,
}) => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'diagnostics' | 'ai_coach' | 'counselling'>('roadmap');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await institutionApi.getStudentDashboard(authToken);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load student dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [authToken]);

  if (loading) {
    return (
      <div className="student-portal-loading">
        <div className="spinner"></div>
        <p>Loading your accredited student career portal & roadmap...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="student-portal-error">
        <AlertCircleIcon size={32} color="#dc2626" />
        <h3>Failed to Load Student Portal</h3>
        <p>{error || 'An unexpected error occurred while loading your profile.'}</p>
        <button type="button" className="btn btn-primary" onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  const { profile, active_pathway, submissions, employability_summary } = data;

  return (
    <div className="student-portal-wrapper">
      {/* Top Navigation Bar */}
      <header className="student-portal-navbar">
        <div className="portal-brand-row">
          <div className="student-brand-badge">
            <GraduationCapIcon size={20} color="#ffffff" />
          </div>
          <div>
            <h3>EduSal Student Career Portal</h3>
            <p>{profile.institution_name}</p>
          </div>
        </div>

        <div className="portal-user-actions">
          <div className="student-info-pill">
            <span className="student-name">{profile.user_name}</span>
            <span className="student-matric">{profile.matric_number}</span>
          </div>
          <button type="button" className="btn-logout" onClick={onLogout} title="Log Out">
            <LogOutIcon size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="student-portal-main">
        {/* Student Profile Identity Banner */}
        <div className="student-identity-banner">
          <div className="banner-left">
            <div className="student-tag-row">
              <span className="inst-badge">{profile.institution_short_name}</span>
              <span className="dept-badge">{profile.department_name}</span>
              <span className="level-badge">{profile.level_display}</span>
              {profile.is_siwes_year && (
                <span className="siwes-active-badge">SIWES Eligible Cohort</span>
              )}
            </div>

            <h2 className="student-headline">{profile.program_name}</h2>
            <p className="student-subhead">
              Matriculation: <strong>{profile.matric_number}</strong> · Entry Mode: <strong>{profile.entry_mode_display}</strong> · Session: <strong>{profile.entry_session_label}</strong>
            </p>
          </div>

          <div className="banner-right-stats">
            <div className="stat-pill">
              <span className="stat-pill-label">Cumulative GPA</span>
              <span className="stat-pill-val">{profile.cgpa ? Number(profile.cgpa).toFixed(2) : '3.50'}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-label">SIWES Status</span>
              <span className="stat-pill-val">{profile.siwes_clearance_status_display}</span>
            </div>
            <button
              type="button"
              className="btn-icon-refresh"
              onClick={loadDashboard}
              title="Refresh Dashboard"
            >
              <RefreshCwIcon size={14} color="#64748b" />
            </button>
          </div>
        </div>

        {/* 4 Primary Student Workspace Tabs */}
        <div className="student-workspace-tabs-container">
          <div className="student-workspace-tabs">
            <button
              type="button"
              className={`student-tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('roadmap')}
            >
              <CompassIcon size={16} />
              <span>1. Milestone Roadmap & Score</span>
            </button>
            <button
              type="button"
              className={`student-tab-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
              onClick={() => setActiveTab('diagnostics')}
            >
              <BrainIcon size={16} />
              <span>2. Diagnostic Assessments</span>
            </button>
            <button
              type="button"
              className={`student-tab-btn ${activeTab === 'ai_coach' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai_coach')}
            >
              <SparklesIcon size={16} />
              <span>3. 24/7 AI Career Coach</span>
            </button>
            <button
              type="button"
              className={`student-tab-btn ${activeTab === 'counselling' ? 'active' : ''}`}
              onClick={() => setActiveTab('counselling')}
            >
              <UserCheckIcon size={16} />
              <span>4. Counsellor Sessions</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Roadmap & Employability Score */}
        {activeTab === 'roadmap' && (
          <div className="tab-content-roadmap">
            <EmployabilityGaugeCard
              summary={employability_summary}
              profile={profile}
            />

            {active_pathway ? (
              <StudentRoadmapTimeline
                pathway={active_pathway}
                submissions={submissions}
                studentYearOfStudy={profile.year_of_study}
                authToken={authToken}
                onRefresh={loadDashboard}
              />
            ) : (
              <div className="no-pathway-enrolled-card">
                <AlertCircleIcon size={32} color="#f59e0b" />
                <h3>No Active Career Pathway Enrolled</h3>
                <p>
                  Your department has not assigned an active career pathway template to your profile yet.
                  Please consult your HOD or departmental counsellor to enroll in your degree milestones.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Diagnostic Assessments */}
        {activeTab === 'diagnostics' && (
          <AssessmentCatalog
            studentId={profile.id}
            authToken={authToken}
          />
        )}

        {/* Tab 3: 24/7 AI Career Coach */}
        {activeTab === 'ai_coach' && (
          <AICareerCoachChat
            studentProfile={profile}
            activePathway={active_pathway}
            authToken={authToken}
          />
        )}

        {/* Tab 4: Counsellor Sessions */}
        {activeTab === 'counselling' && (
          <CounsellingSessionsTab
            studentProfile={profile}
            authToken={authToken}
          />
        )}
      </main>
    </div>
  );
};
