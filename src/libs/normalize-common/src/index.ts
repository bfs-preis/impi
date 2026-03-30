export { globalReplace, translate, validateStringInput } from './string-utils.js';
export {
  NormalizationConfig,
  NormalizationRule,
  createReplacementRules,
  applyRules,
  BaseNormalizer
} from './base-normalizer.js';
export {
  SEPARATOR_RULES,
  PREPOSITION_ABBREVIATION_RULES,
  COMMON_PREFIX_REMOVAL,
  QUOTE_REMOVAL_RULES
} from './shared-rules.js';