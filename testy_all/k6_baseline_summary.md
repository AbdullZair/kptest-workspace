# K6 Baseline Load Test — Summary (US-S-07 / US-S-08)

**Data uruchomienia:** 2026-04-30 09:31–09:36 UTC
**Scenariusz:** `devops/load-tests/baseline/baseline.js`
**Konfiguracja:** VUS = 100, duration = 5m0s (gracefulStop 30s)
**Backend:** http://localhost:8080
**Token:** świeży JWT z `/api/v1/auth/login` (admin@kptest.com)

---

## Wyniki

### HTTP Metrics

| Metryka                | Wartość           |
|------------------------|-------------------|
| **Total requests**     | **11 172**        |
| Request rate           | 36.38 req/s       |
| http_req_duration avg  | 1.71 s            |
| http_req_duration min  | 1.78 ms           |
| http_req_duration med  | 2.05 s            |
| http_req_duration p90  | 3.33 s            |
| **http_req_duration p95** | **3.75 s**     |
| http_req_duration max  | 7.95 s            |
| **http_req_failed**    | **0.00 %** (0 / 11172) |

### Execution

| Metryka                 | Wartość             |
|-------------------------|---------------------|
| iterations (complete)   | 3 724               |
| iteration rate          | 12.13 it/s          |
| iteration_duration avg  | 8.15 s              |
| iteration_duration p95  | 9.48 s              |
| VUs max                 | 100                 |

### Network

| Metryka         | Wartość        |
|-----------------|----------------|
| data_received   | 457 MB (1.5 MB/s) |
| data_sent       | 3.3 MB (11 kB/s)  |

---

## Thresholds

| Threshold                          | Wartość       | Status |
|------------------------------------|---------------|--------|
| `http_req_duration: p(95)<2000`    | p95 = 3.75 s  | **FAIL** |
| `http_req_failed < 1%` (default)   | 0.00 %        | PASS  |

K6 zakończył proces z exit code 99 (signal: thresholds crossed) oraz logiem `level=error msg="thresholds on metrics 'http_req_duration' have been crossed"`.

---

## Werdykt

### US-S-07 (p95 < 2 s) — **FAIL**
Zmierzone p95 = **3.75 s** przekracza próg 2 s o ~87 %. Mediana 2.05 s też jest powyżej progu. Backend pod 100 jednoczesnymi VUS nie spełnia wymagania latencji.

### US-S-08 (>= 100 jednoczesnych użytkowników) — **PASS (z zastrzeżeniem)**
System obsłużył 100 VUS przez pełne 5 minut bez błędów (`http_req_failed = 0.00 %`, 0/11172). Pojemność (throughput) jest zachowana — jednak SLA latencji nie jest dotrzymane (patrz US-S-07). Brak 5xx / odrzuceń, więc wymagania pojemnościowego punktu można uznać za spełnione, lecz UX pod obciążeniem jest poniżej akceptowalnego progu.

### Wniosek całościowy
- **Stabilność:** 0 % błędów / 11 172 req — backend nie wywrócił się.
- **Throughput:** 36 req/s utrzymane stabilnie przez całe 5 min.
- **Latency:** Nie spełnia US-S-07 — wymagana optymalizacja (cache, indeksy DB, profilowanie endpointów krytycznych z baseline.js).
- **Threshold k6:** FAIL (p95 = 3.75 s > 2 s).

---

## Pliki

- `/home/user1/KPTESTPRO/testy_all/k6_baseline_full_report.txt` — pełny output K6 (968 linii)
- `/home/user1/KPTESTPRO/testy_all/k6_baseline_summary.md` — niniejsze podsumowanie
