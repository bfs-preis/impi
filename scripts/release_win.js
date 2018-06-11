let child_process = require('child_process');
let process = require('process');
let execSyncOption = { stdio: [0, 1, 2] };

require('./install&build.js');

console.log("Current Folder:" + process.cwd());
process.chdir('./electron');
child_process.execSync("npx electron-builder -w", execSyncOption);
process.chdir('..');