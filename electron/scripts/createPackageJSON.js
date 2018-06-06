const orginalPackage=require('../package.json');
const fs=require('fs');


let newPackage=JSON.parse(JSON.stringify(orginalPackage));

newPackage.main="index.js";
newPackage.scripts=undefined;
newPackage.build=undefined;
newPackage.devDependencies=undefined;
newPackage.dependencies.impilib="file:../../libs/impilib/";

let json = JSON.stringify(newPackage,null,4);
fs.writeFileSync('./app/package.json', json);
