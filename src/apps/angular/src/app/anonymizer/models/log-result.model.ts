/**
 * Processing result interface
 * Matches impilib's ILogResult (serialized over IPC)
 */
export interface ILogResult {
	Meta?: ILogMeta;
	Mapping?: ILogMapping;
	Violations?: ILogViolation[];
	MatchSummary?: ILogMatchingType[];
	Rows?: ILogRow[];
	Error?: {
		message: string;
		stack?: string;
	} | null;
	// Mock fields (used by mock processing service)
	Success?: boolean;
	ProcessedRows?: number;
	Duration?: number;
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

export interface ILogMapping {
	Mappings: Record<string, Record<string, string>>;
	Scales?: Record<string, string>;
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
