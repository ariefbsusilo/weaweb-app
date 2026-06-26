const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { spawn } = require('child_process');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      
      // Start the worker process
      console.log('> Starting background worker...');
      const worker = spawn('node', ['dist/worker.js'], {
        stdio: 'inherit',
        env: process.env
      });
      
      worker.on('close', (code) => {
        console.log(`> Worker exited with code ${code}`);
      });
    });
});
