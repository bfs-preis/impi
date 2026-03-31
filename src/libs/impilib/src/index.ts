import { processFile, IProcessOption, CheckInputFileFormat } from './core/process.js';
import { ValidationRules, IValidationRule } from './validation/ValidationRules.js';
import { GeoDatabase, IDbInfo, IYearGroup, YearCategories } from './match/GeoDatabase.js';
import { MatchingTypeEnum, MatchResult } from './match/match.js';
import { readResultZipFile, createEmptyLogMatchingTypeArray } from './core/log-file-xml.js';
import { ILogResult, ILogMeta, ILogViolation, ILogRow, ILogMatchingType, IMapping } from './core/log-result.js';
export {
    processFile,
    IProcessOption,
    ILogResult,
    ILogMeta,
    ILogViolation,
    ILogRow,
    ILogMatchingType,
    IMapping,
    ValidationRules,
    IValidationRule,
    IDbInfo,
    IYearGroup,
    YearCategories,
    GeoDatabase,
    MatchingTypeEnum,
    MatchResult,
    readResultZipFile,
    createEmptyLogMatchingTypeArray,
    CheckInputFileFormat
}