///
/// This script must be started in Project Root!
///

let fs = require('fs');
let p = require('path');

function rimraf(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(
      function (entry) {
        let entry_path = p.join(dir, entry);
        if (fs.lstatSync(entry_path).isDirectory()) {
          rimraf(entry_path);
        }
        else {
          fs.unlinkSync(entry_path);
        }
      }
    );
    fs.rmdirSync(dir);
  }
}
let execSyncOption = { stdio: [0, 1, 2] };

let child_process = require('child_process');
let process = require('process');

console.log("Current Folder:" + process.cwd());

//delete all node_modules and dist folder
console.log("Delete node_modules & dist");
rimraf('./node_modules');
rimraf('./packages/normalize-street/node_modules');
rimraf('./packages/normalize-street/dist');
rimraf('./packages/impilib/node_modules');
rimraf('./packages/impilib/dist');

//build normalize-street
console.log("Build normalize-street");
process.chdir('./packages/normalize-street');
child_process.execSync("yarn",execSyncOption);
child_process.execSync("yarn tsc", execSyncOption);
//build impilib
console.log("Build impilib");
process.chdir('../../packages/impilib');
child_process.execSync("yarn", execSyncOption);
child_process.execSync("yarn tsc", execSyncOption);
process.chdir('../../');

//install main + create project-lock
//reason: yarn doesnt handle prune right --> electron-packager fails
console.log("Main Install");
child_process.execSync("npm install", execSyncOption);
console.log("electron-forge package");
child_process.execSync("npx electron-forge package", execSyncOption);

let rootPath=fs.readdirSync('./out')[0];
rootPath=p.join('./out',rootPath);
console.log(rootPath);
//delete package folder
console.log("Delete package folder");
rimraf(p.join(rootPath,'/resources/app/packages'));

//asar creation
console.log("Create asar");
child_process.execSync("npm install asar", execSyncOption);
let asar = require('asar');

let src = p.join(rootPath,'/resources/app');
let dest = p.join(rootPath,'/resources/app.asar');

asar.createPackage(src, dest, function () {
  console.log("Delete app folder");
  rimraf(p.join(rootPath,'/resources/app'));
  console.log('done.');
});
