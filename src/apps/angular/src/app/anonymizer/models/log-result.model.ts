/**
 * Processing result interface
 * Matches impilib's ILogResult (serialized over IPC)
 */
export interface ILogResult {
	Meta?: {
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
	};
	Mapping?: any;
	Violations?: any[];
	MatchSummary?: any[];
	Rows?: any[];
	Error?: {
		message: string;
		stack?: string;
	} | null;
	// Mock fields
	Success?: boolean;
	ProcessedRows?: number;
	Duration?: number;
}
