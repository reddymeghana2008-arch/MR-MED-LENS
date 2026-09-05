import type { PatientFormData, PatientFormErrors } from '../types/patient';

export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Validates clinical intake form data with boundary checking and detailed messages.
 */
export const validatePatientFormData = (
  formData: PatientFormData
): { isValid: boolean; errors: PatientFormErrors } => {
  const errors: PatientFormErrors = {};

  // 1. Patient Name Validation
  if (!formData.patientName || !formData.patientName.trim()) {
    errors.patientName = 'Patient Name is required.';
  } else if (formData.patientName.trim().length < 2) {
    errors.patientName = 'Patient Name must be at least 2 characters.';
  } else if (formData.patientName.trim().length > 100) {
    errors.patientName = 'Patient Name must not exceed 100 characters.';
  }

  // 2. Age Validation
  if (!formData.age || formData.age.toString().trim() === '') {
    errors.age = 'Age is required.';
  } else {
    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
      errors.age = 'Please enter a valid whole number for age.';
    } else if (ageNum < 0 || ageNum > 130) {
      errors.age = 'Age must be between 0 and 130.';
    }
  }

  // 3. Sex Validation
  if (!formData.sex) {
    errors.sex = 'Please select a sex option.';
  }

  // 4. Symptoms Validation
  if (!formData.symptoms || !formData.symptoms.trim()) {
    errors.symptoms = 'Symptoms are required for clinical intake.';
  } else if (formData.symptoms.trim().length < 3) {
    errors.symptoms = 'Please describe symptoms in more detail (min 3 characters).';
  } else if (formData.symptoms.length > 500) {
    errors.symptoms = 'Symptoms must not exceed 500 characters.';
  }

  // 5. Optional Fields Length Guard
  if (formData.existingConditions && formData.existingConditions.length > 500) {
    errors.existingConditions = 'Existing conditions must not exceed 500 characters.';
  }
  if (formData.allergies && formData.allergies.length > 500) {
    errors.allergies = 'Allergies must not exceed 500 characters.';
  }
  if (formData.currentMedications && formData.currentMedications.length > 500) {
    errors.currentMedications = 'Current medications must not exceed 500 characters.';
  }
  if (formData.additionalNotes && formData.additionalNotes.length > 1000) {
    errors.additionalNotes = 'Additional notes must not exceed 1000 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitizes uploaded file names to avoid directory traversal and unsafe characters.
 */
export const sanitizeFileName = (name: string): string => {
  if (!name || typeof name !== 'string') return 'report.pdf';
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
};

/**
 * Validates medical report file size and format.
 */
export const validateReportFile = (
  file: { name?: string; size?: number; type?: string } | null | undefined
): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'Please select or upload a medical report file.' };
  }

  if (typeof file.size !== 'number' || file.size <= 0) {
    return {
      isValid: false,
      error: 'The selected file is empty (0 bytes). Please upload a valid medical report.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File is too large. Maximum allowed file size is 25 MB.`,
    };
  }

  const fileName = (file.name || '').toLowerCase();
  const fileType = file.type || '';
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  const hasValidMime = ALLOWED_MIME_TYPES.includes(fileType);

  if (!hasValidExt && !hasValidMime) {
    return {
      isValid: false,
      error: 'Invalid file format. Please upload a PDF, PNG, JPG, or JPEG file.',
    };
  }

  return { isValid: true };
};
