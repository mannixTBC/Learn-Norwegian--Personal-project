const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const log = fs.openSync(path.join(root, 'frontend-local.log'), 'a');
const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => key.toLowerCase() !== 'path')
);
env.Path = `C:\\Program Files\\nodejs;${process.env.Path || process.env.PATH || ''}`;
env.PORT = '4173';
env.BROWSER = 'none';
env.NODE_OPTIONS = '--openssl-legacy-provider';
const child = spawn(process.execPath, ['--openssl-legacy-provider', path.join(root, 'node_modules', 'react-scripts', 'bin', 'react-scripts.js'), 'start'], {
  cwd: root,
  detached: true,
  stdio: ['ignore', log, log],
  env,
  windowsHide: true,
});

child.unref();
