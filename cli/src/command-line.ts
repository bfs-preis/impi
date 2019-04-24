import * as yargs from 'yargs'
import { Argv } from "yargs";


export interface ICommandLine {
    DBFile: string;
    CSVFile: string;
    OutputDir: string;
    CSVEncoding: string;
    CSVSeparator: string;
    ResultFile: string;
    LogLevel: string;
    SedexSenderId:string;
    KFactorTest:boolean;
    MappingFile:string;
}

function parseCommandLine(): ICommandLine {

    let commandOptions: ICommandLine = {} as ICommandLine;

    let argv = yargs
        .command(["cli","$0"], "Starts Impi in Commandline Mode", (yargs: Argv) => {
            return yargs.option("dbfile", {
                alias: "db",
                describe: "the geo db file from BFS",
                type: "string",
                demandOption: true
            }).option("inputcsvfile", {
                alias: "csv",
                describe: "the input file",
                type: "string",
                demandOption: true
            }).option("outputdir", {
                alias: "out",
                describe: "the output directory (defaults to current directoy)",
                type: "string",
                default: "."
            }).options("csvencoding", {
                alias: "enc",
                describe: "the encoding used in the input csv file ('utf8','ansi','macintosh')",
                type: "string",
                default: "utf8"
            }).option("csvseparator", {
                alias: "sep",
                describe: "the separator char used in the input csv file",
                type: "string",
                default: ";"
            }).option("sedexsenderid", {
                alias: "sed",
                describe: "the sedex sender id used in the envelope",
                type: "string",
                default: ""
            }).option("kfactor", {
                alias: "kf",
                type: "boolean",
                default:"false",
                describe: "executes k factor test"
            }).option("mappingfile", {
                alias: "mf",
                describe: "the mapping file",
                type: "string",
                default: "mapping.json",
            });
        }, (args: yargs.Arguments): void => {
            commandOptions = {
                LogLevel: args.loglevel,             
                DBFile: args.db,
                CSVFile: args.csv,
                OutputDir: args.out,
                CSVEncoding: args.csvencoding,
                CSVSeparator: args.csvseparator,
                SedexSenderId:args.sedexsenderid,       
                KFactorTest:args.kfactor || false,
                MappingFile:args.mappingfile
            } as ICommandLine;
        })
        .option("loglevel", {
            alias: "l",
            default: "error",
            describe: "sets the loglevel for file and console ('error', 'warn', 'info', 'verbose', 'debug', 'silly')"
        })
        .help()
        .version();
  
      argv.parse(process.argv.slice(1));    

    return commandOptions;
}


export const CommandLineCommand: ICommandLine = parseCommandLine();

