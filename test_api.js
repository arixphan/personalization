const http = require('http');

const body = JSON.stringify([
  {
    "id": "1",
    "company": "Tech Corp",
    "position": "Senior Software Engineer",
    "startDate": "2022-01",
    "endDate": "",
    "current": true,
    "description": "Lead development of microservices architecture, mentored junior developers, and implemented CI/CD pipelines."
  }
]);

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/user/profile/experience',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', e => console.error(e));
req.write(body);
req.end();
