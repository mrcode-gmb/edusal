import { useState, useEffect, type FC } from 'react';
import type {
  DiagnosticAssessment,
  DiagnosticQuestion,
  StudentAssessmentSession,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { PsychometricQuizModal } from './PsychometricQuizModal';
import { AssessmentRadarCard } from './AssessmentRadarCard';
import {
  BrainIcon,
  SparklesIcon,
  CompassIcon,
  BarChartIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  RotateCcwIcon,
} from '../icons';

interface AssessmentCatalogProps {
  studentId?: string;
  authToken?: string;
}

export const AssessmentCatalog: FC<AssessmentCatalogProps> = ({
  studentId,
  authToken,
}) => {
  const [assessments, setAssessments] = useState<DiagnosticAssessment[]>([]);
  const [results, setResults] = useState<StudentAssessmentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active quiz modal state
  const [selectedAssessment, setSelectedAssessment] = useState<DiagnosticAssessment | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<DiagnosticQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assessList, myResults] = await Promise.all([
        institutionApi.listDiagnosticAssessments(authToken),
        institutionApi.getMyAssessmentResults(authToken),
      ]);
      setAssessments(assessList);
      setResults(myResults);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load diagnostic assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authToken]);

  const handleStartQuiz = async (assessment: DiagnosticAssessment) => {
    setLoadingQuestions(true);
    setSelectedAssessment(assessment);
    try {
      const questions = await institutionApi.getAssessmentQuestions(assessment.slug, authToken);
      setQuizQuestions(questions);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load questions for assessment');
      setSelectedAssessment(null);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleQuizCompleted = (result: StudentAssessmentSession) => {
    setSelectedAssessment(null);
    setQuizQuestions([]);
    // Update results list
    setResults((prev) => [result, ...prev.filter((r) => r.assessment !== result.assessment)]);
  };

  if (loading) {
    return (
      <div className="section-loading-container">
        <div className="spinner"></div>
        <p>Loading accredited psychometric item banks and diagnostic results...</p>
      </div>
    );
  }

  return (
    <div className="assessment-catalog-container">
      {/* Top Banner */}
      <div className="assessment-hero-banner">
        <div className="assessment-hero-content">
          <div className="assessment-tag-badge">
            <SparklesIcon size={14} color="#38bdf8" />
            <span>Accredited Psychometric Item Banks</span>
          </div>
          <h2>Diagnostic Assessments & Vocational Profiling</h2>
          <p>
            Complete standardized psychometric and cognitive assessments to discover your Holland Vocational Code,
            evaluate workplace execution traits, and calibrate your accredited Employability Score.
          </p>
        </div>
      </div>

      {error && (
        <div className="login-alert-error" style={{ marginBottom: '20px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Catalog Cards Grid */}
      <div className="assessment-cards-grid">
        {assessments.map((assessment) => {
          const completedResult = results.find((r) => r.assessment === assessment.id || r.assessment_type === assessment.assessment_type);
          const isCompleted = !!completedResult;

          return (
            <div key={assessment.id} className={`assessment-card ${isCompleted ? 'completed' : ''}`}>
              <div className="assessment-card-top">
                <div className="assessment-type-icon">
                  {assessment.assessment_type === 'BIG_FIVE' && <BrainIcon size={22} color="#0284c7" />}
                  {assessment.assessment_type === 'HOLLAND_RIASEC' && <CompassIcon size={22} color="#059669" />}
                  {assessment.assessment_type === 'NUMERICAL_REASONING' && <BarChartIcon size={22} color="#7c3aed" />}
                </div>
                <div className="assessment-meta-pills">
                  <span className="pill-minutes">
                    <ClockIcon size={12} /> {assessment.estimated_minutes} mins
                  </span>
                  <span className="pill-questions">{assessment.total_questions} Items</span>
                </div>
              </div>

              <div className="assessment-card-body">
                <h3 className="assessment-card-title">{assessment.title}</h3>
                <p className="assessment-card-desc">{assessment.description}</p>
              </div>

              <div className="assessment-card-footer">
                {isCompleted ? (
                  <div className="completed-action-row">
                    <div className="completed-status-tag">
                      <CheckCircleIcon size={15} color="#059669" />
                      <span>Completed ({completedResult.summary_code})</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary-sm btn-retake"
                      onClick={() => handleStartQuiz(assessment)}
                      disabled={loadingQuestions}
                    >
                      <RotateCcwIcon size={13} /> Retake
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-start-assessment"
                    onClick={() => handleStartQuiz(assessment)}
                    disabled={loadingQuestions}
                  >
                    Start Diagnostic <ArrowRightIcon size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Results Section */}
      {results.length > 0 && (
        <div className="completed-results-section">
          <div className="results-section-header">
            <SparklesIcon size={20} color="#0284c7" />
            <div>
              <h3>Your Evaluated Psychometric Profile</h3>
              <p>Standardized diagnostic traits and algorithmic pathway alignment</p>
            </div>
          </div>

          <div className="radar-cards-list">
            {results.map((sess) => (
              <AssessmentRadarCard key={sess.id} session={sess} />
            ))}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {selectedAssessment && quizQuestions.length > 0 && (
        <PsychometricQuizModal
          assessment={selectedAssessment}
          questions={quizQuestions}
          studentId={studentId}
          authToken={authToken}
          onClose={() => {
            setSelectedAssessment(null);
            setQuizQuestions([]);
          }}
          onCompleted={handleQuizCompleted}
        />
      )}
    </div>
  );
};
