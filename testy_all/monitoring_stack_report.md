# Monitoring Stack Verification Report (US-S-10)

Data: 2026-04-29
Backend: http://localhost:8080
Profil: dev

## 1. Spring Boot Actuator – status

| Element | Status |
|---|---|
| `spring-boot-starter-actuator` w `backend/build.gradle` | OBECNY (linia 33) |
| `io.micrometer:micrometer-registry-prometheus` w `backend/build.gradle` | DODANY w tym ticket'cie (linia 34) |
| `application.yml` – `management.endpoints.web.exposure.include` | `health,info,metrics,prometheus` (już skonfigurowane, linia 121) |
| `application.yml` – `management.metrics.export.prometheus.enabled` | NIE wymagane jawnie – auto-config Spring Boot 3 włącza endpoint po wykryciu zależności micrometer-registry-prometheus |
| Actuator base path | `/actuator` (domyślny) |

**Wniosek:** Actuator jest skonfigurowany prawidłowo, ale w aktualnie uruchomionej instancji backendu (uruchomionej przed dodaniem zależności) brakuje rejestru Prometheus, dlatego `/actuator/prometheus` zwraca 404. Po następnym `bootJar + restart` przez główny proces endpoint zacznie działać.

## 2. Aktualnie odpytywalne endpointy `/actuator`

`GET /actuator` (auth: Bearer admin) zwraca następujące linki HAL:

```json
{
  "self":              "/actuator",
  "health":            "/actuator/health",
  "health-path":       "/actuator/health/{*path}",
  "info":              "/actuator/info",
  "metrics":           "/actuator/metrics",
  "metrics-required":  "/actuator/metrics/{requiredMetricName}"
}
```

| Endpoint | Auth | Status |
|---|---|---|
| `GET /actuator/health` | anon | 200 → `{"status":"UP"}` (whitelisted w `SecurityConfig` linia 52) |
| `GET /actuator/info` | Bearer | 200 → `{}` |
| `GET /actuator/metrics` | Bearer | 200 → 102 nazwy metryk |
| `GET /actuator/prometheus` | Bearer | **404** (brak micrometer-registry-prometheus w runtime) |
| `GET /actuator` (anon) | – | 403 (poprawnie) |

## 3. Sample 5 metryk z `/actuator/metrics/{name}`

| # | Metric | Value | Unit |
|---|---|---|---|
| 1 | `jvm.memory.used` | 602 611 840 | bytes |
| 2 | `jvm.threads.live` | 81 | threads |
| 3 | `http.server.requests` (COUNT) | 8112 | requests (TOTAL_TIME 2985.9 s, MAX 2.32 s) |
| 4 | `system.cpu.usage` | 0.15 | ratio (15 %) |
| 5 | `hikaricp.connections.active` | 0 | connections (pool: HikariPool-1) |

(metryki uzyskane po przebiegu K6 stress – widać 8 k requestów Tomcat)

Pełna lista 102 metryk dostępna w `/actuator/metrics` zawiera między innymi: jvm.gc.*, jvm.classes.*, hikaricp.*, lettuce.command.*, logback.events, spring.security.*, tasks.scheduled.execution, tomcat.sessions.*.

## 4. Stack monitoringu w repo (`devops/monitoring/`)

| Plik | Zawartość |
|---|---|
| `prometheus.yml` (274 lines) | Pełna konfiguracja produkcyjna: scrape jobów `prometheus`, `alertmanager`, `backend` (`/actuator/prometheus`, scrape co 10 s), `frontend`, `postgres` (port 9187), `redis` (port 9121), `node-exporter`, `cadvisor`, `kube-state-metrics`, `kubernetes-apiservers`, `kubernetes-nodes`, `kubernetes-pods`, `loki`, `tempo`. Service-discovery: kubernetes_sd_configs (role: pod / node / endpoints) – stack jest gotowy pod K8s. |
| `alert-rules.yml` (395 lines) | Reguły alertów (do potwierdzenia w follow-upie). |
| `recording-rules.yml` (102 lines) | Recording rules. |
| `alertmanager.yml` (189 lines) | Routing alertów. |
| `grafana-dashboard.json` (795 lines) | Pojedynczy dashboard JSON. |
| `loki-config.yml` (109 lines) | Centralne logowanie. |
| `tempo-config.yml` (136 lines) | Distributed tracing. |

## 5. Co jeszcze przydałoby się (gaps)

- **Re-deploy backendu** po dodaniu `micrometer-registry-prometheus` – dopiero wtedy `/actuator/prometheus` zacznie zwracać metryki w formacie OpenMetrics (Prometheus job `backend` w `prometheus.yml` już oczekuje tej ścieżki).
- **Whitelist `/actuator/prometheus` w `SecurityConfig`** lub provisioning Bearera dla scrape'a – dziś wszystko poza `/actuator/health` wymaga JWT, a Prometheus serwer typowo używa Bearer-token-file albo basic-auth.
- **Brak `docker-compose.monitoring.yml`** w `devops/` – stack ma configi pod Kubernetesa, ale brakuje compose'a do lokalnego smoke-testu (Prometheus + Grafana + Alertmanager + Loki + Tempo).
- **`management.endpoint.prometheus.access` lub `management.endpoints.access.default`** dla nowszych wersji Spring Boot mogą być potrzebne, jeśli endpoint będzie default-DISABLED.
- **Więcej dashboardów Grafana** (dziś jeden plik) – osobne dashboardy: JVM, HTTP requests, DB, Security/Auth, Business KPI.
- **Custom business metrics** w `MeterRegistry` (np. `kptest.patient.created.total`, `kptest.therapy.completed.total`).
- **Alert rules do walidacji** (czy pokrywają wymogi US-S-10 dostępność: probe na `/actuator/health`, p95 latency > 2 s, error_rate > 1 %).
- **`/actuator/info` jest puste** – warto wzbogacić o git-info (`gradle-git-properties` plugin) i build-info.
