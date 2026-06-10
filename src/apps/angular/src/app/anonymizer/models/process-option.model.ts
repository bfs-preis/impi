/**
 * Interface for IMPI processing options
 * Migrated from impilib types
 */
export interface IProcessOption {
	DbVersion: string;
	DbPeriodFrom: number;
	DbPeriodTo: number;
	CsvRowCount: number;
	CsvEncoding: string;
	CsvSeparator: string;
	DatabaseFile: string;
	InputCsvFile: string;
	OutputPath: string;
	SedexSenderId: string;
	MappingFile: string;
	ClientVersion: string;
}

/**
 * Processing progress information
 */
export interface ProcessProgress {
	processedRow: number;
	maxRows: number;
	percentage: number;
}
