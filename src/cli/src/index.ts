#!/usr/bin/env node

import { CommandLineCommand } from './command-line.js';
import { CliProcess } from './cli-process.js';

CliProcess(CommandLineCommand).then((exitCode) => {
    process.exit(exitCode);
});
