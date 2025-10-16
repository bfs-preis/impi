/**
 * Processing result interface
 * Migrated from impilib types
 */
export interface ILogResult {
	Error?: {
		message: string;
		stack?: string;
	};
	Success?: boolean;
	ProcessedRows?: number;
	Duration?: number;
}
