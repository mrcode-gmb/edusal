# Student Cohort Onboarding & Bulk Ingestion Architecture

**Document Title**: Comprehensive Architectural Plan for University-Scale Student Ingestion, Self-Claim Verification, and Multi-Channel Onboarding  
**Target Platform**: Nexus Edutech Platform (Higher Education ERP & AI Career Engine)  
**Target Roles**: University Registrars, Institutional Administrators, HODs, Deans, Admissions Officers, Students  
**File Location**: `/tasks/student_cohort_onboarding_and_bulk_ingestion_strategies.md`  

---

## 1. Problem Statement & University Scale Dynamics

In higher education institutions across Nigeria (Universities, Polytechnics, and Colleges of Education), student enrollment spans from **2,000 to over 60,000 active students** per institution. 

### Why Manual One-by-One Student Creation Fails:
1. **Administrative Bottleneck**: Manually typing student profiles, matriculation numbers, emails, and academic assignments for a single 100-Level intake (e.g. 5,000 students) would require hundreds of hours of repetitive clerical labor.
2. **High Error Rate**: Typographical errors in Matric numbers (`2022/SWE/041`), JAMB registration numbers (`202410294821EF`), and degree programme mappings corrupt student transcripts and SIWES qualification calculations.
3. **Orientation Day Congestion**: During freshers' registration, institutions need rapid bulk activation where thousands of students receive credentials simultaneously.
4. **Cohort Lifecycle Shifts**: Every academic session, entire cohorts transition (100L $\rightarrow$ 200L, SIWES year entrance, final year clearance), demanding bulk cohort operations rather than individual profile adjustments.

---

## 2. Multi-Channel Onboarding Architecture Overview

To accommodate every university operating model (from centralized registrar databases to decentralized department desks and direct student self-service), Nexus Edusal adopts a **4-Channel Ingestion Model**:

```
                                  ┌─────────────────────────────────────────────────────────┐
                                  │   🎓 University-Scale Student Onboarding Multi-Channel  │
                                  └───────────────────────────┬─────────────────────────────┘
                                                              │
            ┌─────────────────────────────────┬───────────────┴───────────────┬─────────────────────────────────┐
            │                                 │                               │                                 │
            ▼                                 ▼                               ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐       ┌───────────────────────┐         ┌───────────────────────┐
│       CHANNEL 1       │         │       CHANNEL 2       │       │       CHANNEL 3       │         │       CHANNEL 4       │
│  Smart Excel/CSV Bulk │         │  Student Self-Claim   │       │  Portal / SIS Webhook │         │  Batch Passcard PDF   │
│  Cohort Importer      │         │  & Verification Flow  │       │  & Sync REST API      │         │  & Broadcast Dispatch │
├───────────────────────┤         ├───────────────────────┤       ├───────────────────────┤         ├───────────────────────┤
│ • Pre-filled Master   │         │ • Zero Admin Burden   │       │ • EduPortal / Remita  │         │ • Orientation Day PIN │
│   Workbook (.xlsx)    │         │ • Matric / JAMB Reg   │       │   Automated Sync      │         │   4-per-page Slips    │
│ • Live Validation UI  │         │   Claim Verification  │       │ • Course Reg Webhooks │         │ • Bulk Email & SMS    │
│ • Batch DB Engine     │         │ • Institutional Email │       │ • Real-Time Enrolment │         │   Activation Dispatch │
└───────────────────────┘         └───────────────────────┘       └───────────────────────┘         └───────────────────────┘
```

---

## 3. Channel 1: Smart Master Excel / CSV Cohort Importer *(Immediate Implementation)*

### 3.1 Branded Master Student Template Structure (`.xlsx` / `.csv`)
The server dynamically compiles a custom 3-sheet workbook based on the specific institution's live 4-Tier Hierarchy tree:

#### Sheet 1: `📘 Instructions & Onboarding Manual`
- Company branding & University logo.
- Step-by-step population rules.
- Data format specifications (date formats, level codes, entry modes).

#### Sheet 2: `🎓 Student Cohort Data`
The primary table where registrars paste or populate student records:

| Column Header | Data Type | Mandatory | Example | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| **`matric_number`** | `VARCHAR(50)` | **YES** | `2022/SWE/041` | Unique student ID. Uppercased and trimmed. |
| **`full_name`** | `VARCHAR(200)` | **YES** | `Adebayo Chukwuma Musa` | Title Case full name (Surname First or First Name First). |
| **`student_email`** | `EMAIL` | **YES** | `adebayo.musa@student.unilag.edu.ng` | Unique user account login. Checked against existing users. |
| **`phone_number`** | `VARCHAR(30)` | NO | `+234 803 123 4567` | International or Nigerian standard GSM format. |
| **`program_code`** | `VARCHAR(50)` | **YES** | `SWE-BTECH` | Programme code or exact programme name. Mapped to Tier 4 node. |
| **`entry_session`** | `VARCHAR(30)` | **YES** | `2023/2024` | Session label. Automatically linked to institution's `AcademicSession`. |
| **`entry_mode`** | `CHOICE` | **YES** | `UTME` | `UTME`, `DIRECT_ENTRY`, `TRANSFER`, `POSTGRADUATE`, `PART_TIME`. |
| **`current_level`** | `CHOICE` | **YES** | `300L` | `100L`, `200L`, `300L`, `400L`, `500L`, `600L`, `ND1`, `ND2`, `HND1`, `HND2`. |
| **`cgpa`** | `DECIMAL(3,2)`| NO | `4.25` | Current cumulative grade point average (0.00 to 5.00). |
| **`jamb_reg_number`**| `VARCHAR(30)` | NO | `202410492811AB` | National JAMB Registration Identifier for verification. |
| **`gender`** | `CHOICE` | NO | `MALE` | `MALE`, `FEMALE`, `OTHER`. |
| **`state_of_origin`**| `VARCHAR(50)` | NO | `Lagos` | Used for state-level SIWES and bursary metrics. |

#### Sheet 3: `📋 Reference Codes & Lookups`
- Dynamically populated list of the institution's **valid Program Codes & Program Names**.
- List of active **Academic Sessions**.
- List of valid **Entry Modes** and **Level Choices**.

---

### 3.2 Importer Workflow & Safety Engine

```
[ Admin Uploads .xlsx / .csv ] 
            │
            ▼
[ Pre-Parse & Header Normalization ] ──► (Detects column typos, ignores whitespace)
            │
            ▼
[ Dry-Run Validation Loop ]
   ├── Check duplicate emails in file & DB
   ├── Check duplicate matric numbers in file & DB
   ├── Verify program_code matches institution hierarchy
   └── Verify entry_session exists
            │
      ┌─────┴─────────────────────────┐
      ▼                               ▼
[ Errors Detected ]            [ All Rows Valid ]
- Highlights invalid rows      - Shows batch summary:
- Displays error reasons         Total: 1,450 students
- Allows one-click fix/reupload  Departments: 8
                                 SIWES Eligible: 920
                                      │
                                      ▼
                      [ Atomic Batch Execution ]
                      - 100 students per DB chunk
                      - Auto-generate default password
                      - Initialize StudentProfile & User
                      - Trigger Welcome Email (Optional)
```

---

## 4. Channel 2: Student Self-Claim & Verification Portal

To completely remove data entry burden from university staff, students can self-activate:

1. **Student Access**: Student visits `https://app.edusal.ng/portal/student/claim`.
2. **Identification Lookup**:
   - Student enters **Institution**, **Matriculation Number**, and **JAMB Registration Number** (or Institutional Email).
3. **Verification Match**:
   - The platform verifies the credentials against the uploaded registry or creates an authenticated claim.
4. **Account Initialization**:
   - The student sets their private password, enters contact details, and verifies their department/level.
5. **Instant Dashboard Access**:
   - Student immediately accesses AI Career Coaching, SIWES Clearance, Course Curriculums, and Assessments.

---

## 5. Channel 3: University SIS / Portal Webhook Sync API

For universities with existing School Management Systems (EduPortal, Remita, or Custom Portal):

### REST Endpoint Specification:
```http
POST /api/students/sync-cohort/
Authorization: Token <INSTITUTION_API_KEY>
Content-Type: application/json

{
  "institution_id": "8f8b8e0a-...",
  "batch_label": "2024_2025_Fresher_Admissions_Round1",
  "students": [
    {
      "matric_number": "2024/CSC/001",
      "full_name": "Fatima Bello",
      "email": "fatima.bello@student.unimaid.edu.ng",
      "program_code": "CSC-BSC",
      "entry_session": "2024/2025",
      "entry_mode": "UTME",
      "year_of_study": 1,
      "jamb_reg_number": "202490182901BC"
    }
  ]
}
```

---

## 6. Channel 4: Orientation Passcards & Bulk PIN Slips (PDF Generator)

For 100-Level Freshers' Orientation & Matrix Distribution:

- **1-Click Generation**: Admin selects a Department or Level and clicks `"Export Orientation PIN Slips (PDF)"`.
- **4-per-page Print Ready Format**:
  - University Crest & Department Header.
  - Student Name & Matriculation Number.
  - Temporary Activation Password / QR Code.
  - Student Instructions for logging into the portal and mobile web app.

---

## 7. Implementation Roadmap & Milestones

| Phase | Component | Key Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Bulk Excel/CSV Importer** | • `generate_student_roster_excel` OpenPyXL service.<br>• `bulk_import_students` backend API view.<br>• `StudentBulkImportModal.tsx` frontend wizard with dry-run validator. | **Ready for Execution** |
| **Phase 2** | **Student Self-Claim Portal** | • `/portal/student/claim` route & identity match verification flow.<br>• Password creation & automated activation email. | Planned |
| **Phase 3** | **Batch Passcard PDF Generator** | • PDF orientation slips generator (4-per-page print layout).<br>• Bulk password reset / credential dispatch. | Planned |
| **Phase 4** | **SIS / Portal Webhook Integration** | • REST API sync endpoint for external university portals with API key management. | Planned |

---

## 8. Summary & Recommendation

Implementing **Channel 1 (Dynamic Master Excel / CSV Cohort Importer)** provides immediate relief to institutional administrators, allowing thousands of student records to be onboarded in minutes with 100% relational integrity. Channel 2 (Self-Claim) and Channel 4 (Orientation Slips) build upon this foundation to deliver a complete end-to-end enrollment experience.
