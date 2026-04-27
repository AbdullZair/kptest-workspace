import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 10 },
    { duration: '5m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  http.get('http://localhost:8080/api/v1/health');
  sleep(1);
}
