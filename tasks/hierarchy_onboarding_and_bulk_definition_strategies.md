# 4-Tier Academic Hierarchy Definition & Bulk Onboarding Strategies

**Document Title**: Strategies for Defining and Onboarding University Hierarchy (Schools, Faculties, Departments, and Degree Programmes)  
**Target User**: Institutional Administrators, Registrars, and Deans  
**Platform**: Nexus Edutech Platform  
**Location**: `/tasks/hierarchy_onboarding_and_bulk_definition_strategies.md`  

---

## 1. Executive Summary

Defining an entire university's academic structure one by one (Tier 1: Institution $\rightarrow$ Tier 2: Faculty/School $\rightarrow$ Tier 3: Department $\rightarrow$ Tier 4: Degree Programme) is labor-intensive and error-prone when done manually through single-item forms. A medium-to-large institution typically has **8 to 18 Faculties**, **40 to 90 Departments**, and **80 to 200+ Degree Programmes**.

This document outlines the **top 3 easiest and most reliable industry-standard methods** to enable institutional admins to define and set up their complete academic hierarchy rapidly.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               4-TIER ACADEMIC HIERARCHY SCOPE                                    │
├───────────────────────┬─────────────────────────┬──────────────────────────┬─────────────────────┤
│  Tier 1: Institution  │  Tier 2: Division       │  Tier 3: Department      │  Tier 4: Programme  │
│  (e.g., University)   │  (Faculties / Schools)  │  (SIWES Eligible Units)  │  (Degree Rubrics)   │
└───────────────────────┴─────────────────────────┴──────────────────────────┴─────────────────────┘
```

---

## 2. Strategy 1: Excel / CSV Bulk Template Importer *(Recommended Primary Solution)*

This is the fastest, most universal, and most accurate method used by university registries and IT departments worldwide.

### 2.1 Workflow

```
┌───────────────────────────────┐     ┌───────────────────────────────┐     ┌───────────────────────────────┐
│ 1. Download Excel Template    │ ──> │ 2. Paste Registry Data        │ ──> │ 3. Upload & Review Preview     │
│    (Pre-formatted headers)    │     │    (from official brochure)   │     │    (1-Click Instant Creation) │
└───────────────────────────────┘     └───────────────────────────────┘     └───────────────────────────────┘
```

1. **Download Template**: Admin clicks **"Download Excel / CSV Template"** from the 4-Tier Hierarchy Explorer.
2. **Fill or Copy Data**: The registry pastes their academic listings into a single spreadsheet with flat, linked rows.
3. **Upload & Live Validation**: Admin drags and drops the completed `.xlsx` or `.csv` file. The platform:
   - Validates all codes and formats in real time.
   - Detects potential duplicates or invalid parent relationships.
   - Renders an interactive **Visual Preview Tree** before saving anything to the database.
4. **1-Click Batch Commit**: Admin reviews and clicks **"Confirm & Create Hierarchy"**. In under 3 seconds, all faculties, departments, and programmes are created and linked in PostgreSQL.

---

### 2.2 Standard Template Structure

| Column Name | Required | Example | Description |
| :--- | :--- | :--- | :--- |
| `division_name` | **Yes** | `Faculty of Engineering & Technology` | Name of the Faculty, School, or College |
| `division_code` | **Yes** | `ENG` | Short alphanumeric code for the division |
| `division_type` | **Yes** | `FACULTY` | `FACULTY`, `SCHOOL`, or `COLLEGE` |
| `dean_name` | No | `Prof. A. B. Ibrahim` | Optional Dean / Provost full name |
| `dean_email` | No | `dean.eng@university.edu.ng` | Optional Dean contact email |
| `department_name` | **Yes** | `Department of Mechanical Engineering` | Name of the academic department |
| `department_code` | **Yes** | `MEE` | Short unique department code |
| `hod_name` | No | `Dr. K. O. Adeleke` | Optional Head of Department name |
| `hod_email` | No | `hod.mee@university.edu.ng` | Optional HOD email |
| `siwes_eligible` | **Yes** | `TRUE` | `TRUE` or `FALSE` (ITF / SIWES mandatory training unit) |
| `program_name` | **Yes** | `B.Eng Mechanical Engineering` | Full title of the degree programme |
| `program_code` | **Yes** | `BENG-MEE` | Official degree code |
| `award_level` | **Yes** | `B_ENG` | `B_SC`, `B_ENG`, `B_TECH`, `B_A`, `HND`, `ND`, `PGD`, `MSC` |
| `duration_years`| **Yes** | `5` | Course duration in standard academic years |
| `siwes_duration`| **Yes** | `6` | Duration of industrial attachment in months (`0`, `3`, `6`) |

---

### 2.3 Sample Spreadsheet Rows

```csv
division_name,division_code,division_type,dean_name,dean_email,department_name,department_code,hod_name,hod_email,siwes_eligible,program_name,program_code,award_level,duration_years,siwes_duration
Faculty of Engineering,ENG,FACULTY,Prof. A. Sani,dean.eng@uni.edu,Mechanical Engineering,MEE,Dr. K. Bello,hod.mee@uni.edu,TRUE,B.Eng Mechanical Engineering,BENG-MEE,B_ENG,5,6
Faculty of Engineering,ENG,FACULTY,Prof. A. Sani,dean.eng@uni.edu,Civil Engineering,CVE,Dr. E. Okafor,hod.cve@uni.edu,TRUE,B.Eng Civil Engineering,BENG-CVE,B_ENG,5,6
Faculty of Computing,CMP,FACULTY,Prof. C. Eze,dean.cmp@uni.edu,Computer Science,CSC,Dr. T. Alabi,hod.csc@uni.edu,TRUE,B.Sc Computer Science,BSC-CSC,B_SC,4,6
Faculty of Computing,CMP,FACULTY,Prof. C. Eze,dean.cmp@uni.edu,Cybersecurity,CYB,Dr. M. Danjuma,hod.cyb@uni.edu,TRUE,B.Sc Cybersecurity,BSC-CYB,B_SC,4,6
Faculty of Science,SCI,FACULTY,Prof. H. Yusuf,dean.sci@uni.edu,Biochemistry,BCH,Dr. R. Adamu,hod.bch@uni.edu,TRUE,B.Sc Biochemistry,BSC-BCH,B_SC,4,6
```

---

## 3. Strategy 2: Pre-Configured Regulatory Blueprints (NUC / CCMAS Starter Packs)

Because higher institutions in Nigeria operate under standardized regulatory curricula (NUC CCMAS / BMAS for universities, NBTE for polytechnics, NCCE for colleges of education), the system can offer **1-Click Regulatory Starter Packs**.

### 3.1 Workflow

1. In the Hierarchy Explorer, the admin clicks **"Setup from NUC / Regulatory Blueprint"**.
2. They select their institution archetype:
   - *Comprehensive University* (Faculties: Arts, Science, Social Sciences, Law, Medicine, Engineering, etc.)
   - *University of Technology* (Engineering, Computing, Environmental Sciences, Agriculture)
   - *Polytechnic / Monotechnic* (School of Technology, Applied Sciences, Business)
   - *College of Education* (School of Sciences, Languages, Vocational & Technical)
3. A modular checklist displays all standard faculties and departments.
4. The admin checks the faculties/departments their campus currently runs (or clicks **"Select All Standard Faculties"**).
5. Clicking **"Generate Hierarchy"** instantly provisions the faculties, departments, and standard NUC degree options with official codes and default durations.
6. The admin can then customize or rename any unique department as needed.

---

## 4. Strategy 3: AI Document Ingestion from Official University Bulletin / Prospectus

Since the platform already features a native `pgvector` knowledge base and text extraction engine:

### 4.1 Workflow

1. The institutional admin uploads their official **University Academic Calendar, General Prospectus, or Senate Academic Bulletin (PDF)**.
2. The AI document parser:
   - Scans the Table of Contents, Faculty Chapters, and Curriculum Outlines.
   - Automatically detects and maps:
     $$\text{Faculties / Schools} \longrightarrow \text{Departments} \longrightarrow \text{Degree Programmes \& Durations}$$
3. The platform displays an **Interactive Review & Approval Screen**:
   - *"We discovered 10 Faculties, 48 Departments, and 86 Degree Programmes from your uploaded bulletin."*
4. The admin can review, adjust any Dean/HOD assignments, and click **"Approve & Deploy Hierarchy"**.

---

## 5. Strategy 4: REST / JSON API Integration with Campus SIS / ERP

For universities that already have a Central Student Information System (SIS) or ERP (e.g., Infonet, Eduportal, Banner, Koha):

1. The university IT unit can post their academic structure via a single authenticated JSON payload to `/api/institutions/{id}/bulk-hierarchy/`.
2. This creates and synchronizes all divisions, departments, and degree programmes automatically.

---

## 6. Strategy Comparison & Trade-Offs

| Strategy | Speed to Setup | Administrator Effort | Precision & Customization | Best Suited For |
| :--- | :--- | :--- | :--- | :--- |
| **1. Excel / CSV Bulk Importer** | **< 2 minutes** | **Very Low** (Copy & paste spreadsheet) | **100% Exact** | Any institution with an existing registry list or senate brochure |
| **2. NUC CCMAS Blueprint Packs** | **< 30 seconds** | **Minimal** (Checkboxes) | Standard NUC Aligned | New institutions setting up standard faculties rapidly |
| **3. AI Handbook Extraction** | **~ 1 minute** | **Low** (Review extracted structure) | High (Requires review) | Campuses with a comprehensive PDF handbook/bulletin |
| **4. JSON / ERP API Sync** | **Automated** | Requires IT Developer | 100% Synced | Tech-enabled campuses integrating with existing databases |

---

## 7. Recommended Implementation Plan

To provide the ultimate onboarding experience:
1. **Primary Tool**: Implement **Option 1 (Excel / CSV Bulk Importer)** in the 4-Tier Hierarchy Explorer with a clean "Download Sample Template" button and a drag-and-drop modal.
2. **Fast-Track Option**: Include **Option 2 (NUC Standard Blueprints)** as an optional preset selector inside the same modal for admins who want to auto-fill common faculties in one click.

---

*Authored for Nexus Edutech Platform · Architecture & Onboarding Reference*
