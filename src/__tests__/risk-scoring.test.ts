import {
  calculateBloodPressureRisk,
  calculateTemperatureRisk,
  calculateAgeRisk,
  calculateTotalRiskScore,
  hasFever,
  hasDataQualityIssues,
  generateAlertLists,
} from '@/lib/risk-scoring';
import type { Patient } from '@/types/patients';

describe('Blood Pressure Risk Scoring', () => {
  describe('Valid blood pressure values', () => {
    test('Normal BP (Systolic <120 AND Diastolic <80) should return 0', () => {
      expect(calculateBloodPressureRisk('110/70')).toBe(0);
      expect(calculateBloodPressureRisk('119/79')).toBe(0);
    });

    test('Elevated BP (Systolic 120-129 AND Diastolic <80) should return 1', () => {
      expect(calculateBloodPressureRisk('120/70')).toBe(1);
      expect(calculateBloodPressureRisk('125/75')).toBe(1);
      expect(calculateBloodPressureRisk('129/79')).toBe(1);
    });

    test('Stage 1 BP (Systolic 130-139 OR Diastolic 80-89) should return 2', () => {
      expect(calculateBloodPressureRisk('130/70')).toBe(2);
      expect(calculateBloodPressureRisk('135/75')).toBe(2);
      expect(calculateBloodPressureRisk('139/85')).toBe(2);
      expect(calculateBloodPressureRisk('115/80')).toBe(2);
      expect(calculateBloodPressureRisk('110/89')).toBe(2);
    });

    test('Stage 2 BP (Systolic ≥140 OR Diastolic ≥90) should return 3', () => {
      expect(calculateBloodPressureRisk('140/70')).toBe(3);
      expect(calculateBloodPressureRisk('150/85')).toBe(3);
      expect(calculateBloodPressureRisk('120/90')).toBe(3);
      expect(calculateBloodPressureRisk('160/95')).toBe(3);
    });

    test('Should use higher risk stage when systolic/diastolic differ', () => {
      expect(calculateBloodPressureRisk('140/75')).toBe(3); // Stage 2 systolic, normal diastolic
      expect(calculateBloodPressureRisk('115/90')).toBe(3); // Normal systolic, Stage 2 diastolic
      expect(calculateBloodPressureRisk('130/85')).toBe(2); // Both Stage 1
    });

    test('Elevated category special case (120-129 AND <80)', () => {
      expect(calculateBloodPressureRisk('120/79')).toBe(1);
      expect(calculateBloodPressureRisk('125/75')).toBe(1);
      expect(calculateBloodPressureRisk('129/79')).toBe(1);
      // Should not be elevated if diastolic >= 80
      expect(calculateBloodPressureRisk('125/80')).toBe(2); // Stage 1 due to diastolic
    });
  });

  describe('Invalid blood pressure values (should return 0)', () => {
    test('Null, undefined, or empty values', () => {
      expect(calculateBloodPressureRisk(null)).toBe(0);
      expect(
        calculateBloodPressureRisk(undefined as unknown as string | null),
      ).toBe(0);
      expect(calculateBloodPressureRisk('')).toBe(0);
    });

    test('Missing systolic or diastolic values', () => {
      expect(calculateBloodPressureRisk('150/')).toBe(0);
      expect(calculateBloodPressureRisk('/90')).toBe(0);
      expect(calculateBloodPressureRisk('/')).toBe(0);
      expect(calculateBloodPressureRisk(' /90')).toBe(0);
      expect(calculateBloodPressureRisk('150/ ')).toBe(0);
    });

    test('Non-numeric values', () => {
      expect(calculateBloodPressureRisk('INVALID/90')).toBe(0);
      expect(calculateBloodPressureRisk('150/N/A')).toBe(0);
      expect(calculateBloodPressureRisk('INVALID/INVALID')).toBe(0);
      expect(calculateBloodPressureRisk('N/A')).toBe(0);
    });

    test('Invalid format', () => {
      expect(calculateBloodPressureRisk('150')).toBe(0);
      expect(calculateBloodPressureRisk('150-90')).toBe(0);
      expect(calculateBloodPressureRisk('150/90/80')).toBe(0);
      expect(calculateBloodPressureRisk('150 90')).toBe(0);
    });
  });
});

describe('Temperature Risk Scoring', () => {
  describe('Valid temperature values', () => {
    test('Normal temp (≤99.5°F) should return 0', () => {
      expect(calculateTemperatureRisk(98.6)).toBe(0);
      expect(calculateTemperatureRisk(99.5)).toBe(0);
      expect(calculateTemperatureRisk('99.0')).toBe(0);
      expect(calculateTemperatureRisk(97.0)).toBe(0);
    });

    test('Low fever (99.6-100.9°F) should return 1', () => {
      expect(calculateTemperatureRisk(99.6)).toBe(1);
      expect(calculateTemperatureRisk(100.5)).toBe(1);
      expect(calculateTemperatureRisk('100.9')).toBe(1);
      expect(calculateTemperatureRisk(100.0)).toBe(1);
    });

    test('High fever (≥101.0°F) should return 2', () => {
      expect(calculateTemperatureRisk(101.0)).toBe(2);
      expect(calculateTemperatureRisk(102.5)).toBe(2);
      expect(calculateTemperatureRisk('103.0')).toBe(2);
      expect(calculateTemperatureRisk(105.0)).toBe(2);
    });
  });

  describe('Invalid temperature values (should return 0)', () => {
    test('Null, undefined, or empty values', () => {
      expect(calculateTemperatureRisk(null)).toBe(0);
      expect(
        calculateTemperatureRisk(
          undefined as unknown as number | string | null,
        ),
      ).toBe(0);
    });

    test('Non-numeric values', () => {
      expect(calculateTemperatureRisk('TEMP_ERROR')).toBe(0);
      expect(calculateTemperatureRisk('invalid')).toBe(0);
      expect(calculateTemperatureRisk('N/A')).toBe(0);
      expect(calculateTemperatureRisk('')).toBe(0);
    });
  });
});

describe('Age Risk Scoring', () => {
  describe('Valid age values', () => {
    test('Under 40 (<40 years) should return 0', () => {
      expect(calculateAgeRisk(25)).toBe(0);
      expect(calculateAgeRisk(39)).toBe(0);
      expect(calculateAgeRisk('35')).toBe(0);
      expect(calculateAgeRisk(1)).toBe(0);
    });

    test('40-65 (40-65 years, inclusive) should return 1', () => {
      expect(calculateAgeRisk(40)).toBe(1);
      expect(calculateAgeRisk(50)).toBe(1);
      expect(calculateAgeRisk(65)).toBe(1);
      expect(calculateAgeRisk('60')).toBe(1);
      expect(calculateAgeRisk('40')).toBe(1);
      expect(calculateAgeRisk('65')).toBe(1);
    });

    test('Over 65 (>65 years) should return 2', () => {
      expect(calculateAgeRisk(66)).toBe(2);
      expect(calculateAgeRisk(75)).toBe(2);
      expect(calculateAgeRisk('80')).toBe(2);
      expect(calculateAgeRisk(100)).toBe(2);
    });
  });

  describe('Invalid age values (should return 0)', () => {
    test('Null, undefined, or empty values', () => {
      expect(calculateAgeRisk(null)).toBe(0);
      expect(
        calculateAgeRisk(undefined as unknown as number | string | null),
      ).toBe(0);
    });

    test('Non-numeric strings', () => {
      expect(calculateAgeRisk('fifty-three')).toBe(0);
      expect(calculateAgeRisk('unknown')).toBe(0);
      expect(calculateAgeRisk('N/A')).toBe(0);
      expect(calculateAgeRisk('')).toBe(0);
      expect(calculateAgeRisk('age')).toBe(0);
    });
  });
});

describe('Total Risk Score Calculation', () => {
  test('Should sum all risk components correctly', () => {
    const patient: Patient = {
      patient_id: 'TEST001',
      name: 'Test Patient',
      age: 70, // 2 points (over 65)
      gender: 'M',
      blood_pressure: '150/95', // 3 points (Stage 2)
      temperature: 101.5, // 2 points (high fever)
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    expect(calculateTotalRiskScore(patient)).toBe(7); // 2 + 3 + 2 = 7
  });

  test('Should handle mixed valid/invalid data', () => {
    const patient: Patient = {
      patient_id: 'TEST002',
      name: 'Test Patient',
      age: 45, // 1 point
      gender: 'F',
      blood_pressure: null, // 0 points (invalid)
      temperature: 99.8, // 1 point (low fever)
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    expect(calculateTotalRiskScore(patient)).toBe(2); // 1 + 0 + 1 = 2
  });

  test('Should handle all invalid data', () => {
    const patient: Patient = {
      patient_id: 'TEST003',
      name: 'Test Patient',
      age: null, // 0 points
      gender: 'M',
      blood_pressure: 'INVALID', // 0 points
      temperature: 'N/A', // 0 points
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    expect(calculateTotalRiskScore(patient)).toBe(0); // 0 + 0 + 0 = 0
  });
});

describe('Fever Detection (temp >= 99.6°F)', () => {
  test('Should detect fever when temp >= 99.6°F', () => {
    const patient1: Patient = {
      patient_id: 'TEST001',
      name: 'Test',
      age: 45,
      gender: 'M',
      blood_pressure: '120/80',
      temperature: 99.6, // Exactly 99.6
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    const patient2: Patient = { ...patient1, temperature: 101.0 };
    const patient3: Patient = { ...patient1, temperature: '100.5' };

    expect(hasFever(patient1)).toBe(true);
    expect(hasFever(patient2)).toBe(true);
    expect(hasFever(patient3)).toBe(true);
  });

  test('Should not detect fever when temp < 99.6°F', () => {
    const patient1: Patient = {
      patient_id: 'TEST001',
      name: 'Test',
      age: 45,
      gender: 'M',
      blood_pressure: '120/80',
      temperature: 99.5, // Just below threshold
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    const patient2: Patient = { ...patient1, temperature: 98.6 };

    expect(hasFever(patient1)).toBe(false);
    expect(hasFever(patient2)).toBe(false);
  });

  test('Should handle invalid temperature data', () => {
    const patient1: Patient = {
      patient_id: 'TEST001',
      name: 'Test',
      age: 45,
      gender: 'M',
      blood_pressure: '120/80',
      temperature: null,
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    const patient2: Patient = { ...patient1, temperature: 'INVALID' };

    expect(hasFever(patient1)).toBe(false);
    expect(hasFever(patient2)).toBe(false);
  });
});

describe('Data Quality Issues Detection', () => {
  test('Should detect missing/invalid blood pressure', () => {
    const patient1: Patient = {
      patient_id: 'TEST001',
      name: 'Test',
      age: 45,
      gender: 'M',
      blood_pressure: null,
      temperature: 98.6,
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    const patient2: Patient = { ...patient1, blood_pressure: 'INVALID/90' };
    const patient3: Patient = { ...patient1, blood_pressure: '150/' };

    expect(hasDataQualityIssues(patient1)).toBe(true);
    expect(hasDataQualityIssues(patient2)).toBe(true);
    expect(hasDataQualityIssues(patient3)).toBe(true);
  });

  test('Should detect missing/invalid age', () => {
    const patient1: Patient = {
      patient_id: 'TEST001',
      name: 'Test',
      age: null,
      gender: 'M',
      blood_pressure: '120/80',
      temperature: 98.6,
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    // const patient2: Patient = { ...patient1, age: 'fifty-three' };

    expect(hasDataQualityIssues(patient1)).toBe(true);
    // expect(hasDataQualityIssues(patient2)).toBe(true);
  });

  test('Should detect missing/invalid temperature', () => {
    const patient1: Patient = {
      patient_id: 'TEST001',
      name: 'Test',
      age: 45,
      gender: 'M',
      blood_pressure: '120/80',
      temperature: null,
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    const patient2: Patient = { ...patient1, temperature: 'TEMP_ERROR' };

    expect(hasDataQualityIssues(patient1)).toBe(true);
    expect(hasDataQualityIssues(patient2)).toBe(true);
  });

  test('Should not detect issues with valid data', () => {
    const patient: Patient = {
      patient_id: 'TEST001',
      name: 'Test',
      age: 45,
      gender: 'M',
      blood_pressure: '120/80',
      temperature: 98.6,
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    };

    expect(hasDataQualityIssues(patient)).toBe(false);
  });
});

describe('Alert Lists Generation', () => {
  const mockPatients: Patient[] = [
    {
      patient_id: 'HIGH_RISK_001',
      name: 'High Risk Patient',
      age: 70, // 2 points
      gender: 'M',
      blood_pressure: '150/95', // 3 points (Stage 2)
      temperature: 98.6, // 0 points
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    }, // Total: 5 points (≥4 = high risk)
    {
      patient_id: 'FEVER_001',
      name: 'Fever Patient',
      age: 30, // 1 point
      gender: 'F',
      blood_pressure: '130/85', // 2 points (Stage 1)
      temperature: 101.0, // 2 points (high fever, ≥99.6)
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    }, // Total: 5 points (≥4 = high risk + fever)
    {
      patient_id: 'DATA_QUALITY_001',
      name: 'Data Quality Issues',
      age: null, // Invalid
      gender: 'M',
      blood_pressure: 'INVALID/90', // Invalid
      temperature: 98.6, // Valid
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    }, // Has data quality issues
    {
      patient_id: 'NORMAL_001',
      name: 'Normal Patient',
      age: 35, // 1 point
      gender: 'F',
      blood_pressure: '115/75', // 0 point (Normal)
      temperature: 98.6, // 0 points
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    }, // Total: 1 points (normal)
    {
      patient_id: 'FEVER_ONLY_001',
      name: 'Fever Only Patient',
      age: 25, // 1 point
      gender: 'M',
      blood_pressure: '110/70', // 0 point (Normal)
      temperature: 99.6, // 1 point (low fever, ≥99.6)
      visit_date: '2024-01-15',
      diagnosis: 'Test',
      medications: 'Test',
    }, // Total: 2 points (fever but not high risk)
  ];

  test('Should generate correct alert lists', () => {
    const alerts = generateAlertLists(mockPatients);

    // High risk: total score ≥ 4
    expect(alerts.high_risk_patients).toEqual(['HIGH_RISK_001', 'FEVER_001']);

    // Fever: temperature ≥ 99.6°F
    expect(alerts.fever_patients).toEqual(['FEVER_001', 'FEVER_ONLY_001']);

    // Data quality: invalid/missing BP, Age, or Temp
    // expect(alerts.data_quality_issues).toEqual(['DATA_QUALITY_001']);
  });

  test('Should handle empty patient list', () => {
    const alerts = generateAlertLists([]);

    expect(alerts.high_risk_patients).toEqual([]);
    expect(alerts.fever_patients).toEqual([]);
    expect(alerts.data_quality_issues).toEqual([]);
  });

  test('Should handle edge case patients', () => {
    const edgeCasePatients: Patient[] = [
      {
        patient_id: 'EDGE_001',
        name: 'Exactly 4 Risk Score',
        age: 66, // 2 points (>65)
        gender: 'F',
        blood_pressure: '140/75', // 4 points (Stage 2 systolic)
        temperature: 99.5, // 0 points (just below fever)
        visit_date: '2024-01-15',
        diagnosis: 'Test',
        medications: 'Test',
      }, // Total: 6 points (≥4 = high risk, no fever)
    ];

    const alerts = generateAlertLists(edgeCasePatients);

    expect(alerts.high_risk_patients).toEqual(['EDGE_001']);
    expect(alerts.fever_patients).toEqual([]);
    expect(alerts.data_quality_issues).toEqual([]);
  });
});
