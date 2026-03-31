#!/usr/bin/env node
import { generate, checkDoubles, checkKFactor } from './generate-impi-db.js';
import ora from 'ora';
import pc from 'picocolors';
import winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
    .version(pkg.version)
    .option('-g, --geodb <file>', 'Database filename')
    .option('-q, --dbversion <version>', 'Database Version')
    .option('-f, --from <date>', 'Database Period From [dd.MM.YYYY]')
    .option('-t, --to <date>', 'Database Period To [dd.MM.YYYY]')
    .option('-s, --streetCsv <file>', 'CSV Filename to Street InputFile')
    .option('-c, --communitiesCsv <file>', 'CSV Filename to Communities InputFile')
    .option('-b, --buildingsCsv <file>', 'CSV Filename to Buildings InputFile')
    .option('-a, --additionalCommunitiesCsv <file>', 'CSV Filename to the additional Communities InputFile')
    .option('-y, --yeargroupsCsv <file>', 'CSV Filename to Year Groups InputFile (optional)')
    .option('-C, --config [file]', 'JSON Config File')
    .option('-l, --LogLevel <level>', 'LogLevel', 'info')
    .option('-e, --encoding <enc>', 'the encoding used in the input csv file', "windows1252");


program.on('--help', function () {
    console.log('');
    console.log('  CSV Format:');
    console.log('');
    console.log('    Header must match the Definitions specified in the ReadMe File!');
    console.log('    Order of the Columns doesnt matter.');
    console.log('');
});


program.parse(process.argv);
const opts = program.opts();

const streetCsv = (opts.streetCsv === undefined || opts.streetCsv.toString().trim().length === 0) ? null : opts.streetCsv.toString().trim();
const communitiesCsv = (opts.communitiesCsv === undefined || opts.communitiesCsv.toString().trim().length === 0) ? null : opts.communitiesCsv.toString().trim();
const buildingsCsv = (opts.buildingsCsv === undefined || opts.buildingsCsv.toString().trim().length === 0) ? null : opts.buildingsCsv.toString().trim();
const additionalCsv = (opts.additionalCommunitiesCsv === undefined || opts.additionalCommunitiesCsv.toString().trim().length === 0) ? null : opts.additionalCommunitiesCsv.toString().trim();
const yeargroupsCsv = (opts.yeargroupsCsv === undefined || opts.yeargroupsCsv.toString().trim().length === 0) ? null : opts.yeargroupsCsv.toString().trim();
const encoding = (opts.encoding === undefined || opts.encoding.toString().trim().length === 0) ? "windows1252" : opts.encoding.toString().trim();

const config: {
    csv: { street: string | null; communities: string | null; buildings: string | null; additional: string | null; yeargroups: string | null; encoding: string };
    db: { version: string; from: string; to: string };
    output: string;
} = {
    csv: {
        street: streetCsv,
        communities: communitiesCsv,
        buildings: buildingsCsv,
        additional: additionalCsv,
        yeargroups: yeargroupsCsv,
        encoding: encoding
    },
    db: {
        version: opts.dbversion,
        from: opts.from,
        to: opts.to
    },
    output: opts.geodb
};

if (opts.config != null) {
    const configFile = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), opts.config), 'utf8'));

    if (configFile.csv) {
        config.csv.street = configFile.csv.street || config.csv.street;
        config.csv.communities = configFile.csv.communities || config.csv.communities;
        config.csv.buildings = configFile.csv.buildings || config.csv.buildings;
        config.csv.additional = configFile.csv.additional || config.csv.additional;
        config.csv.yeargroups = configFile.csv.yeargroups || config.csv.yeargroups;
        config.csv.encoding = configFile.csv.encoding || config.csv.encoding;
    }

    if (configFile.db) {
        config.db.version = configFile.db.version || config.db.version;
        config.db.from = configFile.db.from || config.db.from;
        config.db.to = configFile.db.to || config.db.to;
    }

    config.output = configFile.output || config.output;
}

if (!config.csv.street ||
    !config.csv.communities ||
    !config.csv.buildings ||
    !config.csv.additional ||
    !config.db.version ||
    !config.db.from ||
    !config.db.to ||
    !config.output
) {
    program.outputHelp();
    process.exit(1);
}

console.log(pc.green('Options:'));
console.log(JSON.stringify(config, undefined, 2));

if (fs.existsSync(config.output + '.log')) {
    console.log(pc.red("Deleting existing Log File:" + config.output + '.log'));
    fs.unlinkSync(config.output + '.log');
}

winston.configure({
    transports: [
        new winston.transports.File({ filename: config.output + '.log' })
    ],
    level: opts.LogLevel
});

let rows = 0;
let start = Date.now();
const top_start = start;
let rowCountCenterStreets = 0;
let rowCountCenterCommunities = 0;
let rowCountBuildings = 0;
let rowAdditionalCommunities = 0;

const nicetime = (ms: number, use_seconds: boolean = false) :string => {
    const seconds: string = (ms / (use_seconds ? 1 : 1000)).toFixed((use_seconds ? 0 : 3));
    const minutes: string = (+seconds / 60).toFixed(3);
    const time = (+minutes < 1) ? seconds : minutes;
    return time + (+minutes < 1 ? 's' : 'm');
};

const spinners = [
    { name: 'Generate CenterStreets', spinner: ora('Generate CenterStreets') },
    { name: 'Generate CenterCommunities', spinner: ora('Generate CenterCommunities') },
    { name: 'Generate Buildings', spinner: ora('Generate Buildings') },
    { name: 'Additional PLZs', spinner: ora('Additional PLZs') },
    { name: 'Log Doubles', spinner: ora('Log Doubles') },
    { name: 'Check K-Factor', spinner: ora('Check K-Factor') },
]

let currentSpinnerIndex = 0;

const spinningText = (index: number, rows: number, start: number):void => {
    spinners[index].spinner.text = pc.magenta(spinners[currentSpinnerIndex].name) + " | Imported Rows --> " + pc.yellow(rows.toString()) + " | " + "Time --> " + pc.yellow(nicetime((Date.now() - start))) + " | " + pc.yellow(rows > 0 ? (rows / ((Date.now() - start) / 1000)).toFixed().toString() : "0") + " rows/s";
};

const succeedText = (index: number, rows: number, start: number):void => {
    spinners[index].spinner.succeed(pc.blue(spinners[currentSpinnerIndex].name) + " | Imported Rows --> " + pc.yellow(rows.toString()) + " | Time --> " + pc.yellow(nicetime((Date.now() - start))));
};

generate(config.output, config.db.version, config.db.from, config.db.to, config.csv.street, config.csv.communities, config.csv.buildings, config.csv.additional, config.csv.yeargroups, config.csv.encoding, (txt, count) => {
    rows = count;

    spinningText(currentSpinnerIndex, rows, start);
    if (!spinners[currentSpinnerIndex].spinner.isSpinning) { spinners[currentSpinnerIndex].spinner.start(); }

    if (txt === "CenterStreets") {
        rowCountCenterStreets = count;
    }

    if (txt === "CenterCommunities") {
        if (rowCountCenterCommunities === 0) {
            succeedText(currentSpinnerIndex, rowCountCenterStreets, start);
            currentSpinnerIndex++;
            start = Date.now();
        }
        rowCountCenterCommunities = count;
    }
    if (txt === "Buildings") {
        if (rowCountBuildings === 0) {
            succeedText(currentSpinnerIndex, rowCountCenterCommunities, start);
            currentSpinnerIndex++;
            start = Date.now();
        }
        rowCountBuildings = count;
    }
    if (txt === "AdditionalCommunities") {
        if (rowAdditionalCommunities === 0) {
            succeedText(currentSpinnerIndex, rowCountBuildings, start);
            currentSpinnerIndex++;
            start = Date.now();
        }
        rowAdditionalCommunities = count;
    }

}, () => {
    succeedText(currentSpinnerIndex, rowAdditionalCommunities, start);

    currentSpinnerIndex++;
    const counts = checkDoubles(config.output);
    spinners[currentSpinnerIndex].spinner.succeed(pc.blue(spinners[currentSpinnerIndex].name) + " | Buildings --> " + pc.yellow(counts.Buildings.toString()) + " | CenterStreets --> " + pc.yellow(counts.CenterStreets.toString()) + " | CenterCommunities --> " + pc.yellow(counts.CenterCommunities.toString()));
    currentSpinnerIndex++;
    if (checkKFactor(config.output)) {
        spinners[currentSpinnerIndex].spinner.succeed(pc.blue(spinners[currentSpinnerIndex].name));
        winston.info('K-Factor Test succeed!');
    }
    else {
        spinners[currentSpinnerIndex].spinner.fail();
        winston.warn('K-Factor Test failed!');
    }

    console.log("Overall Time: " + pc.yellow(nicetime((Date.now() - top_start))));
}, (err) => {
    spinners[currentSpinnerIndex].spinner.fail();
    console.log(err);
    winston.error(err);
});
