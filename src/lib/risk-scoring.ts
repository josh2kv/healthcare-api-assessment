import type { Patient } from '@/types/patients';
import {
  BloodPressureRisk,
  BloodPressureThresholds,
  TemperatureRisk,
  TemperatureThresholds,
  AgeRisk,
  AgeThresholds,
  HIGH_RISK_THRESHOLD,
} from '@/types/enums';

// Blood Pressure Risk Scoring
export function calculateBloodPressureRisk(
  bloodPressure: string | null,
): number {
  if (!bloodPressure || typeof bloodPressure !== 'string') {
    return BloodPressureRisk.INVALID;
  }

  // Check for invalid formats
  const bpParts = bloodPressure.split('/');
  if (bpParts.length !== 2) {
    return BloodPressureRisk.INVALID;
  }

  const [systolicStr, diastolicStr] = bpParts;

  // Check for missing values (e.g., "150/" or "/90")
  if (!systolicStr.trim() || !diastolicStr.trim()) {
    return BloodPressureRisk.INVALID;
  }

  const systolic = parseInt(systolicStr.trim(), 10);
  const diastolic = parseInt(diastolicStr.trim(), 10);

  // Check for non-numeric values
  if (isNaN(systolic) || isNaN(diastolic)) {
    return BloodPressureRisk.INVALID;
  }

  // Determine risk based on higher of systolic or diastolic category
  let systolicRisk = 0;
  let diastolicRisk = 0;

  // Systolic risk categories
  if (systolic <= BloodPressureThresholds.SYSTOLIC.NORMAL_MAX) {
    systolicRisk = BloodPressureRisk.NORMAL;
  } else if (
    systolic >= BloodPressureThresholds.SYSTOLIC.ELEVATED_MIN &&
    systolic <= BloodPressureThresholds.SYSTOLIC.ELEVATED_MAX
  ) {
    systolicRisk = BloodPressureRisk.ELEVATED;
  } else if (
    systolic >= BloodPressureThresholds.SYSTOLIC.STAGE_1_MIN &&
    systolic <= BloodPressureThresholds.SYSTOLIC.STAGE_1_MAX
  ) {
    systolicRisk = BloodPressureRisk.STAGE_1;
  } else if (systolic >= BloodPressureThresholds.SYSTOLIC.STAGE_2_MIN) {
    systolicRisk = BloodPressureRisk.STAGE_2;
  }

  // Diastolic risk categories
  if (diastolic <= BloodPressureThresholds.DIASTOLIC.NORMAL_MAX) {
    diastolicRisk = BloodPressureRisk.NORMAL;
  } else if (
    diastolic >= BloodPressureThresholds.DIASTOLIC.STAGE_1_MIN &&
    diastolic <= BloodPressureThresholds.DIASTOLIC.STAGE_1_MAX
  ) {
    diastolicRisk = BloodPressureRisk.STAGE_1;
  } else if (diastolic >= BloodPressureThresholds.DIASTOLIC.STAGE_2_MIN) {
    diastolicRisk = BloodPressureRisk.STAGE_2;
  }

  // Special case for Elevated: Systolic 120-129 AND Diastolic <80
  if (
    systolic >= BloodPressureThresholds.SYSTOLIC.ELEVATED_MIN &&
    systolic <= BloodPressureThresholds.SYSTOLIC.ELEVATED_MAX &&
    diastolic <= BloodPressureThresholds.DIASTOLIC.NORMAL_MAX
  ) {
    return BloodPressureRisk.ELEVATED;
  }

  // Return the higher risk stage (as per requirement)
  return Math.max(systolicRisk, diastolicRisk);
}

// Temperature Risk Scoring
export function calculateTemperatureRisk(
  temperature: number | string | null,
): number {
  if (temperature === null || temperature === undefined) {
    return TemperatureRisk.INVALID;
  }

  const temp =
    typeof temperature === 'string' ? parseFloat(temperature) : temperature;

  // Check for non-numeric values
  if (isNaN(temp)) {
    return TemperatureRisk.INVALID;
  }

  if (temp <= TemperatureThresholds.NORMAL_MAX) return TemperatureRisk.NORMAL;
  if (
    temp >= TemperatureThresholds.FEVER_MIN &&
    temp <= TemperatureThresholds.LOW_FEVER_MAX
  )
    return TemperatureRisk.LOW_FEVER;
  if (temp >= TemperatureThresholds.HIGH_FEVER_MIN)
    return TemperatureRisk.HIGH_FEVER;

  return TemperatureRisk.INVALID;
}

// Age Risk Scoring
export function calculateAgeRisk(age: number | string | null): number {
  if (age === null || age === undefined) {
    return AgeRisk.INVALID;
  }

  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;

  // Check for non-numeric values
  if (isNaN(ageNum)) {
    return AgeRisk.INVALID;
  }

  if (ageNum <= AgeThresholds.UNDER_40_MAX) return AgeRisk.UNDER_40;
  if (
    ageNum >= AgeThresholds.MIDDLE_AGE_MIN &&
    ageNum <= AgeThresholds.MIDDLE_AGE_MAX
  )
    return AgeRisk.MIDDLE_AGE;
  if (ageNum >= AgeThresholds.OVER_65_MIN) return AgeRisk.OVER_65;

  return AgeRisk.INVALID;
}

// Calculate total risk score
export function calculateTotalRiskScore(patient: Patient): number {
  const bpRisk = calculateBloodPressureRisk(patient.blood_pressure);
  const tempRisk = calculateTemperatureRisk(patient.temperature);
  const ageRisk = calculateAgeRisk(patient.age);

  return bpRisk + tempRisk + ageRisk;
}

// Check if patient has fever (temp >= 99.6°F)
export function hasFever(patient: Patient): boolean {
  if (patient.temperature === null || patient.temperature === undefined) {
    return false;
  }

  const temp =
    typeof patient.temperature === 'string'
      ? parseFloat(patient.temperature)
      : patient.temperature;

  return !isNaN(temp) && temp >= TemperatureThresholds.FEVER_MIN;
}

// Check if patient has data quality issues
export function hasDataQualityIssues(patient: Patient): boolean {
  // Check if BP is invalid/missing
  const bpValid =
    patient.blood_pressure !== null &&
    patient.blood_pressure !== undefined &&
    calculateBloodPressureRisk(patient.blood_pressure) >
      BloodPressureRisk.INVALID;

  // Check if temperature is invalid/missing
  const tempValid =
    patient.temperature !== null &&
    patient.temperature !== undefined &&
    !isNaN(
      typeof patient.temperature === 'string'
        ? parseFloat(patient.temperature)
        : patient.temperature,
    );

  // Check if age is invalid/missing
  const ageValid =
    patient.age !== null &&
    patient.age !== undefined &&
    calculateAgeRisk(patient.age) > AgeRisk.INVALID;

  return !bpValid || !tempValid || !ageValid;
}

// Generate all alert lists from patient data
export interface AlertLists {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}

export function generateAlertLists(patients: Patient[]): AlertLists {
  const highRisk: string[] = [];
  const fever: string[] = [];
  const dataQuality: string[] = [];

  for (const patient of patients) {
    const totalRisk = calculateTotalRiskScore(patient);

    // High-Risk Patients: total risk score ≥ 4
    if (totalRisk >= HIGH_RISK_THRESHOLD) {
      highRisk.push(patient.patient_id);
    }

    // Fever Patients: temperature ≥ 99.6°F
    if (hasFever(patient)) {
      fever.push(patient.patient_id);
    }

    // Data Quality Issues: invalid/missing BP, Age, or Temp
    if (hasDataQualityIssues(patient)) {
      dataQuality.push(patient.patient_id);
    }
  }

  return {
    high_risk_patients: highRisk,
    fever_patients: fever,
    data_quality_issues: dataQuality,
  };
}
