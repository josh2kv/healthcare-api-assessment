
# Healthcare API Assessment

## Todo List

### 1. API Integration

- [ ] Fetch all patients from the API using Promise.all
- [ ] Add retry logic for 500/503 errors (~8% failure rate)
- [ ] Handle rate limiting (429 errors)
- [ ] Implement pagination to fetch all patients (5 per page, ~10 pages)
- [ ] Handle inconsistent/missing data in API responses

### 2. Data Processing & Risk Scoring

- [ ] Parse and validate blood pressure, temperature, and age fields
- [ ] Calculate blood pressure risk score (1-4 points, 0 for invalid)
- [ ] Calculate temperature risk score (0-2 points, 0 for invalid)
- [ ] Calculate age risk score (1-2 points, 0 for invalid)
- [ ] Sum category scores for total risk score

### 3. Alert List Generation

- [ ] Identify high-risk patients (total risk score ≥ 4)
- [ ] Identify fever patients (temperature ≥ 99.6°F)
- [ ] Identify patients with data quality issues (invalid/missing BP, age, or temp)

### 4. Submission

- [ ] Format results as required JSON object
- [ ] Submit results via POST /api/submit-assessment with x-api-key
- [ ] Handle and display submission feedback
- [ ] Track submission attempts (max 3)

### 5. Repository & Documentation

- [ ] Document setup and usage in README.md
- [ ] Push code to a public repository
- [ ] Submit repository URL as required
