import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const orginalPackage = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

let newPackage = JSON.parse(JSON.stringify(orginalPackage));

newPackage.main = "index.js";
newPackage.scripts = undefined;
newPackage.build = undefined;
newPackage.devDependencies = undefined;
newPackage.dependencies.impilib = "file:../../libs/impilib/";

let json = JSON.stringify(newPackage, null, 4);
writeFileSync('./app/package.json', json);
