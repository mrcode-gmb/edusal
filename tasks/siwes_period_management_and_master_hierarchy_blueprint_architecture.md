# SIWES Period Management & Master Hierarchy Blueprint Architecture

**Document Title**: Comprehensive Architectural Plan for Multi-Pattern SIWES Period Management and Master Nigerian University Hierarchy Blueprints  
**Target Platform**: Nexus Edutech Platform  
**Target Roles**: Institutional Administrators, Registrars, Deans, SIWES Directors, Faculty Evaluators  
**File Location**: `/tasks/siwes_period_management_and_master_hierarchy_blueprint_architecture.md`  

---

## 1. Context & Business Requirements

Higher institutions across Nigeria (Universities, Polytechnics, and Colleges of Education) operate under distinct academic models with varying **SIWES (Students Industrial Work Experience Scheme)** structures and **academic hierarchy** layouts.

### 1.1 Core Challenges Addressed
1. **Diverse SIWES Timelines**:
   - **Split Vacations**: 3 months at the end of 200 Level (Long vacation) + 3 months at the end of 300 Level (Long vacation). *No regular academic semester is disrupted.*
   - **Single Semester Continuous**: 6 continuous months during the Second Semester of 300 Level + Long vacation (standard 4-year B.Sc. in sciences and computing).
   - **Extended Industrial Attachment**: 6 to 9/12 months starting in 400 Level for 5-year B.Eng/B.Tech/Agriculture programs, returning to campus for 500 Level (Final Year).
   - **Polytechnic ND/HND Cycles**: 3–4 months vacation attachment during ND, plus mandatory 1-year post-ND industrial training before HND admission.
   - **Exempt / Non-SIWES**: Law, Arts, Pure Humanities, Accounting (0 months).
2. **Effortless 4-Tier Hierarchy Setup**:
   - Providing a **National Master Catalog** of Nigerian universities, polytechnics, and colleges at the system level.
   - **Strategy 1 (Pre-Populated Excel/CSV Importer)**: Pre-filled spreadsheets with standard faculties and programs that admins can customize (add HOD/Dean info, delete unneeded rows, upload).
   - **Strategy 2 (Direct Blueprint Selector)**: In-app checkbox tree to import standard NUC CCMAS/BMAS faculty bundles with 1 click.

---

## 2. Review of Current SIWES Tracking State in Codebase

### 2.1 Current Backend Model
- **Department (`Department`)**:
  - `siwes_eligible`: Boolean flag (`True`/`False`).
- **Academic Programme (`AcademicProgram`)**:
  - `duration_years`: Integer (`4`, `5`, `2`, `3`).
  - `siwes_duration_months`: Simple integer (`6` or `0`). *Lacks calendar placement rules, vacation vs. semester impact, and level milestones.*
- **Student Profile (`StudentProfile`)**:
  - `siwes_clearance_status`: Choices (`NOT_ELIGIBLE`, `QUALIFYING`, `CLEARED`, `ON_ATTACHMENT`, `COMPLETED`).
  - `is_siwes_year`: Hardcoded check (`year == 4 for 5-yr`, `year == 3 for 4-yr`, `year == 2 for ND`). *Fails for split vacation patterns (200L + 300L) and non-standard schedules.*

### 2.2 Current Frontend State
- `AcademicHierarchyTree.tsx`: Shows simple badge `"SIWES Eligible"` or `"Not Eligible"`.
- `StudentRoster.tsx`: Filters by `"Qualifying (SIWES Year)"` based on static `is_siwes_year`.
- `StudentDashboard.tsx`: Displays SIWES clearance status card when `is_siwes_year` is true.
- `GovernancePulse.tsx`: Calculates departmental SIWES eligibility ratio (e.g. `60%`).

---

## 3. Upgraded SIWES Period Management Architecture

### 3.1 SIWES Pattern Taxonomy (`SiwesPatternChoice`)

To capture all institutional permutations without disrupting academic calendars, we introduce formal SIWES patterns:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SIWES OPERATIONAL PATTERNS                                     │
├──────────────────────────┬────────────────────────────┬──────────────────┬───────────────────────┤
│ Pattern Code             │ Target Levels / Semesters  │ Total Duration   │ Calendar Impact       │
├──────────────────────────┼────────────────────────────┼──────────────────┼───────────────────────┤
│ SPLIT_200L_300L          │ 200L Vacation + 300L Vac   │ 6 Months (3+3)   │ Vacation Only (No Sem)│
│ SEM2_300L                │ 300L Second Semester + Vac │ 6 Months         │ Replaces 300L Sem 2   │
│ YEAR4_400L_EXTENDED      │ 400L Sem 2 to 500L Entry   │ 6 to 9 Months    │ Extended Industrial Yr│
│ ND_VACATION              │ ND I Long Vacation         │ 3 to 4 Months    │ Vacation Only         │
│ POST_ND_MANDATORY        │ Post-ND Pre-HND Internship │ 12 Months        │ Full Gap Year         │
│ TEACHING_PRACTICE        │ 300L or 400L Practicum     │ 3 to 6 Months    │ In-Session Practicum  │
│ EXEMPT                   │ None                       │ 0 Months         │ Exempt                │
└──────────────────────────┴────────────────────────────┴──────────────────┴───────────────────────┘
```

### 3.2 Enhanced `AcademicProgram` Model Schema

```python
class SiwesPatternChoice(models.TextChoices):
    SPLIT_200L_300L = "SPLIT_200L_300L", "Split Vacation (3 Mo @ 200L End + 3 Mo @ 300L End)"
    SEM2_300L = "SEM2_300L", "300 Level Second Semester (6 Months Continuous)"
    YEAR4_400L_EXTENDED = "YEAR4_400L_EXTENDED", "400 Level Extended (6 to 9 Months Attachment)"
    ND_VACATION = "ND_VACATION", "ND Industrial Attachment (3 to 4 Months Vacation)"
    POST_ND_MANDATORY = "POST_ND_MANDATORY", "Post-ND Mandatory Industrial Training (12 Months)"
    TEACHING_PRACTICE = "TEACHING_PRACTICE", "Teaching Practice / Practicum (3 to 6 Months)"
    EXEMPT = "EXEMPT", "Exempt / Non-Participating (0 Months)"


class SiwesAcademicImpactChoice(models.TextChoices):
    VACATION_ONLY = "VACATION_ONLY", "Vacation Only (Zero Academic Semester Disruption)"
    SECOND_SEMESTER_SUBSTITUTE = "SECOND_SEMESTER_SUBSTITUTE", "Replaces Second Semester Coursework"
    FULL_SESSION_ATTACHMENT = "FULL_SESSION_ATTACHMENT", "Replaces Full Academic Session"
    EXEMPT = "EXEMPT", "No Academic Impact"


# Added to AcademicProgram:
siwes_pattern = models.CharField(
    max_length=35,
    choices=SiwesPatternChoice.choices,
    default=SiwesPatternChoice.SEM2_300L,
    help_text="Operational timeline and calendar structure for student industrial training",
)
siwes_academic_impact = models.CharField(
    max_length=35,
    choices=SiwesAcademicImpactChoice.choices,
    default=SiwesAcademicImpactChoice.SECOND_SEMESTER_SUBSTITUTE,
    help_text="Specifies whether SIWES runs purely during vacation or substitutes academic terms",
)
siwes_target_levels = models.JSONField(
    default=list,
    help_text="List of qualifying level numbers (e.g. [2, 3] for split or [4] for 400L)",
)
```

### 3.3 Dynamic Student Profile Evaluation

```python
@property
def is_siwes_qualifying_year(self) -> bool:
    """Accurately checks if the student's current year of study qualifies for SIWES."""
    pattern = self.program.siwes_pattern
    year = self.year_of_study

    if pattern == SiwesPatternChoice.SPLIT_200L_300L:
        return year in [2, 3]  # Eligible after 200L and 300L
    elif pattern == SiwesPatternChoice.SEM2_300L:
        return year == 3
    elif pattern == SiwesPatternChoice.YEAR4_400L_EXTENDED:
        return year == 4
    elif pattern == SiwesPatternChoice.ND_VACATION:
        return year == 1 or year == 2
    return False
```

---

## 4. Master Nigerian Hierarchy Catalog & Blueprint Library Architecture

### 4.1 System-Level National University Master Catalog

At the platform system level, we store a structured catalog containing standard NUC CCMAS disciplines:

```
├── Faculty of Engineering & Technology (ENG)
│   ├── Department of Mechanical Engineering (MEE) [SIWES: 400L Extended, 6-9 mo]
│   │   └── B.Eng Mechanical Engineering (5 yrs)
│   ├── Department of Civil Engineering (CVE) [SIWES: 400L Extended, 6-9 mo]
│   │   └── B.Eng Civil Engineering (5 yrs)
│   ├── Department of Electrical & Electronics Engineering (EEE) [SIWES: 400L Extended, 6-9 mo]
│   │   └── B.Eng Electrical & Electronics Engineering (5 yrs)
│   └── Department of Chemical Engineering (CHE) [SIWES: 400L Extended, 6-9 mo]
│       └── B.Eng Chemical Engineering (5 yrs)
│
├── Faculty of Computing & Information Technology (CMP)
│   ├── Department of Computer Science (CSC) [SIWES: 300L Sem 2, 6 mo]
│   │   └── B.Sc Computer Science (4 yrs)
│   ├── Department of Cybersecurity (CYB) [SIWES: 300L Sem 2, 6 mo]
│   │   └── B.Sc Cybersecurity (4 yrs)
│   ├── Department of Software Engineering (SWE) [SIWES: 300L Sem 2, 6 mo]
│   │   └── B.Sc Software Engineering (4 yrs)
│   └── Department of Information Technology (IFT) [SIWES: 300L Sem 2, 6 mo]
│       └── B.Sc Information Technology (4 yrs)
│
├── Faculty of Science (SCI)
│   ├── Department of Biochemistry (BCH) [SIWES: 300L Sem 2, 6 mo]
│   │   └── B.Sc Biochemistry (4 yrs)
│   ├── Department of Microbiology (MCB) [SIWES: 300L Sem 2, 6 mo]
│   │   └── B.Sc Microbiology (4 yrs)
│   └── Department of Pure & Applied Chemistry (CHM) [SIWES: Split 200L+300L, 6 mo]
│       └── B.Sc Industrial Chemistry (4 yrs)
│
├── Faculty of Environmental Sciences (ENV)
│   ├── Department of Architecture (ARC) [SIWES: Split 200L+300L, 6 mo]
│   │   └── B.Sc Architecture (4 yrs)
│   ├── Department of Quantity Surveying (QSV) [SIWES: 300L Sem 2, 6 mo]
│   │   └── B.Tech Quantity Surveying (5 yrs)
│   └── Department of Urban & Regional Planning (URP) [SIWES: 400L Extended, 6 mo]
│       └── B.Tech Urban & Regional Planning (5 yrs)
│
├── Faculty of Agriculture (AGR)
│   ├── Department of Agronomy & Crop Science (CRP) [SIWES: 400L Extended Farm Year]
│   │   └── B.Agric Agronomy (5 yrs)
│   └── Department of Animal Science (ANS) [SIWES: 400L Extended Farm Year]
│       └── B.Agric Animal Science (5 yrs)
│
├── Faculty of Management Sciences (MGT)
│   ├── Department of Business Administration (BUS) [SIWES: Exempt / 0 mo]
│   │   └── B.Sc Business Administration (4 yrs)
│   └── Department of Accounting (ACC) [SIWES: Exempt / 0 mo]
│       └── B.Sc Accounting (4 yrs)
│
└── Faculty of Law (LAW)
    └── Department of Public & Private Law (LAW) [SIWES: Exempt / Law School Practicum]
        └── LL.B Bachelor of Laws (5 yrs)
```

---

## 5. Implementation Design: Strategy 1 & Strategy 2 Combined

```
                              ┌──────────────────────────────────────────────┐
                              │     4-TIER HIERARCHY EXPLORER ONBOARDING     │
                              └──────────────────────┬───────────────────────┘
                                                     │
                         ┌───────────────────────────┴───────────────────────────┐
                         │                                                       │
                         ▼                                                       ▼
      ┌─────────────────────────────────────┐                 ┌─────────────────────────────────────┐
      │     STRATEGY 1: EXCEL / CSV BULK    │                 │   STRATEGY 2: MASTER NUC BLUEPRINT  │
      ├─────────────────────────────────────┤                 ├─────────────────────────────────────┤
      │ • Download Pre-Populated Master     │                 │ • In-App Faculty & Dept Tree Picker │
      │   Excel Spreadsheet with all codes  │                 │ • Check/Uncheck standard disciplines│
      │ • Edit Dean / HOD names & emails    │                 │ • 1-Click "Deploy Selected Master   │
      │ • Delete unoffered programmes       │                 │   Hierarchy to Institution"         │
      │ • Re-upload -> Live Preview & Import│                 │ • Instant batch DB creation in 2s   │
      └─────────────────────────────────────┘                 └─────────────────────────────────────┘
```

---

## 6. Implementation Plan & Execution Phases

### Phase 1: Model & Migration Upgrades (Backend)
1. Add `siwes_pattern`, `siwes_academic_impact`, and `siwes_target_levels` to `AcademicProgram`.
2. Update `StudentProfile.is_siwes_qualifying_year` to dynamically resolve against program patterns.
3. Update `AcademicProgramSerializer` and `DepartmentSerializer`.
4. Run Django migrations.

### Phase 2: Master Blueprint Library Service (Backend)
1. Create `nigerian_curriculum_blueprint.py` containing the master NUC/NBTE catalog.
2. Add API endpoint `GET /api/institutions/hierarchy-blueprints/` returning archetype bundles.
3. Add API endpoint `POST /api/institutions/{id}/import-blueprint/` for 1-click provisioning.
4. Add API endpoint `GET /api/institutions/download-hierarchy-template/?prepopulate=true` returning ready-to-use Excel/CSV files.
5. Add API endpoint `POST /api/institutions/{id}/bulk-import-hierarchy/` validating and batch-committing uploaded spreadsheets.

### Phase 3: Frontend Importer & Blueprint Modals (Frontend)
1. Build `HierarchyBulkImportModal.tsx`:
   - Tab 1: **"Upload Excel / CSV"** (Drag-and-drop, template download, live parse preview table, conflict flags).
   - Tab 2: **"NUC Master Blueprint Selector"** (Archetype picker, faculty checkboxes, one-click deploy).
2. Integrate into `AcademicHierarchyTree.tsx` with header action buttons:
   - **"Import Hierarchy (Excel / Blueprint)"** button.
3. Upgrade SIWES Badges & Modals:
   - Update `AddProgramModal.tsx` to include the **SIWES Pattern Selector** (Split 200L+300L, 300L Sem 2, 400L Extended, Exempt).
   - Display the specific SIWES timeline format on program detail nodes in the tree.

---

*Authored for Nexus Edutech Platform · Architecture & SIWES Overhaul Specification*
