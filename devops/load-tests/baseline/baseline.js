import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<2000'], // US-S-07: p95 < 2s
  },
};

export default function () {
  const res = http.get('http://localhost:8080/api/v1/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
