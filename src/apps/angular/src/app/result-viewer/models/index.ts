/**
 * Re-export shared model types from anonymizer models
 * to maintain a single source of truth.
 */
export type {
    ILogResult,
    ILogMeta,
    ILogMapping,
    ILogViolation,
    ILogRow,
    ILogMatchingType
} from '../../anonymizer/models/log-result.model';
