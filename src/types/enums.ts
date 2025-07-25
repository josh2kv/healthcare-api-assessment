// Risk Score Constants
export const BloodPressureRisk = {
  INVALID: 0,
  NORMAL: 1,
  ELEVATED: 2,
  STAGE_1: 3,
  STAGE_2: 4,
} as const;

export const TemperatureRisk = {
  INVALID: 0,
  NORMAL: 0,
  LOW_FEVER: 1,
  HIGH_FEVER: 2,
} as const;

export const AgeRisk = {
  INVALID: 0,
  UNDER_40: 1,
  MIDDLE_AGE: 1, // 40-65
  OVER_65: 2,
} as const;

// Temperature Thresholds
export const TemperatureThresholds = {
  NORMAL_MAX: 99.5,
  FEVER_MIN: 99.6,
  LOW_FEVER_MAX: 100.9,
  HIGH_FEVER_MIN: 101.0,
} as const;

// Blood Pressure Thresholds
export const BloodPressureThresholds = {
  SYSTOLIC: {
    NORMAL_MAX: 119,
    ELEVATED_MIN: 120,
    ELEVATED_MAX: 129,
    STAGE_1_MIN: 130,
    STAGE_1_MAX: 139,
    STAGE_2_MIN: 140,
  },
  DIASTOLIC: {
    NORMAL_MAX: 79,
    STAGE_1_MIN: 80,
    STAGE_1_MAX: 89,
    STAGE_2_MIN: 90,
  },
} as const;

// Age Thresholds
export const AgeThresholds = {
  UNDER_40_MAX: 39,
  MIDDLE_AGE_MIN: 40,
  MIDDLE_AGE_MAX: 65,
  OVER_65_MIN: 66,
} as const;

// High Risk Threshold
export const HIGH_RISK_THRESHOLD = 4;
