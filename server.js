const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PUBLIC_DIR = __dirname;
const PORT = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.csv': 'text/csv'
};

function send404(res){
  res.statusCode = 404;
  res.setHeader('Content-Type','text/plain');
  res.end('404 Not Found');
}

const server = http.createServer((req, res) => {
  try{
    const parsed = url.parse(req.url);
    let pathname = decodeURIComponent(parsed.pathname);
    if (pathname === '/') pathname = '/index.html';

    // Prevent path traversal
    const safePath = path.normalize(path.join(PUBLIC_DIR, pathname));
    if (!safePath.startsWith(PUBLIC_DIR)){
      send404(res);
      return;
    }

    fs.stat(safePath, (err, stats) => {
      if (err) return send404(res);
      if (stats.isDirectory()){
        // Serve index.html inside directory
        const index = path.join(safePath, 'index.html');
        return fs.stat(index, (ie, is) => {
          if (ie) return send404(res);
          streamFile(index, res);
        });
      }
      streamFile(safePath, res);
    });
  }catch(e){
    console.error(e);
    send404(res);
  }
});

function streamFile(filePath, res){
  const ext = path.extname(filePath).toLowerCase();
  const mime = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', mime + '; charset=utf-8');
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => send404(res));
  stream.pipe(res);
}

server.listen(PORT, () => {
  console.log(`Servidor estático arrancado en http://localhost:${PORT}/`);
  console.log(`Sirviendo archivos desde: ${PUBLIC_DIR}`);
});
