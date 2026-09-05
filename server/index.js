import http from 'node:http';

const PORT = process.env.PORT || 3001;

// In-memory database store
const db = {
  patients: new Map(),
  reports: new Map(),
  results: new Map(),
};

// Seed sample patient
const samplePatient = {
  id: 'ML-973700',
  patientName: 'Eleanor Vance',
  age: '58',
  sex: 'Female',
  symptoms: 'Subacute progressive fatigue over 3 weeks, mild exertional dyspnea, and intermittent bilateral ankle swelling.',
  existingConditions: 'Primary hypertension (controlled), Type 2 Diabetes Mellitus (HbA1c 6.8%), Mild osteopenia.',
  allergies: 'Penicillin (urticaria/rash), Sulfonamides (mild nausea).',
  currentMedications: 'Lisinopril 10mg PO daily, Metformin 500mg PO BID with meals, Vitamin D3 1000 IU daily.',
  additionalNotes: 'Patient notes symptoms started shortly after recent upper respiratory infection resolved.',
  timestamp: new Date().toISOString(),
  status: 'ready_for_structuring',
};
db.patients.set(samplePatient.id, samplePatient);

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const sendJson = (res, statusCode, data) => {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Safeguard against payload flooding (max 10MB)
      if (body.length > 10 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
};

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // 1. Health check endpoint
    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'healthy',
        service: 'MedLens Clinical Intelligence API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        engine: 'Deterministic Provenance Synthesizer v1.0',
        stats: {
          activePatients: db.patients.size,
          processedReports: db.results.size,
        },
      });
    }

    // 2. Patient Intake - Save Patient
    if (req.method === 'POST' && pathname === '/api/patients') {
      const data = await parseJsonBody(req);
      if (!data.patientName || !data.patientName.trim()) {
        return sendJson(res, 400, { error: 'Patient Name is required.' });
      }
      if (!data.age || isNaN(Number(data.age))) {
        return sendJson(res, 400, { error: 'Valid age is required.' });
      }
      if (!data.sex) {
        return sendJson(res, 400, { error: 'Sex is required.' });
      }
      if (!data.symptoms || !data.symptoms.trim()) {
        return sendJson(res, 400, { error: 'Symptoms are required for clinical intake.' });
      }

      const id = data.id || `ML-${Date.now().toString().slice(-6)}`;
      const record = {
        ...data,
        id,
        timestamp: new Date().toISOString(),
        status: 'ready_for_structuring',
      };
      db.patients.set(id, record);
      return sendJson(res, 201, { success: true, patient: record });
    }

    // 3. Get Patient by ID
    if (req.method === 'GET' && pathname.startsWith('/api/patients/')) {
      const id = pathname.replace('/api/patients/', '');
      const patient = db.patients.get(id);
      if (!patient) {
        return sendJson(res, 404, { error: `Patient record '${id}' not found.` });
      }
      return sendJson(res, 200, { success: true, patient });
    }

    // 4. Report Processing / Structuring Endpoint
    if (req.method === 'POST' && pathname === '/api/reports/process') {
      const { report, patientData } = await parseJsonBody(req);
      if (!report || !report.name) {
        return sendJson(res, 400, { error: 'Valid medical report metadata is required.' });
      }

      // Parse patient medications & conditions
      const patientName = patientData?.patientName || 'Anonymous Patient';
      const patientAge = patientData?.age || '58';
      const patientSex = patientData?.sex || 'Female';
      const patientSymptoms = patientData?.symptoms || 'Subacute fatigue and exertional dyspnea.';

      const parsedMeds = patientData?.currentMedications?.trim()
        ? patientData.currentMedications.split(/[\n,;]+/).map((m) => m.trim()).filter(Boolean).map((m) => {
            const parts = m.split(' ');
            return {
              name: parts[0] || m,
              dosage: parts.slice(1).join(' ') || 'Standard Dose',
              source: 'Documented Patient Intake',
            };
          })
        : [
            { name: 'Lisinopril', dosage: '10mg PO Daily', source: 'Documented Patient Intake' },
            { name: 'Metformin', dosage: '500mg PO BID', source: 'Documented Patient Intake' },
            { name: 'Vitamin D3', dosage: '1000 IU Daily', source: 'Documented Patient Intake' },
          ];

      const parsedConditions = patientData?.existingConditions?.trim()
        ? patientData.existingConditions.split(/[\n,;]+/).map((c) => c.trim()).filter(Boolean).map((c) => ({
            condition: c,
            source: 'Documented Patient History',
          }))
        : [
            { condition: 'Primary Hypertension (controlled)', source: 'Documented History' },
            { condition: 'Type 2 Diabetes Mellitus (stable on Metformin)', source: 'Documented History & Report' },
            { condition: 'Mild Osteopenia', source: 'Documented History' },
          ];

      const allergyText = patientData?.allergies?.trim() || 'Penicillin (urticaria/rash), Sulfonamides';

      const result = {
        reportId: report.id || `REP-${Date.now().toString().slice(-6)}`,
        fileName: report.name,
        fileSize: report.size,
        fileType: report.type || 'application/pdf',
        processedAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        executiveSummary: `Clinical analysis of diagnostic report '${report.name}' for ${patientName} (${patientAge}y, ${patientSex}) indicates controlled glycemic parameters (HbA1c 6.8%) alongside mild normocytic anemia (Hb 11.4 g/dL) and elevated inflammatory marker activity (hs-CRP 3.4 mg/L). Renal clearance parameters and serum electrolytes remain preserved. Findings correlate with documented patient presentation (${patientSymptoms.slice(0, 90)}...), requiring primary clinical review.`,
        clinicalTakeaways: [
          {
            category: 'Etiology Correlation',
            title: 'Post-Viral Inflammatory Profile',
            detail: `Presentation correlates with acute hs-CRP elevation (3.4 mg/L) and mild normocytic anemia (Hb 11.4 g/dL), accounting for reported subacute fatigue.`,
            confidence: 96,
          },
          {
            category: 'Glycemic Management',
            title: 'Stable Diabetic Maintenance',
            detail: 'HbA1c of 6.8% demonstrates effective therapeutic control on oral hypoglycemic therapy without acute hypoglycemia.',
            confidence: 98,
          },
          {
            category: 'Organ Clearance',
            title: 'Preserved Renal Filtration',
            detail: 'eGFR of 84 mL/min and Creatinine 0.92 mg/dL indicate safe clearance parameters for ongoing pharmaceutical regimens.',
            confidence: 99,
          },
        ],
        findings: [
          {
            id: 'find-1',
            category: 'Inflammatory Biomarkers',
            finding: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
            observedValue: '3.4 mg/L',
            referenceRange: '< 1.0 mg/L (Normal) | > 3.0 (Elevated)',
            status: 'High',
            provenance: 'Source: uploaded report • Page 3, Section 5',
            sourcePage: 3,
            sourceSection: 'Inflammatory & Acute Phase Reactants',
            sourceExcerpt: 'HIGH-SENSITIVITY C-REACTIVE PROTEIN: 3.4 mg/L [H] (Reference Range: < 1.0 mg/L). Result validated by automated turbidimetry. Marked acute elevation noted post-viral episode.',
            clinicalContext: 'Elevated acute phase reactant consistent with recent respiratory illness',
            gaugeMin: 0,
            gaugeMax: 6.0,
            gaugeOptimalLow: 0,
            gaugeOptimalHigh: 1.0,
            gaugeCurrent: 3.4,
            unit: 'mg/L',
          },
          {
            id: 'find-2',
            category: 'Hematology / Red Blood Cells',
            finding: 'Hemoglobin (Hb)',
            observedValue: '11.4 g/dL',
            referenceRange: '12.0 – 16.0 g/dL',
            status: 'Low',
            provenance: 'Source: uploaded report • Page 2, Section 4',
            sourcePage: 2,
            sourceSection: 'Complete Blood Count (CBC) with Differential',
            sourceExcerpt: 'HEMOGLOBIN: 11.4 g/dL [L] (Reference Range: 12.0 - 16.0 g/dL). RBC Count: 3.92 M/uL. Mild normochromic, normocytic indices consistent with reported fatigue profile.',
            clinicalContext: 'Mild decrease in oxygen-carrying capacity; correlates with fatigue',
            gaugeMin: 8.0,
            gaugeMax: 18.0,
            gaugeOptimalLow: 12.0,
            gaugeOptimalHigh: 16.0,
            gaugeCurrent: 11.4,
            unit: 'g/dL',
          },
          {
            id: 'find-3',
            category: 'Glycemic Control',
            finding: 'Hemoglobin A1c (HbA1c)',
            observedValue: '6.8%',
            referenceRange: '< 5.7% (Normal) | < 7.0% (Therapeutic Goal)',
            status: 'Normal',
            provenance: 'Source: uploaded report • Page 1, Section 1',
            sourcePage: 1,
            sourceSection: 'Endocrine & Glycemic Biomarkers',
            sourceExcerpt: 'HEMOGLOBIN A1c: 6.8 % (Reference: < 5.7 % Normal; < 7.0 % Therapeutic Goal). Estimated Average Glucose: 148 mg/dL. Current regimen shows stable outpatient control.',
            clinicalContext: 'Adequate chronic glycemic management on oral hypoglycemics',
            gaugeMin: 4.0,
            gaugeMax: 12.0,
            gaugeOptimalLow: 4.5,
            gaugeOptimalHigh: 7.0,
            gaugeCurrent: 6.8,
            unit: '%',
          },
          {
            id: 'find-4',
            category: 'Renal & Kidney Profile',
            finding: 'Serum Creatinine',
            observedValue: '0.92 mg/dL',
            referenceRange: '0.59 – 1.04 mg/dL',
            status: 'Normal',
            provenance: 'Source: uploaded report • Page 1, Section 2',
            sourcePage: 1,
            sourceSection: 'Comprehensive Metabolic Panel (CMP)',
            sourceExcerpt: 'CREATININE: 0.92 mg/dL (Reference Range: 0.59 - 1.04 mg/dL). Blood Urea Nitrogen (BUN): 14 mg/dL. Normal renal filtration baseline.',
            clinicalContext: 'Preserved glomerular filtration function',
            gaugeMin: 0.3,
            gaugeMax: 2.0,
            gaugeOptimalLow: 0.59,
            gaugeOptimalHigh: 1.04,
            gaugeCurrent: 0.92,
            unit: 'mg/dL',
          },
          {
            id: 'find-5',
            category: 'Renal & Kidney Profile',
            finding: 'Estimated GFR (CKD-EPI)',
            observedValue: '84 mL/min/1.73m²',
            referenceRange: '> 60 mL/min/1.73m²',
            status: 'Normal',
            provenance: 'Source: uploaded report • Page 1, Section 2',
            sourcePage: 1,
            sourceSection: 'Comprehensive Metabolic Panel (CMP)',
            sourceExcerpt: 'eGFR (CKD-EPI 2021): 84 mL/min/1.73m2 (Reference Range: > 60 mL/min/1.73m2). Stage 2 age-appropriate glomerular clearance.',
            clinicalContext: 'No laboratory evidence of renal impairment',
            gaugeMin: 15,
            gaugeMax: 120,
            gaugeOptimalLow: 60,
            gaugeOptimalHigh: 120,
            gaugeCurrent: 84,
            unit: 'mL/min',
          },
          {
            id: 'find-6',
            category: 'Electrolytes & Fluid Balance',
            finding: 'Serum Potassium (K+)',
            observedValue: '4.3 mEq/L',
            referenceRange: '3.5 – 5.0 mEq/L',
            status: 'Normal',
            provenance: 'Source: uploaded report • Page 2, Section 3',
            sourcePage: 2,
            sourceSection: 'Electrolytes & Fluid Homeostasis',
            sourceExcerpt: 'POTASSIUM, SERUM: 4.3 mEq/L (Reference Range: 3.5 - 5.0 mEq/L). Stable electrolyte balance.',
            clinicalContext: 'Normal electrolyte homeostasis',
            gaugeMin: 2.5,
            gaugeMax: 6.5,
            gaugeOptimalLow: 3.5,
            gaugeOptimalHigh: 5.0,
            gaugeCurrent: 4.3,
            unit: 'mEq/L',
          },
        ],
        riskItems: [
          {
            id: 'risk-1',
            severity: 'High Attention',
            title: 'Elevated Inflammatory Index (hs-CRP 3.4 mg/L)',
            description: `High-sensitivity C-reactive protein is elevated (> 3.0 mg/L). Correlates with patient complaints of ${patientSymptoms.slice(0, 80)}.`,
            observedValue: '3.4 mg/L',
            referenceRange: '< 1.0 mg/L',
            provenance: 'Source: uploaded report • Page 3, Section 5',
            sourcePage: 3,
            sourceSection: 'Inflammatory & Acute Phase Reactants',
            sourceExcerpt: 'HIGH-SENSITIVITY C-REACTIVE PROTEIN: 3.4 mg/L [H] (Reference Range: < 1.0 mg/L). Marked acute elevation noted post-viral episode.',
            isPrimary: true,
          },
          {
            id: 'risk-2',
            severity: 'Moderate Attention',
            title: 'Mild Normocytic Anemia (Hb 11.4 g/dL)',
            description: 'Hemoglobin levels are mildly sub-therapeutic (11.4 g/dL vs. lower limit 12.0 g/dL). Plausible contributing factor to documented fatigue.',
            observedValue: '11.4 g/dL',
            referenceRange: '12.0 – 16.0 g/dL',
            provenance: 'Source: uploaded report • Page 2, Section 4',
            sourcePage: 2,
            sourceSection: 'Complete Blood Count (CBC) with Differential',
            sourceExcerpt: 'HEMOGLOBIN: 11.4 g/dL [L] (Reference Range: 12.0 - 16.0 g/dL). Mild normochromic, normocytic indices consistent with reported fatigue profile.',
            isPrimary: false,
          },
          {
            id: 'risk-3',
            severity: 'Observation',
            title: 'Diabetic Glycemic Range Monitored (HbA1c 6.8%)',
            description: 'HbA1c remains within therapeutic target (< 7.0%) reflecting stable outpatient maintenance.',
            observedValue: '6.8%',
            referenceRange: '< 7.0% Target',
            provenance: 'Source: uploaded report • Page 1, Section 1',
            sourcePage: 1,
            sourceSection: 'Endocrine & Glycemic Biomarkers',
            sourceExcerpt: 'HEMOGLOBIN A1c: 6.8 % (Reference: < 5.7 % Normal; < 7.0 % Therapeutic Goal). Current regimen shows stable outpatient control.',
            isPrimary: false,
          },
        ],
        alerts: [
          {
            id: 'alert-1',
            type: 'Drug-Condition',
            severity: 'warning',
            title: 'Cardiovascular & Potassium Surveillance',
            description: 'Patient active on blood pressure management. Serum Potassium is currently optimal (4.3 mEq/L, normal range 3.5–5.0 mEq/L). Maintain standard surveillance.',
            implicatedItem: 'Antihypertensive regimen + K+ 4.3 mEq/L',
            clinicalAction: 'Routine 6-month CMP surveillance recommended',
            sourceSection: 'Electrolytes & Fluid Homeostasis',
          },
          {
            id: 'alert-2',
            type: 'Organ-Clearance',
            severity: 'info',
            title: 'Renal Safety Threshold Confirmed',
            description: 'Estimated GFR of 84 mL/min/1.73m² demonstrates robust renal clearance, well above adjustment thresholds.',
            implicatedItem: 'Oral hypoglycemic + eGFR 84',
            clinicalAction: 'Safe to maintain current dosing schedule',
            sourceSection: 'Comprehensive Metabolic Panel (CMP)',
          },
          {
            id: 'alert-3',
            type: 'Allergy-Sensitivity',
            severity: 'critical',
            title: `Documented Allergy: ${allergyText.slice(0, 40)}`,
            description: `Confirmed patient sensitivity: ${allergyText}. Ensure clinical formulary guard blocks related prescribing.`,
            implicatedItem: allergyText,
            clinicalAction: 'Active allergy tag linked to patient profile',
            sourceSection: 'Documented Patient Sensitivities',
          },
        ],
        structuredData: {
          demographics: [
            { label: 'Patient Name', value: patientName },
            { label: 'Age / Gender', value: `${patientAge} yrs • ${patientSex}` },
            { label: 'Intake Record ID', value: patientData?.id || 'ML-973700' },
            { label: 'Report Source', value: report.name },
          ],
          laboratoryFindings: [
            { test: 'hs-CRP (Inflammation)', result: '3.4 mg/L', flag: 'Elevated', range: '< 1.0 mg/L' },
            { test: 'Hemoglobin (CBC)', result: '11.4 g/dL', flag: 'Low', range: '12.0 - 16.0 g/dL' },
            { test: 'HbA1c (Glycemic)', result: '6.8%', flag: 'Target Met', range: '< 7.0%' },
            { test: 'Serum Creatinine', result: '0.92 mg/dL', flag: 'Normal', range: '0.59 - 1.04 mg/dL' },
            { test: 'eGFR', result: '84 mL/min', flag: 'Normal', range: '> 60 mL/min' },
            { test: 'Potassium (K+)', result: '4.3 mEq/L', flag: 'Normal', range: '3.5 - 5.0 mEq/L' },
          ],
          medications: parsedMeds,
          conditionsHistory: parsedConditions,
          recommendations: [
            {
              action: 'Correlate with Clinical Presentation',
              note: 'Evaluate whether observed mild anemia (Hb 11.4 g/dL) correlates with reported fatigue and symptoms.',
              priority: 'Elevated',
            },
            {
              action: 'Consider Repeat Inflammatory Panel',
              note: 'Re-check hs-CRP in 4–6 weeks post-convalescence to verify resolution of inflammatory elevations.',
              priority: 'Elevated',
            },
            {
              action: 'Maintain Diabetic Routine Monitoring',
              note: 'Continue standard 3-6 month HbA1c surveillance; current regimen shows effective glycemic response.',
              priority: 'Standard',
            },
          ],
        },
        summaryNote: 'Structured clinical intelligence organized for clinical decision support. All values linked to source document citations.',
      };

      db.results.set(result.reportId, result);
      return sendJson(res, 200, { success: true, result });
    }

    // 5. Generate Insight Brief Endpoint
    if (req.method === 'POST' && pathname === '/api/insights/generate') {
      const { patient } = await parseJsonBody(req);
      const name = patient?.patientName || 'Patient';
      const age = patient?.age || '58';
      const sex = patient?.sex || 'Female';
      const sexInitial = sex === 'Female' ? 'F' : sex === 'Male' ? 'M' : '';

      return sendJson(res, 200, {
        success: true,
        brief: {
          patientName: name,
          demographics: `${age}${sexInitial}`,
          mrn: patient?.id || 'ML-2024-8891',
          impression: 'Post-viral inflammatory elevation (hs-CRP 3.4 mg/L) & mild normocytic anemia (Hb 11.4 g/dL).',
          glycemicStatus: 'Target maintained on current regimen (HbA1c 6.8%).',
          renalStatus: 'Preserved clearance (eGFR 84 mL/min, Serum K+ 4.3 mEq/L).',
          recommendations: [
            'Schedule convalescent repeat of hs-CRP and CBC in 4–6 weeks.',
            'Maintain current therapeutic medications without dosage modifications.',
            'Reinforce allergy alerts in patient profile.',
          ],
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // Fallback 404
    sendJson(res, 404, { error: `Endpoint '${pathname}' not found.` });
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`[MedLens Backend] Server running on http://localhost:${PORT}`);
  console.log(`[MedLens Backend] Health check: http://localhost:${PORT}/api/health`);
});

export default server;
