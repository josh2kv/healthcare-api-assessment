
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
- [x] Implement pagination to fetch all patients (5 per page, ~20 pages)
- [x] Handle inconsistent/missing data in API responses

### 2. Data Processing & Risk Scoring

- [x] Parse and validate blood pressure, temperature, and age fields
- [x] Calculate blood pressure risk score
- [x] Calculate temperature risk score
- [x] Calculate age risk score
- [x] Sum category scores for total risk score

### 3. Alert List Generation

- [x] Identify high-risk patients (total risk score ≥ 4)
- [x] Identify fever patients (temperature ≥ 99.6°F)
- [x] Identify patients with data quality issues (invalid/missing BP, age, or temp)

### 4. Submission

- [x] Track submission attempts (max 3)
