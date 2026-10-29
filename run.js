const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🧠 MindMate AI - Starting Services');
console.log('====================================================');

// Spawn Server
const server = spawn('node', ['app.js'], {
  cwd: path.join(__dirname, 'server'),
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe'],
});

server.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[server]\x1b[0m ${data}`);
});

server.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[server:err]\x1b[0m ${data}`);
});

// Spawn Client (Vite)
const client = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe'],
});

client.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[client]\x1b[0m ${data}`);
});

client.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[client:err]\x1b[0m ${data}`);
});

function cleanup() {
  console.log('\nShutting down MindMate AI services...');
  server.kill('SIGTERM');
  client.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
