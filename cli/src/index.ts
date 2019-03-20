#!/usr/bin/env node

import { CommandLineCommand } from './command-line';
import { CliProcess } from './cli-process';

CliProcess(CommandLineCommand).then((exitCode) => {
    process.exit(exitCode);
});