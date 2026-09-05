import { describe, it, expect } from 'vitest';
import {
  parseMedicationList,
  parseConditionsList,
  calculateFindingStatus,
  synthesizeClinicalInsights,
  generateMedicationAlerts,
  buildMedicalTimeline,
  synthesizeDecisionBrief,
} from '../utils/clinicalEngine';
import type { DetailedFinding, PatientFormData } from '../types/patient';

describe('Clinical Intelligence Engine', () => {
  const mockFindings: DetailedFinding[] = [
    {
      id: 'find-1',
      category: 'Inflammatory Biomarkers',
      finding: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
      observedValue: '3.4 mg/L',
      referenceRange: '< 1.0 mg/L',
      status: 'High',
      provenance: 'Page 3, Section 5',
      sourcePage: 3,
      sourceSection: 'Inflammatory Reactants',
      sourceExcerpt: 'hs-CRP: 3.4 mg/L [H]',
      priorValue: '0.8 mg/L',
      trend: 'elevated_increase',
      trendLabel: '+2.6 mg/L post-viral',
    },
    {
      id: 'find-2',
      category: 'Hematology',
      finding: 'Hemoglobin (Hb)',
      observedValue: '11.4 g/dL',
      referenceRange: '12.0 - 16.0 g/dL',
      status: 'Low',
      provenance: 'Page 2, Section 4',
      sourcePage: 2,
      sourceSection: 'CBC Panel',
      sourceExcerpt: 'Hemoglobin: 11.4 g/dL [L]',
      priorValue: '13.1 g/dL',
      trend: 'decreased',
      trendLabel: '-1.7 g/dL delta',
    },
    {
      id: 'find-3',
      category: 'Glycemic Control',
      finding: 'Hemoglobin A1c (HbA1c)',
      observedValue: '6.8%',
      referenceRange: '< 7.0%',
      status: 'Normal',
      provenance: 'Page 1, Section 1',
      sourcePage: 1,
      sourceSection: 'Endocrine',
      sourceExcerpt: 'HbA1c: 6.8%',
      priorValue: '6.9%',
      trend: 'stable_target',
      trendLabel: 'Maintained at goal',
    },
    {
      id: 'find-4',
      category: 'Renal',
      finding: 'Estimated GFR (CKD-EPI)',
      observedValue: '84 mL/min',
      referenceRange: '> 60 mL/min',
      status: 'Normal',
      provenance: 'Page 1, Section 2',
      sourcePage: 1,
      sourceSection: 'Metabolic',
      sourceExcerpt: 'eGFR: 84 mL/min',
      priorValue: '86 mL/min',
      trend: 'normal_baseline',
      trendLabel: 'Stable baseline',
    },
    {
      id: 'find-5',
      category: 'Electrolytes',
      finding: 'Serum Potassium (K+)',
      observedValue: '4.3 mEq/L',
      referenceRange: '3.5 - 5.0 mEq/L',
      status: 'Normal',
      provenance: 'Page 2, Section 3',
      sourcePage: 2,
      sourceSection: 'Electrolytes',
      sourceExcerpt: 'Potassium: 4.3 mEq/L',
    },
  ];

  const mockPatient: Partial<PatientFormData> = {
    patientName: 'Eleanor Vance',
    age: '58',
    sex: 'Female',
    symptoms: 'Subacute fatigue for 3 weeks post-viral illness',
    currentMedications: 'Lisinopril 10mg daily, Metformin 500mg BID',
    existingConditions: 'Hypertension, Type 2 Diabetes',
    allergies: 'Penicillin, Sulfa',
  };

  describe('parseMedicationList', () => {
    it('returns default fallback medications if empty string or undefined', () => {
      expect(parseMedicationList('')).toHaveLength(3);
      expect(parseMedicationList(undefined)).toHaveLength(3);
    });

    it('parses comma-separated custom medication strings', () => {
      const parsed = parseMedicationList('Atorvastatin 20mg PO daily, Aspirin 81mg');
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('Atorvastatin');
      expect(parsed[0].dosage).toBe('20mg PO daily');
      expect(parsed[1].name).toBe('Aspirin');
    });

    it('parses newline-separated medications', () => {
      const parsed = parseMedicationList('Metoprolol 25mg\nLevothyroxine 50mcg');
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('Metoprolol');
      expect(parsed[1].name).toBe('Levothyroxine');
    });
  });

  describe('parseConditionsList', () => {
    it('returns default fallback conditions if empty or undefined', () => {
      expect(parseConditionsList('')).toHaveLength(3);
      expect(parseConditionsList(undefined)).toHaveLength(3);
    });

    it('parses custom comma-separated conditions', () => {
      const parsed = parseConditionsList('Asthma, Hypothyroidism, GERD');
      expect(parsed).toHaveLength(3);
      expect(parsed[0].condition).toBe('Asthma');
      expect(parsed[1].condition).toBe('Hypothyroidism');
      expect(parsed[2].condition).toBe('GERD');
    });
  });

  describe('calculateFindingStatus', () => {
    it('flags High values', () => {
      expect(calculateFindingStatus(3.4, 0, 1.0)).toBe('High');
    });

    it('flags Low values', () => {
      expect(calculateFindingStatus(11.4, 12.0, 16.0)).toBe('Low');
    });

    it('flags Normal values', () => {
      expect(calculateFindingStatus(14.0, 12.0, 16.0)).toBe('Normal');
    });

    it('flags Critical High values', () => {
      expect(calculateFindingStatus(6.5, 3.5, 5.0, 6.0)).toBe('Critical');
    });

    it('flags Critical Low values', () => {
      expect(calculateFindingStatus(2.2, 3.5, 5.0, 6.0, 2.5)).toBe('Critical');
    });

    it('handles string numbers with units cleanly', () => {
      expect(calculateFindingStatus('3.4 mg/L', 0, 1.0)).toBe('High');
      expect(calculateFindingStatus('invalid', 0, 1.0)).toBe('Normal');
    });
  });

  describe('synthesizeClinicalInsights', () => {
    it('generates structured insights grounded in laboratory and symptom data', () => {
      const insights = synthesizeClinicalInsights(mockFindings, mockPatient);
      expect(insights.length).toBeGreaterThanOrEqual(3);

      const inflammatoryInsight = insights.find((i) => i.category.includes('Etiology'));
      expect(inflammatoryInsight).toBeDefined();
      expect(inflammatoryInsight?.finding).toContain('hs-CRP');
      expect(inflammatoryInsight?.whyItMatters).toContain('Potential concern');
      expect(inflammatoryInsight?.recommendedAction).toContain('Consider reviewing');
      expect(inflammatoryInsight?.confidence).toBe(96);
    });

    it('includes non-diagnostic clinical decision support wording', () => {
      const insights = synthesizeClinicalInsights(mockFindings, mockPatient);
      insights.forEach((insight) => {
        expect(insight.detail).toMatch(/pattern|may warrant|demonstrates|indicates/i);
      });
    });
  });

  describe('generateMedicationAlerts', () => {
    it('generates cardiovascular, organ clearance, and allergy alerts', () => {
      const alerts = generateMedicationAlerts(mockPatient, mockFindings);
      expect(alerts).toHaveLength(3);

      const allergyAlert = alerts.find((a) => a.type === 'Allergy-Sensitivity');
      expect(allergyAlert).toBeDefined();
      expect(allergyAlert?.severity).toBe('critical');
      expect(allergyAlert?.description).toContain('Penicillin');
    });

    it('handles patients with no documented allergies safely', () => {
      const alerts = generateMedicationAlerts({ ...mockPatient, allergies: '' }, mockFindings);
      const allergyAlert = alerts.find((a) => a.type === 'Allergy-Sensitivity');
      expect(allergyAlert?.severity).toBe('info');
      expect(allergyAlert?.title).toBe('No Documented Drug Allergies');
    });
  });

  describe('buildMedicalTimeline', () => {
    it('constructs chronological timeline of events', () => {
      const timeline = buildMedicalTimeline(mockPatient, mockFindings);
      expect(timeline).toHaveLength(4);
      expect(timeline[0].type).toBe('condition');
      expect(timeline[3].type).toBe('lab');
    });
  });

  describe('synthesizeDecisionBrief', () => {
    it('synthesizes complete decision brief with disclaimer and actions', () => {
      const alerts = generateMedicationAlerts(mockPatient, mockFindings);
      const brief = synthesizeDecisionBrief(mockPatient as any, mockFindings, alerts);

      expect(brief.patientHeader).toContain('Eleanor Vance (58F)');
      expect(brief.impression).toContain('hs-CRP 3.4 mg/L');
      expect(brief.recommendations).toHaveLength(3);
      expect(brief.disclaimer).toBe(
        'MedLens provides clinical decision support and does not replace professional medical judgment.'
      );
    });
  });
});
