import './App.css';
import { useAllPatientsQuery } from '@/lib/api/hooks/useAllPatientsQuery';

function App() {
  const { data: patients, isLoading, error, isError } = useAllPatientsQuery();

  // TODO: Add skeleton loader
  if (isLoading) {
    return <div>Loading patients...</div>;
  }

  if (isError) {
    return (
      <div>
        <h2>Error loading patients:</h2>
        <pre>{error?.message || 'Unknown error'}</pre>
      </div>
    );
  }

  return (
    <div>
      <h1>Healthcare Assessment - Patient Data</h1>
      <p>Total patients loaded: {patients?.length || 0}</p>

      {patients && patients.length > 0 && (
        <div>
          <h2>First 5 patients:</h2>
          <ul>
            {patients.slice(0, 5).map(patient => (
              <li key={patient.patient_id}>
                {patient.name} - Age: {patient.age} - BP:{' '}
                {patient.blood_pressure} - Temp: {patient.temperature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
