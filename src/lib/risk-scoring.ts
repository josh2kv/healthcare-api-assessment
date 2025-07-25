import type { AlertLists, Patient } from '@/types/patients';
import {
  BloodPressureRiskPoint,
  BloodPressureThresholds,
  TemperatureRiskPoint,
  TemperatureThresholds,
  AgeRiskPoint,
  AgeThresholds,
  HIGH_RISK_THRESHOLD,
} from '@/types/enums';

// Blood Pressure Risk Scoring
export function calculateBloodPressureRisk(
  bloodPressure: string | null,
): number {
  if (!bloodPressure || typeof bloodPressure !== 'string') {
    return BloodPressureRiskPoint.INVALID;
  }

  // Check for invalid formats
  const bpParts = bloodPressure.split('/');
  if (bpParts.length !== 2) {
    return BloodPressureRiskPoint.INVALID;
  }

  const [systolicStr, diastolicStr] = bpParts;

  // Check for missing values (e.g., "150/" or "/90")
  if (!systolicStr.trim() || !diastolicStr.trim()) {
    return BloodPressureRiskPoint.INVALID;
  }

  const systolic = parseInt(systolicStr.trim(), 10);
  const diastolic = parseInt(diastolicStr.trim(), 10);

  // Check for non-numeric values
  if (isNaN(systolic) || isNaN(diastolic)) {
    return BloodPressureRiskPoint.INVALID;
  }

  // Stage 2 (Systolic ≥140 OR Diastolic ≥90): 3 points
  if (
    systolic >= BloodPressureThresholds.SYSTOLIC.STAGE_2_MIN ||
    diastolic >= BloodPressureThresholds.DIASTOLIC.STAGE_2_MIN
  ) {
    return BloodPressureRiskPoint.STAGE_2;
  }

  // Stage 1 (Systolic 130‑139 OR Diastolic 80‑89): 2 points
  if (
    (systolic >= BloodPressureThresholds.SYSTOLIC.STAGE_1_MIN &&
      systolic <= BloodPressureThresholds.SYSTOLIC.STAGE_1_MAX) ||
    (diastolic >= BloodPressureThresholds.DIASTOLIC.STAGE_1_MIN &&
      diastolic <= BloodPressureThresholds.DIASTOLIC.STAGE_1_MAX)
  ) {
    return BloodPressureRiskPoint.STAGE_1;
  }

  // Elevated (Systolic 120‑129 AND Diastolic <80): 1 point
  if (
    systolic >= BloodPressureThresholds.SYSTOLIC.ELEVATED_MIN &&
    systolic <= BloodPressureThresholds.SYSTOLIC.ELEVATED_MAX &&
    diastolic < BloodPressureThresholds.DIASTOLIC.STAGE_1_MIN
  ) {
    return BloodPressureRiskPoint.ELEVATED;
  }

  // Normal (Systolic <120 AND Diastolic <80): 0 point
  if (
    systolic < BloodPressureThresholds.SYSTOLIC.ELEVATED_MIN &&
    diastolic < BloodPressureThresholds.DIASTOLIC.STAGE_1_MIN
  ) {
    return BloodPressureRiskPoint.NORMAL;
  }

  return BloodPressureRiskPoint.INVALID;
}

// Temperature Risk Scoring
export function calculateTemperatureRisk(
  temperature: number | string | null,
): number {
  if (temperature === null || temperature === undefined) {
    return TemperatureRiskPoint.INVALID;
  }

  const temp =
    typeof temperature === 'string' ? parseFloat(temperature) : temperature;

  if (isNaN(temp)) {
    return TemperatureRiskPoint.INVALID;
  }

  if (temp >= TemperatureThresholds.HIGH_FEVER_MIN) {
    return TemperatureRiskPoint.HIGH_FEVER;
  }

  if (temp <= TemperatureThresholds.NORMAL_MAX) {
    return TemperatureRiskPoint.NORMAL;
  }

  if (
    temp >= TemperatureThresholds.FEVER_MIN &&
    temp <= TemperatureThresholds.LOW_FEVER_MAX
  ) {
    return TemperatureRiskPoint.LOW_FEVER;
  }

  return TemperatureRiskPoint.INVALID;
}

// Age Risk Scoring
export function calculateAgeRisk(age: number | string | null): number {
  if (age === null || age === undefined) {
    return AgeRiskPoint.INVALID;
  }

  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;

  // Check for non-numeric values
  if (isNaN(ageNum)) {
    return AgeRiskPoint.INVALID;
  }

  if (ageNum > AgeThresholds.MIDDLE_AGE_MAX) {
    return AgeRiskPoint.OVER_65;
  }

  if (ageNum < AgeThresholds.MIDDLE_AGE_MIN) {
    return AgeRiskPoint.UNDER_40;
  }

  if (
    ageNum >= AgeThresholds.MIDDLE_AGE_MIN &&
    ageNum <= AgeThresholds.MIDDLE_AGE_MAX
  ) {
    return AgeRiskPoint.BETWEEN_40_65;
  }

  return AgeRiskPoint.INVALID;
}

// Calculate total risk score
export function calculateTotalRiskScore(patient: Patient): number {
  const bpRisk = calculateBloodPressureRisk(patient.blood_pressure);
  const tempRisk = calculateTemperatureRisk(patient.temperature);
  const ageRisk = calculateAgeRisk(patient.age);
  console.log(patient, bpRisk, tempRisk, ageRisk);
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
      BloodPressureRiskPoint.INVALID;

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
    calculateAgeRisk(patient.age) > AgeRiskPoint.INVALID;

  return !bpValid || !tempValid || !ageValid;
}

export function generateAlertLists(patients: Patient[]): AlertLists {
  const highRisk: string[] = [];
  const fever: string[] = [];
  const dataQuality: string[] = [];

  // Filter out undefined/null patients that might result from failed API requests
  const validPatients = patients.filter(patient => patient != null);

  for (const patient of validPatients) {
    const totalRisk = calculateTotalRiskScore(patient);

    // High-Risk Patients: total risk score ≥ 4
    if (totalRisk >= HIGH_RISK_THRESHOLD) {
      highRisk.push(patient.patient_id);
    }

    // Fever Patients: temperature ≥ 99.6°F
    if (hasFever(patient)) {
      fever.push(patient.patient_id);
    }

    // Data Quality Issues: missing or invalid critical data
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
