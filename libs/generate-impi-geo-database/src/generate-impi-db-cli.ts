#!/usr/bin/env node
import { generate } from './generate-impi-db';

const ora = require('ora');
const colors = require('colors/safe');
const winston = require('winston');

import * as fs from 'fs';
import * as path from 'path';

import program = require('commander');

program
    .version('0.2.0')
    .option('-g, --geodb <file>', 'Database filename')
    .option('-q, --dbversion <version>', 'Database Version')
    .option('-f, --from <date>', 'Database Period From [dd.MM.YYYY]')
    .option('-t, --to <date>', 'Database Period To [dd.MM.YYYY]')
    .option('-s, --streetCsv <file>', 'CSV Filename to Street InputFile')
    .option('-c, --communitiesCsv <file>', 'CSV Filename to Communities InputFile')
    .option('-b, --buildingsCsv <file>', 'CSV Filename to Buildings InputFile')
    .option('-a, --additionalCommunitiesCsv <file>', 'CSV Filename to the additional Communities InputFile')
    .option('-C, --config [file]', 'JSON Config File')
    .option('-l, --LogLevel <level>', 'LogLevel', /^(error|warn|info|verbose|debug|silly)$/i, 'info');

program.on('--help', function () {
    console.log('');
    console.log('  CSV Format:');
    console.log('');
    console.log('    Header must match the Definitions specified in the ReadMe File!');
    console.log('    Order of the Columns doesnt matter.');
    console.log('');
});


program.parse(process.argv);

let streetCsv = (program.streetCsv === undefined || program.streetCsv.toString().trim().lenght) ? null : program.streetCsv.toString().trim();
let communitiesCsv = (program.communitiesCsv === undefined || program.communitiesCsv.toString().trim().lenght) ? null : program.communitiesCsv.toString().trim();
let buildingsCsv = (program.buildingsCsv === undefined || program.buildingsCsv.toString().trim().lenght) ? null : program.buildingsCsv.toString().trim();
let additionalCsv = (program.additionalCommunitiesCsv === undefined || program.additionalCommunitiesCsv.toString().trim().lenght) ? null : program.additionalCommunitiesCsv.toString().trim();
let configFile = (program.config === undefined || program.config.toString().trim().lenght) ? null : program.config.toString().trim();

let config = {
    csv: {
        street: streetCsv,
        communities: communitiesCsv,
        buildings: buildingsCsv,
        additional: additionalCsv
    },
    db: {
        version: program.dbversion,
        from: program.from,
        to: program.to
    },
    output: program.geodb
};

if (program.config != null) {
    let configFile = require(path.resolve(process.cwd(),program.config));

    if (configFile.csv) {
        config.csv.street = configFile.csv.street || config.csv.street;
        config.csv.communities = configFile.csv.communities || config.csv.communities;
        config.csv.buildings = configFile.csv.buildings || config.csv.buildings;
        config.csv.additional = configFile.csv.additional || config.csv.additional;
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

console.log(colors.green('Options:'));
console.log(JSON.stringify(config, undefined, 2));

if (fs.existsSync(config.output + '.log')) {
    console.log(colors.red("Deleting existing Log File:" + config.output + '.log'));
    fs.unlinkSync(config.output + '.log');
}

winston.configure({
    transports: [
        new winston.transports.File({ filename: config.output + '.log' })
    ],
    level: program.LogLevel
});

let rows = 0;
let start = Date.now();
const top_start = start;
let rowCountCenterStreets = 0;
let rowCountCenterCommunities = 0;
let rowCountBuildings = 0;
let rowAdditionalCommunities = 0;

const nicetime = (ms: number, use_seconds: boolean = false) => {
    let seconds: string = (ms / (use_seconds ? 1 : 1000)).toFixed((use_seconds ? 0 : 3));
    let minutes: string = (+seconds / 60).toFixed(3);
    let time = (+minutes < 1) ? seconds : minutes;
    return time + (+minutes < 1 ? 's' : 'm');
};

const spinners = [
    { name: 'Generate CenterStreets', spinner: ora('Generate CenterStreets') },
    { name: 'Generate CenterCommunities', spinner: ora('Generate CenterCommunities') },
    { name: 'Generate Buildings', spinner: ora('Generate Buildings') },
    { name: 'Additional PLZs', spinner: ora('Additional PLZs') },
]

let currentSpinnerIndex = 0;

let spinningText = (index: number, rows: number, start: number) => {
    spinners[index].spinner.text = colors.magenta(spinners[currentSpinnerIndex].name) + " | Imported Rows --> " + colors.yellow(rows.toString()) + " | " + "Time --> " + colors.yellow(nicetime((Date.now() - start))) + " | " + colors.yellow(rows > 0 ? (rows / ((Date.now() - start) / 1000)).toFixed().toString() : "0") + " rows/s";
};

let succeedText = (index: number, rows: number, start: number) => {
    spinners[index].spinner.succeed(colors.blue(spinners[currentSpinnerIndex].name) + " | Imported Rows --> " + colors.yellow(rows.toString()) + " | Time --> " + colors.yellow(nicetime((Date.now() - start))));
};

generate(config.output, config.db.version, config.db.from, config.db.to, config.csv.street, config.csv.communities, config.csv.buildings, config.csv.additional, (txt, count) => {
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
    console.log("Overall Time: " + colors.yellow(nicetime((Date.now() - top_start))));
}, (err) => {
    spinners[currentSpinnerIndex].spinner.fail();
    console.log(err);
    winston.error(err);
});