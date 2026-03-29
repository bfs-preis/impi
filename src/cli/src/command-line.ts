import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export interface ICommandLine {
    DBFile: string;
    CSVFile: string;
    OutputDir: string;
    CSVEncoding: string;
    CSVSeparator: string;
    ResultFile: string;
    LogLevel: string;
    SedexSenderId: string;
    KFactorTest: boolean;
    MappingFile: string;
}

function parseCommandLine(): ICommandLine {
    let commandOptions: ICommandLine = {} as ICommandLine;

    yargs(hideBin(process.argv))
        .command(['cli', '$0'], 'Starts Impi in Commandline Mode', (yargs) => {
            return yargs.option('dbfile', {
                alias: 'db',
                describe: 'the geo db file from BFS',
                type: 'string',
                demandOption: true
            }).option('inputcsvfile', {
                alias: 'csv',
                describe: 'the input file',
                type: 'string',
                demandOption: true
            }).option('outputdir', {
                alias: 'out',
                describe: 'the output directory (defaults to current directory)',
                type: 'string',
                default: '.'
            }).option('csvencoding', {
                alias: 'enc',
                describe: "the encoding used in the input csv file ('utf8','windows1252','iso88591','macintosh')",
                type: 'string',
                default: 'utf8'
            }).option('csvseparator', {
                alias: 'sep',
                describe: 'the separator char used in the input csv file',
                type: 'string',
                default: ';'
            }).option('sedexsenderid', {
                alias: 'sed',
                describe: 'the sedex sender id used in the envelope',
                type: 'string',
                default: ''
            }).option('kfactor', {
                alias: 'kf',
                type: 'boolean',
                default: false,
                describe: 'executes k factor test'
            }).option('mappingfile', {
                alias: 'mf',
                describe: 'the mapping file',
                type: 'string',
                default: 'mapping.json',
            });
        }, (args) => {
            commandOptions = {
                LogLevel: args.loglevel as string,
                DBFile: args.db as string,
                CSVFile: args.csv as string,
                OutputDir: args.out as string,
                CSVEncoding: args.csvencoding as string,
                CSVSeparator: args.csvseparator as string,
                SedexSenderId: args.sedexsenderid as string,
                KFactorTest: (args.kfactor as boolean) || false,
                MappingFile: args.mappingfile as string,
            } as ICommandLine;
        })
        .option('loglevel', {
            alias: 'l',
            default: 'error',
            describe: "sets the loglevel ('error', 'warn', 'info', 'verbose', 'debug', 'silly')"
        })
        .help()
        .version()
        .parseSync();

    return commandOptions;
}

export const CommandLineCommand: ICommandLine = parseCommandLine();
