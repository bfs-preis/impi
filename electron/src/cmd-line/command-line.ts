import * as yargs from 'yargs'
import { Argv } from "yargs";

export enum CommandEnum {
    Result,
    Main,
    Cli
}

export interface ICommandLine {
    Command: CommandEnum;
    DBFile: string;
    CSVFile: string;
    OutputDir: string;
    Theme: string;
    Language: string;
    CSVEncoding: string;
    CSVSeparator: string;
    ResultFile: string;
    LogLevel: string;
    Debug: boolean;
    Development: boolean;
    SedexSenderId:string;
    AllValidationErrors:boolean;
    KFactorTest:boolean;
    MappingFile:string;
}

function parseCommandLine(): ICommandLine {

    const isNotPackaged = (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));

    let commandOptions: ICommandLine = {} as ICommandLine;

    let argv = yargs
        .command(["result [file]", "r"], "View the Result Report from generated Zip File ", (yargs: Argv) => {
            return yargs.positional("file", {
                describe: "a result zip File ",
                type: 'string',
                default: ""
            });
        }, (args: yargs.Arguments): void => {
            commandOptions = {
                Command: CommandEnum.Result,
                LogLevel: args.loglevel,
                Debug: args.debug || false,
                Development: args.dev || false,
                ResultFile: args.file,
                AllValidationErrors:args.showallValErrors || false
            } as ICommandLine;
        })
        .command(["main", "$0"], "Starts the Impi Gui", (yargs: Argv) => {
            return yargs.option("dbfile", {
                alias: "db",
                describe: "the geo db file from BFS",
                type: "string",
                default: ""
            }).option("inputcsvfile", {
                alias: "csv",
                describe: "the input file",
                type: "string",
                default: ""
            }).option("outputdir", {
                alias: "out",
                describe: "the output directory",
                type: "string",
                default: ""
            }).options("theme", {
                alias: "t",
                describe: "select gui theme ('Light' or 'Dark')",
                type: "string",
                default: ""
            }).option("language", {
                alias: "lang",
                describe: "gui language ('en','de','fr','it')",
                type: "string",
                default: ""
            }).options("csvencoding", {
                alias: "enc",
                describe: "the encoding used in the input csv file ('utf8','windows1252','iso88591','macintosh')",
                type: "string",
                default: ""
            }).option("csvseparator", {
                alias: "sep",
                describe: "the separator char used in the input csv file",
                type: "string",
                default: ""
            }).option("sedexsenderid", {
                alias: "sed",
                describe: "the sedex sender id used in the envelope",
                type: "string",
                default: ""
            }).option("mappingfile", {
                alias: "mf",
                describe: "the mapping File",
                type: "string",
                default:"mapping.json"
            });
        }, (args: yargs.Arguments): void => {
            commandOptions = {
                Command: CommandEnum.Main,
                LogLevel: args.loglevel,
                Debug: args.debug || false,
                Development: args.dev || false,
                DBFile: args.db,
                CSVFile: args.csv,
                OutputDir: args.out,
                Theme: args.theme,
                Language: args.language,
                CSVEncoding: args.csvencoding,
                CSVSeparator: args.csvseparator,
                SedexSenderId:args.sedexsenderid,
                AllValidationErrors:args.showallValErrors || false,
                MappingFile:args.mappingfile
            } as ICommandLine;
        })
        .command(["cli"], "Starts Impi in Commandline Mode", (yargs: Argv) => {
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
                describe: "the encoding used in the input csv file ('utf8','windows1252','iso88591','macintosh')",
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
                describe: "the mapping File",
                type: "string",
                default:"mapping.json"
            });
        }, (args: yargs.Arguments): void => {
            commandOptions = {
                Command: CommandEnum.Cli,
                LogLevel: args.loglevel,
                Debug: args.debug || false,
                Development: args.dev || false,
                DBFile: args.db,
                CSVFile: args.csv,
                OutputDir: args.out,
                CSVEncoding: args.csvencoding,
                CSVSeparator: args.csvseparator,
                SedexSenderId:args.sedexsenderid,
                AllValidationErrors:args.showallValErrors || false,
                KFactorTest:args.kfactor || false,
                MappingFile:args.mappingfile
            } as ICommandLine;
        })
        .option("loglevel", {
            alias: "l",
            default: "error",
            describe: "sets the loglevel for file and console ('error', 'warn', 'info', 'verbose', 'debug', 'silly')"
        })
        .option("debug", {
            type: "boolean",
            hidden: true,
            describe: "shows all windows with devtools"
        })
        .option("development", {
            alias: "dev",
            hidden: true,
            type: "boolean",
            describe: "loads angular apps from local webserver && sets log file to currentPath"
        })
        .option("showallValErrors", {
            alias: "allVErrors",
            hidden: false,
            type: "boolean",
            describe: "show all validation errors in resultviewer",
            default:false,
        })
        .help()
        .version();

    let arg: any;
    if (isNotPackaged) {
        arg = argv.argv;
    } else {
        arg = argv.parse(process.argv.slice(1));
    }

    return commandOptions;
}


export const CommandLineCommand: ICommandLine = parseCommandLine();

