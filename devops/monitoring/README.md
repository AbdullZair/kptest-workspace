# KPTEST Monitoring Stack

Local observability stack for KPTEST: Prometheus + Grafana + Alertmanager.

Implements **US-S-10** (observability minimum: metrics + dashboards + alerts).

## Quick start

```bash
cd devops/monitoring
docker compose -f docker-compose.monitoring.yml up -d

# wait ~10s, then verify
curl http://localhost:9090/-/healthy        # Prometheus
curl http://localhost:3001/api/health       # Grafana
curl http://localhost:9093/-/healthy        # Alertmanager
```

Stop everything:

```bash
docker compose -f docker-compose.monitoring.yml down
```

Wipe state (volumes too):

```bash
docker compose -f docker-compose.monitoring.yml down -v
```

## Access

| Service       | URL                            | Credentials      |
|---------------|--------------------------------|------------------|
| Prometheus    | http://localhost:9090          | none             |
| Grafana       | http://localhost:3001          | `admin` / `admin`|
| Alertmanager  | http://localhost:9093          | none             |

Grafana port is **3001** (not 3000) because the KPTEST web frontend already binds 3000.

## Files in this directory

| File                                    | Purpose                                                  |
|-----------------------------------------|----------------------------------------------------------|
| `docker-compose.monitoring.yml`         | Local stack (Prometheus + Grafana + Alertmanager)        |
| `prometheus.yml`                        | **Production** Prometheus config (Kubernetes SD)         |
| `prometheus-local.yml`                  | Local Prometheus config (static_configs only)            |
| `alert-rules.yml`                       | Alert rules (395 lines, shared dev/prod)                 |
| `recording-rules.yml`                   | Recording rules                                          |
| `alertmanager.yml`                      | **Production** Alertmanager (Slack/PagerDuty/SMTP)       |
| `alertmanager-local.yml`                | Local Alertmanager (no-op webhook)                       |
| `grafana-dashboard.json`                | Dashboard "KPTEST Production"                            |
| `grafana-provisioning/datasources/`     | Auto-provisioned Prometheus datasource                   |
| `grafana-provisioning/dashboards/`      | Auto-provisioned dashboard provider                      |
| `loki-config.yml`                       | Loki (log aggregation) — not in compose yet              |
| `tempo-config.yml`                      | Tempo (tracing) — not in compose yet                     |

## Why two Prometheus configs?

The production `prometheus.yml` uses **Kubernetes service discovery** (`kubernetes_sd_configs`)
which only works inside a K8s cluster. For local dev we need plain `static_configs` against
`localhost:<port>` of services running on the host. `prometheus-local.yml` is that variant
and is mounted by the docker-compose stack.

## What does Prometheus scrape (local mode)?

| Job              | Target                                    | Notes                                |
|------------------|-------------------------------------------|--------------------------------------|
| `prometheus`     | `localhost:9090`                          | self                                 |
| `alertmanager`   | `localhost:9093`                          | self                                 |
| `backend`        | `localhost:8080/actuator/prometheus`      | KPTEST Spring Boot                   |
| `frontend`       | `localhost:3000/metrics`                  | KPTEST web (optional)                |
| `postgres`       | `localhost:9187/metrics`                  | requires `postgres_exporter`         |
| `redis`          | `localhost:9121/metrics`                  | requires `redis_exporter`            |
| `node-exporter`  | `localhost:9100/metrics`                  | requires `node_exporter`             |

Targets that aren't actually running will show `up == 0` in Prometheus — that's expected.
The backend job will only return real metrics when `SPRING_PROFILES_ACTIVE=dev` (or any
profile that exposes the `prometheus` actuator endpoint).

## Grafana dashboards

Auto-provisioned from `grafana-dashboard.json` into folder **KPTEST**:

- **KPTEST Production Dashboard** — UID `kptest-production`. Tags: `kptest, postgresql, production, redis, spring-boot`. Panels for JVM, HTTP request rates/latencies, DB connections, Redis hit rate, deployment markers.

To add more dashboards, drop additional `*.json` files into `grafana-dashboard.json`'s
directory (or extend the volume mount to include a directory) — they'll be picked up
within 30s by the `dashboards.yml` provisioner.

## Networking

The stack uses `network_mode: host` so the containers can scrape the developer's
locally-running backend / frontend / database via `localhost`. On macOS/Windows
Docker, `network_mode: host` does not work — replace `localhost` in `prometheus-local.yml`
with `host.docker.internal` and switch the services to a regular bridge network.

## Smoke test (CI-friendly)

```bash
docker compose -f docker-compose.monitoring.yml up -d
sleep 15
curl -fsS http://localhost:9090/-/healthy
curl -fsS http://localhost:3001/api/health
curl -fsS http://localhost:9093/-/healthy
docker compose -f docker-compose.monitoring.yml down
```

## Production deployment

For Kubernetes, use:
- `prometheus.yml` (Kubernetes SD) — deploy via Prometheus Operator or Helm chart
- `alertmanager.yml` — needs `SLACK_WEBHOOK_URL` and `SMTP_PASSWORD` from a Secret

Local stack here is **for development only**.
