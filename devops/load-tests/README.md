# K6 Load Tests

Load testing scenarios for KPTESTPRO backend API, aligned with performance requirements US-S-07/08/09.

## Prerequisites

- [K6](https://k6.io/) installed (`brew install k6` or `curl https://k6.io/install | bash`)
- Backend running on `http://localhost:8080`

## How to Run

### Baseline Test (100 RPS, 5 min)

```bash
k6 run baseline/baseline.js
```

**Purpose:** Verify baseline performance under constant load.

**Thresholds:**
- `http_req_duration p(95) < 2000ms` - US-S-07: 95th percentile response time under 2 seconds

### Stress Test (Ramp 10 → 500 RPS, 15 min)

```bash
k6 run stress/stress.js
```

**Purpose:** Test system behavior under increasing load and HPA scaling.

**Thresholds:**
- `http_req_duration p(95) < 2000ms` - US-S-07
- `http_req_failed rate < 0.01` - US-S-08: less than 1% failure rate

### Spike Test (50 RPS → 1000 RPS spike → Recovery)

```bash
k6 run spike/spike.js
```

**Purpose:** Verify system resilience during sudden traffic spikes and recovery.

**Thresholds:**
- `http_req_duration p(95) < 2000ms` - US-S-07
- `http_req_failed rate < 0.01` - US-S-08

## Results Interpretation

### Passing Criteria

| Metric | Threshold | Requirement |
|--------|-----------|-------------|
| p95 Latency | < 2000ms | US-S-07 |
| Failure Rate | < 1% | US-S-08 |
| Recovery Time | < 30s after spike | US-S-09 |

### K6 Output Example

```
     ✓ http_req_duration..............: avg=150ms min=50ms med=120ms max=1800ms p(90)=180ms p(95)=250ms
     ✓ http_req_failed................: 0.00% ✓ 99.99%
     ✓ checks.........................: 100.00% ✓ 5000/5000
```

### Failure Analysis

- **p95 > 2000ms:** Check backend logs for slow queries, consider database indexing or caching
- **Failure rate > 1%:** Investigate connection pool exhaustion, OOM kills, or rate limiting
- **Recovery time > 30s:** Review HPA configuration and container startup time

## CI/CD Integration

```yaml
# Example GitHub Actions step
- name: Run K6 baseline test
  run: k6 run devops/load-tests/baseline/baseline.js
  env:
    K6_OUT_JSON: results/k6-baseline.json
```

## Architecture Context

These tests validate the performance requirements defined in:
- **US-S-07:** Response time SLA (p95 < 2s)
- **US-S-08:** Availability SLA (<1% error rate)
- **US-S-09:** Auto-scaling recovery time
