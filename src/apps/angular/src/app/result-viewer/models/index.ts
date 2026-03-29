export interface ILogResult {
    Meta: ILogMeta;
    Mapping: any | undefined;
    Violations: ILogViolation[];
    MatchSummary: ILogMatchingType[];
    Rows: ILogRow[];
    Error: { message: string; stack?: string } | null | undefined;
}

export interface ILogMeta {
    CsvEncoding: string;
    CsvSeparator: string;
    CsvRowCount: number;
    DbVersion: string;
    DbPeriodFrom: number;
    DbPeriodTo: number;
    SedexSenderId: string;
    MappingFile: string;
    StartTime: number;
    EndTime: number;
    OutZipFile: string;
    ClientVersion: string;
}

export interface ILogViolation {
    Id: number;
    Text: string;
    RedFlag: boolean;
    Count: number;
    Rows: number[];
}

export interface ILogRow {
    Index: number;
    MatchingType: number;
    Violations: number[];
}

export interface ILogMatchingType {
    Id: number;
    Name: string;
    Count: number;
}
