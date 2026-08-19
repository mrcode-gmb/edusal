"""
Nigerian Tertiary Curriculum Master Blueprint & Hierarchy Importer Service.
Provides standard NUC CCMAS/BMAS, NBTE, and NCCE discipline catalogs,
pre-populated template generators, and bulk hierarchy provisioning.
"""

from typing import Any, Dict, List, Optional
import io
import csv
from django.db import transaction
from nexus.institutions.models import (
    Institution,
    AcademicDivision,
    Department,
    AcademicProgram,
    AwardLevel,
    TierTwoTerm,
    SiwesPatternChoice,
    SiwesAcademicImpactChoice,
)

# ---------------------------------------------------------------------------
# Master Catalog of Standard Nigerian Higher Education Faculties & Programs
# ---------------------------------------------------------------------------

NIGERIAN_MASTER_CATALOG: Dict[str, Dict[str, Any]] = {
    "ENG": {
        "name": "Faculty of Engineering & Technology",
        "code": "ENG",
        "division_type": "FACULTY",
        "archetypes": ["UNIVERSITY_COMPREHENSIVE", "UNIVERSITY_TECHNOLOGY"],
        "departments": [
            {
                "name": "Department of Mechanical Engineering",
                "code": "MEE",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Eng Mechanical Engineering",
                        "code": "BENG-MEE",
                        "award_level": AwardLevel.BENG,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    },
                    {
                        "name": "B.Eng Mechatronics Engineering",
                        "code": "BENG-MTR",
                        "award_level": AwardLevel.BENG,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    },
                ],
            },
            {
                "name": "Department of Civil Engineering",
                "code": "CVE",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Eng Civil Engineering",
                        "code": "BENG-CVE",
                        "award_level": AwardLevel.BENG,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    }
                ],
            },
            {
                "name": "Department of Electrical & Electronics Engineering",
                "code": "EEE",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Eng Electrical & Electronics Engineering",
                        "code": "BENG-EEE",
                        "award_level": AwardLevel.BENG,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    }
                ],
            },
            {
                "name": "Department of Chemical Engineering",
                "code": "CHE",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Eng Chemical Engineering",
                        "code": "BENG-CHE",
                        "award_level": AwardLevel.BENG,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    }
                ],
            },
            {
                "name": "Department of Computer Engineering",
                "code": "CPE",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Eng Computer Engineering",
                        "code": "BENG-CPE",
                        "award_level": AwardLevel.BENG,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    }
                ],
            },
        ],
    },
    "CMP": {
        "name": "Faculty of Computing & Information Technology",
        "code": "CMP",
        "division_type": "FACULTY",
        "archetypes": ["UNIVERSITY_COMPREHENSIVE", "UNIVERSITY_TECHNOLOGY"],
        "departments": [
            {
                "name": "Department of Computer Science",
                "code": "CSC",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc Computer Science",
                        "code": "BSC-CSC",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SEM2_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [3],
                    }
                ],
            },
            {
                "name": "Department of Cybersecurity",
                "code": "CYB",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc Cybersecurity",
                        "code": "BSC-CYB",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SEM2_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [3],
                    }
                ],
            },
            {
                "name": "Department of Software Engineering",
                "code": "SWE",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc Software Engineering",
                        "code": "BSC-SWE",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SEM2_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [3],
                    }
                ],
            },
            {
                "name": "Department of Information Technology",
                "code": "IFT",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc Information Technology",
                        "code": "BSC-IFT",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SEM2_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [3],
                    }
                ],
            },
        ],
    },
    "SCI": {
        "name": "Faculty of Physical & Natural Sciences",
        "code": "SCI",
        "division_type": "FACULTY",
        "archetypes": ["UNIVERSITY_COMPREHENSIVE", "UNIVERSITY_TECHNOLOGY"],
        "departments": [
            {
                "name": "Department of Biochemistry",
                "code": "BCH",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc Biochemistry",
                        "code": "BSC-BCH",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SEM2_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [3],
                    }
                ],
            },
            {
                "name": "Department of Microbiology",
                "code": "MCB",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc Microbiology",
                        "code": "BSC-MCB",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SEM2_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [3],
                    }
                ],
            },
            {
                "name": "Department of Pure & Applied Chemistry",
                "code": "CHM",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc Industrial Chemistry",
                        "code": "BSC-ICH",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SPLIT_200L_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.VACATION_ONLY,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [2, 3],
                    },
                    {
                        "name": "B.Sc Pure Chemistry",
                        "code": "BSC-CHM",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SPLIT_200L_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.VACATION_ONLY,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [2, 3],
                    },
                ],
            },
            {
                "name": "Department of Physics",
                "code": "PHY",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc Physics with Electronics",
                        "code": "BSC-PHE",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SEM2_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [3],
                    }
                ],
            },
        ],
    },
    "ENV": {
        "name": "Faculty of Environmental Sciences",
        "code": "ENV",
        "division_type": "FACULTY",
        "archetypes": ["UNIVERSITY_COMPREHENSIVE", "UNIVERSITY_TECHNOLOGY"],
        "departments": [
            {
                "name": "Department of Architecture",
                "code": "ARC",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc Architecture",
                        "code": "BSC-ARC",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.SPLIT_200L_300L,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.VACATION_ONLY,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [2, 3],
                    }
                ],
            },
            {
                "name": "Department of Quantity Surveying",
                "code": "QSV",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Tech Quantity Surveying",
                        "code": "BTECH-QSV",
                        "award_level": AwardLevel.BTECH,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    }
                ],
            },
            {
                "name": "Department of Urban & Regional Planning",
                "code": "URP",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Tech Urban & Regional Planning",
                        "code": "BTECH-URP",
                        "award_level": AwardLevel.BTECH,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    }
                ],
            },
        ],
    },
    "AGR": {
        "name": "Faculty of Agriculture & Food Security",
        "code": "AGR",
        "division_type": "FACULTY",
        "archetypes": ["UNIVERSITY_COMPREHENSIVE", "UNIVERSITY_TECHNOLOGY"],
        "departments": [
            {
                "name": "Department of Agronomy & Crop Science",
                "code": "CRP",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Agric Agronomy",
                        "code": "BAGR-CRP",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.FULL_SESSION_ATTACHMENT,
                        "siwes_duration_months": 9,
                        "siwes_target_levels": [4],
                    }
                ],
            },
            {
                "name": "Department of Animal Science",
                "code": "ANS",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Agric Animal Science",
                        "code": "BAGR-ANS",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.FULL_SESSION_ATTACHMENT,
                        "siwes_duration_months": 9,
                        "siwes_target_levels": [4],
                    }
                ],
            },
        ],
    },
    "MGT": {
        "name": "Faculty of Management Sciences",
        "code": "MGT",
        "division_type": "FACULTY",
        "archetypes": ["UNIVERSITY_COMPREHENSIVE"],
        "departments": [
            {
                "name": "Department of Business Administration",
                "code": "BUS",
                "siwes_eligible": False,
                "programs": [
                    {
                        "name": "B.Sc Business Administration",
                        "code": "BSC-BUS",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.EXEMPT,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.EXEMPT,
                        "siwes_duration_months": 0,
                        "siwes_target_levels": [],
                    }
                ],
            },
            {
                "name": "Department of Accounting",
                "code": "ACC",
                "siwes_eligible": False,
                "programs": [
                    {
                        "name": "B.Sc Accounting",
                        "code": "BSC-ACC",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.EXEMPT,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.EXEMPT,
                        "siwes_duration_months": 0,
                        "siwes_target_levels": [],
                    }
                ],
            },
        ],
    },
    "BMS": {
        "name": "Faculty of Basic Medical & Allied Health Sciences",
        "code": "BMS",
        "division_type": "FACULTY",
        "archetypes": ["UNIVERSITY_COMPREHENSIVE", "UNIVERSITY_TECHNOLOGY"],
        "departments": [
            {
                "name": "Department of Medical Laboratory Science",
                "code": "MLS",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.MLS Medical Laboratory Science",
                        "code": "BMLS-MLS",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    }
                ],
            },
            {
                "name": "Department of Nursing Science",
                "code": "NUR",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.N.Sc Nursing Science",
                        "code": "BNSC-NUR",
                        "award_level": AwardLevel.BSC,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.YEAR4_400L_EXTENDED,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 6,
                        "siwes_target_levels": [4],
                    }
                ],
            },
        ],
    },
    "LAW": {
        "name": "Faculty of Law",
        "code": "LAW",
        "division_type": "FACULTY",
        "archetypes": ["UNIVERSITY_COMPREHENSIVE"],
        "departments": [
            {
                "name": "Department of Public & Commercial Law",
                "code": "PCL",
                "siwes_eligible": False,
                "programs": [
                    {
                        "name": "LL.B Bachelor of Laws",
                        "code": "LLB-LAW",
                        "award_level": AwardLevel.BA,
                        "duration_years": 5,
                        "siwes_pattern": SiwesPatternChoice.EXEMPT,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.EXEMPT,
                        "siwes_duration_months": 0,
                        "siwes_target_levels": [],
                    }
                ],
            }
        ],
    },
    "EDU": {
        "name": "Faculty of Education",
        "code": "EDU",
        "division_type": "FACULTY",
        "archetypes": ["UNIVERSITY_COMPREHENSIVE", "COLLEGE_OF_EDUCATION"],
        "departments": [
            {
                "name": "Department of Science Education",
                "code": "SED",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Sc (Ed) Computer Science Education",
                        "code": "BED-CSC",
                        "award_level": AwardLevel.BED,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.TEACHING_PRACTICE,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 3,
                        "siwes_target_levels": [3],
                    }
                ],
            },
            {
                "name": "Department of Vocational & Technical Education",
                "code": "VTE",
                "siwes_eligible": True,
                "programs": [
                    {
                        "name": "B.Tech (Ed) Electrical Technology Education",
                        "code": "BED-EED",
                        "award_level": AwardLevel.BED,
                        "duration_years": 4,
                        "siwes_pattern": SiwesPatternChoice.TEACHING_PRACTICE,
                        "siwes_academic_impact": SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
                        "siwes_duration_months": 3,
                        "siwes_target_levels": [3],
                    }
                ],
            },
        ],
    },
}


# ---------------------------------------------------------------------------
# Blueprint Querying & Provisioning Functions
# ---------------------------------------------------------------------------

def get_master_blueprints(archetype: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns the structured master catalog filtered optionally by institutional archetype.
    """
    results = []
    for code, faculty_data in NIGERIAN_MASTER_CATALOG.items():
        if archetype and archetype not in faculty_data["archetypes"]:
            continue
        
        dept_count = len(faculty_data["departments"])
        prog_count = sum(len(d["programs"]) for d in faculty_data["departments"])
        siwes_dept_count = sum(1 for d in faculty_data["departments"] if d["siwes_eligible"])

        results.append({
            "key": code,
            "name": faculty_data["name"],
            "code": faculty_data["code"],
            "division_type": faculty_data["division_type"],
            "archetypes": faculty_data["archetypes"],
            "departments_count": dept_count,
            "programs_count": prog_count,
            "siwes_departments_count": siwes_dept_count,
            "departments": faculty_data["departments"],
        })
    return results


def import_blueprint_to_institution(
    institution: Institution,
    division_keys: List[str],
) -> Dict[str, int]:
    """
    Idempotently deploys selected blueprint faculties, departments, and degree programmes
    into the specified Institution in an atomic transaction.
    """
    stats = {
        "divisions_created": 0,
        "divisions_reused": 0,
        "departments_created": 0,
        "departments_reused": 0,
        "programs_created": 0,
        "programs_reused": 0,
    }

    import_all = "ALL" in division_keys or not division_keys

    with transaction.atomic():
        for code, faculty_data in NIGERIAN_MASTER_CATALOG.items():
            if not import_all and code not in division_keys:
                continue

            # 1. Get or create Division
            division, div_created = AcademicDivision.objects.get_or_create(
                institution=institution,
                name=faculty_data["name"],
                defaults={
                    "code": faculty_data["code"],
                    "division_type": faculty_data["division_type"],
                    "is_active": True,
                },
            )
            if div_created:
                stats["divisions_created"] += 1
            else:
                stats["divisions_reused"] += 1

            # 2. Get or create Departments
            for dept_data in faculty_data["departments"]:
                department, dept_created = Department.objects.get_or_create(
                    division=division,
                    name=dept_data["name"],
                    defaults={
                        "institution": institution,
                        "code": dept_data["code"],
                        "siwes_eligible": dept_data["siwes_eligible"],
                        "is_active": True,
                    },
                )
                if dept_created:
                    stats["departments_created"] += 1
                else:
                    stats["departments_reused"] += 1

                # 3. Get or create Academic Programmes
                for prog_data in dept_data["programs"]:
                    program, prog_created = AcademicProgram.objects.get_or_create(
                        department=department,
                        name=prog_data["name"],
                        defaults={
                            "institution": institution,
                            "program_code": prog_data["code"],
                            "award_level": prog_data["award_level"],
                            "duration_years": prog_data["duration_years"],
                            "siwes_duration_months": prog_data["siwes_duration_months"],
                            "siwes_pattern": prog_data.get("siwes_pattern", SiwesPatternChoice.SEM2_300L),
                            "siwes_academic_impact": prog_data.get(
                                "siwes_academic_impact", SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE
                            ),
                            "siwes_target_levels": prog_data.get("siwes_target_levels", []),
                            "is_active": True,
                        },
                    )
                    if prog_created:
                        stats["programs_created"] += 1
                    else:
                        stats["programs_reused"] += 1

    return stats


def generate_hierarchy_csv(prepopulate: bool = True, archetype: Optional[str] = None) -> str:
    """
    Generates a pre-populated or empty CSV spreadsheet template with standard columns.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    headers = [
        "division_name",
        "division_code",
        "division_type",
        "dean_name",
        "dean_email",
        "department_name",
        "department_code",
        "hod_name",
        "hod_email",
        "siwes_eligible",
        "program_name",
        "program_code",
        "award_level",
        "duration_years",
        "siwes_duration_months",
        "siwes_pattern",
    ]
    writer.writerow(headers)

    if prepopulate:
        for code, faculty_data in NIGERIAN_MASTER_CATALOG.items():
            if archetype and archetype not in faculty_data["archetypes"]:
                continue
            for dept in faculty_data["departments"]:
                for prog in dept["programs"]:
                    writer.writerow([
                        faculty_data["name"],
                        faculty_data["code"],
                        faculty_data["division_type"],
                        "",  # dean_name left for admin to customize
                        "",  # dean_email
                        dept["name"],
                        dept["code"],
                        "",  # hod_name left for admin to customize
                        "",  # hod_email
                        "TRUE" if dept["siwes_eligible"] else "FALSE",
                        prog["name"],
                        prog["code"],
                        prog["award_level"],
                        prog["duration_years"],
                        prog["siwes_duration_months"],
                        prog.get("siwes_pattern", SiwesPatternChoice.SEM2_300L),
                    ])

    return output.getvalue()
