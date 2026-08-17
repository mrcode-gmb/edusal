import { useState, useEffect, type FC } from 'react';
import type {
  DiagnosticAssessment,
  DiagnosticQuestion,
  StudentAssessmentSession,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { PsychometricQuizModal } from './PsychometricQuizModal';
import { AssessmentRadarCard } from './AssessmentRadarCard';
import { PageHead, Panel, Badge } from '../institution/Shared';
import { Alert, Button, Chip, CircularProgress } from '@mui/material';
import {
  Psychology as BrainIcon,
  Explore as CompassIcon,
  AutoGraph as BarChartIcon,
  AutoAwesome as SparklesIcon,
  Schedule as ClockIcon,
  ArrowForward as ArrowRightIcon,
  RestartAlt as RotateCcwIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

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
    setResults((prev) => [result, ...prev.filter((r) => r.assessment !== result.assessment)]);
  };

  if (loading) {
    return (
      <Panel>
        <div className="flex flex-col items-center justify-center py-16">
          <CircularProgress size={40} sx={{ color: 'primary.main' }} />
          <p className="mt-4 text-sm text-charcoal-faint">
            Loading accredited psychometric item banks and diagnostic results...
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <div>
      <PageHead
        eyebrow="Diagnostic Assessments"
        title="Psychometric Assessment & Vocational Profiling"
        sub="Complete standardized psychometric and cognitive assessments to discover your Holland Vocational Code, evaluate workplace execution traits, and calibrate your accredited Employability Score."
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Refresh Catalog
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '15px' }}>
          {error}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assessments.map((assessment) => {
          const completedResult = results.find(
            (r) => r.assessment === assessment.id || r.assessment_type === assessment.assessment_type
          );
          const isCompleted = !!completedResult;

          const TypeIcon =
            assessment.assessment_type === 'BIG_FIVE'
              ? BrainIcon
              : assessment.assessment_type === 'HOLLAND_RIASEC'
                ? CompassIcon
                : BarChartIcon;

          return (
            <Panel key={assessment.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
                  <TypeIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                </span>
                <div className="flex items-center gap-1.5">
                  <Chip
                    size="small"
                    icon={<ClockIcon sx={{ fontSize: 13 }} />}
                    label={`${assessment.estimated_minutes} mins`}
                    sx={{ bgcolor: 'bgsoft.main', color: 'charcoal.soft', fontWeight: 700 }}
                  />
                  <Chip
                    size="small"
                    label={`${assessment.total_questions} Items`}
                    sx={{ bgcolor: 'bgsoft.main', color: 'charcoal.soft', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div className="mt-4 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge>{assessment.assessment_type_display}</Badge>
                </div>
                <h3 className="mt-2.5 text-base font-bold text-charcoal">{assessment.title}</h3>
                <p className="mt-1.5 text-sm text-charcoal-soft">{assessment.description}</p>
              </div>

              <div className="mt-5">
                {isCompleted ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge color="var(--color-signoff)" bg="var(--color-primary-soft)">
                      <CheckCircleIcon sx={{ fontSize: 13, mr: 0.5 }} />
                      Completed ({completedResult.summary_code})
                    </Badge>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<RotateCcwIcon />}
                      onClick={() => handleStartQuiz(assessment)}
                      disabled={loadingQuestions}
                    >
                      Retake
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    endIcon={<ArrowRightIcon />}
                    onClick={() => handleStartQuiz(assessment)}
                    disabled={loadingQuestions}
                  >
                    Start Diagnostic
                  </Button>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[15px] bg-primary-soft">
              <SparklesIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </span>
            <div>
              <h3 className="text-base font-bold text-charcoal">Your Evaluated Psychometric Profile</h3>
              <p className="text-sm text-charcoal-faint">
                Standardized diagnostic traits and algorithmic pathway alignment
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((sess) => (
              <AssessmentRadarCard key={sess.id} session={sess} />
            ))}
          </div>
        </div>
      )}

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