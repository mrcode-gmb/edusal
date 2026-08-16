from types import SimpleNamespace
import pytest
from rest_framework import status
from django.contrib.auth import get_user_model
from edusal.institutions.models import (
    DiagnosticAssessment,
    DiagnosticQuestion,
    StudentAssessmentSession,
    AICoachConversation,
    AICoachMessage,
    CounsellingSession,
    CounsellingCaseNote,
    Institution,
    AcademicDivision,
    Department,
    AcademicProgram,
    AcademicSession,
    StudentProfile,
    InstitutionStaff,
    InstitutionRole,
)
from edusal.institutions.services.psychometric_service import PsychometricService

from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
class TestPsychometricEngine:
    def test_big_five_scoring(self):
        # 4 items: 2 normal (values 5, 4), 2 inverted (raw 1 -> scored 5, raw 2 -> scored 4)
        questions = [
            SimpleNamespace(id='q1', dimension='OPENNESS', is_reverse_scored=False),
            SimpleNamespace(id='q2', dimension='OPENNESS', is_reverse_scored=False),
            SimpleNamespace(id='q3', dimension='OPENNESS', is_reverse_scored=True),
            SimpleNamespace(id='q4', dimension='OPENNESS', is_reverse_scored=True),
        ]
        responses = {'q1': 5, 'q2': 4, 'q3': 1, 'q4': 2}
        
        scores, summary_code, report, recs = PsychometricService.score_big_five(responses, questions)
        assert 'OPENNESS' in scores
        assert scores['OPENNESS'] >= 85
        assert len(summary_code) > 0
        assert len(recs) > 0

    def test_holland_riasec_scoring(self):
        questions = [
            SimpleNamespace(id='q1', dimension='INVESTIGATIVE'),
            SimpleNamespace(id='q2', dimension='INVESTIGATIVE'),
            SimpleNamespace(id='q3', dimension='REALISTIC'),
            SimpleNamespace(id='q4', dimension='CONVENTIONAL'),
        ]
        responses = {'q1': 5, 'q2': 5, 'q3': 4, 'q4': 3}
        
        scores, holland_code, report, recs = PsychometricService.score_holland_riasec(responses, questions)
        assert 'I' in holland_code
        assert scores['INVESTIGATIVE'] == 100
        assert len(recs) > 0

    def test_numerical_reasoning_scoring(self):
        questions = [
            SimpleNamespace(id='q1', options=[{'id': 'B', 'is_correct': True}, {'id': 'A', 'is_correct': False}]),
            SimpleNamespace(id='q2', options=[{'id': 'C', 'is_correct': True}, {'id': 'A', 'is_correct': False}]),
            SimpleNamespace(id='q3', options=[{'id': 'A', 'is_correct': True}, {'id': 'B', 'is_correct': False}]),
        ]
        responses = {'q1': 'B', 'q2': 'C', 'q3': 'D'}
        
        scores, summary_code, report, recs = PsychometricService.score_numerical_reasoning(responses, questions)
        assert '2/3' in summary_code
        assert scores['NUMERICAL_ACCURACY'] == 66.7
        assert len(recs) > 0


@pytest.mark.django_db
class TestDiagnosticsAndCounsellingAPI:
    @pytest.fixture
    def setup_data(self):
        inst = Institution.objects.create(
            name="Federal University of Technology Minna",
            short_name="FUTMINNA",
            slug="futminna-test",
            institution_type="UNIVERSITY",
        )
        div = AcademicDivision.objects.create(
            institution=inst,
            name="School of Information and Communication Technology",
            code="SICT",
            division_type="FACULTY",
        )
        dept = Department.objects.create(
            institution=inst,
            division=div,
            name="Department of Computer Science",
            code="CSC",
        )
        prog = AcademicProgram.objects.create(
            institution=inst,
            department=dept,
            name="B.Tech Software Engineering",
            program_code="SWE",
            duration_years=5,
        )
        sess = AcademicSession.objects.create(
            institution=inst,
            session_label="2025/2026",
            start_date="2025-10-01",
            end_date="2026-07-31",
            is_current=True,
        )
        
        # Student User
        student_user = User.objects.create_user(
            email="amina.test@futminna.edu.ng",
            name="Amina Bello Test",
            password="password123",
        )
        student_profile = StudentProfile.objects.create(
            user=student_user,
            institution=inst,
            program=prog,
            matric_number="SWE/2022/9999",
            entry_session=sess,
            entry_mode="UTME_100L",
            year_of_study=4,
            employability_score=85.0,
            verified_points_total=240,
        )

        # Staff Counsellor User
        staff_user = User.objects.create_user(
            email="counsellor.test@futminna.edu.ng",
            name="Dr. Faruq Umar Test",
            password="password123",
        )
        staff_profile = InstitutionStaff.objects.create(
            user=staff_user,
            institution=inst,
            department=dept,
            role=InstitutionRole.COUNSELLOR,
            title="Departmental Career Advisor",
        )

        # Create Big Five Assessment
        assessment = DiagnosticAssessment.objects.create(
            institution=inst,
            title="Standard Big Five Workplace Personality Profile",
            slug="big-five-personality-test",
            assessment_type="BIG_FIVE",
            estimated_minutes=10,
        )
        q1 = DiagnosticQuestion.objects.create(
            assessment=assessment,
            dimension="OPENNESS",
            prompt="I have a vivid imagination and enjoy novel challenges.",
            question_type="LIKERT_5",
            order_index=1,
        )

        return {
            'inst': inst,
            'dept': dept,
            'student_user': student_user,
            'student_profile': student_profile,
            'staff_user': staff_user,
            'staff_profile': staff_profile,
            'assessment': assessment,
            'q1': q1,
        }

    def test_list_and_query_assessments(self, setup_data):
        client = APIClient()
        client.force_authenticate(user=setup_data['student_user'])
        
        res = client.get('/api/diagnostic-assessments/')
        assert res.status_code == status.HTTP_200_OK
        assert len(res.data) >= 1

        # Get questions
        slug = setup_data['assessment'].slug
        res_q = client.get(f'/api/diagnostic-assessments/{slug}/questions/')
        assert res_q.status_code == status.HTTP_200_OK
        assert len(res_q.data) >= 1

    def test_submit_diagnostic_assessment(self, setup_data):
        client = APIClient()
        client.force_authenticate(user=setup_data['student_user'])
        
        payload = {
            'assessment_id': str(setup_data['assessment'].id),
            'raw_responses': {
                str(setup_data['q1'].id): 5,
            },
        }
        res = client.post('/api/student-assessments/', payload, format='json')
        assert res.status_code == status.HTTP_201_CREATED
        assert 'summary_code' in res.data
        assert 'dimension_scores' in res.data

        # Check my-results
        res_results = client.get('/api/student-assessments/my-results/')
        assert res_results.status_code == status.HTTP_200_OK
        assert len(res_results.data) >= 1

    def test_counselling_sessions_and_dossier(self, setup_data):
        client = APIClient()
        client.force_authenticate(user=setup_data['student_user'])

        # 1. Check available counsellors
        res_counsellors = client.get(f"/api/counselling-sessions/available-counsellors/?institution={setup_data['inst'].id}")
        assert res_counsellors.status_code == status.HTTP_200_OK
        assert len(res_counsellors.data) >= 1

        # 2. Book session
        book_payload = {
            'counsellor': str(setup_data['staff_profile'].id),
            'topic': 'SIWES_CLEARANCE',
            'student_notes': 'Need clearance guidance for ITCC Form 08',
            'preferred_date': '2026-08-20',
            'preferred_time_slot': '10:00 AM - 10:45 AM',
            'meeting_mode': 'IN_PERSON',
        }
        res_book = client.post('/api/counselling-sessions/', book_payload, format='json')
        assert res_book.status_code == status.HTTP_201_CREATED
        session_id = res_book.data['id']

        # 3. Staff adds case note
        client.force_authenticate(user=setup_data['staff_user'])
        note_payload = {
            'student': str(setup_data['student_profile'].id),
            'session': session_id,
            'summary': 'Discussed SIWES Form 08 and approved logbook entries.',
            'action_items': [{'task': 'Submit final stamped logbook by Friday', 'done': False}],
            'is_confidential': True,
        }
        res_note = client.post('/api/counselling-case-notes/', note_payload, format='json')
        assert res_note.status_code == status.HTTP_201_CREATED

        # 4. Staff fetches 360 student dossier
        res_dossier = client.get(f"/api/students/{setup_data['student_profile'].id}/dossier/")
        assert res_dossier.status_code == status.HTTP_200_OK
        dossier = res_dossier.data
        assert 'profile' in dossier
        assert 'case_notes' in dossier
        assert len(dossier['case_notes']) >= 1
        assert dossier['employability_summary']['employability_score'] >= 80.0

