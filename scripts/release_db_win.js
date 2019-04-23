let child_process = require('child_process');
let process = require('process');
let execSyncOption = { stdio: [0, 1, 2] };

console.log("Current Folder:" + process.cwd());

child_process.execSync("npx projecto install -p generate-impi-geo-database normalize-city normalize-street", execSyncOption);
process.chdir('./libs/generate-impi-geo-database');
child_process.execSync("npx pkg . --targets node8-win-x86", execSyncOption);
process.chdir('..');
process.chdir('..');
console.log("Current Folder:" + process.cwd());