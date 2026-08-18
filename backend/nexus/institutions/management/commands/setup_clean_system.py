import sys
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from nexus.institutions.models import (
    Institution,
    InstitutionStaff,
    StaffAssignment,
    StudentProfile,
    AcademicDivision,
    Department,
    AcademicProgram,
    AcademicSession,
    InstitutionalDocument,
    InstitutionalDocumentChunk,
    Pathway,
    PathwayMilestone,
    StudentMilestoneSubmission,
    DiagnosticAssessment,
    DiagnosticQuestion,
    StudentAssessmentSession,
    AICoachConversation,
    AICoachMessage,
    CounsellingSession,
    CounsellingCaseNote,
    CompanyBankDetail,
    PricingPlan,
    InstitutionInvoice,
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Clears all dummy seed data and initializes clean System Admin, Bank Details, and Pricing Plans.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Clearing all demo institutions, staff, students, and invoices...'))

        # Delete transactional and operational data
        CounsellingCaseNote.objects.all().delete()
        CounsellingSession.objects.all().delete()
        AICoachMessage.objects.all().delete()
        AICoachConversation.objects.all().delete()
        StudentAssessmentSession.objects.all().delete()
        DiagnosticQuestion.objects.all().delete()
        DiagnosticAssessment.objects.all().delete()
        StudentMilestoneSubmission.objects.all().delete()
        PathwayMilestone.objects.all().delete()
        Pathway.objects.all().delete()
        InstitutionalDocumentChunk.objects.all().delete()
        InstitutionalDocument.objects.all().delete()
        StudentProfile.objects.all().delete()
        StaffAssignment.objects.all().delete()
        InstitutionStaff.objects.all().delete()
        AcademicProgram.objects.all().delete()
        Department.objects.all().delete()
        AcademicDivision.objects.all().delete()
        AcademicSession.objects.all().delete()
        InstitutionInvoice.objects.all().delete()
        Institution.objects.all().delete()

        # Delete non-superuser users
        deleted_users_count, _ = User.objects.filter(is_superuser=False).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted_users_count} non-superuser accounts.'))

        # Ensure System Superadmin exists
        admin_email = 'admin@nexus.com'
        admin_user = User.objects.filter(email=admin_email).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                email=admin_email,
                name='Nexus System Administrator',
                password='admin123456',
            )
            self.stdout.write(self.style.SUCCESS(f'Created System Superadmin: {admin_email} / admin123456'))
        else:
            admin_user.set_password('admin123456')
            admin_user.name = 'Nexus System Administrator'
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated System Superadmin: {admin_email} / admin123456'))

        # Setup Company Bank Details
        CompanyBankDetail.objects.all().delete()
        bank = CompanyBankDetail.objects.create(
            account_name='Nexus Edutech Consult Ltd',
            bank_name='Zenith Bank Plc',
            account_number='1228490211',
            sort_code_or_swift='057150013',
            currency='NGN',
            payment_instructions='Please include your Institution Name and Invoice Reference in the transfer narration/remark. Once transfer is completed, upload your payment receipt directly to the portal for administrative activation.',
            support_email='billing@nexus.ng',
            support_phone='+234 (0) 800 000 NEXUS',
            is_active=True,
        )
        self.stdout.write(self.style.SUCCESS(f'Initialized Company Bank Account: {bank.bank_name} - {bank.account_number} ({bank.account_name})'))

        # Setup Pricing Plans
        PricingPlan.objects.all().delete()
        plans = [
            PricingPlan(
                code='foundation',
                name='Foundation Tier',
                target_institution_type='Colleges of Education & Specialist Monotechnics',
                description='Essential career services and milestone tracking for smaller institutions.',
                base_fee=500000.00,
                setup_onboarding_fee=100000.00,
                max_students=2500,
                currency='NGN',
                billing_cycle='ANNUAL',
                features=[
                    'Sponsored onboarding & faculty calibration',
                    'Up to 2,500 student seats',
                    'Core assessments & milestone pathways',
                    'Standard email support SLA',
                ],
                is_active=True,
            ),
            PricingPlan(
                code='standard',
                name='Standard Tier',
                target_institution_type='State Universities, Polytechnics & Private Institutions',
                description='Comprehensive employability OS with complete analytics and counsellor tooling.',
                base_fee=1500000.00,
                setup_onboarding_fee=150000.00,
                max_students=8000,
                currency='NGN',
                billing_cycle='ANNUAL',
                features=[
                    'Sponsored onboarding & faculty calibration',
                    'Up to 8,000 student seats',
                    'All modules + analytics studio',
                    'Priority support & counsellor training',
                ],
                is_active=True,
            ),
            PricingPlan(
                code='flagship',
                name='Flagship Enterprise Tier',
                target_institution_type='Federal Universities & Flagship Multidisciplinary Campuses',
                description='Full-scale enterprise deployment with unlimited student capacity and dedicated success engineering.',
                base_fee=3500000.00,
                setup_onboarding_fee=250000.00,
                max_students=50000,
                currency='NGN',
                billing_cycle='ANNUAL',
                features=[
                    'Sponsored onboarding & on-site faculty workshops',
                    'Unlimited student seats',
                    'SSO / SAML integration & custom SLA',
                    'Dedicated institutional success manager',
                ],
                is_active=True,
            ),
        ]
        PricingPlan.objects.bulk_create(plans)
        self.stdout.write(self.style.SUCCESS(f'Initialized {len(plans)} Pricing Plans (Foundation, Standard, Flagship).'))

        self.stdout.write(self.style.SUCCESS('--- CLEAN SYSTEM READY FOR MANUAL REGISTRATION AND PAYMENT TESTING ---'))
