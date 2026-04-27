import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '1m', target: 1000 }, // spike
    { duration: '2m', target: 50 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  http.get('http://localhost:8080/api/v1/health');
  sleep(1);
}
