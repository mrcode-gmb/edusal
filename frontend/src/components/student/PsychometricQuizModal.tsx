import { useState, type FC } from 'react';
import type {
  DiagnosticAssessment,
  DiagnosticQuestion,
  StudentAssessmentSession,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Close as CloseIcon,
  Schedule as ClockIcon,
  ArrowForward as ArrowRightIcon,
  ArrowBack as ArrowLeftIcon,
  AutoAwesome as SparklesIcon,
} from '@mui/icons-material';

interface PsychometricQuizModalProps {
  assessment: DiagnosticAssessment;
  questions: DiagnosticQuestion[];
  studentId?: string;
  authToken?: string;
  onClose: () => void;
  onCompleted: (result: StudentAssessmentSession) => void;
}

const LIKERT_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

export const PsychometricQuizModal: FC<PsychometricQuizModalProps> = ({
  assessment,
  questions,
  studentId,
  authToken,
  onClose,
  onCompleted,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const isLikert = currentQuestion?.question_type === 'LIKERT_5';

  const handleSelectLikert = (value: number) => {
    if (!currentQuestion) return;
    setResponses((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleSelectChoice = (optionId: string) => {
    if (!currentQuestion) return;
    setResponses((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const isCurrentAnswered = !!currentQuestion && responses[currentQuestion.id] !== undefined;
  const answeredCount = Object.keys(responses).length;
  const progressPercent = Math.round((answeredCount / (total || 1)) * 100);

  const handleNext = () => {
    if (currentIndex < total - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    if (answeredCount < total) {
      setError(`Please answer all ${total} questions before submitting.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await institutionApi.submitAssessment(
        assessment.id,
        responses,
        studentId,
        authToken
      );
      onCompleted(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to score assessment.');
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '15px' } } }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
            <BrainIcon sx={{ fontSize: 22, color: 'primary.main' }} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip
                size="small"
                label={assessment.assessment_type_display}
                sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
              />
              <Chip
                size="small"
                icon={<ClockIcon sx={{ fontSize: 13 }} />}
                label={`${assessment.estimated_minutes} mins`}
                sx={{ bgcolor: 'bgsoft.main', color: 'charcoal.soft', fontWeight: 700 }}
              />
            </div>
            <p className="mt-1.5 text-base font-bold text-charcoal">{assessment.title}</p>
          </div>
        </div>
        <IconButton size="medium" onClick={onClose} aria-label="Close Quiz">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <div className="mb-4">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-charcoal-soft">
              Question <strong className="text-charcoal">{currentIndex + 1}</strong> of{' '}
              <strong className="text-charcoal">{total}</strong>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-primary">
              <ClockIcon sx={{ fontSize: 13 }} /> {answeredCount}/{total} answered ({progressPercent}%)
            </span>
          </div>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 8,
              borderRadius: 99,
              bgcolor: 'primary.soft',
              '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: 'primary.main' },
            }}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-[15px] bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {currentQuestion ? (
          <div>
            <div className="rounded-[15px] bg-bgsoft p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {currentIndex + 1}
                </span>
                <p className="text-[15px] leading-relaxed font-semibold text-charcoal">
                  {currentQuestion.prompt}
                </p>
              </div>
            </div>

            {isLikert ? (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between text-xs text-charcoal-faint">
                  <span>1 = Strongly Disagree</span>
                  <span>5 = Strongly Agree</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = responses[currentQuestion.id] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectLikert(val)}
                        className={`rounded-[15px] border-2 px-3 py-3 text-center transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary-soft'
                            : 'border-line bg-white hover:border-primary-strong hover:bg-primary-faint'
                        }`}
                      >
                        <span
                          className={`block text-lg font-extrabold ${
                            isSelected ? 'text-primary' : 'text-charcoal'
                          }`}
                        >
                          {val}
                        </span>
                        <span
                          className={`mt-0.5 block text-[11px] font-semibold leading-tight ${
                            isSelected ? 'text-primary' : 'text-charcoal-faint'
                          }`}
                        >
                          {LIKERT_LABELS[val - 1]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = responses[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectChoice(opt.id)}
                      className={`flex w-full items-center gap-3 rounded-[15px] border-2 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary-soft'
                          : 'border-line bg-white hover:border-primary-strong hover:bg-primary-faint'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isSelected ? 'bg-primary text-white' : 'bg-bgsoft text-charcoal-faint'
                        }`}
                      >
                        {String.fromCharCode(65 + opt.id.charCodeAt(0) % 26)}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          isSelected ? 'text-primary' : 'text-charcoal-soft'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[15px] bg-bgsoft p-8 text-center text-sm text-charcoal-faint">
            No questions found for this assessment.
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowLeftIcon />}
            onClick={handlePrev}
            disabled={currentIndex === 0}
            sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
          >
            Previous
          </Button>

          {currentIndex < total - 1 ? (
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowRightIcon />}
              onClick={handleNext}
              disabled={!isCurrentAnswered}
            >
              Next Question
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={submitting ? undefined : <SparklesIcon />}
              onClick={handleSubmit}
              disabled={submitting || answeredCount < total}
            >
              {submitting ? 'Calculating Psychometric Profile...' : 'Complete & Evaluate Profile'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};