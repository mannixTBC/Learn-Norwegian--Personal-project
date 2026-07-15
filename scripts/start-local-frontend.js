const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const log = fs.openSync(path.join(root, 'frontend-local.log'), 'a');
const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => key.toLowerCase() !== 'path')
);
env.Path = `C:\\Program Files\\nodejs;${process.env.Path || process.env.PATH || ''}`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(npmCommand, ['run', 'dev:frontend'], {
  cwd: root,
  detached: true,
  stdio: ['ignore', log, log],
  env,
  windowsHide: true,
});

child.unref();
