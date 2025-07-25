
# Healthcare API Assessment

## Errors

### 429

```json
{
    "error": "Rate limit exceeded",
    "message": "Too many requests. Please wait before trying again.",
    "retry_after": 20
}
```

### 500

```json
{
    "error": "Internal server error"
}
```

### 503

  ```json
  {
      "error": "Service temporarily unavailable"
  }
  ```

## Todo List

### 1. API Integration

- [x] Fetch all patients from the API using Promise.all
- [x] Add retry logic for 500/503 errors (~8% failure rate)
- [x] Handle rate limiting (429 errors)
- [x] Implement pagination to fetch all patients (5 per page, ~10 pages)
- [x] Handle inconsistent/missing data in API responses

### 2. Data Processing & Risk Scoring

- [x] Parse and validate blood pressure, temperature, and age fields
- [x] Calculate blood pressure risk score (1-4 points, 0 for invalid)
- [x] Calculate temperature risk score (0-2 points, 0 for invalid)
- [x] Calculate age risk score (1-2 points, 0 for invalid)
- [x] Sum category scores for total risk score

### 3. Alert List Generation

- [x] Identify high-risk patients (total risk score ≥ 4)
- [x] Identify fever patients (temperature ≥ 99.6°F)
- [x] Identify patients with data quality issues (invalid/missing BP, age, or temp)

### 4. Submission

- [ ] Format results as required JSON object
- [ ] Submit results via POST /api/submit-assessment with x-api-key
- [ ] Handle and display submission feedback
- [ ] Track submission attempts (max 3)

### 5. Repository & Documentation

- [ ] Document setup and usage in README.md
- [ ] Push code to a public repository
- [ ] Submit repository URL as required
