const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const server = http.createServer((req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/original.frag' || pathname === '/natural.frag') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(fs.readFileSync(path.join(__dirname, pathname.slice(1))));
    } else if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error.message);
  }
});
server.listen(Number(process.env.RIPPLE_PORT || 4178), '127.0.0.1', () => {
  console.log(`Ripple playground: http://127.0.0.1:${server.address().port}`);
});
