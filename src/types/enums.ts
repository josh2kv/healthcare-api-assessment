export const BloodPressureRiskPoint = {
  INVALID: 0,
  NORMAL: 0,
  ELEVATED: 1,
  STAGE_1: 2,
  STAGE_2: 3,
} as const;

export const TemperatureRiskPoint = {
  INVALID: 0,
  NORMAL: 0,
  LOW_FEVER: 1,
  HIGH_FEVER: 2,
} as const;

export const AgeRiskPoint = {
  INVALID: 0,
  UNDER_40: 0,
  BETWEEN_40_65: 1,
  OVER_65: 2,
} as const;

export const TemperatureThresholds = {
  NORMAL_MAX: 99.5,
  FEVER_MIN: 99.6,
  LOW_FEVER_MAX: 100.9,
  HIGH_FEVER_MIN: 101.0,
} as const;

export const BloodPressureThresholds = {
  SYSTOLIC: {
    ELEVATED_MIN: 120,
    ELEVATED_MAX: 129,
    STAGE_1_MIN: 130,
    STAGE_1_MAX: 139,
    STAGE_2_MIN: 140,
  },
  DIASTOLIC: {
    STAGE_1_MIN: 80,
    STAGE_1_MAX: 89,
    STAGE_2_MIN: 90,
  },
} as const;

export const AgeThresholds = {
  MIDDLE_AGE_MIN: 40,
  MIDDLE_AGE_MAX: 65,
} as const;

export const HIGH_RISK_THRESHOLD = 4;
