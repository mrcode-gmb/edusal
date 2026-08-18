import logging
from decimal import Decimal
from typing import Any, Dict, List, Tuple
from django.utils import timezone

from nexus.institutions.models import (
    DiagnosticAssessment,
    DiagnosticQuestion,
    StudentAssessmentSession,
    StudentProfile,
    AssessmentType,
    Pathway,
)

logger = logging.getLogger(__name__)


class PsychometricService:
    """Service for evaluating scientific psychometric models, Holland RIASEC interest codes, and cognitive tests."""

    BIG_FIVE_TRAIT_DESCRIPTIONS = {
        "OPENNESS": {
            "title": "Openness to Experience & Innovation",
            "high": "High intellectual curiosity, creative system architecture design, and eagerness to adopt emerging technologies.",
            "moderate": "Balanced approach between proven conventional frameworks and innovative toolchains.",
            "low": "Prefers established, highly standardized operational workflows and structured procedural stability.",
        },
        "CONSCIENTIOUSNESS": {
            "title": "Conscientiousness & Execution Discipline",
            "high": "High goal orientation, rigorous debugging discipline, meticulous documentation, and reliable deliverable execution.",
            "moderate": "Reliable task execution with flexible milestone pacing.",
            "low": "Spontaneous and adaptive, benefits from explicit deadlines and structured supervisor check-ins.",
        },
        "EXTRAVERSION": {
            "title": "Extraversion & Collaborative Energy",
            "high": "Energized by cross-functional team sprint coordination, client presentations, and community developer advocacy.",
            "moderate": "Effective in both collaborative pair programming and focused deep-work independent sessions.",
            "low": "Thrives in focused, deep-concentration problem solving with minimal communication interruptions.",
        },
        "AGREEABLENESS": {
            "title": "Agreeableness & Team Empathy",
            "high": "Empathetic teammate, constructive peer code reviewer, collaborative conflict mediator, and supportive mentor.",
            "moderate": "Objective collaborator who balances interpersonal warmth with rigorous technical standards.",
            "low": "Direct, candid, and highly competitive; emphasizes strict technical correctness over consensus.",
        },
        "EMOTIONAL_STABILITY": {
            "title": "Emotional Stability & Resilience Under Pressure",
            "high": "Calm composure during critical production outages, high resilience under tight SIWES and academic deadlines.",
            "moderate": "Steady composure under normal workplace challenges, benefits from proactive workload planning.",
            "low": "Sensitive to workplace stressors; thrives in supportive, low-ambiguity institutional environments.",
        },
    }

    RIASEC_THEME_NAMES = {
        "REALISTIC": "Realistic (Hands-On Technical & Engineering)",
        "INVESTIGATIVE": "Investigative (Analytical, Scientific & Research)",
        "ARTISTIC": "Artistic (Creative, UI/UX & Innovative Authoring)",
        "SOCIAL": "Social (Mentoring, Teaching & Community Care)",
        "ENTERPRISING": "Enterprising (Leadership, Strategy & Persuasion)",
        "CONVENTIONAL": "Conventional (Systems Organization, Data & Compliance)",
    }

    @classmethod
    def score_big_five(cls, raw_responses: Dict[str, Any], questions: List[DiagnosticQuestion]) -> Tuple[Dict[str, float], str, str, List[str]]:
        """
        Calculates Big Five OCEAN scores from Likert 1-5 responses.
        Returns: (dimension_scores, summary_code, narrative_report, career_recommendations)
        """
        trait_raw: Dict[str, List[int]] = {
            "OPENNESS": [],
            "CONSCIENTIOUSNESS": [],
            "EXTRAVERSION": [],
            "AGREEABLENESS": [],
            "EMOTIONAL_STABILITY": [],
        }

        for q in questions:
            dim = q.dimension.upper()
            if dim not in trait_raw:
                continue

            val = int(raw_responses.get(str(q.id), 3))
            # Validate 1-5 bounds
            val = max(1, min(5, val))

            if q.is_reverse_scored:
                scored_val = 6 - val
            else:
                scored_val = val

            trait_raw[dim].append(scored_val)

        dimension_scores: Dict[str, float] = {}
        report_paragraphs: List[str] = []

        for dim, scores in trait_raw.items():
            if scores:
                raw_sum = sum(scores)
                min_sum = len(scores) * 1
                max_sum = len(scores) * 5
                # Normalize to 0-100%
                norm_pct = round(((raw_sum - min_sum) / (max_sum - min_sum)) * 100, 1) if max_sum > min_sum else 50.0
            else:
                norm_pct = 50.0

            dimension_scores[dim] = norm_pct

            info = cls.BIG_FIVE_TRAIT_DESCRIPTIONS.get(dim, {})
            title = info.get("title", dim)
            if norm_pct >= 70:
                desc = info.get("high", "")
                tier_label = "High"
            elif norm_pct >= 40:
                desc = info.get("moderate", "")
                tier_label = "Moderate"
            else:
                desc = info.get("low", "")
                tier_label = "Developing / Low"

            report_paragraphs.append(f"**{title} ({norm_pct}% - {tier_label})**: {desc}")

        # Summary code: e.g. O85-C90-E65-A75-S80
        summary_code = (
            f"O{int(dimension_scores.get('OPENNESS', 50))}-"
            f"C{int(dimension_scores.get('CONSCIENTIOUSNESS', 50))}-"
            f"E{int(dimension_scores.get('EXTRAVERSION', 50))}-"
            f"A{int(dimension_scores.get('AGREEABLENESS', 50))}-"
            f"S{int(dimension_scores.get('EMOTIONAL_STABILITY', 50))}"
        )

        career_recs = []
        if dimension_scores.get("CONSCIENTIOUSNESS", 0) >= 70 and dimension_scores.get("OPENNESS", 0) >= 70:
            career_recs.append("Full-Stack Software Architecture & Cloud DevOps Engineering")
            career_recs.append("Technical Systems Lead / Engineering Management")
        if dimension_scores.get("EXTRAVERSION", 0) >= 65 and dimension_scores.get("AGREEABLENESS", 0) >= 65:
            career_recs.append("Technical Product Management & Developer Relations")
            career_recs.append("STEM Educational Technology & Digital Instruction")
        if dimension_scores.get("CONSCIENTIOUSNESS", 0) >= 75:
            career_recs.append("Database Reliability & Security Compliance Engineering")

        if not career_recs:
            career_recs = ["Applied Technology Specialist", "Technical Analyst"]

        narrative_report = "\n\n".join(report_paragraphs)
        return dimension_scores, summary_code, narrative_report, career_recs

    @classmethod
    def score_holland_riasec(cls, raw_responses: Dict[str, Any], questions: List[DiagnosticQuestion]) -> Tuple[Dict[str, float], str, str, List[str]]:
        """
        Calculates Holland RIASEC interest scores and computes the 3-letter Holland code.
        Returns: (dimension_scores, holland_code, narrative_report, career_recommendations)
        """
        themes = ["REALISTIC", "INVESTIGATIVE", "ARTISTIC", "SOCIAL", "ENTERPRISING", "CONVENTIONAL"]
        theme_scores: Dict[str, List[int]] = {t: [] for t in themes}

        for q in questions:
            dim = q.dimension.upper()
            if dim in theme_scores:
                val = int(raw_responses.get(str(q.id), 3))
                theme_scores[dim].append(max(1, min(5, val)))

        dimension_scores: Dict[str, float] = {}
        for t, scores in theme_scores.items():
            if scores:
                raw_sum = sum(scores)
                min_sum = len(scores) * 1
                max_sum = len(scores) * 5
                norm_pct = round(((raw_sum - min_sum) / (max_sum - min_sum)) * 100, 1) if max_sum > min_sum else 50.0
            else:
                norm_pct = 50.0
            dimension_scores[t] = norm_pct

        # Determine top 3 themes
        sorted_themes = sorted(dimension_scores.items(), key=lambda x: x[1], reverse=True)
        top_3 = sorted_themes[:3]
        holland_code = "".join([t[0][0] for t in top_3])  # e.g. "IRC"

        report_lines = [
            f"**Your Primary Vocational Holland Code:** `{holland_code}`",
            f"1. **{cls.RIASEC_THEME_NAMES.get(top_3[0][0], top_3[0][0])}** ({top_3[0][1]}% affinity)",
            f"2. **{cls.RIASEC_THEME_NAMES.get(top_3[1][0], top_3[1][0])}** ({top_3[1][1]}% affinity)",
            f"3. **{cls.RIASEC_THEME_NAMES.get(top_3[2][0], top_3[2][0])}** ({top_3[2][1]}% affinity)",
        ]

        career_recs = []
        if "I" in holland_code and "R" in holland_code:
            career_recs.append("Cloud Infrastructure, DevOps & Backend Engineering")
            career_recs.append("Robotics & Embedded Systems Engineering")
        if "I" in holland_code and "C" in holland_code:
            career_recs.append("Data Engineering, PostgreSQL Database Architecture & BI Analytics")
        if "A" in holland_code and "R" in holland_code:
            career_recs.append("Frontend Web Engineering & UI/UX Product Design")
        if "S" in holland_code and "E" in holland_code:
            career_recs.append("Educational Technology, Academic Advisory & Training Delivery")

        if not career_recs:
            career_recs = ["Software Development", "Systems Administration", "Digital Business Solutions"]

        return dimension_scores, holland_code, "\n".join(report_lines), career_recs

    @classmethod
    def score_numerical_reasoning(cls, raw_responses: Dict[str, Any], questions: List[DiagnosticQuestion]) -> Tuple[Dict[str, float], str, str, List[str]]:
        """
        Evaluates cognitive, numerical, and logical multiple-choice items.
        """
        total = len(questions)
        correct_count = 0

        for q in questions:
            selected_option = str(raw_responses.get(str(q.id), "")).strip()
            # Check options array for is_correct
            for opt in q.options:
                if str(opt.get("id")) == selected_option and opt.get("is_correct") is True:
                    correct_count += 1
                    break

        accuracy_pct = round((correct_count / total) * 100, 1) if total > 0 else 0.0
        percentile = round(min(99.0, accuracy_pct * 0.98 + 2.0), 1)

        dimension_scores = {
            "NUMERICAL_ACCURACY": accuracy_pct,
            "CORRECT_ITEMS": float(correct_count),
            "TOTAL_ITEMS": float(total),
        }
        summary_code = f"{correct_count}/{total} ({accuracy_pct}%)"

        if accuracy_pct >= 80:
            rating = "Superior Analytical Aptitude"
            narrative = f"Scored {correct_count} of {total} items correct ({accuracy_pct}%). Demonstrates advanced mathematical deduction, sequence extrapolation, and data interpretation skills under time constraints."
        elif accuracy_pct >= 60:
            rating = "Proficient Analytical Aptitude"
            narrative = f"Scored {correct_count} of {total} items correct ({accuracy_pct}%). Solid baseline in numerical problem solving and quantitative reasoning."
        else:
            rating = "Developing Analytical Aptitude"
            narrative = f"Scored {correct_count} of {total} items correct ({accuracy_pct}%). Recommended practice in algorithmic logic, statistical distributions, and quantitative problem sets."

        career_recs = ["Algorithmic Problem Solving", "Data Modeling & Analytics", "Financial & Statistical Systems"]
        return dimension_scores, summary_code, f"**Rating: {rating}**\n\n{narrative}", career_recs

    @classmethod
    def evaluate_and_save_session(
        cls,
        student_id: str,
        assessment_id: str,
        raw_responses: Dict[str, Any],
    ) -> StudentAssessmentSession:
        """Evaluates student answers, executes relevant psychometric algorithm, and stores session."""
        student = StudentProfile.objects.get(id=student_id)
        assessment = DiagnosticAssessment.objects.prefetch_related("questions").get(id=assessment_id)
        questions = list(assessment.questions.all())

        if assessment.assessment_type == AssessmentType.BIG_FIVE:
            dim_scores, summary_code, report, career_recs = cls.score_big_five(raw_responses, questions)
            percentile = Decimal("85.00")
        elif assessment.assessment_type == AssessmentType.HOLLAND_RIASEC:
            dim_scores, summary_code, report, career_recs = cls.score_holland_riasec(raw_responses, questions)
            percentile = Decimal("90.00")
        elif assessment.assessment_type == AssessmentType.NUMERICAL_REASONING:
            dim_scores, summary_code, report, career_recs = cls.score_numerical_reasoning(raw_responses, questions)
            percentile = Decimal(str(dim_scores.get("NUMERICAL_ACCURACY", 75.0)))
        else:
            # General skill diagnostic fallback
            dim_scores, summary_code, report, career_recs = cls.score_numerical_reasoning(raw_responses, questions)
            percentile = Decimal("80.00")

        session = StudentAssessmentSession.objects.create(
            student=student,
            assessment=assessment,
            status="COMPLETED",
            raw_responses=raw_responses,
            dimension_scores=dim_scores,
            summary_code=summary_code,
            percentile_rank=percentile,
            summary_report=report,
            career_recommendations=career_recs,
            completed_at=timezone.now(),
        )

        logger.info(f"Evaluated assessment {assessment.slug} for student {student.matric_number}: Code={summary_code}")
        return session
