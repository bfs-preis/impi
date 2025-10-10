import { globalReplace, translate, validateStringInput } from './string-utils.js';

export interface NormalizationRule {
  type: 'replace' | 'translate' | 'truncateAt' | 'removePrefix';
  search: string;
  replacement?: string;
  fromChars?: string;
  toChars?: string;
}

export interface NormalizationConfig {
  toLowercase?: boolean;
  removeAccents?: boolean;
  replaceUmlauts?: boolean;
  removePunctuation?: boolean;
  punctuationChars?: string;
  punctuationReplacement?: string;
  rules?: NormalizationRule[];
  prefixesToRemove?: string[];
  removeSpaces?: boolean;
  trim?: boolean;
}

/**
 * Creates replacement rules from search/replace pairs.
 */
export function createReplacementRules(replacements: Array<[string, string]>): NormalizationRule[] {
  return replacements.map(([search, replacement]) => ({
    type: 'replace' as const,
    search,
    replacement
  }));
}

/**
 * Applies a set of normalization rules to a string.
 */
export function applyRules(str: string, rules: NormalizationRule[]): string {
  return rules.reduce((current, rule) => {
    switch (rule.type) {
      case 'replace':
        return globalReplace(current, rule.search, rule.replacement || '');
      case 'translate':
        if (rule.fromChars && rule.toChars) {
          return translate(current, rule.fromChars, rule.toChars);
        }
        return current;
      case 'truncateAt':
        const index = current.indexOf(rule.search);
        return index > 0 ? current.substring(0, index) : current;
      case 'removePrefix':
        return current.startsWith(rule.search) ? current.substring(rule.search.length) : current;
      default:
        return current;
    }
  }, str);
}

/**
 * Base normalizer class that provides common normalization functionality.
 */
export class BaseNormalizer {
  constructor(private config: NormalizationConfig = {}) { }

  /**
   * Normalizes a string according to the configuration.
   */
  normalize(input: string, fieldName = 'input'): string {
    validateStringInput(input, fieldName);

    let result = input;

    // Apply basic transformations
    if (this.config.toLowercase !== false) {
      result = result.toLowerCase();
    }

    if (this.config.removeAccents !== false) {
      result = translate(result, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');
    }

    if (this.config.replaceUmlauts !== false) {
      result = globalReplace(result, 'ä', 'ae');
      result = globalReplace(result, 'ö', 'oe');
      result = globalReplace(result, 'ü', 'ue');
    }

    if (this.config.removePunctuation !== false) {
      const punctuation = this.config.punctuationChars || '.,;:-';
      const replacement = this.config.punctuationReplacement || '     ';
      result = translate(result, punctuation, replacement);
    }

    // Apply custom rules
    if (this.config.rules) {
      result = applyRules(result, this.config.rules);
    }

    // Remove prefixes
    if (this.config.prefixesToRemove) {
      for (const prefix of this.config.prefixesToRemove) {
        if (result.startsWith(prefix)) {
          result = result.substring(prefix.length);
          break; // Only remove the first matching prefix
        }
      }
    }

    // Final cleanup
    if (this.config.trim !== false) {
      result = result.trim();
    }

    if (this.config.removeSpaces !== false) {
      result = globalReplace(result, ' ', '');
    }

    return result;
  }
}