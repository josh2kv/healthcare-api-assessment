export interface Patient {
  patient_id: string;
  name: string;
  age: number | string | null;
  gender: string;
  blood_pressure: string | null;
  temperature: number | string | null;
  visit_date: string;
  diagnosis: string;
  medications: string;
}

export interface ResPatients {
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  metadata: Record<string, unknown>;
}

// Generate all alert lists from patient data
export interface AlertLists {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}
