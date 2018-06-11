let child_process = require('child_process');
let process = require('process');
let execSyncOption = { stdio: [0, 1, 2] };

console.log("Current Folder:" + process.cwd());
child_process.execSync("yarn install", execSyncOption);
child_process.execSync("./node_modules/.bin/projecto install", execSyncOption);

process.chdir('./electron/app');
child_process.execSync("yarn install --production", execSyncOption);
process.chdir('../..');
