import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '10s', target: 1000 }, // SPIKE
    { duration: '2m', target: 50 },    // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // US-S-07: p95 < 2s
    http_req_failed: ['rate<0.01'],    // US-S-08: <1% failure rate
  },
};

export default function () {
  const res = http.get('http://localhost:8080/api/v1/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.1);
}
