# MedLens — AI-Assisted Clinical Report Intelligence

[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

> **⚠️ Non-Diagnostic Clinical Safety Notice**: MedLens is an AI-assisted clinical information synthesis and decision-support prototype. It is **NOT** a diagnostic or treatment system. All insights, extracted findings, and risk indicators must be verified by a qualified healthcare professional against primary medical records before making clinical decisions.

---

## 🌟 Overview & Product Vision

**MedLens** transforms complex, unstructured multi-page medical reports and patient intake data into structured, source-grounded clinical intelligence in seconds. Designed for clinician workflows and hackathon demonstrations, MedLens emphasizes **transparency, source-grounding, and zero hallucinations** by linking every extracted finding directly back to its exact document location and verbatim text excerpt.

---

## ✨ Core Features & Demo Flow

```
Step 1: Patient Intake ──► Step 2: Report Upload ──► AI Processing Pipeline ──► Step 3: Clinical Analysis Dashboard
 (Demographics & Vitals)   (Drag & Drop / Sample)    (5-Stage Real-Time Sim)     (Summary, Findings, & Evidence)
```

### 1. 📋 Step 1 — Patient Information Intake
- Structured 8-field clinical intake (Name, Age, Sex, Symptoms, Existing Conditions, Allergies, Medications, Clinical Notes).
- Real-time client-side validation with instant error feedback and focus trapping.
- **"Fill Sample Patient"** helper button (Eleanor Vance, 62F) for fast demonstration.
- Structured **Patient Review & Confirmation** card with generated Intake ID (`ML-2024-XXXX`).

### 2. 📄 Step 2 — Medical Report Upload
- Drag-and-drop file upload zone supporting PDF, JPEG, PNG, TIFF, and DOCX (up to 25 MB).
- **"Use Sample Report"** helper button (`Comprehensive_Metabolic_Panel_Vance.pdf`, 1.4 MB).
- Real-time file type and size verification with dismissible error badges.

### 3. ⚡ AI Processing Pipeline
- Realistic 5-stage animated progress pipeline:
  1. *Extracting raw text & visual tokens* (0% $\rightarrow$ 25%)
  2. *Structuring laboratory & diagnostic metrics* (25% $\rightarrow$ 50%)
  3. *Cross-referencing reference intervals* (50% $\rightarrow$ 75%)
  4. *Synthesizing clinical risk patterns* (75% $\rightarrow$ 90%)
  5. *Finalizing clinical intelligence summary* (90% $\rightarrow$ 100%)

### 4. 📊 Step 3 — Clinical Analysis Dashboard & Source Grounding
- **Executive Clinical Summary**: High-level synthesis marked with `"AI-Generated • Decision Support"` badge and verification reminder.
- **Priority Attention Items**: Highlighted risk metrics (e.g. HbA1c, hs-CRP, eGFR) categorized by severity (High, Moderate, Observation).
- **Filterable Findings Table**: Filter between *All Findings* and *Out-of-Range Only*, plus category tabs for *Labs*, *Vitals*, *Imaging*, and *Recommendations*.
- **🔍 Interactive Source Grounding & Evidence Modal**:
  - Click any finding row or attention card to open the Source Verification Drawer.
  - Displays document coordinates (**Page Number** and **Report Section**).
  - Displays **verbatim report excerpts** matching the finding.
  - Interactive **3-Step Verification Chain**: `Extracted Finding` $\rightarrow$ `Source Evidence` $\rightarrow$ `Human Review`.
  - 1-click **"Copy Excerpt"** button.
  - Keyboard accessible (dismissible with `Escape` or backdrop click).
- **Data Continuity**: "Start New Analysis" resets report state while preserving patient demographics.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (or pnpm / yarn)

### Installation & Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/reddymeghana2008-arch/MR-MED-LENS.git
   cd MR-MED-LENS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Production Build & Preview**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📁 Repository Structure

```
MR-MED-LENS/
├── src/
│   ├── components/
│   │   ├── Header.tsx                     # SaaS brand bar with MedLens identity & live status
│   │   ├── DisclaimerBanner.tsx           # Clinical decision-support safety notice
│   │   ├── StepIndicator.tsx              # 3-step active progress bar
│   │   ├── FormField.tsx                  # Accessible form field with validation states
│   │   ├── PatientForm.tsx                # 8-field intake form with autofocus & validation
│   │   ├── PatientDataPreview.tsx         # Patient record review card
│   │   ├── ReportProcessing.tsx           # Drag & drop upload + 5-stage AI pipeline
│   │   └── ClinicalAnalysisDashboard.tsx  # Executive summary, findings table & evidence modal
│   ├── context/
│   │   └── PatientContext.tsx             # Central state management hook & provider
│   ├── types/
│   │   └── patient.ts                     # TypeScript schemas, models, and mock datasets
│   ├── App.tsx                            # Primary view router and layout orchestrator
│   ├── main.tsx                           # Application DOM mount
│   └── index.css                          # Tailwind CSS styles & typography
├── public/                                # Static assets and icons
├── package.json                           # Dependencies & project scripts
├── tsconfig.json                          # TypeScript configuration
└── vite.config.ts                         # Vite configuration
```

---

## 🛡️ Clinical Design Principles

1. **Human-in-the-Loop**: AI outputs are framed as supportive recommendations rather than authoritative diagnoses.
2. **Deterministic Provenance**: Every extracted value references a verifiable page and section in the source document.
3. **Data Isolation**: All patient processing occurs in client-side memory without external third-party data tracking.

---

## 📄 License
This project is licensed under the MIT License.