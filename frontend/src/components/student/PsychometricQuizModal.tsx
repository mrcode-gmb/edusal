import { useState, type FC } from 'react';
import type { DiagnosticAssessment, DiagnosticQuestion, StudentAssessmentSession } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  XIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ClockIcon,
  SparklesIcon,
  BrainIcon,
} from '../icons';

interface PsychometricQuizModalProps {
  assessment: DiagnosticAssessment;
  questions: DiagnosticQuestion[];
  studentId?: string;
  authToken?: string;
  onClose: () => void;
  onCompleted: (result: StudentAssessmentSession) => void;
}

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
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleSelectChoice = (optionId: string) => {
    if (!currentQuestion) return;
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const isCurrentAnswered = currentQuestion && responses[currentQuestion.id] !== undefined;
  const answeredCount = Object.keys(responses).length;
  const progressPercent = Math.round((answeredCount / (total || 1)) * 100);

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
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
    <div className="modal-backdrop">
      <div className="quiz-modal-container">
        {/* Modal Header */}
        <div className="quiz-modal-header">
          <div className="quiz-header-title-row">
            <div className="quiz-badge-icon">
              <BrainIcon size={20} color="#0284c7" />
            </div>
            <div>
              <div className="quiz-tag-pill">{assessment.assessment_type_display}</div>
              <h3 className="quiz-title">{assessment.title}</h3>
            </div>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close Quiz"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Progress Bar & Counter */}
        <div className="quiz-progress-bar-wrapper">
          <div className="quiz-progress-meta">
            <span className="quiz-counter-text">
              Question <strong>{currentIndex + 1}</strong> of <strong>{total}</strong>
            </span>
            <span className="quiz-pct-text">
              <ClockIcon size={13} /> {answeredCount}/{total} answered ({progressPercent}%)
            </span>
          </div>
          <div className="quiz-progress-track">
            <div
              className="quiz-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Question Body */}
        <div className="quiz-question-body">
          {error && (
            <div className="login-alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircleIcon size={16} color="#dc2626" />
              <span>{error}</span>
            </div>
          )}

          {currentQuestion ? (
            <div className="quiz-active-card">
              <div className="question-prompt-box">
                <span className="question-number-pill">#{currentIndex + 1}</span>
                <p className="question-prompt-text">{currentQuestion.prompt}</p>
              </div>

              {/* Options Interface */}
              {isLikert ? (
                <div className="likert-scale-container">
                  <div className="likert-labels-row">
                    <span className="likert-end-label">1 = Very Inaccurate / Dislike</span>
                    <span className="likert-end-label">5 = Very Accurate / Enjoy</span>
                  </div>
                  <div className="likert-options-grid">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = responses[currentQuestion.id] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          className={`likert-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectLikert(val)}
                        >
                          <span className="likert-num">{val}</span>
                          <span className="likert-desc">
                            {val === 1 && 'Strongly Disagree'}
                            {val === 2 && 'Disagree'}
                            {val === 3 && 'Neutral'}
                            {val === 4 && 'Agree'}
                            {val === 5 && 'Strongly Agree'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="multiple-choice-grid">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = responses[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`choice-card-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectChoice(opt.id)}
                      >
                        <span className="choice-opt-id">{opt.id}</span>
                        <span className="choice-opt-text">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="quiz-empty-state">No questions found for this assessment.</div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="quiz-modal-footer">
          <button
            type="button"
            className="btn btn-secondary-sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ArrowLeftIcon size={15} /> Previous
          </button>

          <div className="footer-right-actions">
            {currentIndex < total - 1 ? (
              <button
                type="button"
                className="btn btn-primary-sm"
                onClick={handleNext}
                disabled={!isCurrentAnswered}
              >
                Next Question <ArrowRightIcon size={15} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary-sm btn-submit-quiz"
                onClick={handleSubmit}
                disabled={submitting || answeredCount < total}
              >
                {submitting ? (
                  'Calculating Psychometric Profile...'
                ) : (
                  <>
                    <SparklesIcon size={15} /> Complete & Evaluate Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
