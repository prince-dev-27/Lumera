const http = require('http');
const app = require('./server');
const fs = require('fs');
const path = require('path');

const PORT = 5099;

async function run() {
  const server = http.createServer(app);
  server.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);

    // Create a test file in uploads
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const testFilename = 'test_access.txt';
    fs.writeFileSync(path.join(uploadsDir, testFilename), 'hello image');

    // Fetch via HTTP GET
    http.get(`http://127.0.0.1:${PORT}/uploads/${testFilename}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`GET /uploads/${testFilename} status:`, res.statusCode);
        console.log(`GET /uploads/${testFilename} body:`, data);
        server.close();
      });
    }).on('error', err => {
      console.error('HTTP GET error:', err);
      server.close();
    });
  });
}

run();
