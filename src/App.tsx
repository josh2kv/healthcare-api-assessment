import './App.css';
import { useAssessmentAnalysis } from '@/lib/api/hooks/useAssessmentAnalysis';

function App() {
  const {
    analysis,
    isLoading,
    error,
    isError,
    totalPages,
    expectedTotal,
    actualTotal,
    isComplete,
    successfulPages,
    isLoadingAdditionalPages,
    completionPercentage,
  } = useAssessmentAnalysis();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">Loading patient data...</div>
          <div className="text-sm text-gray-600">
            Staggered requests (0.5s delays) + smart retry: infinite for 429,
            3×3s for 500+
          </div>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = (error as Error)?.message || 'Unknown error';
    const isRateLimit =
      errorMessage.includes('429') || errorMessage.includes('rate limit');
    const isServerError =
      errorMessage.includes('502') ||
      errorMessage.includes('500') ||
      errorMessage.includes('503');

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-bold mb-2">
              Unable to load patient data
            </h2>

            {isRateLimit && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800 font-semibold">
                  Rate Limit Exceeded
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  The API is rate-limited. Please wait a moment and try again.
                </p>
              </div>
            )}

            {isServerError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-800 font-semibold">Server Error</p>
                <p className="text-red-700 text-sm mt-1">
                  The assessment server is experiencing issues. Please try again
                  later.
                </p>
              </div>
            )}

            {!isRateLimit && !isServerError && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <p className="text-gray-800 font-semibold">Network Error</p>
                <p className="text-gray-700 text-sm mt-1">{errorMessage}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No patient data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Healthcare Risk Assessment Dashboard
        </h1>

        {/* Data Collection Progress */}
        {!isComplete && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-800 font-semibold">
                Collecting All Patient Data...
              </span>
              <span className="text-blue-600 text-sm">
                {completionPercentage}% complete
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-blue-700">
              {actualTotal} of {expectedTotal} patients collected (
              {successfulPages}/{totalPages} pages)
              {isLoadingAdditionalPages && ' • Retrying failed requests...'}
            </div>
          </div>
        )}

        {/* Collection Complete Status */}
        {isComplete && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">✓</div>
              <span className="text-green-800 font-semibold">
                All {actualTotal} patients successfully collected from{' '}
                {totalPages} pages
              </span>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Patients
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {analysis.totalPatients}
            </p>
            {!isComplete && (
              <p className="text-xs text-gray-500">
                of {expectedTotal} expected
              </p>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Average Risk Score
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {analysis.averageRiskScore}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              High Risk Patients
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {analysis.high_risk_patients.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Fever Cases</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {analysis.fever_patients.length}
            </p>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Risk Distribution
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysis.riskDistribution.low}
              </div>
              <div className="text-sm text-gray-600">Low Risk (0-2)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analysis.riskDistribution.medium}
              </div>
              <div className="text-sm text-gray-600">Medium Risk (3)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analysis.riskDistribution.high}
              </div>
              <div className="text-sm text-gray-600">High Risk (4+)</div>
            </div>
          </div>
        </div>

        {/* Alert Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* High Risk Patients */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              High Risk Patients ({analysis.high_risk_patients.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analysis.high_risk_patients.map((patientId: string) => (
                <div key={patientId} className="p-2 bg-red-50 rounded text-sm">
                  {patientId}
                </div>
              ))}
            </div>
          </div>

          {/* Fever Patients */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-yellow-600 mb-4">
              Fever Patients ({analysis.fever_patients.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analysis.fever_patients.map((patientId: string) => (
                <div
                  key={patientId}
                  className="p-2 bg-yellow-50 rounded text-sm"
                >
                  {patientId}
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality Issues */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-purple-600 mb-4">
              Data Quality Issues ({analysis.data_quality_issues.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analysis.data_quality_issues.map((patientId: string) => (
                <div
                  key={patientId}
                  className="p-2 bg-purple-50 rounded text-sm"
                >
                  {patientId}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submission Ready Indicator */}
        <div
          className={`border p-6 rounded-lg ${
            isComplete
              ? 'bg-green-50 border-green-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <h2
            className={`text-xl font-bold mb-2 ${
              isComplete ? 'text-green-900' : 'text-blue-900'
            }`}
          >
            {isComplete
              ? 'Assessment Complete - Ready for Submission'
              : 'Assessment In Progress'}
          </h2>
          <p
            className={`mb-4 ${
              isComplete ? 'text-green-700' : 'text-blue-700'
            }`}
          >
            {isComplete
              ? `All ${actualTotal} patients analyzed and ready for submission to the assessment API.`
              : `Collecting patient data... ${actualTotal}/${expectedTotal} patients analyzed so far.`}
          </p>
          <div
            className={`text-sm font-mono p-3 rounded ${
              isComplete
                ? 'text-green-600 bg-green-100'
                : 'text-blue-600 bg-blue-100'
            }`}
          >
            <div>High Risk: {JSON.stringify(analysis.high_risk_patients)}</div>
            <div>Fever: {JSON.stringify(analysis.fever_patients)}</div>
            <div>
              Data Quality: {JSON.stringify(analysis.data_quality_issues)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
