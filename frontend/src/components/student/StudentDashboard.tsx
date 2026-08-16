import { useState, useEffect, type FC } from 'react';
import type { StudentDashboardData, AuthUser } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { EmployabilityGaugeCard } from './EmployabilityGaugeCard';
import { StudentRoadmapTimeline } from './StudentRoadmapTimeline';
import {
  GraduationCapIcon,
  LogOutIcon,
  RefreshCwIcon,
  CompassIcon,
} from '../icons';

interface StudentDashboardProps {
  currentUser?: AuthUser;
  authToken: string;
  onLogout: () => void;
}

export const StudentDashboard: FC<StudentDashboardProps> = ({
  authToken,
  onLogout,
}) => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
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
      <div className="student-loading-container">
        <div className="loading-spinner" />
        <p>Loading your career pathway dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="student-error-container">
        <h3>Unable to Load Dashboard</h3>
        <p>{error || 'Student profile data could not be retrieved.'}</p>
        <button type="button" className="btn btn-primary-sm" onClick={loadDashboard}>
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

        {/* Employability Score Gauge Card */}
        <EmployabilityGaugeCard
          summary={employability_summary}
          profile={profile}
        />

        {/* Career Pathway Roadmap */}
        {active_pathway ? (
          <StudentRoadmapTimeline
            pathway={active_pathway}
            submissions={submissions}
            studentYearOfStudy={profile.year_of_study}
            authToken={authToken}
            onRefresh={loadDashboard}
          />
        ) : (
          <div className="no-enrolled-pathway-card">
            <CompassIcon size={36} color="#94a3b8" />
            <h4>No Career Pathway Assigned Yet</h4>
            <p>Your departmental counsellor will assign a career pathway blueprint to your degree program shortly.</p>
          </div>
        )}
      </main>
    </div>
  );
};
