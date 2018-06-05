export interface IProcessOption {
    InputCsvFile: string;
    CsvEncoding: string;
    CsvSeparator: string;
    DatabaseFile: String;
    OutputPath: string;
    DbVersion: string;
    DbPeriodFrom: number;
    DbPeriodTo: number;
    CsvRowCount: number;

}

export interface IProcessResult {
    Violations: IViolation[];
    MatchSummary: number[];
    Options: IProcessOption;
    StartTime: number;
    EndTime:number;
    OutputZipFile:string
}

export interface IViolation {
    Id: number;
    Text: string;
    RedFlag: boolean;
    Rows: Array<number>;
}