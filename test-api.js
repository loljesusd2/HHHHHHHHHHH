const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    if (parsedUrl.pathname === '/test-api') {
      // Test the API endpoint
      const fetch = require('node-fetch');
      fetch('http://localhost:3000/api/academy/courses')
        .then(response => response.text())
        .then(data => {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('API Response: ' + data);
        })
        .catch(err => {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error: ' + err.message);
        });
    } else {
      handle(req, res, parsedUrl);
    }
  });

  server.listen(3001, () => {
    console.log('Test server ready on http://localhost:3001');
  });
});
