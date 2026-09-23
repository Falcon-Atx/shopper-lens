'use strict';

// This optional developer demo only serves the synthetic fixture and extension
// assets. It does not proxy Amazon or expose the rest of the repository.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = new Map([
  ['/', ['tests/fixtures/search.html', 'text/html; charset=utf-8']],
  ['/tests/fixtures/search.html', ['tests/fixtures/search.html', 'text/html; charset=utf-8']],
  ['/extension/parser.js', ['extension/parser.js', 'text/javascript; charset=utf-8']],
  ['/extension/unit-summary.js', ['extension/unit-summary.js', 'text/javascript; charset=utf-8']],
  ['/extension/content.js', ['extension/content.js', 'text/javascript; charset=utf-8']],
  ['/extension/content.css', ['extension/content.css', 'text/css; charset=utf-8']],
]);

const server = http.createServer(async (request, response) => {
  const entry = files.get(new URL(request.url, 'http://127.0.0.1').pathname);
  if (!entry || !['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  try {
    const body = await fs.readFile(path.join(root, entry[0]));
    response.writeHead(200, {
      'Content-Type': entry[1],
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Demo asset unavailable. Check that the extension files exist.');
    console.error(error.message);
  }
});
server.listen(8765, '127.0.0.1', () => {
  console.log('Synthetic Shopper Lens demo: http://127.0.0.1:8765');
  console.log('Press Ctrl+C to stop. No external requests are made by this server.');
});
server.on('error', error => {
  console.error(error.message);
  process.exitCode = 1;
});
